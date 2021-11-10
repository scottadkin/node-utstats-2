import CTF from '../../api/ctf';
import Players from '../../api/players';

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


export default (req, res) =>{

    return new Promise(async (resolve, reject) =>{

        const ctfManager = new CTF();
        const playerManager = new Players();

        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";

        console.log(`mode = ${mode}`);

        if(mode === "fastestcaps"){

            const mapId = (req.body.mapId !== undefined) ? parseInt(req.body.mapId) : -1;

            if(mapId === mapId){

                if(mapId > 0){

                    const data = await ctfManager.getMapCaps(mapId, 0, 5);
                    const playerIds = getUniquePlayers(data);
                    const playerNames = await playerManager.getNamesByIds(playerIds, true);

                    const records = await ctfManager.getFastestMapCaps(mapId, playerManager);

                    res.status(200).json({"data": data, "players": playerNames, "records": records});
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