import Servers from "../../api/servers";
import Maps from "../../api/maps";
import { cleanMapName } from "../../api/generic.mjs";

export default async function handler(req, res){

    try{

        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";

        if(mode === ""){
            res.status(200).json({"error": "No command specified"});
            return;
        }

        const servers = new Servers();
        const maps = new Maps();

        if(mode === "list"){

            const data = await servers.getQueryList();

            const playerHistory = await servers.getQueryPlayerCountHistory();

            const mapNames = data.map((d) =>{
                return d.map_name;
            });

            const mapIds = [...new Set(playerHistory.map((p) =>{
                return p.map_id;
            }))];

            const otherMapNames = await servers.getQueryMapNames([...mapIds]);

            const mapImages = await maps.getImages(mapNames);

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                const currentName = cleanMapName(d.map_name).toLowerCase();

                d.image = mapImages[currentName] ?? "default";
            }

            const currentPlayers = await servers.getCurrentQueryPlayers();

            res.status(200).json({
                "data": data, 
                "playerHistory": playerHistory,
                "mapIds": otherMapNames,
                "currentPlayers": currentPlayers
            });
            return;
        }

        console.log(mode);
        
        res.status(200).json({"error": "Unknown command."});
        return;

    }catch(err){

        res.status(200).json({"error": err.toString()});
    }
}