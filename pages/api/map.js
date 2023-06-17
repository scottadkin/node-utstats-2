import Maps from "../../api/maps";

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


        const lastMapItems = await mapManager.getLastestMatchItems(id);

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

        res.status(200).json({"data": data, "itemsData": lastMapItems});
        return;
    }

    res.status(200).json({"error": "Unknown Query."});
}