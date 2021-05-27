import Session from '../../api/session';
import Gametypes from '../../api/gametypes';

export default async (req, res) =>{

    try{
  

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const gametypeManager = new Gametypes();

            console.log(req.body);

            const mode = req.body.mode;

            if(mode === "rename"){

                const newName = req.body.newName;
                const gametypeId = parseInt(req.body.id);


                if(newName.length < 1){
                    res.status(200).json({"message": "Gametype name must be at least 1 characters long."});
                    return;
                }

                if(gametypeId !== gametypeId){
                    res.status(200).json({"message": "Gametype Id must be an integer."});
                    return;
                }

                if(gametypeId < 1){
                    res.status(200).json({"message": "GamtypeId must be a positve integer."});
                    return;
                }


                await gametypeManager.rename(gametypeId, newName);

            }else if(mode === "merge"){

                const oldId = req.body.oldGametypeId;
                const newId = req.body.newGametypeId;

                console.log(`oldgametypeId = ${oldId}`);
                console.log(`newGametypeId = ${newId}`);

                if(oldId === -1){

                    res.status(200).json({"message": "You have not selected a gametype to be merged."});
                    return;
                }

                if(newId === -1){
                    res.status(200).json({"message": "You have not selected a target gametype."});
                    return;
                }

                if(newId < 1 || oldId < 1){
                    res.status(200).json({"message": "Selected gametype ids must be a positive integer."});
                    return;
                }
                


                await gametypeManager.merge(oldId, newId);
                
            }

            res.status(200).json({"message": "passed"});
        }else{
            res.status(200).json({"message": "Only admins can perform this action."});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"message": err});
    }

    
}