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

}

module.exports = Pings;