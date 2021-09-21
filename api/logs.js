const mysql = require('./database');
const Promise = require('promise');

class Logs{

    constructor(){

    }

    static bExists(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_logs FROM nstats_logs WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);
                
                if(result[0].total_logs > 0){
                    resolve(true);
                }

                resolve(false);
                
            });
        });
    }

    static insert(name){

        const now = Math.floor(Date.now() * 0.001);

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_logs VALUES(NULL,?,?,0)";

            mysql.query(query, [name, now], (err, result) =>{

                if(err) reject(err);
                
                if(result !== undefined){
                    resolve(result.insertId);   
                }

                resolve(-1);
            });
        });
    }


    static setMatchId(logId, matchId){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_logs SET match_id=? WHERE id=?";

            mysql.query(query, [matchId, logId], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }


    static deleteFromDatabase(matchId){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_logs WHERE match_id=?";

            mysql.query(query, [matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    static async deleteMatches(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_logs WHERE match_id IN (?)", [ids]);
    }

}


module.exports = Logs;