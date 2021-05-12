const mysql = require('./database');
const Promise = require('promise');

class CountriesManager{

    constructor(){

    }

    getMostPopular(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_countries ORDER BY total DESC LIMIT 5";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                
                resolve([]);
            });
        });
    }

    reduceUses(code, amount){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_countries SET total=total-? WHERE code=?";

            mysql.query(query, [amount, code], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}

module.exports = CountriesManager;