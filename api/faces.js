const mysql = require('./database.js');
const Message = require('./message');
const fs = require('fs');

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

        for(let i = 0; i < players.length; i++){

            const p = players[i];

            if(this.usedFaces[p.face] !== undefined){
                p.faceId = this.usedFaces[p.face];
            }else{
                p.faceId = 0;
            }     
        }
    }
    
    updatePlayerFace(player, face){

        return new Promise((resolve, reject) =>{

            face = parseInt(face);
            if(face !== face) face = 0;

            const query = `UPDATE nstats_player_totals SET face=? WHERE id=?`

            mysql.query(query, [face, player], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    static imageExists(name){

        const dir = 'public/images/faces/';
        const ext = '.png';

        name = name.toLowerCase();

        try{

            fs.accessSync(`${dir}${name}${ext}`, fs.constants.R_OK);

            return true;

        }catch(err){
           //console.log(err);
        }

        return false;
    }

    imageExistsTest(name){

        return new Promise((resolve, reject) =>{

            const dir = 'public/images/faces/';
            const ext = '.png';

            name = name.toLowerCase();

            fs.access(`${dir}${name}${ext}`, fs.constants.R_OK, (err) =>{

                if(err){

                    resolve(false);
                }

                resolve(true);

            }); 
        });
    }


    getFacesName(faces){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nstats_faces WHERE id IN(?)";

            mysql.query(query, [faces], (err, result) =>{

                if(err) resolve([]);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });

        });   
    }

    //smartCTF strips some data from the texture name, so we have to strip the face file names in the same way
    //then compare file names for matches instead of having duplicate images with slightly different names.
    smartCTFFaceComparison(string, faceFiles){

        const reg = /^(.+)\.(.+?)5(.+)\.png$/i;
        const stripExtReg = /^(.+)\.png$/i;

        for(let i = 0; i < faceFiles.length; i++){

            const f = faceFiles[i];

            const result = reg.exec(f);

            if(result !== null){

                const cleanedFileName = `${result[1]}.${result[3]}`;

                if(cleanedFileName === string){

                    const stripResult = stripExtReg.exec(f);

                    if(stripResult !== null){
                        return stripResult[1];
                    }
                }
            }
        }

        return null;
        
    }

    async getFacesWithFileStatuses(faceIds){

        try{

            const faces = await this.getFacesName(faceIds);

            //console.log(faces);

            const newFaces = {};

            const files = fs.readdirSync('public/images/faces/');

           // console.log(files);

            for(let i = 0; i < faces.length; i++){

                const smartCTFFaceName = this.smartCTFFaceComparison(faces[i].name, files);
 
                if(smartCTFFaceName === null){

                    newFaces[faces[i].id] = {
        
                        "name": (files.indexOf(`${faces[i].name}.png`) !== -1) ? faces[i].name : "faceless"
                    };

                }else{
                    newFaces[faces[i].id] = {"name": smartCTFFaceName};
                }
            }

            //add missing ones as faceless
            for(let i = 0; i < faceIds.length; i++){

                if(newFaces[faceIds[i]] === undefined){
                    newFaces[faceIds[i]] = {"name": "faceless"};
                }

            }

            return newFaces;

        }catch(err){
            console.log(err);
        }
    }


    getMostUsed(limit){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_faces ORDER BY uses DESC LIMIT ?";

            mysql.query(query, [limit], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,first,last,uses FROM nstats_faces ORDER BY uses DESC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getAllFiles(){
        return fs.readdirSync("./public/images/faces");
    }

    reduceUsage(id, amount){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_faces SET uses=uses-? WHERE id=?";

            mysql.query(query, [amount, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async reduceMatchUses(playersData){

        try{

            const uses = {};

            let p = 0;

            for(let i = 0; i < playersData.length; i++){

                p = playersData[i];

                if(uses[p.face] !== undefined){
                    uses[p.face]++;
                }else{
                    uses[p.face] = 1;
                }
            }

            for(const [key, value] of Object.entries(uses)){

                await this.reduceUsage(key, value);
            }

        }catch(err){
            console.trace(err);
        }   
    }


    async deletePlayer(matches){

        try{

            let m = 0

            const uses = {};

            for(let i = 0; i < matches.length; i++){

                m = matches[i];

                if(uses[m.face] === undefined){
                    uses[m.face] = 0;
                }

                uses[m.face]++;
            }

            for(const [key, value] of Object.entries(uses)){
                await this.reduceUsage(parseInt(key), value);
            }

        }catch(err){
            console.trace(err);
        }
    }


    async reduceUses(id, uses){

        await mysql.simpleUpdate("UPDATE nstats_faces SET uses=uses-? WHERE id=?", [uses, id]);
    }

    async deleteViaPlayerMatchesData(playersData){

        try{

            const uses = {};

            let p = 0;

            for(let i = 0; i < playersData.length; i++){

                p = playersData[i];

                if(uses[p.face] === undefined){
                    uses[p.face] = 0;
                }

                uses[p.face]++;
            }


            for(const [key, value] of Object.entries(uses)){

                await this.reduceUses(parseInt(key), value);
            }
            
        }catch(err){
            console.trace(err);
        }
    }


    getRandom(amount){

        const files = fs.readdirSync("./public/images/faces");

        if(amount >= files.length){

            return files;
            
        }else{

            let r = 0;

            const currentFiles = [];

            for(let i = 0; i < amount; i++){

                r = Math.floor(Math.random() * files.length);

                if(currentFiles.indexOf(files[r]) === -1){
                    currentFiles.push(files[r]);
                }
            }

            return currentFiles;
        }
    }
}

module.exports = Faces;