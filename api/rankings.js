const mysql = require('./database');
const Message = require('./message');
const Gametypes = require("./gametypes");

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

    async recalculateGametypeRankings(gametypeId){

        gametypeId = parseInt(gametypeId);

        console.log(`Perform full recalculation of gametype rankings.`);

        const deletedHistoryResult = await this.deleteGametypeHistory(gametypeId);
        const deletedCurrentResult = await this.deleteGametypeCurrent(gametypeId);
        
        const gametypesManager = new Gametypes();
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
    
}

/*class Rankings{



    getPlayerPreviousHistoryRanking(player, gametype){

        return new Promise((resolve, reject) =>{

            const query = "SELECT ranking,match_ranking FROM nstats_ranking_player_history WHERE player_id=? AND gametype=? ORDER BY id DESC LIMIT 1";

            mysql.query(query, [player, gametype], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 0){
                        resolve(result[0]);
                    }
                }

                resolve(null);
            });
        });
    }

    async getMatchRankingChanges(matchId){

        const query = "SELECT player_id,ranking,match_ranking,ranking_change,match_ranking_change FROM nstats_ranking_player_history WHERE match_id=?";
        return await mysql.simpleQuery(query, [matchId]);
    }




    deleteMatchRankings(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_ranking_player_history WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    async reducePlayerRankingPlaytime(playerId, gametypeId, playtime){

        const query = "UPDATE nstats_ranking_player_current SET matches=matches-1,ranking_change=0,ranking=-1, playtime=playtime-? WHERE player_id=? AND gametype=?";
        return await mysql.simpleUpdate(query, [playtime, playerId, gametypeId]);
    }

    async deletePlayerMatchHistory(playerId, matchId){

        return await mysql.simpleDelete("DELETE FROM nstats_ranking_player_history WHERE player_id=? AND match_id=?",
            [playerId, matchId]
        );
    }

    async setPlayerGametypeRanking(playerId, gametype, value){

        return await mysql.simpleUpdate("UPDATE nstats_ranking_player_current SET ranking=? WHERE player_id=? AND gametype=?",
        [value, playerId, gametype]);
    }

    async recalculatePlayerRanking(playerId, playerGametypeData){

        try{

            const halfHour = 60 * 30;
            const hour = 60 * 60;
            const hour2 = hour * 2;
            const hour3 = hour * 3;

            const ignore = [
                "sub_half_hour_multiplier",
                "sub_hour_multiplier",
                "sub_2hour_multiplier",
                "sub_3hour_multiplier",
            ];

            const penalties = {};

            let currentScore = 0;

            for(let i = 0; i < this.settings.length; i++){

                const v = this.settings[i];

                if(ignore.indexOf(v.name) === -1){
                    currentScore += playerGametypeData[0][v.name] * v.value;
                }else{
                    penalties[v.name] = v.value;
                }
            }

            const playtime = playerGametypeData[0].playtime;

            currentScore = currentScore / (playtime / 60);

            if(currentScore === Infinity) currentScore = 0;

            if(playtime < halfHour){

                currentScore *= penalties["sub_half_hour_multiplier"];

            }else if(playtime < hour){

                currentScore *= penalties["sub_hour_multiplier"];

            }else if(playtime < hour2){

                currentScore *= penalties["sub_2hour_multiplier"];

            }else if(playtime < hour3){

                currentScore *= penalties["sub_3hour_multiplier"];
            }

            await this.setPlayerGametypeRanking(playerId, playerGametypeData[0].gametype, currentScore);

        }catch(err){
            console.trace(err);
        }

    }



    async deletePlayerFromMatch(playerId, matchId, playtime){

        try{

            const matchData = await this.getPlayerMatchHistory(playerId, matchId);

            if(matchData.length > 0){

                await this.reducePlayerRankingPlaytime(playerId, matchData[0].gametype, playtime);
            }
            await this.deletePlayerMatchHistory(playerId, matchId);

        }catch(err){
            console.trace(err);
        }
    }

    async deleteAllPlayerHistory(playerId){

        await mysql.simpleDelete("DELETE FROM nstats_ranking_player_history WHERE player_id=?", [playerId]);
    }

    async deleteAllPlayerCurrent(playerId){
        await mysql.simpleDelete("DELETE FROM nstats_ranking_player_current WHERE player_id=?", [playerId]);
    }


    async insertPlayerCurrentFromMerge(playerId, gametypeId, data){

        const query = `INSERT INTO nstats_ranking_player_current VALUES(
            NULL,?,?,?,?,?,?
        )`;


        const ranking = parseInt(data.ranking);
        const lastChange = parseInt(data.lastChange);
       

        const vars = [
            playerId, 
            gametypeId,
            data.matches,
            data.playtime,
            (ranking !== ranking) ? 0 : data.ranking,
            (lastChange !== lastChange) ? 0 : data.lastChange
        ];

        await mysql.simpleInsert(query, vars);
    }

    async fullPlayerRecalculate(playerId, matches){

        try{

            console.log(`Start of full player recalculation for playerId ${playerId}, ${matches.length * 2} matches needs to be processed`);

            const settings = await this.getSettingsObject();

            const gametypeTotals = {};

            gametypeTotals[0] = {
                "totalScore": 0,
                "playtime": 0,
                "matches": 0,
                "lastChange": 0,
                "ranking": 0,
            };
            

            const updateGametypeTotals = (gametype, playtime, totalScore) =>{

                if(gametypeTotals[gametype] === undefined){
                    
                    gametypeTotals[gametype] = {"totalScore": 0, "playtime": 0, "matches": 0, "lastChange": 0, "ranking": 0};
                }

                gametypeTotals[gametype].totalScore += totalScore;
                gametypeTotals[gametype].playtime += playtime;
                gametypeTotals[gametype].matches++;
                
            }


            const halfHour = 60 * 30;
            const hour = 60 * 60;
            const hour2 = hour * 2;
            const hour3 = hour * 3;

            let previousMatchScore = 0;
            let matchChange = 0;
            let currentTotalScore = 0;
            let previousTotalScore = 0;
            let totalPlaytime = 0;
            let totalChange = 0;

            for(let i = 0; i < matches.length; i++){

                const m = matches[i];

                const currentMatchScore = createMatchScore(timePenalties, types, m, playtime);

                updateGametypeTotals(0, m.playtime, currentMatchScore);
                updateGametypeTotals(m.gametype, m.playtime, currentMatchScore);

                matchChange = currentMatchScore - previousMatchScore;

                totalPlaytime = gametypeTotals[m.gametype].playtime / 60;

                currentTotalScore = gametypeTotals[m.gametype].totalScore / totalPlaytime;

                if(currentTotalScore === Infinity){

                    currentTotalScore = 0;

                }else{

                    
                    if(totalPlaytime < halfHour){
                        currentTotalScore *= settings["sub_half_hour_multiplier"];
                    }else if(totalPlaytime < hour){
                        currentTotalScore *= settings["sub_hour_multiplier"];
                    }else if(totalPlaytime < hour2){
                        currentTotalScore *= settings["sub_2hour_multiplier"];
                    }else if(totalPlaytime < hour3){
                        currentTotalScore *= settings["sub_3hour_multiplier"];
                    }

                }


                totalChange = currentTotalScore - previousTotalScore;

                gametypeTotals[m.gametype].lastChange = totalChange;
                gametypeTotals[m.gametype].ranking = currentTotalScore;
                gametypeTotals[0].lastChange = totalChange;
                gametypeTotals[0].ranking = currentTotalScore;

                if(currentTotalScore !== currentTotalScore) currentTotalScore = 0;
                if(totalChange !== totalChange) totalChange = 0;
                if(matchChange !== matchChange) matchChange = 0;



                await this.insertPlayerHistory(m.match_id, playerId, m.gametype, currentTotalScore, currentMatchScore, totalChange, matchChange);

                previousMatchScore = currentMatchScore;
                previousTotalScore = currentTotalScore;
                
            }

            for(const [key, value] of Object.entries(gametypeTotals)){

                await this.insertPlayerCurrentFromMerge(playerId, key, value);
            }

        }catch(err){

            console.trace(err);
        }
    }

    async deletePlayer(playerId){

        await mysql.simpleDelete("DELETE FROM nstats_ranking_player_current WHERE player_id=?", [playerId]);
        await mysql.simpleDelete("DELETE FROM nstats_ranking_player_history WHERE player_id=?", [playerId]);
    }


    async deleteGametypeHistory(id){
        await mysql.simpleDelete("DELETE FROM nstats_ranking_player_history WHERE gametype=?",[id]);
        await mysql.simpleDelete("DELETE FROM nstats_ranking_player_current WHERE gametype=?",[id]);
    }

    async insertPlayerCurrentFull(playerId, gametypeId, matches, playtime, ranking, rankingChange){

        const query = `INSERT INTO nstats_ranking_player_current VALUES(NULL,?,?,?,?,?,?)`;

        if(ranking !== ranking) ranking = 0;
        if(rankingChange !== rankingChange) rankingChange = 0;

        const vars = [playerId, gametypeId, matches, playtime, ranking, rankingChange];

        await mysql.simpleInsert(query, vars);

    }

    getEventValue(values, eventName){

        for(let i = 0; i < values.length; i++){

            const v = values[i];
            if(v.name === eventName) return v.value;
        }

        return null;
    }


    async recalculateGametypeRankings(id){

        try{

            const settings = await this.getSettings();

            const query = `SELECT * FROM nstats_player_matches WHERE gametype=? AND played=1 AND playtime>0 ORDER BY match_id ASC`;

            const data = await mysql.simpleFetch(query, [id]);

            const players = {};
            let previous = 0;

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                if(players[d.player_id] === undefined){
                    players[d.player_id] = [this.createDummyPlayerData()];
                }else{
                    players[d.player_id].push(this.createDummyPlayerData());
                }

                const currentIndex = players[d.player_id].length - 1;
                const current = players[d.player_id][players[d.player_id].length - 1];
                current.match_id = d.match_id;

                if(currentIndex > 0){
                    previous = players[d.player_id][players[d.player_id].length - 2]
                }else{
                    previous = current;
                }

                current.matches = previous.matches + 1;
                current.playtime += previous.playtime + d.playtime;

                const currentScore = this.createMatchScore(settings, d, current.playtime);

                current.ranking = currentScore;
                current.match_ranking = currentScore;


                if(currentIndex === 0){
                    current.ranking_change = current.ranking;
                    current.match_ranking_change = current.match_ranking;
                }else{
                    current.ranking_change = current.ranking - players[d.player_id][currentIndex - 1].ranking;
                    current.match_ranking_change = current.match_ranking_change - players[d.player_id][currentIndex - 1].match_ranking;
                }
            
            }

            await this.deleteGametypeHistory(id);

            for(const [playerId, data] of Object.entries(players)){

                for(let i = 0; i < data.length; i++){

                    const d = data[i];

                    await this.insertPlayerHistory(d.match_id, playerId, id, d.ranking, d.match_ranking, d.ranking_change, d.match_ranking_change);

                    if(i === data.length - 1){
                        await this.insertPlayerCurrentFull(playerId, id, d.matches, d.playtime, d.ranking, d.ranking_change)
                    }
                }
            }

        }catch(err){
            console.trace(err);
        }
    }

    async changeGametypeId(oldId, newId){

        try{

            const vars = [oldId, newId];

            const currentQuery = "DELETE FROM nstats_ranking_player_current WHERE gametype IN (?)";
            await mysql.simpleUpdate(currentQuery, vars);

            const historyQuery = "DELETE FROM nstats_ranking_player_history WHERE gametype IN (?)";

            await mysql.simpleUpdate(historyQuery, vars);


            await this.recalculateGametypeRankings(newId);
            

        }catch(err){
            console.trace(err);
        }
    }


    async deleteGametype(gametypeId){

        try{


            await mysql.simpleDelete("DELETE FROM nstats_ranking_player_current WHERE gametype=?", [gametypeId]);
            await mysql.simpleDelete("DELETE FROM nstats_ranking_player_history WHERE gametype=?", [gametypeId]);

        }catch(err){
            console.trace(err);
        }
    }


    async updateEvent(id, description, value){

        try{

            id = parseInt(id);
            value = parseFloat(value);

            if(value === value){

                await mysql.simpleUpdate("UPDATE nstats_ranking_values SET description=?,value=? WHERE id=?", [description, value, id]);

            }else{
                console.log("Value must be a valid float");
                return;
            }

        }catch(err){
            console.trace(err);
        }
    }

}*/


module.exports = Rankings;