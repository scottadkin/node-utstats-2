//const mysql = require('./database');
import { insertReturnInsertId, simpleQuery } from "./database.js";
import { toMysqlDate } from "./generic.mjs";


export async function bExists(name){

    const query = "SELECT COUNT(*) as total_logs FROM nstats_logs WHERE name=?";

    const result = await simpleQuery(query, [name]);

    return result[0].total_logs > 0;
}


export async function insert(name){

    const now = toMysqlDate(Date.now());
    const query = "INSERT INTO nstats_logs VALUES(NULL,?,?,0)";
    return await insertReturnInsertId(query, [name, now]);
}

export async function setMatchId(logId, matchId){

    const query = "UPDATE nstats_logs SET match_id=? WHERE id=?";
    await simpleQuery(query, [matchId, logId]);
}

export async function deleteFromDatabase(matchId){

    const query = "DELETE FROM nstats_logs WHERE match_id=?";
    await simpleQuery(query, [matchId]);
}

export async function deleteMatches(ids){

    if(ids.length === 0) return;
    await simpleQuery("DELETE FROM nstats_logs WHERE match_id IN (?)", [ids]);
}


export async function getZeroIdLogs(){

    const query = "SELECT * FROM nstats_logs WHERE match_id=0";
    return await simpleQuery(query);
}


export async function deleteAllZeroLogIds(){

    const query = "DELETE FROM nstats_logs WHERE match_id=0";
    return await simpleQuery(query);
}

export async function getAllMatchIds(){

    const query = "SELECT match_id FROM nstats_logs ORDER BY match_id ASC";

    const result = await simpleQuery(query);

    const ids = [];

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        ids.push(r.match_id);
    }

    return ids;
}

export async function getLogImportInfo(matchId){

    const query = `SELECT id,name,imported FROM nstats_logs WHERE match_id=?`;

    const result = await simpleQuery(query, [matchId]);

    if(result.length > 0) return result[0];

    return null;
}

export async function deleteLogImportInfo(matchId){

    const query = `DELETE FROM nstats_logs WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}