import { searchMatches } from "../../../../api/matches";

export async function GET(req){

    try{

        const url = req.nextUrl;

        const params = url.searchParams;
    

        let mode = params.get("mode") ?? "";
        
        if(mode === "") throw new Error(`You did not specify a mode`);
        mode = mode.toLowerCase();


        if(mode === "search"){

            const serverId = params.get("serverId") ?? 0;
            const gametypeId = params.get("gametypeId") ?? 0;
            const mapId = params.get("mapId") ?? 0;
            const page = params.get("page") ?? 0;
            const perPage = params.get("perPage") ?? 25;
            const sortBy = params.get("sortBy") ?? "date";
            const order = params.get("order") ?? "desc";

            console.log(serverId, gametypeId, mapId, page, perPage, sortBy, order);

            const data = await searchMatches(serverId, gametypeId, mapId, page, perPage, sortBy, order);

            console.log(data);
            return Response.json({"data": data});
        }

        return Response.json({"error": "Unknown mode"});

    }catch(err){
        console.trace(err);

        return Response.json({"error": err.toString()});
    }
}