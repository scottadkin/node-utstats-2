import Kills from '../../api/kills';
import CTF from '../../api/ctf';
import Sprees from '../../api/sprees';

export default async (req, res) =>{

    try{

        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";
        const matchId = (req.body.matchId !== undefined) ? parseInt(req.body.matchId) : -1;
        const playerId = (req.body.playerId !== undefined) ? parseInt(req.body.playerId) : -1;

        if(mode === "kills"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const players = req.body.players || {};
            const teams = req.body.teams || 0;

            const killManager = new Kills();

            const data = await killManager.getGraphData(matchId, players, teams);


            res.status(200).json({"data": data});
            return;

        }else if(mode === "ctfevents"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const ctfManager = new CTF();

            const players = req.body.players || {};
            const teams = req.body.teams || 0;

            const data = await ctfManager.getEventGraphData(matchId, players, teams);

            res.status(200).json({"data": data});
            return;

        }else if(mode === "ctfcaps"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const ctfManager = new CTF();

            const data = await ctfManager.getMatchCaps(matchId);

            res.status(200).json({"data": data});
            return;

        }else if(mode === "sprees"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const spreeManager = new Sprees();

            let data = [];

            if(playerId === -1){
                data = await spreeManager.getMatchData(matchId);
            }else{
                data = await spreeManager.getPlayerMatchData(matchId, playerId);
            }

            res.status(200).json({"data": data});
            return;

        }

        res.status(200).json({"message": "passed"});

    }catch(err){

        res.status(200).json({"error": err.name});

    }
  
}