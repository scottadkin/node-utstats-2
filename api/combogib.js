const mysql = require("./database");

class Combogib{

    constructor(){

    }

    async insertPlayerMatchData(playerId, matchId, mapId, combos, shockBalls, primary){

        const query = `INSERT INTO nstats_match_combogib VALUES(
            NULL,?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,
            ?,?,?)`;

        const vars = [playerId, matchId, mapId,
            primary.kills, primary.deaths, primary.efficiency,
            shockBalls.kills, shockBalls.deaths, shockBalls.efficiency,
            combos.kills, combos.deaths, combos.efficiency,
            combos.bestSingle, shockBalls.bestSingle, primary.best, shockBalls.best, combos.best
        ];

        await mysql.simpleQuery(query, vars);
    }


    async getMatchData(matchId){

        matchId = parseInt(matchId);

        const query = `SELECT 
        ball_deaths,ball_efficiency,ball_kills,best_ball_kills,best_combo_kills,best_primary_kills,
        best_single_combo,best_single_shockball,combo_deaths,combo_efficiency,combo_kills,
        player_id,primary_deaths,primary_efficiency,primary_kills

        FROM nstats_match_combogib WHERE match_id=?`;

        return await mysql.simpleQuery(query, [matchId]);
    }
}

module.exports = Combogib;