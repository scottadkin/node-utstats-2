import Session from '../../api/session';
import Rankings from '../../api/rankings';

export default async function handler(req, res){

    try{


        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const rankingManager = new Rankings();
            await rankingManager.init();

            let gametypeId = parseInt(req.body.gametypeId);
            let mode = req.body.mode;

            console.log(mode);

            if(mode === "values"){

                const values = req.body.data;

                if(values !== undefined){

                    for(let i = 0; i < values.length; i++){

                        const v = values[i];
                        await rankingManager.updateEvent(v.id, v.description, v.value);
                    }

                    res.status(200).json({"message": "passed"});

                }else{
                    res.status(200).json({"message": "Values are not set"});
                }

                

            }else{

                mode = parseInt(mode);

                if(mode === mode){

                    if(gametypeId === gametypeId){


                        if(gametypeId > 0){

                            if(mode === 0){

                                const data = await rankingManager.recalculateGametypeRankings(gametypeId);

                                res.status(200).json({"message": "passed", "result": data});
                                return;

                            }else if(mode === 1){

                                const data = await rankingManager.deleteGametype(gametypeId);

                                res.status(200).json({"message": "passed", "result": data});
                                return;
                            }


                           

                        }else{
                            res.status(200).json({"message": "Gametype must be a positive integer."});
                        }

                    }else{
                        res.status(200).json({"message": "Gametype must a valid integer."});
                    }

                }else{
                    res.status(200).json({"message": "Mode must be a valid interger."});
                }
            }

        }else{

            res.status(200).json({"message": "Only admins can perform this action"});
        }


    }catch(err){
        console.trace(err);
        res.status(200).json({"message": `Error: ${err}`})
    }
}