import Session from '../../api/session';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async (req, res) =>{

    const session = new Session(req);

    await session.load();
    
    if(!session.settings.bLoggedIn){
        res.status(200).json({"message": "Not Logged In"});
        return;
    }

    if(!session.settings.bUploadImages){
        res.status(200).json({"message": "You don't have permission to upload images."});
        return;
    }
    


    const form = formidable.IncomingForm();

    form.uploadDir = "./uploads/";
    form.keepExtensions = false;

    form.parse(req, (err, fields, files) => {

    });

    form.onPart = function (part){

        
        if(part.filename){

            if(part.mine === "image/jpg" || part.mime === "image/jpeg"){
                form.handlePart(part);
            }else{
                console.log("Incorrect file type.");
                res.status(200).json({"message": "Incorrect File type."});
                return;
            }

        }else{
            form.handlePart(part);
        }
    }

    form.on("file", (name, file) =>{

        fs.renameSync(file.path, `./public/images/maps/${file.name.toLowerCase()}.jpg`);
        res.status(200).json({"message": "passed"});
    })

    
}