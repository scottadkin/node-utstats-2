import { simpleQuery } from "./database.js";
import Message from "./message.js";
import { getAllGametypeNames } from "./gametypes.js";
import { getBasicPlayersByIds } from "./players.js";

const validLastActive =  {
    "1": 60 * 60 * 24,
    "7": 60 * 60 * 24 * 7,
    "28": 60 * 60 * 24 * 28,
    "90": 60 * 60 * 24 * 90,
    "365": 60 * 60 * 24 * 365,
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

    const now = Math.ceil(Date.now() * 0.001);

    let limit = 0;

    if(validLastActive[lastActive] !== undefined){

        limit = now - validLastActive[lastActive];
        if(limit < 0) limit = 0;
    }

    return limit;
}

function sanitizeMinPlaytime(minPlaytime){

    let limit = 0;

    if(validMinPlaytimes[minPlaytime] !== undefined){
        limit = validMinPlaytimes[minPlaytime];
    }

    return limit;
}

export default class Rankings{

    constructor(){ }

    async init(){

        await this.loadCurrentSettings();
    }

    async loadCurrentSettings(){

        const settings = await this.getCurrentSettings();

        this.settings = {};
        this.timePenalties = {};

        const penaltyNames = [
            "sub_half_hour_multiplier",
            "sub_hour_multiplier",
            "sub_2hour_multiplier",
            "sub_3hour_multiplier"
        ];

        for(let i = 0; i < settings.length; i++){

            const {name, value} = settings[i];

            if(penaltyNames.indexOf(name) === -1){
                this.settings[name] = value;
            }else{
                this.timePenalties[name] = value;
            }
        }
    }

    async getCurrentSettings(){

        const query = "SELECT name,value FROM nstats_ranking_values";
        return await simpleQuery(query);
    }


    async _getPlayerLatestGametypeDate(playerId, gametypeId){

        const query = `SELECT match_date FROM nstats_player_matches WHERE player_id=? AND gametype=? AND playtime>0 ORDER BY match_date DESC LIMIT 1`;

        const result = await simpleQuery(query, [playerId, gametypeId]);

        if(result.length > 0) return result[0].match_date;

        return null;
    }

    async insertPlayerCurrent(playerId, gametypeId, totalMatches, playtime, ranking, rankingChange){

        const query = "INSERT INTO nstats_ranking_player_current VALUES(NULL,?,?,?,?,?,?,?)";

        let latestMatchDate = await this._getPlayerLatestGametypeDate(playerId, gametypeId);

        if(latestMatchDate === null){
            new Message(`rankings.insertPlayerCurrent() latestMatchDate is null!`);
            latestMatchDate = 0;
        }

        await simpleQuery(query, [playerId, gametypeId, totalMatches, playtime, ranking, rankingChange, latestMatchDate]);
    }


    async updatePlayerCurrentQuery(playerId, gametypeId, playtime, ranking, rankingChange){

        const query = `UPDATE nstats_ranking_player_current SET 
        matches=matches+1,playtime=playtime+?,ranking=?,ranking_change=? WHERE player_id=? AND gametype=?`;

        await simpleQuery(query, [playtime, ranking, rankingChange, playerId, gametypeId]);
    }

    async updatePlayerCurrentCustom(playerId, gametypeId, playtime, totalMatches, ranking, rankingChange){

        const query = `UPDATE nstats_ranking_player_current SET 
        matches=?,playtime=?,ranking=?,ranking_change=? WHERE player_id=? AND gametype=?`;

        const result = await simpleQuery(query, [totalMatches, playtime, ranking, rankingChange, playerId, gametypeId]);

        if(result.changedRows === 0){      
            await this.insertPlayerCurrent(playerId, gametypeId, totalMatches, playtime, ranking, rankingChange);
        }    
    }

    async getPlayerGametypeRanking(playerId, gametypeId){

        const query = `SELECT ranking FROM nstats_ranking_player_current WHERE player_id=? AND gametype=? LIMIT 1`;

        const result = await simpleQuery(query, [playerId, gametypeId]);

        if(result.length > 0){
            return result[0].ranking;
        }

        return null;

    }

    async updatePlayerRankings(playerManager, playerId, gametypeId, matchId){

        const playerMatchData = await playerManager.getMatchData(playerId, matchId);;

        if(playerMatchData === null){
            new Message(`Rankings.updatePlayerRankings() playerMatchData is null!`, "error");
            return;
        }


        if(playerMatchData.playtime === undefined){
            new Message(`Rankings.updatePlayerRankings() playtime is undefined!`, "error");
            return;
        }

        const playtime = playerMatchData.playtime;

        const playerTotalData = await playerManager.getPlayerGametypeTotals(playerId, gametypeId);

        const newGametypeRanking = this.calculateRanking(playerTotalData);
        const matchRankingScore = this.calculateRanking(playerMatchData);

        if(!await this.playerCurrentRankingExists(playerId, gametypeId)){

            await this.insertPlayerCurrent(playerId, gametypeId, 1, playtime, newGametypeRanking, newGametypeRanking);
            await this.insertPlayerHistory(matchId, playerId, gametypeId, newGametypeRanking, matchRankingScore, 0);

        }else{
       

            const previousGametypeRanking = await this.getPlayerGametypeRanking(playerId, gametypeId);
            
            const rankingDiff = newGametypeRanking - previousGametypeRanking;

            await this.updatePlayerCurrentQuery(playerId, gametypeId, playtime, newGametypeRanking, rankingDiff);

            await this.insertPlayerHistory(matchId, playerId, gametypeId, newGametypeRanking, matchRankingScore, rankingDiff);
        }
    }

    async playerCurrentRankingExists(playerId, gametypeId){

        const query = "SELECT COUNT(*) as total_players FROM nstats_ranking_player_current WHERE player_id=? AND gametype=?";

        const result = await simpleQuery(query, [playerId, gametypeId]);

        if(result.length > 0){

            if(result[0].total_players > 0){
                return true;
            }
        }

        return false;
    }

    async insertPlayerHistory(matchId, playerId, gametypeId, ranking, matchRanking, rankingChange){

        const query = "INSERT INTO nstats_ranking_player_history VALUES(NULL,?,?,?,?,?,?,0)";

        const vars = [matchId, playerId, gametypeId, ranking, matchRanking, rankingChange];

        await simpleQuery(query, vars);
    }

    calculateRanking(data){

        if(data === null){
            new Message(`Rankings.calculateRanking() data is null`,"error");
            return 0;
        }

        const playtime = data.playtime ?? 0;

        let score = 0;


        //remove this after table is finished
        const ctfIgnore = ["id", "player_id", "match_id", "gametype_id", "server_id", "map_id", "match_date","playtime"];
        

        for(const [type, value] of Object.entries(this.settings)){

            if(this.settings[type] === undefined){

                new Message(`Ranking setting ${type} does not exist!`,"error");
                continue;
            }

            if(data[type] !== undefined){
                score += data[type] * value;
            }else{

                if(data.ctfData !== undefined){

                    if(data.ctfData[type] !== undefined){
                        
                        if(ctfIgnore.indexOf(type) === -1){
                            score += data.ctfData[type] * value;
                        }
                    }
                }
            }
        }


        const hour = 60 * 60;

        if(score !== 0){

            if(playtime !== 0){
                score = score / (playtime / 60)
            }else{
                score = 0;
            }

            if(playtime <= hour * 0.5){
                score = score * this.timePenalties["sub_half_hour_multiplier"];
            }else if(playtime < hour){
                score = score * this.timePenalties["sub_hour_multiplier"];
            }else if(playtime < hour * 2){
                score = score * this.timePenalties["sub_2hour_multiplier"];
            }else if(playtime < hour * 3){
                score = score * this.timePenalties["sub_3hour_multiplier"];
            }
        }

        return score;
    }

    /*async getMultipleGametypesData(gametypeIds, perPage, lastActive, minPlaytime){

        if(gametypeIds.length === 0) return [];

        const data = [];

        for(let i = 0; i < gametypeIds.length; i++){

            const id = gametypeIds[i];

            const result = await this.getData(id, 1, perPage, lastActive, minPlaytime);
            data.push({"data": result, "id": id});
        }

        console.log(data);

        return data;
    }*/


    async getTotalPlayers(gametypeId, lastActive, minPlaytime){

        const limit = sanitizeLastActive(lastActive);
        minPlaytime = sanitizeMinPlaytime(minPlaytime);

        const query = "SELECT COUNT(*) as total_players FROM nstats_ranking_player_current WHERE gametype=? AND last_active>=? AND playtime>=?";

        const result = await simpleQuery(query, [gametypeId, limit, minPlaytime]);

        return result[0].total_players;

    }

    async getPlayerRankings(playerId){

        const query = "SELECT gametype,matches,playtime,ranking,ranking_change FROM nstats_ranking_player_current WHERE player_id=?";

        return await simpleQuery(query, [playerId]);
    }

    async getGametypePosition(rankingValue, gametypeId){

        const query = "SELECT COUNT(*) as total_values FROM nstats_ranking_player_current WHERE gametype=? AND ranking>? ORDER BY ranking DESC";

        const result = await simpleQuery(query, [gametypeId, rankingValue]);

        if(result[0].total_values === 0) return 1;

        return result[0].total_values + 1;
    }

    async getMatchRankingChanges(matchId){

        const query = "SELECT player_id,ranking,match_ranking,ranking_change,match_ranking_change FROM nstats_ranking_player_history WHERE match_id=?";
        return await simpleQuery(query, [matchId]);
    }


    async getPlayerMatchRankingChange(matchId, playerId){

        const query = `SELECT ranking,match_ranking,ranking_change,match_ranking_change 
        FROM nstats_ranking_player_history WHERE match_id=? AND player_id=?`;

        const result = await simpleQuery(query, [matchId, playerId]);

        if(result.length > 0){
            return result[0];
        }

        return {"ranking": 0, "match_ranking": 0, "ranking_change": 0, "match_ranking_change": 0};
    }


    async getCurrentPlayersRanking(players, gametype){

        if(players.length === 0) return [];

        const query = "SELECT player_id,ranking,ranking_change FROM nstats_ranking_player_current WHERE player_id IN(?) AND gametype=?";

        return await simpleQuery(query, [players, gametype]);
    }

    async getCurrentRanking(playerId, gametype){

        const query = "SELECT ranking,ranking_change FROM nstats_ranking_player_current WHERE player_id=? AND gametype=?";

        const result = await simpleQuery(query, [playerId, gametype]);

        if(result.length > 0){
            return result[0];
        }

        return {"ranking": 0, "ranking_change": 0};
    }

    async getPlayerMatchHistory(playerId, matchId){

        const query = "SELECT * FROM nstats_ranking_player_history WHERE player_id=? AND match_id=?";
        return await simpleQuery(query, [playerId, matchId]);
    }

    async getCurrentPlayerRanking(playerId, gametypeId){

        const query = `SELECT matches, playtime, ranking, ranking_change FROM 
        nstats_ranking_player_current WHERE player_id=? AND gametype=?`;
        
        return await simpleQuery(query, [playerId, gametypeId]);
    }

    async deleteGametypeHistory(gametypeId){

        const query = "DELETE FROM nstats_ranking_player_history WHERE gametype=?";
        return await simpleQuery(query, [gametypeId]);
    }

    async deleteGametypeCurrent(gametypeId){

        const query = "DELETE FROM nstats_ranking_player_current WHERE gametype=?";
        return await simpleQuery(query, [gametypeId]);
    }

    async deletePlayerGametypeCurrent(playerId, gametypeId){

        const query = "DELETE FROM nstats_ranking_player_current WHERE player_id=? AND gametype=?";
        return await simpleQuery(query, [playerId, gametypeId]);
    }


    async deleteGametype(gametypeId){

        const currentResult = await this.deleteGametypeCurrent(gametypeId);
        const historyResult = await this.deleteGametypeHistory(gametypeId);

        return {"deletedCurrentCount": currentResult.affectedRows, "deletedHistoryCount": historyResult.affectedRows};
    }
    
    updateCurrentPlayerTotal(totals, data){

        const playerId = data.player_id;

        if(totals[playerId] === undefined){

            totals[playerId] = {
                "playtime": 0,
                "previousScore": 0,
                "matches": 0,
                "rankingChange": 0
            };
        }


        const player = totals[playerId];

        player.playtime += data.playtime;
        player.matches++;

        const ignore = ["sub_half_hour_multiplier","sub_hour_multiplier","sub_2hour_multiplier","sub_3hour_multiplier"];

        for(const key of Object.keys(this.settings)){

            if(ignore.indexOf(key) !== -1){
                continue;
            }

            if(player[key] === undefined){
                player[key] = data[key];
            }else{
                player[key] += data[key];
            }     
        }

        return player;
    }

    async recalculateGametypeRankings(gametypesManager, gametypeId){

        gametypeId = parseInt(gametypeId);

        console.log(`Perform full recalculation of gametype rankings.`);

        const deletedHistoryResult = await this.deleteGametypeHistory(gametypeId);
        const deletedCurrentResult = await this.deleteGametypeCurrent(gametypeId);
        
        const data = await gametypesManager.getAllPlayerMatchData(gametypeId);

        const currentTotals = {};
        let insertedHistoryCount = 0;

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const matchScore = this.calculateRanking(d);

            const playerTotalData = this.updateCurrentPlayerTotal(currentTotals, d);
            const totalScore = this.calculateRanking(playerTotalData);
            

            const rankingChange = totalScore - playerTotalData.previousScore;

            await this.insertPlayerHistory(d.match_id, d.player_id, gametypeId, totalScore, matchScore, rankingChange);

            insertedHistoryCount++;

            playerTotalData.previousScore = totalScore;  
            playerTotalData.rankingChange = rankingChange;
        }

        let insertedCurrentCount = 0;

        for(const [playerId, data] of Object.entries(currentTotals)){

            await this.insertPlayerCurrent(playerId, gametypeId, data.matches, data.playtime, data.previousScore, data.rankingChange);
            insertedCurrentCount++;
        }

        return {
            "deletedHistoryCount": deletedHistoryResult.affectedRows,
            "deletedCurrentCount": deletedCurrentResult.affectedRows,
            "insertedHistoryCount": insertedHistoryCount,
            "insertedCurrentCount": insertedCurrentCount
        };
    }


    async updateEvent(name, displayName, description, value){

        const query = "UPDATE nstats_ranking_values SET display_name=?,description=?,value=? WHERE name=?";

        const result = await simpleQuery(query, [displayName, description, value, name]);

        if(result.changedRows > 0) return true;

        return false;
    }


    async changeGametypeId(gametypesManager, oldId, newId){

        try{

            await this.deleteGametype(oldId);
            await this.deleteGametype(newId);
            await this.recalculateGametypeRankings(gametypesManager, newId);     

        }catch(err){
            console.trace(err);
        }
    }

    async deletePlayerMatchHistory(playerId, matchId){

        const query = "DELETE FROM nstats_ranking_player_history WHERE player_id=? AND match_id=?";

        return await simpleQuery(query, [playerId, matchId]);
    }

    async deletePlayerGametypeHistory(playerId, gametypeId){

        const query = "DELETE FROM nstats_ranking_player_history WHERE player_id=? AND gametype=?";

        return await simpleQuery(query, [playerId, gametypeId]);
    }


    async deletePlayerFromMatch(playerManager, playerId, matchId, gametypeId, bRecalculate){

        if(bRecalculate){

            await this.deletePlayerGametypeHistory(playerId, gametypeId);
            await this.recalculatePlayerGametype(playerManager, playerId, gametypeId);

        }else{

            await this.deletePlayerMatchHistory(playerId, matchId);
        }
    }

    async fullPlayerRecalculate(playerManager, playerId){

        const playedGametypes = await playerManager.getPlayedGametypes(playerId);

        for(let i = 0; i < playedGametypes.length; i++){

            const pId = playedGametypes[i];

            await this.recalculatePlayerGametype(playerManager, playerId, pId);
        }
    }

    async deletePlayerGametype(playerId, gametypeId){

        await this.deletePlayerGametypeCurrent(playerId, gametypeId);
        await this.deletePlayerGametypeHistory(playerId, gametypeId);
    }

    async recalculatePlayerGametype(playerManager, playerId, gametypeId){

        console.log(`recalculate player ranking for playerId=${playerId} and gametypeId=${gametypeId}`);

        const matchHistory = await playerManager.getAllPlayersGametypeMatchData(gametypeId, playerId);

        await this.deletePlayerGametype(playerId, gametypeId);

        const totals = {};


        for(let i = 0; i < matchHistory.length; i++){

            const m = matchHistory[i];

            const matchId = m.match_id;

            const matchScore = this.calculateRanking(m);


            const totalData = this.updateCurrentPlayerTotal(totals, m);
            const totalScore = this.calculateRanking(totalData);

            const rankingChange = totalScore - totalData.previousScore;

            await this.insertPlayerHistory(matchId, playerId, gametypeId, totalScore, matchScore, rankingChange);

            totalData.previousScore = totalScore;  
            totalData.rankingChange = rankingChange;

        }

        //await this.deletePlayerGametypeCurrent(playerId, gametypeId);

        for(const [playerId, data] of Object.entries(totals)){
            await this.insertPlayerCurrent(playerId, gametypeId, data.matches, data.playtime, data.previousScore, data.rankingChange);
            //await this.updatePlayerCurrentCustom(playerId, gametypeId, data.playtime, data.matches, data.previousScore, data.rankingChange);
        }     
        
        
    }  

    async deletePlayer(playerId){

        const vars = [playerId];

        const historyQuery = "DELETE FROM nstats_ranking_player_history WHERE player_id=?";
        const historyResult = await simpleQuery(historyQuery, vars);

        const currentQuery = "DELETE FROM nstats_ranking_player_current WHERE player_id=?";
        const currentResult = await simpleQuery(currentQuery, vars);

        return {"history": historyResult.affectedRows, "current": currentResult.affectedRows};
    }


    async deleteMatchRankings(matchId){

        const query = `DELETE FROM nstats_ranking_player_history WHERE match_id=?`;

        return await simpleQuery(query, [matchId]);
    }


    async _getAllPlayerIdsFromCurrent(){

        const query = `SELECT player_id,gametype FROM nstats_ranking_player_current`;

        const result = await simpleQuery(query);

        return result.map((r) =>{
            return {"player": r.player_id, "gametype": r.gametype}
        });
    }

    async setAllPlayerCurrentLastActive(){
        
        const data = await this._getAllPlayerIdsFromCurrent();

        const query = `UPDATE nstats_ranking_player_current SET last_active=? WHERE player_id=? AND gametype=?`;

        for(let i = 0; i < data.length; i++){

            const {player, gametype} = data[i];

            const last = await this._getPlayerLatestGametypeDate(player, gametype);

            if(last === null){
                new Message(`setAllPlayerCurrentLastActive last is null`,"warning");
                continue;
            }

            await simpleQuery(query, [last, player, gametype]);
        } 
    }
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
    WHERE gametype=? ORDER BY ranking DESC LIMIT ?`;

    const uniquePlayerIds = new Set();

    for(let i = 0; i < gametypeIds.length; i++){

        const id = gametypeIds[i];

        const result = await simpleQuery(query, [id, maxPlayers]);

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