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
}


module.exports = Connections;