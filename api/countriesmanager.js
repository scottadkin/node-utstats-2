import mysql from './database';
import Promise from 'promise';

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
}

export default CountriesManager;