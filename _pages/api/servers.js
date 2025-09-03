import Servers from "../../api/servers";
import Gametypes from "../../api/gametypes";
import Maps from "../../api/maps";

export default async function handler(req, res){

    const serverManager = new Servers();
    const gametypeManager = new Gametypes();
    const mapManager = new Maps();

    const body = req.body;

    let serverId = body.id ?? 0;

    serverId = parseInt(serverId);

    if(serverId !== serverId) serverId = 0;

    let mode = body.mode ?? "";
    mode = mode.toLowerCase();

    if(mode === "recent-pings"){

        const data = await serverManager.getServerRecentPings(serverId, 25);

        const gametypeIds = new Set();
        const mapIds = new Set();

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            gametypeIds.add(d.gametype);
            mapIds.add(d.map);

        }

        const gametypeNames = await gametypeManager.getNames([...gametypeIds]);
        const mapNames = await mapManager.getNames([...mapIds]);

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            d.mapName = mapNames[d.map] ?? "Not Found";
            d.gametypeName = gametypeNames[d.gametype] ?? "Not Found";
        }

        res.status(200).json({"data": data});
        return;
    }

    res.status(200).json({"error": "Unknown command."});
}