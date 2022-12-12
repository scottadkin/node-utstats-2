import Matches from "../../api/matches";
import Servers from "../../api/servers";
import Maps from "../../api/maps";
import Gametypes from "../../api/gametypes";


export default async function handler(req, res){

    try{

        let mode = req.body.mode ?? "";
        mode = mode.toLowerCase();

        const serverId = req.body.serverId ?? 0;
        const gametypeId = req.body.gametypeId ?? 0;
        const mapId = req.body.mapId ?? 0;

        let perPage = req.body.perPage ?? 0;
        perPage = parseInt(perPage);

        if(perPage !== perPage) perPage = 25;
        if(perPage > 100 || perPage <= 0) perPage = 25;

        let page = req.body.page ?? 1;

        page = parseInt(page);
        if(page !== page) page = 1;
        if(page < 1) page = 1;


        const serverManager = new Servers();
        const mapManager = new Maps();
        const gametypeManager = new Gametypes();
        const matchManager = new Matches();

        if(mode === "full-list"){
            
            const serverNames = await serverManager.getAllNames();
            const mapNames = await mapManager.getAllNameAndIds();
            const gametypeNames = await gametypeManager.getAllNames();
            
            mapNames[0] = "All Maps";
            serverNames[0] = "All Servers";
            gametypeNames[0] = "All Gametypes";

            res.status(200).json({"serverNames": serverNames, "mapNames": mapNames, "gametypeNames": gametypeNames});
            return;

        }else if(mode === "search"){
    
            const data = await matchManager.searchMatches(serverId, gametypeId, mapId, page - 1, perPage);

            const uniqueMaps = new Set();
            const uniqueGametypes = new Set();

            for(let i = 0; i < data.length; i++){

                uniqueMaps.add(data[i].map);
                uniqueGametypes.add(data[i].gametype);
            }

            const mapNames = await mapManager.getNames(Array.from(uniqueMaps));
            const gametypeNames = await gametypeManager.getNames(Array.from(uniqueGametypes));
            const mapImages = await mapManager.getImages(Object.values(mapNames));
            const serverNames = await serverManager.getAllNames();

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                d.mapName = mapNames[d.map] ?? "Not Found";
                d.gametypeName = gametypeNames[d.gametype] ?? "Not Found"; 
                d.serverName = serverNames[d.server] ?? "Not Found";
            }


            res.status(200).json({"data": data, "images": mapImages});
            return;

        }else if(mode === "search-count"){

            const totalMatches = await matchManager.getSearchTotalResults(serverId, gametypeId, mapId);

            res.status(200).json({"totalMatches": totalMatches});
            return;
        }

        res.status(200).json({"error": "Unknown command"});

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": err.toString()});
    }
}