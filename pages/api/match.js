import Kills from '../../api/kills';
import CTF from '../../api/ctf';

export default async (req, res) =>{

    const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";
    const matchId = (req.body.matchId !== undefined) ? parseInt(req.body.matchId) : -1;

    if(mode === "kills"){

        if(matchId !== matchId){
            res.status(200).json({"error": "Match id must be a valid integer"});
            return;
        }

        const players = req.body.players || {};

        const killManager = new Kills();

        const data = await killManager.getGraphData(matchId, players);


        res.status(200).json({"data": data});
        return;

    }else if(mode === "ctfevents"){

        const ctfManager = new CTF();

        if(matchId !== matchId){
            res.status(200).json({"error": "Match id must be a valid integer"});
            return;
        }

        const data = await ctfManager.getMatchEvents(matchId);

        res.status(200).json({"data": data});
        return;

    }

    res.status(200).json({"message": "passed"});
}