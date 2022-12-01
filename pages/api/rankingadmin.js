import Session from '../../api/session';
import Rankings from '../../api/rankings';
import Gametypes from '../../api/gametypes';

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

                const data = await rankingManager.getDetailedSettings();

                res.status(200).json({"values": data});

                return;
                

            }else if(mode === "change"){
                
                const data = req.body.data ?? null;

                if(data === null){
                    res.status(200).json({"error": "No data was found to be changed."});
                    return;
                }

                if(!Array.isArray(data)){
                    res.status(200).json({"error": "Data must be an array."});
                    return;
                }

                const messages = [];

                for(let i = 0; i < data.length; i++){

                    const d = data[i];

                    if(await rankingManager.updateEvent(d.name, d.display_name, d.description, d.value)){
                        messages.push(`Updated event ${d.name}.`);
                    }else{
                        messages.push(`Failed to update event ${d.name}.`);
                    }
                }

                res.status(200).json({"message": "passed", "results": messages});
                return;
                
            }else{

                mode = parseInt(mode);

                if(mode === mode){

                    if(gametypeId === gametypeId){


                        if(gametypeId > 0){

                            if(mode === 0){

                                const gametypeManager = new Gametypes();

                                const data = await rankingManager.recalculateGametypeRankings(gametypeManager, gametypeId);

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