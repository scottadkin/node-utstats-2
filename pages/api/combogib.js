import Combogib from "../../api/combogib";
import Players from "../../api/players";
import Functions from "../../api/functions";

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

        const requiresPlayerManager = ["maprecord", "maptotal"];

        let playerManager = null;

        if(requiresPlayerManager.indexOf(mode) !== -1){

            playerManager = new Players();
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

        }

    }catch(err){

        console.trace(err);
        res.status(200).json({"error": err.message});
        return;
    }

    res.status(200).json({"error": "Unknown mode."});
    return;

}

