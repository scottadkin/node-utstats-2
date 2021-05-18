import Session from '../../api/session';
import Players from '../../api/players';

export default async (req, res) =>{

    const session = new Session(req);

    await session.load();

    if(session.settings.bLoggedIn){

        if(session.settings.bAdmin){

            const playerManager = new Players();

            if(req.body.new !== undefined && req.body.old !== undefined){

                let newName = req.body.new;
                let oldName = req.body.old;

                if(newName !== "" && oldName !== ""){

                    if(newName !== oldName){
                        
                        if(!await playerManager.bNameInUse(newName)){
                            await playerManager.renamePlayer(oldName, newName);
                        }else{
                            
                            res.status(200).json({"message": "Name already in use"});
                            return;
                        }
                    }

                }else{

                    res.status(200).json({"message": "New name or old name is an empty string"});
                }

            }else{
                res.status(200).json({"message": "New name or old name is undefined."});
            }
            

            res.status(200).json({"message": "passed"});
        }else{
            res.status(200).json({"message": "Only admins can perform this action."});
        }

    }else{
        res.status(200).json({"message": "You are not logged in."});
    }
}