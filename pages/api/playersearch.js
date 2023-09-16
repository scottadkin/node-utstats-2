import PlayerSearch from "../../api/playersearch";

export default async function handler(req, res){

    try{

        //let players = await Manager.getPlayers(page, perPage, sortType, order, name);
    //let players = await Manager.debugGetAll();
    //let totalPlayers = await Manager.getTotalPlayers(name);

        const p = new PlayerSearch();

        await p.defaultSearch(0,0,0,0);

        console.log(req.body);

        res.status(200).json({"error": "Unknown Command"});
        return;
    }catch(err){
        res.status(200).json({"error": err.toString()});
    }
}