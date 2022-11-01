import Players from "../../api/players";
import Functions from "../../api/functions";
import Maps from "../../api/maps";

export default async function handler(req, res){

    if(req.body.mode === undefined){

        res.status(200).json({"error": "No mode was specified."});
        return;
    }


    let mode = req.body.mode ?? 0;

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

    
    let type = req.body.type.toLowerCase() ?? "";
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

    if(mode === "match"){

        if(validTypes.totals.indexOf(type) !== -1){

            const results = await playerManager.getBestMatchValues(validTypes.matches, type, page, perPage);


            const totalResults = await playerManager.getTotalBestMatchValues(validTypes.matches, type);
            

            const playerIds = Functions.getUniqueValues(results, "player_id");
            const mapIds = Functions.getUniqueValues(results, "map_id");

            const mapManager = new Maps();

            const mapNames = await mapManager.getNames(mapIds);

            const playerNames = await playerManager.getNamesByIds(playerIds, true);

            for(let i = 0; i < results.length; i++){

                const r = results[i];
                r.name = playerNames[results[i].player_id].name ?? "Not Found";
                r.mapName = mapNames[results[i].map_id] ?? "Not Found";
            }


            res.status(200).json({"data": results, "totalResults": totalResults});
            return;

        }
    }

    res.status(200).json({"error": "Unknown option."});
    return;
}