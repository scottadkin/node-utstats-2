import PlayerSearch from "../../api/playersearch";
import { cleanInt } from "../../api/generic.mjs";

export default async function handler(req, res){

    try{

        //let players = await Manager.getPlayers(page, perPage, sortType, order, name);
    //let players = await Manager.debugGetAll();
    //let totalPlayers = await Manager.getTotalPlayers(name);

        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";

        if(mode === ""){
            res.status(200).json({"error": "No search mode was specified."});
            return;
        }

        const name = (req.body.name !== undefined) ? req.body.name.toLowerCase() : "";
        const country = (req.body.country !== undefined) ? req.body.country.toLowerCase() : "";
        const active = (req.body.active !== undefined) ? parseInt(req.body.active) : 0;

        let page = (req.body.page !== undefined) ? req.body.page : 1;

        console.log(page);

        if(page !== page){
            page = 1;
        }

        page--;
        if(page < 0) page = 0;

        let perPage = (req.body.perPage !== undefined) ? cleanInt(req.body.perPage, 5, 100) : 25;

        console.log(`perPage = ${perPage}`);

        const p = new PlayerSearch();

        const searchResult = await p.defaultSearch(name, page, perPage, country);

        res.status(200).json(searchResult);
        return;

        console.log(req.body);
        console.log(mode, name, country, active);

        res.status(200).json({"error": "Unknown Command"});
        return;
    }catch(err){
        res.status(200).json({"error": err.toString()});
    }
}