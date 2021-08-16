import mysql from './database';

class Maps{

    constructor(){};

    async getMostPlayed(page, perPage, order){

        let orderDirection = "ASC";
        if(order === "d") orderDirection = "DESC"; 

        const query = `SELECT mapfile, MIN(time) as first_match, MAX(time) as last_match, SUM(gametime) as gametime, 
            COUNT(*) as total_matches, AVG(gametime) as average_gametime
            FROM uts_match GROUP BY(mapfile) ORDER BY total_matches ${orderDirection} LIMIT ?, ?`;

        let start = page * perPage;
        if(start !== start) start = 0;
        if(start < 0) start = 0;

        return await mysql.simpleQuery(query, [start, perPage]);
    }

    async getOrderedBy(mode, page, perPage, order){


        let orderDirection = "ASC";
        if(order === "d") orderDirection = "DESC"; 

        mode = mode.toLowerCase();

        const validTypes = ["name", "first", "last", "avglength", "playtime", "matches"];
        const colNames = ["mapfile", "first_match", "last_match", "average_gametime", "gametime", "total_matches"];

        const index = validTypes.indexOf(mode);

        if(index === -1) return [];

        const query = `SELECT mapfile, MIN(time) as first_match, MAX(time) as last_match, SUM(gametime) as gametime, 
            COUNT(*) as total_matches, AVG(gametime) as average_gametime
            FROM uts_match GROUP BY(mapfile) ORDER BY ${colNames[index]} ${orderDirection} LIMIT ?, ?`;


        let start = page * perPage;
        if(start !== start) start = 0;
        if(start < 0) start = 0;

        return await mysql.simpleQuery(query, [start, perPage]);
    }



    async getTotalMaps(){

        const query = "SELECT COUNT(DISTINCT mapfile) as total_maps FROM uts_match";

        const result = await mysql.simpleQuery(query);

        return result[0].total_maps;
    }

}

export default Maps;