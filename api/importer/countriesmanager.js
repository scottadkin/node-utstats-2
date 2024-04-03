const mysql = require('../database.js');
const Message = require('../message');

class CountriesManager{

    constructor(){

    }

    async insertBulk(players, date){


        try{

            const uses = {};

            let p = 0;

            for(let i = 0; i < players.length; i++){

                p = players[i];

                if(p.bDuplicate === undefined){
                    if(uses[p.country] !== undefined){
                        uses[p.country]++;
                    }else{
                        uses[p.country] = 1;
                    }
                }
            }

            for(const [key, value] of Object.entries(uses)){
                
                if(key !== 'undefined'){
                    await this.update(key, value, date);
                }
            }

        }catch(err){
            new Message(`CountriesManager.insertBulk ${err}`,'error');
        }
    }

    exists(code){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_countries FROM nstats_countries WHERE code=?";

            mysql.query(query, [code], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    
                    if(result[0].total_countries > 0){
                        resolve(true);
                    }
                }
                resolve(false);
            });
        });
    }

    insert(code, uses, date){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_countries VALUES(NULL,?,?,?,?)";

            mysql.query(query, [code, date, date, uses], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateQuery(code, uses, date){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_countries SET
            total=total+?,
            first = IF(first > ?, ?, first),
            last = IF(last < ?, ?, last)
            WHERE code=?`;

            mysql.query(query, [uses, date, date, date, date, code], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async update(code, uses, date){

        try{

            if(code === undefined) return;

            if(await this.exists(code)){
                await this.updateQuery(code, uses, date);
            }else{
                await this.insert(code, uses, date);
            }


        }catch(err){
            new Message(`CountriesManager.update ${err}`, 'error');
        }
    }
}


module.exports = CountriesManager;