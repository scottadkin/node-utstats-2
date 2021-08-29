import Session from '../../api/session';
import ACE from '../../api/ace';

export default async(req, res) =>{

    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const aceManager = new ACE();

            let mode = req.body.mode;

            if(mode === undefined){
                res.status(200).json({"error": "No mode specified."});
                return;
            }

            mode = mode.toLowerCase();

            console.log(mode);

            if(mode === "home-kicks"){

                const data = await aceManager.getHomeRecentKicks();

                res.status(200).json({"data": data});
                return;
            }


            console.log(req.body);
            res.status(200).json({"message": "passed"});

        }else{

            res.status(200).json({"error": "You have to be an admin to use this."});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": err});
    }
    
}