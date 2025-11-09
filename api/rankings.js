import { bulkInsert, simpleQuery } from "./database.js";
import Message from "./message.js";
import { getAllGametypeNames, getAllIds as getAllGametypeIds } from "./gametypes.js";
import { getBasicPlayersByIds, getAllPlayersGametypeMatchData } from "./players.js";
import { DEFAULT_MIN_DATE, toMysqlDate } from "./generic.mjs";

export const DEFAULT_RANKING_VALUES = [
    {"cat": "General", "name":"frags","display_name":"Kill","description":"Player Killed an enemy","value":300},
	{"cat": "General", "name":"deaths","display_name":"Death","description":"Player died","value":-150},
	{"cat": "General", "name":"suicides","display_name":"Suicide","description":"Player killed themself","value":-150},
	{"cat": "General", "name":"team_kills","display_name":"Team Kill","description":"Player killed a team mate","value":-1200},
	{"cat": "Capture The Flag", "name":"flag_taken","display_name":"Flag Grab","description":"Player grabbed the flag from the enemy flag stand","value":600},
	{"cat": "Capture The Flag","name":"flag_pickup","display_name":"Flag Pickup","description":"Player picked up a dropped enemy flag","value":600},
	{"cat": "Capture The Flag","name":"flag_return","display_name":"Flag Return","description":"Player returned the players flag to their base","value":600},
	{"cat": "Capture The Flag","name":"flag_capture","display_name":"Flag Capture","description":"Player capped the enemy flag","value":6000},
	{"cat": "Capture The Flag","name":"flag_seal","display_name":"Flag Seal","description":"Player sealed off the base while a team mate was carrying the flag","value":1200},
	{"cat": "Capture The Flag","name":"flag_assist","display_name":"Flag Assist","description":"Player had carry time of the enemy flag that was capped","value":3000},
	{"cat": "Capture The Flag","name":"flag_kill","display_name":"Flag Kill","description":"Player killed the enemy flag carrier.","value":1200},
	{"cat": "Capture The Flag","name":"flag_dropped","display_name":"Flag Dropped","description":"Player dropped the enemy flag","value":-300},
	{"cat": "Capture The Flag","name":"flag_cover","display_name":"Flag Cover","description":"Player killed an enemy close to a team mate carrying the flag","value":1800},
	{"cat": "Capture The Flag","name":"flag_cover_pass","display_name":"Flag Successful Cover","description":"Player covered the flag carrier that was later capped","value":1000},
	{"cat": "Capture The Flag","name":"flag_cover_fail","display_name":"Flag Failed Cover","description":"Player covered the flag carrier but the flag was returned","value":-600},
	{"cat": "Capture The Flag","name":"flag_self_cover","display_name":"Flag Self Cover","description":"Player killed an enemy while carrying the flag","value":600},
	{"cat": "Capture The Flag","name":"flag_self_cover_pass","display_name":"Successful Flag Self Cover","description":"Player killed an enemy while carrying the flag that was later capped","value":1000},
	{"cat": "Capture The Flag","name":"flag_self_cover_fail","display_name":"Failed Flag Self Cover","description":"Player killed an enemy while carrying the flag, but the flag was returned","value":-600},
	{"cat": "Capture The Flag","name":"flag_cover_multi","display_name":"Flag Multi Cover","description":"Player covered the flag carrier 3 times while the enemy flag was taken one time","value":3600},
	{"cat": "Capture The Flag","name":"flag_cover_spree","display_name":"Flag Cover Spree","description":"Player covered the flag carrier 4 or more times while the enemy flag was taken one time","value":4200},
	{"cat": "Capture The Flag","name":"flag_return_save","display_name":"Flag Close Save","description":"Player returned their flag that was close to being capped by the enemy team","value":4000},
	{"cat": "Domination","name":"dom_caps","display_name":"Domination Control Point Caps","description":"Player captured a contol point.","value":6000},
	{"cat": "Assault","name":"assault_objectives","display_name":"Assault Objectives","description":"Player captured an assault objective.","value":6000},
	{"cat": "General","name":"multi_1","display_name":"Double Kill","description":"Player killed 2 people in a short amount of time without dying","value":100},
	{"cat": "General","name":"multi_2","display_name":"Multi Kill","description":"Player killed 3 people in a short amount of time without dying","value":150},
	{"cat": "General","name":"multi_3","display_name":"Mega Kill","description":"Player killed 4 people in a short amount of time without dying","value":200},
	{"cat": "General","name":"multi_4","display_name":"Ultra Kill","description":"Player killed 5 people in a short amount of time without dying","value":300},
	{"cat": "General","name":"multi_5","display_name":"Monster Kill","description":"Player killed 6 people in a short amount of time without dying","value":450},
	{"cat": "General","name":"multi_6","display_name":"Ludicrous Kill","description":"Player killed 7 people in a short amount of time without dying","value":600},
	{"cat": "General","name":"multi_7","display_name":"Holy Shit","description":"Player killed 8 or more people in a short amount of time without dying","value":750},
	{"cat": "General","name":"spree_1","display_name":"Killing Spree","description":"Player killed 5 to 9 players in one life","value":600},
	{"cat": "General","name":"spree_2","display_name":"Rampage","description":"Player killed 10 to 14 players in one life","value":750},
	{"cat": "General","name":"spree_3","display_name":"Dominating","description":"Player killed 15 to 19 players in one life","value":900},
	{"cat": "General","name":"spree_4","display_name":"Unstoppable","description":"Player killed 20 to 24 players in one life","value":1200},
	{"cat": "General","name":"spree_5","display_name":"Godlike","description":"Player killed 25 to 29 players in one life","value":1800},
	{"cat": "General","name":"spree_6","display_name":"Too Easy","description":"Player killed 30 to 34 players in one life","value":2400},
	{"cat": "General","name":"spree_7","display_name":"Brutalizing the competition","description":"Player killed 35 or more players in one life","value":3600},
	{"cat": "Monster Hunt","name":"mh_kills","display_name":"Monster Kills","description":"Player killed a monster","value":360},
	{"cat": "Penalty","name":"sub_hour_multiplier","display_name":"Sub 1 Hour Playtime Penalty Multiplier","description":"Reduce the player's score to a percentage of it's original value","value":0.2},
	{"cat": "Penalty","name":"sub_2hour_multiplier","display_name":"Sub 2 Hour Playtime Penalty Multiplier","description":"Reduce the player's score to a percentage of it's original value","value":0.5},
	{"cat": "Penalty","name":"sub_3hour_multiplier","display_name":"Sub 3 Hour Playtime Penalty Multiplier","description":"Reduce the player's score to a percentage of it's original value","value":0.75},
	{"cat": "Penalty","name":"sub_half_hour_multiplier","display_name":"Sub 30 Minutes Playtime Penalty","description":"Reduce the player's score to a percentage of it's original value","value":0.05},
];

const validLastActive =  {
    "1": 60 * 60 * 24 * 1000,
    "7": 60 * 60 * 24 * 7 * 1000,
    "28": 60 * 60 * 24 * 28 * 1000,
    "90": 60 * 60 * 24 * 90 * 1000,
    "365": 60 * 60 * 24 * 365 * 1000,
    "0": Number.MAX_SAFE_INTEGER
};

const validMinPlaytimes = {
    "0": 0,
    "1": 60 * 60,
    "2": 60 * 60 * 2,
    "3": 60 * 60 * 3,
    "6": 60 * 60 * 6,
    "12": 60 * 60 * 12,
    "24": 60 * 60 * 24,
    "48": 60 * 60 * 48
};


export const activeOptions = [
    {"value": "0", "name": "No Limit"},
    {"value": "1", "name": "Past 1 Day"},
    {"value": "7", "name": "Past 7 Days"},
    {"value": "28", "name": "Past 28 Days"},
    {"value": "90", "name": "Past 90 Days"},
    {"value": "365", "name": "Past 365 Days"}
];

export const playtimeOptions = [
    {"value": "0", "name": "No Limit"},
    {"value": "1", "name": "1 Hour"},
    {"value": "2", "name": "2 Hours"},
    {"value": "3", "name": "3 Hours"},
    {"value": "6", "name": "6 Hours"},
    {"value": "12", "name": "12 Hours"},
    {"value": "24", "name": "24 Hours"},
    {"value": "48", "name": "48 Hours"}
];

function sanitizeLastActive(lastActive){

    const now = new Date();

    let limit = "1111-01-01";

    if(validLastActive[lastActive] !== undefined){

        limit = now - validLastActive[lastActive];
    }

    if(limit < 0) limit = 0;

    return toMysqlDate(limit);
}

function sanitizeMinPlaytime(minPlaytime){

    let limit = 0;

    if(validMinPlaytimes[minPlaytime] !== undefined){
        limit = validMinPlaytimes[minPlaytime];
    }

    return limit;
}

export async function getDetailedSettings(){
    const query = "SELECT name,display_name,description,value FROM nstats_ranking_values";
    return await simpleQuery(query);
}



export async function getTopPlayersEveryGametype(maxPlayers, lastActive, minPlaytime){

    const gametypes = await getAllGametypeNames();

    lastActive = sanitizeLastActive(lastActive);
    minPlaytime = sanitizeMinPlaytime(minPlaytime);

    const gametypeIds = Object.keys(gametypes);
   
    const data = {};

    const query = `SELECT player_id,matches,playtime,ranking,ranking_change,last_active FROM nstats_ranking_player_current
    WHERE gametype=? AND last_active >=? AND playtime>=? ORDER BY ranking DESC LIMIT ?`;

    const uniquePlayerIds = new Set();

    for(let i = 0; i < gametypeIds.length; i++){

        const id = gametypeIds[i];

        const result = await simpleQuery(query, [id, lastActive, minPlaytime, maxPlayers]);

        for(let x = 0; x < result.length; x++){
            uniquePlayerIds.add(result[x].player_id);
        }

        data[id] = result;
    }

    const playerInfo = await getBasicPlayersByIds([...uniquePlayerIds]);

    for(const value of Object.values(data)){

        for(let i = 0; i < value.length; i++){

            const v = value[i];

            const currentPlayer = playerInfo?.[v.player_id] ?? {"name": "Not Found", "country": "xx"};

            v.playerName = currentPlayer.name;
            v.country = currentPlayer.country;
        }
    }

    return data;
}

export async function getTotalRankingEntries(gametypeId, lastActive, minPlaytime){

    const limit = sanitizeLastActive(lastActive);
    minPlaytime = sanitizeMinPlaytime(minPlaytime);

    const query = "SELECT COUNT(*) as total_rows FROM nstats_ranking_player_current WHERE gametype=? AND last_active>=? AND playtime>=?";

    const result = await simpleQuery(query, [gametypeId, limit, minPlaytime]);

    return result[0].total_rows;
}

export async function getRankingData(gametypeId, page, perPage, lastActive, minPlaytime){

    page = parseInt(page);
    perPage = parseInt(perPage);

    if(page !== page) page = 1;
    if(perPage !== perPage) perPage = 25;

    gametypeId = parseInt(gametypeId);
    if(gametypeId !== gametypeId) throw new Error(`gametypeId must be a valid integer`);

    page--;

    const start = page * perPage;

    let limit = sanitizeLastActive(lastActive);
    minPlaytime = sanitizeMinPlaytime(minPlaytime);

    const query = "SELECT * FROM nstats_ranking_player_current WHERE gametype=? AND last_active>=? AND playtime>=? ORDER BY ranking DESC LIMIT ?,?";

    const result = await simpleQuery(query, [gametypeId, limit, minPlaytime, start, perPage]);

    const playerIds = [...new Set([...result.map((r) =>{
        return r.player_id;
    })])]

    const playerInfo = await getBasicPlayersByIds([...playerIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        const currentPlayer = playerInfo?.[r.player_id] ?? {"name": "Not Found", "country": "xx"};

        r.playerName = currentPlayer.name;
        r.country = currentPlayer.country;

    }

    return result;
}

async function getMatchRankingChanges(matchId){

    const query = "SELECT player_id,ranking,match_ranking,ranking_change FROM nstats_ranking_player_history WHERE match_id=?";
    return await simpleQuery(query, [matchId]);
}


async function getPlayerMatchRankingChange(matchId, playerId){

    const query = `SELECT ranking,match_ranking,ranking_change 
    FROM nstats_ranking_player_history WHERE match_id=? AND player_id=?`;

    const result = await simpleQuery(query, [matchId, playerId]);

    if(result.length > 0){
        return result[0];
    }

    return {"ranking": 0, "match_ranking": 0, "ranking_change": 0, "match_ranking_change": 0};
}

export async function getPlayerMatchRankingInfo(matchId, gametypeId, playerId){

    const rankingChange = await getPlayerMatchRankingChange(matchId, playerId);
    const current = await getCurrentRanking(playerId, gametypeId);
    const gametypePosition = await getGametypePosition(current.ranking, gametypeId);

    return {
        "matchChanges": rankingChange, 
        "currentRankings": current,
        "currentPosition": gametypePosition
    };

}

async function getCurrentPlayersRanking(players, gametype){

    if(players.length === 0) return [];

    const query = "SELECT player_id,ranking,ranking_change FROM nstats_ranking_player_current WHERE player_id IN(?) AND gametype=?";

    return await simpleQuery(query, [players, gametype]);
}

export async function getGametypePosition(rankingValue, gametypeId){

    const query = "SELECT COUNT(*) as total_values FROM nstats_ranking_player_current WHERE gametype=? AND ranking>? ORDER BY ranking DESC";

    const result = await simpleQuery(query, [gametypeId, rankingValue]);

    if(result[0].total_values === 0) return 1;

    return result[0].total_values + 1;
}

export async function getMatchRankings(matchId, gametypeId, playerIds){


    const matchChanges = await getMatchRankingChanges(matchId);
    const currentRankings = await getCurrentPlayersRanking(playerIds, gametypeId);

    const currentPositions = {};

    for(let i = 0; i < currentRankings.length; i++){

        const c = currentRankings[i];
        currentPositions[c.player_id] = await getGametypePosition(c.ranking, gametypeId);
    }

    return {
        "matchChanges": matchChanges, 
        "currentRankings": currentRankings,
        "currentPositions": currentPositions
    };
}

export async function getCurrentRanking(playerId, gametype){

    const query = "SELECT ranking,ranking_change FROM nstats_ranking_player_current WHERE player_id=? AND gametype=?";

    const result = await simpleQuery(query, [playerId, gametype]);

    if(result.length > 0){
        return result[0];
    }

    return {"ranking": 0, "ranking_change": 0};
}


async function deletePlayerMatchData(matchId){

    const query = `DELETE FROM nstats_ranking_player_history WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}



export async function deleteMatchData(matchId, playerIds, gametypeId){


    if(playerIds.length === 0) return;

    const rankingManager = new Rankings();
    await rankingManager.loadCurrentSettings();
    
    await deletePlayerMatchData(matchId);

    for(let i = 0; i < playerIds.length; i++){
        const id = playerIds[i];
        
        await rankingManager.recalculatePlayerGametype(id, gametypeId);
    }
}

export async function deletePlayerData(playerId){
    
    const tables = [
        "nstats_ranking_player_current",
        "nstats_ranking_player_history"
    ];

    for(let i = 0; i < tables.length; i++){

        const t = tables[i];

        await simpleQuery(`DELETE FROM ${t} WHERE player_id=?`, [playerId]);
    }
}

export async function getAllSettings(bReturnJustCurrentObject){

    if(bReturnJustCurrentObject === undefined){
        bReturnJustCurrentObject = false;
    }

    const query = `SELECT * FROM nstats_ranking_values`;

    const current = await simpleQuery(query);

    if(bReturnJustCurrentObject){

        const data = {};

        for(let i = 0; i < current.length; i++){

            const c = current[i];

            if(data[c.cat] === undefined){
                data[c.cat] = [];
            }

            data[c.cat].push(
                {
                    "id": c.id,
                    "name": c.name,
                    "display_name": c.display_name,
                    "description": c.description,
                    "value": c.value
                }
            );
        }

        return data;
    }

    return {current, "defaultValues": DEFAULT_RANKING_VALUES}
}


export async function adminUpdateSettings(changes){

    const query = `UPDATE nstats_ranking_values SET value=? WHERE id=?`;

    for(let i = 0; i < changes.length; i++){

        const c = changes[i];
        await simpleQuery(query, [c.value, c.id]);
    }
}


function applyTimePenalty(settings, currentScore, playtime){


    if(playtime > 0 && currentScore > 0){

        const mins = playtime / 60;

        if(mins > 0){
            currentScore = currentScore / mins;
        }else{
            currentScore = -99999;
        }
    }

    let subHalfHourPenalty = 0;
    let subHourPenalty = 0;
    let sub2HourPenalty = 0;
    let sub3HourPenalty = 0;

    for(let i = 0; i < settings["Penalty"].length; i++){

        const s = settings["Penalty"][i];

        if(s.name === "sub_half_hour_multiplier") subHalfHourPenalty = parseFloat(s.value);
        if(s.name === "sub_hour_multiplier") subHourPenalty = parseFloat(s.value);
        if(s.name === "sub_2hour_multiplier") sub2HourPenalty = parseFloat(s.value);
        if(s.name === "sub_3hour_multiplier") sub3HourPenalty = parseFloat(s.value);
    }

    if(playtime < 60 * 30){     
        currentScore = currentScore * subHalfHourPenalty;
    }else if(playtime >= 60 * 30 && playtime < 60 * 60){
        currentScore = currentScore * subHourPenalty;
    }else if(playtime >= 60 * 60 && playtime < 60 * 120){
        currentScore = currentScore * sub2HourPenalty;
    }else if(playtime >= 60 * 120 && playtime < 60 * 180){
        currentScore = currentScore * sub3HourPenalty;
    }


    return currentScore;
}

function calculateRanking(data, settings, ctfColumns){


    let bSkipCTF = true;

    for(let i = 0; i < ctfColumns.length; i++){

        if(data[ctfColumns[i]] !== null){
            bSkipCTF = false;
            break;
        }
    }

    let currentScore = 0;

    const cats = ["General", "Domination", "Assault", "Monster Hunt"];

    for(let x = 0; x < cats.length; x++){

        const cat = cats[x];

        for(let i = 0; i < settings[cat].length; i++){

            const s = settings[cat][i];

            const eventTotal = data[s.name] * parseInt(s.value);

            currentScore += eventTotal;
        }
    }

    if(!bSkipCTF){

        for(let i = 0; i < settings["Capture The Flag"].length; i++){

            const s = settings["Capture The Flag"][i];
            const eventTotal = data[s.name] * parseInt(s.value);
            currentScore += eventTotal;
        }
    }

    //score without time penalties and other reduction
    const totalScore = currentScore;

    currentScore = applyTimePenalty(settings, currentScore, data.playtime);

    return {
        "matchId": data.match_id ?? null, 
        "matchDate": data.match_date ?? null, 
        "currentScore": currentScore, 
        "playtime": data.playtime,
        "totalScore": totalScore
    };
}


async function deleteGametypeCurrent(gametypeId){

    const query = `DELETE FROM nstats_ranking_player_current WHERE gametype=?`;

    return await simpleQuery(query, [gametypeId]);
}

async function deleteGametypeHistory(gametypeId){

    const query = `DELETE FROM nstats_ranking_player_history WHERE gametype=?`;

    return await simpleQuery(query, [gametypeId]);
}

async function bulkInsertGametypeRecalcData(gametypeId, data){

    const currentRankingVars = [];
    const historyVars = [];

    const currentQuery = `
        INSERT INTO nstats_ranking_player_current (player_id,gametype,matches,playtime,ranking,ranking_change,last_active) VALUES ?
    `;

    const historyQuery = `
        INSERT INTO nstats_ranking_player_history (
        match_id, player_id, gametype, ranking, match_ranking, ranking_change) VALUES ?
    `;

    for(const [playerId, playerData] of Object.entries(data)){

        currentRankingVars.push([
            playerId, gametypeId, playerData.matchResults.length, playerData.playtime, 
            playerData.score, playerData.rankingChange, toMysqlDate(playerData.latestDate)
        ]);

        for(let i = 0; i < playerData.matchResults.length; i++){

            const r = playerData.matchResults[i];

            historyVars.push([
                r.matchId, playerId, gametypeId,
                r.rankingAfterMatch, r.currentScore, r.rankingChange
            ]);
        }
    }

    await bulkInsert(currentQuery, currentRankingVars);
    await bulkInsert(historyQuery, historyVars)


}

async function recalculateGametype(gametypeId, settings, generalColumns, ctfColumns){

    const gColoumns = generalColumns.map((c) =>{
        return `nstats_player_matches.${c}`;
    });

    const cColumns = ctfColumns.map((c) =>{
        return `nstats_player_ctf_match.${c}`;
    });

    const query = `SELECT nstats_player_matches.match_id,
    nstats_player_matches.match_date,
    nstats_player_matches.playtime,
    nstats_player_matches.player_id,${gColoumns.toString()},${cColumns.toString()} FROM nstats_player_matches 
    LEFT JOIN nstats_player_ctf_match ON nstats_player_ctf_match.player_id = nstats_player_matches.player_id AND 
    nstats_player_ctf_match.match_id = nstats_player_matches.match_id
    WHERE gametype=? AND nstats_player_matches.match_result!='s' ORDER BY match_date ASC`;

    const result = await simpleQuery(query, [gametypeId])

    const players = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        const matchResult = calculateRanking(r, settings, ctfColumns);

        if(players[r.player_id] === undefined){

            players[r.player_id] = {
                "matchResults": [],
                "playtime": 0,
                "totalScore": 0,
                "score": 0,
                "latestDate": null
            };  
        }

        const previousResult = players[r.player_id].matchResults[players[r.player_id].matchResults.length - 1];

        if(previousResult === undefined){

            players[r.player_id].rankingChange = matchResult.currentScore;
            players[r.player_id].latestDate = matchResult.matchDate;

        }else{

            const diff = matchResult.currentScore - previousResult.currentScore;
            players[r.player_id].rankingChange = diff;

            if(matchResult.matchDate > players[r.player_id].latestDate){
                players[r.player_id].latestDate = matchResult.matchDate;
            }
        }

        matchResult.rankingChange = matchResult.currentScore;

        players[r.player_id].playtime += matchResult.playtime;
        players[r.player_id].matchResults.push(matchResult);

        players[r.player_id].totalScore += matchResult.totalScore;

        const finalScore = applyTimePenalty(settings, players[r.player_id].totalScore,  players[r.player_id].playtime);
        

        players[r.player_id].score = finalScore;
        matchResult.rankingAfterMatch = finalScore;
    }

    await deleteGametypeCurrent(gametypeId);
    await deleteGametypeHistory(gametypeId);
    await bulkInsertGametypeRecalcData(gametypeId, players);
}

function splitGeneralCTFColumns(settings){

    const mustExist = ["Capture The Flag", "General", "Domination", "Assault", "Monster Hunt"];

    for(let i = 0; i < mustExist.length; i++){

        if(settings[mustExist[i]] === undefined){
            throw new Error(`Could not find ranking settings category ${mustExist[i]}`);
        }
    }

    const generalColumns = settings["General"].map((s) =>{
        return s.name;
    });

    generalColumns.push(...settings["Domination"].map((s) => s.name));
    generalColumns.push(...settings["Assault"].map((s) => s.name));
    generalColumns.push(...settings["Monster Hunt"].map((s) => s.name));


    const ctfColumns = settings["Capture The Flag"].map((s) =>{
        return s.name;
    });

    return {generalColumns, ctfColumns};
}

export async function recalculateAll(){

    const settings = await getAllSettings(true);

    const {generalColumns, ctfColumns} = splitGeneralCTFColumns(settings);

    const gametypeIds = await getAllGametypeIds();


    for(let i = 0; i < gametypeIds.length; i++){

        await recalculateGametype(gametypeIds[i], settings, generalColumns, ctfColumns);
    }
}

async function getMultiplePlayerCurrent(gametypeId, playerIds){

    const query = `SELECT player_id,matches,playtime,ranking FROM nstats_ranking_player_current WHERE gametype=? AND player_id IN(?)`;
    const result = await simpleQuery(query, [gametypeId, playerIds]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        data[r.player_id] = {
            "matches": r.matches,
            "playtime": r.playtime,
            "ranking": parseFloat(r.ranking)
        };
    }

    return data;
}

async function insertPlayerHistory(data, gametypeId){

    const insertVars = [];

    const query = `INSERT INTO nstats_ranking_player_history (match_id, player_id, gametype,
    ranking, match_ranking, ranking_change) VALUES ?`;

    for(const [playerId, pData] of Object.entries(data)){

        insertVars.push([
            pData.matchId, playerId, gametypeId,
            pData.currentScore, pData.matchScore,
            pData.rankingChange
        ]);
    }


    await bulkInsert(query, insertVars);
}

async function calcMatchScores(matchId, matchDate, settings, generalColumns, ctfColumns){

    const gColoumns = generalColumns.map((r) =>{ return `nstats_player_matches.${r}`});
    const cColoumns = ctfColumns.map((r) =>{ return `nstats_player_ctf_match.${r}`});

    const query = `SELECT nstats_player_matches.player_id,nstats_player_matches.playtime,${gColoumns.toString()},${cColoumns.toString()} FROM nstats_player_matches
    LEFT JOIN nstats_player_ctf_match ON nstats_player_ctf_match.match_id = nstats_player_matches.match_id 
    AND nstats_player_ctf_match.player_id = nstats_player_matches.player_id
    WHERE nstats_player_matches.match_id=?
    `;


    const result = await simpleQuery(query, [matchId]);

    const scores = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        
        scores[r.player_id] = calculateRanking(r, settings, ctfColumns);
        scores[r.player_id].matchId = matchId;
        scores[r.player_id].matchDate = matchDate;
    }


    return scores;
}

async function deletePlayerCurrent(gametypeId, playerIds){

    if(playerIds.length === 0) return;

    const query = `DELETE FROM nstats_ranking_player_current WHERE player_id IN (?) AND gametype=?`;

    return await simpleQuery(query, [playerIds, gametypeId]);
}

async function bulkUpdatePlayerCurrent(gametypeId, playerIds, data){

    const query = `INSERT INTO nstats_ranking_player_current (player_id,gametype,matches,
    playtime,ranking,ranking_change,last_active) VALUES ?`;

    const insertVars = [];

    for(const [playerId, playerData] of Object.entries(data)){


        insertVars.push([
            playerId, gametypeId, playerData.matches, playerData.playtime, playerData.currentScore, playerData.rankingChange, playerData.matchDate,
        ]);
    }


    await deletePlayerCurrent(gametypeId, playerIds);
    await bulkInsert(query, insertVars);

}

async function updatePlayers(gametypeId, playerIds, settings, generalColumns, ctfColumns, matchId, matchDate){

    const gColoumns = generalColumns.map((r) =>{ return `nstats_player_totals.${r}`});
    const cColoumns = ctfColumns.map((r) =>{ return `nstats_player_ctf_totals.${r}`});

    const matchScores = await calcMatchScores(matchId, matchDate, settings, generalColumns, ctfColumns);

    const query = `SELECT nstats_player_totals.player_id,nstats_player_totals.gametype,nstats_player_totals.playtime,nstats_player_totals.matches,
    ${gColoumns.toString()},${cColoumns.toString()} FROM nstats_player_totals 
    LEFT JOIN nstats_player_ctf_totals ON nstats_player_ctf_totals.player_id = nstats_player_totals.player_id AND 
    nstats_player_ctf_totals.gametype_id = nstats_player_totals.gametype AND nstats_player_ctf_totals.map_id = nstats_player_totals.map
    
    WHERE nstats_player_totals.player_id IN (?) AND nstats_player_totals.gametype=? AND nstats_player_totals.map=0`;

    const result = await simpleQuery(query, [playerIds, gametypeId]);

    const currentPlayerRankings = await getMultiplePlayerCurrent(gametypeId, playerIds);

    const players = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        const playerTotal = calculateRanking(r, settings, ctfColumns);

        players[r.player_id] = {};

        const p = players[r.player_id];
        p.matchDate = matchDate;
        p.matchId = matchId;
        p.matchScore = matchScores[r.player_id].currentScore;
        p.currentScore = playerTotal.currentScore//matchScores[r.player_id].currentScore;
        p.playtime = r.playtime;
        p.matches = r.matches;

        if(currentPlayerRankings[r.player_id] !== undefined){

            const diff = playerTotal.currentScore - currentPlayerRankings[r.player_id].ranking;
            p.rankingChange = diff;
        }else{
            p.rankingChange = matchScores[r.player_id].currentScore;
        }
    }

    await insertPlayerHistory(players, gametypeId);
    await bulkUpdatePlayerCurrent(gametypeId, playerIds, players);

}

export async function updatePlayerRankings(gametypeId, matchId, matchDate, playerIds){

    if(playerIds.length === 0) return;

    const settings = await getAllSettings(true);

    const {generalColumns, ctfColumns} = splitGeneralCTFColumns(settings);


    await updatePlayers(gametypeId, playerIds, settings, generalColumns, ctfColumns, matchId, matchDate);
}