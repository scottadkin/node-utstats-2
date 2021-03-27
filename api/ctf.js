const Promise = require('promise');
const mysql = require('./database');
const Message = require('./message');

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
            flag_carry_time=flag_carry_time+?
            WHERE id IN(?,?)`;

            const vars = [
                data.assist,
                data.return,
                data.taken,
                data.dropped,
                data.capture,
                data.pickup,
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
            flag_carry_time=?
            WHERE id=?`;

            const vars = [
                stats.assist,
                stats.return,
                stats.taken,
                stats.dropped,
                stats.capture,
                stats.pickup,
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

            const query = "SELECT timestamp,player,event,team FROM nstats_ctf_events WHERE match_id=? ORDER BY timestamp ASC";

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

            const query = "SELECT";
        });
    }
}


module.exports = CTF;