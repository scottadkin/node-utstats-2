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

async function uploadMapImage(file, forcedFileName){

    
    const typeIndex = VALID_IMAGE_TYPES.indexOf(file.type);

    if(typeIndex === -1){
        throw new Error(`Not a supported image file type`);
    }

    let justFileName = (forcedFileName !== undefined) ? forcedFileName : stripFileExtension(file.name);


    if(justFileName === null) throw new Error(`Not a valid file name`);

    if(forcedFileName === undefined){
        justFileName = cleanMapName(justFileName).toLowerCase();
    }

    //only do this if file is not a pjg
    if(typeIndex !== 0){

        const image = await Jimp.read(Buffer.from(await file.arrayBuffer()));

        const converted = await image.getBuffer('image/jpeg', { quality: 66 });

        const finalImage = await Jimp.fromBuffer(converted);

        await finalImage.write(`./uploads/${justFileName}.jpg`, "image/jpeg");
    }else{

        writeFileSync(`./uploads/${justFileName}.jpg`, Buffer.from(await file.arrayBuffer()));     
    }

    return true;
}

async function bulkMapImageUpload(formData){

    const files = formData.getAll("file");

    const fileResults = {
        "failed": [],
        "passed": []
    };

    for(let i = 0; i < files.length; i++){

        const f = files[i];

        try{
            
            if(await uploadMapImage(f)){
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
            return Response.json({"message": "set message"});
        }

        if(mode === "map-single-upload"){

            console.log(formData.get("mapName"));

            const file = formData.get("image");

            if(file === null) throw new Error(`No image supplied`);

            const mapName = formData.get("mapName");
            if(mapName === null) throw new Error(`You did not supply a name for the image`);
            console.log(file);
            await uploadMapImage(file, mapName); 
        }
        //const file = 

        return Response.json({"a": "a"});

    }catch(err){
        console.trace(err);
        return Response.json({"test": "test"});
    }
}