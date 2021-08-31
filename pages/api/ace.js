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

            if(mode === "player-search"){

                const name = req.body.name || "";
                const ip = req.body.ip || "";
                const hwid = req.body.hwid || "";
                const mac1 = req.body.mac1 || "";
                const mac2 = req.body.mac2 || "";

                const searchResult = await aceManager.playerSearch(name, ip, hwid, mac1, mac2);

                res.status(200).json({"message": "passed", "data": searchResult});
                return;
            }


            console.log(req.body);
            res.status(200).json({"message": "passed"});

        }else{

            res.status(200).json({"error": "You have to be an admin to use this."});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": `Error: "${err.message}"`});
    }
    
}