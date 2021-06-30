import formidable from "formidable";
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async (req, res) =>{

    const form = new formidable.IncomingForm();
    form.uploadDir = "./uploads";
    form.keepExtensions = false;

    const fileNames = [];
    const tempFiles = [];

    form.parse(req, (err, fields, files) =>{

        if(err) console.log(err);

        console.log(fields);
        console.log(files);


        if(fields.single !== undefined){
            fs.renameSync(tempFiles[0], `./public/images/monsters/${fields.fileName}.png`);
        }
      
        console.log(fileNames);
        console.log(tempFiles);
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
        fileNames.push(file.name);
    });

    res.status(200).json({"message": "passed"});
}