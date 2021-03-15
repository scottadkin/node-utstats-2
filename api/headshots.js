const mysql = require('./database');
const Promise = require('promise');

class Headshots{

    constructor(){

    }

    insert(match, timestamp, killer, victim){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_headshots VALUES(NULL,?,?,?,?)";

            mysql.query(query, [match, timestamp, killer, victim], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}


module.exports = Headshots;