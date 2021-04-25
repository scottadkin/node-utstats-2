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

    insertPlayerHistory(player, gametype, ranking){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_ranking_player_history VALUES(NULL,?,?,?)";

            mysql.query(query, [player, gametype, ranking], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async update(players, gametype){

    
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

                if(currentScore === Infinity) currentScore = 0;

                if(await this.updatePlayerCurrent(parseInt(key), gametype, currentPlaytime, currentScore) === 0){
                    await this.insertPlayerCurrent(parseInt(key), gametype, currentPlaytime, currentScore);
                }

                await this.insertPlayerHistory(parseInt(key), gametype, currentScore);

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
}


module.exports = Rankings;