const Promise = require('promise');
const mysql = require('./database');
const Message = require('./message');

class Gametypes{

    constructor(){


    }

    create(name){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_gametypes VALUES(NULL,?,0,0,0,0)";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                resolve(result.insertId);
            });
        });
    }

    getIdByName(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id FROM nstats_gametypes WHERE name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result[0] !== undefined){
                    resolve(result[0].id);
                }

                resolve(null);

            });
        });
    }

    updateQuery(id, date, playtime){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_gametypes SET 
            first = IF(first > ? OR first = 0, ?, first),
            last = IF(last > ?, last, ?),
            playtime=playtime+?,
            matches=matches+1
            WHERE id=?`;

            const vars = [date,date,date,date,playtime,id];

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result.changedRows > 0){
                    resolve(true);
                }

                resolve(false);

            });
        });
    }


    async updateStats(name, date, playtime){

        try{

            const id = await this.getGametypeId(name, true);

            const bPassed = await this.updateQuery(id, date, playtime);

            if(bPassed){
                new Message(`Inserted gametype info into database.`,'pass');
            }else{
                new Message(`Failed to update gametype database.`,'warning');
            }


        }catch(err){
            new Message(err, 'error');
        }
    }



    async getGametypeId(name, bCreate){

        try{

            new Message(`Gametype is ${name}`,'note');

            let currentId = await this.getIdByName(name);
            
            if(currentId === null){

                if(bCreate !== undefined){

                    new Message(`A gametype with that name does not have an id yet, creating one now.`,'note');

                    const newId = await this.create(name);

                    new Message(`Gametype ${name} has been inserted to database with the id of ${newId}`,'note');

                    return newId;

                }else{
                    new Message(`A gametype with that name does not have an id yet, bCreate is undefined a new one will not be created.`,'note');
                }
                
                return null;

            }else{
                return currentId;
            }

        }catch(err){
            new Message(err,'warning');
        }
    }

    getName(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name FROM nstats_gametypes WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result[0].name);
                }

                resolve('Not Found');
            });
        });
    }

    getNames(ids){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nstats_gametypes WHERE id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                const data = [];

                if(result !== undefined){
                    
                    for(let i = 0; i < result.length; i++){
                        data[result[i].id] = result[i].name;
                    }
                }

                resolve(data);
            });
        });
    }
}

module.exports = Gametypes;