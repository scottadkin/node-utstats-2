import CTF from '../../api/ctf';
import Players from '../../api/players';
import Matches from '../../api/matches';

function getUniquePlayers(data){

    const playerIds = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(playerIds.indexOf(d.cap) === -1){
            playerIds.push(d.cap);
        }

        if(d.assists !== ""){

            const assists = d.assists.split(",");

            for(let i = 0; i < assists.length; i++){

                const assist = parseInt(assists[i]);

                if(assist === assist){

                    if(playerIds.indexOf(assist) === -1){
                        playerIds.push(assist);
                    }
                }
            }
        }
    }

    return playerIds;
}

function getUniquePlayersAlt(data){

    const playerIds = [];

    for(const [key, value] of Object.entries(data)){

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

            const assists = assisted.assists.split(",");

            for(let i = 0; i < assists.length; i++){

                const assist = parseInt(assists[i]);

                if(playerIds.indexOf(assist) === -1){
                    playerIds.push(assist);
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

        for(const [key, value] of Object.entries(data)){

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


        if(c.assists === ""){
            offset = records.solo.travel_time - c.travel_time;
        }else{
            offset = records.assist.travel_time - c.travel_time;
        }

        c.offset = Math.abs(offset);

        const assists = c.assists.split(",");
        c.assistPlayers = [];

        if(assists.length > 0){

            for(let x = 0; x < assists.length; x++){

                const assist = parseInt(assists[x]);

                if(assist === assist){

                    c.assistPlayers.push(players[assist] ?? {"name": "Not Found", "country": "xx"});
                }
            }
        }        
    }
}

export default (req, res) =>{

    return new Promise(async (resolve, reject) =>{

      
        const ctfManager = new CTF();
        const playerManager = new Players();
        const matchManager = new Matches();

        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";

        const mapId = (req.body.mapId !== undefined) ? parseInt(req.body.mapId) : -1;
        let perPage = (req.body.perPage !== undefined) ? parseInt(req.body.perPage) : 5;
        let page = (req.body.page !== undefined) ? parseInt(req.body.page) : 0;
        const type = (req.body.type !== undefined) ? req.body.type : "";

        const setDetails = req.body.setDetails ?? false;

        if(mode === "fastestcaps"){


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

            const mapIds = req.body.mapIds ?? [];

            const data = await ctfManager.getMapsCapRecords(mapIds);

            const matchIds = getUniqueMatchIds(data, true);
            const matchDates = await matchManager.getDates(matchIds);

            const playerIds = getUniquePlayersAlt(data);
            const playerNames = await playerManager.getNamesByIds(playerIds, true);

            res.status(200).json({"data": data, "matchDates": matchDates, "playerNames": playerNames});
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

        }


        res.status(200).json({"error": "Unknown Command"});

        resolve();

    });
}