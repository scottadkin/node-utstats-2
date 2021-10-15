import formidable from 'formidable';
import fs from 'fs';
import Session from '../../api/session';
import Jimp from 'jimp';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default (req, res) =>{

    return new Promise(async (resolve, reject) =>{

        const VALID_FILE_TYPES = [".jpg", ".jpeg"];
        const VALID_MIME_TYPES = ["image/jpg", "image/jpeg"];
        const FULLSIZE_DIR = "./public/images/maps/";
        const THUMBS_DIR = "./public/images/maps/thumbs/";


        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const form = new formidable.IncomingForm();

            const errors = [];

            form.uploadDir = "./uploads";
            //form.maxFileSize = (1024 * 1024) * 5;

            form.parse(req, (err, fields, files) =>{



            });

            form.on('file', async (name, file) => {
                

                await Jimp.read(file.path)
                .then((file) =>{

                    return file
                    .quality(85)
                    .resize(480, 270)
                    .write(`${THUMBS_DIR}${name}`)

                }).catch((err) =>{
                    console.trace(err);
                    errors.push(err);
                })


                await Jimp.read(file.path)
                .then((file) =>{

                    return file
                    .quality(85)
                    .write(`${FULLSIZE_DIR}${name}`)

                }).catch((err) =>{
                    errors.push(errors);
                    console.trace(err);
                }); 

                try{
                    fs.unlinkSync(file.path);

                }catch(err){

                    console.trace(err);
                    errors.push(err);
                }

                if(errors.length === 0){
                    res.status(200).json({"message": "file uploaded"});
                }else{
                    res.status(200).json({"errors": errors});
                }

                resolve();
            });

        }else{
            res.status(200).json({"errors": ["Access Denied"]});
            resolve();
        }

    });
    
}