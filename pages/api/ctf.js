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

function getUniqueMatchIds(data){

    const matchIds = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(matchIds.indexOf(d.match_id) === -1){
            matchIds.push(d.match_id);
        }
    }

    return matchIds;
}


export default (req, res) =>{

    return new Promise(async (resolve, reject) =>{

      
        const ctfManager = new CTF();
        const playerManager = new Players();
        const matchManager = new Matches();

        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";

        if(mode === "fastestcaps"){

            const mapId = (req.body.mapId !== undefined) ? parseInt(req.body.mapId) : -1;
            const perPage = (req.body.perPage !== undefined) ? parseInt(req.body.perPage) : 5;
            const page = (req.body.page !== undefined) ? parseInt(req.body.page) : 0;
            const type = (req.body.type !== undefined) ? req.body.type : "";

            if(page !== page) page = 0;
            if(perPage !== perPage) perPage = 5;

            if(mapId === mapId){

                if(mapId > 0){

                    const data = await ctfManager.getMapCaps(mapId, page, perPage, type);
                    const playerIds = getUniquePlayers(data);
                    const playerNames = await playerManager.getNamesByIds(playerIds, true);

                    const matchIds = getUniqueMatchIds(data);
                    const matchDates = await matchManager.getDates(matchIds);

                    const totalCaps = await ctfManager.getMapTotalCaps(mapId, type);

                    const records = await ctfManager.getFastestMapCaps(mapId, playerManager);

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

        }


        res.status(200).json({"error": "Unknown Command"});

        resolve();

    });
}