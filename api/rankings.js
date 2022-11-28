const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

class Rankings{

    constructor(){


    }


    getRankingSettings(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,value FROM nstats_ranking_values";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    async getFullValues(){

        return await mysql.simpleFetch("SELECT * FROM nstats_ranking_values");
    }

    setRankingSettings(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,value FROM nstats_ranking_values";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data[result[i].name] = result[i].value;
                    }

                    this.settings = data;
                }

                resolve();
            });
        });
    }

    insertPlayerCurrent(player, gametype, playtime, ranking){

        return new Promise((resolve, reject) =>{

            if(ranking !== ranking) ranking = 0;

            const query = "INSERT INTO nstats_ranking_player_current VALUES(NULL,?,?,1,?,?,?)";

            mysql.query(query, [player,gametype,playtime,ranking,ranking], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    updatePlayerCurrent(player, gametype, playtime, newRanking){

        return new Promise((resolve, reject) =>{
            

            const query = `UPDATE nstats_ranking_player_current SET
            matches=matches+1, playtime=?,ranking_change=?-ranking,ranking=?
            WHERE gametype=? AND player_id=?`;


            if(newRanking !== newRanking){
                newRanking = 0;
            }

            mysql.query(query, [playtime, newRanking, newRanking, gametype, player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    resolve(result.affectedRows);
                }

                resolve(0);
            });
        });
    }

    insertPlayerHistory(matchId, player, gametype, ranking, matchScore, rankingChange, matchChange){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_ranking_player_history VALUES(NULL,?,?,?,?,?,?,?)";

            if(matchScore !== matchScore || matchScore === Infinity) matchScore = 0;
            if(matchChange !== matchChange || matchChange === Infinity) matchChange = 0;

            if(ranking !== ranking) ranking = 0;
            if(rankingChange !== rankingChange) rankingChange = 0;

            mysql.query(query, [matchId, player, gametype, ranking, matchScore, rankingChange, matchChange], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

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

    async update(matchId, players, gametype, bIgnoreBots){

        try{

            const halfHour = 60 * 30;
            const hour = 60 * 60;
            const hour2 = hour * 2;
            const hour3 = hour * 3;



            if(this.settings === undefined){
                new Message(`Rankings.update() Settings are not set, can't updated rankings!`,"error");
                return;
            }

            const s = this.settings;

            const ignore = [
                "sub_half_hour_multiplier",
                "sub_hour_multiplier",
                "sub_2hour_multiplier",
                "sub_3hour_multiplier"
            ];

           // const scores = {};

            let p = 0;
            let currentScore = 0;
            let currentPlaytime = 0;
            let matchScore = 0;

            let previousData = 0;

            for(const [key, value] of Object.entries(players)){

                currentScore = 0;
            
                for(const [settingKey, settingValue] of Object.entries(s)){

                    if(ignore.indexOf(settingKey) != -1) continue;

                    currentScore += value[settingKey] * settingValue;
                }


                currentPlaytime = value.playtime;

                currentScore = currentScore / (currentPlaytime / 60);
                         
                if(currentPlaytime < halfHour){

                    currentScore *= s.sub_half_hour_multiplier;

                }else if(currentPlaytime < hour){

                    currentScore *= s.sub_hour_multiplier;

                }else if(currentPlaytime < hour2){

                    currentScore *= s.sub_2hour_multiplier;

                }else if(currentPlaytime < hour3){
                    
                    currentScore *= s.sub_3hour_multiplier;
                }

                matchScore = currentScore;

                if(currentScore === Infinity || currentScore === -Infinity) currentScore = 0;
                if(matchScore === Infinity || matchScore === -Infinity) matchScore = 0;

                previousData = await this.getPlayerPreviousHistoryRanking(parseInt(key), gametype);


                if(await this.updatePlayerCurrent(parseInt(key), gametype, currentPlaytime, currentScore) === 0){
                    await this.insertPlayerCurrent(parseInt(key), gametype, currentPlaytime, currentScore);
                }

                if(previousData === null){
                    previousData = {"ranking": currentScore, "match_ranking": matchScore};
                }

                await this.insertPlayerHistory(matchId, parseInt(key), gametype, currentScore, matchScore, 
                currentScore - previousData.ranking, matchScore - previousData.match_ranking);

               // scores[key] = currentScore;
            }

        }catch(err){
            console.trace(err);
        }   
    }


    getData(gametype, page, perPage){

        return new Promise((resolve, reject) =>{

            const query = `SELECT player_id,gametype,matches,playtime,ranking,ranking_change 
            FROM nstats_ranking_player_current WHERE gametype=? ORDER BY ranking DESC LIMIT ?, ?`;

            page--;

            const start = page * perPage;

            mysql.query(query, [gametype, start, perPage], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    debugGetAllNames(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name FROM nstats_ranking_values WHERE id>222";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    let string = "";

                    for(let i = 0; i < result.length; i++){

                        string += `${result[i].name},`;
                    }

                    //console.log(string);

                    resolve(result);
                }

                resolve([]);
            });

        });
    }

    async getMultipleGametypesData(ids, perPage){

        try{


            if(ids.length === 0) return [];

            const data = [];

            let current = 0;

            for(let i = 0; i < ids.length; i++){

                current = await this.getData(ids[i], 1, perPage);

                data.push({
                    "id": ids[i],
                    "data": current
                });
            }

            return data;

        }catch(err){
            console.trace(err);
        }  
    }


    getTotalPlayers(gametype){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_players FROM nstats_ranking_player_current WHERE gametype=?";

            mysql.query(query, [gametype], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){
                        resolve(result[0].total_players);
                    }
                }
                resolve(0);
            });
        });
    }

    getSettings(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,display_name,description,value FROM nstats_ranking_values";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });
        });
    }

    getMatchRankingChanges(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT player_id,ranking,match_ranking,ranking_change,match_ranking_change FROM nstats_ranking_player_history WHERE match_id=?";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getCurrentPlayersRanking(players, gametype){

        return new Promise((resolve, reject) =>{


            if(players.length === 0) resolve([]);
            
            const query = "SELECT player_id,ranking,ranking_change FROM nstats_ranking_player_current WHERE player_id IN(?) AND gametype=?";

            mysql.query(query, [players, gametype], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    getPlayerRankings(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT gametype,matches,playtime,ranking,ranking_change FROM nstats_ranking_player_current WHERE player_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    async getGametypePosition(ranking, gametype){

        const query = "SELECT COUNT(*) as player_position FROM nstats_ranking_player_current WHERE gametype=? AND ranking>=? ORDER BY ranking DESC";

        const result = await mysql.simpleQuery(query, [gametype, ranking]);

        if(result.length > 0){
            return result[0].player_position;
        }

        return -1;
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

    async getPlayerMatchHistory(playerId, matchId){
        return await mysql.simpleFetch("SELECT * FROM nstats_ranking_player_history WHERE player_id=? AND match_id=?",
        [playerId, matchId]);
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

            const values = await this.getRankingSettings();

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

            let v = 0;

            for(let i = 0; i < values.length; i++){

                v = values[i];

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

    async getSettingsObject(){

        try{

            const values = await this.getSettings();

            const obj = {};

            let v = 0;

            for(let i = 0; i < values.length; i++){

                v = values[i];

                obj[v.name] = v.value;
            }

            return obj;

        }catch(err){
            console.trace(err);
            return [];
        }
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

            const values = await this.getSettingsObject();
 

            const types = [
                'frags',
                'deaths',
                'suicides',
                'team_kills',
                'flag_taken',
                'flag_pickup',
                'flag_return',
                'flag_capture',
                'flag_cover',
                'flag_seal',
                'flag_assist',
                'flag_kill',
                'dom_caps',
                'assault_objectives',
                'multi_1',
                'multi_2',
                'multi_3',
                'multi_4',
                'multi_5',
                'multi_6',
                'multi_7',
                'spree_1',
                'spree_2',
                'spree_3',
                'spree_4',
                'spree_5',
                'spree_6',
                'spree_7',
                'flag_dropped',
                'flag_cover_pass',
                'flag_cover_fail',
                'flag_self_cover',
                'flag_self_cover_pass',
                'flag_self_cover_fail',
                'flag_multi_cover',
                'flag_spree_cover',
                'flag_save'
            ];

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


            let m = 0;

            let previousMatchScore = 0;
            let currentMatchScore = 0;
            let matchPlaytime = 0;
            let matchChange = 0;

            let currentTotalScore = 0;
            let previousTotalScore = 0;
            let totalPlaytime = 0;
            let totalChange = 0;

            for(let i = 0; i < matches.length; i++){

                m = matches[i];
               // console.log(m.gametype);
               currentMatchScore = 0;


                for(let x = 0; x < types.length; x++){

                    currentMatchScore += m[types[x]] * values[types[x]];
                }

                updateGametypeTotals(0, m.playtime, currentMatchScore);
                updateGametypeTotals(m.gametype, m.playtime, currentMatchScore);

                
                currentMatchScore = currentMatchScore / (m.playtime / 60);


                matchPlaytime = m.playtime / 60;


                if(matchPlaytime === Infinity){
                    currentMatchScore = 0;
                }else{

                    if(matchPlaytime < halfHour){
                        currentMatchScore *= values["sub_half_hour_multiplier"];
                    }else if(matchPlaytime < hour){
                        currentMatchScore *= values["sub_hour_multiplier"];
                    }else if(matchPlaytime < hour2){
                        currentMatchScore *= values["sub_2hour_multiplier"];
                    }else if(matchPlaytime < hour3){
                        currentMatchScore *= values["sub_3hour_multiplier"];
                    }
                }


                matchChange = currentMatchScore - previousMatchScore;

                totalPlaytime = gametypeTotals[m.gametype].playtime / 60;

                currentTotalScore = gametypeTotals[m.gametype].totalScore / totalPlaytime;

                if(currentTotalScore === Infinity){

                    currentTotalScore = 0;

                }else{

                    
                    if(totalPlaytime < halfHour){
                        currentTotalScore *= values["sub_half_hour_multiplier"];
                    }else if(totalPlaytime < hour){
                        currentTotalScore *= values["sub_hour_multiplier"];
                    }else if(totalPlaytime < hour2){
                        currentTotalScore *= values["sub_2hour_multiplier"];
                    }else if(totalPlaytime < hour3){
                        currentTotalScore *= values["sub_3hour_multiplier"];
                    }

                }


                totalChange = currentTotalScore - previousTotalScore;

                gametypeTotals[m.gametype].lastChange = totalChange;
                gametypeTotals[m.gametype].ranking = currentTotalScore;
                gametypeTotals[0].lastChange = totalChange;
                gametypeTotals[0].ranking = currentTotalScore;

                if(currentTotalScore !== currentTotalScore) currentTotalScore = 0;
                if(currentMatchScore !== currentMatchScore) currentMatchScore = 0;
                if(totalChange !== totalChange) totalChange = 0;
                if(matchChange !== matchChange) matchChange = 0;



                await this.insertPlayerHistory(m.match_id, playerId, m.gametype, currentTotalScore, currentMatchScore, totalChange, matchChange);

                previousMatchScore = currentMatchScore;
                previousTotalScore = currentTotalScore;
                
            }

            //console.table(gametypeTotals);

            //update current ranking

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


    createMatchScore(timePenalties, types, matchData, playtime){

        let score = 0;

        const ignore = [
            "sub_half_hour_multiplier",
            "sub_hour_multiplier",
            "sub_2hour_multiplier",
            "sub_3hour_multiplier"
        ];


        for(let i = 0; i < types.length; i++){

            if(ignore.indexOf(types[i].name) === -1){

               // console.log(`${types[i].name} = ${types[i].value}`);
                score += matchData[types[i].name] * types[i].value;

            }
        }

        playtime = playtime + matchData.playtime;

        const halfHour = 60 * 30;
        const hour = 60 * 60;
        const hour2 = hour * 2;
        const hour3 = hour * 3;

        score = score / (playtime / 60);

        //console.log(`score before penalties ${score}`);

        if(playtime < halfHour){

            score *= timePenalties.sub_half_hour_multiplier;

        }else if(playtime < hour){

            score *= timePenalties.sub_hour_multiplier;

        }else if(playtime < hour2){

            score *= timePenalties.sub_2hour_multiplier;

        }else if(playtime < hour3){
            score *= timePenalties.sub_3hour_multiplier;
        }

        //console.log(`score after penalties ${score}`);

        return score;
    }

    createDummyPlayerData(){

        return {
            "matches": 0,
            "playtime": 0,
            "ranking": 0,
            "ranking_change": 0,
            "match_ranking": 0,
            "match_ranking_change": 0,
            "match_id": 0
        };
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

            const values = await this.getSettings();

            const query = `SELECT * FROM nstats_player_matches WHERE gametype=? AND played=1 AND playtime>0 ORDER BY match_id ASC`;

            const data = await mysql.simpleFetch(query, [id]);

            const timePenalties = {
                "sub_half_hour_multiplier": this.getEventValue(values, "sub_half_hour_multiplier") ?? 0,
                "sub_hour_multiplier": this.getEventValue(values, "sub_hour_multiplier") ?? 0,
                "sub_2hour_multiplier": this.getEventValue(values, "sub_2hour_multiplier") ?? 0,
                "sub_3hour_multiplier": this.getEventValue(values, "sub_3hour_multiplier") ?? 0
            };


            const players = {};

            let d = 0;

            let current = 0;
            let previous = 0;
            let currentIndex = 0;
            let currentScore = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                if(players[d.player_id] === undefined){
                    players[d.player_id] = [this.createDummyPlayerData()];
                }else{
                    players[d.player_id].push(this.createDummyPlayerData());
                }

                currentIndex = players[d.player_id].length - 1;
                current = players[d.player_id][players[d.player_id].length - 1];
                current.match_id = d.match_id;

                if(currentIndex > 0){
                    previous = players[d.player_id][players[d.player_id].length - 2]
                }else{
                    previous = current;
                }

                current.matches = previous.matches + 1;
                current.playtime += previous.playtime + d.playtime;

                currentScore = this.createMatchScore(timePenalties, values, d, current.playtime);

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

                let d = 0;

                for(let i = 0; i < data.length; i++){

                    d = data[i];

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

    async getCurrentPlayerRanking(playerId, gametype){

        const query = `SELECT matches, playtime, ranking, ranking_change FROM 
        nstats_ranking_player_current WHERE player_id=? AND gametype=?`;
        
        return await mysql.simpleFetch(query, [playerId, gametype]);
    }
}


module.exports = Rankings;