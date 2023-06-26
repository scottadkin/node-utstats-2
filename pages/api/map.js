import Maps from "../../api/maps";
import Kills from "../../api/kills";
import Players from "../../api/players";
import {getUniqueValuesFromObject} from "../../api/generic.mjs";
import Weapons from "../../api/weapons";

export default async function handler(req, res){


    console.log(req.query);

    const mode = (req.query.mode !== undefined) ? req.query.mode.toLowerCase() : "";
    const id = (req.query.id !== undefined) ? parseInt(req.query.id) : -1;


    if(mode === ""){
        res.status(200).json({"error": "No mode specified"});
        return;
    }

    const mapManager = new Maps();

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

 
        for(let i = 0; i < killData.length; i++){

            const k = killData[i];

            if(k.victim_team === -1 && k.distance === -1 && k.victim_weapon !== 0){
                console.log("suicide with weapon");
            }

            if(k.victim_weapon > 0 || k.killer === k.victim){

                data.push({
                    "name": "Killer Location",
                    "type": "kill",
                    "timestamp": k.timestamp,
                    "x": k.killer_x,
                    "y": k.killer_y,
                    "z": k.killer_z,
                    "killerWeapon": k.killer_weapon,
                    "victimWeapon": k.victim_weapon,
                    "killer": k.killer,
                    "victim": k.victim
                });
                
            }

            data.push({
                "name": "Victim Location",
                "type": "victim",
                "timestamp": k.timestamp,
                "x": k.victim_x,
                "y": k.victim_y,
                "z": k.victim_z,
                "killerWeapon": k.killer_weapon,
                "victimWeapon": k.victim_weapon,
                "killer": k.killer,
                "victim": k.victim
            });
        }

        //console.log(uniquePlayers);
        res.status(200).json({
            "data": data, 
            "itemsData": lastMapItems, 
            "playerNames": playerNames, 
            "weaponNames": weaponNames
        });

        return;
    }

    res.status(200).json({"error": "Unknown Query."});
}