const Promise = require('promise');
const mysql = require('./database');
const Message = require('./message');
const Functions = require('./functions');

class CTF{

    constructor(data){

        this.data = data;
    }


    updatePlayerTotals(masterId, gametypeId, data){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET
            flag_assist=flag_assist+?,
            flag_return=flag_return+?,
            flag_taken=flag_taken+?,
            flag_dropped=flag_dropped+?,
            flag_capture=flag_capture+?,
            flag_pickup=flag_pickup+?,
            flag_seal=flag_seal+?,
            flag_cover=flag_cover+?,
            flag_cover_pass=flag_cover_pass+?,
            flag_cover_fail=flag_cover_fail+?,
            flag_self_cover=flag_self_cover+?,
            flag_self_cover_pass=flag_self_cover_pass+?,
            flag_self_cover_fail=flag_self_cover_fail+?,
            flag_multi_cover=flag_multi_cover+?,
            flag_spree_cover=flag_spree_cover+?,
            flag_cover_best= IF(? > flag_cover_best, ?, flag_cover_best),
            flag_kill=flag_kill+?,
            flag_save=flag_save+?,
            flag_carry_time=flag_carry_time+?,
            flag_self_cover_best = IF(? > flag_self_cover_best, ?, flag_self_cover_best)
            WHERE id IN(?,?)`;

            const vars = [
                data.assist,
                data.return,
                data.taken,
                data.dropped,
                data.capture,
                data.pickup,
                data.seal,
                data.cover,
                data.coverPass,
                data.coverFail,
                data.selfCover,
                data.selfCoverPass,
                data.selfCoverFail,
                data.multiCover,
                data.spreeCover,
                data.bestCover,
                data.bestCover,
                data.kill,
                data.save,
                data.carryTime,
                data.bestSelfCover,
                data.bestSelfCover,
                masterId, gametypeId
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlayerMatchStats(rowId, stats){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_matches SET
            flag_assist = ?,
            flag_return = ?,
            flag_taken = ?,
            flag_dropped = ?,
            flag_capture = ?,
            flag_pickup = ?,
            flag_seal = ?,
            flag_cover = ?,
            flag_cover_pass = ?,
            flag_cover_fail = ?,
            flag_self_cover = ?,
            flag_self_cover_pass = ?,
            flag_self_cover_fail = ?,
            flag_multi_cover=?,
            flag_spree_cover=?,
            flag_cover_best=?,
            flag_kill = ?,
            flag_save = ?,
            flag_carry_time=?,
            flag_self_cover_best=?
            WHERE id=?`;

            const vars = [
                stats.assist,
                stats.return,
                stats.taken,
                stats.dropped,
                stats.capture,
                stats.pickup,
                stats.seal,
                stats.cover,
                stats.coverPass,
                stats.coverFail,
                stats.selfCover,
                stats.selfCoverPass,
                stats.selfCoverFail,
                stats.multiCover,
                stats.spreeCover,
                stats.bestCover,
                stats.kill,
                stats.save,
                stats.carryTime,
                stats.bestSelfCover,
                rowId
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    insertCap(matchId, mapId, team, grabTime, grab, drops, dropTimes, pickups, pickupTimes, covers, coverTimes, assists, assistsTimes, carryIds, cap, capTime, travelTime){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_ctf_caps VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

            const vars = [matchId, mapId, team, grabTime, grab, drops.toString(), dropTimes.toString(), pickups.toString(), pickupTimes.toString(), 
                covers.toString(), coverTimes.toString(), assists.toString(), assistsTimes.toString(), carryIds.toString(), cap, capTime, travelTime];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getMatchCaps(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_ctf_caps WHERE match_id=?";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    insertEvent(match, timestamp, player, event, team){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_ctf_events VALUES(NULL,?,?,?,?,?)";

            mysql.query(query, [match, timestamp, player, event, team], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getMatchEvents(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,timestamp,player,event,team FROM nstats_ctf_events WHERE match_id=? ORDER BY timestamp ASC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                
                resolve([]);
            });
        });
    }

    bFlagLocationExists(map, team){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_flags FROM nstats_maps_flags WHERE map=? AND team=?";

            mysql.query(query, [map, team], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result[0].total_flags > 0){
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });
    }

    insertFlagLocationQuery(map, team, position){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_maps_flags VALUES(NULL,?,?,?,?,?)";

            mysql.query(query, [map, team, position.x, position.y, position.z], (err) =>{

                if(err) reject(err);


                resolve();
            });
        });
    }

    async insertFlagLocation(map, team, position){

        try{

            if(!await this.bFlagLocationExists(map, team)){
                new Message(`Flag location doesn't exists(map = ${map}, team = ${team}), inserting now.`,"note");
                await this.insertFlagLocationQuery(map, team, position);
            }

        }catch(err){
            new Message(`CTF.InsertFlagLocation() ${err}`,"error");
        }
    }


    getFlagLocations(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT team,x,y,z FROM nstats_maps_flags WHERE map=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    deleteMatchCapData(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_ctf_caps WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deleteMatchEvents(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_ctf_events WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    parseCapEvents(caps, removedPlayer){

        let bRemovedPlayerData = false;

        const cleanArray = (data, removedPlayer) =>{

            data = data.split(",");

            const cleanData = [];

            let d = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                if(d !== ""){

                    d = parseInt(d);

                    if(d === d){

                        if(removedPlayer !== undefined){

                            if(d === removedPlayer){
                                d = -1
                                bRemovedPlayerData = true;
                            }
                        }

                        cleanData.push(d);
                    }
                }

            }

            return cleanData;

        }

        let c = 0;

        for(let i = 0; i < caps.length; i++){

            c = caps[i];

            if(removedPlayer !== undefined){

                if(c.grab === removedPlayer) c.grab = -1;
                if(c.cap === removedPlayer) c.cap = -1;
            }

            c.drops = cleanArray(c.drops, removedPlayer);
            c.drop_times = cleanArray(c.drop_times);
            c.pickups = cleanArray(c.pickups, removedPlayer);
            c.pickup_times = cleanArray(c.pickup_times);
            c.covers = cleanArray(c.covers, removedPlayer);
            c.cover_times = cleanArray(c.cover_times);
            c.assists = cleanArray(c.assists, removedPlayer);
            c.assist_carry_times = cleanArray(c.assist_carry_times);
            c.assist_carry_ids = cleanArray(c.assist_carry_ids, removedPlayer);

        }

        return bRemovedPlayerData;

    }

    updateCap(data){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_ctf_caps SET
            grab=?,
            drops=?,
            pickups=?,
            covers=?,
            assists=?,
            assist_carry_ids=?,
            cap=?
            WHERE id=?`;


            const vars = [
                data.grab,
                data.drops.toString(),
                data.pickups.toString(),
                data.covers.toString(),
                data.assists.toString(),
                data.assist_carry_ids.toString(),
                data.cap,
                data.id
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateEvent(data, ignoredPlayer){

        return new Promise((resolve, reject) =>{

            if(data.player !== ignoredPlayer){
                resolve();
            }else{

                mysql.query(query, [data.id], (err) =>{

                    if(err) reject(err);

                    resolve();
                });
            }
        });
    }

    async deletePlayerFromMatch(playerId, matchId){

        try{


            const matchCaps = await this.getMatchCaps(matchId);

            const matchEvents = await this.getMatchEvents(matchId);

            

            if(matchCaps.length > 0){
   
                if(this.parseCapEvents(matchCaps, playerId)){

                    for(let i = 0; i < matchCaps.length; i++){

                        await this.updateCap(matchCaps[i]);
                    }
                }
            }

            if(matchEvents.length > 0){

                for(let i = 0; i < matchEvents.length; i++){

                    await this.updateEvent(matchEvents[i], playerId);
                }
            }

        }catch(err){
            console.trace(err);
        }
    }


    async getAllCapData(){

        return await mysql.simpleFetch("SELECT * FROM nstats_ctf_caps");
    }

    async getCapDataByMatchIds(ids){

        if(ids.length === 0) return [];

        return await mysql.simpleFetch("SELECT * FROM nstats_ctf_caps WHERE match_id IN(?)",[ids]);
    }


    async updateCapEvent(data){

        const query = `UPDATE nstats_ctf_caps SET
        grab=?,
        drops=?,
        pickups=?,
        covers=?,
        assists=?,
        assist_carry_ids=?,
        cap=?
        WHERE id=?
        `;

        const vars = [
            data.grab,
            data.drops.toString(),
            data.pickups.toString(),
            data.covers.toString(),
            data.assists.toString(),
            data.assist_carry_ids.toString(),
            data.cap,
            data.id
        ];

        return await mysql.simpleUpdate(query, vars);
    }

    async changeCapEventPlayerIds(oldId, newId, matchIds){

        try{

            const data = await this.getCapDataByMatchIds(matchIds);

            const replaceIds = (array, find, replace) =>{

                for(let i = 0; i < array.length; i++){

                    if(array[i] === find) array[i] = replace;
                }
            }


            console.log(`Got ${data.length} caps to process`);

            let d = 0;

            let currentDrops = [];
            let currentPickups = [];
            let currentCovers = [];
            let currentAssists = [];
            let currentCarryIds = [];

            let bCurrentNeedsUpdating = false;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                bCurrentNeedsUpdating = false;
                currentDrops = Functions.stringToIntArray(d.drops);
                currentPickups = Functions.stringToIntArray(d.pickups);
                currentCovers = Functions.stringToIntArray(d.covers);
                currentAssists = Functions.stringToIntArray(d.assists);
                currentCarryIds = Functions.stringToIntArray(d.assist_carry_ids);
                
                if(d.grab === oldId){

                    d.grab = newId;
                    bCurrentNeedsUpdating = true;

                }

                if(d.cap === oldId){

                    d.cap = newId;
                    bCurrentNeedsUpdating = true;
                }

                if(currentDrops.length > 0 || currentPickups.length > 0 || currentCovers.length > 0 || currentAssists.length > 0 || currentCarryIds.length > 0){

                    bCurrentNeedsUpdating = true;
                    
                    replaceIds(currentDrops, oldId, newId);
                    replaceIds(currentPickups, oldId, newId);
                    replaceIds(currentCovers, oldId, newId);
                    replaceIds(currentAssists, oldId, newId);
                    replaceIds(currentCarryIds, oldId, newId);

                }

                d.drops = currentDrops;
                d.pickups = currentPickups;
                d.covers = currentCovers;
                d.assists = currentAssists;
                d.assist_carry_ids = currentCarryIds;
 

                if(bCurrentNeedsUpdating){

                    await this.updateCapEvent(d);
                }
                
            }

        }catch(err){
            console.trace(err);
        }
    }

    async changeEventPlayerId(oldId, newId){

        return await mysql.simpleUpdate("UPDATE nstats_ctf_events SET player=? WHERE player=?",[newId, oldId]);
        
    }

}


module.exports = CTF;