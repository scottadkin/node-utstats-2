const mysql = require("./database");

class Combogib{

    constructor(){}

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
    

    bValidRecordType(recordType){

        const validRecordTypes = [
            "combo_kills",
            "insane_kills",
            "ball_kills",
            "primary_kills",
            "best_single_combo",
            "best_single_insane",
            "best_single_shockball",
            "best_combo_kills",
            "best_insane_kills",
            "best_ball_kills",
            "best_primary_kills",
        ];
        const typeIndex = validRecordTypes.indexOf(recordType);

        if(typeIndex === -1) return false;

        return true;
    }

    async getMapRecords(mapId, recordType, page, perPage){

        let start = 0;

        if(page > 0 && perPage > 0){
            start = page * perPage;
        }

        if(this.bValidRecordType(recordType)){

            const query = `SELECT player_id,match_id,MAX(${recordType}) as best_value,playtime FROM nstats_match_combogib WHERE ${recordType}>0 AND map_id=?
            GROUP BY player_id ORDER BY ${recordType} DESC LIMIT ?,?`;

            return await mysql.simpleQuery(query, [mapId, start, perPage]);

        }else{

            throw new Error(`${recordType} is not a valid record type.`);
        }


    }

    async getTotalMapRecords(mapId, recordType){

        if(this.bValidRecordType(recordType)){

            const query = `SELECT COUNT(DISTINCT player_id) as unique_players FROM nstats_match_combogib WHERE ${recordType}>0 AND map_id=?`;

            const result = await mysql.simpleQuery(query, [mapId]);

            if(result.length > 0){
                return result[0].unique_players;
            }

        }else{
            throw new Error(`${recordType} is not a valid record type.`);
        }
    }


    async bMapHaveTotalsData(mapId){

        const query = "SELECT COUNT(*) as total_rows FROM nstats_map_combogib WHERE map_id=?";

        const result = await mysql.simpleQuery(query, [mapId]);

        if(result.length > 0){
            if(result[0].total_rows > 0) return true;
        }

        return false;

    }


    async insertNewMapTotals(mapId, matchId, playtime, combos, shockBalls, primary, insane){

        const query = `INSERT INTO nstats_map_combogib VALUES(
            NULL,?,1,?,
            ?,?,
            ?,?,
            ?,?,
            ?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?,
            ?,?,?)`;

        const vars = [mapId, playtime,
            primary.kills, primary.kpm,
            shockBalls.kills, shockBalls.kpm,
            combos.kills, combos.kpm,
            insane.kills,  insane.kpm,
            combos.bestSingle, combos.bestSinglePlayerId, matchId,
            shockBalls.bestSingle, shockBalls.bestSinglePlayerId, matchId,
            insane.bestSingle, insane.bestSinglePlayerId, matchId,
            primary.best, primary.bestPlayerId, matchId,
            shockBalls.best, shockBalls.bestPlayerId, matchId,
            combos.best, combos.bestPlayerId, matchId,
            insane.best, insane.bestPlayerId, matchId,
            combos.mostKills, combos.mostKillsPlayerId, matchId,
            insane.mostKills, insane.mostKillsPlayerId, matchId,
            shockBalls.mostKills, shockBalls.mostKillsPlayerId, matchId,
            primary.mostKills, primary.mostKillsPlayerId, matchId,
        ];

        await mysql.simpleQuery(query, vars);
    }

    async updateMapTotalTable(mapId, matchId, playtime, combos, shockBalls, primary, insane){


        const query = `UPDATE nstats_map_combogib SET
        matches=matches+1,
        playtime=playtime+?,
        primary_kills=primary_kills+?,
        primary_kpm=primary_kills/(playtime / 60),
        ball_kills=ball_kills+?,
        ball_kpm=ball_kills/(playtime / 60),
        combo_kills=combo_kills+?,
        combo_kpm=combo_kills/(playtime / 60),
        insane_kills=insane_kills+?,
        insane_kpm=insane_kills/(playtime / 60),

        best_single_combo_player_id=IF(best_single_combo < ?, ?, best_single_combo_player_id),
        best_single_combo_match_id=IF(best_single_combo < ?, ?, best_single_combo_match_id),
        best_single_combo=IF(best_single_combo < ?, ?, best_single_combo),

        best_single_shockball_player_id=IF(best_single_shockball < ?, ?, best_single_shockball_player_id),
        best_single_shockball_match_id=IF(best_single_shockball < ?, ?, best_single_shockball_match_id),
        best_single_shockball=IF(best_single_shockball < ?, ?, best_single_shockball),

        best_single_insane_player_id=IF(best_single_insane < ?, ?, best_single_insane_player_id),
        best_single_insane_match_id=IF(best_single_insane < ?, ?, best_single_insane_match_id),
        best_single_insane=IF(best_single_insane < ?, ?, best_single_insane),

        best_primary_kills_player_id=IF(best_primary_kills < ?, ?, best_primary_kills_player_id),
        best_primary_kills_match_id=IF(best_primary_kills < ?, ?, best_primary_kills_match_id),
        best_primary_kills=IF(best_primary_kills < ?, ?, best_primary_kills),

        best_ball_kills_player_id=IF(best_ball_kills < ?, ?, best_ball_kills_player_id),
        best_ball_kills_match_id=IF(best_ball_kills < ?, ?, best_ball_kills_match_id),
        best_ball_kills=IF(best_ball_kills < ?, ?, best_ball_kills),

        best_combo_kills_player_id=IF(best_combo_kills < ?, ?, best_combo_kills_player_id),
        best_combo_kills_match_id=IF(best_combo_kills < ?, ?, best_combo_kills_match_id),
        best_combo_kills=IF(best_combo_kills < ?, ?, best_combo_kills),

        best_insane_kills_player_id=IF(best_insane_kills < ?, ?, best_insane_kills_player_id),
        best_insane_kills_match_id=IF(best_insane_kills < ?, ?, best_insane_kills_match_id),
        best_insane_kills=IF(best_insane_kills < ?, ?, best_insane_kills),

        max_combo_kills_player_id=IF(max_combo_kills < ?, ?, max_combo_kills_player_id),
        max_combo_kills_match_id=IF(max_combo_kills < ?, ?, max_combo_kills_match_id),
        max_combo_kills=IF(max_combo_kills < ?, ?, max_combo_kills),

        max_insane_kills_player_id=IF(max_insane_kills < ?, ?, max_insane_kills_player_id),
        max_insane_kills_match_id=IF(max_insane_kills < ?, ?, max_insane_kills_match_id),
        max_insane_kills=IF(max_insane_kills < ?, ?, max_insane_kills),

        max_ball_kills_player_id=IF(max_ball_kills < ?, ?, max_ball_kills_player_id),
        max_ball_kills_match_id=IF(max_ball_kills < ?, ?, max_ball_kills_match_id),
        max_ball_kills=IF(max_ball_kills < ?, ?, max_ball_kills),

        max_primary_kills_player_id=IF(max_primary_kills < ?, ?, max_primary_kills_player_id),
        max_primary_kills_match_id=IF(max_primary_kills < ?, ?, max_primary_kills_match_id),
        max_primary_kills=IF(max_primary_kills < ?, ?, max_primary_kills)


        WHERE map_id=?

        `;

        const vars = [
            playtime,
            primary.kills,
            shockBalls.kills,
            combos.kills,
            insane.kills,

            combos.bestSingle, combos.bestSinglePlayerId,
            combos.bestSingle, matchId,
            combos.bestSingle, combos.bestSingle,

            shockBalls.bestSingle, shockBalls.bestSinglePlayerId,
            shockBalls.bestSingle, matchId,
            shockBalls.bestSingle, shockBalls.bestSingle,

            insane.bestSingle, insane.bestSinglePlayerId,
            insane.bestSingle, matchId,
            insane.bestSingle, insane.bestSingle,

            primary.best, primary.bestPlayerId,
            primary.best, matchId,
            primary.best, primary.best,

            shockBalls.best, shockBalls.bestPlayerId,
            shockBalls.best, matchId,
            shockBalls.best, shockBalls.best,
            
            combos.best, combos.bestPlayerId,
            combos.best, matchId,
            combos.best, combos.best,

            insane.best, insane.bestPlayerId,
            insane.best, matchId,
            insane.best, insane.best,

            combos.mostKills, combos.mostKills,
            combos.mostKills, combos.mostKillsPlayerId,
            combos.mostKills, matchId,

            insane.mostKills, insane.mostKills,
            insane.mostKills, insane.mostKillsPlayerId,
            insane.mostKills, matchId,

            shockBalls.mostKills, shockBalls.mostKills,
            shockBalls.mostKills, shockBalls.mostKillsPlayerId,
            shockBalls.mostKills, matchId,

            primary.mostKills, primary.mostKills,
            primary.mostKills, primary.mostKillsPlayerId,
            primary.mostKills, matchId,



            mapId
        ];

        await mysql.simpleQuery(query, vars);
    }

    async updateMapTotals(mapId, matchId, playtime, combos, shockBalls, primary, insane){

        if(await this.bMapHaveTotalsData(mapId)){
            await this.updateMapTotalTable(mapId, matchId, playtime, combos, shockBalls, primary, insane);

        }else{
            await this.insertNewMapTotals(mapId, matchId, playtime, combos, shockBalls, primary, insane);
        } 
    }

    async getMapTotals(mapId){

        const query = "SELECT * FROM nstats_map_combogib WHERE map_id=?";

        const result = await mysql.simpleQuery(query, [mapId]);

        if(result.length > 0){

            return result[0];
        }

        return null;
    }

}

module.exports = Combogib;