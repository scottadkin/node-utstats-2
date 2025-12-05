import { getMapTotals as getMapWeaponTotals } from "../../../../api/weapons";
import { getUniquePlayedGametypes } from "../../../../api/maps";

export async function POST(req){

    try{

        const res = await req.json();
        const mode = (res.mode !== undefined) ? res.mode.toLowerCase() : "";

        const id = (res.mapId !== undefined) ? parseInt(res.mapId) : NaN;
        const gametypeId = (res.gametypeId !== undefined) ? parseInt(res.gametypeId) : NaN;

        if(mode === "weapons"){
            
            const data = await getMapWeaponTotals(id, gametypeId);

            const playedGametypes = await getUniquePlayedGametypes(id);

            return Response.json({data, playedGametypes});
        }


        return Response.json({"error": "Unknown Request"});

    }catch(err){

        console.trace(err);
        return Response.json({"error": err.toString()});
    }
}