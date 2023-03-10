const mysql = require("./database");

class PowerUps{

    constructor(){}


    async createPowerUp(name){

        const query = `INSERT INTO nstats_powerups VALUES(NULL,?,?)`;
        return await mysql.simpleQuery(query, [name, name]);
    }
    

    async getPowerUpId(name){

        const query = "SELECT id FROM nstats_powerups WHERE name=? LIMIT 1";

        const result = await mysql.simpleQuery(query, [name]);

        if(result.length !== 0) return result[0].id;

        const createResult = await this.createPowerUp(name);

        return createResult.insertId;
    }


    //end reasons : -1 match ended, 0 power up ended, 1 killed, 2 suicide
    async insertPlayerCarryTimes(matchId, matchDate, playerId, powerUpId, start, end, carryTime, kills, endReason){

        const query = `INSERT INTO nstats_powerups_carry_times VALUES(NULL,?,?,?,?,?,?,?,?,?)`;
        const vars = [matchId, matchDate, playerId, powerUpId, start, end, carryTime, kills, endReason];

        return await mysql.simpleQuery(query, vars);
    }

    async insertPlayerMatchData(matchId, matchDate, mapId, gametypeId, playerId, powerUpId, stats){

        const query = `INSERT INTO nstats_powerups_player_match VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0)`;

        const vars = [
            matchId,
            matchDate, 
            mapId,
            gametypeId,
            playerId,
            powerUpId,
            stats.timesUsed,
            stats.carryTime,
            stats.bestCarryTime,
            stats.totalKills,
            stats.bestKills,
            stats.totalDeaths,
            stats.totalSuicides,
            stats.totalTimeouts,
            stats.matchEnds
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async bPlayerTotalExist(playerId, gametypeId, powerUpId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_powerups_player_totals WHERE player_id=? AND gametype_id=? AND powerup_id=?`;

        const result = await mysql.simpleQuery(query, [playerId, gametypeId, powerUpId]);

        if(result.length > 0){
            if(result[0].total_matches > 0) return true;
        }

        return false;
    }

    async insertPlayerTotal(playerId, gametypeId, powerUpId, stats, playerPlaytime){

        const query = `INSERT INTO nstats_powerups_player_totals VALUES(NULL,?,?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0)`;

        const vars = [
            playerId,
            gametypeId,
            playerPlaytime,
            powerUpId,     
            stats.timesUsed,
            stats.timesUsed,
            stats.carryTime,
            stats.bestCarryTime,
            stats.totalKills,
            stats.totalKills,
            stats.bestKills,
            stats.totalDeaths,
            stats.totalSuicides,
            stats.totalTimeouts,
            stats.matchEnds
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerTotals(playerId, gametypeId, powerUpId, stats, playerPlaytime){

        if(!await this.bPlayerTotalExist(playerId, gametypeId, powerUpId)){
            await this.insertPlayerTotal(playerId, gametypeId, powerUpId, stats, playerPlaytime);
            return;
        }

        const query = `UPDATE nstats_powerups_player_totals SET
            total_matches=total_matches+1,
            total_playtime=total_playtime+?,
            times_used=times_used+?,
            times_used_best = IF(times_used_best < ?, ?, times_used_best),
            carry_time=carry_time+?,
            carry_time_best = IF(carry_time_best < ?, ?, carry_time_best),
            total_kills=total_kills+?,
            best_kills = IF(best_kills < ?, ?, best_kills),
            best_kills_single_use = IF(best_kills_single_use < ?, ?, best_kills_single_use),
            end_deaths=end_deaths+?,
            end_suicides=end_suicides+?,
            end_timeouts=end_timeouts+?,
            end_match_end=end_match_end+?
            WHERE player_id=?
            AND gametype_id=?
            AND powerup_id=?`;


        const vars = [
            playerPlaytime,
            stats.timesUsed,
            stats.timesUsed, stats.timesUsed,
            stats.carryTime,
            stats.carryTime, stats.carryTime,
            stats.totalKills,
            stats.totalKills, stats.totalKills,
            stats.bestKills, stats.bestKills,
            stats.totalDeaths,
            stats.totalSuicides,
            stats.totalTimeouts,
            stats.matchEnds,
            playerId,
            gametypeId,
            powerUpId
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async getMatchPlayerData(matchId){

        const query = `SELECT player_id,powerup_id,	times_used,carry_time,carry_time_best,
        total_kills,best_kills,end_deaths,end_suicides,end_timeouts,end_match_end,carrier_kills,
        carrier_kills_best
        FROM nstats_powerups_player_match WHERE match_id=?`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    getUniquePowerupIds(playerMatchData){

        const found = new Set();

        for(let i = 0; i < playerMatchData.length; i++){

            const p = playerMatchData[i];

            found.add(p.powerup_id);
        }

        return [...found];
    }

    async getItemNames(ids){

        if(ids.length === 0) return {};

        const query = `SELECT id,name FROM nstats_powerups WHERE id IN(?)`;

        const result = await mysql.simpleQuery(query, [ids]);

        const found = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            found[r.id] = r.name;
        }

        return found;
    }

    async bPlayerMatchPowerupExists(playerId, matchId, powerUpId){

        const query = "SELECT COUNT(*) as total_matches FROM nstats_powerups_player_match WHERE player_id=? AND powerup_id=? AND match_id=?";

        const result = await mysql.simpleQuery(query, [playerId, powerUpId, matchId]);

        if(result.length > 0){
            if(result[0].total_matches > 0) return true;
        }

        return false;
    }

    
    async insertPlayerMatchDataKillsOnly(matchId, matchDate, mapId, gametypeId, playerId, powerUpId, totalKills, bestKills){

        const query = `INSERT INTO nstats_powerups_player_match VALUES(NULL,?,?,?,?,?,?,0,0,0,0,0,0,0,0,0,?,?)`;

        const vars = [
            matchId,
            matchDate, 
            mapId,
            gametypeId,
            playerId,
            powerUpId,
            totalKills,
            bestKills
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async updatePlayerMatchCarrierKills(matchId, matchDate, mapId, gametypeId, playerId, powerUpId, totalKills, bestKills){
        
        if(!await this.bPlayerMatchPowerupExists(playerId, matchId, powerUpId)){

            return await this.insertPlayerMatchDataKillsOnly(matchId, matchDate, mapId, gametypeId, playerId, powerUpId, totalKills, bestKills);  
        }

        const query = `UPDATE nstats_powerups_player_match SET carrier_kills=?,carrier_kills_best=? WHERE player_id=? AND match_id=? AND powerup_id=?`;

        return await mysql.simpleQuery(query, [totalKills, bestKills, playerId, matchId, powerUpId]);
    }

    async bPlayerTotalPowerupExists(playerId, gametypeId, powerUpId){

        const query = "SELECT COUNT(*) as total_matches FROM nstats_powerups_player_totals WHERE player_id=? AND gametype_id=? AND powerup_id=?";

        const result = await mysql.simpleQuery(query, [playerId, gametypeId, powerUpId]);

        if(result.length > 0){
            if(result[0].total_matches > 0) return true;
        }

        return false;
    }

    async insertPlayerTotalCarrierKillsOnly(playerId, gametypeId, powerUpId, playerPlaytime, carrierKills, bestCarrierKills){

        const query = `INSERT INTO nstats_powerups_player_totals VALUES(NULL,?,?,1,?,?,0,0,0,0,0,0,0,0,0,0,0,?,?,?)`;

        const vars = [
            playerId,
            gametypeId,
            playerPlaytime,
            powerUpId,     
            carrierKills,
            carrierKills,
            bestCarrierKills
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerTotalCarrierKills(playerId, gametypeId, powerUpId, playerPlaytime, totalKills, bestKills){
        
        if(!await this.bPlayerTotalPowerupExists(playerId, gametypeId, powerUpId)){

            return await this.insertPlayerTotalCarrierKillsOnly(playerId, gametypeId, powerUpId, playerPlaytime, totalKills, bestKills);  
        }

        const query = `UPDATE nstats_powerups_player_totals SET 
        total_carrier_kills=total_carrier_kills+?,
        carrier_kills_best = IF(carrier_kills_best < ?, ?, carrier_kills_best),
        carrier_kills_single_life = IF(carrier_kills_single_life < ?, ?, carrier_kills_single_life),
        total_playtime=total_playtime+?
        WHERE player_id=? AND gametype_id=? AND powerup_id=?`;

        const vars = [totalKills, totalKills, totalKills, bestKills, bestKills, playerPlaytime, playerId, gametypeId, powerUpId];

        return await mysql.simpleQuery(query, vars);
    }

    async changeMatchPowerupsPlayerIds(oldId, newId){

        const query = "UPDATE nstats_powerups_player_match SET player_id=? WHERE player_id=?";

        return await mysql.simpleQuery(query, [newId, oldId]);
    }

    async getPlayerMatchData(playerId, matchId){


        const query = `SELECT
        powerup_id,
        match_date,
        map_id,
        gametype_id,
        SUM(times_used) as times_used,
        SUM(carry_time) as carry_time,
        MAX(carry_time_best) as carry_time_best,
        SUM(total_kills) as total_kills,
        MAX(best_kills) as best_kills,
        SUM(end_deaths) as end_deaths,
        SUM(end_suicides) as end_suicides,
        SUM(end_timeouts) as end_timeouts,
        SUM(end_match_end) as end_match_end,
        SUM(carrier_kills) as carrier_kills,
        MAX(carrier_kills_best) as carrier_kills_best 
        FROM nstats_powerups_player_match
        WHERE match_id=? AND player_id=?
        GROUP BY powerup_id,match_date,map_id,gametype_id`;

        const result = await mysql.simpleQuery(query, [matchId, playerId]);

        if(result.length > 0) return result;

        return null;
    }

    async deletePlayerMatchData(playerId, matchId){

        const query = "DELETE FROM nstats_powerups_player_match WHERE player_id=? AND match_id=?";
        return await mysql.simpleQuery(query, [playerId, matchId]);
    }

    async insertPlayerMatchDataMerge(playerId, matchId, data){

        const query = `INSERT INTO nstats_powerups_player_match VALUES(NULL,
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        
        const vars = [
            matchId, 
            data.match_date,
            data.map_id,
            data.gametype_id,
            playerId,
            data.powerup_id,
            data.times_used,
            data.carry_time,
            data.carry_time_best,
            data.total_kills,
            data.best_kills,
            data.end_deaths,
            data.end_suicides,
            data.end_timeouts,
            data.end_match_end,
            data.carrier_kills,
            data.carrier_kills_best
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async mergePlayerMatchData(playerId, matchId){

        const totals = await this.getPlayerMatchData(playerId, matchId);

        if(totals === null) throw new Error(`Powerups.mergePlayerMatchData(${playerId}, ${matchId}) totals is null.`);

        await this.deletePlayerMatchData(playerId, matchId);

        for(let i = 0; i < totals.length; i++){

            const t = totals[i];

            await this.insertPlayerMatchDataMerge(playerId, matchId, t);
        }

    }

    async mergeDuplicateMatchPlayerData(playerId){

        const query = `SELECT COUNT(*) as total_matches, match_id FROM nstats_powerups_player_match WHERE player_id=? GROUP BY match_id`;

        const result = await mysql.simpleQuery(query, [playerId]);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            console.log(`matchId = ${r.match_id} has ${r.total_matches} duplicate entries for player ${playerId}`);

            await this.mergePlayerMatchData(playerId, r.match_id);
        }
    }

    async mergePlayers(oldId, newId){

        await this.changeMatchPowerupsPlayerIds(oldId, newId);
        //merge duplicate entries for player
        await this.mergeDuplicateMatchPlayerData(newId);

        //same for player totals

        //same for carry times


    }
}



module.exports = PowerUps;