const mysql = require('./database');
const Promise = require('promise');

class Weapons{

    constructor(){

    }

    exists(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_matches FRON nstats_weapons WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result[0].total_matches >= 1){
                    resolve(true);
                }

                resolve(false);

            });
        });
    }


    getIdsByNamesQuery(ids){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_weapons WHERE name IN (?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        }); 
    }


    async getIdsByName(ids){

        try{

            const current = await this.getIdsByNamesQuery(ids);

            if(current.length < ids.length){
                console.log(`some weapons are missing`);
            }

        }catch(err){
            console.trace(err);
        }
    }


}


module.exports = Weapons;