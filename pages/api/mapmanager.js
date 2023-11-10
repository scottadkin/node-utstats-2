import Session from '../../api/session';
import Maps from '../../api/maps';

export default async function handler(req, res){

    try{

        const session = new Session(req);

        if(await session.bUserAdmin()){

            const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : null;

            const mapManager = new Maps();

            if(mode !== null){

                if(mode === "allimages"){

                    const data = mapManager.getAllUploadedImages();

                    res.status(200).json({"data": data});
                    return;

                }
                
                if(mode === "allnames"){

                    const data = await mapManager.getAllNames();

                    res.status(200).json({"data": data});
                    return;
                }

                if(mode === "alldetails"){

                    const data = await mapManager.getAll();

                    const names = data.map((d) =>{
                        return d.name;
                    });

                    names.sort();

                    res.status(200).json({"names": names, "data": data});
                    return;
                }
                

            }else{

                res.status(200).json({"error": "No action specified"});
                return;
            }

        }else{

            res.status(200).json({"error": "Only admins can perform this action"});
            return;
        }

    }catch(err){
        console.trace(err);

        res.status(200).json({"error": err});
    }
}