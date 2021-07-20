import formidable from "formidable";
import Session from '../../api/session';
import fs from 'fs';


export const config = {
    api:{
        bodyParser:false
    },
};

export default async (req, res) =>{

    try{


        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){


            const reg = /^.+\.(.+)$/i;

            const form = new formidable.IncomingForm();
            form.uploadDir = "./uploads";
            form.keepExtensions = false;

            let fileSingleName = null;
            let filePath = "";

            const filePaths = [];
            const fileNames = [];

            form.parse(req, (err, fields, files) =>{

                if(err) console.trace(err);
               // console.log(fields, files);

                if(fields.mode !== undefined){

                    if(fields.mode === "single"){
                        
                        if(fields.fileName !== undefined){
                            fileSingleName = fields.fileName;
                        }
                    }
                }
            });

            form.onPart = function (part){

                if(part.filename){

                    const result = reg.exec(part.filename);

                    if(result !== null){

                        if(result[1].toLowerCase() === "jpg" || result[1].toLowerCase() === "jpeg"){

                            if(part.mime === "image/jpeg"){
                                form.handlePart(part);
                            }else{
                                console.log(`Wrong file mime type`);
                            }

                        }else{
                            console.log(`Invalid file extension`);
                        }

                    }else{

                        console.log(`reg expression failed to match`);
                    }

                }else{
                    form.handlePart(part);
                }
            }

            form.on("file", (name, file) =>{

                filePath = file.path;

                filePaths.push(file.path);
                fileNames.push(file.name);
            });

            form.once("end", () =>{

                if(fileSingleName !== null){
                    fs.renameSync(filePath, `./public/images/gametypes/${fileSingleName}.jpg`);
                }else{

                    for(let i = 0; i < filePaths.length; i++){

                        fs.renameSync(filePaths[i],`./public/images/gametypes/${fileNames[i].replace(/ /ig, "").toLowerCase()}` );
                    }
                }
            });

            res.status(200).json({"message": "passed"});

        }else{

            res.status(200).json({"message": "Only admins can perform this action."});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"message": err});
    }
}