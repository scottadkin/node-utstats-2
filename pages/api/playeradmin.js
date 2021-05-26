import Session from '../../api/session';
import Players from '../../api/players';
import Matches from '../../api/matches';

export default async (req, res) =>{

    const session = new Session(req);

    await session.load();

    if(session.settings.bLoggedIn){

        if(session.settings.bAdmin){

            const playerManager = new Players();

            if(req.body.type === "nameChange"){

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
                return;

            }else if(req.body.type === "mergePlayers"){


                console.log("merge players");

                if(req.body.first !== undefined && req.body.second !== undefined){

                    if(req.body.first !== "" && req.body.second !== ""){

                        const first = parseInt(req.body.first);
                        const second = parseInt(req.body.second);


                        const matchManager = new Matches();

                        await playerManager.mergePlayers(first, second, matchManager);
                        res.status(200).json({"message": "passed"});
                        return;

                        

                    }else{
                        res.status(200).json({"message": "First name or second name is a empty string"});
                        return;
                    }

                }else{

                    res.status(200).json({"message": "First name or second name is undefined"});
                    return;
                }

            }else if(req.body.type === "deletePlayer"){

                let playerId = parseInt(req.body.playerId);

                const matchManager = new Matches();

                await playerManager.deletePlayer(playerId, matchManager);

                res.status(200).json({"message": "passed"})
            }

            
        }else{
            res.status(200).json({"message": "Only admins can perform this action."});
        }

    }else{
        res.status(200).json({"message": "You are not logged in."});
    }
}