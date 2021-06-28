const mysql = require('./database');

class MonsterHunt{

    constructor(){

    }

    async updatePlayerMatchData(matchId, playerId, kills, bestKillsInLife){

        const query = "UPDATE nstats_player_matches SET mh_kills=?,mh_kills_best_life=? WHERE match_id=? AND player_id=?";

        await mysql.simpleUpdate(query, [kills, bestKillsInLife, matchId, playerId]);
    }

    async updatePlayerTotals(gametypeId, playerId, kills, bestKillsInLife){

        const query = `UPDATE nstats_player_totals SET
            mh_kills=mh_kills+?,
            mh_kills_best_life = IF(mh_kills_best_life < ?, ?, mh_kills_best_life),
            mh_kills_best = IF(mh_kills_best < ?, ?, mh_kills_best)
            WHERE player_id=? AND gametype IN (0,?)`;
        
        const vars = [
            kills,
            bestKillsInLife,
            bestKillsInLife,
            kills,
            kills,
            playerId,
            gametypeId
        ];

        console.log(vars);

        await mysql.simpleUpdate(query, vars);
    
    }

}

module.exports = MonsterHunt;