import { getKillsMatchUp } from "../../../../api/kills";
import { getMatchData as getMatchItemsData, getMatchTotals as getMatchItemTotals, createPlayerItemUses, getNamesByIds as getItemsByIds } from "../../../../api/items";

export async function POST(req){

    try{

        const res = await req.json();

        console.log(res);

        const mode = (res.mode !== undefined) ?  res.mode.toLowerCase() : "";
        let matchId = (res.matchId !== undefined) ? parseInt(res.matchId) : -1;

        if(matchId !== matchId) matchId = -1;

        if(mode === "kmu"){

            if(matchId === -1) return Response.json({"error": "Not a valid match id"});
            const kData = await getKillsMatchUp(matchId);
            return Response.json({"data": kData});
        }

        if(mode === "item-usage"){

            const data = await getMatchItemsData(matchId);

            const uniqueItems = [...new Set(data.map((d) =>{
                return d.item;
            }))];

            const itemNames = await getItemsByIds(uniqueItems);
            const itemTotals = await getMatchItemTotals(matchId);
            const playerUses = createPlayerItemUses(data);
     

            return Response.json({"playerUses": playerUses, "itemNames": itemNames, "itemTotals": itemTotals});
        }

        

        console.log(mode);

        return Response.json({"error": "Unknown Command"});
    }catch(err){
        console.trace(err);
        return Response.json({"error": err.toString()});
    }
}