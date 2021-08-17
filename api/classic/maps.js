import mysql from './database';
import Matches from './matches';

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

    async getStats(mapFile){

        mapFile = `${mapFile}.unr`;

        const query = `SELECT MIN(time) as first_match, MAX(time) as last_match, SUM(gametime) as gametime, 
        COUNT(*) as total_matches, AVG(gametime) as average_gametime, SUM(frags) as total_frags, SUM(kills) as total_kills,
        SUM(suicides) as total_suicides, SUM(teamkills) as total_teamkills, MAX(gametime) as longest_match,
        MAX(kills) as most_kills, MAX(suicides) as most_suicides, MAX(teamkills) as most_teamkills,
        SUM(t0score) as red_total_score, SUM(t1score) as blue_total_score, SUM(t2score) as green_total_score,
        SUM(t3score) as yellow_total_score, MAX(t0score) as red_max_score, MAX(t1score) as blue_max_score,
        MAX(t2score) as green_max_score, MAX(t3score) as yellow_max_score,
        MAX(t0) as red_team, MAX(t1) as blue_team, MAX(t2) as green_team, MAX(t3) as yellow_team
        FROM uts_match WHERE mapfile=?`;

        const result = await mysql.simpleQuery(query, [mapFile]);

        if(result.length > 0){
            return result[0];
        }

        return null;
    }


    async getRecentMatches(map, page, perPage){

        const query = `SELECT id,time,servername,gamename,gametime,teamgame,t0,t1,t2,t3,t0score,t1score,t2score,t3score
         FROM uts_match WHERE mapfile=? ORDER by time DESC LIMIT ?, ?`;

        let start = page * perPage;
        if(start !== start) start = 0;
        if(start < 0) start = 0;

        const result = await mysql.simpleQuery(query, [map, start, perPage]);

        const matchManager = new Matches();

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            r.result = await matchManager.createMatchResult(r);
            r.players = await matchManager.getMatchPlayerCount(r.id);
        }


        return result;
        
    }

}

export default Maps;