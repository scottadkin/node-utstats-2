import {writeFileSync} from "fs";
import { headers, cookies } from "next/headers";
import Session from "../../../../api/session";
import { Jimp } from "jimp";
import { stripFileExtension, cleanMapName } from "../../../../api/generic.mjs";

const VALID_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/bmp",
];

async function bulkMapImageUpload(formData){

    const files = formData.getAll("file");


    const fileResults = {
        "failed": [],
        "passed": []
    };

    for(let i = 0; i < files.length; i++){

        const f = files[i];

        try{
            
            const typeIndex = VALID_IMAGE_TYPES.indexOf(f.type);

            if(typeIndex === -1){
                console.log(`Not a supported image file type`);
                continue;
            }

            let justFileName = stripFileExtension(f.name);
     

            if(justFileName === null) throw new Error(`Not a valid file name`);

            justFileName = cleanMapName(justFileName).toLowerCase();

            //only do this if file is not a pjg
            if(typeIndex !== 0){

                const image = await Jimp.read(Buffer.from(await f.arrayBuffer()));

                const converted = await image.getBuffer('image/jpeg', { quality: 66 });

                const finalImage = await Jimp.fromBuffer(converted);

                await finalImage.write(`./public/images/maps/${justFileName}.jpg`, "image/jpeg");
                fileResults.passed.push(f.name);
            }else{

                writeFileSync(`./public/images/maps/${justFileName}.jpg`, Buffer.from(await f.arrayBuffer()));
                fileResults.passed.push(f.name);
            }


        }catch(err){

            fileResults.failed.push(f.name);
            console.trace(err);
        }
    }

    return Response.json({"data": fileResults});
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