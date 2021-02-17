const mysql = require('./database');
const Promise = require('promise');

class Kills{

    constructor(){

    }


    insert(matchId, timestamp, killer, killerTeam, victim, victimTeam, killerWeapon, victimWeapon, distance){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_kills VALUES(NULL,?,?,?,?,?,?,?,?,?)";

            const vars = [matchId, timestamp, killer, killerTeam, victim, victimTeam, killerWeapon, victimWeapon, distance];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

}

module.exports = Kills;