import Kills from '../../api/kills';

export default async function handler(req, res){

    const body = (req.body !== undefined) ? req.body : null;

    if(body === null){
        res.status(200).json({"error": "req.body is null"});
        return;
    }

    if(body.mode === undefined) return;

    const mode = body.mode.toLowerCase();

    let id = (body.id !== undefined) ? parseInt(body.id) : -1;

    id = (id !== id) ? -1 : id;

    const k = new Kills();

    if(mode === "matchupalt"){

        const data = await k.getKillsMatchUp(id); 

        res.status(200).json({"data": data});
        return;
    }

    res.status(200).json({"message": "Passed"});

}