import { simpleQuery } from "../../../api/database.js";
import { cleanInt, toMysqlDate } from "../../../api/generic.mjs";

export default class PlayerSearch{

    constructor(){}


    getSearchStartTimestampRange(activeRange){

        const now = Date.now();
  
        activeRange = cleanInt(activeRange, 0, 4);

        const startRanges = {
            "0": now - Number.MAX_SAFE_INTEGER,
            "1": now - 60 * 60 * 24 * 1000,
            "2": now - 60 * 60 * 24 * 7 * 1000,
            "3": now - 60 * 60 * 24 * 28 * 1000,
            "4": now - 60 * 60 * 24 * 365 * 1000
        };


        let min = (startRanges[activeRange] !== undefined) ? startRanges[activeRange] : startRanges[0];
        if(min < 0) min = 0;


        return {"minTimestamp": toMysqlDate(min), "maxTimestamp": toMysqlDate(now)};
    }

    createSearchQuery(name, page, perPage, country, activeRange, sortBy, order, bOnlyCount){

        if(bOnlyCount === undefined) bOnlyCount = false;

        const validSortBy = ["kills", "name", "playtime", "matches", "last", "score"];

        const sortIndex = validSortBy.indexOf(sortBy.toLowerCase());

        if(sortIndex === -1){
            throw new Error(`${sortBy} is not a valid sort by option.`);
        }

        const {minTimestamp, maxTimestamp} = this.getSearchStartTimestampRange(activeRange);

        const vars = [];

        let where = "WHERE nstats_player_totals.playtime>0 AND nstats_player_totals.gametype=0 AND nstats_player_totals.map=0";

        if(name !== ""){
            where += ` AND nstats_player.name LIKE ?`;
            vars.push(`%${name}%`);
        }

        if(country !== ""){
            where += ` AND nstats_player.country=?`;
            vars.push(country);
        }

        where += ` AND nstats_player_totals.last>=? AND nstats_player_totals.last<=?`;
        vars.push(minTimestamp, maxTimestamp);

        if(order !== "asc" && order !== "desc") order = "asc";

        const normalSelect = `SELECT nstats_player.id,
        nstats_player.name,
        nstats_player.country,
        nstats_player.face,
        nstats_player_totals.last,
        nstats_player_totals.playtime,
        nstats_player_totals.score,
        nstats_player_totals.kills,
        nstats_player_totals.matches `;
        const countSelect = `SELECT COUNT(*) as total_matches `;

        const limit = (!bOnlyCount) ? `LIMIT ?, ?` : "";


        const query = `${(bOnlyCount) ? countSelect : normalSelect} 
        FROM nstats_player 
        INNER JOIN nstats_player_totals ON nstats_player_totals.player_id = nstats_player.id
        ${where} ORDER BY ${validSortBy[sortIndex]} ${order.toUpperCase()} ${limit}`; 



        console.log(query);

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
