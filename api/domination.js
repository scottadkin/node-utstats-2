const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

class Domination{

    constructor(){

    }

    updateTeamScores(matchId, red, blue, green, yellow){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_matches SET team_score_0=?,team_score_1=?,team_score_2=?,team_score_3=? WHERE id=?";

            mysql.query(query, [red, blue, green, yellow, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    controlPointExists(mapId, name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_points FROM nstats_dom_control_points WHERE map=? AND name=?";

            mysql.query(query, [mapId, name], (err, result) =>{

                if(err) reject(err);

                if(result[0].total_points > 0){
                    resolve(true);
                }

                resolve(false);
            });
        });
    }

    createControlPoint(mapId, name, points){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_dom_control_points VALUES(NULL,?,?,?,1);";

            mysql.query(query, [mapId, name, points], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateControlPointStats(mapId, name, points){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_dom_control_points SET matches=matches+1, captured=captured+? WHERE map=? AND name=?";

            mysql.query(query, [points, mapId, name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async updateMapControlPoint(mapId, name, points){

        try{

            if(await this.controlPointExists(mapId, name)){

                new Message(`Control point "${name}" exists for map ${mapId}.`,'pass');
                await this.updateControlPointStats(mapId, name, points);
   
            }else{
                new Message(`Control point "${name}" doesn't exist for map ${mapId}, creating now.`,'note');
                await this.createControlPoint(mapId, name, points);
            }

        }catch(err){
            new Message(`updateMapControlPoint ${err}`,'error');
        }   
    }


    updateMatchControlPoint(matchId, mapId, name, points){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_dom_match_control_points VALUES(NULL,?,?,?,?)";
            
            mysql.query(query, [matchId, mapId, name, points], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateMatchDomCaps(matchId, total){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_matches SET dom_caps=? WHERE id=?";

            mysql.query(query, [total, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlayerCapTotals(masterId, gametypeId, caps){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_player_totals SET dom_caps=dom_caps+? WHERE id IN(?,?)";

            mysql.query(query, [caps, masterId, gametypeId], (err) =>{
                
                if(err) reject(err);

                resolve();
            });
        });
    }
}


module.exports = Domination;