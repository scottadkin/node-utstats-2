const mysql = require("./database");

class Combogib{

    constructor(){

    }

    async insertPlayerMatchData(playerId, matchId, mapId, playtime, combos, shockBalls, primary, insane){

        const query = `INSERT INTO nstats_match_combogib VALUES(
            NULL,?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,
            ?,?,?,?)`;

        const vars = [playerId, matchId, mapId, playtime,
            primary.kills, primary.deaths, primary.efficiency, primary.kpm,
            shockBalls.kills, shockBalls.deaths, shockBalls.efficiency, shockBalls.kpm,
            combos.kills, combos.deaths, combos.efficiency, combos.kpm,
            insane.kills, insane.deaths, insane.efficiency, insane.kpm,
            combos.bestSingle, shockBalls.bestSingle, insane.bestSingle,
            primary.best, shockBalls.best, combos.best, insane.best
        ];

        await mysql.simpleQuery(query, vars);
    }


    async getMatchData(matchId){

        matchId = parseInt(matchId);

        const query = `SELECT 
        ball_deaths,ball_efficiency,ball_kills,ball_kpm,best_ball_kills,best_combo_kills,best_primary_kills,
        best_single_combo,best_single_shockball,combo_deaths,combo_efficiency,combo_kills,combo_kpm,
        player_id,primary_deaths,primary_efficiency,primary_kills,primary_kpm,insane_kills,
        insane_deaths,insane_efficiency,insane_kpm,best_insane_kills,best_single_insane

        FROM nstats_match_combogib WHERE match_id=?`;

        return await mysql.simpleQuery(query, [matchId]);
    }


    async getPlayerMatchData(playerId, matchId){
        
        const query = `SELECT 
        ball_deaths,ball_efficiency,ball_kpm,ball_kills,best_ball_kills,best_combo_kills,best_primary_kills,
        best_single_combo,best_single_shockball,combo_deaths,combo_efficiency,combo_kills,combo_kpm,
        player_id,primary_deaths,primary_efficiency,primary_kills,primary_kpm,insane_kills,
        insane_deaths,insane_efficiency,insane_kpm,best_insane_kills,best_single_insane
        FROM nstats_match_combogib WHERE match_id=? AND player_id=?`;

        const result = await mysql.simpleQuery(query, [matchId, playerId]);
        
        if(result.length > 0){
            return result[0];
        }

        return null;
    }


    async getMapMostCombos(mapId, limit){

        const query = "SELECT player_id,match_id,MAX(combo_kills) as combo_kills FROM nstats_match_combogib WHERE map_id=? AND combo_kills>0 GROUP BY player_id ORDER BY combo_kills DESC LIMIT ?";

        console.log(await mysql.simpleQuery(query, [mapId, limit]));
    }


    async getMapRecords(mapId, recordType, page, perPage){

        let start = 0;

        if(page > 0 && perPage > 0){
            start = page * perPage;
        }

        const validRecordTypes = ["combo_kills","insane_kills","ball_kills","primary_kills"];
        const typeIndex = validRecordTypes.indexOf(recordType);

        if(typeIndex === -1) return null;

        const column = validRecordTypes[typeIndex];

        const query = `SELECT player_id,match_id,MAX(${column}) as best_value FROM nstats_match_combogib WHERE ${column}>0 AND map_id=?
        GROUP BY player_id ORDER BY ${column} DESC LIMIT ?,?`;

        return await mysql.simpleQuery(query, [mapId, start, perPage]);

    }
}

module.exports = Combogib;