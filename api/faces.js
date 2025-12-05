import { simpleQuery, insertReturnInsertId, bulkInsert } from "./database.js";
import { DEFAULT_DATE, DEFAULT_MIN_DATE } from "./generic.mjs";
import Message from "./message.js";
import fs from "fs";

export default class Faces{

    constructor(){

    }


    async createMissing(missing){

        if(missing.length === 0) return {};
        const query = `INSERT INTO nstats_faces (name) VALUES ?`;

        const insertVars = [];

        for(let i = 0; i < missing.length; i++){

            const m = missing[i];
            insertVars.push([m]);
        }

        await bulkInsert(query, insertVars);

        return await this.getIds(missing);
    }

    async getIds(names){

        if(names.length === 0) return {};

        const query = `SELECT id,name FROM nstats_faces WHERE name IN (?)`;

        const result = await simpleQuery(query,[names]);

        const found = {};
        const missing = [...names];

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            found[r.name] = r.id;
            const index = missing.indexOf(r.name);

            if(index !== -1) missing.splice(index, 1);
        }

        const newFaces = await this.createMissing(missing);

        return {...found, ...newFaces};
    }

    async setPlayerFaces(players){

        new Message(`Setting player faces`,'note');

        const usageData = {};

        for(let i = 0; i < players.length; i++){

            const p = players[i];

            if(p.bSpectator) continue;

            if(usageData[p.face] === undefined){
                usageData[p.face] = 1;
            }else{
                usageData[p.face]++;
            }
        }

        this.usedFaces = await this.getIds(Object.keys(usageData));       

        this.setPlayerFaceIds(players);
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

        const query = `SELECT id,name 
        FROM nstats_faces WHERE id IN(?)`;

        return await simpleQuery(query, [faces]);

    }

    async getAll(){

        return await getAllFaces();
    }


    getAllFiles(){
        return fs.readdirSync("./public/images/faces");
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

    const query = `SELECT id,name 
    FROM nstats_faces WHERE id IN(?)`;

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

    const query = "SELECT * FROM nstats_faces_totals ORDER BY uses DESC LIMIT ?";

    return await simpleQuery(query, [limit]);
}


export async function getAllFaces(){

    const query = `SELECT nstats_faces.id,
    nstats_faces.name,
    nstats_faces_totals.first,
    nstats_faces_totals.last,
    nstats_faces_totals.uses FROM nstats_faces
    LEFT JOIN nstats_faces_totals ON nstats_faces_totals.face_id = nstats_faces.id 
    ORDER BY nstats_faces_totals.uses DESC`;
    return await simpleQuery(query);

}


export async function getAllFacesWithFileStatuses(){

    const faces = await getAllFaces();

    const faceIds = faces.map((f) =>{
        return f.id;
    });

    const fileStatus = await getFacesWithFileStatuses(faceIds);
   
    for(let i = 0; i < faces.length; i++){

        const f = faces[i];
        if(fileStatus[f.id] !== undefined){
            f.image = fileStatus[f.id].name;
        }else{
            f.image = "faceless";
        }
    }

    return faces;
}

async function getAllInMatch(id){

    const query = `SELECT DISTINCT face FROM nstats_player_matches WHERE match_id=?`;

    const result = await simpleQuery(query, [id]);

    return result.map((r) =>{
        return r.face;
    });
}

async function deleteFacesTotals(ids){

    if(ids.length === 0) return;

    const query = `DELETE FROM nstats_faces WHERE id IN(?)`;
    return await simpleQuery(query, [ids]);
}

async function getFacesTotalUsesFromMatchesTable(faceIds){

    const query = `SELECT face,COUNT(*) as total_uses,MIN(match_date) as first_match,MAX(match_date) as last_match 
    FROM nstats_player_matches WHERE face IN(?) GROUP BY face`;

    const result = await simpleQuery(query, [faceIds]);

    const data = {};


    for(let i = 0; i < result.length; i++){

        const r = result[i];

        data[r.face] = r;
    }

    return data;

}

async function getNames(ids){

    if(ids.length === 0) return {};

    const query = `SELECT id,name FROM nstats_faces WHERE id IN(?)`;

    const result = await simpleQuery(query, [ids]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        data[r.id] = r.name; 
    }
    

    return data;
}

export async function recalculateSelectedTotals(faceIds){

    if(faceIds.length === 0) return;

    const totals = await getFacesTotalUsesFromMatchesTable(faceIds);

    const query = `UPDATE nstats_faces_totals SET first=?,last=?,uses=? WHERE face_id=?`;

    const toDelete = [];

    for(let i = 0; i < faceIds.length; i++){

        const fId = faceIds[i];

        if(totals[fId] === undefined || totals[fId].total_uses === 0){
            toDelete.push(fId);
            continue;
        }

        const t = totals[fId];

        await simpleQuery(query, [t.first_match,t.last_match,t.uses,t.id]);
    }

    await deleteFacesTotals(toDelete);
}

async function calcTotalsFromMatchData(usedFaces){

    if(Object.keys(usedFaces).length === 0) return;

    const query = `SELECT face,COUNT(*) as total_uses,MIN(match_date) as first_match,MAX(match_date) as last_match FROM nstats_player_matches WHERE face IN (?) GROUP BY face`;

    const result = await simpleQuery(query, [Object.values(usedFaces)]);

    return result;
}

export async function updateTotals(usedFaces){

    if(Object.keys(usedFaces).length === 0) return;

    const totals = await calcTotalsFromMatchData(usedFaces);

    const insertVars = [];

    for(let i = 0; i < totals.length; i++){

        const t = totals[i];

        insertVars.push([t.face, t.first_match, t.last_match, t.total_uses]);
    }

    const query = `INSERT INTO nstats_faces_totals (face_id,first,last,uses) VALUES ?`;

    await bulkInsert(query, insertVars);
}