const mysql = require('./database');
const Message = require('./message');

class Rankings{

    constructor(){}

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
        return await mysql.simpleQuery(query);
    }


    async insertPlayerCurrent(playerId, gametypeId, totalMatches, playtime, ranking, rankingChange){

        const query = "INSERT INTO nstats_ranking_player_current VALUES(NULL,?,?,?,?,?,?)";

        await mysql.simpleQuery(query, [playerId, gametypeId, totalMatches, playtime, ranking, rankingChange]);
    }


    async updatePlayerCurrentQuery(playerId, gametypeId, playtime, ranking, rankingChange){

        const query = `UPDATE nstats_ranking_player_current SET 
        matches=matches+1,playtime=playtime+?,ranking=?,ranking_change=? WHERE player_id=? AND gametype=?`;

        await mysql.simpleQuery(query, [playtime, ranking, rankingChange, playerId, gametypeId]);
    }

    async updatePlayerCurrentCustom(playerId, gametypeId, playtime, totalMatches, ranking, rankingChange){

        const query = `UPDATE nstats_ranking_player_current SET 
        matches=?,playtime=?,ranking=?,ranking_change=? WHERE player_id=? AND gametype=?`;

        const result = await mysql.simpleQuery(query, [totalMatches, playtime, ranking, rankingChange, playerId, gametypeId]);

        if(result.changedRows === 0){      
            await this.insertPlayerCurrent(playerId, gametypeId, totalMatches, playtime, ranking, rankingChange);
        }    
    }

    async getPlayerGametypeRanking(playerId, gametypeId){

        const query = `SELECT ranking FROM nstats_ranking_player_current WHERE player_id=? AND gametype=? LIMIT 1`;

        const result = await mysql.simpleQuery(query, [playerId, gametypeId]);

        if(result.length > 0){
            return result[0].ranking;
        }

        return null;

    }

    async updatePlayerRankings(playerManager, playerId, gametypeId, matchId){


        const playerMatchData = await playerManager.getMatchData(playerId, matchId);

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

        const result = await mysql.simpleQuery(query, [playerId, gametypeId]);

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

        await mysql.simpleQuery(query, vars);
    }

    calculateRanking(data){

        if(data === null){
            new Message(`Rankings.calculateRanking() data is null`,"error");
            return 0;
        }

        const playtime = data.playtime ?? 0;

        let score = 0;

        for(const [type, value] of Object.entries(this.settings)){

            if(this.settings[type] === undefined){

                new Message(`Ranking setting ${type} does not exist!`,"error");
                continue;
            }

            score += data[type] * value;
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


    async getData(gametypeId, page, perPage){

        page = parseInt(page);
        perPage = parseInt(perPage);

        if(page !== page) page = 1;
        if(perPage !== perPage) perPage = 25;

        page--;

        const start = page * perPage;

        const query = "SELECT * FROM nstats_ranking_player_current WHERE gametype=? ORDER BY ranking DESC LIMIT ?,?";

        return await mysql.simpleQuery(query, [gametypeId, start, perPage]);

    }

    async getMultipleGametypesData(gametypeIds, perPage){

        if(gametypeIds.length === 0) return [];

        const data = [];

        for(let i = 0; i < gametypeIds.length; i++){

            const id = gametypeIds[i];

            const result = await this.getData(id, 1, perPage);
            data.push({"data": result, "id": id});
        }


        return data;
    }


    async getTotalPlayers(gametypeId){

        const query = "SELECT COUNT(*) as total_players FROM nstats_ranking_player_current WHERE gametype=?";

        const result = await mysql.simpleQuery(query, [gametypeId]);

        return result[0].total_players;

    }

    async getDetailedSettings(){

        const query = "SELECT name,display_name,description,value FROM nstats_ranking_values";
        return await mysql.simpleQuery(query);
    }


    async getPlayerRankings(playerId){

        const query = "SELECT gametype,matches,playtime,ranking,ranking_change FROM nstats_ranking_player_current WHERE player_id=?";

        return await mysql.simpleQuery(query, [playerId]);
    }

    async getGametypePosition(rankingValue, gametypeId){

        const query = "SELECT COUNT(*) as total_values FROM nstats_ranking_player_current WHERE gametype=? AND ranking>? ORDER BY ranking DESC";

        const result = await mysql.simpleQuery(query, [gametypeId, rankingValue]);

        if(result[0].total_values === 0) return 1;

        return result[0].total_values + 1;
    }

    async getMatchRankingChanges(matchId){

        const query = "SELECT player_id,ranking,match_ranking,ranking_change,match_ranking_change FROM nstats_ranking_player_history WHERE match_id=?";
        return await mysql.simpleQuery(query, [matchId]);
    }


    async getCurrentPlayersRanking(players, gametype){

        if(players.length === 0) return [];

        const query = "SELECT player_id,ranking,ranking_change FROM nstats_ranking_player_current WHERE player_id IN(?) AND gametype=?";

        return await mysql.simpleQuery(query, [players, gametype]);
    }

    async getPlayerMatchHistory(playerId, matchId){

        const query = "SELECT * FROM nstats_ranking_player_history WHERE player_id=? AND match_id=?";
        return await mysql.simpleFetch(query, [playerId, matchId]);
    }

    async getCurrentPlayerRanking(playerId, gametypeId){

        const query = `SELECT matches, playtime, ranking, ranking_change FROM 
        nstats_ranking_player_current WHERE player_id=? AND gametype=?`;
        
        return await mysql.simpleFetch(query, [playerId, gametypeId]);
    }

    async deleteGametypeHistory(gametypeId){

        const query = "DELETE FROM nstats_ranking_player_history WHERE gametype=?";
        return await mysql.simpleQuery(query, [gametypeId]);
    }

    async deleteGametypeCurrent(gametypeId){

        const query = "DELETE FROM nstats_ranking_player_current WHERE gametype=?";
        return await mysql.simpleQuery(query, [gametypeId]);
    }

    async deletePlayerGametypeCurrent(playerId, gametypeId){

        const query = "DELETE FROM nstats_ranking_player_current WHERE player_id=? AND gametype=?";
        return await mysql.simpleQuery(query, [playerId, gametypeId]);
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

        const result = await mysql.simpleQuery(query, [displayName, description, value, name]);

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

        return await mysql.simpleQuery(query, [playerId, matchId]);
    }

    async deletePlayerGametypeHistory(playerId, gametypeId){

        const query = "DELETE FROM nstats_ranking_player_history WHERE player_id=? AND gametype=?";

        return await mysql.simpleQuery(query, [playerId, gametypeId]);
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
        const historyResult = await mysql.simpleQuery(historyQuery, vars);

        const currentQuery = "DELETE FROM nstats_ranking_player_current WHERE player_id=?";
        const currentResult = await mysql.simpleQuery(currentQuery, vars);

        return {"history": historyResult.affectedRows, "current": currentResult.affectedRows};
    }
}

module.exports = Rankings;