import { bSessionAdminUser } from "@/app/lib/authentication";

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

    const {bAdmin, error} = await bSessionAdminUser();

    if(!bAdmin){
        return Response.json({"error": error});
    }


    return Response.json({"message": "hi"});
}