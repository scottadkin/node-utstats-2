const mysql = require("./database.js");

class Combogib{

    constructor(){}

    async bulkInsertPlayerMatchData(vars){


        const query = `INSERT INTO nstats_match_combogib (
            player_id, gametype_id, match_id, map_id, playtime, 
            primary_kills, primary_deaths, primary_efficiency, 
            primary_kpm, shockball_kills, shockball_deaths, 
            shockball_efficiency, shockball_kpm, combo_kills, 
            combo_deaths, combo_efficiency, combo_kpm, insane_kills,
            insane_deaths, insane_efficiency, insane_kpm, best_single_combo,
            best_single_shockball, 
            best_single_insane, best_primary_spree, best_shockball_spree, best_combo_spree, 
            best_insane_spree) VALUES ?`;
        
        return await mysql.bulkInsert(query, vars);
    }


    async getMatchData(matchId){

        matchId = parseInt(matchId);

        const query = `SELECT 
        shockball_deaths,shockball_efficiency,shockball_kills,shockball_kpm,best_shockball_spree,best_combo_spree,best_primary_spree,
        best_single_combo,best_single_shockball,combo_deaths,combo_efficiency,combo_kills,combo_kpm,
        player_id,primary_deaths,primary_efficiency,primary_kills,primary_kpm,insane_kills,
        insane_deaths,insane_efficiency,insane_kpm,best_insane_spree,best_single_insane

        FROM nstats_match_combogib WHERE match_id=?`;

        return await mysql.simpleQuery(query, [matchId]);
    }


    async getPlayerMatchData(playerId, matchId, bEveryRow){
        
        if(bEveryRow === undefined) bEveryRow = false;

        const query = `SELECT 
        shockball_deaths,shockball_efficiency,shockball_kpm,shockball_kills,best_shockball_spree,best_combo_spree,best_primary_spree,
        best_single_combo,best_single_shockball,combo_deaths,combo_efficiency,combo_kills,combo_kpm,
        player_id,primary_deaths,primary_efficiency,primary_kills,primary_kpm,insane_kills,
        insane_deaths,insane_efficiency,insane_kpm,best_insane_spree,best_single_insane
        FROM nstats_match_combogib WHERE match_id=? AND player_id=?`;

        const result = await mysql.simpleQuery(query, [matchId, playerId]);
        
        if(result.length > 0){

            if(!bEveryRow){
                return result[0];
            }else{
                return result;
            }
        }

        return null;
    }


    async getMapMostCombos(mapId, limit){

        const query = "SELECT player_id,match_id,MAX(combo_kills) as combo_kills FROM nstats_match_combogib WHERE map_id=? AND combo_kills>0 GROUP BY player_id ORDER BY combo_kills DESC LIMIT ?";

        console.log(await mysql.simpleQuery(query, [mapId, limit]));
    }
    
    async getMapRecordDetails(playerId, mapId, type, value){

        if(this.bValidRecordType(type, "match")){

            const query = `SELECT match_id,playtime FROM nstats_match_combogib WHERE player_id=? AND ${type}=? AND map_id=? LIMIT 1`;

            const result = await mysql.simpleQuery(query, [playerId, value, mapId]);

            if(result.length > 0){
                return result[0];
            }

            return null;

        }else{

            throw new Error(`${recordType} is not a valid record type.`);
        }

       
    }

    async getMapRecords(mapId, recordType, page, perPage){

        let start = 0;

        if(page > 0 && perPage > 0){
            start = page * perPage;
        }

        if(this.bValidRecordType(recordType, "match")){

            const query = `SELECT player_id,MAX(${recordType}) as best_value FROM nstats_match_combogib WHERE ${recordType}>0 AND map_id=?
            GROUP BY player_id ORDER BY best_value DESC LIMIT ?,?`;

            const result =  await mysql.simpleQuery(query, [mapId, start, perPage]);
            

            for(let i = 0; i < result.length; i++){

                const details = await this.getMapRecordDetails(result[i].player_id, mapId, recordType, result[i].best_value);

                if(details !== null){
                    result[i].playtime = details.playtime;
                    result[i].match_id = details.match_id;
                }
            }

            return result;

        }else{

            throw new Error(`${recordType} is not a valid record type.`);
        }


    }

    async getTotalMapRecords(mapId, recordType){

        if(this.bValidRecordType(recordType, "match")){

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
        shockball_kills=shockball_kills+?,
        shockball_kpm=shockball_kills/(playtime / 60),
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

        best_primary_spree_player_id=IF(best_primary_spree < ?, ?, best_primary_spree_player_id),
        best_primary_spree_match_id=IF(best_primary_spree < ?, ?, best_primary_spree_match_id),
        best_primary_spree=IF(best_primary_spree < ?, ?, best_primary_spree),

        best_shockball_spree_player_id=IF(best_shockball_spree < ?, ?, best_shockball_spree_player_id),
        best_shockball_spree_match_id=IF(best_shockball_spree < ?, ?, best_shockball_spree_match_id),
        best_shockball_spree=IF(best_shockball_spree < ?, ?, best_shockball_spree),

        best_combo_spree_player_id=IF(best_combo_spree < ?, ?, best_combo_spree_player_id),
        best_combo_spree_match_id=IF(best_combo_spree < ?, ?, best_combo_spree_match_id),
        best_combo_spree=IF(best_combo_spree < ?, ?, best_combo_spree),

        best_insane_spree_player_id=IF(best_insane_spree < ?, ?, best_insane_spree_player_id),
        best_insane_spree_match_id=IF(best_insane_spree < ?, ?, best_insane_spree_match_id),
        best_insane_spree=IF(best_insane_spree < ?, ?, best_insane_spree),

        max_combo_kills_player_id=IF(max_combo_kills < ?, ?, max_combo_kills_player_id),
        max_combo_kills_match_id=IF(max_combo_kills < ?, ?, max_combo_kills_match_id),
        max_combo_kills=IF(max_combo_kills < ?, ?, max_combo_kills),

        max_insane_kills_player_id=IF(max_insane_kills < ?, ?, max_insane_kills_player_id),
        max_insane_kills_match_id=IF(max_insane_kills < ?, ?, max_insane_kills_match_id),
        max_insane_kills=IF(max_insane_kills < ?, ?, max_insane_kills),

        max_shockball_kills_player_id=IF(max_shockball_kills < ?, ?, max_shockball_kills_player_id),
        max_shockball_kills_match_id=IF(max_shockball_kills < ?, ?, max_shockball_kills_match_id),
        max_shockball_kills=IF(max_shockball_kills < ?, ?, max_shockball_kills),

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

        max_combo_kills_match_id = IF(max_combo_kills < ?, ?, max_combo_kills_match_id),
        max_combo_kills = IF(max_combo_kills < ?, ?, max_combo_kills),

        max_insane_kills_match_id = IF(max_insane_kills < ?, ?, max_insane_kills_match_id),
        max_insane_kills = IF(max_insane_kills < ?, ?, max_insane_kills),

        max_shockball_kills_match_id = IF(max_shockball_kills < ?, ?, max_shockball_kills_match_id),
        max_shockball_kills = IF(max_shockball_kills < ?, ?, max_shockball_kills),

        max_primary_kills_match_id = IF(max_primary_kills < ?, ?, max_primary_kills_match_id),
        max_primary_kills = IF(max_primary_kills < ?, ?, max_primary_kills),

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


    async getPlayerTotals(playerId){

        const query = `SELECT * FROM nstats_player_combogib WHERE player_id=? AND gametype_id=0 AND map_id=0`;

        const result = await mysql.simpleQuery(query, [playerId]);

        if(result.length > 0){
            return result[0];
        }

        return [];
    }


    getValidRecordTypes(){

        const both = [
            {"name": "primary_kills", "display": "Instagib Kills"},
            {"name": "primary_deaths", "display": "Instagib Deaths"},
            {"name": "combo_kills", "display": "Combo Kills"},
            {"name": "combo_deaths", "display": "Combo Deaths"},      
            {"name": "insane_kills", "display": "Insane Combo Kills"},
            {"name": "insane_deaths", "display": "Insane Combo Deaths"},        
            {"name": "best_single_combo", "display": "Best Single Combo"},
            {"name": "best_single_insane", "display": "Best Single Insane Combo"},
            {"name": "best_single_shockball", "display": "Best Single ShockBall"},
            {"name": "insane_kpm", "display": "Insane Combo Kills Per Minute"},
            {"name": "combo_kpm", "display": "Combo Kills Per Minute"},
            {"name": "primary_kpm", "display": "Instagib Kills Per Minute"},
            {"name": "shockball_kills", "display": "ShockBall Kills"},
            {"name": "shockball_deaths", "display": "ShockBall Deaths"},
            {"name": "shockball_kpm", "display": "ShockBall Kills Per Minute"},
            {"name": "best_primary_spree", "display": "Best Instagib Killing Spree"},
            {"name": "best_combo_spree", "display": "Best Combo Killing Spree"},
            {"name": "best_insane_spree", "display": "Best Insane Combo Killing Spree"},
            {"name": "best_shockball_spree", "display": "Best ShockBall Killing Spree"},
            
        ];

        const singleMatch = [        
            ...both         
        ];

        const playerTotals = [
            ...both
        ];

        const justMatchKeys = [];

        for(let i = 0; i < singleMatch.length; i++){

            const {name} = singleMatch[i];
            justMatchKeys.push(name);
        }

        const justTotalKeys = [];

        for(let i = 0; i < playerTotals.length; i++){

            const {name} = playerTotals[i];
            justTotalKeys.push(name);
        }


        return {"match": singleMatch, "totals": playerTotals, "matchKeys": justMatchKeys, "totalKeys": justTotalKeys};
    }

    bValidRecordType(recordName, recordType){

        const validTypes = this.getValidRecordTypes();

        let key = "";

        if(recordType === 0) key = "matchKeys";
        if(recordType !== 0) key = "totalKeys";

        if(validTypes[key].indexOf(recordName) !== -1) return true;

        return false;
    }


    bRequiresMatchId(recordType){

        recordType = recordType.toLowerCase();

        const types = [
            "best_single_combo",
            "best_single_insane",
            "best_single_shockball",
            "max_combo_kills",
            "max_insane_kills",
            "max_shockball_kills",
            "max_primary_kills",
            "best_combo_spree",
            "best_insane_spree",
            "best_shockball_spree",
            "best_primary_spree"
        ];

        return !types.indexOf(recordType) === -1;
    }


    async getPlayerBestMatchValues(recordType, page, perPage){

        if(page === undefined) page = 0;
        if(perPage === undefined) page = 25;

        if(this.bValidRecordType(recordType, 0)){
            
            const query = `SELECT match_id,map_id,player_id,playtime,${recordType.toLowerCase()} as value FROM nstats_match_combogib 
            ORDER BY value DESC LIMIT ?,?`;

            let start = parseInt(page * perPage);

            if(start !== start){
                start = 0;
            }

            const vars = [start, perPage];

            return await mysql.simpleQuery(query, vars);
            
        }else{
            throw new Error(`${recordType} is not a valid type for player match combogib records.`);
        }

    }
        
    async getTotalPlayerRows(){

        const query = "SELECT COUNT(DISTINCT player_id) as total_rows FROM nstats_player_combogib WHERE map_id=0 AND gametype_id=0";

        const result = await mysql.simpleQuery(query);

        return result[0].total_rows;
    }

    async getTotalMatchRows(){

        const query = "SELECT COUNT(*) as total_rows FROM nstats_match_combogib";

        const result = await mysql.simpleQuery(query);

        return result[0].total_rows;
    }


    async getPlayerRecords(recordType, page, perPage){

        if(page === undefined) page = 0;
        if(page < 0) page = 0;

        if(perPage === undefined) perPage = 25;
        if(perPage < 1) perPage = 25;

        if(this.bValidRecordType(recordType, 1)){

            const query = `SELECT player_id,playtime,total_matches,${recordType} as value
            FROM nstats_player_combogib WHERE gametype_id=0 AND map_id=0 ORDER BY value DESC LIMIT ?,?`;

            let start = parseInt(page * perPage);

            if(start !== start) start = 0;
            if(start < 0) start = 0;
            
            const vars = [start, perPage];

            return await mysql.simpleQuery(query, vars);

        }else{
            throw new Error(`${recordType} is not a valid record type.`);
        }
    }


    async getPlayerHistory(playerId){

        
        const query = `SELECT * FROM nstats_player_combogib WHERE player_id=?`;

        return await mysql.simpleQuery(query, [playerId]);
        
    }

    async getPlayerFullMatchData(playerId, matchId){

        const query = `SELECT * FROM nstats_match_combogib WHERE player_id=? AND match_id`;

        const result = await mysql.simpleQuery(query, [playerId, matchId]);

        if(result.length > 0) return result[0];

        return null;
    }

    async reduceMapTotals(data){


        const query = `UPDATE nstats_map_combogib SET 
        primary_kills=primary_kills-?,
        primary_kpm = IF(primary_kills > 0 && playtime > 0, primary_kills / (playtime / 60), 0),
        shockball_kills=shockball_kills-?,
        shockball_kpm = IF(shockball_kills > 0 && playtime > 0, shockball_kills / (playtime / 60), 0),
        combo_kills=combo_kills-?,
        combo_kpm = IF(combo_kills > 0 && playtime > 0, combo_kills / (playtime / 60), 0),
        insane_kills=insane_kills-?,
        insane_kpm = IF(insane_kills > 0 && playtime > 0, insane_kills / (playtime / 60), 0),

        best_single_combo = IF(best_single_combo_player_id = ?, 0, best_single_combo),
        best_single_combo_player_id = IF(best_single_combo_player_id = ?, 0, best_single_combo_player_id),
        best_single_combo_match_id = IF(best_single_combo_match_id = ?, 0, best_single_combo_match_id),

        best_single_shockball = IF(best_single_shockball_player_id = ?, 0, best_single_shockball),
        best_single_shockball_player_id = IF(best_single_shockball_player_id = ?, 0, best_single_shockball_player_id),
        best_single_shockball_match_id = IF(best_single_shockball_match_id = ?, 0, best_single_shockball_match_id),

        best_single_insane = IF(best_single_insane_player_id = ?, 0, best_single_insane),
        best_single_insane_player_id = IF(best_single_insane_player_id = ?, 0, best_single_insane_player_id),
        best_single_insane_match_id = IF(best_single_insane_match_id = ?, 0, best_single_insane_match_id),

        best_primary_spree = IF(best_primary_spree_player_id = ?, 0, best_primary_spree),
        best_primary_spree_player_id = IF(best_primary_spree_player_id = ?, 0, best_primary_spree_player_id),
        best_primary_spree_match_id = IF(best_primary_spree_match_id = ?, 0, best_primary_spree_match_id),

        best_shockball_spree = IF(best_shockball_spree_player_id = ?, 0, best_shockball_spree),
        best_shockball_spree_player_id = IF(best_shockball_spree_player_id = ?, 0, best_shockball_spree_player_id),
        best_shockball_spree_match_id = IF(best_shockball_spree_match_id = ?, 0, best_shockball_spree_match_id),

        best_combo_spree = IF(best_combo_spree_player_id = ?, 0, best_combo_spree),
        best_combo_spree_player_id = IF(best_combo_spree_player_id = ?, 0, best_combo_spree_player_id),
        best_combo_spree_match_id = IF(best_combo_spree_match_id = ?, 0, best_combo_spree_match_id),

        best_insane_spree = IF(best_insane_spree_player_id = ?, 0, best_insane_spree),
        best_insane_spree_player_id = IF(best_insane_spree_player_id = ?, 0, best_insane_spree_player_id),
        best_insane_spree_match_id = IF(best_insane_spree_match_id = ?, 0, best_insane_spree_match_id),

        max_combo_kills = IF(max_combo_kills_player_id = ?, 0, max_combo_kills),
        max_combo_kills_player_id = IF(max_combo_kills_player_id = ?, 0, max_combo_kills_player_id),
        max_combo_kills_match_id = IF(max_combo_kills_match_id = ?, 0, max_combo_kills_match_id),

        max_insane_kills = IF(max_insane_kills_player_id = ?, 0, max_insane_kills),
        max_insane_kills_player_id = IF(max_insane_kills_player_id = ?, 0, max_insane_kills_player_id),
        max_insane_kills_match_id = IF(max_insane_kills_match_id = ?, 0, max_insane_kills_match_id),

        max_shockball_kills = IF(max_shockball_kills_player_id = ?, 0, max_shockball_kills),
        max_shockball_kills_player_id = IF(max_shockball_kills_player_id = ?, 0, max_shockball_kills_player_id),
        max_shockball_kills_match_id = IF(max_shockball_kills_match_id = ?, 0, max_shockball_kills_match_id),

        max_primary_kills = IF(max_primary_kills_player_id = ?, 0, max_primary_kills),
        max_primary_kills_player_id = IF(max_primary_kills_player_id = ?, 0, max_primary_kills_player_id),
        max_primary_kills_match_id = IF(max_primary_kills_match_id = ?, 0, max_primary_kills_match_id)

        WHERE gametype_id IN(?,0) AND map_id=?

        `;

        

        const d = data;

        const pId = data.player_id;

        const vars = [
            d.primary_kills, d.shockball_kills, d.combo_kills, d.insane_kills,
            pId, pId, pId,
            pId, pId, pId,
            pId, pId, pId,
            pId, pId, pId,
            pId, pId, pId,
            pId, pId, pId,
            pId, pId, pId,
            pId, pId, pId,
            pId, pId, pId,
            pId, pId, pId,
            pId, pId, pId,
            d.gametype_id, d.map_id
        ];

        await mysql.simpleQuery(query, vars);
    }

    async getMapBestValues(mapId){

        const query = `SELECT gametype_id,
        best_single_combo, best_single_combo_player_id, best_single_combo_match_id, 
        best_single_insane, best_single_insane_player_id, best_single_insane_match_id, 
        best_single_shockball, best_single_shockball_player_id, best_single_shockball_match_id, 
        best_primary_spree, best_primary_spree_player_id, best_primary_spree_match_id,
        best_combo_spree, best_combo_spree_player_id, best_combo_spree_match_id,
        best_insane_spree, best_insane_spree_player_id, best_insane_spree_match_id,
        best_shockball_spree, best_shockball_spree_player_id, best_shockball_spree_match_id,
        max_primary_kills, max_primary_kills_player_id, max_primary_kills_match_id,
        max_combo_kills, max_combo_kills_player_id, max_combo_kills_match_id,
        max_insane_kills, max_insane_kills_player_id, max_combo_kills_match_id,
        max_shockball_kills, max_shockball_kills_player_id ,max_combo_kills_match_id
        FROM nstats_map_combogib WHERE map_id=?`;

        return await mysql.simpleQuery(query, [mapId]);
    }

    getValidBestColumns(){

        return [
            "best_single_combo",
            "best_single_insane",
            "best_single_shockball",
            "best_primary_spree",
            "best_combo_spree",
            "best_insane_spree",
            "best_shockball_spree",
            "max_combo_kills",
            "max_insane_kills",
            "max_shockball_kills",
            "max_primary_kills",

        ];
    }

    //find the best value of x type from the player table for recalculation
    async getMapPlayerBestValue(mapId, gametypeId, column){

        const validColumns = this.getValidBestColumns();

        const index = validColumns.indexOf(column); 
        if(index === -1) throw new Error(`${column} is not a valid column name`);

        const c = validColumns[index];

        const query = `SELECT player_id,${c} as best_value,${c}_match_id as match_id
        FROM nstats_player_combogib WHERE gametype_id=? AND map_id=? ORDER BY best_value DESC LIMIT 1`;
        
        const result = await mysql.simpleQuery(query, [gametypeId, mapId]);

        if(result.length > 0) return result[0];

        return null;
    }


    async setMapBestValue(mapId, gametypeId, column, value, valuePlayerId, valueMatchId){

        const validColumns = this.getValidBestColumns();

        const index = validColumns.indexOf(column);

        if(index === -1) throw new Error(`${column} is not a valid column name.`);

        const c = validColumns[index];

        const query = `UPDATE nstats_map_combogib SET ${c}=?, ${c}_player_id=?, ${c}_match_id=? WHERE map_id=? AND gametype_id=?`;

        await mysql.simpleQuery(query, [value, valuePlayerId, valueMatchId, mapId, gametypeId]);
    }

    async getUniqueMapGametypes(mapId){

        const query = "SELECT DISTINCT gametype_id FROM nstats_map_combogib WHERE map_id=? AND gametype_id!=0";

        const result = await mysql.simpleQuery(query, [mapId]);

        const found = [0];

        for(let i = 0; i < result.length; i++){

            found.push(result[i].gametype_id);
        }

        return found;
    }

    async recalculateMapBestValues(mapId, bForceUpdate){

        if(bForceUpdate === undefined) bForceUpdate = false;

        const keys = this.getValidBestColumns();

        const data = await this.getMapBestValues(mapId);

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            for(let k = 0; k < keys.length; k++){

                if(d[keys[k]] === 0 || bForceUpdate){

                    const best = await this.getMapPlayerBestValue(mapId, d.gametype_id, keys[k]);

                    if(best !== null){

                        await this.setMapBestValue(mapId, d.gametype_id, keys[k], best.best_value, best.player_id, best.match_id);

                    }else{
                        console.log(`Combogib.recalculateMapBestValues() best returned null`);
                    }
                }
            }
        }
    }

    async deletePlayerMatchesData(playerId){

        const query = "DELETE FROM nstats_match_combogib WHERE player_id=?";

        await mysql.simpleQuery(query, [playerId]);
    }

    async deletePlayerTotalData(playerId){
        
        const query = "DELETE FROM nstats_player_combogib WHERE player_id=?";

        await mysql.simpleQuery(query, [playerId]);
    }

    async deletePlayer(playerId){

        playerId = parseInt(playerId);

        if(playerId !== playerId) throw new Error(`PlayerId must be a valid integer`);

        const history = await this.getPlayerHistory(playerId);

        await this.deletePlayerMatchesData(playerId);
        await this.deletePlayerTotalData(playerId);

        const affectedMapIds = new Set();

        for(let i = 0; i < history.length; i++){

            const h = history[i];

            await this.reduceMapTotals(h);
            affectedMapIds.add(h.map_id);
        }

        for(const value of affectedMapIds.values()){
            await this.recalculateMapBestValues(value);
        }
    }


    async deletePlayerFromMatch(playerId, mapId, gametypeId, matchId){

        playerId = parseInt(playerId);
        matchId = parseInt(matchId);
        mapId = parseInt(mapId);
        gametypeId = parseInt(gametypeId);

        gametypeId = parseInt(gametypeId);
        if(playerId !== playerId) throw new Error(`PlayerId must be a valid integer`);
        if(matchId !== matchId) throw new Error(`matchId must be a valid integer`);
        if(mapId !== mapId) throw new Error(`mapId must be a valid integer`);
        if(gametypeId !== gametypeId) throw new Error(`gametypeId must be a valid integer`);

        const matchData = await this.getPlayerFullMatchData(playerId, matchId);

        const query = "DELETE FROM nstats_match_combogib WHERE player_id=? AND match_id=?";

        await mysql.simpleQuery(query, [playerId, matchId]);

        if(matchData !== null){

            matchData.gametype_id = gametypeId;
            matchData.map_id = mapId;

            await this.reduceMapTotals(matchData);
            await this.recalculateMapBestValues(mapId);

        }else{
            throw new Error(`matchData is null`);
        }   
    }

    async getDuplicatePlayerMatchIds(playerId){

        const query = "SELECT match_id,COUNT(match_id) as total_entries FROM nstats_match_combogib WHERE player_id=? GROUP BY match_id";

        const result = await mysql.simpleQuery(query, [playerId]);

        const duplicates = [];

        for(let i = 0; i < result.length; i++){

            if(result[i].total_entries > 1){
                duplicates.push(result[i].match_id);
            }
        }

        return duplicates;
    }

    /*mergePlayerMatchData(data){

        const total = data[0];

        if(data.length === 1) return total;


        for(let i = 1; i < data.length; i++){

            const d = data[i];

            total.shockball_deaths += d.shockball_deaths;
            total.shockball_kills += d.shockball_kills;

            if(d.best_shockball_spree > total.best_shockball_spree){
                total.best_shockball_spree + d.best_shockball_spree;
            }

            total.combo_deaths += d.combo_deaths;
            total.combo_kills += d.combo_kills;

            if(d.best_combo_spree > total.best_combo_spree){
                total.best_combo_spree + d.best_combo_spree;
            }

            total.primary_deaths += d.primary_deaths;
            total.primary_kills += d.primary_kills;

            if(d.best_primary_spree > total.best_primary_spree){
                total.best_primary_spree + d.best_primary_spree;
            }

            total.insane_deaths += d.insane_deaths;
            total.insane_kills += d.insane_kills;

            if(d.best_insane_spree > total.best_insane_spree){
                total.best_insane_spree + d.best_insane_spree;
            }

            
        }
        
        //do kpm and eff here
    }*/


    setCombinedPlayerMatchDataValues(data, key, playtime){

        const kpmKey = `${key}_kpm`;
        const effKey = `${key}_efficiency`;
        const killsKey = `${key}_kills`;
        const deathsKey = `${key}_deaths`;

        data[kpmKey] = 0;
        data[effKey] = 0;

        if(playtime === 0) return;

        if(data[killsKey] > 0){

            if(data[deathsKey] > 0){
                data[effKey] = (data[killsKey] / (data[killsKey] + data[deathsKey])) * 100;
            }else{
                data[effKey] = 100;
            }

            data[kpmKey] = data[killsKey] / (playtime / 60);
        }
    }

    async getCombinedPlayerMatchData(player, matchId){


        const query = `SELECT 
        gametype_id,
        map_id,
        SUM(playtime) as playtime,
        SUM(primary_kills) as primary_kills,
        SUM(primary_deaths) as primary_deaths,
        SUM(shockball_kills) as shockball_kills,
        SUM(shockball_deaths) as shockball_deaths,
        SUM(combo_kills) as combo_kills,
        SUM(combo_deaths) as combo_deaths,
        SUM(insane_kills) as insane_kills,
        SUM(insane_deaths) as insane_deaths,
        MAX(best_single_combo) as best_single_combo,
        MAX(best_single_shockball) as best_single_shockball,
        MAX(best_single_insane) as best_single_insane,
        MAX(best_primary_spree) as best_primary_spree,
        MAX(best_shockball_spree) as best_shockball_spree,
        MAX(best_combo_spree) as best_combo_spree,
        MAX(best_insane_spree) as best_insane_spree
        FROM nstats_match_combogib WHERE match_id=? AND player_id=? GROUP BY gametype_id, map_id`;

        const result = await mysql.simpleQuery(query, [matchId, player]);

        if(result[0].playtime === null) return null;

        const r = result[0];

        const playtime = r.playtime;

        this.setCombinedPlayerMatchDataValues(r, "primary", playtime);
        this.setCombinedPlayerMatchDataValues(r, "shockball", playtime);
        this.setCombinedPlayerMatchDataValues(r, "combo", playtime);
        this.setCombinedPlayerMatchDataValues(r, "insane", playtime);

        return r;

        
        //console.log(result);

    }

    //temporary used for merge players, need to change to bulk insert at some point
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

    //replace all data that has the id of playerOne with playerTwo
    async mergePlayersData(playerOne, playerTwo){

        const matchTableQuery = `UPDATE nstats_match_combogib SET player_id=? WHERE player_id=?`;
        await mysql.simpleQuery(matchTableQuery, [playerTwo, playerOne]);

        const duplicateMatchIds = await this.getDuplicatePlayerMatchIds(playerTwo);

        const affectedMapIds = new Set();

        for(let i = 0; i < duplicateMatchIds.length; i++){

            const matchId = duplicateMatchIds[i];
            const combined = await this.getCombinedPlayerMatchData(playerTwo, matchId);

            await this.deletePlayerMatchData(playerTwo, matchId);

            if(combined !== null){

                const combos = {
                    "bestSingle": combined.best_single_combo,
                    "kills": combined.combo_kills,
                    "deaths": combined.combo_deaths,
                    "efficiency": combined.combo_efficiency,
                    "kpm": combined.combo_kpm,
                    "best": combined.best_combo_spree
                };

                const shockBalls = {
                    "bestSingle": combined.best_single_shockball,
                    "kills": combined.shockball_kills,
                    "deaths": combined.shockball_deaths,
                    "efficiency": combined.shockball_efficiency,
                    "kpm": combined.shockball_kpm,
                    "best": combined.best_shockball_spree
                };

                const insane = {
                    "bestSingle": combined.best_single_insane,
                    "kills": combined.insane_kills,
                    "deaths": combined.insane_deaths,
                    "efficiency": combined.insane_efficiency,
                    "kpm": combined.insane_kpm,
                    "best": combined.best_insane_spree
                };

                const primary = {
                    "kills": combined.primary_kills,
                    "deaths": combined.primary_deaths,
                    "efficiency": combined.primary_efficiency,
                    "kpm": combined.primary_kpm,
                    "best": combined.best_primary_spree
                };

                await this.insertPlayerMatchData(playerTwo, combined.gametype_id, matchId, combined.map_id, 
                    combined.playtime, combos, shockBalls, primary, insane);

                await this.updatePlayerTotals(playerTwo, combined.gametype_id, combined.map_id, matchId, combined.playtime, combos, insane, shockBalls, primary);

                affectedMapIds.add(combined.map_id);
            }
        }

        for(const value of affectedMapIds.values()){
            await this.recalculateMapBestValues(value, true);
        }
    }

    //merge playerOnes's stats into playerTwo's
    async mergePlayers(playerOne, playerTwo){
        
        const history = await this.getPlayerHistory(playerOne);

        //nothing to do if there is no data for player one
        if(history.length === 0) return true;

        await this.mergePlayersData(playerOne, playerTwo);
 
    }

    //for merging players, to delete from match and effect map/gametype totals use deletePlayerFromMatch instead
    async deletePlayerMatchData(playerId, matchId){

        const query = "DELETE FROM nstats_match_combogib WHERE player_id=? AND match_id=?";

        await mysql.simpleQuery(query, [playerId, matchId]);
    }

    async deleteMapTotalsData(mapId){

        const query = `DELETE FROM nstats_map_combogib WHERE map_id=?`;

        return await mysql.simpleQuery(query, [mapId]);
    }

    async insertMergedMapTotals(mapId, gametypeId, matches, playtime, primary, shockBalls, combos, insane){

        const query = `INSERT INTO nstats_map_combogib VALUES(
            NULL,?,?,?,?,
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

        const vars = [mapId, gametypeId,matches, playtime,
            primary.kills, primary.kpm,
            shockBalls.kills, shockBalls.kpm,
            combos.kills, combos.kpm,
            insane.kills,  insane.kpm,
            combos.bestSingle, combos.bestSinglePlayerId, combos.bestSingleMatchId,
            shockBalls.bestSingle, shockBalls.bestSinglePlayerId, shockBalls.bestSingleMatchId,
            insane.bestSingle, insane.bestSinglePlayerId, insane.bestSingleMatchId,
            primary.best, primary.bestPlayerId, primary.bestMatchId,
            shockBalls.best, shockBalls.bestPlayerId, shockBalls.bestMatchId,
            combos.best, combos.bestPlayerId, combos.bestMatchId,
            insane.best, insane.bestPlayerId, insane.bestMatchId,
            combos.mostKills, combos.mostKillsPlayerId, combos.mostKillsMatchId,
            insane.mostKills, insane.mostKillsPlayerId, insane.mostKillsMatchId,
            shockBalls.mostKills, shockBalls.mostKillsPlayerId, shockBalls.mostKillsMatchId,
            primary.mostKills, primary.mostKillsPlayerId, primary.mostKillsMatchId,
        ];


        await mysql.simpleQuery(query, vars);
    }

    async fixDuplicateMapTotals(mapId){

        const query = `SELECT * FROM nstats_map_combogib WHERE map_id=?`;

        const result = await mysql.simpleQuery(query, [mapId]);

        const mergeTypes = [
            "matches","playtime","primary_kills",
            "shockball_kills","combo_kills", "insane_kills",
        ]; 

        const bestTypes = [
            "best_single_combo",
            "best_single_shockball",
            "best_single_insane",
            "best_primary_spree",
            "best_shockball_spree",
            "best_combo_spree",
            "best_insane_spree",
            "max_combo_kills",
            "max_shockball_kills",
            "max_insane_kills",
            "max_primary_kills",
        ];

        //by gametype
        const totals = {};

        const rowIds = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            rowIds.push(r.id);

            if(totals[r.gametype_id] === undefined){
                totals[r.gametype_id] = r;
                continue;
            }

            const t = totals[r.gametype_id]

            for(let x = 0; x < mergeTypes.length; x++){

                t[mergeTypes[x]] += r[mergeTypes[x]];
            }

            for(let x = 0; x < bestTypes.length; x++){

                if(r[bestTypes[x]] > t[bestTypes[x]]){

                    t[bestTypes[x]] = t[bestTypes[x]];
                    t[`${bestTypes[x]}_player_id`] = t[`${bestTypes[x]}_player_id`];
                    t[`${bestTypes[x]}_match_id`] = t[`${bestTypes[x]}_match_id`];
                }
            }

        }

        //do kpm here once instead of doing it every iteration
        for(const d of Object.values(totals)){

            if(d.playtime === 0){
                d.primary_kpm = 0;
                d.shockball_kpm = 0;
                d.combo_kpm = 0;
                d.insane_kpm = 0;
                continue;
            }

            if(d.primary_kills > 0) d.primary_kpm = d.primary_kills / (d.playtime / 60);
            if(d.shockball_kills > 0) d.shockball_kpm = d.shockball_kills / (d.playtime / 60);
            if(d.combo_kills > 0) d.combo_kpm = d.combo_kills / (d.playtime / 60);
            if(d.insane_kills > 0) d.insane_kpm = d.insane_kills / (d.playtime / 60);

        }

        await this.deleteMapTotalsData(mapId);


        for(const [key, t] of Object.entries(totals)){

            const gametypeId = parseInt(key);
            // /insertNewMapTotals(mapId, gametypeId, matchId, playtime, combos, shockBalls, primary, insane)

            const primary = {
                "kills": t.primary_kills,
                "kpm": t.primary_kpm,
                "mostKills": t.max_primary_kills,
                "mostKillsPlayerId": t.max_primary_kills_player_id,
                "mostKillsMatchId": t.max_primary_kills_match_id,
                "best": t.best_primary_spree,
                "bestPlayerId": t.best_primary_spree_player_id,
                "bestMatchId": t.best_primary_spree_match_id,
            };

            const combo = {
                "kills": t.combo_kills,
                "kpm": t.combo_kpm,
                "mostKills": t.max_combo_kills,
                "mostKillsPlayerId": t.max_combo_kills_player_id,
                "mostKillsMatchId": t.max_combo_kills_match_id,
                "best": t.best_combo_spree,
                "bestPlayerId": t.best_combo_spree_player_id,
                "bestMatchId": t.best_combo_spree_match_id,
                "bestSingle": t.best_single_combo,
                "bestSinglePlayerId": t.best_single_combo_player_id,
                "bestSingleMatchId": t.best_single_combo_match_id,
            };

            const shockball = {
                "kills": t.shockball_kills,
                "kpm": t.shockball_kpm,
                "mostKills": t.max_shockball_kills,
                "mostKillsPlayerId": t.max_shockball_kills_player_id,
                "mostKillsMatchId": t.max_shockball_kills_match_id,
                "best": t.best_shockball_spree,
                "bestPlayerId": t.best_shockball_spree_player_id,
                "bestMatchId": t.best_shockball_spree_match_id,
                "bestSingle": t.best_single_shockball,
                "bestSinglePlayerId": t.best_single_shockball_player_id,
                "bestSingleMatchId": t.best_single_shockball_match_id,
            };

            const insane = {
                "kills": t.insane_kills,
                "kpm": t.insane_kpm,
                "mostKills": t.max_insane_kills,
                "mostKillsPlayerId": t.max_insane_kills_player_id,
                "mostKillsMatchId": t.max_insane_kills_match_id,
                "best": t.best_insane_spree,
                "bestPlayerId": t.best_insane_spree_player_id,
                "bestMatchId": t.best_insane_spree_match_id,
                "bestSingle": t.best_single_insane,
                "bestSinglePlayerId": t.best_single_insane_player_id,
                "bestSingleMatchId": t.best_single_insane_match_id,
            };

            await this.insertMergedMapTotals(mapId, gametypeId, t.matches, t.playtime, primary, shockball, combo, insane);
        }
    }

    async createPlayerTotalWithData(playerId, gametypeId, mapId, data){

        const query = `INSERT INTO nstats_player_combogib VALUES(NULL,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?)`;

        const d = data;

        const vars = [
            playerId, gametypeId, mapId, d.total_matches, d.playtime,
            d.combo_kills, d.combo_deaths, d.combo_efficiency, d.combo_kpm, d.insane_kills,
            d.insane_deaths, d.insane_efficiency, d.insane_kpm, d.shockball_kills, d.shockball_deaths,
            d.shockball_efficiency, d.shockball_kpm, d.primary_kills, d.primary_deaths, d.primary_efficiency,
            d.primary_kpm, d.best_single_combo, d.best_single_combo_match_id, d.best_single_insane, d.best_single_insane_match_id,
            d.best_single_shockball, d.best_single_shockball_match_id, d.max_combo_kills, d.max_combo_kills_match_id, d.max_insane_kills,
            d.max_insane_kills_match_id, d.max_shockball_kills, d.max_shockball_kills_match_id, d.max_primary_kills, d.max_primary_kills_match_id,
            d.best_combo_spree, d.best_combo_spree_match_id, d.best_insane_spree, d.best_insane_spree_match_id, d.best_shockball_spree,
            d.best_shockball_spree_match_id, d.best_primary_spree, d.best_primary_spree_match_id
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async deletePlayerTotalGametypeMapData(playerId, gametypeId, mapId){

        const query = `DELETE FROM nstats_player_combogib WHERE player_id=? AND gametype_id=? AND map_id=?`;

        return await mysql.simpleQuery(query, [playerId, gametypeId, mapId]);
    }

    async fixPlayerTotal(playerId, gametypeId, mapId){

        const getQuery = `SELECT * FROM nstats_player_combogib WHERE player_id=? AND gametype_id=? AND map_id=?`;

        const getResult = await mysql.simpleQuery(getQuery, [playerId, gametypeId, mapId]);

        let totals = {};

        const merge = [
            "total_matches",
            "playtime",
            "combo_kills",
            "combo_deaths",
            "insane_kills",
            "insane_deaths",
            "shockball_kills",
            "shockball_deaths",
            "primary_kills",
            "primary_deaths",
        ];

        const higherBetter = [
            "best_single_combo",
            "best_single_insane",
            "best_single_shockball",
            "max_combo_kills",
            "max_insane_kills",
            "max_shockball_kills",
            "max_primary_kills",
            "best_primary_spree",
            "best_combo_spree",
            "best_insane_spree",
            "best_shockball_spree",
        ];

        const rowsToDelete = [];

        for(let i = 0; i < getResult.length; i++){

            const g = getResult[i];

            rowsToDelete.push(g.id);

            if(i === 0){
                totals = g;
                continue;
            }

            for(let x = 0; x < merge.length; x++){

                totals[merge[x]] += g[merge[x]];
            }

            for(let x = 0; x < higherBetter.length; x++){

                const key = higherBetter[x];

                if(g[key] > totals[key]){

                    const matchKey = `${key}_match_id`;
                    totals[key] = g[key];
                    totals[matchKey] = g[matchKey];

                }
            }
        }

        //do kpm and efficiency here

        const specialTypes = [
            "primary",
            "shockball",
            "combo",
            "insane",
        ];


        const playtime = totals.playtime;

        for(let i = 0; i < specialTypes.length; i++){

            const s = specialTypes[i];

            const kills = `${s}_kills`;
            const deaths = `${s}_deaths`;
            const eff = `${s}_efficiency`;
            const kpm = `${s}_kpm`;

            //eff
            if(totals[kills] > 0){

                if(totals[deaths] > 0){
                    totals[eff] = totals[kills] / (totals[kills] + totals[deaths]) * 100;
                }else{
                    totals[eff] = 100;
                }
            }else{
                totals[eff] = 0;
            }

            //kpm
            if(playtime > 0){

                if(totals[kills] > 0){

                    totals[kpm] = totals[kills] / (playtime / 60);
                }else{
                    totals[kpm] = 0;
                }
            }else{
                totals[kpm] = 0;
            }

        }

        await this.deletePlayerTotalGametypeMapData(playerId, gametypeId, mapId);
        await this.createPlayerTotalWithData(playerId, gametypeId, mapId, totals);
    }

    async fixDuplicatePlayerTotals(){

        const getQuery = `SELECT MIN(id) as original_row, player_id,gametype_id,map_id,COUNT(*) as total_rows FROM nstats_player_combogib GROUP BY player_id,gametype_id,map_id`;

        const getResult = await mysql.simpleQuery(getQuery);

        const duplicates = getResult.filter((r) =>{
            return r.total_rows > 1;
        });
        
        console.log(duplicates);
        console.log(`found ${duplicates.length} duplicates`);

        for(let i = 0; i < duplicates.length; i++){

            const d = duplicates[i];

            await this.fixPlayerTotal(d.player_id, d.gametype_id, d.map_id);
        }
    }

    

    async changeMapId(oldId, newId){

        const tables = [
            "map_combogib",
            "match_combogib",
            "player_combogib"
        ];

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const query = `UPDATE nstats_${t} SET map_id=? WHERE map_id=?`;

            await mysql.simpleQuery(query, [newId, oldId]);
        }

        await this.fixDuplicateMapTotals(newId);
    }
}

module.exports = Combogib;