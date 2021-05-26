const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');


class Pings{

    constructor(){

    }

    insert(match, timestamp, player, ping){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_match_pings VALUES(NULL,?,?,?,?)";

            mysql.query(query, [match, timestamp, player, ping], (err) =>{
            
                if(err) reject(err);

                resolve();
            });
        });
    }


    getMatchData(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT timestamp,player,ping FROM nstats_match_pings WHERE match_id=? ORDER BY timestamp ASC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                
                resolve([]);
            });
        });
    }

    getPlayerHistoryAfter(player, limit){

        return new Promise((resolve, reject) =>{
            const query = "SELECT ping_min,ping_average,ping_max FROM nstats_player_matches WHERE player_id=? ORDER by match_date DESC LIMIT ?";

            mysql.query(query, [player, limit], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push({
                            "min": result[i].ping_min,
                            "average": result[i].ping_average,
                            "max": result[i].ping_max
                        });

                    }

                    resolve(data);
                }

                resolve([]);
            });
        });     
    }

    async deletePlayerMatchData(playerId, matchId){

         return await mysql.simpleDelete("DELETE FROM nstats_match_pings WHERE player=? AND match_id=?", [playerId, matchId]);
     
    }

    async changePlayerIds(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_match_pings SET player=? WHERE player=?", [newId, oldId]);

    }

    async deletePlayer(playerId){
        await mysql.simpleDelete("DELETE FROM nstats_match_pings WHERE player=?", [playerId]);
    }
}

module.exports = Pings;