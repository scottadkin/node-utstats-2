import Combogib from "../../api/combogib";

export default async function handler(req, res){

    try{

        let mode = req.body.mode ?? null;

        if(mode === null){
            res.status(200).json({"error": "No mode specified"});
            return;
        }

        mode = mode.toLowerCase();
        const matchId = req.body.matchId ?? -1;

        const combo = new Combogib();

        if(mode === "match"){

            const data = await combo.getMatchData(matchId);

            res.status(200).json({"data": data});

            return;

        }else if(mode === "pmatch"){

            const matchId = req.body.matchId ?? -1;
            const playerId = req.body.playerId ?? -1;

            if(matchId === -1|| playerId === -1){
                res.status(200).json({"error": "PlayerId and or matchId were not specified"});
                return;
            }

            const data = await combo.getPlayerMatchData(playerId, matchId);

            res.status(200).json({"data": data});
            return;

        }else if(mode === "maprecord"){

            const mapId = req.body.mapId ?? -1;
            const page = req.body.page ?? 0;
            const perPage = req.body.perPage ?? 5;
            const dataType = req.body.dataType ?? "combo_kills";

            const data = await combo.getMapRecords(mapId, dataType, page, perPage);
            //const data2 = await combo.getMapRecords(mapId, "combo_kills", 1, 5);

            const totalResults = await combo.getTotalMapRecords(mapId, dataType);

            console.log(data);
            //console.log(data2);

            res.status(200).json({"data": data, "totalResults": totalResults});
            return;
        }

    }catch(err){

        console.trace(err);
        res.status(200).json({"error": err.message});
        return;
    }

    res.status(200).json({"error": "Unknown mode."});
    return;

}

