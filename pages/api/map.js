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

        

        console.log(data);
        res.status(200).json({"data": data});
        return;
    }

    res.status(200).json({"error": "Unknown Query."});
}