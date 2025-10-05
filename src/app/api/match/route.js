import { getKillsMatchUp } from "../../../../api/kills";

export async function POST(req){

    try{

        const res = await req.json();

        console.log(res);

        const mode = (res.mode !== undefined) ?  res.mode.toLowerCase() : "";
        let matchId = (res.matchId !== undefined) ? parseInt(res.matchId) : -1;

        if(matchId !== matchId) matchId = -1;

        if(mode === "kmu"){

            if(matchId === -1) return Response.json({"error": "Not a valid match id"});
            const kData = await getKillsMatchUp(matchId);
            console.log(kData);
            return Response.json({"data": kData});
        }

        

        console.log(mode);

        return Response.json({"error": "Unknown Command"});
    }catch(err){
        console.trace(err);
        return Response.json({"error": err.toString()});
    }
}