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

    async updateFaceStats(players, date){

        try{

            new Message(`Starting face stats update`,'note');

            const usageData = {};

            let p = 0;

            for(let i = 0; i < players.length; i++){

                p = players[i];

                if(p.bDuplicate === undefined){

                    if(usageData[p.face] === undefined){
                        usageData[p.face] = 1;
                    }else{
                        usageData[p.face]++;
                    }
                }
              
            }

            const usedFaces = [];

            for(const c in usageData){
                await this.update(c, usageData[c], date);
                usedFaces.push(c);
            }

            await this.setUsedFaces(usedFaces);

            new Message(`Updated face stats in database.`,'pass');

        }catch(err){
            new Message(`Failed to updateFaceStats ${err}`,'warning');
        }
    }

    async setUsedFaces(faces){

        try{

            const results = [];

            let currentId = 0;

            for(let i = 0; i < faces.length; i++){

                currentId = await this.getFaceId(faces[i]);

                results[faces[i]] = currentId;
            }

            this.usedFaces = results;

        }catch(err){
            console.trace(err);
        }
    }

    setPlayerFaceIds(players){

        let p = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            p.faceId = this.usedFaces[p.face];
        }
    }
    
    updatePlayerFace(player, face){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET face=? WHERE id=?`

            mysql.query(query, [face, player], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}

module.exports = Faces;