const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const Functions = require('./functions');

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

                if(result !== undefined){
                    if(result[0].total_points > 0){
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });
    }

    createControlPoint(mapId, name, points, position){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_dom_control_points VALUES(NULL,?,?,?,1,?,?,?);";

            mysql.query(query, [mapId, name, points, position.x, position.y, position.z], (err) =>{

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

    async updateMapControlPoint(mapId, name, points, position){

        try{

            if(await this.controlPointExists(mapId, name)){

                new Message(`Control point "${name}" exists for map ${mapId}.`,'pass');
                await this.updateControlPointStats(mapId, name, points);
   
            }else{
                new Message(`Control point "${name}" doesn't exist for map ${mapId}, creating now.`,'note');
                await this.createControlPoint(mapId, name, points, position);
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

            const query = `UPDATE nstats_player_totals SET dom_caps=dom_caps+?,
            dom_caps_best = IF(dom_caps_best < ?, ?, dom_caps_best)
            WHERE id IN(?,?)`;

            mysql.query(query, [caps, caps, caps, masterId, gametypeId], (err) =>{
                
                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlayerMatchStats(rowId, caps){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_player_matches SET dom_caps=? WHERE id=?";

            mysql.query(query, [caps, rowId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    getMatchDomPoints(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_dom_match_control_points WHERE match_id=?";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    getControlPointNames(mapId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nstats_dom_control_points WHERE map=?";

            mysql.query(query, [mapId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                
                resolve([]);
            });
        });
    }

    getMapControlPoints(map){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nstats_dom_control_points WHERE map=?";

            mysql.query(query, [map], (err, result) =>{

                if(err) reject(err);

                const data = new Map();

                if(result !== undefined){

                    for(let i = 0; i < result.length; i++){

                        data.set(result[i].name, result[i].id);
                    }
                }

                resolve(data);
            });
        });
    }

    insertPointCap(match, time, player, point, team){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_dom_match_caps VALUES(NULL,?,?,?,?,?)";

            mysql.query(query, [match, time, player, point, team], (err) =>{
                
                if(err) reject(err);

                resolve();
            });
        });
    }

    getMatchCaps(match){

        return new Promise((resolve, reject) =>{

            const query = "SELECT time,player,point,team FROM nstats_dom_match_caps WHERE match_id=?";

            mysql.query(query, [match], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    insertMatchPlayerScore(match, timestamp, player, score){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_dom_match_player_score VALUES(NULL,?,?,?,?)";

            mysql.query(query, [match, timestamp, player, score], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    getMatchPlayerScoreData(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT timestamp,player,score FROM nstats_dom_match_player_score WHERE match_id=? ORDER BY timestamp ASC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    getMapFullControlPoints(map){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,matches,captured,x,y,z FROM nstats_dom_control_points WHERE map=?";

            mysql.query(query, [map], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });

        });
    }

    updatePlayerBestLifeCaps(gametypeId, masterId, caps){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET 
            dom_caps_best_life = IF(dom_caps_best_life < ?, ?, dom_caps_best_life)
            WHERE id IN(?,?)`;

            mysql.query(query, [caps, caps, gametypeId, masterId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateMatchBestLifeCaps(playerId, matchId, caps){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_matches SET 
            dom_caps_best_life = IF(dom_caps_best_life < ?, ?, dom_caps_best_life)
            WHERE player_id=? AND match_id=?`;

            mysql.query(query, [caps, caps, playerId, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    reducePointCaps(id, amount){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_dom_control_points SET captured=captured-? WHERE id=?";

            mysql.query(query, [amount, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deleteMatchControlPoints(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_dom_match_control_points WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deletePlayerMatchScore(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_dom_match_player_score WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    removePlayerMatchCaps(playerId, matchId){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_dom_match_caps SET player=-1 WHERE player=? AND match_id=?";

            mysql.query(query, [playerId, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    async deletePlayerMatchScore(playerId, matchId){

        return await mysql.simpleDelete("DELETE FROM nstats_dom_match_player_score WHERE player=? AND match_id=?",
        [playerId, matchId]);
    }



    async deletePlayerFromMatch(playerId, matchId){

        try{

            await this.removePlayerMatchCaps(playerId, matchId);

            await this.deletePlayerMatchScore(playerId, matchId);

        }catch(err){
            console.trace(err);
        }
    }

    async changeCapPlayerId(oldId, newId){

        return await mysql.simpleUpdate("UPDATE nstats_dom_match_caps SET player=? WHERE player=?", [newId, oldId]);
    }

    async changeScoreHistoryPlayerId(oldId, newId){

        return await mysql.simpleUpdate("UPDATE nstats_dom_match_player_score SET player=? WHERE player=?", [newId, oldId]);
    }


    async deleteAllPlayerScoreHistory(playerId){

        await mysql.simpleDelete("DELETE FROM nstats_dom_match_player_score WHERE player=?", [playerId]);
    }

    async deleteAllPlayerMatchCaps(playerId){

        await mysql.simpleDelete("DELETE FROM nstats_dom_match_caps WHERE player=?", [playerId]);
    }

    async deletePlayer(playerId){

        try{

            await this.deleteAllPlayerScoreHistory(playerId);
            await this.deleteAllPlayerMatchCaps(playerId);


        }catch(err){
            console.trace(err);
        }
    }

    async getMatchesCaps(ids){

        if(ids.length === 0) return [];

        return await mysql.simpleFetch("SELECT * FROM nstats_dom_match_caps WHERE match_id IN (?)", [ids]);
    }


    async reduceCapsAlt(id, amount, matches){

        await mysql.simpleUpdate("UPDATE nstats_dom_control_points SET captured=captured-?, matches=matches-? WHERE id=?",[amount, matches, id]);
    }

    async deleteMatchesCaps(ids){

        if(ids.length === 0) return;
        await mysql.simpleDelete("DELETE FROM nstats_dom_match_caps WHERE match_id IN (?)",[ids]);
    }

    async deleteMatchesControlPoints(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_dom_match_control_points WHERE match_id IN (?)", [ids]);
    }

    async deleteMatchesPlayerScores(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_dom_match_player_score WHERE match_id IN (?)", [ids]);
    }

    async deleteMatches(ids){

        try{

            const matchCaps = await this.getMatchesCaps(ids);

            const pointCaps = {};

            let m = 0;

            for(let i = 0; i < matchCaps.length; i++){

                m = matchCaps[i];

                if(pointCaps[m.point] === undefined){
                    pointCaps[m.point] = {"matches": [], "caps": 0}
                }

                if(pointCaps[m.point].matches.indexOf(m.match_id) === -1){
                    pointCaps[m.point].matches.push(m.match_id);
                }

                pointCaps[m.point].caps++;
            }

            for(const [key, value] of Object.entries(pointCaps)){

                await this.reduceCapsAlt(key, value.caps, value.matches.length);
            }
            
            await this.deleteMatchesCaps(ids);
            await this.deleteMatchesControlPoints(ids);
            await this.deleteMatchesPlayerScores(ids);

        }catch(err){
            console.trace(err);
        }
    }


    async getPlayerMatchCaps(matchId, playerId){

        const query = "SELECT time,point,team FROM nstats_dom_match_caps WHERE match_id=? AND player=?";

        return await mysql.simpleFetch(query, [matchId, playerId]);
    }


    async getMatchPlayerCapTotals(matchId){

        const query = "SELECT player, point, COUNT(*) as total_caps FROM nstats_dom_match_caps WHERE match_id=? GROUP BY player, point";

        return await mysql.simpleQuery(query, [matchId]);
    }


    createPointGraphData(inputData, pointNames){


        const pointIndexes = [];

        const points = [];

        for(let i = 0; i < pointNames.length; i++){

            const p = pointNames[i];

            pointIndexes.push(p.id);

            points.push({"name": p.name, "data": [0], "lastValue": 0});
        }

        const updateOthers = (ignore) =>{

            for(let i = 0; i < points.length; i++){

                const p = points[i];

                if(pointIndexes[i] !== ignore){

                    points[i].data.push(points[i].lastValue);
                }
            }

        }


        for(let i = 0; i < inputData.length; i++){

            const d = inputData[i];

            const index = pointIndexes.indexOf(d.point);

            if(index !== -1){

                points[index].lastValue++;
                points[index].data.push(points[index].lastValue);

                updateOthers(d.point);
            }
        }

        return Functions.reduceGraphDataPoints(points, 50);
    }

    async getPointsGraphData(matchId, pointNames){

        const query = "SELECT player, point FROM nstats_dom_match_caps WHERE match_id=? ORDER BY time ASC";

        const result = await mysql.simpleQuery(query, [matchId]);

        return this.createPointGraphData(result, pointNames);

        
    }
}


module.exports = Domination;