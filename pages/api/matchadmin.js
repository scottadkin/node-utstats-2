import Session from '../../api/session';
import Matches from '../../api/matches';
import Player from '../../api/player';
import Players from '../../api/players';
import Rankings from '../../api/rankings';

export default async function handler(req, res){

    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const matchManager = new Matches();

            if(req.body.type === "deleteMatch"){

                await matchManager.deleteMatch(parseInt(req.body.matchId));
                res.status(200).json({"message": "passed"});
                return;

            }else if(req.body.type === "deletePlayer"){
                
                const playerManager = new Player();

                const rankingManager = new Rankings();
                await rankingManager.init();

                const playerId = (req.body.playerId !== undefined) ? parseInt(req.body.playerId) : -1;
                const matchId = (req.body.matchId !== undefined) ? parseInt(req.body.matchId) : -1;
                const mapId = (req.body.mapId !== undefined) ? parseInt(req.body.mapId) : -1;
                const gametypeId = (req.body.gametypeId !== undefined) ? parseInt(req.body.gametypeId) : -1;

                await playerManager.removeFromMatch(
                    playerId,
                    matchId,
                    mapId,
                    matchManager
                );

                const playersManager = new Players();

                await rankingManager.deletePlayerFromMatch(playersManager, playerId, matchId, gametypeId, true);
                    
                res.status(200).json({"message": "passed"});
                return;
            }

            res.status(200).json({"error": "Unknown Command"});
            return;

            

        }else{

            res.status(200).json({"message": "Only admins can perform this action."});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": `Error ${err}`})
    }   
}