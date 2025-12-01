import { bulkInsert, simpleQuery } from "./database.js";
import { getObjectName } from "./genericServerSide.mjs";

const PLAYER_TOTALS_MATCH_COLUMNS = `COUNT(*) as total_matches,
SUM(playtime) as playtime,
SUM(telefrag_kills) as telefrag_kills,
MAX(telefrag_kills) as best_telefrag_kills,
SUM(telefrag_deaths) as telefrag_deaths,
MAX(telefrag_deaths) as worst_telefrag_deaths,
MAX(telefrag_best_spree) as telefrag_best_spree,
MAX(telefrag_best_multi) as telefrag_best_multi,
SUM(tele_disc_kills) as tele_disc_kills,
MAX(tele_disc_kills) as best_tele_disc_kills,
SUM(tele_disc_deaths) as tele_disc_deaths,
MAX(tele_disc_deaths) as worst_tele_disc_deaths,
MAX(tele_disc_best_spree) as tele_disc_best_spree,
MAX(tele_disc_best_multi) as tele_disc_best_multi`;

export default class Telefrags{

    constructor(){}

    async deletePlayer(playerId){

        return await deletePlayer(playerId);
    }

    async changePlayerIds(oldId, newId){

        const query = `UPDATE nstats_tele_frags SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        const vars = [
            oldId, newId,
            oldId, newId
        ];

        return await simpleQuery(query, vars);
    }

    async changeMapId(oldId, newId){

        const query = `UPDATE nstats_tele_frags SET map_id=? WHERE map_id=?`;

        await simpleQuery(query, [newId, oldId]);
    }
}


export async function getMatchData(matchId){

    const query = `SELECT timestamp,killer_id,killer_team,victim_id,victim_team,disc_kill 
    FROM nstats_tele_frags WHERE match_id=? ORDER BY timestamp ASC`;

    return await simpleQuery(query, [matchId]);
}

export async function getPlayerMatchKills(matchId, targetPlayerId){

    const query = `SELECT timestamp,killer_id,killer_team,victim_id,victim_team,disc_kill 
    FROM nstats_tele_frags WHERE match_id=? 
    AND (killer_id=? || victim_id=?)`;

    return await simpleQuery(query, [matchId, targetPlayerId, targetPlayerId]);
}

export async function getPlayerTotals(playerId){

    const query = `SELECT * FROM nstats_player_telefrags WHERE player_id=?`;
    const result = await simpleQuery(query, [playerId]);

    const gametypeIds = new Set();
    const mapIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.gametype_id !== 0) gametypeIds.add(r.gametype_id);
        if(r.map_id !== 0) mapIds.add(r.map_id);
    }

    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    const mapNames = await getObjectName("maps", [...mapIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        if(r.gametype_id !== 0) r.gametypeName = gametypeNames[r.gametype_id] ?? "Not Found";
        if(r.map_id !== 0) r.mapName = mapNames[r.map_id] ?? "Not Found";
    }

    return result;

}


async function createPlayerTotal(playerId, mapId, gametypeId){

    const query = `INSERT INTO nstats_player_telefrags VALUES(NULL,?,?,?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)`;

    return await simpleQuery(query, [playerId, mapId, gametypeId]);
}

export async function deleteMatchData(id){

    const query = `DELETE FROM nstats_tele_frags WHERE match_id=?`;

    return await simpleQuery(query, [id]);
}

async function bPlayerTotalExist(playerId, mapId, gametypeId){

    const query = `SELECT COUNT(*) as total_matches FROM nstats_player_telefrags WHERE player_id=? AND map_id=? AND gametype_id=?`;

    const result = await simpleQuery(query, [playerId, mapId, gametypeId]);

    if(result[0].total_matches > 0) return true;
    return false;
}

async function updatePlayerTotalCustom(playerId, mapId, gametypeId, data){

    // console.log(`updatePlayerTotalCustom(${playerId}, ${mapId}, ${gametypeId})`);



    if(!await bPlayerTotalExist(playerId, mapId, gametypeId)){
        //console.log(`CREATE NEW player total custom ${playerId}, ${mapId}, ${gametypeId}`);
        await createPlayerTotal(playerId, mapId, gametypeId);
    }

    //possible fix for merging players with no playtime?
    if(data.deaths === undefined){

        //console.log(`TEST-ERROR: data.deaths is undefined`);
        //console.log(data);
        return;
    }

    const query = `UPDATE nstats_player_telefrags SET 
    total_matches=total_matches+?,
    playtime=playtime+?,
    tele_kills = tele_kills+?,
    tele_deaths = tele_deaths+?,
    tele_efficiency = IF(tele_kills > 0, IF(tele_deaths > 0, (tele_kills / (tele_kills + tele_deaths)) * 100, 100) ,0),
    best_tele_kills = IF(best_tele_kills < ?, ?, best_tele_kills),
    worst_tele_deaths = IF(worst_tele_deaths < ?, ?, worst_tele_deaths),
    best_tele_multi = IF(best_tele_multi < ?, ?, best_tele_multi),
    best_tele_spree = IF(best_tele_spree < ?, ?, best_tele_spree),
    disc_kills = disc_kills+?,
    disc_deaths = disc_deaths+?,
    disc_efficiency = IF(disc_kills > 0, IF(disc_deaths > 0, (disc_kills / (disc_kills + disc_deaths)) * 100, 100), 0),
    best_disc_kills = IF(best_disc_kills < ?, ?, best_disc_kills),
    worst_disc_deaths = IF(worst_disc_deaths < ?, ?, worst_disc_deaths),
    best_disc_multi = IF(best_disc_multi < ?, ?, best_disc_multi),
    best_disc_spree = IF(best_disc_spree < ?, ?, best_disc_spree)
    WHERE player_id=? AND map_id=? AND gametype_id=?`;

    const vars = [     
        data.total_matches,
        data.playtime, 
        data.total,
        data.deaths,
        data.total, data.total,
        data.deaths, data.deaths,
        data.bestMulti, data.bestMutli,
        data.bestSpree, data.bestSpree,
        data.discKills,
        data.discDeaths,
        data.discKills, data.discKills,
        data.discDeaths, data.discDeaths,
        data.discKillsBestMulti, data.discKillsBestMulti,
        data.discKillsBestSpree, data.discKillsBestSpree,
        playerId, mapId, gametypeId,
    ];

    return await simpleQuery(query, vars);
}

async function insertCustomTotal(playerId, data){


    const query = `INSERT INTO nstats_player_telefrags VALUES(
        NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
    )`;

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.playtime === 0) continue;

        let teleEff = 0;

        if(d.telefrag_kills > 0){

            if(d.telefrag_deaths > 0){

                teleEff = (d.telefrag_kills / (d.telefrag_kills + d.telefrag_deaths)) * 100;
            }else{
                teleEff = 100;
            }
        }

        let discEff = 0;

        if(d.tele_disc_kills > 0){

            if(d.tele_disc_deaths > 0){

                discEff = (d.tele_disc_kills / (d.tele_disc_kills + d.tele_disc_deaths)) * 100;
            }else{
                discEff = 100;
            }
        }
        const vars = [
            playerId, d.map_id, d.gametype, d.playtime, d.total_matches,
            d.telefrag_kills, d.telefrag_deaths, teleEff,
            d.best_telefrag_kills, d.worst_telefrag_deaths, d.telefrag_best_multi, d.telefrag_best_spree,
            d.tele_disc_kills, d.tele_disc_deaths, discEff,
            d.best_tele_disc_kills, d.worst_tele_disc_deaths, d.tele_disc_best_multi, d.tele_disc_best_spree
        ];

        await simpleQuery(query, vars);

        //all time total
 
        await updatePlayerTotalCustom(playerId, 0, 0, d);
        await updatePlayerTotalCustom(playerId, d.map_id, 0, d);
        

        await updatePlayerTotalCustom(playerId, 0, d.gametype, d);
        await updatePlayerTotalCustom(playerId, d.map_id, d.gametype, d);
    }

    
}

export async function recalculatePlayerTotals(playerId){

    const query = `SELECT gametype,map_id,
    ${PLAYER_TOTALS_MATCH_COLUMNS}
    FROM nstats_player_matches WHERE player_id=? GROUP BY gametype, map_id`;

    const result = await simpleQuery(query, [playerId]);

    if(result.length > 0){
        await insertCustomTotal(playerId, result);
    }//else{
      //  console.log(`No data to create telefrag totals for playerId ${playerId}`);
    //}
}


async function deletePlayer(playerId){
    const query = `DELETE FROM nstats_player_telefrags WHERE player_id=?`;
    return await simpleQuery(query, [playerId]);
}

async function deletePlayersTotals(ids){

    if(ids.length === 0) return;

    for(let i = 0; i < ids.length; i++){

        await deletePlayer(ids[i]);
    }

}

export async function recalculateTelefragPlayersTotals(ids){

    await deletePlayersTotals(ids);

    for(let i = 0; i < ids.length; i++){

        await recalculatePlayerTotals(ids[i]);
    }
}


export async function deletePlayerData(playerId){

    //nstats_player_telefrags player_id recalc

    const totalQuery = `DELETE FROM nstats_player_telefrags WHERE player_id=?`;

    await simpleQuery(totalQuery, [playerId]);

    const query = `DELETE FROM nstats_tele_frags WHERE killer_id=? OR victim_id=?`;

    return await simpleQuery(query, [playerId, playerId]);
}

async function getUniqueMapIdsForGametype(gametypeId){

    const query = `SELECT DISTINCT map_id FROM nstats_tele_frags WHERE gametype_id=?`;
    const result = await simpleQuery(query, [gametypeId]);

    return result.map((r) =>{
        return r.map_id;
    });
}

export async function deleteTotals(type, id){

    type = type.toLowerCase();

    const valid = ["gametype", "map"];

    if(valid.indexOf(type) === -1) throw new Error(`${type} is no a valid type of deleteTotals`);

    const query = `DELETE FROM nstats_player_telefrags WHERE ${(type === "gametype") ? "gametype_id" : "map_id"}=?`;
    
    return await simpleQuery(query, [id]);
}

async function bulkInsertGametype(data){

    const query = `INSERT INTO nstats_player_telefrags (
        player_id,map_id,gametype_id,playtime,total_matches,tele_kills,
        tele_deaths,tele_efficiency,best_tele_kills,worst_tele_deaths,
        best_tele_multi,best_tele_spree,disc_kills,disc_deaths,disc_efficiency,
        best_disc_kills,worst_disc_deaths,best_disc_multi,best_disc_spree
    ) VALUES ?`;
    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let teleEff = 0;

        if(d.telefrag_kills > 0){
            if(d.telefrag_deaths === 0){
                teleEff = 100;
            }else{
                teleEff = d.telefrag_kills / (d.telefrag_kills + d.telefrag_deaths) * 100;
            }
        }

        let discEff = 0;

        if(d.tele_disc_kills > 0){
            if(d.tele_disc_deaths === 0){
                discEff = 100;
            }else{
                discEff = d.tele_disc_kills / (d.tele_disc_kills + d.tele_disc_deaths) * 100;
            }
        }

        insertVars.push([
            d.player_id, d.map_id, d.gametype, d.playtime, d.total_matches, d.telefrag_kills,
            d.telefrag_deaths, teleEff, d.best_telefrag_kills, d.worst_telefrag_deaths,
            d.telefrag_best_multi, d.telefrag_best_spree, d.tele_disc_kills, d.tele_disc_deaths,
            discEff, d.best_tele_disc_kills, d.worst_tele_disc_deaths, d.tele_disc_best_multi,
            d.tele_disc_best_spree
        ]);

    }


    await bulkInsert(query, insertVars);

    //console.log(insertVars);
}

async function recalculateTotals(type, id){

    type = type.toLowerCase();

    const valid = ["gametype", "map"];

    if(valid.indexOf(type) === -1) throw new Error(`${type} is not a valid type for recalculateTotals`);

    let query = "";

    if(type === "gametype"){

        query = `SELECT gametype,map_id,player_id,
        ${PLAYER_TOTALS_MATCH_COLUMNS}
        FROM nstats_player_matches WHERE gametype=? GROUP BY player_id,map_id`;

    }else if(type === "map"){
        query = `SELECT gametype,map_id,player_id,
        ${PLAYER_TOTALS_MATCH_COLUMNS}
        FROM nstats_player_matches WHERE map_id=? GROUP BY player_id,gametype`;
    }

    const result = await simpleQuery(query, [id]);


    const totals = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(totals[r.player_id] === undefined){

            totals[r.player_id] = {
                "map_id":  0,
                "player_id": r.player_id,
                "total_matches": 0,
                "playtime": 0,
                "telefrag_kills": 0,
                "best_telefrag_kills": 0,
                "telefrag_deaths": 0,
                "worst_telefrag_deaths": 0,
                "telefrag_best_spree": 0,
                "telefrag_best_multi": 0,
                "tele_disc_kills": 0,
                "best_tele_disc_kills": 0,
                "tele_disc_deaths": 0,
                "worst_tele_disc_deaths": 0,
                "tele_disc_best_spree": 0,
                "tele_disc_best_multi": 0
            }

            if(type === "gametype"){

                totals[r.player_id].gametype = id;

            }else if(type === "map"){

                totals[r.player_id].map_id = id;
            }
        }

        const p = totals[r.player_id];

        p.total_matches++;

        p.playtime += r.playtime;
        p.telefrag_kills += parseInt(r.telefrag_kills);

        if(p.best_telefrag_kills < r.best_telefrag_kills){
            p.best_telefrag_kills = r.best_telefrag_kills
        }

        p.telefrag_deaths += parseInt(r.telefrag_deaths);

        if(p.worst_telefrag_deaths < r.worst_telefrag_deaths){
            p.worst_telefrag_deaths = r.worst_telefrag_deaths;
        }

        if(p.telefrag_best_spree < r.telefrag_best_spree){
            p.telefrag_best_spree = r.telefrag_best_spree;
        }

        if(p.telefrag_best_multi < r.telefrag_best_multi){
            p.telefrag_best_multi = r.telefrag_best_multi;
        }

        if(p.best_tele_disc_kills < r.best_tele_disc_kills){
            p.best_tele_disc_kills = r.best_tele_disc_kills;
        }

        if(p.worst_tele_disc_deaths < r.worst_tele_disc_deaths){
            p.worst_tele_disc_deaths = r.worst_tele_disc_deaths;
        }

        if(p.tele_disc_best_spree < r.tele_disc_best_spree){
            p.tele_disc_best_spree = r.tele_disc_best_spree;
        }

        if(p.tele_disc_best_multi < r.tele_disc_best_multi){
            p.tele_disc_best_multi = r.tele_disc_best_multi;
        }
        
        p.tele_disc_kills += parseInt(r.tele_disc_kills);
        p.tele_disc_deaths += parseInt(r.tele_disc_deaths);
    }

    for(const p of Object.values(totals)){
        result.push(p);
    }

    await deleteTotals(type, id);

    await bulkInsertGametype(result); 
}


export async function mergeGametypes(oldId, newId){

    const query = `UPDATE nstats_tele_frags SET gametype_id=? WHERE gametype_id=?`;

    await simpleQuery(query, [newId, oldId]);

    await deleteTotals("gametype", oldId);
    await recalculateTotals("gametype", newId);
   
}


export async function deleteGametype(id){


    const mapIds = await getUniqueMapIdsForGametype(id);

    const tables = [
        "nstats_tele_frags",
        "nstats_player_telefrags"
    ];


    for(let i = 0; i < tables.length; i++){

        const t = tables[i];

        await simpleQuery(`DELETE FROM ${t} WHERE gametype_id=?`, [id]);
    }

    for(let i = 0; i < mapIds.length; i++){

        const m = mapIds[i];
        await recalculateTotals("map", m);
    }
}


function addToInsertVars(insertVars, d){

    let teleEff = 0;
    let discEff = 0;

    insertVars.push([
        d.player_id, d.map_id, d.gametype, d.playtime, d.total_matches, d.telefrag_kills, d.telefrag_deaths,
        teleEff, d.best_telefrag_kills, d.worst_telefrag_deaths, d.telefrag_best_multi, d.telefrag_best_spree,
        d.tele_disc_kills, d.tele_disc_deaths, discEff, d.best_tele_disc_kills, d.worst_tele_disc_deaths,
        d.tele_disc_best_multi, d.tele_disc_best_spree
    ]);
}

async function bulkInsertPlayers(totals, gametypes, maps){

    const query = `INSERT INTO nstats_player_telefrags (
    player_id,map_id,gametype_id,playtime,total_matches,tele_kills,tele_deaths,
    tele_efficiency,best_tele_kills,worst_tele_deaths,
    best_tele_multi,best_tele_spree,
    disc_kills,disc_deaths,disc_efficiency,best_disc_kills,worst_disc_deaths,
    best_disc_multi,best_disc_spree) VALUES ?`;

    const insertVars = [];

    for(const playerData of Object.values(totals)){
        addToInsertVars(insertVars, playerData);
    }

    for(const gametypeData of Object.values(gametypes)){

        for(const playerData of Object.values(gametypeData)){
            addToInsertVars(insertVars, playerData);
        }
    }

    for(const mapData of Object.values(maps)){

        for(const playerData of Object.values(mapData)){
            addToInsertVars(insertVars, playerData);
        }
    }

    //console.log(insertVars);
    //console.log(insertVars.length);

    return await bulkInsert(query, insertVars);
}


async function deleteMultiplePlayerTotals(playerIds){

    if(playerIds.length === 0) return;

    const query = `DELETE FROM nstats_player_telefrags WHERE player_id IN(?)`;

    return await simpleQuery(query, [playerIds]);
}

/**
 * used by the imported
 */
export async function bulkUpdatePlayers(playerIds){


    if(playerIds.length === 0) return;

    const query = `SELECT player_id,map_id,gametype,${PLAYER_TOTALS_MATCH_COLUMNS} FROM nstats_player_matches WHERE player_id IN(?) GROUP BY player_id,gametype,map_id`;

    const data = await simpleQuery(query, [playerIds]);


    const totals = {};
    const gametypes = {};
    const maps = {};
    //console.log(data);

    const higherBetterKeys = [
        "best_telefrag_kills",
        "worst_telefrag_deaths",
        "telefrag_best_spree",
        "telefrag_best_multi",
        "best_tele_disc_kills",
        "worst_tele_disc_deaths",
        "tele_disc_best_spree",
        "tele_disc_best_multi",
    ];

    const mergeKeys = [
        "total_matches",
        "playtime",
        "telefrag_kills",
        "telefrag_deaths",
        "tele_disc_kills",
        "tele_disc_deaths",
    ];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.playtime === 0) continue;

        let bSkipTotalsMerge = false;
        let bSkipGametypeMerge = false;
        let bSkipMapMerge = false;

        if(totals[d.player_id] === undefined){

            totals[d.player_id] = {...d};
            totals[d.player_id].gametype = 0;
            totals[d.player_id].map_id = 0;
            bSkipTotalsMerge = true;
        }


        if(gametypes[d.player_id] === undefined){
            gametypes[d.player_id] = {};
        }

        if(gametypes[d.player_id][d.gametype] === undefined){

            gametypes[d.player_id][d.gametype] = {...d};
            gametypes[d.player_id][d.gametype].map_id = 0;
            bSkipGametypeMerge = true;
        }

        if(maps[d.player_id] === undefined){
            maps[d.player_id] = {};
        }

        if(maps[d.player_id][d.map_id] === undefined){

            maps[d.player_id][d.map_id] = {...d};
            maps[d.player_id][d.map_id].gametype = 0;
            bSkipMapMerge = true;
        }
       

        const t = totals[d.player_id];
        const g = gametypes[d.player_id][d.gametype];
        const m = maps[d.player_id][d.map_id];


        for(let x = 0; x < mergeKeys.length; x++){

            const k = mergeKeys[x];

            if(!bSkipTotalsMerge){
                t[k] = parseFloat(t[k]) + parseFloat(d[k]);
            }

            if(!bSkipGametypeMerge){
                g[k] = parseFloat(g[k]) + parseFloat(d[k]);
            }

            if(!bSkipMapMerge){
                m[k] = parseFloat(m[k]) + parseFloat(d[k]);
            }
        }

        for(let x = 0; x < higherBetterKeys.length; x++){

            const k = higherBetterKeys[x];

            if(!bSkipTotalsMerge){
                if(t[k] < d[k]) t[k] = d[k];
            }

            if(!bSkipGametypeMerge){
                if(g[k] < d[k]) g[k] = d[k];
            }

            if(!bSkipMapMerge){
                if(m[k] < d[k]) m[k] = d[k];
            }   
        }    
    }

    await deleteMultiplePlayerTotals(playerIds);
    return await bulkInsertPlayers(totals, gametypes, maps);
}


export async function deletePlayerFromMatch(playerId, matchId){

    const query = `DELETE FROM nstats_tele_frags WHERE match_id=? AND (victim_id=? OR killer_id=?)`;

    return await simpleQuery(query, [matchId, playerId, playerId]);
}