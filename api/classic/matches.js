import mysql from './database';

class Matches{

    constructor(){

    }


    async getLatestMatches(page, perPage){

        page = parseInt(page);
        perPage = parseInt(perPage);

        if(page !== page) page = 1;
        if(perPage !== perPage) perPage = 25;

        page--;

        if(page < 0){ page = 0; }
        if(perPage <= 0) perPage = 25;

        const start = page * perPage;

        const query = `SELECT id,time,gamename,gametime,mapfile,teamgame,ass_att,ass_win,t0,t1,t2,t3,t0score,t1score,t2score,t3score 
        FROM uts_match ORDER BY time DESC LIMIT ?,?`;


        const matches = await mysql.simpleQuery(query, [start, perPage]);

        for(let i = 0; i < matches.length; i++){

            matches[i].players = await this.getMatchPlayerCount(matches[i].id);

            matches[i].result = this.createMatchResult(matches[i]);
        }

        return matches;
    }

    async getMatchPlayerCount(id){

        const query = "SELECT COUNT(*) as players FROM uts_player WHERE matchid=?";

        const result = await mysql.simpleQuery(query, [id]);

        return result[0].players;
    }

    createMatchResult(matchData){

        const teamGame = matchData.teamgame.toLowerCase();

        if(teamGame === "true"){

            const teamScores = [];

            for(let i = 0; i < 4; i++){
                if(matchData[`t${i}`]) teamScores.push(matchData[`t${i}score`]);
            }

            return teamScores;

        }

        return null;
    }

}

export default Matches;