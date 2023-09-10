import Maps from "../../api/maps";
import Kills from "../../api/kills";
import Players from "../../api/players";
import {getUniqueValuesFromObject} from "../../api/generic.mjs";
import Weapons from "../../api/weapons";
import CTF from "../../api/ctf"

export default async function handler(req, res){

    try{

        const mode = (req.query.mode !== undefined) ? req.query.mode.toLowerCase() : "";
        const id = (req.query.id !== undefined) ? parseInt(req.query.id) : -1;


        if(mode === ""){
            res.status(200).json({"error": "No mode specified"});
            return;
        }

        const mapManager = new Maps();


        if(mode === "graph-history"){

            const data = await mapManager.getGraphHistoryData(id);
            res.status(200).json(data);
            return;
        }

        if(mode === "interactive-data"){

            const spawns = await mapManager.getSpawns(id);

            const data = spawns.map((s) =>{

                s.type = "spawn";
                return s;
            });

            const flags = await mapManager.getFlags(id);

            for(let i = 0; i < flags.length; i++){

                const f = flags[i];
                f.type = "flag";
                data.push(f);
            }

            const latestMatchId = await mapManager.getLastestMatchId(id);
            const lastMapItems = await mapManager.getLastestMatchItems(id, latestMatchId);

            for(let i = 0; i < lastMapItems.data.length; i++){

                const d = lastMapItems.data[i];

                const info = lastMapItems.itemsInfo[d.item_id] ?? null;

                if(info === null) continue;

                data.push({
                    "name": d.item_name,
                    "type": info.itemType,
                    "className": info.itemClass,
                    "x": d.pos_x,
                    "y": d.pos_y,
                    "z": d.pos_z,
                });
            }

            const killManager = new Kills();

            const killData = await killManager.getInteractiveMapData(latestMatchId);

            const {uniquePlayers, uniqueWeapons} = getUniqueValuesFromObject(
                killData, ["killer", "victim", "killer_weapon", "victim_weapon"], 
                ["uniquePlayers", "uniquePlayers", "uniqueWeapons", "uniqueWeapons"]
            );

            const playerManager = new Players();
            const playerNames = await playerManager.getNamesByIds(uniquePlayers, true);

            const weaponsManager = new Weapons();
            const weaponNames = await weaponsManager.getNamesByIds(uniqueWeapons, true);

            const ctfManager = new CTF();

            const flagDrops = await ctfManager.getMatchFlagDrops(latestMatchId, "all");
            const flagReturns = await ctfManager.getMatchReturnsInteractiveData(latestMatchId);

            const flagCovers = await ctfManager.getMatchCovers(latestMatchId, false, true);

            res.status(200).json({
                "data": data, 
                "itemsData": lastMapItems, 
                "playerNames": playerNames, 
                "weaponNames": weaponNames,
                "killData": killData,
                "flagDrops": flagDrops,
                "flagReturns": flagReturns,
                "flagCovers": flagCovers
            });

            return;
        }

        res.status(200).json({"error": "Unknown Query."});

    }catch(err){

        res.status(200).json({"error": err.toString()});
    }
}