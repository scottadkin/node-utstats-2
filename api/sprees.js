const mysql = require('./database.js');


class Sprees{

    constructor(){}

    async insertSpree(matchId, playerId, totalKills, startTimestamp, endTimestamp, totalTime, killerId){

        const query = `INSERT INTO nstats_sprees VALUES(NULL,?,?,?,?,?,?,?)`;

        const vars = [matchId, playerId, totalKills, startTimestamp, endTimestamp, totalTime, killerId];

        return await mysql.simpleQuery(query, vars);

    }

    async getMatchData(id){

        const query = "SELECT player,kills,killer,start_timestamp,end_timestamp,total_time FROM nstats_sprees WHERE match_id=?";
        const vars = [id];
        return await mysql.simpleQuery(query, vars);

    }

    async getPlayerMatchData(matchId, playerId){

        const query = "SELECT player,kills,killer,start_timestamp,end_timestamp,total_time FROM nstats_sprees WHERE match_id=? AND (player=? || killer=?)";
        const vars = [matchId, playerId, playerId];
        return await mysql.simpleQuery(query, vars);

    }

    async deletePlayerMatchData(playerId, matchId){

        const query = "DELETE FROM nstats_sprees WHERE match_id=? AND player=?";

        await mysql.simpleQuery(query, [matchId, playerId]);
    }

    async deletePlayer(playerId){

        const query = "DELETE FROM nstats_sprees WHERE player=?";

        await mysql.simpleQuery(query, [playerId]);
    }

    async changePlayerIds(oldId, newId){

        const query = `UPDATE nstats_sprees SET player=? WHERE player=?`;
        const query2 = `UPDATE nstats_sprees SET killer=? WHERE killer=?`;

        await mysql.simpleQuery(query, [newId, oldId]);
        await mysql.simpleQuery(query2, [newId, oldId]);
        
    }
}


module.exports = Sprees;