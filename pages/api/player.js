const Players = require("../../api/players");
const CTF = require("../../api/ctf");
const Gametypes = require("../../api/gametypes");
const Telefrags = require("../../api/telefrags");
const Maps = require("../../api/maps");

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
            const bestLife = await ctfManager.getPlayerBestSingleLifeValues(playerId);

            for(let i = 0; i < totals.length; i++){
                gametypeIds.add(totals[i].gametype_id);
            }

            for(let i = 0; i < best.length; i++){
                gametypeIds.add(best[i].gametype_id);
            }

            for(let i = 0; i < bestLife.length; i++){
                gametypeIds.add(bestLife[i].gametype_id);
            }

            const gametypeNames = await gametypeManager.getNames([...gametypeIds]);

            res.status(200).json({"totals": totals, "best": best, "bestLife": bestLife, "gametypeNames": gametypeNames});
            return;

        }

        if(mode === "telefrags"){

            const teleFragManager = new Telefrags();

            const data = await teleFragManager.getPlayerTotals(playerId);

            

            const gametypeIds = [...new Set(data.map((d) =>{
                return d.gametype_id;
            }))];

            const mapIds = [...new Set(data.map((d) =>{
                return d.map_id;
            }))];


            const gametypeManager = new Gametypes();
            const gametypeNames = await gametypeManager.getNames(gametypeIds);

            const mapManager = new Maps();
            const mapNames = await mapManager.getNames(mapIds);
            
            res.status(200).json({"data": data, "gametypeNames": gametypeNames, "mapNames": mapNames});
            return;
        }

        res.status(200).json({"error": "Unknown Command"});

    }catch(err){

        res.status(200).json({"error": err.toString()});
    }
}