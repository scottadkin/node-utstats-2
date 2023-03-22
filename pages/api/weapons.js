import Weapons from "../../api/weapons";

export default async function handler(req, res){

    try{
 
        const body = req.body;
        const mode = (body.mode !== undefined) ? body.mode.toLowerCase() : "";
        const playerId = (body.playerId !== undefined) ? parseInt(body.playerId) : -1;

        const weaponsManager = new Weapons();

        
        if(mode === "player-profile"){

            const totals = await weaponsManager.getPlayerTotals(playerId);
            const best = await weaponsManager.getPlayerBest(playerId);

            const weaponIds = [...new Set([
                ...totals.map((stat) => stat.weapon),
                ...best.map((stat) => stat.weapon_id),
            ])];

            const names = await weaponsManager.getNamesByIds(weaponIds, true);

            res.status(200).json({"totals": totals, "best": best, "names": names});
            return;
        }

        res.status(200).json({"error": "Unknown command."});

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": err.toString()});
    }
}
