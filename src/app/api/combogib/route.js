import Combogib from "../../../../api/combogib";
import { getBasicPlayersByIds } from "../../../../api/players";

export async function POST(req){

    try{

        const res = await req.json();

        let mode = res.mode ?? "";
        if(mode === "") return Response.json({"error": "No mode specified"});
        mode = mode.toLowerCase();

        const mapId = (res.mapId !== undefined) ? parseInt(res.mapId) : 0;
        const page = (res.page !== undefined) ? parseInt(res.page) : 0;
        const perPage = (res.perPage !== undefined) ? parseInt(res.perPage) : 5;
        const dataType = (res.dataType !== undefined) ? res.dataType : "combo_kills";

        const combo = new Combogib();


        if(mode === "maprecord"){

            const bAnyMapData = await combo.bMapHaveTotalsData(mapId, 0);

            if(bAnyMapData){

                const data = await combo.getMapRecords(mapId, dataType, page, perPage);
                const totalResults = await combo.getTotalMapRecords(mapId, dataType);

                //const playerIds = Functions.getUniqueValues(data, "player_id");
                const playerIds = [...new Set(data.map((d) =>{
                    return d.player_id;
                }))]

                const players = await getBasicPlayersByIds(playerIds, true);

                return Response.json({"data": data, "totalResults": totalResults, "players": players});
              
            }else{
                return Response.json({"error": "none"});
         
            }
        }

    }catch(err){
        console.trace(err);
        return Response.json({"error": err.toString()});
    }
}