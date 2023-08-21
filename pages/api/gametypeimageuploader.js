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

    
        const VALID_MIMES = ["image/jpeg", "image/jpg"];

        const form = formidable({
            "filter": ({name, originalFilename, mimetype}) =>{
    
                if(VALID_MIMES.indexOf(mimetype) === -1) return false;

                return true;
            }
        });

        form.parse(req, (err, fields, files) => {

            let fileName = fields["fileName"] ?? "";
            fileName = fileName.toLowerCase();

            if(Object.keys(files).length === 0){
                resolve();
                return res.status(200).json({"error": "No Files Selected"});
            }

            try{

                for(const file of Object.values(files)){

                    if(fileName === ""){
                        fileName = file.newFilename;
                    }

                    fileName = fileName.replaceAll(" ", "");

                    fs.renameSync(file.filepath, `./public/images/gametypes/${fileName}.jpg`);
                }

            }catch(fileError){
                console.trace(fileError);
                reject(fileError.toString());
                return;
            }
            res.status(200).json({"message": "passed"});
            resolve();
            
        });

    });
    
}