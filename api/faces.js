import { simpleQuery, insertReturnInsertId } from "./database.js";
import { DEFAULT_DATE } from "./generic.mjs";
import Message from "./message.js";
import fs from "fs";

export default class Faces{

    constructor(){

    }

    async create(name){

        name = name.toLowerCase();

        const query = "INSERT INTO nstats_faces VALUES(NULL,?,?,?,0)";

        return await insertReturnInsertId(query, [name, DEFAULT_DATE, DEFAULT_DATE]);

    }


    async getIdByName(name){

        name = name.toLowerCase();

        const query = `SELECT id FROM nstats_faces WHERE name=? LIMIT 1`;

        const result = await simpleQuery(query, [name]);

        if(result.length > 0) return result[0].id;

        return null;
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
            throw new Error(err);
            new Message(`Failed to get FaceId ${err}`,'warning');
        }
    }

    async updateQuery(id, uses, date){

        const query = `UPDATE nstats_faces SET uses=uses+?,
            first = IF(? < first, ?, first),
            last = IF(? > last, ?, last)
            WHERE id=?`;

        const vars = [uses, date, date, date, date, id];

        return await simpleQuery(query, vars);
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
    
    async updatePlayerFace(player, face){

        face = parseInt(face);
        if(face !== face) face = 0;

        const query = `UPDATE nstats_player_totals SET face=? WHERE id=?`;

        return await simpleQuery(query, [face, player]);
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


    async getFacesName(faces){

        const query = "SELECT id,name FROM nstats_faces WHERE id IN(?)";

        return await simpleQuery(query, [faces]);

    }


    async getAll(){

        const query = "SELECT name,first,last,uses FROM nstats_faces ORDER BY uses DESC";

        return await simpleQuery(query);
    }


    getAllFiles(){
        return fs.readdirSync("./public/images/faces");
    }

    async reduceUsage(id, amount){

        const query = "UPDATE nstats_faces SET uses=uses-? WHERE id=?";

        return await simpleQuery(query, [amount, id]);
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

        await simpleQuery("UPDATE nstats_faces SET uses=uses-? WHERE id=?", [uses, id]);
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



export async function getFacesById(ids, bReturnArray){

    if(ids.length === 0) return {};
    if(bReturnArray === undefined) bReturnArray = false;

    const query = `SELECT id,name FROM nstats_faces WHERE id IN(?)`;

    const result = await simpleQuery(query, [ids]);

    if(bReturnArray) return result;

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        data[r.id] = r.name;
    }

    return data;

}

//smartCTF strips some data from the texture name, so we have to strip the face file names in the same way
//then compare file names for matches instead of having duplicate images with slightly different names.
export function smartCTFFaceComparison(string, faceFiles){

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

export async function getFacesWithFileStatuses(faceIds){

    try{

        //const faces = await this.getFacesName(faceIds);
        const faces = await getFacesById(faceIds);

        //console.log(faces);

        const newFaces = {};

        const files = fs.readdirSync('public/images/faces/');


        for(const [id, name] of Object.entries(faces)){

            const smartCTFFaceName = smartCTFFaceComparison(name, files);

            if(smartCTFFaceName === null){

                newFaces[id] = {
                    "name": (files.indexOf(`${name}.png`) !== -1) ? name : "faceless"
                };

            }else{
                newFaces[id] = {"name": smartCTFFaceName};
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

export async function getMostUsed(limit){

    const query = "SELECT * FROM nstats_faces ORDER BY uses DESC LIMIT ?";

    return await simpleQuery(query, [limit]);
}