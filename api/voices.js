const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

class Voices{

    constructor(){

    }

    exists(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_voices FROM nstats_voices WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result[0].total_voices > 0){
                    resolve(true);
                }

                resolve(false);
            });
        });
    }

    create(name, date, uses){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_voices VALUES(NULL,?,?,?,?)";

            mysql.query(query, [name, date, date, uses], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    updateStats(name, date, uses){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_voices SET 
            uses=uses+?,
            first = IF(first < ?, first, ?),
            last = IF(last > ?, last, ?)
            
            WHERE name=?`;

            mysql.query(query, [uses, date, date, date, date, name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async updateStatsBulk(data, matchDate){
       
        try{

            for(const voice in data){

                if(await this.exists(voice)){

                    new Message(`Updating voice stats for "${voice}".`,'note');
                    await this.updateStats(voice, matchDate, data[voice]);

                }else{
                    new Message(`There is no data for the voice "${voice}", creating now.`,'note');
                    await this.create(voice, matchDate, data[voice]);
                }
            }    

        }catch(err){
            new Message(`updateStats ${err}`,'error');
        }
    }
}

module.exports = Voices;