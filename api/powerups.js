import { bulkInsert, simpleQuery } from "./database.js";

export default class PowerUps{

    constructor(){}


    async createPowerUp(name){

        const query = `INSERT INTO nstats_powerups VALUES(NULL,?,?)`;
        return await simpleQuery(query, [name, name]);
    }
    

    async getPowerUpId(name){

        const query = "SELECT id FROM nstats_powerups WHERE name=? LIMIT 1";

        const result = await simpleQuery(query, [name]);

        if(result.length !== 0) return result[0].id;

        const createResult = await this.createPowerUp(name);

        return createResult.insertId;
    }


    //end reasons : -1 match ended, 0 power up ended, 1 killed, 2 suicide
    async insertPlayerCarryTimes(matchId, gametypeId, mapId, matchDate, playerId, powerUpId, start, end, carryTime, kills, endReason){

        const query = `INSERT INTO nstats_powerups_carry_times VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?)`;
        const vars = [matchId, gametypeId, mapId, matchDate, playerId, powerUpId, start, end, carryTime, kills, endReason];

        return await simpleQuery(query, vars);
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

        return await simpleQuery(query, vars);
    }


    async bPlayerTotalExist(playerId, gametypeId, mapId, powerUpId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_powerups_player_totals WHERE player_id=? AND gametype_id=? AND map_id=? AND powerup_id=?`;

        const result = await simpleQuery(query, [playerId, gametypeId, mapId, powerUpId]);

        if(result.length > 0){
            if(result[0].total_matches > 0) return true;
        }

        return false;
    }

    async insertPlayerTotal(playerId, gametypeId, mapId, powerUpId, stats, playerPlaytime){

        const query = `INSERT INTO nstats_powerups_player_totals VALUES(NULL,?,?,?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0)`;

        const vars = [
            playerId,
            gametypeId,
            mapId,
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

        return await simpleQuery(query, vars);
    }

    async updatePlayerTotals(playerId, gametypeId, mapId, powerUpId, stats, playerPlaytime){

        if(!await this.bPlayerTotalExist(playerId, gametypeId, mapId, powerUpId)){
            await this.insertPlayerTotal(playerId, gametypeId, mapId, powerUpId, stats, playerPlaytime);
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

        return await simpleQuery(query, vars);
    }

    async getItemNames(ids){

        if(ids.length === 0) return {};

        const query = `SELECT id,name FROM nstats_powerups WHERE id IN(?)`;

        const result = await simpleQuery(query, [ids]);

        const found = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            found[r.id] = r.name;
        }

        return found;
    }

    async bPlayerMatchPowerupExists(playerId, matchId, powerUpId){

        const query = "SELECT COUNT(*) as total_matches FROM nstats_powerups_player_match WHERE player_id=? AND powerup_id=? AND match_id=?";

        const result = await simpleQuery(query, [playerId, powerUpId, matchId]);

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

        return await simpleQuery(query, vars);
    }


    async updatePlayerMatchCarrierKills(matchId, matchDate, mapId, gametypeId, playerId, powerUpId, totalKills, bestKills){
        
        if(!await this.bPlayerMatchPowerupExists(playerId, matchId, powerUpId)){

            return await this.insertPlayerMatchDataKillsOnly(matchId, matchDate, mapId, gametypeId, playerId, powerUpId, totalKills, bestKills);  
        }

        const query = `UPDATE nstats_powerups_player_match SET carrier_kills=?,carrier_kills_best=? WHERE player_id=? AND match_id=? AND powerup_id=?`;

        return await simpleQuery(query, [totalKills, bestKills, playerId, matchId, powerUpId]);
    }

    async bPlayerTotalPowerupExists(playerId, gametypeId, mapId, powerUpId){

        const query = "SELECT COUNT(*) as total_matches FROM nstats_powerups_player_totals WHERE player_id=? AND gametype_id=? AND map_id=? AND powerup_id=?";

        const result = await simpleQuery(query, [playerId, gametypeId, mapId, powerUpId]);

        if(result.length > 0){
            if(result[0].total_matches > 0) return true;
        }

        return false;
    }

    async insertPlayerTotalCarrierKillsOnly(playerId, gametypeId, mapId, powerUpId, playerPlaytime, carrierKills, bestCarrierKills){

        const query = `INSERT INTO nstats_powerups_player_totals VALUES(NULL,?,?,?,1,?,?,0,0,0,0,0,0,0,0,0,0,0,?,?,?)`;

        const vars = [
            playerId,
            mapId,
            gametypeId,
            playerPlaytime,
            powerUpId,     
            carrierKills,
            carrierKills,
            bestCarrierKills
        ];

        return await simpleQuery(query, vars);
    }

    async updatePlayerTotalCarrierKills(playerId, gametypeId, mapId, powerUpId, playerPlaytime, totalKills, bestKills){
        
        if(!await this.bPlayerTotalPowerupExists(playerId, gametypeId, mapId, powerUpId)){

            return await this.insertPlayerTotalCarrierKillsOnly(playerId, gametypeId, mapId, powerUpId, playerPlaytime, totalKills, bestKills);  
        }

        const query = `UPDATE nstats_powerups_player_totals SET 
        total_carrier_kills=total_carrier_kills+?,
        carrier_kills_best = IF(carrier_kills_best < ?, ?, carrier_kills_best),
        carrier_kills_single_life = IF(carrier_kills_single_life < ?, ?, carrier_kills_single_life),
        total_playtime=total_playtime+?
        WHERE player_id=? AND gametype_id=? AND powerup_id=?`;

        const vars = [totalKills, totalKills, totalKills, bestKills, bestKills, playerPlaytime, playerId, gametypeId, powerUpId];

        return await simpleQuery(query, vars);
    }

    async changeMatchPowerupsPlayerIds(oldId, newId){

        const query = "UPDATE nstats_powerups_player_match SET player_id=? WHERE player_id=?";

        return await simpleQuery(query, [newId, oldId]);
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

        const result = await simpleQuery(query, [matchId, playerId]);

        if(result.length > 0) return result;

        return null;
    }

    async deletePlayerMatchData(playerId, matchId){

        const query = "DELETE FROM nstats_powerups_player_match WHERE player_id=? AND match_id=?";
        return await simpleQuery(query, [playerId, matchId]);
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

        return await simpleQuery(query, vars);
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

        const result = await simpleQuery(query, [playerId]);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            console.log(`matchId = ${r.match_id} has ${r.total_matches} duplicate entries for player ${playerId}`);

            await this.mergePlayerMatchData(playerId, r.match_id);
        }
    }

    async changeTotalsPowerupsPlayerIds(oldId, newId){

        const query = `UPDATE nstats_powerups_player_totals SET player_id=? WHERE player_id=?`;

        return await simpleQuery(query, [newId, oldId]);
    }

    async deletePlayerTotalsData(playerId){

        const query = `DELETE FROM nstats_powerups_player_totals WHERE player_id=?`;

        return await simpleQuery(query, [playerId]);
    }

    async insertPlayerTotalMerge(playerId, data){

        const query = `INSERT INTO nstats_powerups_player_totals VALUES(
            NULL,?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?)`;

        const vars = [
            playerId, data.gametype_id, data.total_matches, data.total_playtime,
            data.powerup_id, data.times_used, data.times_used_best, data.carry_time,
            data.carry_time_best, data.total_kills, data.best_kills, data.best_kills_single_use, 
            data.end_deaths, data.end_suicides, data.end_timeouts, data.end_match_end, 
            data.total_carrier_kills, data.carrier_kills_best, data.carrier_kills_single_life
        ];

        return await simpleQuery(query, vars);
    }

    async mergeDuplicatePlayerTotals(playerId){

        const query = `SELECT 
        gametype_id,
        SUM(total_matches) as total_matches,
        SUM(total_playtime) as total_playtime,
        powerup_id,
        SUM(times_used) as times_used,
        MAX(times_used_best) as times_used_best,
        SUM(carry_time) as carry_time,
        MAX(carry_time_best) as carry_time_best,
        SUM(total_kills) as total_kills,
        MAX(best_kills) as best_kills,
        MAX(best_kills_single_use) as best_kills_single_use,
        SUM(end_deaths) as end_deaths,
        SUM(end_suicides) as end_suicides,
        SUM(end_timeouts) as end_timeouts,
        SUM(end_match_end) as end_match_end,
        SUM(total_carrier_kills) as total_carrier_kills,
        MAX(carrier_kills_best) as carrier_kills_best,
        MAX(carrier_kills_single_life) as carrier_kills_single_life
        FROM nstats_powerups_player_totals
        WHERE player_id=?
        GROUP BY gametype_id, powerup_id`;

        const totals = await simpleQuery(query, [playerId]);
        await this.deletePlayerTotalsData(playerId);

        for(let i = 0; i < totals.length; i++){

            await this.insertPlayerTotalMerge(playerId, totals[i]);
        }
    }

    async changeCarryTimePlayerIds(oldId, newId){

        const query = `UPDATE nstats_powerups_carry_times SET player_id=? WHERE player_id=?`;
        return await simpleQuery(query, [newId, oldId]);
    }



    async mergePlayers(oldId, newId){

        await this.changeMatchPowerupsPlayerIds(oldId, newId);
        //merge duplicate entries for player
        await this.mergeDuplicateMatchPlayerData(newId);

        //same for player totals
        await this.changeTotalsPowerupsPlayerIds(oldId, newId);
        await this.mergeDuplicatePlayerTotals(newId);

        //same for carry times
        await this.changeCarryTimePlayerIds(oldId, newId);

    }


    async changeMapId(oldId, newId){

        const query = `UPDATE nstats_powerups_player_match SET map_id=? WHERE map_id=?`;

        await simpleQuery(query, [newId, oldId]);
    }
}

export async function getMatchPlayerData(matchId){

    const query = `SELECT player_id,powerup_id,	times_used,carry_time,carry_time_best,
    total_kills,best_kills,end_deaths,end_suicides,end_timeouts,end_match_end,carrier_kills,
    carrier_kills_best
    FROM nstats_powerups_player_match WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}


async function deleteMatchPlayerData(matchId){

    const query = `DELETE FROM nstats_powerups_player_match WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}

async function deleteMatchPlayerCarryTimes(matchId){

    const query = `DELETE FROM nstats_powerups_carry_times WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}


async function deletePlayersTotals(playerIds, gametypeId, mapId){

    let query = `DELETE FROM nstats_powerups_player_totals WHERE player_id IN (?) AND gametype_id=? AND map_id=?`;

    const vars = [playerIds, gametypeId, mapId];

    return await simpleQuery(query, vars);
}

async function bulkInsertPlayersTotals(data, bestSingleUses, gametypeId, mapId){

   // if(data.length === 0) return;

    let query = `INSERT INTO nstats_powerups_player_totals (
    player_id,gametype_id,map_id,total_matches,total_playtime,powerup_id,
    times_used,times_used_best,carry_time,carry_time_best,total_kills,best_kills,
    best_kills_single_use,end_deaths,end_suicides,end_timeouts,end_match_end,
    total_carrier_kills,carrier_kills_best,carrier_kills_single_life
    ) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        insertVars.push([
            d.player_id, gametypeId, mapId, d.total_matches, 0, d.powerup_id,
            d.times_used, d.times_used_best,
            d.carry_time,
            bestSingleUses?.[d.player_id]?.[d.powerup_id]?.best_carry_time ?? 0,
            d.total_kills,
            d.best_kills,
            bestSingleUses?.[d.player_id]?.[d.powerup_id]?.best_single_use_kills ?? 0,
            d.end_deaths,d.end_suicides,d.end_timeouts,d.end_match_end, d.carrier_kills,
            d.max_carrier_kills,
            d.carrier_kills_best,
        ]);
    }

    return await bulkInsert(query, insertVars);
}

async function getPlayersBestSingleUse(playerIds, gametypeId, mapId){

    let query = `SELECT MAX(kills) as best_single_use_kills,MAX(carry_time) as best_carry_time,player_id,powerup_id
    FROM nstats_powerups_carry_times WHERE player_id IN (?)`;

    const vars = [playerIds];

    if(gametypeId !== 0){
        vars.push(gametypeId);
        query += ` AND gametype_id=?`;
    }

    if(mapId !== 0){
        vars.push(mapId);
        query += ` AND map_id=?`;
    }

    const result = await simpleQuery(`${query} GROUP BY player_id,powerup_id`, vars);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(data[r.player_id] === undefined){
            data[r.player_id] = {};
        }

        if(data[r.player_id][r.powerup_id] === undefined){
            data[r.player_id][r.powerup_id] = {
                "best_single_use_kills": r.best_single_use_kills,
                "best_carry_time": r.best_carry_time
            };
        }
    }

    return data;
}

async function recalculatePlayerTotals(playerIds, gametypeId, mapId){


    let query =  `SELECT COUNT(*) as total_matches,powerup_id,player_id,
    SUM(times_used) as times_used,
    MAX(times_used) as times_used_best,
    SUM(carry_time) as carry_time,
    MAX(carry_time_best) as carry_times_best,
    SUM(total_kills) as total_kills,
    MAX(best_kills) as best_kills,
    SUM(end_deaths) as end_deaths,
    SUM(end_suicides) as end_suicides,
    SUM(end_timeouts) as end_timeouts,
    SUM(end_match_end) as end_match_end,
    SUM(carrier_kills) as carrier_kills,
    MAX(carrier_kills) as max_carrier_kills,
    MAX(carrier_kills_best) as carrier_kills_best
    FROM nstats_powerups_player_match WHERE player_id IN(?)`;

    const vars = [playerIds];

    if(gametypeId !== 0){
        query += ` AND gametype_id=?`;
        vars.push(gametypeId);
    }

    if(mapId !== 0){
        query += ` AND map_id=?`;
        vars.push(mapId);
    }

    const result = await simpleQuery(`${query} GROUP BY player_id,powerup_id`, vars);

    await deletePlayersTotals(playerIds, gametypeId, mapId);

    const bestSingleUses = await getPlayersBestSingleUse(playerIds, gametypeId, mapId);


    await bulkInsertPlayersTotals(result, bestSingleUses, gametypeId, mapId);

}

export async function deleteMatchData(matchId, playerIds, gametypeId, mapId){

   // await deleteMatchPlayerData(matchId);
   // await deleteMatchPlayerCarryTimes(matchId);


    //map gametype combo
    await recalculatePlayerTotals(playerIds, gametypeId, mapId);

    //map totals
    await recalculatePlayerTotals(playerIds, 0, mapId);

    //gametype totals
    await recalculatePlayerTotals(playerIds, gametypeId, 0);

    //all time totals
    await recalculatePlayerTotals(playerIds, 0, 0);
}