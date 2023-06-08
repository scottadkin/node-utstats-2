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

    if(mode === "spawns"){

        const data = await mapManager.getSpawns(id);
        res.status(200).json({"data": data});
        return;
    }

    res.status(200).json({"error": "Unknown Query."});
}