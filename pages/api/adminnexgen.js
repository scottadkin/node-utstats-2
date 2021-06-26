import Session from '../../api/session';
import NexgenStatsViewer from '../../api/nexgenstatsviewer';

export default async (req, res) =>{


    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){


            const nexgen = new NexgenStatsViewer();


            if(req.body.mode === "update"){

                if(req.body.settings !== undefined){

                    const result = await nexgen.updateSettings(req.body.settings);

                    if(result === true){
                        res.status(200).json({"message": "passed"});
                    }else{
                        res.status(200).json({"message": result});
                    }

                    return;

                }else{

                    res.status(200).json({"message": "req.body.settings was empty"});
                    return;
                }

            }else if(req.body.mode === "delete"){


                if(req.body.id !== undefined){

                    const passed = await nexgen.deleteList(parseInt(req.body.id));

                    if(passed){
                        res.status(200).json({"message": "passed"});
                    }else{
                        res.status(200).json({"message": "The row wasn't deleted"});
                    }

                    return;

                }else{
                    res.status(200).json({"message": "req.body.id is undefined"});
                    return;
                }

            }

            res.status(200).json({"message": "Unknown command"});

        }else{
            res.status(200).json({"message": "Only admins can perform this action"});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"message": err});
    }
}