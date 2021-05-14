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

                resolve();
            });
        });
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
            matches=matches+1, playtime=playtime+?,ranking_change=?-ranking,ranking=?
            WHERE gametype=? AND player_id=?`;

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

            if(matchChange !== matchChange) matchChange = 0;

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

    async update(matchId, players, gametype){

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
                
                matchScore = currentScore;
                    
                if(currentPlaytime < halfHour){

                    currentScore *= s.sub_half_hour_multiplier;

                }else if(currentPlaytime < hour){

                    currentScore *= s.sub_hour_multiplier;

                }else if(currentPlaytime < hour2){

                    currentScore *= s.sub_2hour_multiplier;

                }else if(currentPlaytime < hour3){
                    
                    currentScore *= s.sub_3hour_multiplier;
                }

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
                previousData.ranking - currentScore, previousData.match_ranking - matchScore);

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

                    console.log(string);

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

    getGametypePosition(ranking, gametype){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as player_position FROM nstats_ranking_player_current WHERE gametype=? AND ranking >= ?  ORDER BY ranking DESC";

            mysql.query(query, [gametype, ranking], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 0){
                        

                        resolve(result[0].player_position);
                    }
                }

                resolve(-1);
            });
        });
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
}


module.exports = Rankings;