const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const fs = require('fs');

class Assault{

    constructor(){

    }

    exists(map, name, objId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_objs FROM nstats_assault_objects WHERE map=? AND name=? and obj_id=?";

            mysql.query(query, [map, name, objId], (err, result) =>{

                if(err) reject(err);

                if(result[0].total_objs > 0){
                    resolve(true);
                }

                resolve(false);
            });

        });
    }

    createMapObjective(map, name, objId){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_assault_objects VALUES(NULL,?,0,?,?,0,0)";

            mysql.query(query, [map, name, objId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
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


    setAttackingTeam(matchId, team){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_matches SET attacking_team=? WHERE id=?";

            mysql.query(query, [team, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    setMatchAssaultCaps(matchId, caps){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_matches SET assault_caps=? WHERE id=?";

            mysql.query(query, [caps, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlayerMatchCaps(rowId, caps){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_player_matches SET assault_objectives=? WHERE id=?";

            mysql.query(query, [caps, rowId], (err) =>{
                
                if(err) reject(err);

                resolve();
            });
        });
    }

    getMatchCaps(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_assault_match_objectives WHERE match_id=?";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    getMapObjectives(mapId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT DISTINCT * FROM nstats_assault_objects WHERE map=? GROUP BY(obj_id) ORDER BY obj_order ASC";

            mysql.query(query, [mapId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
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
}

module.exports = Assault;