const mysql = require('./database');
const Message = require('./message');
const Functions = require('./functions');

class CTF{

    constructor(data){

        this.data = data;

        //events waiting to be isnerted
        this.eventList = [];
        this.carryTimes = [];
        this.crKills = [];
        this.flagDrops = [];
        this.flagDeaths = [];
        this.covers = [];
    }

    async bPlayerTotalsExist(playerId, gametypeId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_ctf_totals WHERE player_id=? AND gametype_id=?`;

        const result = await mysql.simpleQuery(query, [playerId, gametypeId]);

        if(result[0].total_matches > 0) return true;

        return false;
    }

    async createPlayerTotals(playerId, gametypeId){

        const query = `INSERT INTO nstats_player_ctf_totals VALUES(NULL,?,?,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0)`;

        return await mysql.simpleQuery(query, [playerId, gametypeId]);
    }

    async updatePlayerTotals(playerId, gametypeId, playtime, stats){

        if(!await this.bPlayerTotalsExist(playerId, gametypeId)){
            await this.createPlayerTotals(playerId, gametypeId);
        }

        const query = `UPDATE nstats_player_ctf_totals SET
        total_matches=total_matches+1,
        playtime=playtime+?,
        flag_assist=flag_assist+?,
        flag_return=flag_return+?,
        flag_return_base=flag_return_base+?,
        flag_return_mid=flag_return_mid+?,
        flag_return_enemy_base=flag_return_enemy_base+?,
        flag_return_save=flag_return_save+?,
        flag_dropped=flag_dropped+?,
        flag_kill=flag_kill+?,
        flag_suicide=flag_suicide+?,
        flag_seal=flag_seal+?,
        flag_seal_pass=flag_seal_pass+?,
        flag_seal_fail=flag_seal_fail+?,
        best_single_seal = IF(best_single_seal < ?, ?, best_single_seal),
        flag_cover=flag_cover+?,
        flag_cover_pass=flag_cover_pass+?,
        flag_cover_fail=flag_cover_fail+?,
        flag_cover_multi=flag_cover_multi+?,
        flag_cover_spree=flag_cover_spree+?,
        best_single_cover = IF(best_single_cover < ?, ?, best_single_cover),
        flag_capture=flag_capture+?,
        flag_carry_time=flag_carry_time+?,
        flag_taken=flag_taken+?,
        flag_pickup=flag_pickup+?,
        flag_self_cover=flag_self_cover+?,
        flag_self_cover_pass=flag_self_cover_pass+?,
        flag_self_cover_fail=flag_self_cover_fail+?,
        best_single_self_cover = IF(best_single_self_cover < ?, ?, best_single_self_cover),
        flag_solo_capture=flag_solo_capture+?
        WHERE player_id=? AND gametype_id=?`;

        const vars = [
            playtime,
            stats.assist.total,
            stats.return.total,
            stats.returnBase.total,
            stats.returnMid.total,
            stats.returnEnemyBase.total,
            stats.returnSave.total,
            stats.dropped.total,
            stats.kill.total,
            stats.suicide.total,
            stats.seal.total,
            stats.sealPass.total,
            stats.sealFail.total,
            stats.bestSingleSeal, stats.bestSingleSeal,
            stats.cover.total,
            stats.coverPass.total,
            stats.coverFail.total,
            stats.coverMulti.total,
            stats.coverSpree.total,
            stats.bestSingleCover, stats.bestSingleCover,
            stats.capture.total,
            stats.carryTime.total,
            stats.taken.total,
            stats.pickup.total,
            stats.selfCover.total,
            stats.selfCoverPass.total,
            stats.selfCoverFail.total,
            stats.soloCapture.total,
            stats.bestSingleSelfCover, stats.bestSingleSelfCover,

            playerId, gametypeId
        ];

        await mysql.simpleQuery(query, vars);
    }

    /*async updatePlayerMatchStats(playerId, matchId, stats){

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
            WHERE player_id=? AND match_id=?`;

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
                playerId,
                matchId
            ];

        return await mysql.simpleQuery(query, vars);
    }*/

    calculateTimeDropped(dropTimes, pickupTimes){

        let timeDropped = 0;

        if(dropTimes.length === 0) return 0;

        console.log(`dropTimes = `);
        console.log(dropTimes);
        console.log(`pickupTimes = `);
        console.log(pickupTimes);

        for(let i = 0; i < pickupTimes.length; i++){

            //I forgot that there is no drops after the final pickup for caps 2iq move :(
            if(dropTimes[i] !== undefined){
                timeDropped += pickupTimes[i] - dropTimes[i];
            }

        }


        return timeDropped;
    }

    async insertCap(matchId, matchDate, gametypeId, mapId, capTeam, flagTeam, grabTime, grabPlayer, capTime, 
        capPlayer, travelTime, carryTime, dropTime, totalDrops, totalPickups, totalCovers, totalSeals, 
        totalAssists, totalSelfCovers, totalDeaths, totalSuicides, redTeamKills, blueTeamKills, greenTeamKills,
        yellowTeamKills, redSuicides, blueSuicides, greenSuicides, yellowSuicides){


        let carryTimePercent = 0;
        let dropTimePercent = 0;

        if(travelTime > 0){

            if(carryTime > 0){
                carryTimePercent = (carryTime / travelTime) * 100;
            }

            if(dropTime > 0){
                dropTimePercent = (dropTime / travelTime) * 100;
            }
        }


        const query = `INSERT INTO nstats_ctf_caps VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?)`;

        const vars = [
            matchId,
            gametypeId,
            matchDate, 
            mapId,
            capTeam, 
            flagTeam, 
            grabTime, 
            grabPlayer, 
            capTime, 
            capPlayer, 
            travelTime, 
            carryTime, 
            carryTimePercent, 
            dropTime, 
            dropTimePercent,
            totalDrops,
            totalPickups,
            totalCovers,
            totalSeals,
            totalAssists,
            totalSelfCovers,
            totalDeaths,
            totalSuicides,
            redTeamKills,
            blueTeamKills,
            greenTeamKills,
            yellowTeamKills,
            redSuicides,
            blueSuicides,
            greenSuicides,
            yellowSuicides
        ];

        const result = await mysql.simpleQuery(query, vars);

        return result.insertId;

    }

    async insertReturn(matchId, matchDate, mapId, flagTeam, grabTime, grabPlayer, returnTime, 
        returnPlayer, returnString, distanceToCap, returnLocation, travelTime, carryTime, 
        dropTime, totalDrops, totalPickups, totalCovers, totalSeals, totalSelfCovers, totalDeaths, 
        totalSuicides, redKills, blueKills, greenKills, yellowKills, redSuicides, blueSuicides, 
        greenSuicides, yellowSuicides){


        let carryTimePercent = 0;
        let dropTimePercent = 0;

        if(travelTime > 0){

            if(carryTime > 0){
                carryTimePercent = (carryTime / travelTime) * 100;
            }

            if(dropTime > 0){
                dropTimePercent = (dropTime / travelTime) * 100;
            }
        }


        const query = `INSERT INTO nstats_ctf_returns VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            ,?,?,?,?,?,?,?,?,?,?)`;

        const vars = [
            matchId,
            matchDate, 
            mapId, 
            flagTeam, 
            grabTime, //
            grabPlayer, //
            returnTime, 
            returnPlayer, 
            returnString,
            distanceToCap,
            returnLocation.x,
            returnLocation.y,
            returnLocation.z,
            travelTime, 
            carryTime, 
            carryTimePercent, 
            dropTime, 
            dropTimePercent,
            totalDrops,
            totalPickups,
            totalCovers,
            totalSeals,
            totalSelfCovers,
            totalDeaths,
            totalSuicides,
            redKills,
            blueKills,
            greenKills,
            yellowKills,
            redSuicides,
            blueSuicides,
            greenSuicides,
            yellowSuicides
        ];

        return await mysql.simpleQuery(query, vars);

    }

    async insertAssist(matchId, matchDate, mapId, capId, playerId, pickupTime, droppedTime, carryTime){

        const query = `INSERT INTO nstats_ctf_assists VALUES(NULL,?,?,?,?,?,?,?,?)`;

        const vars = [matchId, matchDate, mapId, capId, playerId, pickupTime, droppedTime, carryTime];

        return await mysql.simpleQuery(query, vars);
    }

    /*async insertCover(matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId){

        const query = "INSERT INTO nstats_ctf_covers VALUES(NULL,?,?,?,?,?,?,?,?)";

        const vars = [matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId];

        return await mysql.simpleQuery(query, vars);
    }*/

    addCover(matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId){

        this.covers.push([matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId]);
    }

    async bulkInsertFlagCovers(){

        const query = `INSERT INTO nstats_ctf_covers (match_id, match_date, map_id, cap_id, timestamp, killer_id, killer_team, victim_id) VALUES ?`;

        return await mysql.bulkInsert(query, this.covers);
    }

    async insertSelfCover(matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId){

        const query = "INSERT INTO nstats_ctf_self_covers VALUES(NULL,?,?,?,?,?,?,?,?)";

        const vars = [matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId];

        return await mysql.simpleQuery(query, vars);
    }

    async insertSeal(matchId, matchDate, mapId, capId, timestamp, killerId, victimId){

        const query = "INSERT INTO nstats_ctf_seals VALUES(NULL,?,?,?,?,?,?,?)";

        const vars = [matchId, matchDate, mapId, capId, timestamp, killerId, victimId];

        return await mysql.simpleQuery(query, vars);
    }

    addCarryTime(matchId, matchDate, mapId, capId, flagTeam, playerId, playerTeam, startTime, endTime, carryTime, carryPercent){

        this.carryTimes.push([matchId, matchDate, mapId, capId, flagTeam, playerId, playerTeam, startTime, endTime, carryTime, carryPercent]);
    }

    async insertCarryTimes(){

        const query = "INSERT INTO nstats_ctf_carry_times (match_id,match_date,map_id,cap_id,flag_team,player_id,player_team,start_time,end_time,carry_time,carry_percent) VALUES ?";
        await mysql.bulkInsert(query, this.carryTimes);
    }

    addFlagDeath(matchId, matchDate, mapId, timestamp, capId, killerId, killerTeam, 
        victimId, victimTeam, killDistance, distanceToCap, distanceToEnemyBase){

        this.flagDeaths.push([matchId, matchDate, mapId, timestamp, capId, killerId, killerTeam, 
            victimId, victimTeam, killDistance, distanceToCap, distanceToEnemyBase]);
    }

    async bulkInsertFlagDeaths(){

        const query = `INSERT INTO nstats_ctf_flag_deaths (
            match_id, match_date, map_id, timestamp, cap_id, killer_id, killer_team, victim_id, 
            victim_team, kill_distance, distance_to_cap, distance_to_enemy_base
            ) 
        VALUES ?`;

        await mysql.bulkInsert(query, this.flagDeaths);
    }

    addDrop(matchId, matchDate, mapId, timestamp, capId, flagTeam, playerId, playerTeam, distanceToCap, location,
        timeDropped){

            this.flagDrops.push([
                matchId, 
                matchDate, 
                mapId, 
                timestamp, 
                capId, 
                flagTeam, 
                playerId, 
                playerTeam, 
                distanceToCap, 
                location.x,
                location.y,
                location.z,
                timeDropped
            ]);
    }

    async bulkInsertFlagDrops(){

        const query = `INSERT INTO nstats_ctf_flag_drops (
            match_id,match_date,map_id,timestamp,cap_id,flag_team,player_id,
            player_team,distance_to_cap,position_x,position_y,position_z,time_dropped) 
        VALUES ?`;

        return await mysql.bulkInsert(query, this.flagDrops);
    }

    /*async insertDrop(matchId, matchDate, mapId, timestamp, capId, flagTeam, playerId, playerTeam, distanceToCap, location,
        timeDropped){

        const query = `INSERT INTO nstats_ctf_flag_drops VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vars = [
            matchId,
            matchDate,
            mapId,
            timestamp,
            capId,
            flagTeam,
            playerId, 
            playerTeam,
            distanceToCap,
            location.x,
            location.y,
            location.z,
            timeDropped
        ];

        return await mysql.simpleQuery(query, vars);
    }*/

    async insertPickup(matchId, matchDate, mapId, capId, timestamp, playerId, playerTeam, flagTeam){
  
        const query = `INSERT INTO nstats_ctf_flag_pickups VALUES(NULL,?,?,?,?,?,?,?,?)`;

        const vars = [
            matchId,
            matchDate,
            mapId,
            capId,
            timestamp,
            playerId,
            playerTeam,
            flagTeam
        ];

        return await mysql.simpleQuery(query, vars);         
    }

    /*async insertCap(matchId, matchDate, mapId, team, flagTeam, grabTime, grab, drops, dropTimes, pickups, pickupTimes, covers, coverTimes, assists, 
        assistsTimes, carryIds, cap, 
        capTime, travelTime, selfCovers, selfCoversCount, seals, sealTimes){

        const totalDrops = drops.length;
        const totalCovers = covers.length;
        const totalSelfCovers = selfCovers.length;
        const totalSeals = seals.length;
        const totalPickups = pickups.length;
        const totalAssists = carryIds.length;
        const totalUniqueAssists = assists.length;

        const timeDropped = this.calculateTimeDropped(dropTimes, pickupTimes);

        console.log(`timeDropped = ${timeDropped}`);
        let carryTime = parseFloat(travelTime) - timeDropped;
        if(carryTime !== carryTime) carryTime = -1;

        const query = `INSERT INTO nstats_ctf_caps VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vars = [matchId, mapId, team, grabTime, grab, drops.toString(), dropTimes.toString(), pickups.toString(), pickupTimes.toString(), 
            covers.toString(), coverTimes.toString(), assists.toString(), assistsTimes.toString(), carryIds.toString(), cap, capTime, travelTime,
            selfCovers.toString(), selfCoversCount.toString(), seals.toString(), sealTimes.toString(), flagTeam, totalDrops, totalCovers, 
            totalSelfCovers, totalPickups, totalAssists, totalUniqueAssists, totalSeals, timeDropped, carryTime];

        let type = 0;

        if(assists.length !== 0){
            type = 1;
        }
        
        await mysql.simpleQuery(query, vars);

    }*/





    async getMatchCaps(matchId){

        const query = `SELECT * FROM nstats_ctf_caps WHERE match_id=? ORDER BY grab_time ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    async getMatchAssists(matchId){

        const query = `SELECT id,cap_id,player_id,pickup_time,dropped_time,carry_time 
        FROM nstats_ctf_assists WHERE match_id=? ORDER BY pickup_time ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    async getMatchCovers(matchId, bOnlyCapped, bIgnoreId){

        if(bIgnoreId === undefined) bIgnoreId = false;

        const extra = " AND cap_id!=-1";

        const query = `SELECT ${(bIgnoreId) ? "" :"id,"}cap_id,timestamp,killer_id,victim_id FROM nstats_ctf_covers
        WHERE match_id=? ${(bOnlyCapped) ? extra : ""} ORDER BY timestamp ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    async getMatchFailedCovers(matchId){

        const query = `SELECT id,timestamp,killer_id,victim_id,killer_team FROM nstats_ctf_covers
        WHERE match_id=? AND cap_id=-1 ORDER BY timestamp ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }


    async getMatchSelfCovers(matchId, bOnlyCapped){

        const extra = " AND cap_id!=-1";

        const query = `SELECT id,cap_id,timestamp,killer_id,victim_id FROM nstats_ctf_self_covers
        WHERE match_id=? ${(bOnlyCapped) ? extra : ""} ORDER BY timestamp ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    async getMatchSeals(matchId, bOnlyCapped){

        const extra = " AND cap_id!=-1";

        const query = `SELECT id,cap_id,timestamp,killer_id,victim_id FROM nstats_ctf_seals
        WHERE match_id=? ${(bOnlyCapped) ? extra : ""} ORDER BY timestamp ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    async getMatchCarryTimes(matchId, bOnlyCapped){

        const extra = " AND cap_id!=-1";

        const query = `SELECT id,cap_id,flag_team,player_id,player_team,start_time,end_time,carry_time,carry_percent 
        FROM nstats_ctf_carry_times
        WHERE match_id=? ${(bOnlyCapped) ? extra : ""} ORDER BY start_time ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    /**
     * 
     * @param {Number} matchId 
     * @param {String} include all, only-returns, only-capped
     * @returns 
     */
    async getMatchFlagDeaths(matchId, include){

        include = include.toLowerCase();

        let query = `SELECT id,timestamp,cap_id,killer_id,killer_team,victim_id,victim_team,
        kill_distance,distance_to_cap,distance_to_enemy_base
        FROM nstats_ctf_flag_deaths WHERE match_id=?`;

        if(include === "only-returns"){
            query += " AND cap_id=-1";
        }else if(include === "only-capped"){
            query += " AND cap_id!=-1";
        }

        query += " ORDER BY timestamp ASC";
        return await mysql.simpleQuery(query, [matchId]);
    }

    /**
     * 
     * @param {Number} matchId 
     * @param {String} include all, only-returns, only-capped
     * @returns 
     */
    async getMatchFlagDrops(matchId, include){

        include = include.toLowerCase();

        let query = `SELECT id,timestamp,cap_id,flag_team,player_id,player_team,distance_to_cap,
        position_x,position_y,position_z,time_dropped 
        FROM nstats_ctf_flag_drops 
        WHERE match_id=?`;

        if(include === "only-returns"){
            query += " AND cap_id=-1";
        }else if(include === "only-capped"){
            query += " AND cap_id!=-1";
        }

        query += " ORDER BY timestamp ASC"

        return await mysql.simpleQuery(query, [matchId]);
    }

    async getMatchFlagPickups(matchId, include){

        include = include.toLowerCase();

        let query = `SELECT id,timestamp,cap_id,flag_team,player_id,player_team 
        FROM nstats_ctf_flag_pickups 
        WHERE match_id=?`;

        if(include === "only-returns"){
            query += " AND cap_id=-1";
        }else if(include === "only-capped"){
            query += " AND cap_id!=-1";
        }

        query += " ORDER BY timestamp ASC"

        return await mysql.simpleQuery(query, [matchId]);

    }

    async getMatchReturns(matchId){

        const query = "SELECT * FROM nstats_ctf_returns WHERE match_id=? ORDER BY return_time ASC";

        return await mysql.simpleQuery(query, [matchId]);
    }

    async getMatchReturnsInteractiveData(matchId){

        const query = `SELECT flag_team,return_time,return_player,pos_x,pos_y,pos_z FROM nstats_ctf_returns WHERE match_id=? ORDER BY return_time DESC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    filterFlagCovers(covers, team, start, end, bSelfCovers){

        const found = [];

        for(let i = 0; i < covers.length; i++){

            const c = covers[i];

            if(c.timestamp < start) continue;
            if(c.timestamp > end) break;

            if(!bSelfCovers){

                if(c.killer_team === team){
                    found.push(c);
                }

            }else{
                
                if(c.killer_team !== team){
                    found.push(c);
                }
            }
        }

        return found;
    }

    async getMatchFailedSelfCovers(matchId){

        const query = `SELECT id,timestamp,killer_id,killer_team,victim_id FROM nstats_ctf_self_covers 
        WHERE match_id=? AND cap_id=-1
        ORDER BY timestamp ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    filterFlagDeaths(deaths, returnData, startKey, endKey){

        return deaths.filter((death) =>{

            const start = returnData[startKey];
            const end = returnData[endKey];
            const time = death.timestamp;

            if(death.victim_team !== returnData.flag_team && time >= start && time <= end){
                return true;
            }
        });
    }

    filterFlagDrops(drops, returnData, startTimestampKey, endTimestampKey){
        
        return drops.filter((drop) =>{

            const timestamp = drop.timestamp;
            const startTime = returnData[startTimestampKey];
            const endTime = returnData[endTimestampKey];

            if(drop.flag_team === returnData.flag_team){

                if(timestamp >= startTime && timestamp <= endTime){
                    return true;
                }
            }
        });
    }

    filterFlagPickups(pickups, returnData, startKey, endKey){

        const r = returnData;

        return pickups.filter((p) =>{

            const start = r[startKey];
            const end = r[endKey];
            const time = p.timestamp;

            if(time >= start && time <= end && r.flag_team === p.flag_team){
                return true;
            }
        });
    }

    async getMatchDetailedReturns(matchId){

        const returns = await this.getMatchReturns(matchId);
        const covers = await this.getMatchFailedCovers(matchId);
        const selfCovers = await this.getMatchFailedSelfCovers(matchId);
        const flagDeaths = await this.getMatchFlagDeaths(matchId, "only-returns");
        const flagDrops = await this.getMatchFlagDrops(matchId, "only-returns");
        const flagPickups = await this.getMatchFlagPickups(matchId, "only-returns");    
        const teamFrags = await this.getCapFragEvents(matchId, "only-returns");

        for(let i = 0; i < returns.length; i++){

            const r = returns[i];
            r.coverData = this.filterFlagCovers(covers, r.flag_team, r.grab_time, r.return_time, false);
            r.selfCoverData = this.filterFlagCovers(selfCovers, r.flag_team, r.grab_time, r.return_time, true);
            r.deathsData = this.filterFlagDeaths(flagDeaths, r, "grab_time", "return_time");
            r.flagDrops = this.filterFlagDrops(flagDrops, r, "grab_time", "return_time");
            r.flagPickups = this.filterFlagPickups(flagPickups, r, "grab_time", "return_time");

            r.returnKills = teamFrags.kills[r.return_time] ?? []; 
            r.returnSuicides = teamFrags.suicides[r.return_time] ?? []; 

        }


        return returns;
    }

    async getPlayerMatchReturns(matchId, playerId){

        const query = `SELECT grab_time,return_time,return_string,distance_to_cap,travel_time,carry_time,drop_time 
        FROM nstats_ctf_returns WHERE match_id=? AND return_player=?`;

        return await mysql.simpleQuery(query, [matchId, playerId]);
    }

    filterByCapId(data, capId){

        return data.filter((d) =>{
            if(d.cap_id === capId) return true;
        });
    }

    async getMatchDetailedCaps(matchId){

        const caps = await this.getMatchCaps(matchId);
        const assists = await this.getMatchAssists(matchId);
        const covers = await this.getMatchCovers(matchId, true);
        const selfCovers = await this.getMatchSelfCovers(matchId, true);
        const seals = await this.getMatchSeals(matchId, true);
        const carryTimes = await this.getMatchCarryTimes(matchId, true);
        const capFragEvents = await this.getCapFragEvents(matchId, "only-capped");
        const flagDeaths = await this.getMatchFlagDeaths(matchId, "only-capped");
        const flagDrops = await this.getMatchFlagDrops(matchId, "only-capped");
        const flagPickups = await this.getMatchFlagPickups(matchId, "only-capped"); 

        for(let i = 0; i < caps.length; i++){

            const c = caps[i];

            c.coverData = this.filterByCapId(covers, c.id);
            c.selfCoverData = this.filterByCapId(selfCovers, c.id);
            c.flagDrops = this.filterByCapId(flagDrops, c.id);
            c.flagPickups = this.filterByCapId(flagPickups, c.id);
            c.flagDeaths = this.filterByCapId(flagDeaths, c.id);
            c.flagAssists = this.filterByCapId(assists, c.id);
            c.flagSeals = this.filterByCapId(seals, c.id);
            c.carryTimes = this.filterByCapId(carryTimes, c.id);

            c.capKills = capFragEvents.kills[c.cap_time] ?? [];
            c.capSuicides = capFragEvents.suicides[c.cap_time] ?? [];
        }

        return caps;
    }

    addEvent(match, timestamp, player, event, team){

        this.eventList.push([match, timestamp, player, event, team]);
    }

    async insertEventList(){

        const query = "INSERT INTO nstats_ctf_events (match_id, timestamp, player, event, team) VALUES ?";

        return await mysql.bulkInsert(query, this.eventList);
    }

    async getMatchEvents(id){

        const query = "SELECT id,player,event,team FROM nstats_ctf_events WHERE match_id=? ORDER BY timestamp ASC";
        return await mysql.simpleQuery(query, [id]);

    }

    async getEventGraphData(id, players, teams){


        const data = await this.getMatchEvents(id);

        const playerIndexes = [];

        let capData = [];
        let grabData = [];
        let pickupData = [];
        let dropData = [];
        let killData = [];
        let assistData = [];
        let coverData = [];
        let returnData = [];
        let saveData = [];
        let sealData = [];

        let teamsCapData = [];
        let teamsGrabData = [];
        let teamsPickupData = [];
        let teamsDropData = [];
        let teamsKillData = [];
        let teamsAssistData = [];
        let teamsCoverData = [];
        let teamsReturnData = [];
        let teamsSaveData = [];
        let teamsSealData = [];

        for(const [key, value] of Object.entries(players)){

            playerIndexes.push(parseInt(key));

            capData.push({"name": value, "data": [], "lastValue": 0});
            grabData.push({"name": value, "data": [], "lastValue": 0});
            pickupData.push({"name": value, "data": [], "lastValue": 0});
            dropData.push({"name": value, "data": [], "lastValue": 0});
            killData.push({"name": value, "data": [], "lastValue": 0});
            assistData.push({"name": value, "data": [], "lastValue": 0});
            coverData.push({"name": value, "data": [], "lastValue": 0});
            returnData.push({"name": value, "data": [], "lastValue": 0});
            saveData.push({"name": value, "data": [], "lastValue": 0});
            sealData.push({"name": value, "data": [], "lastValue": 0});

        }

        for(let i = 0; i < teams; i++){

            const teamName = Functions.getTeamName(i);

            teamsCapData.push({"name": teamName, "data": [], "lastValue": 0});
            teamsGrabData.push({"name": teamName, "data": [], "lastValue": 0});
            teamsPickupData.push({"name": teamName, "data": [], "lastValue": 0});
            teamsDropData.push({"name": teamName, "data": [], "lastValue": 0});
            teamsKillData.push({"name": teamName, "data": [], "lastValue": 0});
            teamsAssistData.push({"name": teamName, "data": [], "lastValue": 0});
            teamsCoverData.push({"name": teamName, "data": [], "lastValue": 0});
            teamsReturnData.push({"name": teamName, "data": [], "lastValue": 0});
            teamsSaveData.push({"name": teamName, "data": [], "lastValue": 0});
            teamsSealData.push({"name": teamName, "data": [], "lastValue": 0});
        }

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const playerIndex = playerIndexes.indexOf(d.player);

            const event = d.event;

            let current = null;
            let currentTeam = null;
            

            if(event === "captured"){

                current = capData;
                currentTeam = teamsCapData;

            }else if(event === "taken"){

                current = grabData;
                currentTeam = teamsGrabData;

            }else if(event === "pickedup"){

                current = pickupData;
                currentTeam = teamsPickupData;

            }else if(event === "dropped"){

                current = dropData;
                currentTeam = teamsDropData;

            }else if(event === "kill"){

                current = killData;
                currentTeam = teamsKillData;

            }else if(event === "assist"){

                current = assistData;
                currentTeam = teamsAssistData;

            }else if(event === "cover"){

                current = coverData;
                currentTeam = teamsCoverData;

            }else if(event === "returned"){

                current = returnData;
                currentTeam = teamsReturnData;

            }else if(event === "save"){

                current = saveData;
                currentTeam = teamsSaveData;

            }else if(event === "seal"){
                
                current = sealData;
                currentTeam = teamsSealData;
            }

            if(current !== null){

                current[playerIndex].lastValue++;

                for(let x = 0; x < playerIndexes.length; x++){
                    current[x].data.push(current[x].lastValue);
                }
            }

            if(currentTeam !== null){

                currentTeam[d.team].lastValue++;

                for(let x = 0; x < teams; x++){

                    currentTeam[x].data.push(currentTeam[x].lastValue);
                }
            }
        }

        const max = 50;

        capData = Functions.reduceGraphDataPoints(capData, max);
        grabData = Functions.reduceGraphDataPoints(grabData, max);
        pickupData = Functions.reduceGraphDataPoints(pickupData, max);
        dropData = Functions.reduceGraphDataPoints(dropData, max);
        killData = Functions.reduceGraphDataPoints(killData, max);
        assistData = Functions.reduceGraphDataPoints(assistData, max);
        coverData = Functions.reduceGraphDataPoints(coverData, max);
        returnData = Functions.reduceGraphDataPoints(returnData, max);
        saveData = Functions.reduceGraphDataPoints(saveData, max);
        sealData = Functions.reduceGraphDataPoints(sealData, max);

        teamsCapData = Functions.reduceGraphDataPoints(teamsCapData, max);
        teamsPickupData = Functions.reduceGraphDataPoints(teamsPickupData, max);
        teamsDropData = Functions.reduceGraphDataPoints(teamsDropData, max);
        teamsKillData = Functions.reduceGraphDataPoints(teamsKillData, max);
        teamsAssistData = Functions.reduceGraphDataPoints(teamsAssistData, max);
        teamsCoverData = Functions.reduceGraphDataPoints(teamsCoverData, max);
        teamsReturnData = Functions.reduceGraphDataPoints(teamsReturnData, max);
        teamsSaveData = Functions.reduceGraphDataPoints(teamsSaveData, max);
        teamsSealData = Functions.reduceGraphDataPoints(teamsSealData, max);


        const sortByLastValue = (a, b) =>{
            a = a.lastValue;
            b = b.lastValue;

            return b-a;
        }

        capData.sort(sortByLastValue);
        grabData.sort(sortByLastValue);
        pickupData.sort(sortByLastValue);
        dropData.sort(sortByLastValue);
        killData.sort(sortByLastValue);
        assistData.sort(sortByLastValue);
        coverData.sort(sortByLastValue);
        returnData.sort(sortByLastValue);
        saveData.sort(sortByLastValue);
        sealData.sort(sortByLastValue);

        return {
            "caps": capData,
            "grabs": grabData,
            "pickups": pickupData,
            "drops": dropData,
            "kills": killData,
            "assists": assistData,
            "covers": coverData,
            "returns": returnData,
            "saves": saveData,
            "seals": sealData,
            "teamCaps": teamsCapData,
            "teamGrabs": teamsGrabData,
            "teamPickups": teamsPickupData,
            "teamDrops": teamsDropData,
            "teamKills": teamsKillData,
            "teamAssists": teamsAssistData,
            "teamCovers": teamsCoverData,
            "teamReturns": teamsReturnData,
            "teamSaves": teamsSaveData,
            "teamSeals": teamsSealData
        };
    }

    async bFlagLocationExists(map, team){

        const query = "SELECT COUNT(*) as total_flags FROM nstats_maps_flags WHERE map=? AND team=?";

        const result = await mysql.simpleQuery(query, [map, team]);

        if(result[0].total_flags > 0) return true;
        return false;
    }

    async insertFlagLocationQuery(map, team, position){

        const query = "INSERT INTO nstats_maps_flags VALUES(NULL,?,?,?,?,?)";
        return await mysql.simpleQuery(query, [map, team, position.x, position.y, position.z]);
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

                        //updated to remove player completely from match
                    
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
           // c.drop_times = cleanArray(c.drop_times);
            c.pickups = cleanArray(c.pickups, removedPlayer);
            //c.pickup_times = cleanArray(c.pickup_times);
            c.covers = cleanArray(c.covers, removedPlayer);
            //c.cover_times = cleanArray(c.cover_times);
            c.assists = cleanArray(c.assists, removedPlayer);
            //c.assist_carry_times = cleanArray(c.assist_carry_times);
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

    async updateEvent(data, ignoredPlayer){

        if(data.player !== ignoredPlayer) return;

        const query = "DELETE FROM nstats_ctf_events WHERE id=?";
        await mysql.simpleQuery(query, [data.id]);
    }

    async deletePlayerMatchEvents(playerId, matchId){

        const query = "DELETE FROM nstats_ctf_events WHERE match_id=? AND player=?";
        await mysql.simpleQuery(query, [matchId, playerId]);
    }

    async deletePlayerMatchAssists(playerId, matchId){

        const query = `DELETE FROM nstats_ctf_assists WHERE player_id=? AND match_id=?`;
        return await mysql.simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchAssists(playerId, matchId){

        const query = `UPDATE nstats_ctf_assists SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await mysql.simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchCaps(playerId, matchId){

        const query = `UPDATE nstats_ctf_caps SET
        grab_player = IF(grab_player = ?, -1, grab_player),
        cap_player = IF(cap_player = ?, -1, cap_player)
        WHERE match_id=?`;
        return await mysql.simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchCarryTimes(playerId, matchId){

        const query = `UPDATE nstats_ctf_carry_times SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await mysql.simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchCovers(playerId, matchId){

        const query = `UPDATE nstats_ctf_covers SET
        killer_id = IF(killer_id = ?, -1, killer_id),
        victim_id = IF(victim_id = ?, -1, victim_id)
        WHERE match_id=?`;

        return await mysql.simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchCRKills(playerId, matchId){

        const query = `UPDATE nstats_ctf_cr_kills SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await mysql.simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchFlagDeaths(playerId, matchId){

        const query = `UPDATE nstats_ctf_flag_deaths SET
        killer_id = IF(killer_id = ?, -1, killer_id),
        victim_id = IF(victim_id = ?, -1, victim_id)
        WHERE match_id=?`;

        return await mysql.simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchFlagDrops(playerId, matchId){

        const query = `UPDATE nstats_ctf_flag_drops SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await mysql.simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchFlagPickups(playerId, matchId){

        const query = `UPDATE nstats_ctf_flag_pickups SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await mysql.simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchReturns(playerId, matchId){

        const query = `UPDATE nstats_ctf_returns SET
        grab_player = IF(grab_player = ?, -1, grab_player),
        return_player = IF(return_player = ?, -1, return_player)
        WHERE match_id=?`;
        return await mysql.simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchSeals(playerId, matchId){

        const query = `UPDATE nstats_ctf_seals SET
        killer_id = IF(killer_id = ?, -1, killer_id),
        victim_id = IF(victim_id = ?, -1, victim_id)
        WHERE match_id=?`;

        return await mysql.simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchSelfCovers(playerId, matchId){

        const query = `UPDATE nstats_ctf_self_covers SET
        killer_id = IF(killer_id = ?, -1, killer_id),
        victim_id = IF(victim_id = ?, -1, victim_id)
        WHERE match_id=?`;

        return await mysql.simpleQuery(query, [playerId, playerId, matchId]);
    }

    async deletePlayerMatchStats(playerId, matchId){

        const query = `DELETE FROM nstats_player_ctf_match WHERE player_id=? AND match_id=?`;

        return await mysql.simpleQuery(query, [playerId, matchId]);
    }
    /**
     * 
     * @param {*} playerId 
     * @param {*} matchId 
     * @param {*} bIgnoreEvents only set this if you want to ignore events
     */
    async deletePlayerFromMatch(playerId, matchId){

        try{

            await this.removePlayerMatchAssists(playerId, matchId);
            await this.removePlayerMatchCaps(playerId, matchId);
            await this.removePlayerMatchCarryTimes(playerId, matchId);
            await this.removePlayerMatchCovers(playerId, matchId);
            await this.removePlayerMatchCRKills(playerId, matchId);
            await this.removePlayerMatchFlagDeaths(playerId, matchId);
            await this.removePlayerMatchFlagDrops(playerId, matchId);
            await this.removePlayerMatchFlagPickups(playerId, matchId);
            await this.removePlayerMatchReturns(playerId, matchId);
            await this.removePlayerMatchSeals(playerId, matchId);
            await this.removePlayerMatchSelfCovers(playerId, matchId);
            await this.deletePlayerMatchStats(playerId, matchId);

            await this.deletePlayerMatchEvents(playerId, matchId);

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
    

    
    async deletePlayerEvents(playerId){

        await mysql.simpleDelete("DELETE FROM nstats_ctf_events WHERE player=?", [playerId]);
    }

    bAnyCtfDataInMatch(playerMatchData){

        const types = ['flag_assist', 'flag_return',
            'flag_taken',            'flag_dropped',           'flag_capture',
            'flag_pickup',           'flag_seal',              'flag_cover',
            'flag_cover_pass',       'flag_cover_fail',        'flag_self_cover',
            'flag_self_cover_pass',  'flag_self_cover_fail',   'flag_multi_cover',
            'flag_spree_cover',      'flag_cover_best',        'flag_self_cover_best',
            'flag_kill',             'flag_save',              'flag_carry_time'];


        for(let i = 0; i < types.length; i++){

            if(playerMatchData[types[i]] !== undefined){
                if(playerMatchData[types[i]] !== 0) return true;
            }
        }


        return false;
    }
    
    async deletePlayerViaMatchData(playerId, matchIds){

        try{

            await this.deletePlayerEvents(playerId);

            let m = 0;

            for(let i = 0; i < matchIds.length; i++){

                m = matchIds[i];

                //if(this.bAnyCtfDataInMatch(matches[i])){

                    await this.deletePlayerFromMatch(playerId, m, true);
                //}
            }

        }catch(err){    
            console.trace(err);
        }
    }


    bAnyPlayerData(playersMatchData){

        const ctfTypes = [
            'flag_assist',           'flag_return',
            'flag_taken',            'flag_dropped',           'flag_capture',
            'flag_pickup',           'flag_seal',              'flag_cover',
            'flag_cover_pass',       'flag_cover_fail',        'flag_self_cover',
            'flag_self_cover_pass',  'flag_self_cover_fail',   'flag_multi_cover',
            'flag_spree_cover',      'flag_cover_best',        'flag_self_cover_best',
            'flag_kill',             'flag_save',              'flag_carry_time',
        ];

        const ctfMatchIds = [];

        let p = 0;

        for(let i = 0; i < playersMatchData.length; i++){

            p = playersMatchData[i];

            for(let x = 0; x < ctfTypes.length; x++){

                if(p[ctfTypes[x]] !== 0){

                    if(ctfMatchIds.indexOf(p.match_id) === -1){
                        ctfMatchIds.push(p.match_id);
                        break;
                    }
                }
            }
        }

        return ctfMatchIds;
    }


    async deleteMatchesCaps(ids){

        if(ids.length === 0) return;
        const query = "DELETE FROM nstats_ctf_caps WHERE match_id IN (?)";

        await mysql.simpleDelete(query, [ids]);
    }

    async deleteMatchesEvents(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_ctf_events WHERE match_id IN (?)", [ids]);
    }

    async deleteMatches(ids){

        try{

            await this.deleteMatchesCaps(ids);
            await this.deleteMatchesEvents(ids);


        }catch(err){
            console.trace(err);
        }
    }

    async getPlayerCapCarryTime(capId, playerId){

        const query = `SELECT SUM(carry_time) as total_carry_time, SUM(carry_percent) as total_carry_percent 
        FROM nstats_ctf_carry_times WHERE cap_id=? AND player_id=?`;

        const r = await mysql.simpleQuery(query, [capId, playerId]);

        const totalCarryTime = (r[0].total_carry_time === null) ? 0 : r[0].total_carry_time; 
        const totalCarryPercent = (r[0].total_carry_percent === null) ? 0 : r[0].total_carry_percent; 

        return {"carryTime": totalCarryTime, "carryPercent": totalCarryPercent};
    }

    async getPlayerMatchCaps(matchId, playerId){

        const query = `SELECT id,cap_team,flag_team,grab_time,cap_time,travel_time,total_assists 
        FROM nstats_ctf_caps WHERE match_id=? AND cap_player=? ORDER BY cap_time ASC`;

        const caps = await mysql.simpleQuery(query, [matchId, playerId]);

        for(let i = 0; i < caps.length; i++){
            
            const c = caps[i];
            c.times = await this.getPlayerCapCarryTime(c.id, playerId);
        }

        return caps;
    }

    async getFastestMatchCaps(matchId){

        const query = "SELECT team,grab,cap,assists,travel_time,cap_time FROM nstats_ctf_caps WHERE match_id=? ORDER BY travel_time ASC";

        const result = await mysql.simpleQuery(query, [matchId]);

        for(let i = 0; i < result.length; i++){

            result[i].assists = result[i].assists.split(",");
        }

        return result;
    }


    async clearRecords(){

        const query = "DELETE FROM nstats_ctf_cap_records";
        await mysql.simpleQuery(query);
    }




    async insertPlayerMatchData(playerId, matchId, mapId, gametypeId, serverId, matchDate, player){

        const query = `INSERT INTO nstats_player_ctf_match VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vars = [
            playerId,
            matchId, 
            gametypeId, 
            serverId, 
            mapId,
            matchDate, 
            player.stats.time_on_server,
            //player.stats.teamPlaytime[0],
            //player.stats.teamPlaytime[1],
            //player.stats.teamPlaytime[2],
            //player.stats.teamPlaytime[3],
            //player.stats.teamPlaytime[255],
            player.stats.ctfNew.assist.total,//flag assist
            player.stats.ctfNew.assist.bestLife,
            player.stats.ctfNew.return.total,
            player.stats.ctfNew.return.bestLife,
            player.stats.ctfNew.returnBase.total,
            player.stats.ctfNew.returnBase.bestLife,
            player.stats.ctfNew.returnMid.total,
            player.stats.ctfNew.returnMid.bestLife,
            player.stats.ctfNew.returnEnemyBase.total,
            player.stats.ctfNew.returnEnemyBase.bestLife,
            player.stats.ctfNew.returnSave.total,
            player.stats.ctfNew.returnSave.bestLife,
            player.stats.ctfNew.dropped.total,
            player.stats.ctfNew.dropped.bestLife,
            player.stats.ctfNew.kill.total,
            player.stats.ctfNew.kill.bestLife,
            player.stats.ctfNew.suicide.total,
            player.stats.ctfNew.seal.total,
            player.stats.ctfNew.seal.bestLife,
            player.stats.ctfNew.sealPass.total,
            player.stats.ctfNew.sealPass.bestLife,
            player.stats.ctfNew.sealFail.total,
            player.stats.ctfNew.sealFail.bestLife,
            player.stats.ctfNew.bestSingleSeal,
            player.stats.ctfNew.cover.total,
            player.stats.ctfNew.cover.bestLife,
            player.stats.ctfNew.coverPass.total,
            player.stats.ctfNew.coverPass.bestLife,
            player.stats.ctfNew.coverFail.total,
            player.stats.ctfNew.coverFail.bestLife,
            player.stats.ctfNew.coverMulti.total,
            player.stats.ctfNew.coverMulti.bestLife,
            player.stats.ctfNew.coverSpree.total,
            player.stats.ctfNew.coverSpree.bestLife,
            player.stats.ctfNew.bestSingleCover,
            player.stats.ctfNew.capture.total,
            player.stats.ctfNew.capture.bestLife,
            player.stats.ctfNew.carryTime.total,
            player.stats.ctfNew.carryTime.bestLife,
            player.stats.ctfNew.taken.total,
            player.stats.ctfNew.taken.bestLife,
            player.stats.ctfNew.pickup.total,
            player.stats.ctfNew.pickup.bestLife,
            player.stats.ctfNew.selfCover.total,
            player.stats.ctfNew.selfCover.bestLife,
            player.stats.ctfNew.selfCoverPass.total,
            player.stats.ctfNew.selfCoverPass.bestLife,
            player.stats.ctfNew.selfCoverFail.total,
            player.stats.ctfNew.selfCoverFail.bestLife,
            player.stats.ctfNew.bestSingleSelfCover,
            player.stats.ctfNew.soloCapture.total,
            player.stats.ctfNew.soloCapture.bestLife,
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async getCarryTimes(matchId){

        const query = `SELECT 
        player_id,playtime,flag_carry_time,flag_carry_time_best,flag_capture,flag_assist,
        flag_capture_best,flag_assist_best
        FROM 
        nstats_player_ctf_match WHERE match_id=?`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    async bMatchCTF(matchId){
 
        const query = `SELECT COUNT(*) as total_players FROM nstats_player_ctf_match WHERE match_id=?`;
        const result = await mysql.simpleQuery(query, [matchId]);

        if(result[0].total_players > 0) return true;

        return false;
        
    }

    async getMatchCTFData(matchId, playerIds){

        if(playerIds.length === 0) return {};

        const query = "SELECT * FROM nstats_player_ctf_match WHERE match_id=? AND player_id IN(?)";

        const result =  await mysql.simpleQuery(query, [matchId, playerIds]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            data[result[i].player_id] = result[i];
        }

        return data;
    }

    async setMatchCTFData(matchId, players){

        //console.log(players);

        const playerIds = players.map((player) =>{
            return player.player_id;
        });


        const ctfData = await this.getMatchCTFData(matchId, playerIds);

        for(let i = 0; i < players.length; i++){

            const p = players[i];

            if(ctfData[p.player_id] !== undefined){
                p.ctfData = ctfData[p.player_id];
            }
        }
    }

    addCRKill(eventType, matchId, matchDate, mapId, capId, timestamp, playerId, playerTeam, kills){

        //insertCRKills

        const vars = [
            matchId, matchDate, mapId, capId, eventType, timestamp, playerId, playerTeam, kills
        ];

        this.crKills.push(vars);
    }

    async insertCRKills(){

        const query = "INSERT INTO nstats_ctf_cr_kills (match_id,match_date,map_id,cap_id,event_type,timestamp,player_id,player_team,total_events) VALUES ?";

        await mysql.bulkInsert(query, this.crKills);
    }

    /*async insertCRKills(eventType, matchId, matchDate, mapId, capId, timestamp, playerId, playerTeam, kills){

        const query = `INSERT INTO nstats_ctf_cr_kills VALUES(NULL,?,?,?,?,?,?,?,?,?)`;

        const vars = [matchId, matchDate, mapId, capId, eventType, timestamp, playerId, playerTeam, kills];

        return await mysql.simpleQuery(query, vars);
    }*/

    async getCapFragEvents(matchId, option){

        let extra = "";

        if(option === undefined){
            option = "only-capped";
        }

        if(option === "only-capped"){
            extra = "AND cap_id != -1";
        }

        if(option === "only-returns"){
            extra = "AND cap_id = -1";
        }

        const query = `SELECT cap_id,event_type,timestamp,player_id,player_team,total_events 
        FROM nstats_ctf_cr_kills WHERE match_id=? ${extra} ORDER BY timestamp ASC`;

        const result = await mysql.simpleQuery(query, [matchId]);

        const killsByTimestamp = {};
        const suicidesByTimestamp = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            const timestamp = (r.event_type === 0) ? killsByTimestamp : suicidesByTimestamp;

            if(timestamp[r.timestamp] === undefined){
                timestamp[r.timestamp] = [];
            }

            timestamp[r.timestamp].push(r);
        }

        return {"kills": killsByTimestamp, "suicides": suicidesByTimestamp};
    }

    async bPlayerBestValuesExist(playerId, gametypeId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_ctf_best WHERE player_id=? AND gametype_id=?`;

        const result = await mysql.simpleQuery(query, [playerId, gametypeId]);

        if(result[0].total_matches > 0) return true;

        return false;
    }

    async createPlayerBestValues(playerId, gametypeId){

        const query = `INSERT INTO nstats_player_ctf_best VALUES(NULL,?,?,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0)`;

        return await mysql.simpleQuery(query, [playerId, gametypeId]);
    }

    async updatePlayerBestValues(playerId, gametypeId, stats){

        if(!await this.bPlayerBestValuesExist(playerId, gametypeId)){

            await this.createPlayerBestValues(playerId, gametypeId);
        }

        const query = `UPDATE nstats_player_ctf_best SET
        flag_assist = IF(flag_assist < ?, ?, flag_assist),
        flag_return = IF(flag_return < ?, ?, flag_return),
        flag_return_base = IF(flag_return_base < ?, ?, flag_return_base),
        flag_return_mid = IF(flag_return_mid < ?, ?, flag_return_mid),
        flag_return_enemy_base = IF(flag_return_enemy_base < ?, ?, flag_return_enemy_base),
        flag_return_save = IF(flag_return_save < ?, ?, flag_return_save),
        flag_dropped = IF(flag_dropped < ?, ?, flag_dropped),
        flag_kill = IF(flag_kill < ?, ?, flag_kill),
        flag_suicide = IF(flag_suicide < ?, ?, flag_suicide),
        flag_seal = IF(flag_seal < ?, ?, flag_seal),
        flag_seal_pass = IF(flag_seal_pass < ?, ?, flag_seal_pass),
        flag_seal_fail = IF(flag_seal_fail < ?, ?, flag_seal_fail),
        best_single_seal = IF(best_single_seal < ?, ?, best_single_seal),
        flag_cover = IF(flag_cover < ?, ?, flag_cover),
        flag_cover_pass = IF(flag_cover_pass < ?, ?, flag_cover_pass),
        flag_cover_fail = IF(flag_cover_fail < ?, ?, flag_cover_fail),
        flag_cover_multi = IF(flag_cover_multi < ?, ?, flag_cover_multi),
        flag_cover_spree = IF(flag_cover_spree < ?, ?, flag_cover_spree),
        best_single_cover = IF(best_single_cover < ?, ?, best_single_cover),
        flag_capture = IF(flag_capture < ?, ?, flag_capture),
        flag_carry_time = IF(flag_carry_time < ?, ?, flag_carry_time),
        flag_taken = IF(flag_taken < ?, ?, flag_taken),
        flag_pickup = IF(flag_pickup < ?, ?, flag_pickup),
        flag_self_cover = IF(flag_self_cover < ?, ?, flag_self_cover),
        flag_self_cover_pass = IF(flag_self_cover_pass < ?, ?, flag_self_cover_pass),
        flag_self_cover_fail = IF(flag_self_cover_fail < ?, ?, flag_self_cover_fail),
        best_single_self_cover = IF(best_single_self_cover < ?, ?, best_single_self_cover),
        flag_solo_capture = IF(flag_solo_capture < ?, ?, flag_solo_capture)
        WHERE player_id=? AND gametype_id=?`;

        const vars = [
            stats.assist.total, stats.assist.total,
            stats.return.total, stats.return.total,
            stats.returnBase.total, stats.returnBase.total,
            stats.returnMid.total, stats.returnMid.total,
            stats.returnEnemyBase.total, stats.returnEnemyBase.total,
            stats.returnSave.total, stats.returnSave.total,
            stats.dropped.total, stats.dropped.total,
            stats.kill.total, stats.kill.total,
            stats.suicide.total, stats.suicide.total,
            stats.seal.total, stats.seal.total,
            stats.sealPass.total, stats.sealPass.total,
            stats.sealFail.total, stats.sealFail.total,
            stats.bestSingleSeal, stats.bestSingleSeal,
            stats.cover.total, stats.cover.total,
            stats.coverPass.total, stats.coverPass.total,
            stats.coverFail.total, stats.coverFail.total,
            stats.coverMulti.total, stats.coverMulti.total,
            stats.coverSpree.total, stats.coverSpree.total,
            stats.bestSingleCover, stats.bestSingleCover,
            stats.capture.total, stats.capture.total,
            stats.carryTime.total, stats.carryTime.total,
            stats.taken.total, stats.taken.total,
            stats.pickup.total, stats.pickup.total,
            stats.selfCover.total, stats.selfCover.total,
            stats.selfCoverPass.total, stats.selfCoverPass.total,
            stats.selfCoverFail.total, stats.selfCoverFail.total,
            stats.bestSingleSelfCover, stats.bestSingleSelfCover,
            stats.soloCapture.total, stats.soloCapture.total,
            playerId, gametypeId
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async bPlayerBestValuesSingleLifeExist(playerId, gametypeId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_ctf_best_life WHERE player_id=? AND gametype_id=?`;

        const result = await mysql.simpleQuery(query, [playerId, gametypeId]);

        if(result[0].total_matches > 0) return true;

        return false;
    }

    async createPlayerBestValuesSingleLife(playerId, gametypeId){

        const query = `INSERT INTO nstats_player_ctf_best_life VALUES(NULL,?,?,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0)`;

        return await mysql.simpleQuery(query, [playerId, gametypeId]);
    }

    async updatePlayerBestValuesSingleLife(playerId, gametypeId, stats){

        if(!await this.bPlayerBestValuesSingleLifeExist(playerId, gametypeId)){

            await this.createPlayerBestValuesSingleLife(playerId, gametypeId);
        }

        const query = `UPDATE nstats_player_ctf_best_life SET
        flag_assist = IF(flag_assist < ?, ?, flag_assist),
        flag_return = IF(flag_return < ?, ?, flag_return),
        flag_return_base = IF(flag_return_base < ?, ?, flag_return_base),
        flag_return_mid = IF(flag_return_mid < ?, ?, flag_return_mid),
        flag_return_enemy_base = IF(flag_return_enemy_base < ?, ?, flag_return_enemy_base),
        flag_return_save = IF(flag_return_save < ?, ?, flag_return_save),
        flag_dropped = IF(flag_dropped < ?, ?, flag_dropped),
        flag_kill = IF(flag_kill < ?, ?, flag_kill),
        flag_seal = IF(flag_seal < ?, ?, flag_seal),
        flag_seal_pass = IF(flag_seal_pass < ?, ?, flag_seal_pass),
        flag_seal_fail = IF(flag_seal_fail < ?, ?, flag_seal_fail),
        best_single_seal = IF(best_single_seal < ?, ?, best_single_seal),
        flag_cover = IF(flag_cover < ?, ?, flag_cover),
        flag_cover_pass = IF(flag_cover_pass < ?, ?, flag_cover_pass),
        flag_cover_fail = IF(flag_cover_fail < ?, ?, flag_cover_fail),
        flag_cover_multi = IF(flag_cover_multi < ?, ?, flag_cover_multi),
        flag_cover_spree = IF(flag_cover_spree < ?, ?, flag_cover_spree),
        best_single_cover = IF(best_single_cover < ?, ?, best_single_cover),
        flag_capture = IF(flag_capture < ?, ?, flag_capture),
        flag_carry_time = IF(flag_carry_time < ?, ?, flag_carry_time),
        flag_taken = IF(flag_taken < ?, ?, flag_taken),
        flag_pickup = IF(flag_pickup < ?, ?, flag_pickup),
        flag_self_cover = IF(flag_self_cover < ?, ?, flag_self_cover),
        flag_self_cover_pass = IF(flag_self_cover_pass < ?, ?, flag_self_cover_pass),
        flag_self_cover_fail = IF(flag_self_cover_fail < ?, ?, flag_self_cover_fail),
        best_single_self_cover = IF(best_single_self_cover < ?, ?, best_single_self_cover),
        flag_solo_capture = IF(flag_solo_capture < ?, ?, flag_solo_capture)
        WHERE player_id=? AND gametype_id=?`;

        const vars = [
            stats.assist.bestLife, stats.assist.bestLife,
            stats.return.bestLife, stats.return.bestLife,
            stats.returnBase.bestLife, stats.returnBase.bestLife,
            stats.returnMid.bestLife, stats.returnMid.bestLife,
            stats.returnEnemyBase.bestLife, stats.returnEnemyBase.bestLife,
            stats.returnSave.bestLife, stats.returnSave.bestLife,
            stats.dropped.bestLife, stats.dropped.bestLife,
            stats.kill.bestLife, stats.kill.bestLife,
            stats.seal.bestLife, stats.seal.bestLife,
            stats.sealPass.bestLife, stats.sealPass.bestLife,
            stats.sealFail.bestLife, stats.sealFail.bestLife,
            stats.bestSingleSeal, stats.bestSingleSeal,
            stats.cover.bestLife, stats.cover.bestLife,
            stats.coverPass.bestLife, stats.coverPass.bestLife,
            stats.coverFail.bestLife, stats.coverFail.bestLife,
            stats.coverMulti.bestLife, stats.coverMulti.bestLife,
            stats.coverSpree.bestLife, stats.coverSpree.bestLife,
            stats.bestSingleCover, stats.bestSingleCover,
            stats.capture.bestLife, stats.capture.bestLife,
            stats.carryTime.bestLife, stats.carryTime.bestLife,
            stats.taken.bestLife, stats.taken.bestLife,
            stats.pickup.bestLife, stats.pickup.bestLife,
            stats.selfCover.bestLife, stats.selfCover.bestLife,
            stats.selfCoverPass.bestLife, stats.selfCoverPass.bestLife,
            stats.selfCoverFail.bestLife, stats.selfCoverFail.bestLife,
            stats.bestSingleSelfCover, stats.bestSingleSelfCover,
            stats.soloCapture.bestLife, stats.soloCapture.bestLife,
            playerId, gametypeId
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async getPlayerTotals(playerId){

        const query = `SELECT * FROM nstats_player_ctf_totals WHERE player_id=? ORDER BY playtime DESC`;
        return await mysql.simpleQuery(query, [playerId]);
    }

    async getPlayerBestValues(playerId){

        const query = `SELECT * FROM nstats_player_ctf_best WHERE player_id=?`;
        return await mysql.simpleQuery(query, [playerId]);
    }

    async getPlayerBestSingleLifeValues(playerId){

        const query = `SELECT * FROM nstats_player_ctf_best_life WHERE player_id=?`;
        return await mysql.simpleQuery(query, [playerId]);
    }


    async bMapHaveRecord(mapId, gametypeId, capType){

        const query = `SELECT COUNT(*) as total_records FROM nstats_ctf_cap_records WHERE map_id=? AND gametype_id=? AND cap_type=?`;

        const result = await mysql.simpleQuery(query, [mapId, gametypeId, capType]);

        if(result[0].total_records > 0) return true;

        return false;
    }

    async insertNewCapRecord(capId, mapId, matchId, gametypeId, capType, travelTime, carryTime, dropTime){

        const query = `INSERT INTO nstats_ctf_cap_records VALUES(NULL,?,?,?,?,?,?,?,?)`;

        return await mysql.simpleQuery(query, [capId, mapId, gametypeId, matchId, travelTime, carryTime, dropTime, capType]);
    }

    async getMapCurrentRecordTime(mapId, gametypeId, capType){

        const query = `SELECT travel_time FROM nstats_ctf_cap_records WHERE map_id=? AND gametype_id=? AND cap_type=?`;

        const result = await mysql.simpleQuery(query, [mapId, gametypeId, capType]);

        if(result.length > 0){
            return result[0].travel_time;
        }

        return null;
    }

    async updateCapRecord(capId, mapId, matchId, gametypeId, capType, travelTime, carryTime, dropTime){

        const query = `UPDATE nstats_ctf_cap_records SET cap_id=?, match_id=?, travel_time=?, carry_time=?, drop_time=?
        WHERE map_id=? AND gametype_id=? AND cap_type=?`;

        const vars = [
            capId, 
            matchId, 
            travelTime, 
            carryTime, 
            dropTime,
            mapId,
            gametypeId,
            capType
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updateMapCapRecord(capId, mapId, matchId, gametypeId, capType, travelTime, carryTime, dropTime){

        if(!await this.bMapHaveRecord(mapId, gametypeId, capType)){
            await this.insertNewCapRecord(capId, mapId, matchId, gametypeId, capType, travelTime, carryTime, dropTime);
        }

        const currentCapRecord = await this.getMapCurrentRecordTime(mapId, gametypeId, capType);
  
        if(currentCapRecord === null){

            new Message("CTF.updateMapCapRecord() currentCapRecord is null","error");
            return;
        }

        if(travelTime < currentCapRecord){
            new Message(`New cap record for map ${mapId} type ${capType} travelTime ${travelTime}`,"note");
            await this.updateCapRecord(capId, mapId, matchId, gametypeId, capType, travelTime, carryTime, dropTime);
        }


        //all time record no matter what gametype
        if(gametypeId !== 0){
            return this.updateMapCapRecord(capId, mapId, matchId, 0, capType, travelTime, carryTime, dropTime);
        }
    }


    //if gametypeId is undefined or 0 just get all time best time
    async getAllMapRecords(gametypeId){

        if(gametypeId === undefined) gametypeId = 0;

        const query = `SELECT * FROM nstats_ctf_cap_records WHERE gametype_id=?`;

        const result = await mysql.simpleQuery(query, [gametypeId]);

        const soloCaps = [];
        const assistCaps = [];
        const mapIds = new Set();
        const gametypeIds = new Set();
        const matchIds = new Set();
        const capIds = new Set();

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            mapIds.add(r.map_id);
            gametypeIds.add(r.gametype_id);
            matchIds.add(r.match_id);
            capIds.add(r.cap_id);
            

            if(r.cap_type === 0) soloCaps.push(r);
            if(r.cap_type === 1) assistCaps.push(r);
        }

        return {
            "soloCaps": soloCaps, 
            "assistCaps": assistCaps, 
            "mapIds": [...mapIds], 
            "gametypeIds": [...gametypeIds],
            "matchIds": [...matchIds],
            "capIds": [...capIds]
        }
    }


    async getMapFastestCapTime(gametypeId, mapId, type){

        const query = `SELECT travel_time FROM nstats_ctf_cap_records WHERE gametype_id=? AND map_id=? AND cap_type=?`;

        const result = await mysql.simpleQuery(query, [gametypeId, mapId, type]);

        if(result.length === 0) return 0;

        return result[0].travel_time;
    }

    async getSingleMapCapRecords(gametypeId, mapId, type, page, perPage){

        const query = `SELECT * FROM nstats_ctf_caps 
        WHERE ${(gametypeId === 0) ? "" : "gametype_id=? AND"} map_id=? 
        AND total_assists${(type === "solo") ? " = 0" : " > 0"}
        ORDER BY travel_time ASC LIMIT ?, ?`;

        const totalsQuery = `SELECT COUNT(*) as unique_caps FROM nstats_ctf_caps 
        WHERE ${(gametypeId === 0) ? "" : "gametype_id=? AND"} map_id=? 
        AND total_assists${(type === "solo") ? " = 0" : " > 0"}`;

        page--;
        if(page < 0) page = 0;     

        let start = perPage * page;
        if(start < 0) start = 0;

        const vars = [mapId, start, perPage];
        if(gametypeId !== 0) vars.unshift(gametypeId);

        const result = await mysql.simpleQuery(query, vars);

        const capIds = new Set();
        const uniquePlayers = new Set();
        const matchIds = new Set();

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            capIds.add(r.id);

            uniquePlayers.add(r.grab_player);
            uniquePlayers.add(r.cap_player);
            matchIds.add(r.match_id);
        }

        const assistedPlayers = await this.getAssistedPlayers([...capIds]);

        for(let i = 0; i < assistedPlayers.uniquePlayers.length; i++){

            const p = assistedPlayers.uniquePlayers[i];
            uniquePlayers.add(p);
        }

        if(type === "assist"){

            for(let i = 0; i < result.length; i++){

                const r = result[i];
                r.assistPlayers = [...new Set(assistedPlayers.assists[r.id])] ?? [];       
            }
        }

        const totalResults = await mysql.simpleQuery(totalsQuery, vars);
        const overalMapRecord = await this.getMapFastestCapTime(gametypeId, mapId, (type === "solo") ? 0 : 1);

        return {
            "caps": result, 
            "uniquePlayers": [...uniquePlayers], 
            "capIds": [...capIds], 
            "matchIds": [...matchIds],
            "totalResults": totalResults[0].unique_caps,
            "mapRecordTime": overalMapRecord
        };
    }

    async getCaps(capIds){

        if(capIds.length === 0) return {};

        const query = `SELECT * FROM nstats_ctf_caps WHERE id IN(?)`;

        const result = await mysql.simpleQuery(query, [capIds]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = r;
            delete data[r.id].id;
        }

        return data;
    }

    async getAssistedPlayers(capIds){

        if(capIds.length === 0) return {"assists": {}, "uniquePlayers": []};

        const query = `SELECT cap_id,player_id FROM nstats_ctf_assists WHERE cap_id IN(?)`;
        const result = await mysql.simpleQuery(query, [capIds]);

        const found = {};

        const uniquePlayers = new Set();
        
        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(found[r.cap_id] === undefined) found[r.cap_id] = [];
            found[r.cap_id].push(r.player_id);

            uniquePlayers.add(r.player_id);
        }
        
        return {"assists": found, "uniquePlayers": [...uniquePlayers]};
    }



    async getMapSoloCaps(mapId, page, perPage){

        const query = `SELECT id,match_id,match_date,cap_team,flag_team,cap_player,travel_time,carry_time,drop_time 
        FROM nstats_ctf_caps WHERE map_id=? AND total_assists=0 ORDER BY travel_time ASC LIMIT ?, ?`;

        const start = page * perPage;
        const vars = [mapId, start, perPage];

        const result = await mysql.simpleQuery(query, vars);

        const playerIds = new Set();

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            playerIds.add(r.cap_player);
        }

        return {"caps": result, "playerIds": playerIds};
    }

    async getMapAssistedCaps(mapId, page, perPage){

        const query = `SELECT id,match_id,match_date,cap_team,flag_team,grab_player,cap_player,travel_time,carry_time,drop_time 
        FROM nstats_ctf_caps WHERE map_id=? AND total_assists>0 ORDER BY travel_time ASC LIMIT ?, ?`;

        const start = page * perPage;
        const vars = [mapId, start, perPage];

        const result = await mysql.simpleQuery(query, vars);

        const playerIds = new Set();

        const caps = {};

        const capIds = result.map((row) =>{
            
            caps[row.id] = Object.assign({},row);
            delete caps[row.id].id;
            playerIds.add(row.grab_player);
            playerIds.add(row.cap_player);

            return row.id;
        });
        
        return {"caps": caps, "capIds": capIds, "playerIds": playerIds};
    }

    async getMapTotalCaps(mapId, capType){

        const soloQuery = `SELECT COUNT(*) as total_matches FROM nstats_ctf_caps WHERE map_id=? AND total_assists=0`;
        const assistQuery = `SELECT COUNT(*) as total_matches FROM nstats_ctf_caps WHERE map_id=? AND total_assists>0`;

        const query = (capType === "solo") ? soloQuery : assistQuery;

        const result = await mysql.simpleQuery(query, [mapId]);

        return result[0].total_matches;
    }

    async getMapCaps(mapId, mode, page, perPage){

        page = page - 1;
        if(page < 0) page = 0;
        if(perPage < 5 || perPage > 100) perPage = 10;

        if(mode === "solo"){
            return await this.getMapSoloCaps(mapId, page, perPage);
        }

        const {caps, capIds, playerIds} = await this.getMapAssistedCaps(mapId, page, perPage);

        const assistDetails = await this.getAssistedPlayers(capIds);

        for(let i = 0; i < assistDetails.uniquePlayers.length; i++){
            playerIds.add(assistDetails.uniquePlayers[i]);
        }

        delete assistDetails.uniquePlayers;

        return {"caps": caps, "assistData": assistDetails.assists, "playerIds": playerIds};
    }



    async changeAssistPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_assists SET player_id=? WHERE player_id=?`;

        return await mysql.simpleQuery(query, [newId, oldId]);
    }

    async changeCapPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_caps SET
        grab_player = IF(grab_player = ?, ?, grab_player),
        cap_player = IF(cap_player = ?, ?, cap_player)`;

        const vars = [
            oldId, newId,
            oldId, newId
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async changeCarryPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_carry_times SET
        player_id = IF(player_id = ?, ?, player_id)`;

        return await mysql.simpleQuery(query, [oldId, newId]);
    }

    async changeCoverPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_covers SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        return await mysql.simpleQuery(query, [oldId, newId, oldId, newId]);
    }

    async changeCapReturnKillPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_cr_kills SET player_id = IF(player_id = ?, ?, player_id)`;

        return await mysql.simpleQuery(query, [oldId, newId]);
    }

    async changeEventPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_events SET player = IF(player = ?, ?, player)`;
        return await mysql.simpleQuery(query, [oldId, newId]);
    }

    async changeFlagDeathPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_flag_deaths SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        return await mysql.simpleQuery(query, [oldId, newId, oldId, newId]);
    }

    async changeFlagDropPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_flag_drops SET
        player_id = IF(player_id = ?, ?, player_id)`;

        return await mysql.simpleQuery(query, [oldId, newId]);
    }

    async changeFlagPickupsPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_flag_pickups SET player_id = IF(player_id = ?, ?, player_id)`;
        return await mysql.simpleQuery(query, [oldId, newId]);
    }

    async changeReturnPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_returns SET
        grab_player = IF(grab_player = ?, ?, grab_player),
        return_player = IF(return_player = ?, ?, return_player)`;

        return await mysql.simpleQuery(query, [oldId, newId, oldId, newId]);
    }

    async changeFlagSealsPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_seals SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        return await mysql.simpleQuery(query, [oldId, newId, oldId, newId]);
    }

    async changeFlagSelfCoversPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_self_covers SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        return await mysql.simpleQuery(query, [oldId, newId, oldId, newId]);
    }
    

    async insertNewPlayerBest(playerId, data){

        const query = `INSERT INTO nstats_player_ctf_best VALUES(NULL,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?)`;

        const d = data;

        const vars = [playerId, d.gametype_id,
            d.flag_assist, d.flag_return, d.flag_return_base, d.flag_return_mid, d.flag_return_enemy_base, d.flag_return_save,
            d.flag_dropped, d.flag_kill, d.flag_suicide, d.flag_seal, d.flag_seal_pass, d.flag_seal_fail, d.best_single_seal,
            d.flag_cover, d.flag_cover_pass, d.flag_cover_fail, d.flag_cover_multi, d.flag_cover_spree, d.best_single_cover,
            d.flag_capture, d.flag_carry_time, d.flag_taken, d.flag_pickup, d.flag_self_cover, d.flag_self_cover_pass,
            d.flag_self_cover_fail, d.best_single_self_cover, d.flag_solo_capture,
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async recalculatePlayerBestAllTime(playerId){

        const query = `SELECT
        IFNULL(MAX(flag_assist), 0) as flag_assist,
        IFNULL(MAX(flag_return), 0) as flag_return,
        IFNULL(MAX(flag_return_base), 0) as flag_return_base,
        IFNULL(MAX(flag_return_mid), 0) as flag_return_mid,
        IFNULL(MAX(flag_return_enemy_base), 0) as flag_return_enemy_base,
        IFNULL(MAX(flag_return_save), 0) as flag_return_save,
        IFNULL(MAX(flag_dropped), 0) as flag_dropped,
        IFNULL(MAX(flag_kill), 0) as flag_kill,
        IFNULL(MAX(flag_suicide), 0) as flag_suicide,
        IFNULL(MAX(flag_seal), 0) as flag_seal,
        IFNULL(MAX(flag_seal_pass), 0) as flag_seal_pass,
        IFNULL(MAX(flag_seal_fail), 0) as flag_seal_fail,
        IFNULL(MAX(best_single_seal), 0) as best_single_seal,
        IFNULL(MAX(flag_cover), 0) as flag_cover,
        IFNULL(MAX(flag_cover_pass), 0) as flag_cover_pass,
        IFNULL(MAX(flag_cover_fail), 0) as flag_cover_fail,
        IFNULL(MAX(flag_cover_multi), 0) as flag_cover_multi,
        IFNULL(MAX(flag_cover_spree), 0) as flag_cover_spree,
        IFNULL(MAX(best_single_cover), 0) as best_single_cover,
        IFNULL(MAX(flag_capture), 0) as flag_capture,
        IFNULL(MAX(flag_carry_time), 0) as flag_carry_time,
        IFNULL(MAX(flag_taken), 0) as flag_taken,
        IFNULL(MAX(flag_pickup), 0) as flag_pickup,
        IFNULL(MAX(flag_self_cover), 0) as flag_self_cover,
        IFNULL(MAX(flag_self_cover_pass), 0) as flag_self_cover_pass,
        IFNULL(MAX(flag_self_cover_fail), 0) as flag_self_cover_fail,
        IFNULL(MAX(best_single_self_cover), 0) as best_single_self_cover,
        IFNULL(MAX(flag_solo_capture), 0) as flag_solo_capture
        FROM nstats_player_ctf_match
        WHERE player_id=?`;

        const allTimeBest = await mysql.simpleQuery(query, [playerId]);

        if(allTimeBest.length > 0){
            console.log(`Insert new best for player ${playerId} for gametype 0`);
            allTimeBest[0].gametype_id = 0;
            await this.insertNewPlayerBest(playerId, allTimeBest[0]);
        }else{
            console.log(`Insert new best for player ${playerId} for gametype 0 FAILED`);
        }
    }

    async recalculatePlayerBest(playerId){

        const query = `SELECT
        IFNULL(MAX(flag_assist), 0) as flag_assist,
        IFNULL(MAX(flag_return), 0) as flag_return,
        IFNULL(MAX(flag_return_base), 0) as flag_return_base,
        IFNULL(MAX(flag_return_mid), 0) as flag_return_mid,
        IFNULL(MAX(flag_return_enemy_base), 0) as flag_return_enemy_base,
        IFNULL(MAX(flag_return_save), 0) as flag_return_save,
        IFNULL(MAX(flag_dropped), 0) as flag_dropped,
        IFNULL(MAX(flag_kill), 0) as flag_kill,
        IFNULL(MAX(flag_suicide), 0) as flag_suicide,
        IFNULL(MAX(flag_seal), 0) as flag_seal,
        IFNULL(MAX(flag_seal_pass), 0) as flag_seal_pass,
        IFNULL(MAX(flag_seal_fail), 0) as flag_seal_fail,
        IFNULL(MAX(best_single_seal), 0) as best_single_seal,
        IFNULL(MAX(flag_cover), 0) as flag_cover,
        IFNULL(MAX(flag_cover_pass), 0) as flag_cover_pass,
        IFNULL(MAX(flag_cover_fail), 0) as flag_cover_fail,
        IFNULL(MAX(flag_cover_multi), 0) as flag_cover_multi,
        IFNULL(MAX(flag_cover_spree), 0) as flag_cover_spree,
        IFNULL(MAX(best_single_cover), 0) as best_single_cover,
        IFNULL(MAX(flag_capture), 0) as flag_capture,
        IFNULL(MAX(flag_carry_time), 0) as flag_carry_time,
        IFNULL(MAX(flag_taken), 0) as flag_taken,
        IFNULL(MAX(flag_pickup), 0) as flag_pickup,
        IFNULL(MAX(flag_self_cover), 0) as flag_self_cover,
        IFNULL(MAX(flag_self_cover_pass), 0) as flag_self_cover_pass,
        IFNULL(MAX(flag_self_cover_fail), 0) as flag_self_cover_fail,
        IFNULL(MAX(best_single_self_cover), 0) as best_single_self_cover,
        IFNULL(MAX(flag_solo_capture), 0) as flag_solo_capture,
        gametype_id
        FROM nstats_player_ctf_match
        WHERE player_id=? GROUP BY gametype_id`;

        const result = await mysql.simpleQuery(query, [playerId]);

        for(let i = 0; i < result.length; i++){
            console.log(`isnert new best for player ${playerId} for gametype ${result[i].gametype_id}`);
            await this.insertNewPlayerBest(playerId, result[i]);
        }

        await this.recalculatePlayerBestAllTime(playerId);
    }

    async mergePlayerBest(oldId, newId){

        const query = "DELETE FROM nstats_player_ctf_best WHERE player_id IN (?)";
        await mysql.simpleQuery(query, [newId, oldId]);

        await this.recalculatePlayerBest(newId);
    }

    async insertNewPlayerBestSingleLife(playerId, data){

        const query = `INSERT INTO nstats_player_ctf_best_life VALUES(NULL,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?)`;

        const d = data;

        const vars = [playerId, d.gametype_id,
            d.flag_assist, d.flag_return, d.flag_return_base, d.flag_return_mid, d.flag_return_enemy_base, d.flag_return_save,
            d.flag_dropped, d.flag_kill, d.flag_seal, d.flag_seal_pass, d.flag_seal_fail, d.best_single_seal,
            d.flag_cover, d.flag_cover_pass, d.flag_cover_fail, d.flag_cover_multi, d.flag_cover_spree, d.best_single_cover,
            d.flag_capture, d.flag_carry_time, d.flag_taken, d.flag_pickup, d.flag_self_cover, d.flag_self_cover_pass,
            d.flag_self_cover_fail, d.best_single_self_cover, d.flag_solo_capture,
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async recalculatePlayerBestLifeAllTime(playerId){

        const query = `SELECT
        IFNULL(MAX(flag_assist_best), 0) as flag_assist,
        IFNULL(MAX(flag_return_best), 0) as flag_return,
        IFNULL(MAX(flag_return_base_best), 0) as flag_return_base,
        IFNULL(MAX(flag_return_mid_best), 0) as flag_return_mid,
        IFNULL(MAX(flag_return_enemy_base_best), 0) as flag_return_enemy_base,
        IFNULL(MAX(flag_return_save_best), 0) as flag_return_save,
        IFNULL(MAX(flag_dropped_best), 0) as flag_dropped,
        IFNULL(MAX(flag_kill_best), 0) as flag_kill,
        IFNULL(MAX(flag_seal_best), 0) as flag_seal,
        IFNULL(MAX(flag_seal_pass_best), 0) as flag_seal_pass,
        IFNULL(MAX(flag_seal_fail_best), 0) as flag_seal_fail,
        IFNULL(MAX(best_single_seal), 0) as best_single_seal,
        IFNULL(MAX(flag_cover_best), 0) as flag_cover,
        IFNULL(MAX(flag_cover_pass_best), 0) as flag_cover_pass,
        IFNULL(MAX(flag_cover_fail_best), 0) as flag_cover_fail,
        IFNULL(MAX(flag_cover_multi_best), 0) as flag_cover_multi,
        IFNULL(MAX(flag_cover_spree_best), 0) as flag_cover_spree,
        IFNULL(MAX(best_single_cover), 0) as best_single_cover,
        IFNULL(MAX(flag_capture_best), 0) as flag_capture,
        IFNULL(MAX(flag_carry_time_best), 0) as flag_carry_time,
        IFNULL(MAX(flag_taken_best), 0) as flag_taken,
        IFNULL(MAX(flag_pickup_best), 0) as flag_pickup,
        IFNULL(MAX(flag_self_cover_best), 0) as flag_self_cover,
        IFNULL(MAX(flag_self_cover_pass_best), 0) as flag_self_cover_pass,
        IFNULL(MAX(flag_self_cover_fail_best), 0) as flag_self_cover_fail,
        IFNULL(MAX(best_single_self_cover), 0) as best_single_self_cover,
        IFNULL(MAX(flag_solo_capture_best), 0) as flag_solo_capture
        FROM nstats_player_ctf_match
        WHERE player_id=?`;

        const result = await mysql.simpleQuery(query, [playerId]);

        if(result.length > 0){
            console.log(`Insert new best single life for player ${playerId} for gametype 0`);
            result[0].gametype_id = 0;
            await this.insertNewPlayerBestSingleLife(playerId, result[0]);
        }else{
            console.log(`Insert new best single life for player ${playerId} for gametype 0 FAILED`);
        }

    }

    async recalculatePlayerBestLife(playerId){

        const query = `SELECT
        IFNULL(MAX(flag_assist_best), 0) as flag_assist,
        IFNULL(MAX(flag_return_best), 0) as flag_return,
        IFNULL(MAX(flag_return_base_best), 0) as flag_return_base,
        IFNULL(MAX(flag_return_mid_best), 0) as flag_return_mid,
        IFNULL(MAX(flag_return_enemy_base_best), 0) as flag_return_enemy_base,
        IFNULL(MAX(flag_return_save_best), 0) as flag_return_save,
        IFNULL(MAX(flag_dropped_best), 0) as flag_dropped,
        IFNULL(MAX(flag_kill_best), 0) as flag_kill,
        IFNULL(MAX(flag_seal_best), 0) as flag_seal,
        IFNULL(MAX(flag_seal_pass_best), 0) as flag_seal_pass,
        IFNULL(MAX(flag_seal_fail_best), 0) as flag_seal_fail,
        IFNULL(MAX(best_single_seal), 0) as best_single_seal,
        IFNULL(MAX(flag_cover_best), 0) as flag_cover,
        IFNULL(MAX(flag_cover_pass_best), 0) as flag_cover_pass,
        IFNULL(MAX(flag_cover_fail_best), 0) as flag_cover_fail,
        IFNULL(MAX(flag_cover_multi_best), 0) as flag_cover_multi,
        IFNULL(MAX(flag_cover_spree_best), 0) as flag_cover_spree,
        IFNULL(MAX(best_single_cover), 0) as best_single_cover,
        IFNULL(MAX(flag_capture_best), 0) as flag_capture,
        IFNULL(MAX(flag_carry_time_best), 0) as flag_carry_time,
        IFNULL(MAX(flag_taken_best), 0) as flag_taken,
        IFNULL(MAX(flag_pickup_best), 0) as flag_pickup,
        IFNULL(MAX(flag_self_cover_best), 0) as flag_self_cover,
        IFNULL(MAX(flag_self_cover_pass_best), 0) as flag_self_cover_pass,
        IFNULL(MAX(flag_self_cover_fail_best), 0) as flag_self_cover_fail,
        IFNULL(MAX(best_single_self_cover), 0) as best_single_self_cover,
        IFNULL(MAX(flag_solo_capture_best), 0) as flag_solo_capture,
        gametype_id
        FROM nstats_player_ctf_match
        WHERE player_id=? GROUP BY gametype_id`;

        const result = await mysql.simpleQuery(query, [playerId]);

        for(let i = 0; i < result.length; i++){
            console.log(`isnert new best single life for player ${playerId} for gametype ${result[i].gametype_id}`);
            await this.insertNewPlayerBestSingleLife(playerId, result[i]);
        }

        await this.recalculatePlayerBestLifeAllTime(playerId);

    }
    

    async mergePlayerBestLife(oldId, newId){

        const query = "DELETE FROM nstats_player_ctf_best_life WHERE player_id IN (?)";
        await mysql.simpleQuery(query, [newId, oldId]);

        await this.recalculatePlayerBestLife(newId);
    }


    async insertNewPlayerTotal(playerId, data, gametypeId){

        const query = `INSERT INTO nstats_player_ctf_totals VALUES(NULL,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?)`;

        const d = data;

        const vars = [
            playerId, gametypeId, d.total_matches,
            d.playtime, d.flag_assist, d.flag_return, d.flag_return_base, d.flag_return_mid,
            d.flag_return_enemy_base, d.flag_return_save, d.flag_dropped, d.flag_kill, d.flag_suicide,
            d.flag_seal, d.flag_seal_pass, d.flag_seal_fail, d.best_single_seal,
            d.flag_cover, d.flag_cover_pass, d.flag_cover_fail, d.flag_cover_multi, d.flag_cover_spree,
            d.best_single_cover, d.flag_capture, d.flag_carry_time, d.flag_taken, d.flag_pickup,
            d.flag_self_cover, d.flag_self_cover_pass, d.flag_self_cover_fail, d.best_single_self_cover,
            d.flag_solo_capture
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async recalculatePlayerTotalsAllTime(newId){

        const query = `SELECT
        COUNT(*) as total_matches,
        IFNULL(SUM(playtime), 0) as playtime,
        IFNULL(SUM(flag_assist), 0) as flag_assist,
        IFNULL(SUM(flag_return), 0) as flag_return,
        IFNULL(SUM(flag_return_base), 0) as flag_return_base,
        IFNULL(SUM(flag_return_mid), 0) as flag_return_mid,
        IFNULL(SUM(flag_return_enemy_base), 0) as flag_return_enemy_base,
        IFNULL(SUM(flag_return_save), 0) as flag_return_save,
        IFNULL(SUM(flag_dropped), 0) as flag_dropped,
        IFNULL(SUM(flag_kill), 0) as flag_kill,
        IFNULL(SUM(flag_suicide), 0) as flag_suicide,
        IFNULL(SUM(flag_seal), 0) as flag_seal,
        IFNULL(SUM(flag_seal_pass), 0) as flag_seal_pass,
        IFNULL(SUM(flag_seal_fail), 0) as flag_seal_fail,
        IFNULL(MAX(best_single_seal), 0) as best_single_seal,
        IFNULL(SUM(flag_cover), 0) as flag_cover,
        IFNULL(SUM(flag_cover_pass), 0) as flag_cover_pass,
        IFNULL(SUM(flag_cover_fail), 0) as flag_cover_fail,
        IFNULL(SUM(flag_cover_multi), 0) as flag_cover_multi,
        IFNULL(SUM(flag_cover_spree), 0) as flag_cover_spree,
        IFNULL(MAX(best_single_cover), 0) as best_single_cover,
        IFNULL(SUM(flag_capture), 0) as flag_capture,
        IFNULL(SUM(flag_carry_time), 0) as flag_carry_time,
        IFNULL(SUM(flag_taken), 0) as flag_taken,
        IFNULL(SUM(flag_pickup), 0) as flag_pickup,
        IFNULL(SUM(flag_self_cover), 0) as flag_self_cover,
        IFNULL(SUM(flag_self_cover_pass), 0) as flag_self_cover_pass,
        IFNULL(SUM(flag_self_cover_fail), 0) as flag_self_cover_fail,
        IFNULL(MAX(best_single_self_cover), 0) as best_single_self_cover,
        IFNULL(SUM(flag_solo_capture), 0) as flag_solo_capture
        FROM nstats_player_ctf_match
        WHERE player_id=?`

        const result = await mysql.simpleQuery(query, [newId]);

        if(result.length > 0){
            console.log(`Inserting new playe rtotal for player ${newId} for gametype ${0}`);
            await this.insertNewPlayerTotal(newId, result[0], 0);
        }else{
            console.log("You should not see this.");
        }
    }

    async recalculatePlayerTotals(oldId, newId){

        const deleteQuery = `DELETE FROM nstats_player_ctf_totals WHERE player_id IN (?)`;

        await mysql.simpleQuery(deleteQuery, [[oldId, newId]]);


        const query = `SELECT
        COUNT(*) as total_matches,
        SUM(playtime) as playtime,
        SUM(flag_assist) as flag_assist,
        SUM(flag_return) as flag_return,
        SUM(flag_return_base) as flag_return_base,
        SUM(flag_return_mid) as flag_return_mid,
        SUM(flag_return_enemy_base) as flag_return_enemy_base,
        SUM(flag_return_save) as flag_return_save,
        SUM(flag_dropped) as flag_dropped,
        SUM(flag_kill) as flag_kill,
        SUM(flag_suicide) as flag_suicide,
        SUM(flag_seal) as flag_seal,
        SUM(flag_seal_pass) as flag_seal_pass,
        SUM(flag_seal_fail) as flag_seal_fail,
        MAX(best_single_seal) as best_single_seal,
        SUM(flag_cover) as flag_cover,
        SUM(flag_cover_pass) as flag_cover_pass,
        SUM(flag_cover_fail) as flag_cover_fail,
        SUM(flag_cover_multi) as flag_cover_multi,
        SUM(flag_cover_spree) as flag_cover_spree,
        MAX(best_single_cover) as best_single_cover,
        SUM(flag_capture) as flag_capture,
        SUM(flag_carry_time) as flag_carry_time,
        SUM(flag_taken) as flag_taken,
        SUM(flag_pickup) as flag_pickup,
        SUM(flag_self_cover) as flag_self_cover,
        SUM(flag_self_cover_pass) as flag_self_cover_pass,
        SUM(flag_self_cover_fail) as flag_self_cover_fail,
        MAX(best_single_self_cover) as best_single_self_cover,
        SUM(flag_solo_capture) as flag_solo_capture,
        gametype_id
        FROM nstats_player_ctf_match
        WHERE player_id=? GROUP BY gametype_id`


        const result = await mysql.simpleQuery(query, [newId]);

        for(let i = 0; i < result.length; i++){

            console.log(`Inserting new playe rtotal for player ${newId} for gametype ${result[i].gametype_id}`);
            await this.insertNewPlayerTotal(newId, result[i], result[i].gametype_id);
        }

        await this.recalculatePlayerTotalsAllTime(newId);
    }


    async getDuplicatePlayerMatchIds(playerId){

        const query = `SELECT COUNT(*) as total_entries, match_id FROM nstats_player_ctf_match WHERE player_id=? GROUP BY match_id ORDER BY total_entries DESC`;

        const result = await mysql.simpleQuery(query, [playerId]);

        const duplicateIds = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            if(r.total_entries < 2) break;
            
            duplicateIds.push(r.match_id);
        }

        return duplicateIds;
    }

    async getPlayerMatchDataDuplicate(matchId, playerId){

        const query = `SELECT
        SUM(playtime) as playtime,
        SUM(flag_assist) as flag_assist,
        MAX(flag_assist_best) as flag_assist_best,
        SUM(flag_return) as flag_return,
        MAX(flag_return_best) as flag_return_best,
        SUM(flag_return_base) as flag_return_base,
        MAX(flag_return_base_best) as flag_return_base_best,
        SUM(flag_return_mid) as flag_return_mid,
        MAX(flag_return_mid_best) as flag_return_mid_best,
        SUM(flag_return_enemy_base) as flag_return_enemy_base,
        MAX(flag_return_enemy_base_best) as flag_return_enemy_base_best,
        SUM(flag_return_save) as flag_return_save,
        MAX(flag_return_save_best) as flag_return_save_best,
        SUM(flag_dropped) as flag_dropped,
        MAX(flag_dropped_best) as flag_dropped_best,
        SUM(flag_kill) as flag_kill,
        MAX(flag_kill_best) as flag_kill_best,
        SUM(flag_suicide) as flag_suicide,
        SUM(flag_seal) as flag_seal,
        MAX(flag_seal_best) as flag_seal_best,
        SUM(flag_seal_pass) as flag_seal_pass,
        MAX(flag_seal_pass_best) as flag_seal_pass_best,
        SUM(flag_seal_fail) as flag_seal_fail,
        MAX(flag_seal_fail_best) as flag_seal_fail_best,
        MAX(best_single_seal) as best_single_seal,
        SUM(flag_cover) as flag_cover,
        MAX(flag_cover_best) as flag_cover_best,
        SUM(flag_cover_pass) as flag_cover_pass,
        MAX(flag_cover_pass_best) as flag_cover_pass_best,
        SUM(flag_cover_fail) as flag_cover_fail,
        MAX(flag_cover_fail_best) as flag_cover_fail_best,
        SUM(flag_cover_multi) as flag_cover_multi,
        MAX(flag_cover_multi_best) as flag_cover_multi_best,
        SUM(flag_cover_spree) as flag_cover_spree,
        MAX(flag_cover_spree_best) as flag_cover_spree_best,
        MAX(best_single_cover) as best_single_cover,
        SUM(flag_capture) as flag_capture,
        MAX(flag_capture_best) as flag_capture_best,
        SUM(flag_carry_time) as flag_carry_time,
        MAX(flag_carry_time_best) as flag_carry_time_best,
        SUM(flag_taken) as flag_taken,
        MAX(flag_taken_best) as flag_taken_best,
        SUM(flag_pickup) as flag_pickup,
        MAX(flag_pickup_best) as flag_pickup_best,
        SUM(flag_self_cover) as flag_self_cover,
        MAX(flag_self_cover_best) as flag_self_cover_best,
        SUM(flag_self_cover_pass) as flag_self_cover_pass,
        MAX(flag_self_cover_pass_best) as flag_self_cover_pass_best,
        SUM(flag_self_cover_fail) as flag_self_cover_fail,
        MAX(flag_self_cover_fail_best) as flag_self_cover_fail_best,
        MAX(best_single_self_cover) as best_single_self_cover,
        SUM(flag_solo_capture) as flag_solo_capture,
        MAX(flag_solo_capture_best) as flag_solo_capture_best
        FROM nstats_player_ctf_match
        WHERE player_id=? AND match_id=?`;

        const result = await mysql.simpleQuery(query, [playerId, matchId]);

        if(result.length > 0) return result[0];

        return null;
    }

    async deletePlayerMatchData(matchId, playerId){

        const query = `DELETE FROM nstats_player_ctf_match WHERE match_id=? AND player_id=?`;

        return await mysql.simpleQuery(query, [matchId, playerId]);
    }

    async insertPlayerMatchDataFromMerge(matchId, playerId, data){

        const query = `INSERT INTO nstats_player_ctf_match VALUES(NULL,?,?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,
            ?,?,?,?,
            ?,?,?,?,
            ?,?,?,
            ?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,
            ?,?,?,?)`;

        const d = data;

        const vars = [
            playerId, matchId, d.gametype_id, d.server_id, d.map_id, d.match_date,
            d.playtime, d.flag_assist, d.flag_assist_best, d.flag_return, d.flag_return_best,
            d.flag_return_base, d.flag_return_base_best, d.flag_return_mid, d.flag_return_mid_best,
            d.flag_return_enemy_base, d.flag_return_enemy_base_best, d.flag_return_save, d.flag_return_save_best,
            d.flag_dropped, d.flag_dropped_best, d.flag_kill, d.flag_kill_best, d.flag_suicide,
            d.flag_seal, d.flag_seal_best, d.flag_seal_pass, d.flag_seal_pass_best,
            d.flag_seal_fail, d.flag_seal_fail_best, d.best_single_seal,
            d.flag_cover, d.flag_cover_best, d.flag_cover_pass, d.flag_cover_pass_best,
            d.flag_cover_fail, d.flag_cover_fail_best,  d.flag_cover_multi, d.flag_cover_multi_best,
            d.flag_cover_spree, d.flag_cover_spree_best, d.best_single_cover,
            d.flag_capture, d.flag_capture_best, d.flag_carry_time, d.flag_carry_time_best,
            d.flag_taken, d.flag_taken_best, d.flag_pickup, d.flag_pickup_best, d.flag_self_cover,
            d.flag_self_cover_best, d.flag_self_cover_pass, d.flag_self_cover_pass_best,
            d.flag_self_cover_fail, d.flag_self_cover_fail_best, d.best_single_self_cover,
            d.flag_solo_capture, d.flag_solo_capture_best
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async mergePlayerMatchData(oldId, newId, matchManager){

        const query = `UPDATE nstats_player_ctf_match SET player_id=? WHERE player_id=?`;
        await mysql.simpleQuery(query, [newId, oldId]);

        const duplicateMatchIds = await this.getDuplicatePlayerMatchIds(newId);

        const basicMatchInfo = await matchManager.getMatchBasicInfo(duplicateMatchIds);

        for(let i = 0; i < duplicateMatchIds.length; i++){

            const d = duplicateMatchIds[i];

            const mergedData = await this.getPlayerMatchDataDuplicate(d, newId);
            //const gametypeId = await this.

            await this.deletePlayerMatchData(d, newId);

            if(basicMatchInfo[d] !== undefined){

                mergedData.gametype_id = basicMatchInfo[d].gametype ?? -1 //;basicMatchInfo[d].gametype ?? -1;
                mergedData.map_id = basicMatchInfo[d].map ?? -1;
                mergedData.match_date = basicMatchInfo[d].date ?? -1;
                mergedData.server_id = basicMatchInfo[d].server ?? -1;
            }else{
                mergedData.gametype_id = -1;
                mergedData.map_id = -1;
                mergedData.match_date = -1;
                mergedData.server_id = -1;
            }

            await this.insertPlayerMatchDataFromMerge(d, newId, mergedData);
        }
    }


    async mergePlayers(oldId, newId, matchManager){

        await this.changeAssistPlayerIds(oldId, newId);
        await this.changeCapPlayerIds(oldId, newId);
        await this.changeCarryPlayerIds(oldId, newId);
        await this.changeCoverPlayerIds(oldId, newId);
        await this.changeCapReturnKillPlayerIds(oldId, newId);
        await this.changeEventPlayerIds(oldId, newId);
        await this.changeFlagDeathPlayerIds(oldId, newId);
        await this.changeFlagDropPlayerIds(oldId, newId);
        await this.changeFlagDeathPlayerIds(oldId, newId);
        await this.changeReturnPlayerIds(oldId, newId);
        await this.changeFlagSealsPlayerIds(oldId, newId);
        await this.changeFlagSelfCoversPlayerIds(oldId, newId);
        await this.mergePlayerMatchData(oldId, newId, matchManager);
        await this.mergePlayerBest(oldId, newId);
        await this.mergePlayerBestLife(oldId, newId);
        await this.recalculatePlayerTotals(oldId, newId);
    }

    async bulkInsertFlagPickups(vars){

        const query = `INSERT INTO nstats_ctf_flag_pickups (match_id, match_date, map_id, cap_id, timestamp, player_id, player_team, flag_team) VALUES ?`;

        return await mysql.bulkInsert(query, vars);
    }

    async bulkInsertSelfCovers(vars){

        const query = `INSERT INTO nstats_ctf_self_covers (match_id, match_date, map_id, cap_id, timestamp, killer_id, killer_team, victim_id) VALUES ?`;
        return await mysql.bulkInsert(query, vars);
    }


    async getGrabAndCapPlayers(capIds){

        if(capIds.length === 0) return {};

        const query = `SELECT id,grab_player,cap_player FROM nstats_ctf_caps WHERE id IN(?)`;

        const result = await mysql.simpleQuery(query, [capIds]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = {
                "grab": r.grab_player,
                "cap": r.cap_player
            }
        }

        return data;
    }



    async changeCapTableGametypes(oldId, newId){

        const query = `UPDATE nstats_ctf_caps SET gametype_id=? WHERE gametype_id=?`;

        return await mysql.simpleQuery(query, [newId, oldId]);
    }

    async changeCapRecordTableGametypes(oldId, newId){

        const query = `UPDATE nstats_ctf_cap_records SET gametype_id=? WHERE gametype_id=?`;
        return await mysql.simpleQuery(query, [newId, oldId]);
    }


    async getDuplicateMapCapRecords(gametype, capType){

        const query = `SELECT map_id,COUNT(*) as total_records FROM nstats_ctf_cap_records WHERE gametype_id=? AND cap_type=? GROUP BY map_id`;

        const result = await mysql.simpleQuery(query, [gametype, capType]);
   
        const data = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            //console.log(r);
            if(r.total_records <= 1) continue;
            data.push(r.map_id);
        }
        

        return data;
    }

    async getMapGametypeCapRecordId(gametypeId, mapId, capType){
        
        capType = parseInt(capType);

        if(capType !== capType){
            throw new Error(`capType must be 0 or 1`);
        }

        const query = `SELECT id FROM nstats_ctf_cap_records WHERE gametype_id=? AND map_id=? AND cap_type=? ORDER BY travel_time ASC LIMIT 1`;

        const result = await mysql.simpleQuery(query, [gametypeId, mapId, capType]);

        if(result.length > 0){
            return result[0].id;
        }

        return -1;
        
    }


    /**
     * 
     * @param {*} gametypeId 
     * @param {*} mapId 
     * @param {*} ignoreId The id of the record we don't want to delete(the current record)
     */
    async deleteDuplicateMapCapRecords(gametypeId, mapId, capType, ignoreId){

        const query = `DELETE FROM nstats_ctf_cap_records WHERE gametype_id=? AND map_id=? AND cap_type=? AND id!=?`;

        return await mysql.simpleQuery(query, [gametypeId, mapId, capType, ignoreId]);
    }

    async fixDuplicateMapCapRecordsOfType(gametypeId, capType){

        const capDuplicates = await this.getDuplicateMapCapRecords(gametypeId, capType);

        console.log(`Found ${capDuplicates.length} duplicate for capType ${capType} for gametype ${gametypeId}`);

        for(let i = 0; i < capDuplicates.length; i++){

            const mapId = capDuplicates[i];

            const currentCapRecord = await this.getMapGametypeCapRecordId(gametypeId, mapId, capType);

            if(currentCapRecord === -1){
                new Message(`Couldn't find map record.`,"warning");
                continue;
            }

            await this.deleteDuplicateMapCapRecords(gametypeId, mapId, capType, currentCapRecord);
        }
    }

    async fixDuplicateMapCapRecords(gametypeId){

        await this.fixDuplicateMapCapRecordsOfType(gametypeId, 0);
        await this.fixDuplicateMapCapRecordsOfType(gametypeId, 1);
    }

    async mergeCTFBest(oldId, newId){

        const query = `UPDATE nstats_player_ctf_best SET gametype_id=? WHERE gametype_id=?`;

        return await mysql.simpleQuery(query, [newId, oldId]);
    }

    async getDuplicatePlayerBestRecordIds(gametypeId){

        const query = `SELECT player_id,COUNT(*) total_results FROM nstats_player_ctf_best WHERE gametype_id=? GROUP BY player_id`;

        const result = await mysql.simpleQuery(query, [gametypeId]);

        const duplicates = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.total_results <= 1) continue;
            duplicates.push(r.player_id);
        }

        return duplicates;
    }

    async deletePlayerCTFBestRecords(playerId, gametypeId){

        const query = `DELETE FROM nstats_player_ctf_best WHERE player_id=? AND gametype_id=?`;

        return await mysql.simpleQuery(query, [playerId, gametypeId]);
    }

    async fixDuplicatePlayerBestRecords(playerId, gametypeId){

        const query = `SELECT gametype_id,
        SUM(flag_assist) as flag_assist,
        SUM(flag_return) as flag_return,
        SUM(flag_return_base) as flag_return_base,
        SUM(flag_return_mid) as flag_return_mid,
        SUM(flag_return_enemy_base) as flag_return_enemy_base,
        SUM(flag_return_save) as flag_return_save,
        SUM(flag_dropped) as flag_dropped,
        SUM(flag_kill) as flag_kill,
        SUM(flag_suicide) as flag_suicide,
        SUM(flag_seal) as flag_seal,
        SUM(flag_seal_pass) as flag_seal_pass,
        SUM(flag_seal_fail) as flag_seal_fail,
        MAX(best_single_seal) as best_single_seal,
        SUM(flag_cover) as flag_cover,
        SUM(flag_cover_pass) as flag_cover_pass,
        SUM(flag_cover_fail) as flag_cover_fail,
        SUM(flag_cover_multi) as flag_cover_multi,
        SUM(flag_cover_spree) as flag_cover_spree,
        MAX(best_single_cover) as best_single_cover,
        SUM(flag_capture) as flag_capture,
        SUM(flag_carry_time) as flag_carry_time,
        SUM(flag_taken) as flag_taken,
        SUM(flag_pickup) as flag_pickup,
        SUM(flag_self_cover) as flag_self_cover,
        SUM(flag_self_cover_pass) as flag_self_cover_pass,
        SUM(flag_self_cover_fail) as flag_self_cover_fail,
        MAX(best_single_self_cover) as best_single_self_cover,
        SUM(flag_solo_capture) as flag_solo_capture
        FROM nstats_player_ctf_best WHERE player_id=? AND gametype_id=?`;

        const result = await mysql.simpleQuery(query, [playerId, gametypeId]);

        if(result.length === 0){
            new Message(`ctf.fixDuplicatePlayerBestRecords result is empty`,"error");
            return;
        }

        await this.deletePlayerCTFBestRecords(playerId, gametypeId);
        await this.insertNewPlayerBest(playerId, result[0]);

    }

    async fixDuplicatePlayersBestRecords(gametypeId){

        const duplicatePlayerIds = await this.getDuplicatePlayerBestRecordIds(gametypeId);

        for(let i = 0; i < duplicatePlayerIds.length; i++){

            const playerId = duplicatePlayerIds[i];

            await this.fixDuplicatePlayerBestRecords(playerId, gametypeId);
        }
    }

    async mergeGametypes(oldId, newId){

        await this.changeCapTableGametypes(oldId, newId);

        await this.changeCapRecordTableGametypes(oldId, newId);

        await this.fixDuplicateMapCapRecords(newId);
        //need to check for duplicate cap records and only save the fastest

        await this.mergeCTFBest(oldId, newId);
        await this.fixDuplicatePlayerBestRecords(newId);

        //TODO change gametype ids, check for duplicates for gametypes, then merge the two together
        /**
         * player_ctf_best
         * player_ctf_best_life
         * player_ctf_match
         * player_ctf_totals
         */
    }
}


module.exports = CTF;