import formidable from 'formidable';
import Session from '../../api/session';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async(req, res) =>{


    const session = new Session(req);

    await session.load();

    if(await session.bUserAdmin()){

        const files = [];
        const TARGET_DIR = "./public/images/weapons/"

        const form = new formidable.IncomingForm({
            "uploadDir": "./uploads",
            "keepExtensions": false,
            "multiples": true
        });

        form.parse(req, (err, fields, files) =>{

            //console.log(files);
            console.log(fields);

            if(err){
                res.status(200).json({"message": err});
                return;
            }else{
                
                console.log(fields);
            }
        });

        form.onPart =  function(part){



            if(part.filename){

                if(part.mime === "image/png"){
                    form.handlePart(part);
                }

            }else{
                form.handlePart(part);
            }
        };

        form.on("file", (name, file) =>{

           // console.log(name);
            //console.log(file);

            let newName = file.name;

            newName = newName.replace(/ /ig, "");

            files.push({
                "path": file.path,
                "name": newName.toLowerCase()
            });

            console.log(files);
        });


        form.on("end", () =>{

            for(let i = 0; i < files.length; i++){

                fs.renameSync(files[i].path, `${TARGET_DIR}${files[i].name}`);
                
            }

            res.status(200).json({"message": "passed"});
        });

        

    }else{

        res.status(200).json({"message": "Only admins can perform this action."});
    }
}