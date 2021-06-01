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

    async deletePlayerViaMatchData(matches){

        try{

            const uses = {};

            let m = 0;

            for(let i = 0; i < matches.length; i++){

                m = matches[i];

                if(uses[m.country] === undefined){
                    uses[m.country] = 0;
                }

                uses[m.country]++;
            }

            for(const [key, value] of Object.entries(uses)){
                await this.reduceUses(key, value);
            }

        }catch(err){
            console.trace(err);
        }
    }

    countCountriesUses(playerMatchData){

        const uses = {};

        let p = 0;

        for(let i = 0; i < playerMatchData.length; i++){

            p = playerMatchData[i];

            if(uses[p.country] === undefined){
                uses[p.country] = 0;
            }
            
            uses[p.country]++;
        }
        

        return uses;
    }
}

module.exports = CountriesManager;