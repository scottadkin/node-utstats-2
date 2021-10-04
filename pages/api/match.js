import Kills from '../../api/kills';

export default async (req, res) =>{

    const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";


    if(mode === "kills"){

        let matchId = (req.body.matchId !== undefined) ? parseInt(req.body.matchId) : -1;

        if(matchId !== matchId){
            res.status(200).json({"error": "Match is must be a valid integer"});
            return;
        }

        const killManager = new Kills();

        const data = await killManager.getGraphData(matchId);

        res.status(200).json({"data": data});
        return;
    }

    res.status(200).json({"message": "passed"});
}