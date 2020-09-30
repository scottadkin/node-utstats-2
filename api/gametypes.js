const Promise = require('promise');
const mysql = require('./database');

class Gametypes{

    constructor(){

    }

    bExists(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_gametypes FROM nstats_gametypes WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result[0].total_gametypes > 0){
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });
    }

    async updateStats(name, gameClass, date, length){

        try{

        }catch(err){
            console.trace(err);
        }
    }
}

module.exports = Gametypes;