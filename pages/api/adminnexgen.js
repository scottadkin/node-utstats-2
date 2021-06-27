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

            }else if(req.body.mode === "create"){

                if(req.body.data !== undefined){

                    const data = req.body.data;

                    if(data.title === undefined) data.title = "NO TITLE";
                    if(data.type === undefined) data.type = 0;
                    if(data.gametype === undefined) data.gametype = 0;
                    if(data.position === undefined) data.position = 0;
                    if(data.enabled === undefined) data.enabled = 1;

                    if(data.title.length === 0) data.title = "NO TITLE";
                    if(parseInt(data.type) !== parseInt(data.type)) data.type = 0;
                    if(parseInt(data.type) < 0) data.type = 0;
                    if(parseInt(data.gametype) !== parseInt(data.gametype)) data.gametype = 0;
                    if(parseInt(data.gametype) < 0) data.gametype = 0;
                    if(parseInt(data.position) !== parseInt(data.position)) data.position = 9999;
                    

                    const id = await nexgen.createList(data);

                    if(id < 0){
                        res.status(200).json({"message": "Failed to insert data, insertId is -1"});
                        return;
                    }

                    res.status(200).json({"message":"passed", "insertId": id});
                    return;

                }else{
                    res.status(200).json({"message": "req.body.data is undefined"});
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