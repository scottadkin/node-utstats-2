import formidable from "formidable";
import Session from '../../api/session';
import fs from 'fs';


export const config = {
    api:{
        bodyParser:false
    },
};

export default async function handler(req, res){

    const session = new Session(req);

    await session.load();

    if(!await session.bUserAdmin()){
        res.status(200).json({"error": "Only admins can perform this action"});
        return;
    }

    return new Promise((resolve, reject) =>{

        let cancelUploads = false;
    
        const VALID_MIMES = ["image/jpeg", "image/jpg"];

        const form = formidable({

            "filter": ({name, originalFilename, mimetype}) =>{

                const reg = /^.+\.(.+)$/i;

                const regResult = reg.exec(originalFilename);

                if(regResult === null) return false;

                if(regResult[1].toLowerCase() !== "jpg"){
                    form.emit("error", `File extension must be .jpg, .${regResult[1]} was found instead.`);
                    return false;
                }

                if(VALID_MIMES.indexOf(mimetype) === -1){
                    form.emit("error", `File mimetype must be ${[...VALID_MIMES]}, .${mimetype} was found instead.`);
                    return false;
                }

                return true;
            }
        });

        form.once("error", (err) =>{

            cancelUploads = true;
            res.status(200).json({"error": err});
            resolve();

        });

        form.parse(req, (err, fields, files) => {

            if(cancelUploads) return;
            

            if(err){
                res.status(200).json({"error": err.toString()});
                resolve();
                return;
            }


            if(Object.keys(files).length === 0){
                resolve();
                return res.status(200).json({"error": "No Files Selected"});
            }

            const messages = [];

            try{

                for(const [currentFileName, file] of Object.entries(files)){

                    const cleanFileName = currentFileName.toLowerCase().replaceAll(" ", "");

                    fs.renameSync(file.filepath, `./public/images/gametypes/${cleanFileName}`);
                    messages.push(`Uploaded ${currentFileName} successfully`);
                }

            }catch(fileError){

                console.trace(fileError);
                reject(fileError.toString());
                return;
            }

            let finalMessage = "";

            if(messages.length === 1){
                finalMessage = messages.toString();
            }else{
                finalMessage = messages.join(", ");
            }
            res.status(200).json({"message": `${finalMessage}.`});
            resolve();
            
        });

    });
    
}