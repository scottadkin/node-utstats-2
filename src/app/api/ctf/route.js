import { getBasicPlayersByIds } from "../../../../api/players";
import { getMapCaps, getMapTotalCaps } from "../../../../api/ctf";

export async function POST(req){

    try{

        const res = await req.json();


        const mode = (res.mode !== undefined) ? res.mode.toLowerCase() : "";
        const limit = (res.limit !== undefined) ? parseInt(res.limit) : 5;
        const mapId = (res.mapId !== undefined) ? parseInt(res.mapId) : -1;
        let perPage = (res.perPage !== undefined) ? parseInt(res.perPage) : 5;
        let page = (res.page !== undefined) ? parseInt(res.page) : 0;
        const capType = (res.capType !== undefined) ? res.capType.toLowerCase() : "";

        if(mode === "map-caps"){

            const data = await getMapCaps(mapId, capType, page, perPage);

            const players = await getBasicPlayersByIds([...data.playerIds]);
            const totalCaps = await getMapTotalCaps(mapId, capType);

            return Response.json({"caps": data, "players": players, "totalCaps": totalCaps});
        }

        return Response.json({"error": "test"});
    }catch(err){
        console.trace(err);

        return Response.json({"error": err.toString()});
    }
}