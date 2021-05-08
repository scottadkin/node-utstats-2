import formidable from 'formidable';
import fs from 'fs';
import Session from '../../api/session';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async (req, res) =>{


    const session = new Session(req);

    await session.load();

    if(await session.bUserAdmin()){

        const form = new formidable.IncomingForm();

        let tempFiles = [];
        let fileNames = [];

        form.uploadDir = "./uploads/";
        form.keepExtensions = false;

        form.parse(req, (err, fields, files) =>{

            if(err) console.log(err);
        
            console.log(files);
            
            if(fields.single !== undefined){

                let fileName = fields.name.toLowerCase();
                fs.renameSync(tempFiles[0], `./public/images/faces/${fileName}.png`);

            }else{

                for(let i = 0; i < tempFiles.length; i++){

                    fs.renameSync(tempFiles[i], `./public/images/faces/${fileNames[i]}`)
                }

            }
        
        });

        form.onPart = function(part){

            if(part.filename){

                if(part.mime === "image/png"){
                    form.handlePart(part);
                }else{
                    console.log("Incorrect file type");
                }
                
                
            }else{
                form.handlePart(part);
            }
        }

        form.on("file", (name, file) =>{

            tempFiles.push(file.path);
            fileNames.push(file.name);

            
        })



        res.status(200).json({"message": "passed"});

    }else{
        res.status(200).json({"message": "ACCES DENIED"});
    }

}