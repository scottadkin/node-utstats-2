import { bSessionAdminUser } from "@/app/lib/authentication";
import { getAllFTPSettings } from "@/app/lib/ftp";

export async function POST(req){

    const {bAdmin, error} = await bSessionAdminUser();

    if(!bAdmin){
        return Response.json({"error": error});
    }
;

    const {mode} = await req.json();


    if(mode === undefined){
        return Response.json({"error": "Mode is undefined"});
    }

    console.log(`mode = ${mode}`);
    //Check if admin, if not return error message

    return Response.json({"message": "hi"});
}


export async function GET(req){

    try{
        const {bAdmin, error} = await bSessionAdminUser();

        const { searchParams } = new URL(req.url);

        const mode = searchParams.get("mode");

        if(mode === undefined){
            throw new Error("Mode is undefined");
        }

        console.log(mode);

        if(mode === "load-ftp"){

            const data = await getAllFTPSettings();

            return Response.json(data);
        }

        if(!bAdmin){
            throw new Error(error);
        }

        return Response.json({"message": "hi"});

    }catch(err){
        return Response.json({"error": err.toString()});
    }
}