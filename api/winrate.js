import Message from "./message.js";
import { simpleQuery, bulkInsert } from "./database.js";
import { getObjectName } from "./genericServerSide.mjs";
import { DEFAULT_DATE, DEFAULT_MIN_DATE } from "./generic.mjs";

const DEFAULT_HISTORY_OBJECT = {
    "matches": 0,
    "wins": 0,
    "draws": 0,
    "losses": 0,
    "current_streak_type": "l",
    "current_streak": 0,
    "max_win_streak": 0,
    "max_draw_streak": 0,
    "max_lose_streak": 0,
};

export async function getAllPlayerCurrent(playerId){

    const query = `SELECT date,gametype,map,matches,wins,draws,losses,winrate,current_streak,
    current_streak_type,max_win_streak,max_draw_streak,max_lose_streak 
    FROM nstats_winrates_latest WHERE player=?`;

    const result = await simpleQuery(query, [playerId]);

    const gametypeIds = new Set();
    const mapIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        if(r.gametype !== 0) gametypeIds.add(r.gametype);
        if(r.map !== 0) mapIds.add(r.map);
    }

    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    const mapNames = await getObjectName("maps", [...mapIds]);

    
    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.gametype !== 0) r.gametypeName = gametypeNames[r.gametype] ?? "Not Found";
        if(r.map !== 0) r.mapName = mapNames[r.map] ?? "Not Found";
    }

    return result;
}


async function getPlayerLatestWinrateInfo(playerIds, gametypeId, mapId){


    let query = `SELECT player_id,MAX(match_date) as latest_date FROM nstats_player_matches WHERE player_id IN(?)`;

    const vars = [playerIds];

    if(gametypeId !== 0){
        vars.push(gametypeId);
        query += ` AND gametype=?`;
    }

    if(mapId !== 0){
        vars.push(mapId);
        query += ` AND map_id=?`;
    }

    const result = await simpleQuery(`${query} GROUP BY player_id`, vars);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        data[r.player_id] = r;
    }

    return data;
}

/**
 * Basically just recalculate involved players data
 * @param {*} playerIds 
 * @param {*} gametypeId 
 * @param {*} mapId 
 */
export async function deleteMatchData(playerIds, gametypeId, mapId){

    if(playerIds.length === 0) return;

    const mapGametypeCombos = await getPlayerLatestWinrateInfo(playerIds, gametypeId, mapId);
    const gametypeLatest = await getPlayerLatestWinrateInfo(playerIds, gametypeId, 0);
    const mapLatest = await getPlayerLatestWinrateInfo(playerIds, 0, mapId);
    const allTime = await getPlayerLatestWinrateInfo(playerIds, 0, 0);

    for(let i = 0; i < playerIds.length; i++){

        const id = playerIds[i];

        if(mapGametypeCombos[id] !== undefined){
            await recalculatePlayer(id, gametypeId, mapId, mapGametypeCombos[id].latest_date);
        }else{
            await deletePlayerLatest(id, gametypeId, mapId);
        }

        if(gametypeLatest[id] !== undefined){
            await recalculatePlayer(id, gametypeId, 0, gametypeLatest[id].latest_date);
        }else{
            await deletePlayerLatest(id, gametypeId, 0);
        }

        if(mapLatest[id] !== undefined){
            await recalculatePlayer(id, 0, mapId, mapLatest[id].latest_date);
        }else{
            await deletePlayerLatest(id, 0, mapId);
        }

        if(allTime[id] !== undefined){
            await recalculatePlayer(id, 0, 0, allTime[id].latest_date);
        }else{
            await deletePlayerLatest(id, 0, 0);
        }
    }
}


async function getPlayerCurrent(playerIds, gametypeId, mapId){

    if(playerIds.length === 0) return {};

    const query = `SELECT player,matches,wins,draws,losses,current_streak_type,current_streak,
    max_win_streak,max_draw_streak,max_lose_streak FROM nstats_winrates_latest 
    WHERE player IN (?) AND gametype=? AND map=?`;

    const result = await simpleQuery(query, [playerIds, gametypeId, mapId]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        data[r.player] = r;
    }

    for(let i = 0; i < playerIds.length; i++){

        const id = playerIds[i];

        if(data[id] === undefined) data[id] = null;
    }

    return data;
}

/*
//players first game
async function insertNewPlayerWinrateHistory(playerId, playerResult, matchDate, matchId, gametypeId, mapId){


    const query = `INSERT INTO nstats_winrates VALUES(NULL,
    ?,?,?,?,?,?,
    1,?,?,?,?,
    ?,1,?,?,?
    )`;

    const vars = [
        matchDate, matchId, playerId, gametypeId, mapId,
        playerResult,
        (playerResult === "w") ? 1 : 0,
        (playerResult === "d") ? 1 : 0,
        (playerResult === "l") ? 1 : 0,
        (playerResult === "w") ? 100 : 0,
        playerResult,
        (playerResult === "w") ? 1 : 0,
        (playerResult === "d") ? 1 : 0,
        (playerResult === "l") ? 1 : 0,
    ];

    await simpleQuery(query, vars);
}
*/

async function insertNewPlayerWinrateLatest(playerId, playerResult, matchDate, gametypeId, mapId){


    const query = `INSERT INTO nstats_winrates_latest VALUES(NULL,
    ?,?,?,?,1,
    ?,?,?,?,
    ?,1,?,?,?
    )`;

    const vars = [
        matchDate, playerId, gametypeId, mapId,
        (playerResult === "w") ? 1 : 0,
        (playerResult === "d") ? 1 : 0,
        (playerResult === "l") ? 1 : 0,
        (playerResult === "w") ? 100 : 0,
        playerResult,
        (playerResult === "w") ? 1 : 0,
        (playerResult === "d") ? 1 : 0,
        (playerResult === "l") ? 1 : 0,
    ];

    await simpleQuery(query, vars);
}

async function insertNewPlayer(playerId, playerResult, matchDate, gametypeId, mapId){

    //winrate history not used on site anywhere so removing for now
    //await insertNewPlayerWinrateHistory(playerId, playerResult, matchDate, matchId, gametypeId, mapId);
    await insertNewPlayerWinrateLatest(playerId, playerResult, matchDate, gametypeId, mapId);
}

function updateHistoryObject(playerData, matchResult){

    playerData.matches++;

    if(matchResult === "w") playerData.wins++;
    if(matchResult === "d") playerData.draws++;
    if(matchResult === "l") playerData.losses++;

    if(playerData.current_streak_type === matchResult){

        playerData.current_streak++;

    }else{
        playerData.current_streak = 1;
        playerData.current_streak_type = matchResult;
    }

    const maxKeys = {"w": "max_win_streak", "d": "max_draw_streak", "l": "max_lose_streak"};

    if(playerData[maxKeys[matchResult]] < playerData.current_streak){
        playerData[maxKeys[matchResult]] = playerData.current_streak;
    }

    let winrate = 0;

    if(playerData.matches > 0 && playerData.wins > 0){

        winrate = playerData.wins / playerData.matches * 100;
    }

    playerData.winrate = winrate;
}

/*async function updateExistingPlayer(playerId, playerData, matchResult, matchDate, matchId, gametypeId, mapId){


    updateHistoryObject(playerData, matchResult);

    const query = `UPDATE nstats_winrates_latest SET date=?,match_id=?,matches=?,
    wins=?,draws=?,losses=?,winrate=?,current_streak_type=?,
    current_streak=?,max_win_streak=?,max_draw_streak=?,max_lose_streak=?
    WHERE player=? AND gametype=? AND map=?`;

    const vars = [
        matchDate, matchId, playerData.matches, playerData.wins, playerData.draws,
        playerData.losses, playerData.winrate, playerData.current_streak_type, playerData.current_streak,
        playerData.max_win_streak, playerData.max_draw_streak,playerData.max_lose_streak,
        playerId, gametypeId, mapId
    ];

    return await simpleQuery(query, vars);
}*/

async function getPlayerMatchResultHistory(playerId, gametypeId, mapId){

    let query = `SELECT match_result FROM nstats_player_matches WHERE player_id=?`;

    const vars = [playerId];

    if(gametypeId !== 0){
        vars.push(gametypeId);
        query += ` AND gametype=?`;
    }

    if(mapId !== 0){

        vars.push(mapId);
        query += ` AND map_id=?`;
    }

    const result = await simpleQuery(`${query} AND match_result!='s' ORDER BY match_date DESC`,vars);

    return result.map((r) =>{
        return r.match_result;
    });
}

async function deletePlayerLatest(playerId, gametypeId, mapId){

    const query = `DELETE FROM nstats_winrates_latest WHERE player=? AND gametype=? AND map=?`;

    return await simpleQuery(query, [playerId, gametypeId, mapId]);
}


async function insertPlayerLatest(playerId, history, gametypeId, mapId, matchDate){

    const query = `INSERT INTO nstats_winrates_latest VALUES(NULL,
    ?,?,?,?,?,
    ?,?,?,?,
    ?,?,?,?,?
    )`;

    const vars = [
        matchDate, playerId, gametypeId, mapId,
        history.matches,
        history.wins,
        history.draws,
        history.losses,
        history.winrate,
        history.current_streak_type,
        history.current_streak,
        history.max_win_streak,
        history.max_draw_streak,
        history.max_lose_streak
    ];

    await simpleQuery(query, vars);
}

async function recalculatePlayer(playerId, gametypeId, mapId, matchDate){

    const matchResults = await getPlayerMatchResultHistory(playerId, gametypeId, mapId);

    if(matchResults.length === 0){
        await deletePlayerLatest(playerId, gametypeId, mapId);
        //new Message(`recalculatePlayer matchResults is null`, "error");
        return;
    }
    const history = {
        "player": playerId,
        "matches": 0,
        "wins": 0,
        "draws": 0,
        "losses": 0,
        "current_streak_type": "l",
        "current_streak": 0,
        "max_win_streak": 0,
        "max_draw_streak": 0,
        "max_lose_streak": 0,
    };

    for(let i = 0; i < matchResults.length; i++){

        updateHistoryObject(history, matchResults[i]);
    }

    await deletePlayerLatest(playerId, gametypeId, mapId);
    await insertPlayerLatest(playerId, history, gametypeId, mapId, matchDate)
    
}

export async function updatePlayerWinrates(playerResults, gametypeId, mapId, matchDate){

    const playerIds = Object.keys(playerResults);

    if(playerIds.length === 0) return;

    /*const playerLatestDates = await getPlayerLatestWinrateDate(playerIds, gametypeId, mapId);

    const needRecalculate = [];

    for(const [playerId, date] of Object.entries(playerLatestDates)){

        if(date > matchDate){
            needRecalculate.push(playerId);
        }
    }*/

    const latestData = await getPlayerCurrent(playerIds, gametypeId, mapId);
    

    for(const [playerId, playerData] of Object.entries(latestData)){

        if(playerData === null){
            //insert new player winrate
            await insertNewPlayer(playerId, playerResults[playerId], matchDate, gametypeId, mapId);
        }else{
            
           // if(needRecalculate.indexOf(playerId) === -1){
                //console.log(`update existing`);

                //await updateExistingPlayer(playerId, playerData, playerResults[playerId], matchDate, matchId, gametypeId, mapId);
           // }else{
                //console.log(`NEED TO RECALC`);
                await recalculatePlayer(playerId, gametypeId, mapId, matchDate);
           // }
        }
    }

    //all time
    //gametype
    //map
    //gametype & map combo
}

export async function getPlayersBasic(playerIds, gametypeId, mapId){

    if(playerIds.length === 0) return {};

    let query = `SELECT player,wins,draws,losses,winrate FROM nstats_winrates_latest WHERE player IN(?)`;

    const vars = [playerIds];

    if(gametypeId !== 0){
        vars.push(gametypeId);
        query += ` AND gametype=?`;
    }

    if(mapId !== 0){
        vars.push(mapId);
        query += ` AND map=?`;
    }

    const result = await simpleQuery(query, vars);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        const {wins, draws, losses, winrate} = r;

        data[r.player] = {
            wins, draws, losses, winrate
        };
    }

    return data;
}


export async function deletePlayerData(playerId){

    const query = `DELETE FROM nstats_winrates_latest WHERE player=?`;

    return await simpleQuery(query, [playerId]);
}


async function deleteGametype(gametypeId){

    const query = `DELETE FROM nstats_winrates_latest WHERE gametype=?`;

    return await simpleQuery(query, [gametypeId]);
}


async function bulkInsertGametype(data, gametypeId){

    const query = `INSERT INTO nstats_winrates_latest (
        date,player,gametype,map,matches,wins,draws,losses,winrate,
        current_streak_type,current_streak,max_win_streak,max_draw_streak
        ,max_lose_streak
    ) VALUES ?`;

    const insertVars = [];


    for(const [playerId, playerData] of Object.entries(data)){

        for(const [mapId, d] of Object.entries(playerData)){

            insertVars.push([
                d.latest_match, playerId, gametypeId, mapId,
                d.matches,d.wins,d.draws,d.losses,d.winrate,
                d.current_streak_type,d.current_streak,d.max_win_streak,d.max_draw_streak,
                d.max_lose_streak
            ]);
        }
    }

    return await bulkInsert(query, insertVars);
}



async function recalculateGametype(gametypeId){

    const query = `SELECT player_id,map_id,match_result,match_date FROM nstats_player_matches WHERE gametype=? ORDER BY match_date ASC`;

    const data = await simpleQuery(query, [gametypeId]);

    const winRates = {};

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(winRates[d.player_id] === undefined){
            winRates[d.player_id] = {};
        }


        //gametype complete totals
        if(winRates[d.player_id][0] === undefined){
            winRates[d.player_id][0] = {
                ...DEFAULT_HISTORY_OBJECT,
                "latest_match": new Date(0)
            };
        }

        if(winRates[d.player_id][d.map_id] === undefined){
            winRates[d.player_id][d.map_id] = {
                ...DEFAULT_HISTORY_OBJECT,
                "latest_match": new Date(0)
            };
        }

        if(d.match_date > winRates[d.player_id][0].latest_match){
             winRates[d.player_id][0].latest_match = d.match_date;
        }

        if(d.match_date > winRates[d.player_id][d.map_id].latest_match){
             winRates[d.player_id][d.map_id].latest_match = d.match_date;
        }
   
        //gametype totals
        updateHistoryObject(winRates[d.player_id][0], d.match_result);
        //gametype + map 
        updateHistoryObject(winRates[d.player_id][d.map_id], d.match_result);

    }

    await deleteGametype(gametypeId);

    await bulkInsertGametype(winRates, gametypeId);
    //console.log(winRates);
}

export async function mergeGametypes(oldId, newId){


    await deleteGametype(oldId);

    await recalculateGametype(newId);
}

/**
 * Get players total wins,losses,draws & winrate for said gametype
 * @param {} gametypeId 
 */
export async function getGametypeMatchResults(gametypeId){

    const query = `SELECT player_id,map_id,match_result FROM nstats_player_matches WHERE gametype=?`;

    const result = await simpleQuery(query, [gametypeId]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(data[r.player_id] === undefined){
            data[r.player_id] = {};
        }

         if(data[r.player_id][0] === undefined){
            data[r.player_id][0] = {
                "matches": 0,
                "wins": 0,
                "draws": 0,
                "losses": 0,
                "winRate": 0
            };
        }

        if(data[r.player_id][r.map_id] === undefined){
            data[r.player_id][r.map_id] = {
                "matches": 0,
                "wins": 0,
                "draws": 0,
                "losses": 0,
                "winRate": 0
            };
        }

        const maps = [0, r.map_id];

        for(let x = 0; x < maps.length; x++){

            const d = data[r.player_id][maps[x]];

            if(r.match_result === "s") continue;
            if(r.match_result === "w") d.wins++;
            if(r.match_result === "d") d.draws++;
            if(r.match_result === "l") d.losses++;
            d.matches++;

            if(d.wins > 0){
                d.winRate = d.wins / d.matches * 100;
            }
        }
    }

    return data;
}