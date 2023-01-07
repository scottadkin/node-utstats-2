import CTF from '../../api/ctf';
import Players from '../../api/players';
import Matches from '../../api/matches';
import Functions from '../../api/functions';
import Maps from '../../api/maps';

function getUniquePlayers(data){

    const playerIds = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(playerIds.indexOf(d.cap) === -1){
            playerIds.push(d.cap);
        }

        if(d.grab !== undefined){

            if(playerIds.indexOf(d.grab) === -1){
                playerIds.push(d.grab);
            }
        }

        if(d.assists !== undefined){

            if(d.assists.length > 0){

                const assists = d.assists;

                for(let i = 0; i < assists.length; i++){

                    if(playerIds.indexOf(assists[i]) === -1){
                        playerIds.push(assists[i]);
                    }   
                }
            }
        }
    }

    return playerIds;
}

function getUniquePlayersAlt(data){

    const playerIds = [];

    for(const value of Object.values(data)){

        const solo = value.solo;
        const assisted = value.assisted;

        if(solo !== null){

            if(playerIds.indexOf(solo.cap) === -1){
                playerIds.push(solo.cap);
            }
        }

        if(assisted !== null){

            if(playerIds.indexOf(assisted.cap) === -1){
                playerIds.push(assisted.cap);
            }

            const assists = assisted.assists;

            for(let i = 0; i < assists.length; i++){

                if(playerIds.indexOf(assists[i]) === -1){
                    playerIds.push(assists[i]);
                }
            }
        }
    }

    return playerIds;
}

function getUniqueMatchIds(data, bMapRecords){

    const matchIds = [];

    if(!bMapRecords){

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(matchIds.indexOf(d.match_id) === -1){
                matchIds.push(d.match_id);
            }
        }

    }else{

        for(const value of Object.values(data)){

            const solo = value.solo;
            const assisted = value.assisted;

            if(solo !== null){

                if(matchIds.indexOf(solo.match_id) === -1){
                    matchIds.push(solo.match_id);
                }
            }

            if(assisted !== null){

                if(matchIds.indexOf(assisted.match_id) === -1){
                    matchIds.push(assisted.match_id);
                }
            }
        }
    }

    return matchIds;
}


function setCapDetails(caps, players, dates, records){


    for(let i = 0; i < caps.length; i++){

        const c = caps[i];

        c.matchDate = dates[c.match_id] ?? 0;
        c.capPlayer = players[c.cap] ?? {"name": "Not Found", "country": "xx"};

        let offset = 0;

        if(c.assists.length === 0){
            offset = records.solo.travel_time - c.travel_time;
        }else{
            offset = records.assist.travel_time - c.travel_time;
        }

        c.offset = Math.abs(offset);

        const assists = c.assists;

        c.assistPlayers = [];

        if(assists.length > 0){

            for(let x = 0; x < assists.length; x++){

                const assist = assists[x];
                c.assistPlayers.push(players[assist] ?? {"name": "Not Found", "country": "xx"});       
            }
        }        
    }
}

function getPlayerIds(data){

    const playerIds = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        playerIds.push(d.player);
    }

    return playerIds;
}

function setPlayerRecordNames(data, players){

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        d.player = Functions.getPlayer(players, d.player);
    }
}

async function getUniqueMapIds(data, mapManager){

    const maps = [];

    for(let i = 0; i < data.soloCaps.length; i++){

        const m = data.soloCaps[i].map_id;

        if(maps.indexOf(m) === -1){
            maps.push(m);
        }
    }

    for(let i = 0; i < data.assistedCaps.length; i++){

        const m = data.assistedCaps[i].map_id;

        if(maps.indexOf(m) === -1){
            maps.push(m);
        }
    }

    return await mapManager.getNamesByIds(maps, true);

}

function setMapName(data, mapNames){

    if(mapNames[data.map_id] !== undefined){
        data.mapName = mapNames[data.map_id];
    }else{
        data.mapName = "Not Found";
    }

}

export default async function handler(req, res){

    return new Promise(async (resolve, reject) =>{

        try{

            

            const ctfManager = new CTF();
            const playerManager = new Players();
            const matchManager = new Matches();

            const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";

            const mapId = (req.body.mapId !== undefined) ? parseInt(req.body.mapId) : -1;
            let perPage = (req.body.perPage !== undefined) ? parseInt(req.body.perPage) : 5;
            let page = (req.body.page !== undefined) ? parseInt(req.body.page) : 0;
            const type = (req.body.type !== undefined) ? req.body.type : "";
            const playerId = (req.body.playerId !== undefined) ? parseInt(req.body.playerId) : -1;

            const setDetails = req.body.setDetails ?? false;
            const matchId = (req.body.matchId !== undefined) ? parseInt(req.body.matchId) : -1;

            if(mode === "b-match-ctf"){

                const bCTF = await ctfManager.bMatchCTF(matchId);

                res.status(200).json({"bCTF": bCTF});
                resolve();
                return;
                
            }else if(mode === "fastestcaps"){


                if(page !== page) page = 0;
                if(perPage !== perPage) perPage = 5;

                if(mapId === mapId){

                    if(mapId > 0){

                        const data = await ctfManager.getMapCaps(mapId, page, perPage, type);

                        const playerIds = getUniquePlayers(data);
                        const playerNames = await playerManager.getNamesByIds(playerIds, true);
                        const matchIds = getUniqueMatchIds(data, false);
                        const matchDates = await matchManager.getDates(matchIds);
                        const totalCaps = await ctfManager.getMapTotalCaps(mapId, type);
                        const records = await ctfManager.getFastestMapCaps(mapId, playerManager);
        
                        if(setDetails){

                            setCapDetails(data, playerNames, matchDates, records);
                        }


                        res.status(200).json({
                            "data": data, 
                            "players": playerNames, 
                            "records": records, 
                            "matchDates": matchDates,
                            "totalCaps": totalCaps
                        });
                        resolve();
                        return;

                    }else{

                        res.status(200).json({"error": "MapId must be a positive integer"});
                        resolve();
                        return;
                    }
                }

            }else if(mode === "maprecords"){

                const mapIds = req.body.mapIds ?? "*";

                const data = await ctfManager.getMapsCapRecords(mapIds);

                const playerIds = getUniquePlayersAlt(data);

                const playerNames = await playerManager.getNamesByIds(playerIds, true);

                const mapManager = new Maps();
            
                const mapNames = await mapManager.getNames(Object.keys(data));

                for(const [mapId, mapData] of Object.entries(data)){
                    mapData.name = mapNames[mapId] ?? "Not Found";
                }

                res.status(200).json({"data": data, "playerNames": playerNames, "mapNames": mapNames});
                resolve();
                return;

            }else if(mode === "totalcaps"){

                if(mapId === -1){
                    res.status(200).json({"error": "MapId Must be a positive integer"});
                    resolve();
                    return;
                }

                const totalSoloCaps = await ctfManager.getMapTotalCaps(mapId, "solo");
                const totalAssistedCaps = await ctfManager.getMapTotalCaps(mapId, "assists");

                res.status(200).json({
                    "data": {
                        "solo": totalSoloCaps,
                        "assisted": totalAssistedCaps,
                        "total": totalSoloCaps + totalAssistedCaps
                    }
                });
                resolve();
                return;

            }else if(mode === "caprecordsplayers"){

                const minSolo = (req.body.minSoloCaps !== undefined) ? parseInt(req.body.minSoloCaps) : 1;
                const minAssisted = (req.body.minAssistCaps !== undefined) ? parseInt(req.body.minAssistCaps) : 1;
                const maxSoloCaps = (req.body.maxSoloCaps !== undefined) ? parseInt(req.body.maxSoloCaps) : 50;
                const maxAssistCaps = (req.body.maxAssistCaps !== undefined) ? parseInt(req.body.maxAssistCaps) : 50;

                const soloCapRecords = await ctfManager.getPlayerTotalSoloCapRecords(minSolo, maxSoloCaps);
                const assistCapRecords = await ctfManager.getPlayerTotalAssistCapRecords(minAssisted, maxAssistCaps);

                let playerIds = [...getPlayerIds(soloCapRecords), ...getPlayerIds(assistCapRecords)];

                playerIds = playerIds.filter((element, index, array) =>{
                    return array.indexOf(element) === index
                })

                const playerNames = await playerManager.getNamesByIds(playerIds);

                setPlayerRecordNames(soloCapRecords, playerNames);
                setPlayerRecordNames(assistCapRecords, playerNames);

                res.status(200).json({"soloCaps": soloCapRecords, "assistCaps": assistCapRecords});

                resolve();
                return;

            }else if(mode === "singleplayercaprecords"){

                const mapManager = new Maps();
                const data = await ctfManager.getPlayerCapRecords(playerId);

                const mapNames = await getUniqueMapIds(data, mapManager);

                for(let i = 0; i < data.soloCaps.length; i++){

                    const d = data.soloCaps[i];
                    setMapName(d, mapNames);
                }

                for(let i = 0; i < data.assistedCaps.length; i++){

                    const d = data.assistedCaps[i];
                    setMapName(d, mapNames);

                }

                res.status(200).json({"data": data});
                resolve();
                return;
            
            }else if(mode === "carrytime"){


                const data = await ctfManager.getCarryTimes(matchId);

                res.status(200).json({"data": data});
                resolve();
                return;

            }else if(mode === "match-caps"){

                const caps = await ctfManager.getMatchCaps(matchId);
                const assists = await ctfManager.getMatchAssists(matchId);
                const covers = await ctfManager.getMatchCovers(matchId, true);
                const selfCovers = await ctfManager.getMatchSelfCovers(matchId, true);


                res.status(200).json({
                    "caps": caps, 
                    "assists": assists,
                    "covers": covers,
                    "selfCovers": selfCovers
                })
                resolve();
                return;
            }


            res.status(200).json({"error": "Unknown Command"});

            resolve();

        }catch(err){
            res.status(200).json({"error": err.toString()});
            resolve();
        }

    });
}