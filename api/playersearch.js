import mysql from "./database";
import { cleanInt } from "./generic.mjs";

class PlayerSearch{

    constructor(){}


    async defaultSearch(name, page, perPage, country){


        console.log(`name = ${name}`);
        const vars = [];

        let where = "WHERE playtime>0 AND player_id=0 AND gametype=0";

        if(name !== ""){
            where += ` AND name LIKE ?`;
            vars.push(`%${name}%`);
        }

        if(country !== ""){
            where += ` AND country=?`;
            vars.push(country);
        }

        const totalQuery = `SELECT COUNT(*) as total_matches FROM nstats_player_totals ${where}`;     
        const query = `SELECT id,name,last,country,face,playtime FROM nstats_player_totals ${where} LIMIT ?, ?`;     
       
        
        if(perPage < 5) perPage = 5;

        let start = page * perPage;
        if(start !== start) start = 0;
        if(start < 0) start = 0;


        vars.push(start, perPage);

        const totalResult = await mysql.simpleQuery(totalQuery, vars);
        const result = await mysql.simpleQuery(query, vars);


        return {
            "totalMatches": totalResult[0].total_matches,
            "data": result
        };

    }
}

export default PlayerSearch;