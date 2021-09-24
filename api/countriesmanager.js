const mysql = require('./database');
const countries = require('./countries');

class CountriesManager{

    constructor(){}


    async getMostPopular(){

        const query = `SELECT COUNT(*) as total_uses, country, MIN(first) as first_match, MAX(last) as last_match
        FROM nstats_player_totals WHERE gametype=0 
        GROUP BY(country) ORDER BY total_uses DESC LIMIT 5`;

        const result = await mysql.simpleFetch(query);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            const currentCountry = countries(r.country);
            r.countryName = currentCountry.country;
            r.country = currentCountry.code;
        }

        return result;
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