import mysql from "./database";
import { cleanInt } from "./generic.mjs";

class PlayerSearch{

    constructor(){}


    async defaultSearch(name, page, perPage, country, activeRange, sortBy, order){

        const now = Math.ceil(Date.now() * 0.001);

        activeRange = cleanInt(activeRange, 0, 4);

        const startRanges = {
            "0": 0,
            "1": now - 60 * 60 * 24,
            "2": now - 60 * 60 * 24 * 7,
            "3": now - 60 * 60 * 24 * 28,
            "4": now - 60 * 60 * 24 * 365
        };

        const validSortBy = ["kills", "name","playtime","matches","last","score"];

        const sortIndex = validSortBy.indexOf(sortBy.toLowerCase());

        if(sortIndex === -1){
            throw new Error(`${sortBy} is not a valid sort by option.`);
        }

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

        where += ` AND last>=? AND last<=?`;
        vars.push(startRanges[activeRange], now);

        if(order !== "asc" && order !== "desc") order = "asc";
       

        const totalQuery = `SELECT COUNT(*) as total_matches FROM nstats_player_totals ${where}`;     
        const query = `SELECT id,name,last,country,face,playtime,score,kills,matches FROM nstats_player_totals ${where} ORDER BY ${validSortBy[sortIndex]} ${order.toUpperCase()} LIMIT ?, ?`;     
       
        if(perPage < 5) perPage = 5;
        if(perPage > 100) perPage = 100;

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