import Items from '../../api/items';

export default async function handler(req, res){

    try{

        const itemsManager = new Items();

        const mode = req.body.mode ?? "";
        const matchId = req.body.matchId ?? "";

        if(mode === "matchUsage"){

            const data = await itemsManager.getMatchData(matchId);
            const uniqueItems = itemsManager.returnUniqueIds(data);

            const itemNames = await itemsManager.getNamesByIds(uniqueItems);
            const itemTotals = await itemsManager.getMatchTotals(matchId);

            const playerUses = itemsManager.createPlayerItemUses(data);

            res.status(200).json({"playerUses": playerUses, "itemNames": itemNames, "itemTotals": itemTotals});
            return;
        }

    }catch(err){
        console.trace(err);
    }

}