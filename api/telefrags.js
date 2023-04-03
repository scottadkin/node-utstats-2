const mysql = require("./database");

class Telefrags{

    constructor(){}


    async getMatchData(matchId){

        const query = `SELECT timestamp,killer_id,killer_team,victim_id,victim_team,disc_kill 
        FROM nstats_tele_frags WHERE match_id=? ORDER BY timestamp ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    async getPlayerMatchKills(matchId, targetPlayerId){

        const query = `SELECT timestamp,killer_id,killer_team,victim_id,victim_team,disc_kill 
        FROM nstats_tele_frags WHERE match_id=? 
        AND (killer_id=? || victim_id=?)`;

        return await mysql.simpleQuery(query, [matchId, targetPlayerId, targetPlayerId]);
    }
}

module.exports = Telefrags;