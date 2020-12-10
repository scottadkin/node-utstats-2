const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

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

            const query = "INSERT INTO nstats_assault_objects VALUES(NULL,?,?,0,0)";

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
}

module.exports = Assault;