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
}


module.exports = Connections;