import Session from '../../api/session';
import Matches from '../../api/matches';
import Player from '../../api/player';
import Rankings from '../../api/rankings';

export default async function handler(req, res){

    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const matchManager = new Matches();

            if(req.body.type === "deleteMatch"){

                await matchManager.deleteMatch(parseInt(req.body.matchId));

            }else if(req.body.type === "deletePlayer"){
                
                const playerManager = new Player();

                const rankingManager = new Rankings();
                await rankingManager.init();

                await playerManager.removeFromMatch(
                    
                    parseInt(req.body.playerId),
                    parseInt(req.body.matchId),
                    parseInt(req.body.mapId), 
                    matchManager,
                    rankingManager
                );
                    

            }else{
                res.status(200).json({"message": "Unknown command"});
                return;
            }

            res.status(200).json({"message": "passed"});

        }else{

            res.status(200).json({"message": "Only admins can perform this action."});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": `Error ${err}`})
    }   
}