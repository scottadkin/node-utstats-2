import Session from '../../api/session';

export default async (req, res) =>{

    try{


        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            let gametypeId = parseInt(req.body.gametypeId);
            let mode = req.body.mode;

            if(gametypeId === gametypeId){


                if(gametypeId > 0){

                    console.log(`gametypeId = ${gametypeId}, mode = ${mode}`);
                    res.status(200).json({"message": "passed"});
                    return;

                }else{

                    res.status(200).json({"message": "Gametype must be a positive integer."});
                }

            }else{

                res.status(200).json({"message": "Gametype must a valid integer."});
            }

        }else{

            res.status(200).json({"message": "Only admins can perform this action"});
        }


    }catch(err){
        console.trace(err);
        res.status(200).json({"message": `Error: ${err}`})
    }
}