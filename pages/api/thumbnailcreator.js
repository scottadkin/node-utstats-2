import Session from '../../api/session';
import Jimp from 'jimp';
import Maps from '../../api/maps';

const createThumbnail = (url, fileName) =>{

    return new Promise((resolve, reject) =>{

        Jimp.read(url)
        .then(file =>{
            return file
            .resize(480, 270)
            .quality(85)
            .write(`./public/images/maps/thumbs/${fileName}`);
        }).catch((err) =>{
            console.trace(err);
        }).finally(() =>{

            resolve();
        });
    });
}

export default (req, res) =>{

    return new Promise(async (resolve, reject) =>{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : null;

            if(mode === null){

                res.status(200).json({"error": "No mode specified"});
                resolve();
                return;
            }

            const mapManager = new Maps();

            if(mode === "missingthumbnails"){

                const data = mapManager.getMissingThumbnails();

                res.status(200).json({"data": data});
                resolve();
                return;

            }else if(mode === "createmissingthumbnail"){

                const file = (req.body.file !== undefined) ? req.body.file : null;
             
                if(file !== null){
                    await createThumbnail(`./public/images/maps/${file}`, file);
                }else{
                    res.status(200).json({"error": "No file specified"});
                    resolve();
                    return;
                }

                res.status(200).json({"message": "pass"});
                resolve();
                return;
                
            }

            res.status(200).json({"error": "Unknown command"});
            resolve();
            return;

        }else{

            res.status(200).json({"error": "Only admins can perform this action."});
            resolve();
        }
    });
}