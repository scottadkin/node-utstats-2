const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const fs = require('fs');

class Assault{

    constructor(){

    }

    async exists(map, name, objId){

        const query = "SELECT COUNT(*) as total_objs FROM nstats_assault_objects WHERE map=? AND name=? and obj_id=?";
        const result = await mysql.simpleQuery(query, [map, name, objId]);

        if(result[0].total_objs > 0) return true;
        return false;
    }

    async createMapObjective(map, name, objId){

        const query = "INSERT INTO nstats_assault_objects VALUES(NULL,?,0,?,?,0,0)";
        return await mysql.simpleQuery(query, [map, name, objId]);
    }


    async updateMapObjective(map, name, objId){

        try{

            if(await this.exists(map, name, objId)){

                new Message(`Assault Objective "${name}" with map id of ${objId} for map ${map} exists.`,'pass');

            }else{

                new Message(`An assault objective on map ${map} with the name of ${name} objId ${objId} does not exist, creating.`,'note');
                await this.createMapObjective(map, name, objId);
                new Message(`Obective "${name}" for map ${map} has been added to the database.`,'pass');
            }

        }catch(err){
            new Message(`Failed to addMapObjective ${err}`,'error');
        }
    }

    insertObjectiveCapture(matchId, mapId, timestamp, objId, player, bFinal){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_assault_match_objectives VALUES(NULL,?,?,?,?,?,?)";

            mysql.query(query, [matchId, mapId, timestamp, objId, player, bFinal], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateMapCaptureTotals(map, objId, taken){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_assault_objects SET matches=matches+1, taken=taken+? WHERE map=? AND obj_id=?";

            mysql.query(query, [taken, map, objId], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });

    }

    updatePlayerCaptureTotals(taken, masterId, gametypeId){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_player_totals SET assault_objectives=assault_objectives+? WHERE id IN(?,?)";

            mysql.query(query, [taken, masterId, gametypeId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    async setAttackingTeam(matchId, team){
        
        const query = "UPDATE nstats_matches SET attacking_team=? WHERE id=?";
        return await mysql.simpleQuery(query, [team, matchId]);
    }

    async setMatchAssaultCaps(matchId, caps){

        const query = "UPDATE nstats_matches SET assault_caps=? WHERE id=?";
        return await mysql.simpleQuery(query, [caps, matchId]);
    }

    async updatePlayerMatchCaps(rowId, caps){

        const query = "UPDATE nstats_player_matches SET assault_objectives=? WHERE id=?";
        return await mysql.simpleQuery(query, [caps, rowId]);
    }

    async getMatchCaps(matchId){

        const query = "SELECT * FROM nstats_assault_match_objectives WHERE match_id=?";
        return await mysql.simpleQuery(query, [matchId]);

    }

    async getMapObjectives(mapId){

        const query = "SELECT map,obj_order,name,obj_id,matches,taken FROM nstats_assault_objects WHERE map=?";
        return await mysql.simpleQuery(query, [mapId]);
    }


    async getMatchData(matchId, mapId){

        try{

            const mapObjectives = await this.getMapObjectives(mapId);
            const caps = await this.getMatchCaps(matchId);


            return {"objectives": mapObjectives, "caps": caps};

        }catch(err){
            console.trace(err);
        }
    }




    async getMapImages(mapName){

        try{

            mapName = mapName.toLowerCase();

            mapName = mapName.replace(/\W\S\D/ig,'');
            console.log(`mapName = ${mapName}`);
            const dir = fs.readdirSync(`public/images/assault/`);

            console.log(dir);

            if(dir.indexOf(mapName) !== undefined){

                const files = fs.readdirSync(`public/images/assault/${mapName}`);

                console.log(files);

                for(let i = 0; i < files.length; i++){
                    files[i] = `/images/assault/${mapName}/${files[i]}`;
                }

                console.table(files);

                return files;

            }else{
                return [];
            }

        }catch(err){

            if(err.code !== "ENOENT"){
                console.trace(err);
            }else{
                console.log("Assault object folder does not exist");
            }
            return [];
        }   
    }

    deleteMatchObjectives(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_assault_match_objectives WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });

    }


    removeMatchCap(match, obj){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_assault_objects SET matches=matches-1,taken=taken-1 AND id=?";

            mysql.query(query, [obj], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async deleteMatch(id){

        try{

            const matchCaps = await this.getMatchCaps(id);

            if(matchCaps.length === 0) return;
            
            console.log("Deleteing Assault Match Objectives");

            await this.deleteMatchObjectives(id);

            for(let i = 0; i < matchCaps; i++){

                await this.removeMatchCap(id, matchCaps[i].id);
            }

        }catch(err){

            console.trace(err);
        }   
    }


    deletePlayerMatchCaps(playerId, matchId){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_assault_match_objectives SET player=-1 WHERE player=? AND match_id=?";

            mysql.query(query, [playerId, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getPlayerCaps(playerId, matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_assault_match_objectives WHERE match_id=? AND player=?";

            mysql.query(query, [matchId, playerId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    async deletePlayerFromMatch(playerId, matchId){

        try{

            const capturedObjectives = await this.getPlayerCaps(playerId, matchId);

            console.table(capturedObjectives);

            if(capturedObjectives.length > 0){

                let c = 0;

                for(let i = 0; i < capturedObjectives.length; i++){

                    c = capturedObjectives[i];

                    await this.removeMatchCap(matchId, c.obj_id);
                }

                await this.deletePlayerMatchCaps(playerId, matchId);
            }


        }catch(err){
            console.trace(err);
        }
    }

    

    async changeCapDataPlayerId(oldId, newId){

        const query = "UPDATE nstats_assault_match_objectives SET player=? WHERE player=?"
        return await mysql.simpleUpdate(query, [newId, oldId]);
    }


    /**
     * 
     * @param {*} playerId player to delete
     * @param {*} bReallyDelete if set delete data from database instead of settings playerId to -1
     */
    async deletePlayer(playerId, bReallyDelete){

        if(bReallyDelete !== undefined){
            await mysql.simpleDelete("DELETE FROM nstats_assault_match_objectives WHERE player=?", [playerId]);
        }else{
            await mysql.simpleUpdate("UPDATE nstats_assault_match_objectives SET player=-1 WHERE player=?", [playerId]);
        }
    }


    async getMatchesObjectiveCaps(ids){

        if(ids.length === 0) return [];

        return await mysql.simpleFetch("SELECT * FROM nstats_assault_match_objectives WHERE match_id IN (?)", [ids]);
    }

    setMapObjCaps(objCaps){

        const caps = {};

        let o = 0;
        
        for(let i = 0; i < objCaps.length; i++){

            o = objCaps[i];



            if(caps[o.map] === undefined){
                caps[o.map] = {};
            }

            if(caps[o.map][o.obj_id] === undefined){
                caps[o.map][o.obj_id] = 0;
            }

            caps[o.map][o.obj_id]++;
        }

        return caps;
    }

    async reduceMapObjectiveCaps(map, objId, uses, matches){

        const query = "UPDATE nstats_assault_objects SET matches=matches-?,taken=taken-? WHERE map=? AND obj_id=?";
        const vars = [matches, uses, map, objId];
        await mysql.simpleUpdate(query, vars);
    }

    async deleteMatchesCaps(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_assault_match_objectives WHERE match_id IN (?)", [ids]);
    }

    async deleteMatches(ids){

        try{

            if(ids.length === 0) return;

            const query = "DELETE FROM nstats_assault_match_objectives WHERE match_id IN(?)";

            //await mysql.simpleDelete(query, [ids]);
            const objCaps = await this.getMatchesObjectiveCaps(ids);

            const mapCaps = this.setMapObjCaps(objCaps);


            for(const [mapId, ObjIds] of Object.entries(mapCaps)){

                for(const [objId, caps] of Object.entries(ObjIds)){

                    await this.reduceMapObjectiveCaps(mapId, objId, caps, caps);
                }

            }

            await this.deleteMatchesCaps(ids);

        }catch(err){
            console.trace(err);
        }
    }


    async getPlayerMatchCaps(matchId, playerId){

        const query = "SELECT timestamp,obj_id,bFinal FROM nstats_assault_match_objectives WHERE match_id=? AND player=?";

        return await mysql.simpleFetch(query, [matchId, playerId]);
    }

    async changeMatchObjectivesMapId(oldId, newId){

        const query = `UPDATE nstats_assault_match_objectives SET map=? WHERE map=?`;

        return await mysql.simpleQuery(query, [newId, oldId]);
    }

    async changeObjectivesMapId(oldId, newId){

        const query = `UPDATE nstats_assault_objects SET map=? WHERE map=?`;

        return await mysql.simpleQuery(query, [newId, oldId]);
    }


    async updateMapObjectiveRow(rowId, objOrder, matches, taken){


        const query = `UPDATE nstats_assault_objects SET obj_order=?, matches=?, taken=? WHERE id=?`;

        const vars = [
            objOrder, 
            matches, 
            taken,
            rowId
        ];

        await mysql.simpleQuery(query, vars);
    }

    async deleteMapObjectivesByRowId(rowIds){

        if(rowIds.length === 0) return;

        const query = `DELETE FROM nstats_assault_objects WHERE id IN (?)`;

        return await mysql.simpleQuery(query, [rowIds]);
    }

    async mergeDuplicateObjectives(mapId){


        const query = `SELECT * FROM nstats_assault_objects WHERE map=?`;
        const result = await mysql.simpleQuery(query, [mapId]);

        
        const objs = {};

        const rowsToDelete = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(objs[r.obj_id] === undefined){

                objs[r.obj_id] = {
                    "id": r.id,//row id
                    "obj_order": r.obj_order,
                    "name": r.name,
                    "matches": 0,
                    "taken": 0
                };

            }else{
                rowsToDelete.push(r.id);
            }

            objs[r.obj_id].matches += r.matches;
            objs[r.obj_id].taken += r.taken;
            objs[r.obj_id].obj_order = r.obj_order;
        }

        for(const value of Object.values(objs)){

            const rowId = parseInt(value.id);  

            await this.updateMapObjectiveRow(rowId, value.obj_order, value.matches, value.taken);

        }

        await this.deleteMapObjectivesByRowId(rowsToDelete)
        
    }

    async changeMapId(oldId, newId){

        await this.changeMatchObjectivesMapId(oldId, newId);
        await this.changeObjectivesMapId(oldId, newId);
    }
}

module.exports = Assault;