import Players from "../../api/players";
import Maps from "../../api/maps";
import Records from "../../api/records";
import Gametypes from "../../api/gametypes";
import CTF from "../../api/ctf";
import Matches from "../../api/matches";
import {getPlayer} from "../../api/generic.mjs";


export default async function handler(req, res){

    try{

        const query = req.query;

        if(query.mode === undefined){
            res.status(200).json({"error": "No query mode specified."});
            return;
        }

        const recordsManager = new Records();

        const mode = query.mode;
        const cat = query.cat ?? "";

        let page = (query.page !== undefined) ? parseInt(query.page) : 1; 
        if(page !== page) page = 1;

        const perPage = (query.perPage !== undefined) ? parseInt(query.perPage) : 25;

        let gametype = (query.gametype !== undefined) ? parseInt(query.gametype) : 0;
        if(gametype !== gametype) gametype = 0;

        let map = (query.map !== undefined) ? parseInt(query.map) : 0;
        if(map !== map) map = 0;

        let playerId = (query.playerId !== undefined) ? parseInt(query.playerId) : 0;
        if(playerId !== playerId) playerId = 0;

        if(mode === "0"){

            const {totalResults, data} = await recordsManager.getPlayerTotalRecords(cat, gametype, map, page, perPage);
            res.status(200).json({"data": data, "totalResults": totalResults});
            return;
        }

        if(mode === "1"){

            const {data, totalResults} = await recordsManager.getPlayerMatchRecords(gametype, map, cat, page, perPage);

            const mapsManager = new Maps();
            const mapNames = await mapsManager.getNamesByIds(data.mapIds, true);     

            const gametypesManager = new Gametypes();
            const gametypeNames = await gametypesManager.getNames(data.gametypeIds);

            data.data.map((d) =>{
                d.mapName = (mapNames[d.map_id] !== undefined) ? mapNames[d.map_id] : "Not Found";
                d.gametypeName = (gametypeNames[d.gametype] !== undefined) ? gametypeNames[d.gametype] : "Not Found";
            });

            res.status(200).json({"data": data.data, "totalResults": totalResults});
            return;
        }

        if(mode === "2"){

            
            const ctfManager = new CTF();
            const matchManager = new Matches();
            const playerManager = new Players();

            const data = await ctfManager.getAllMapRecords(gametype);
            const matchDates =  await matchManager.getDates(data.matchIds) ?? {};

            const grabCapPlayers = await ctfManager.getGrabAndCapPlayers(data.capIds);

            const uniquePlayers = new Set();

            for(const info of Object.values(grabCapPlayers)){

                uniquePlayers.add(info.grab);
                uniquePlayers.add(info.cap);
            }

            const assistPlayers = await ctfManager.getAssistedPlayers(data.capIds);

            for(let i = 0; i < assistPlayers.uniquePlayers.length; i++){

                const player = assistPlayers.uniquePlayers[i];
                uniquePlayers.add(player);
            }


            const names = await playerManager.getBasicInfo([...uniquePlayers]);

            const types = ["soloCaps", "assistCaps"];

            for(let t = 0; t < types.length; t++){

                for(let i = 0; i < data[types[t]].length; i++){

                    const d = data[types[t]][i];
                    d.date = matchDates[d.match_id] ?? 0;

                    const grabPlayerId = (grabCapPlayers[d.cap_id] !== undefined) ? grabCapPlayers[d.cap_id].grab :-1;
                    const capPlayerId = (grabCapPlayers[d.cap_id] !== undefined) ? grabCapPlayers[d.cap_id].cap :-1;

                    d.grabPlayer = getPlayer(names, grabPlayerId, true); 
                    d.capPlayer = getPlayer(names, capPlayerId, true); 

                    d.totalAssists = 0;

                    if(types[t] === "assistCaps"){

                        const currentAssists = assistPlayers.assists[d.cap_id] ?? [];

                        d.assistPlayers = currentAssists.map((assist) =>{
                            return getPlayer(names, assist, true)
                        });

                        d.totalAssists = d.assistPlayers.length;
                    }
                }
            }
            
            res.status(200).json({"data": data, "totalResults": 1});

            return;
        }

        if(mode === "3"){
            
            const ctfManager = new CTF();
            //0 solo caps 1 assist players
            const data = await ctfManager.getSingleMapCapRecords(gametype, map, cat, page, perPage);

            const playerManager = new Players();
            data.playerNames = await playerManager.getBasicInfo(data.uniquePlayers);

            res.status(200).json({"data": data, "totalResults": data.totalResults});
            return;
        }

        res.status(200).json({"error": "Unknown option."});
        return;

    }catch(err){

        console.trace(err);

        res.status(200).json({"error": err.toString()});
    }
}