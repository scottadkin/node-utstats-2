import Combogib from "../../api/combogib";
import Players from "../../api/players";
import Functions from "../../api/functions";
import Matches from "../../api/matches";
import Maps from "../../api/maps";

export default async function handler(req, res){

    try{

        let mode = req.body.mode ?? null;

        if(mode === null){
            res.status(200).json({"error": "No mode specified"});
            return;
        }

        mode = mode.toLowerCase();
        const matchId = req.body.matchId ?? -1;

        const combo = new Combogib();

        const requiresPlayerManager = ["maprecord", "maptotal", "matchrecords", "totalrecords"];
        const requiresMatchesManager = ["matchrecords"];
        const requiresMapsManager = ["matchrecords"];

        let playerManager = null;

        if(requiresPlayerManager.indexOf(mode) !== -1){
            playerManager = new Players();
        }

        let matchManager = null;

        if(requiresMatchesManager.indexOf(mode) !== -1){
            matchManager = new Matches();
        }

        let mapManager = null;

        if(requiresMapsManager.indexOf(mode) !== -1){
            mapManager = new Maps();
        }

        if(mode === "match"){

            const data = await combo.getMatchData(matchId);

            res.status(200).json({"data": data});

            return;

        }else if(mode === "pmatch"){

            const matchId = req.body.matchId ?? -1;
            const playerId = req.body.playerId ?? -1;

            if(matchId === -1|| playerId === -1){
                res.status(200).json({"error": "PlayerId and or matchId were not specified"});
                return;
            }

            const data = await combo.getPlayerMatchData(playerId, matchId);

            res.status(200).json({"data": data});
            return;

        }else if(mode === "maprecord"){

            const mapId = req.body.mapId ?? -1;
            const page = req.body.page ?? 0;
            const perPage = req.body.perPage ?? 5;
            const dataType = req.body.dataType ?? "combo_kills";

            const bAnyMapData = await combo.bMapHaveTotalsData(mapId);

            if(bAnyMapData){

                const data = await combo.getMapRecords(mapId, dataType, page, perPage);
                const totalResults = await combo.getTotalMapRecords(mapId, dataType);

                const playerIds = Functions.getUniqueValues(data, "player_id");
                const players = await playerManager.getNamesByIds(playerIds, true);

                res.status(200).json({"data": data, "totalResults": totalResults, "players": players});
                return;
            }else{

                res.status(200).json({"error": "none"});
                return;
            }

        }else if(mode === "maptotal"){

            const mapId = req.body.mapId ?? -1;

            const data = await combo.getMapTotals(mapId);


            if(data !== null){

                const playerIds = new Set();

                playerIds.add(data.best_single_combo_player_id);
                playerIds.add(data.best_single_insane_player_id);
                playerIds.add(data.best_single_shockball_player_id);

                playerIds.add(data.best_primary_kills_player_id);
                playerIds.add(data.best_ball_kills_player_id);
                playerIds.add(data.best_combo_kills_player_id);
                playerIds.add(data.best_insane_kills_player_id);

                playerIds.add(data.max_combo_kills_player_id);
                playerIds.add(data.max_insane_kills_player_id);
                playerIds.add(data.max_ball_kills_player_id);
                playerIds.add(data.max_primary_kills_player_id);

                const players = await playerManager.getNamesByIds([...playerIds], true);

                res.status(200).json({"data": data, "players": players});
                return;
            }

            res.status(200).json({"error": "none"});
            return;

        }else if(mode === "ptotal"){

            const playerId = req.body.playerId ?? -1;

            const data = await combo.getPlayerTotals(playerId);
            
            res.status(200).json({"data": data});
            return;

        }else if(mode === "validtypes"){

            res.status(200).json(combo.getValidRecordTypes());
            return;

        }else if(mode === "matchrecords"){

            const type = req.body.type ?? "combo_kills";
            let page = parseInt(req.body.page) ?? 0;
            let perPage = req.body.perPage ?? 25;

            if(page < 0) page = 0;

            const result = await combo.getPlayerBestMatchValues(type, page, perPage);

            const matchIds = Functions.getUniqueValues(result, "match_id");
            const matchDates = await matchManager.getDates(matchIds);

            const mapIds = Functions.getUniqueValues(result, "map_id");
            const mapNames = await mapManager.getNames(mapIds);

            const playerIds = Functions.getUniqueValues(result, "player_id");
            const players = await playerManager.getNamesByIds(playerIds, true);

            for(let i = 0; i < result.length; i++){

                const player = Functions.getPlayer(players, result[i].player_id, true);
                result[i].player = player;
                delete result[i].player_id;

                result[i].date = matchDates[result[i].match_id] ?? "0";
                result[i].map = mapNames[result[i].map_id] ?? "Not Found";
            }

            res.status(200).json({"data": result});
            return;

        }else if(mode === "totalmatchrecords"){


            const totalResults = await combo.getTotalMatchRows();

            res.status(200).json({"results": totalResults});
            return;

        }else if(mode === "totalplayerrecords"){

            const totalResults = await combo.getTotalPlayerRows();

            res.status(200).json({"results": totalResults});
            return;

        }else if(mode === "totalrecords"){

            const type = req.body.type ?? "combo_kills";
            const page = req.body.page ?? 0;
            const perPage = req.body.perPage ?? 25;

            const data = await combo.getPlayerRecords(type, page, perPage);

            const playerIds = Functions.getUniqueValues(data, "player_id");
            const playerNames = await playerManager.getNamesByIds(playerIds, true);


            for(let i = 0; i < data.length; i++){

                const d = data[i];
                d.player = Functions.getPlayer(playerNames, d.player_id, true);
            }

            res.status(200).json({"data": data});
            return;
        }

    }catch(err){

        console.trace(err);
        res.status(200).json({"error": err.message});
        return;
    }

    res.status(200).json({"error": "Unknown mode."});
    return;

}

