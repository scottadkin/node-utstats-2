import { getRecentMatches } from "../../../../api/player";
import { getImages as getMapImages } from "../../../../api/maps";
import { cleanMapName } from "../../../../api/generic.mjs";

export async function POST(req){

    try{

        const res = await req.json();

        let mode = (res.mode !== undefined) ? res.mode.toLowerCase() : "";

        if(mode === "") throw new Error("No mode specified");

        let id = (res.id !== undefined) ? parseInt(res.id) : 0 ;
        if(id !== id) id = 0;

        let page = (res.page !== undefined) ? parseInt(res.page) : 1;
        if(page !== page) page = 1;

        if(mode === "player-recent-matches"){

            const data = await getRecentMatches(id, page);

            const mapNames = new Set(data.map((d) =>{
                return d.mapName;
            }));


            const mapImages = getMapImages([...mapNames]);

            for(let i = 0; i < data.length; i++){

                const d = data[i];
                const targetImage = cleanMapName(d.mapName).toLowerCase();

                d.image = (mapImages[targetImage] !== undefined) ? mapImages[targetImage] : "default";
            }
            
            return Response.json({"data": data});

        }

        return Response.json({"error": "Unknown mode"});

    }catch(err){

        console.trace(err);
        return Response.json({"error": err.toString()});
    }
}