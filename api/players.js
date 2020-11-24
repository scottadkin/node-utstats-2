const Promise = require('promise');
const Player = require('./player');
const mysql = require('./database');

class Players{

    constructor(){

    }

    debugGetAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_player_totals WHERE gametype=0";

            const players = [];

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                resolve(result);
            });
        });
    }
}


module.exports = Players;