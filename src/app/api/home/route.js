import CountriesManager from "../../../../api/countriesmanager";
import Matches from "../../../../api/matches";
import Players from "../../../../api/players";

export async function POST(req){

    try{

        const res =  await req.json();

        const mode = (res.mode !== undefined) ? res.mode.toLowerCase() : "";
        const limit = (res.limit !== undefined) ? parseInt(res.limit) : 5;

        if(mode === "popular-countries"){

            const cm = new CountriesManager();

            const data = await cm.getMostPopular(limit);

            return Response.json({"data": data});

        }

        if(mode === "match-player-count"){

            const matchManager = new Matches();

            const start = (res.start !== undefined) ? parseInt(res.start) : 0;
            const end = (res.end !== undefined) ? parseInt(res.end) : 0;

            const data = await matchManager.getMatchCountPerDay(start, end);

            const playerManager = new Players();

            const playerData = await playerManager.getUniquePlayersByDay(start, end);

            return Response.json({"data": data, "playerData": playerData});
         
        }

        return Response.json({"error": "Unknown Command"});

    }catch(err){

        return Response.json({"error": err.toString()});
    }
}