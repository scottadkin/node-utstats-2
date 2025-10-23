import {writeFileSync} from "fs";
import { headers, cookies } from "next/headers";
import Session from "../../../../api/session";


const VALID_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/svg+xml",
];

async function bulkMapImageUpload(formData){

    const files = formData.getAll("file");

   // return Response.json({"b": "B"});

   // console.log(formData.get("file"));

    //const file = formData.get("file");

    for(let i = 0; i < files.length; i++){

        const f = files[i];
        console.log(f);

        //check file type

        if(VALID_IMAGE_TYPES.indexOf(f.type) === -1){
            console.log(`Not a supported image file type`);
            continue;
        }

        

        //strip file ext
        //cleanmapname & tolowercase
        //upload image
        console.log(f.name);
    }

   // writeFileSync("./doesthiswork.png",Buffer.from(await file.arrayBuffer()));
}

export async function POST(req){

    try{

        const cookieStore = await cookies();
        const header = await headers();
        const cookiesData = cookieStore.getAll();
    
        const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
        
        const session = new Session(ip, cookiesData);
    
        await session.load();

        if(!await session.bUserAdmin()){
            return Response.json({"error": "Access Denied"});
            //throw new Error(`user is not admin`);
        }

        const formData = await req.formData();

        console.log("test");

        let mode = formData.get("mode") ?? "";
        mode = mode.toLowerCase();

        console.log(`mode = ${mode}`);

        if(mode === "map-bulk-upload"){
            await bulkMapImageUpload(formData);
        }
        //const file = 

        return Response.json({"a": "a"});

    }catch(err){
        console.trace(err);
        return Response.json({"test": "test"});
    }
}