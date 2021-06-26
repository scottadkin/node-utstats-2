import Session from '../../api/session';
import NexgenStatsViewer from '../../api/nexgenstatsviewer';

export default async (req, res) =>{


    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){


            const nexgen = new NexgenStatsViewer();


            if(req.body.settings !== undefined){

                await nexgen.updateSettings(req.body.settings);

                res.status(200).json({"message": "passed"});
                return;
            }else{

                res.status(200).json({"message": "req.body was empty"});
                return;
            }

            

        }else{
            res.status(200).json({"message": "Only admins can perform this action"});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"message": err});
    }
}