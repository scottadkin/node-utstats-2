import { getKillsMatchUp } from "../../../../api/kills";
import { getMatchData as getMatchItemsData, getMatchTotals as getMatchItemTotals, createPlayerItemUses, getNamesByIds as getItemsByIds } from "../../../../api/items";
import { getMatchData as getPingData } from "../../../../api/pings";
import { getObjectName } from "../../../../api/genericServerSide.mjs";
import { getMatchPlayerData as getPlayerPowerupData } from "../../../../api/powerups";

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

        if(mode === "pings"){
        
            if(matchId !== matchId){
                return Response.json({"error": "Match id must be a valid integer"});
            }

            let players = res.players ?? [];


            const data = await getPingData(matchId, players);

            return Response.json({"data": data});
        }


        if(mode === "powerups"){


            const playerData = await getPlayerPowerupData(matchId);

            const uniqueIds = [...new Set(playerData.map((d) =>{
                return d.powerup_id;
            }))];

            const names = await getObjectName("powerups", uniqueIds);

            return Response.json({"names": names, "playerData": playerData});

        }
        

        console.log(mode);

        return Response.json({"error": "Unknown Command"});
    }catch(err){
        console.trace(err);
        return Response.json({"error": err.toString()});
    }
}