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

}

module.exports = Pings;