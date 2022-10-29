import Players from "../../api/players";

export default async function handler(req, res){

    if(req.body.mode === undefined){

        res.status(200).json({"error": "No mode was specified."});
        return;
    }

    const mode = req.body.mode.toLowerCase();

    const playerManager = new Players();


    const validTypesDisplay = playerManager.getValidRecordTypes();
    const validTypes = playerManager.getValidRecordTypes(true);

    if(mode === "validtypes"){

        res.status(200).json(validTypesDisplay);
        return;
    }


    if(req.body.type === undefined){

        res.status(200).json({"error": "No type was specified."});
        return;

    }

    
    const type = req.body.type.toLowerCase();
    let page = req.body.page ?? 0;
    if(page < 0) page = 0;
    let perPage = parseInt(req.body.perPage) ?? 25;

    if(perPage > 100) perPage = 100;
    if(perPage <= 25) perPage = 25;

   
    console.log(`mode = ${mode}, type=${type}, page = ${page}`);

   

    if(mode === "totals"){

        if(validTypes.totals.indexOf(type) !== -1){

            const totalData = await playerManager.getBestOfTypeTotal(validTypes.totals, type, 0, perPage, page);

            const totalPossibleResults = await playerManager.getTotalResults(0);

            res.status(200).json({"data": totalData, "totalResults": totalPossibleResults});
            return;
        }
    }

    res.status(200).json({"error": "Unknown option."});
    return;
}