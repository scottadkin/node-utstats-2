import { simpleQuery } from "./database.js";
import { cleanInt } from "./generic.mjs";

export default class PlayerSearch{

    constructor(){}


    getSearchStartTimestampRange(activeRange){

        const now = Math.ceil(Date.now() * 0.001);

        activeRange = cleanInt(activeRange, 0, 4);

        const startRanges = {
            "0": 0,
            "1": now - 60 * 60 * 24,
            "2": now - 60 * 60 * 24 * 7,
            "3": now - 60 * 60 * 24 * 28,
            "4": now - 60 * 60 * 24 * 365
        };

        if(startRanges[activeRange] !== undefined){
            return {"minTimestamp": startRanges[activeRange], "maxTimestamp": now};
        }

        return {"minTimestamp": startRanges[0], "maxTimestamp": now};
    }

    createSearchQuery(name, page, perPage, country, activeRange, sortBy, order, bOnlyCount){


        if(bOnlyCount === undefined) bOnlyCount = false;

        const validSortBy = ["kills", "name","playtime","matches","last","score"];

        const sortIndex = validSortBy.indexOf(sortBy.toLowerCase());

        if(sortIndex === -1){
            throw new Error(`${sortBy} is not a valid sort by option.`);
        }

        const {minTimestamp, maxTimestamp} = this.getSearchStartTimestampRange(activeRange);

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
        vars.push(minTimestamp, maxTimestamp);

        if(order !== "asc" && order !== "desc") order = "asc";

        const normalSelect = `SELECT id,name,last,country,face,playtime,score,kills,matches `;
        const countSelect = `SELECT COUNT(*) as total_matches `;

        const limit = (!bOnlyCount) ? `LIMIT ?, ?` : "";


        const query = `${(bOnlyCount) ? countSelect : normalSelect} 
        FROM nstats_player_totals ${where} ORDER BY ${validSortBy[sortIndex]} ${order.toUpperCase()} ${limit}`; 

        if(!bOnlyCount){
            perPage = cleanInt(perPage, 1, 100);

            let start = page * perPage;

            if(start !== start) start = 0;
            if(start < 0) start = 0;

            vars.push(start, perPage);
        }
        

        return {
            "query": query,
            vars
        };
    }

    async defaultSearch(name, page, perPage, country, activeRange, sortBy, order){

        const normalQuery = this.createSearchQuery(name, page, perPage, country, activeRange, sortBy, order, false);
        const totalQuery = this.createSearchQuery(name, page, perPage, country, activeRange, sortBy, order, true);

        const normalResult = await simpleQuery(normalQuery.query, normalQuery.vars);
        const totalResult = await simpleQuery(totalQuery.query, totalQuery.vars);

        return {
            "totalMatches": totalResult[0].total_matches,
            "data": normalResult
        };
    }

    async getTotalMatches(name, page, perPage, country, activeRange, sortBy, order){

        const totalQuery = this.createSearchQuery(name, page, perPage, country, activeRange, sortBy, order, true);

        const totalResult = await simpleQuery(totalQuery.query, totalQuery.vars);

        return totalResult[0].total_matches;
    }
}
