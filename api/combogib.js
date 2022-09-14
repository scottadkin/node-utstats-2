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
            ?,
            ?,?,?)`;

        const vars = [playerId, matchId, mapId,
            primary.kills, primary.deaths, primary.efficiency,
            shockBalls.kills, shockBalls.deaths, shockBalls.efficiency,
            combos.kills, combos.deaths, combos.efficiency,
            combos.bestSingle, primary.best, shockBalls.best, combos.best
        ];

        await mysql.simpleQuery(query, vars);
    }
}

module.exports = Combogib;