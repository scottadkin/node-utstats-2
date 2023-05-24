import formidable from 'formidable';
import fs from 'fs';
import Session from '../../api/session';
import Jimp from 'jimp';



export const config = {
    api: {
        bodyParser: false,
    },
};

const FULLSIZE_DIR = "./public/images/maps/";
const THUMBS_DIR = "./public/images/maps/thumbs/";


function getExt(string){

    const ext = /^.+\.(.+)$/i.exec(string);

    if(ext !== null){
        return ext[1].toLowerCase();
    }

    return null;
}


function uploadImage(currentLocation, currentName, targetName){


    return new Promise(async (resolve, reject) =>{

        const fileName = `${FULLSIZE_DIR}${targetName}`;

        const quality = 85;

        const tempFile = `${currentLocation}${currentName}`;

        const fileReg = /^(.+)\..+$/i;
        const fileResult = fileReg.exec(targetName);

        let newName = "";

        if(fileResult !== null){
            newName = fileResult[1];
        }else{
            newName = targetName;
        }


        await Jimp.read(tempFile).then((file) =>{

            return file.quality(quality).write(`${FULLSIZE_DIR}${newName}.jpg`);
        });

        //thumbs
        await Jimp.read(tempFile).then((file) =>{

            return file.resize(480, 270).quality(quality).write(`${THUMBS_DIR}${newName}.jpg`);

        }).catch((err) =>{
            console.trace(err);
        })

        try{
            fs.unlinkSync(tempFile);
        }catch(err){
            console.trace(err);
            reject(err);
            return;
        }

        resolve();    
    });
   
}

export default async function handler(req, res){

    return new Promise(async (resolve, reject) =>{

        const VALID_FILE_TYPES = ["jpg", "jpeg", "png"];
        const VALID_MIME_TYPES = ["image/jpg", "image/jpeg", "image/png"];

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const errors = [];

            const form = formidable({"uploadDir": "./uploads/"});

            form.parse(req, (err, fields, files) =>{

                if(err){
                    console.trace(err);
                    errors.push(err);
                }
            });

            form.on("file", async (formName, file) =>{
            //form.onPart = function(part){

                if(formName === undefined) formName = "000_temp";

                if(VALID_MIME_TYPES.indexOf(file.mimetype) !== -1){     

                    const ext = getExt(file.originalFilename);

                    if(ext !== null){

                        if(VALID_FILE_TYPES.indexOf(ext) !== -1){

                         
                            await uploadImage(`./uploads/`, file.newFilename, `${formName}`);
                         
             
                            res.status(200).json({"message": "upload complete."});
                            resolve();
                            return;

                        }else{
                            errors.push(`${ext} is not a valid file extension`);
                        }
                    }else{

                        errors.push(`File extension was null`);
                    }

                }else{
                    errors.push(`${mimetype} is not a valid mimeType`);
                }

              

                if(errors.length > 0){

                    console.log(errors);
                    res.status(200).json({"errors": errors});
                    resolve()
                }
            });
           

        }else{
            res.status(200).json({"errors": ["Access Denied"]});
            resolve();
        }

    });
    
    
}