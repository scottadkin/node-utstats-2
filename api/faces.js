const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

class Faces{

    constructor(){

    }

    create(name){

        return new Promise((resolve, reject) =>{

            name = name.toLowerCase();

            const query = "INSERT INTO nstats_faces VALUES(NULL,?,0,0,0)";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                resolve(result.insertId);
            }); 
        });
    }


    getIdByName(name){

        return new Promise((resolve, reject) =>{

            name = name.toLowerCase();

            const query = `SELECT id FROM nstats_faces WHERE name=? LIMIT 1`;

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result[0] !== undefined){
                    resolve(result[0].id);
                }else{
                    resolve(null);
                }
            });
        });
    }


    async getFaceId(name, bCreate){

        try{

            const currentId = await this.getIdByName(name);

            if(currentId === null){

                if(bCreate !== undefined){

                    new Message(`A face with the name ${name} does not exist, creating one now.`,'note');

                    const newId = await this.create(name);

                    new Message(`The face ${name} was inserted with the id of ${newId}`,'pass');

                    return newId;

                }else{
                    new Message(`A face with that name does not exist, set bCreate to true to create one.`, 'warning');
                }

            }else{

                return currentId;
            }

            return null;

        }catch(err){
            new Message(`Failed to get FaceId ${err}`,'warning');
        }
    }

    updateQuery(id, uses, date){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_faces SET uses=uses+?,
            first = IF(first = 0 OR ? < first, ?, first),
            last = IF(last = 0 OR ? > last, ?, last)
            WHERE id=?`;

            mysql.query(query, [uses, date, date, date, date, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async update(name, uses, date){

        try{

            name = name.toLowerCase();

            const id = await this.getFaceId(name, true);

            await this.updateQuery(id, uses, date);

        }catch(err){
            new Message(`Failed to update face ${name} with ${uses} uses with date ${date}. ${err}`,'warning');
        }

    }
}

module.exports = Faces;