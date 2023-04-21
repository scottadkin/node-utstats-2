const mysql = require('./database');
const Promise = require('promise');

class Connections{

    constructor(){

    }

    insert(matchId, timestamp, type, player){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_match_connections VALUES(NULL,?,?,?,?)";

            mysql.query(query, [matchId, timestamp, player, type], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async bulkInsert(vars){

        const query = "INSERT INTO nstats_match_connections (match_id, timestamp, player, event) VALUES ?";

        return await mysql.bulkInsert(query, vars);
    }

    getMatchData(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT timestamp,player,event FROM nstats_match_connections WHERE match_id=?";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                
                resolve([]);
            });

        });
    }

    deleteMatchData(matchId){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_match_connections WHERE match_id=?";

            mysql.query(query, [matchId], (err) =>{

                if(err) reject(err);

                resolve();
            }); 
        });
    }

    deletePlayerFromMatch(playerId, matchId){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_match_connections WHERE player=? AND match_id=?";

            mysql.query(query, [playerId, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async changePlayerIds(oldId, newId){

        await mysql.simpleQuery("UPDATE nstats_match_connections SET player=? WHERE player=?", [newId, oldId]);
    }

    async deletePlayer(playerId){

        await mysql.simpleDelete("DELETE FROM nstats_match_connections WHERE player=?", [playerId]);
    }

    async deleteMatches(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_match_connections WHERE match_id IN (?)", [ids]);
    }

    async getPlayerMatchData(matchId, playerId){

        const query = "SELECT timestamp,event FROM nstats_match_connections WHERE match_id=? AND player=?";

        return await mysql.simpleFetch(query, [matchId, playerId]);
    }
}


module.exports = Connections;