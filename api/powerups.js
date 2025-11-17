import { bulkInsert, mysqlGetColumns, simpleQuery } from "./database.js";
import { getObjectName } from "./genericServerSide.mjs";

const VALID_DELETE_TYPES = ["gametype", "map"];

const PLAYER_MATCH_TOTALS_COLUMNS = `
    powerup_id,    
    COUNT(*) as total_matches,
    CAST(MAX(times_used) AS UNSIGNED) as times_used_best,
    CAST(SUM(times_used) AS UNSIGNED) as times_used,
    SUM(carry_time) as carry_time,    
    MAX(carry_time_best) as carry_time_best,
    CAST(SUM(total_kills) AS UNSIGNED) as total_kills,
    MAX(total_kills) as best_total_kills,   
    MAX(best_kills) as best_kills_life,
    MAX(best_kills_single_use) as best_kills_single_use,
    CAST(SUM(end_deaths) AS UNSIGNED) as end_deaths,    
    CAST(SUM(end_suicides) AS UNSIGNED) as end_suicides,
    CAST(SUM(end_timeouts) AS UNSIGNED) as end_timeouts,  
    CAST(SUM(end_match_end) AS UNSIGNED) as end_match_end,
    CAST(SUM(carrier_kills) AS UNSIGNED) as carrier_kills, 
    MAX(carrier_kills) as best_total_carrier_kills,
    MAX(carrier_kills_best) as best_carrier_kills_life
`;

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

    

    async bPlayerTotalPowerupExists(playerId, gametypeId, mapId, powerUpId){

        const query = "SELECT COUNT(*) as total_matches FROM nstats_powerups_player_totals WHERE player_id=? AND gametype_id=? AND map_id=? AND powerup_id=?";

        const result = await simpleQuery(query, [playerId, gametypeId, mapId, powerUpId]);

        if(result.length > 0){
            if(result[0].total_matches > 0) return true;
        }

        return false;
    }


    async changeMatchPowerupsPlayerIds(oldId, newId){

        const query = "UPDATE nstats_powerups_player_match SET player_id=? WHERE player_id=?";

        return await simpleQuery(query, [newId, oldId]);
    }

    async deletePlayerMatchData(playerId, matchId){

        const query = "DELETE FROM nstats_powerups_player_match WHERE player_id=? AND match_id=?";
        return await simpleQuery(query, [playerId, matchId]);
    }


    async changeTotalsPowerupsPlayerIds(oldId, newId){

        const query = `UPDATE nstats_powerups_player_totals SET player_id=? WHERE player_id=?`;

        return await simpleQuery(query, [newId, oldId]);
    }

    async deletePlayerTotalsData(playerId){

        const query = `DELETE FROM nstats_powerups_player_totals WHERE player_id=?`;

        return await simpleQuery(query, [playerId]);
    }

    async changeCarryTimePlayerIds(oldId, newId){

        const query = `UPDATE nstats_powerups_carry_times SET player_id=? WHERE player_id=?`;
        return await simpleQuery(query, [newId, oldId]);
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

async function bulkInsertPlayersTotals(data, gametypeId, mapId){

   // if(data.length === 0) return;

    let query = `INSERT INTO nstats_powerups_player_totals (
    player_id,gametype_id,map_id,total_matches,powerup_id,
    times_used,times_used_best,carry_time,carry_time_best,total_kills,best_kills,
    best_kills_single_use,end_deaths,end_suicides,end_timeouts,end_match_end,
    total_carrier_kills,carrier_kills_best,carrier_kills_single_life
    ) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        insertVars.push([
            d.player_id, gametypeId, mapId, d.total_matches, d.powerup_id,
            d.times_used, d.times_used_best,
            d.carry_time,
            d.carry_time_best,
            d.total_kills,
            d.best_kills,
            d.best_kills_single_use,
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

    if(playerIds.length === 0) return;

    let query =  `SELECT COUNT(*) as total_matches,powerup_id,player_id,
    SUM(times_used) as times_used,
    MAX(times_used) as times_used_best,
    SUM(carry_time) as carry_time,
    MAX(carry_time_best) as carry_time_best,
    SUM(total_kills) as total_kills,
    MAX(best_kills) as best_kills,
    MAX(best_kills_single_use) as best_kills_single_use,
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

   // const bestSingleUses = await getPlayersBestSingleUse(playerIds, gametypeId, mapId);


    await bulkInsertPlayersTotals(result, gametypeId, mapId);

}

export async function deleteMatchData(matchId, playerIds, gametypeId, mapId){

    await deleteMatchPlayerData(matchId);
    await deleteMatchPlayerCarryTimes(matchId);


    //map gametype combo
    await recalculatePlayerTotals(playerIds, gametypeId, mapId);

    //map totals
    await recalculatePlayerTotals(playerIds, 0, mapId);

    //gametype totals
    await recalculatePlayerTotals(playerIds, gametypeId, 0);

    //all time totals
    await recalculatePlayerTotals(playerIds, 0, 0);
}


export async function bulkInsertMatchCarryTimes(matchId, matchDate, mapId, gametypeId, data){

    //end reasons : -1 match ended, 0 power up ended, 1 killed, 2 suicide

    const query = `INSERT INTO nstats_powerups_carry_times (
    match_id,gametype_id,map_id,match_date,player_id,powerup_id,
    start_timestamp,end_timestamp,carry_time,kills,end_reason
    ) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        insertVars.push([
            matchId, gametypeId, mapId, matchDate, d.player,
            d.powerUpId,
            d.timestamp,
            d.endTimestamp,
            d.carryTime,
            d.totalKills,
            d.endReason
        ]);
    }

    return await bulkInsert(query, insertVars);
}

export async function bulkInsertPlayerMatchData(matchId, matchDate, mapId, gametypeId, data){

    const query = `INSERT INTO nstats_powerups_player_match (
    match_id,match_date,map_id,gametype_id,player_id,powerup_id,
    times_used,carry_time,carry_time_best,total_kills,best_kills,
    best_kills_single_use,
    end_deaths,end_suicides,end_timeouts,end_match_end,carrier_kills,carrier_kills_best) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        const s = d.stats;


        insertVars.push([
            matchId, matchDate, mapId, gametypeId,
            d.playerId, d.powerUpId, s.timesUsed, s.carryTime, s.bestCarryTime, s.totalKills,
            s.bestKills, s.bestKillsSingleUse, s.totalDeaths, s.totalSuicides, s.totalTimeouts, s.matchEnds, 0, 0
        ]);
    }

    return await bulkInsert(query, insertVars);
}

export async function bulkUpdatePlayerTotals(playerIds, powerUpIds, gametypeId, mapId){

    if(playerIds.length === 0) return;
    if(powerUpIds.length === 0) return;

    //gametype + map combo
    await recalculatePlayerTotals(playerIds, gametypeId, mapId);
    //map totals
    await recalculatePlayerTotals(playerIds, 0, mapId);

    //gametype totals
    await recalculatePlayerTotals(playerIds, gametypeId, 0);

    //all time totals
    await recalculatePlayerTotals(playerIds, 0, 0);

}


export async function deletePlayerData(playerId){


    const tables = [
        "nstats_powerups_carry_times",
        "nstats_powerups_player_match",
        "nstats_powerups_player_totals",
    ];

    for(let i = 0; i < tables.length; i++){

        const t = tables[i];
        await simpleQuery(`DELETE FROM ${t} WHERE player_id=?`, [playerId]);
    }
}

export async function getPlayerProfileData(playerId){

    const query = `SELECT gametype_id,map_id,total_matches,powerup_id,times_used,times_used_best,
    carry_time,carry_time_best,total_kills,best_kills,best_kills_single_use,end_deaths,end_suicides,end_timeouts,end_match_end,
    total_carrier_kills,carrier_kills_best,carrier_kills_single_life FROM nstats_powerups_player_totals WHERE player_id=?`;

    const result = await simpleQuery(query, [playerId]);

    const powerUpIds = new Set();
    const gametypeIds = new Set();
    const mapIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        powerUpIds.add(r.powerup_id);

        if(r.gametype_id !== 0){
            gametypeIds.add(r.gametype_id);
        }

        if(r.map_id !== 0){
             mapIds.add(r.map_id);
        }
    }

    //get powerup names
    const powerupNames = await getObjectName("powerups", [...powerUpIds]);
    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    const mapNames = await getObjectName("maps", [...mapIds]);


    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.gametype_id !== 0){
            r.gametypeName = gametypeNames[r.gametype_id] ?? "Not Found";
        }

        if(r.map_id !== 0){
            r.mapName = mapNames[r.map_id] ?? "Not Found";
        }

        r.powerupName = powerupNames[r.powerup_id] ?? "Not Found";
    }
    return result;
}

/**
 * Change gametype ids or map ids
 * @param {*} oldId 
 * @param {*} newId 
 * @returns 
 */
async function changeCarryTimes(type, oldId, newId){

    type = type.toLowerCase();

    if(VALID_DELETE_TYPES.indexOf(type) === -1) throw new Error(`${type} is not a valid type for changeCarryTimes`);

    let col = "gametype_id";

    if(type === "map") col = "map_id";

    const query = `UPDATE nstats_powerups_carry_times SET ${col}=? WHERE ${col}=?`;

    return await simpleQuery(query, [newId, oldId]);
}

async function changeMatchGametypeOrMap(type, oldId, newId){

    type = type.toLowerCase();

    if(VALID_DELETE_TYPES.indexOf(type) === -1) throw new Error(`${type} is not a valid type for changeMatchGametypeOrMap`);

    let col = "gametype_id";

    if(type === "map") col = "map_id";

    const query = `UPDATE nstats_powerups_player_match SET ${col}=? WHERE ${col}=?`;

    return await simpleQuery(query, [newId, oldId]);
}


async function bulkInsertPlayerTotals(data){

    const query = `INSERT INTO nstats_powerups_player_totals (
        player_id,
        gametype_id,
        map_id,
        total_matches,
        powerup_id,
        times_used,
        times_used_best,
        carry_time,
        carry_time_best,
        total_kills,
        best_kills,
        best_kills_single_use,
        end_deaths,
        end_suicides,
        end_timeouts,
        end_match_end,
        total_carrier_kills,
        carrier_kills_best,
        carrier_kills_single_life
    ) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        insertVars.push([
            d.player_id,
            d.gametype_id,
            d.map_id,
            d.total_matches,
            d.powerup_id, 
            d.times_used,
            d.times_used_best,
            d.carry_time,
            d.carry_time_best,
            d.total_kills,
            d.best_kills_life,
            d.best_kills_single_use,
            d.end_deaths,
            d.end_suicides,
            d.end_timeouts,
            d.end_match_end,
            d.carrier_kills,
            d.best_total_carrier_kills,
            d.best_carrier_kills_life
        ]);
    }

    return await bulkInsert(query, insertVars);
}

async function deleteTotals(type, id){

    type = type.toLowerCase();

    if(VALID_DELETE_TYPES.indexOf(type) === -1) throw new Error(`${type} is not a valid type for delete totals`);

    const query = `DELETE FROM nstats_powerups_player_totals WHERE ${(type === "gametype") ? "gametype_id" : "map_id"}=?`;

    return await simpleQuery(query, [id]);
}

async function recalculateTotals(type, id){

    type = type.toLowerCase();

    if(VALID_DELETE_TYPES.indexOf(type) === -1) throw new Error(`${type} is not a valid type for recalculate totals`);

    let query = `SELECT player_id,map_id,${PLAYER_MATCH_TOTALS_COLUMNS}
    FROM nstats_powerups_player_match WHERE gametype_id=?
    GROUP BY player_id,map_id,powerup_id`;

    if(type === "map"){
        query = `SELECT player_id,gametype_id,${PLAYER_MATCH_TOTALS_COLUMNS}
        FROM nstats_powerups_player_match WHERE map_id=?
        GROUP BY player_id,gametype_id,powerup_id`;
    }

    const data = await simpleQuery(query, [id]);

    const higherBetterKeys = [
        "times_used",
        "carry_time",
        "carry_time_best",
        "total_kills",
        "best_total_kills",
        "best_kills_life",
        "best_kills_single_use",
        "end_deaths",
        "end_suicides",
        "end_timeouts",
        "end_match_end",
        "carrier_kills",
        "best_total_carrier_kills",
        "best_carrier_kills_life"
    ];

    const totals = {};

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(type === "gametype"){
            d.gametype_id = id;
        }else if(type === "map"){
            d.map_id = id;
        }

        if(totals[d.player_id] === undefined){
            totals[d.player_id] = {};
        }

        if(totals[d.player_id][d.powerup_id] === undefined){
            totals[d.player_id][d.powerup_id] = {...d};

            if(type === "gametype"){
                totals[d.player_id][d.powerup_id].map_id = 0;
            }else if(type === "map"){
                totals[d.player_id][d.powerup_id].gametype_id = 0;
            }
            continue;
        }

        const g = totals[d.player_id][d.powerup_id];

        g.total_matches += d.total_matches;

        for(let x = 0; x < higherBetterKeys.length; x++){

            const k = higherBetterKeys[x];

            if(d[k] > g[k]) g[k] = d[k];
        }
    }

    for(const playerData of Object.values(totals)){

        for(const powerupData of Object.values(playerData)){

            data.push(powerupData);
        }
    }

    await deleteTotals(type, id);
    await bulkInsertPlayerTotals(data);
}

export async function mergeGametypes(oldId, newId){

    await changeCarryTimes("gametype", oldId, newId);
    await changeMatchGametypeOrMap("gametype", oldId, newId);
  
    await deleteTotals("gametype", oldId);

    await recalculateTotals("gametype", newId);
}


async function getUniquePlayedMaps(gametypeId){

    const query = `SELECT DISTINCT map_id FROM nstats_powerups_player_match WHERE gametype_id=?`;

    const result = await simpleQuery(query, [gametypeId]);

    return result.map((r) =>{
        return r.map_id;
    });
}


async function deleteAllTimeTotals(){

    const query = `DELETE FROM nstats_powerups_player_totals WHERE gametype_id=0 AND map_id=0`;

    return await simpleQuery(query);
}

async function recalculateAllTimeTotals(){

    const query = `SELECT player_id,${PLAYER_MATCH_TOTALS_COLUMNS}
    FROM nstats_powerups_player_match
    GROUP BY player_id,powerup_id`;

    const data = await simpleQuery(query);

  
    for(let i = 0; i < data.length; i++){

        const d = data[i];
        d.gametype_id = 0;
        d.map_id = 0;
    }

    await deleteAllTimeTotals();
    await bulkInsertPlayerTotals(data);
}

export async function deleteGametype(id){

    const mapIds = await getUniquePlayedMaps(id);
    

    const tables = [
        "nstats_powerups_carry_times",
        "nstats_powerups_player_totals",
        "nstats_powerups_player_match"
    ];

    for(let i = 0; i < tables.length; i++){

        const t = tables[i];
        await simpleQuery(`DELETE FROM ${t} WHERE gametype_id=?`, [id]);
    }

    await recalculateAllTimeTotals();

    for(let i = 0; i < mapIds.length; i++){

        const m = mapIds[i];

        await recalculateTotals("map", m);
    }
}