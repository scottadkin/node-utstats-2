import Message from "./message.js";
import { simpleQuery, bulkInsert } from "./database.js";
import { getObjectName } from "./genericServerSide.mjs";
import { DEFAULT_DATE, DEFAULT_MIN_DATE } from "./generic.mjs";


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
        new Message(`recalculatePlayer matchResults is null`, "error");
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