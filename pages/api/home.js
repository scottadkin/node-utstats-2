import CountriesManager from "../../api/countriesmanager";

export default async function handler(req, res){

    try{

        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";
        const limit = (req.body.limit !== undefined) ? parseInt(req.body.limit) : 5;

        if(mode === "popular-countries"){

            const cm = new CountriesManager();

            const data = await cm.getMostPopular(limit);

            res.status(200).json({"data": data});
            return;

        }

        res.status(200).json({"error": "Unknown Command"});

    }catch(err){

        res.status(200).json({"error": err.toString()});
    }
}