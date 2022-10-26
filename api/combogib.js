const mysql = require("./database");

class Combogib{

    constructor(){}

    async insertPlayerMatchData(playerId, gametypeId, matchId, mapId, playtime, combos, shockBalls, primary, insane){

        const query = `INSERT INTO nstats_match_combogib VALUES(
            NULL,?,?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,
            ?,?,?,?)`;

        const vars = [playerId, gametypeId, matchId, mapId, playtime,
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
            GROUP BY player_id ORDER BY best_value DESC LIMIT ?,?`;

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


    async bMapHaveTotalsData(mapId, gametypeId){

        if(gametypeId === undefined) gametypeId = 0;

        const query = "SELECT COUNT(*) as total_rows FROM nstats_map_combogib WHERE map_id=? AND gametype_id=?";

        const result = await mysql.simpleQuery(query, [mapId, gametypeId]);

        if(result.length > 0){
            if(result[0].total_rows > 0) return true;
        }

        return false;

    }


    async insertNewMapTotals(mapId, gametypeId, matchId, playtime, combos, shockBalls, primary, insane){

        const query = `INSERT INTO nstats_map_combogib VALUES(
            NULL,?,?,1,?,
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

        const vars = [mapId, gametypeId, playtime,
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

    async updateMapTotalTable(mapId, gametypeId, matchId, playtime, combos, shockBalls, primary, insane){


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


        WHERE map_id=? AND gametype_id=?

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

            combos.mostKills, combos.mostKillsPlayerId,
            combos.mostKills, matchId,
            combos.mostKills, combos.mostKills,

            insane.mostKills, insane.mostKillsPlayerId,
            insane.mostKills, matchId,
            insane.mostKills, insane.mostKills,

            shockBalls.mostKills, shockBalls.mostKillsPlayerId,
            shockBalls.mostKills, matchId,
            shockBalls.mostKills, shockBalls.mostKills,

            primary.mostKills, primary.mostKills,
            primary.mostKills, primary.mostKillsPlayerId,
            primary.mostKills, matchId,
            mapId, gametypeId
        ];

        await mysql.simpleQuery(query, vars);
    }

    async updateMapTotals(mapId, gametypeId, matchId, playtime, combos, shockBalls, primary, insane){

        if(await this.bMapHaveTotalsData(mapId, gametypeId)){
            await this.updateMapTotalTable(mapId, gametypeId, matchId, playtime, combos, shockBalls, primary, insane);

        }else{
            await this.insertNewMapTotals(mapId, gametypeId, matchId, playtime, combos, shockBalls, primary, insane);
        } 

        //run again but with gametype id of 0(all combined)
        if(gametypeId !== 0){
            await this.updateMapTotals(mapId, 0, matchId, playtime, combos, shockBalls, primary, insane);
        }
    }

    async getMapTotals(mapId, gametypeId){

        if(gametypeId === undefined) gametypeId = 0;

        const query = "SELECT * FROM nstats_map_combogib WHERE map_id=? AND gametype_id=?";

        const result = await mysql.simpleQuery(query, [mapId, gametypeId]);

        if(result.length > 0){

            return result[0];
        }

        return null;
    }


    async createPlayerTotals(playerId, gametypeId, mapId){

        const query = `INSERT INTO nstats_player_combogib VALUES(NULL,?,?,?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)`;

        return await mysql.simpleQuery(query, [playerId, gametypeId, mapId]);
    }

    async bPlayerTotalsExist(playerId, gametypeId, mapId){

        const query = "SELECT COUNT(*) as total_matches FROM nstats_player_combogib WHERE player_id=? AND gametype_id=? AND map_id=?";

        const result = await mysql.simpleQuery(query, [playerId, gametypeId, mapId]);

        if(result[0].total_matches > 0) return true;
32
        return false;
    }

    async updatePlayerTotals(playerId, gametypeId, mapId, matchId, playtime, combos, insane, shockBalls, primary){

        if(!await this.bPlayerTotalsExist(playerId, gametypeId, mapId)){
            await this.createPlayerTotals(playerId, gametypeId, mapId);
        }

        const query = `UPDATE nstats_player_combogib SET total_matches=total_matches+1,playtime=playtime+?,
        combo_kills = combo_kills+?, combo_deaths = combo_deaths + ?,
        combo_kpm = IF(combo_kills > 0 AND playtime > 0, combo_kills / (playtime / 60) , 0),
        combo_efficiency = IF(combo_kills > 0, IF(combo_deaths = 0, 100, (combo_kills / (combo_kills + combo_deaths)) * 100) , 0),
        insane_kills = insane_kills+?, insane_deaths = insane_deaths + ?,
        insane_kpm = IF(insane_kills > 0 AND playtime > 0, insane_kills / (playtime / 60) , 0),
        insane_efficiency = IF(insane_kills > 0, IF(insane_deaths = 0, 100, (insane_kills / (insane_kills + insane_deaths)) * 100) , 0),
        shockball_kills=shockball_kills+?, shockball_deaths = shockball_deaths + ?,
        shockball_kpm = IF(shockball_kills > 0 AND playtime > 0, shockball_kills / (playtime / 60) , 0),
        shockball_efficiency = IF(shockball_kills > 0, IF(shockball_deaths = 0, 100, (shockball_kills / (shockball_kills + shockball_deaths)) * 100) , 0),
        primary_kills = primary_kills+?, primary_deaths = primary_deaths + ?,
        primary_kpm = IF(primary_kills > 0 AND playtime > 0, primary_kills / (playtime / 60) , 0),
        primary_efficiency = IF(primary_kills > 0, IF(primary_deaths = 0, 100, (primary_kills / (primary_kills + primary_deaths)) * 100) , 0),

        best_single_combo_match_id = IF(best_single_combo < ?, ?, best_single_combo_match_id),
        best_single_combo = IF(best_single_combo < ?, ?, best_single_combo),
        
        best_single_insane_match_id = IF(best_single_insane < ?, ?, best_single_insane_match_id),
        best_single_insane = IF(best_single_insane < ?, ?, best_single_insane),
        
        best_single_shockball_match_id = IF(best_single_shockball < ?, ?, best_single_shockball_match_id),
        best_single_shockball = IF(best_single_shockball < ?, ?, best_single_shockball),

        most_combo_kills_match_id = IF(most_combo_kills < ?, ?, most_combo_kills_match_id),
        most_combo_kills = IF(most_combo_kills < ?, ?, most_combo_kills),

        most_insane_kills_match_id = IF(most_insane_kills < ?, ?, most_insane_kills_match_id),
        most_insane_kills = IF(most_insane_kills < ?, ?, most_insane_kills),

        most_shockball_kills_match_id = IF(most_shockball_kills < ?, ?, most_shockball_kills_match_id),
        most_shockball_kills = IF(most_shockball_kills < ?, ?, most_shockball_kills),

        most_primary_kills_match_id = IF(most_primary_kills < ?, ?, most_primary_kills_match_id),
        most_primary_kills = IF(most_primary_kills < ?, ?, most_primary_kills),

        best_combo_spree_match_id = IF(best_combo_spree < ?, ?, best_combo_spree_match_id),
        best_combo_spree = IF(best_combo_spree < ?, ?, best_combo_spree),

        best_insane_spree_match_id = IF(best_insane_spree < ?, ?, best_insane_spree_match_id),
        best_insane_spree = IF(best_insane_spree < ?, ?, best_insane_spree),

        best_shockball_spree_match_id = IF(best_shockball_spree < ?, ?, best_shockball_spree_match_id),
        best_shockball_spree = IF(best_shockball_spree < ?, ?, best_shockball_spree),

        best_primary_spree_match_id = IF(best_primary_spree < ?, ?, best_primary_spree_match_id),
        best_primary_spree = IF(best_primary_spree < ?, ?, best_primary_spree)
        
        WHERE player_id=? AND gametype_id=? AND map_id=?`;

        const vars = [
            playtime,
            combos.kills, combos.deaths,
            insane.kills,  insane.deaths,
            shockBalls.kills, shockBalls.deaths,
            primary.kills,  primary.deaths,

            combos.bestSingle, matchId,
            combos.bestSingle, combos.bestSingle,
            
            insane.bestSingle, matchId,
            insane.bestSingle, insane.bestSingle,
            
            shockBalls.bestSingle, matchId,
            shockBalls.bestSingle, shockBalls.bestSingle,

            combos.kills, matchId,
            combos.kills, combos.kills,

            insane.kills, matchId,
            insane.kills, insane.kills,

            shockBalls.kills, matchId,
            shockBalls.kills, shockBalls.kills,

            primary.kills, matchId,
            primary.kills, primary.kills,

            combos.best, matchId,
            combos.best, combos.best,

            insane.best, matchId,
            insane.best, insane.best,

            shockBalls.best, matchId,
            shockBalls.best, shockBalls.best,

            primary.best, matchId,
            primary.best, primary.best,


            
            playerId, gametypeId, mapId
        ];


        await mysql.simpleQuery(query, vars);

        if(gametypeId !== 0){
            await this.updatePlayerTotals(playerId, 0, 0, matchId, playtime, combos, insane, shockBalls, primary);
        }

        if(mapId !== 0 && gametypeId !== 0){
            await this.updatePlayerTotals(playerId, 0, mapId, matchId, playtime, combos, insane, shockBalls, primary);
        }

    }

}

module.exports = Combogib;