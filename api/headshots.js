const mysql = require('./database');
const Promise = require('promise');

class Headshots{

    constructor(){

    }

    insert(match, timestamp, killer, victim, distance, killerTeam, victimTeam){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_headshots VALUES(NULL,?,?,?,?,?,?,?)";

            mysql.query(query, [match, timestamp, killer, victim, distance, killerTeam, victimTeam], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    getMatchData(match){

        return new Promise((resolve, reject) =>{

            const query = "SELECT timestamp,killer,victim,distance,killer_team,victim_team FROM nstats_headshots WHERE match_id=?";

            mysql.query(query, [match], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }
}


module.exports = Headshots;