import formidable from "formidable";
import fs from 'fs';
import Session from '../../api/session';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res){



    return new Promise(async (resolve, reject) =>{


        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const form = new formidable.IncomingForm();
            form.uploadDir = "./uploads";
            form.keepExtensions = false;

            const fileNames = [];
            const tempFiles = [];

            form.parse(req, (err, fields, files) =>{

                if(err){
                    res.status(200).json({"message": `ERROR: ${err}`});
                }

                let fileNameReg = /^(.+)\..+$/i;
                let fileNameRegResult = 0;

                if(fields.single !== undefined){
                    fs.renameSync(tempFiles[0], `./public/images/monsters/${fields.fileName}.png`);
                }else{

                    for(let i = 0; i < fileNames.length; i++){

                        fileNameRegResult = fileNameReg.exec(fileNames[i]);

                        if(fileNameRegResult !== null){
                            fs.renameSync(tempFiles[i], `./public/images/monsters/${fileNameRegResult[1]}.png`)
                        }else{
                            console.log(`fileNameRegResult is null`);
                        }
                    }
                }

                res.status(200).json({"message": "passed"});
                resolve();

            });

            form.onPart = function (part){

                if(part.filename){

                    if(part.mime === "image/png"){
                        form.handlePart(part);
                    }else{
                        console.log("Filetype must be .png");
                    }
            
                }else{
                    form.handlePart(part);
                }
            }

            form.on("file", (name, file) =>{

                tempFiles.push(file.path);
                fileNames.push(file.name.toLowerCase());
            });

        }else{

            res.status(200).json({"message": "Only admins can perform this action"});
        }

    });

    

    
}