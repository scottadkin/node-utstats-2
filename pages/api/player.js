const Players = require("../../api/players");
const CTF = require("../../api/ctf");
const Gametypes = require("../../api/gametypes");

export default async function handler(req, res){


    try{


        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";
        const playerId = (req.body.playerId !== undefined) ? parseInt(req.body.playerId) : -1;


        if(mode === "ctf"){

            const ctfManager = new CTF();
            const gametypeManager = new Gametypes();

            const gametypeIds = new Set();

            const totals = await ctfManager.getPlayerTotals(playerId);
            const best = await ctfManager.getPlayerBestValues(playerId);

            for(let i = 0; i < totals.length; i++){
                gametypeIds.add(totals[i].gametype_id);
            }

            for(let i = 0; i < best.length; i++){
                gametypeIds.add(best[i].gametype_id);
            }

            const gametypeNames = await gametypeManager.getNames([...gametypeIds]);

            res.status(200).json({"totals": totals, "best": best, "gametypeNames": gametypeNames});
            return;

        }

        res.status(200).json({"error": "Unknown Command"});

    }catch(err){

        res.status(200).json({"error": err.toString()});
    }
}