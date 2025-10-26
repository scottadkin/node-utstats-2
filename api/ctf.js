import { simpleQuery, bulkInsert } from "./database.js";
import Message from "./message.js";
import { getTeamName, getPlayer, sanatizePage, sanatizePerPage } from "./generic.mjs";
import { getObjectName } from "./genericServerSide.mjs";
import { getBasicPlayersByIds } from "./players.js";

export default class CTF{

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

    async bPlayerTotalsExist(playerId, gametypeId, mapId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_ctf_totals WHERE player_id=? AND gametype_id=? AND map_id=?`;

        const result = await simpleQuery(query, [playerId, gametypeId, mapId]);

        if(result[0].total_matches > 0) return true;

        return false;
    }

    async createPlayerTotals(playerId, gametypeId, mapId){

        const query = `INSERT INTO nstats_player_ctf_totals VALUES(NULL,?,?,
            ?,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0)`;

        return await simpleQuery(query, [playerId, gametypeId, mapId]);
    }

    async updatePlayerTotals(playerId, gametypeId, mapId, playtime, stats){

        if(!await this.bPlayerTotalsExist(playerId, gametypeId, mapId)){
            await this.createPlayerTotals(playerId, gametypeId, mapId);
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
        WHERE player_id=? AND gametype_id=? AND map_id=?`;


        //29th?
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
            stats.bestSingleSelfCover, stats.bestSingleSelfCover,
            stats.soloCapture.total,

            playerId, gametypeId, mapId
        ];

        await simpleQuery(query, vars);
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

        return await simpleQuery(query, vars);
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

        const result = await simpleQuery(query, vars);

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

        if(distanceToCap == undefined){
            new Message(`CTF.insertReturn() distanceToCap is ${distanceToCap}`,"warning");
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
            distanceToCap ?? -1,
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

        return await simpleQuery(query, vars);

    }

    async insertAssist(matchId, matchDate, mapId, capId, playerId, pickupTime, droppedTime, carryTime){

        const query = `INSERT INTO nstats_ctf_assists VALUES(NULL,?,?,?,?,?,?,?,?)`;

        const vars = [matchId, matchDate, mapId, capId, playerId, pickupTime, droppedTime, carryTime];

        return await simpleQuery(query, vars);
    }

    /*async insertCover(matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId){

        const query = "INSERT INTO nstats_ctf_covers VALUES(NULL,?,?,?,?,?,?,?,?)";

        const vars = [matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId];

        return await simpleQuery(query, vars);
    }*/

    addCover(matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId){

        this.covers.push([matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId]);
    }

    async bulkInsertFlagCovers(){

        const query = `INSERT INTO nstats_ctf_covers (match_id, match_date, map_id, cap_id, timestamp, killer_id, killer_team, victim_id) VALUES ?`;

        return await bulkInsert(query, this.covers);
    }

    async insertSelfCover(matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId){

        const query = "INSERT INTO nstats_ctf_self_covers VALUES(NULL,?,?,?,?,?,?,?,?)";

        const vars = [matchId, matchDate, mapId, capId, timestamp, killerId, killerTeam, victimId];

        return await simpleQuery(query, vars);
    }

    async insertSeal(matchId, matchDate, mapId, capId, timestamp, killerId, victimId){

        const query = "INSERT INTO nstats_ctf_seals VALUES(NULL,?,?,?,?,?,?,?)";

        const vars = [matchId, matchDate, mapId, capId, timestamp, killerId, victimId];

        return await simpleQuery(query, vars);
    }

    addCarryTime(matchId, matchDate, mapId, capId, flagTeam, playerId, playerTeam, startTime, endTime, carryTime, carryPercent){

        this.carryTimes.push([matchId, matchDate, mapId, capId, flagTeam, playerId, playerTeam, startTime, endTime, carryTime, carryPercent]);
    }

    async insertCarryTimes(){

        const query = "INSERT INTO nstats_ctf_carry_times (match_id,match_date,map_id,cap_id,flag_team,player_id,player_team,start_time,end_time,carry_time,carry_percent) VALUES ?";
        await bulkInsert(query, this.carryTimes);
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

        await bulkInsert(query, this.flagDeaths);
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

        return await bulkInsert(query, this.flagDrops);
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

        return await simpleQuery(query, vars);
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

        return await simpleQuery(query, vars);         
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
        
        await simpleQuery(query, vars);

    }*/



    addEvent(match, timestamp, player, event, team){

        this.eventList.push([match, timestamp, player, event, team]);
    }

    async insertEventList(){

        const query = "INSERT INTO nstats_ctf_events (match_id, timestamp, player, event, team) VALUES ?";

        return await bulkInsert(query, this.eventList);
    }


    async bFlagLocationExists(map, team){

        const query = "SELECT COUNT(*) as total_flags FROM nstats_maps_flags WHERE map=? AND team=?";

        const result = await simpleQuery(query, [map, team]);

        if(result[0].total_flags > 0) return true;
        return false;
    }

    async insertFlagLocationQuery(map, team, position){

        const query = "INSERT INTO nstats_maps_flags VALUES(NULL,?,?,?,?,?)";
        return await simpleQuery(query, [map, team, position.x, position.y, position.z]);
    }

    async insertFlagLocation(map, team, position){

        try{
           
            if(position === null){
                new Message(`Flag location was not found, skipping save location.`,"warning");
                return;
            }

            if(!await this.bFlagLocationExists(map, team)){
                new Message(`Flag location doesn't exists(map = ${map}, team = ${team}), inserting now.`,"note");
                await this.insertFlagLocationQuery(map, team, position);
            }

        }catch(err){
            new Message(`CTF.InsertFlagLocation() ${err}`,"error");
        }
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

    async updateCap(data){

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

        return await simpleQuery(query, vars);
    }

    async updateEvent(data, ignoredPlayer){

        if(data.player !== ignoredPlayer) return;

        const query = "DELETE FROM nstats_ctf_events WHERE id=?";
        await simpleQuery(query, [data.id]);
    }

    async deletePlayerMatchEvents(playerId, matchId){

        const query = "DELETE FROM nstats_ctf_events WHERE match_id=? AND player=?";
        await simpleQuery(query, [matchId, playerId]);
    }

    async deletePlayerMatchAssists(playerId, matchId){

        const query = `DELETE FROM nstats_ctf_assists WHERE player_id=? AND match_id=?`;
        return await simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchAssists(playerId, matchId){

        const query = `UPDATE nstats_ctf_assists SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchCaps(playerId, matchId){

        const query = `UPDATE nstats_ctf_caps SET
        grab_player = IF(grab_player = ?, -1, grab_player),
        cap_player = IF(cap_player = ?, -1, cap_player)
        WHERE match_id=?`;
        return await simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchCarryTimes(playerId, matchId){

        const query = `UPDATE nstats_ctf_carry_times SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchCovers(playerId, matchId){

        const query = `UPDATE nstats_ctf_covers SET
        killer_id = IF(killer_id = ?, -1, killer_id),
        victim_id = IF(victim_id = ?, -1, victim_id)
        WHERE match_id=?`;

        return await simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchCRKills(playerId, matchId){

        const query = `UPDATE nstats_ctf_cr_kills SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchFlagDeaths(playerId, matchId){

        const query = `UPDATE nstats_ctf_flag_deaths SET
        killer_id = IF(killer_id = ?, -1, killer_id),
        victim_id = IF(victim_id = ?, -1, victim_id)
        WHERE match_id=?`;

        return await simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchFlagDrops(playerId, matchId){

        const query = `UPDATE nstats_ctf_flag_drops SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchFlagPickups(playerId, matchId){

        const query = `UPDATE nstats_ctf_flag_pickups SET player_id=-1 WHERE player_id=? AND match_id=?`;
        return await simpleQuery(query, [playerId, matchId]);
    }

    async removePlayerMatchReturns(playerId, matchId){

        const query = `UPDATE nstats_ctf_returns SET
        grab_player = IF(grab_player = ?, -1, grab_player),
        return_player = IF(return_player = ?, -1, return_player)
        WHERE match_id=?`;
        return await simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchSeals(playerId, matchId){

        const query = `UPDATE nstats_ctf_seals SET
        killer_id = IF(killer_id = ?, -1, killer_id),
        victim_id = IF(victim_id = ?, -1, victim_id)
        WHERE match_id=?`;

        return await simpleQuery(query, [playerId, playerId, matchId]);
    }

    async removePlayerMatchSelfCovers(playerId, matchId){

        const query = `UPDATE nstats_ctf_self_covers SET
        killer_id = IF(killer_id = ?, -1, killer_id),
        victim_id = IF(victim_id = ?, -1, victim_id)
        WHERE match_id=?`;

        return await simpleQuery(query, [playerId, playerId, matchId]);
    }

    async deletePlayerMatchStats(playerId, matchId){

        const query = `DELETE FROM nstats_player_ctf_match WHERE player_id=? AND match_id=?`;

        return await simpleQuery(query, [playerId, matchId]);
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

        return await simpleQuery("SELECT * FROM nstats_ctf_caps");
    }

    async getCapDataByMatchIds(ids){

        if(ids.length === 0) return [];

        return await simpleQuery("SELECT * FROM nstats_ctf_caps WHERE match_id IN(?)",[ids]);
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

        return await simpleQuery(query, vars);
    }
    

    
    async deletePlayerEvents(playerId){

        await simpleQuery("DELETE FROM nstats_ctf_events WHERE player=?", [playerId]);
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

        for(let i = 0; i < playersMatchData.length; i++){

            const p = playersMatchData[i];

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


    async getFastestMatchCaps(matchId){

        const query = "SELECT team,grab,cap,assists,travel_time,cap_time FROM nstats_ctf_caps WHERE match_id=? ORDER BY travel_time ASC";

        const result = await simpleQuery(query, [matchId]);

        for(let i = 0; i < result.length; i++){

            result[i].assists = result[i].assists.split(",");
        }

        return result;
    }


    async clearRecords(){

        const query = "DELETE FROM nstats_ctf_cap_records";
        await simpleQuery(query);
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

        return await simpleQuery(query, vars);
    }


    async bMatchCTF(matchId){
 
        const query = `SELECT COUNT(*) as total_players FROM nstats_player_ctf_match WHERE match_id=?`;
        const result = await simpleQuery(query, [matchId]);

        if(result[0].total_players > 0) return true;

        return false;
        
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

        await bulkInsert(query, this.crKills);
    }

    /*async insertCRKills(eventType, matchId, matchDate, mapId, capId, timestamp, playerId, playerTeam, kills){

        const query = `INSERT INTO nstats_ctf_cr_kills VALUES(NULL,?,?,?,?,?,?,?,?,?)`;

        const vars = [matchId, matchDate, mapId, capId, eventType, timestamp, playerId, playerTeam, kills];

        return await simpleQuery(query, vars);
    }*/


    async bPlayerBestValuesExist(playerId, gametypeId, mapId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_ctf_best WHERE player_id=? AND gametype_id=? AND map_id=?`;

        const result = await simpleQuery(query, [playerId, gametypeId, mapId]);

        if(result[0].total_matches > 0) return true;

        return false;
    }

    async createPlayerBestValues(playerId, gametypeId, mapId){

        const query = `INSERT INTO nstats_player_ctf_best VALUES(NULL,?,?,?,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0)`;

        return await simpleQuery(query, [playerId, gametypeId, mapId]);
    }

    async updatePlayerBestValues(playerId, gametypeId, mapId, stats){

        if(!await this.bPlayerBestValuesExist(playerId, gametypeId, mapId)){

            await this.createPlayerBestValues(playerId, gametypeId, mapId);
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
        WHERE player_id=? AND gametype_id=? AND map_id=?`;

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
            playerId, gametypeId, mapId
        ];

        return await simpleQuery(query, vars);
    }


    async bPlayerBestValuesSingleLifeExist(playerId, gametypeId, mapId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_ctf_best_life WHERE player_id=? AND gametype_id=? AND map_id=?`;

        const result = await simpleQuery(query, [playerId, gametypeId, mapId]);

        if(result[0].total_matches > 0) return true;

        return false;
    }

    async createPlayerBestValuesSingleLife(playerId, gametypeId, mapId){

        const query = `INSERT INTO nstats_player_ctf_best_life VALUES(NULL,?,?,?,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0)`;

        return await simpleQuery(query, [playerId, gametypeId, mapId]);
    }

    async updatePlayerBestValuesSingleLife(playerId, gametypeId, mapId, stats){

        if(!await this.bPlayerBestValuesSingleLifeExist(playerId, gametypeId, mapId)){

            await this.createPlayerBestValuesSingleLife(playerId, gametypeId, mapId);
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
        WHERE player_id=? AND gametype_id=? AND map_id=?`;

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
            playerId, gametypeId, mapId
        ];

        return await simpleQuery(query, vars);
    }


    async bMapHaveRecord(mapId, gametypeId, capType){

        const query = `SELECT COUNT(*) as total_records FROM nstats_ctf_cap_records WHERE map_id=? AND gametype_id=? AND cap_type=?`;

        const result = await simpleQuery(query, [mapId, gametypeId, capType]);

        if(result[0].total_records > 0) return true;

        return false;
    }

    async insertNewCapRecord(capId, mapId, matchId, gametypeId, capType, travelTime, carryTime, dropTime){

        return await insertNewCapRecord(capId, mapId, matchId, gametypeId, capType, travelTime, carryTime, dropTime);
    }

    async getMapCurrentRecordTime(mapId, gametypeId, capType){

        const query = `SELECT travel_time FROM nstats_ctf_cap_records WHERE map_id=? AND gametype_id=? AND cap_type=?`;

        const result = await simpleQuery(query, [mapId, gametypeId, capType]);

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

        return await simpleQuery(query, vars);
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

    async getMapFastestCapTime(gametypeId, mapId, type){

        const query = `SELECT travel_time FROM nstats_ctf_cap_records WHERE gametype_id=? AND map_id=? AND cap_type=?`;

        const result = await simpleQuery(query, [gametypeId, mapId, type]);

        if(result.length === 0) return 0;

        return result[0].travel_time;
    }

    async getCaps(capIds){

        if(capIds.length === 0) return {};

        const query = `SELECT * FROM nstats_ctf_caps WHERE id IN(?)`;

        const result = await simpleQuery(query, [capIds]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = r;
            delete data[r.id].id;
        }

        return data;
    }

    async changeAssistPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_assists SET player_id=? WHERE player_id=?`;

        return await simpleQuery(query, [newId, oldId]);
    }

    async changeCapPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_caps SET
        grab_player = IF(grab_player = ?, ?, grab_player),
        cap_player = IF(cap_player = ?, ?, cap_player)`;

        const vars = [
            oldId, newId,
            oldId, newId
        ];

        return await simpleQuery(query, vars);
    }

    async changeCarryPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_carry_times SET
        player_id = IF(player_id = ?, ?, player_id)`;

        return await simpleQuery(query, [oldId, newId]);
    }

    async changeCoverPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_covers SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        return await simpleQuery(query, [oldId, newId, oldId, newId]);
    }

    async changeCapReturnKillPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_cr_kills SET player_id = IF(player_id = ?, ?, player_id)`;

        return await simpleQuery(query, [oldId, newId]);
    }

    async changeEventPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_events SET player = IF(player = ?, ?, player)`;
        return await simpleQuery(query, [oldId, newId]);
    }

    async changeFlagDeathPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_flag_deaths SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        return await simpleQuery(query, [oldId, newId, oldId, newId]);
    }

    async changeFlagDropPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_flag_drops SET
        player_id = IF(player_id = ?, ?, player_id)`;

        return await simpleQuery(query, [oldId, newId]);
    }

    async changeFlagPickupsPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_flag_pickups SET player_id = IF(player_id = ?, ?, player_id)`;
        return await simpleQuery(query, [oldId, newId]);
    }

    async changeReturnPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_returns SET
        grab_player = IF(grab_player = ?, ?, grab_player),
        return_player = IF(return_player = ?, ?, return_player)`;

        return await simpleQuery(query, [oldId, newId, oldId, newId]);
    }

    async changeFlagSealsPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_seals SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        return await simpleQuery(query, [oldId, newId, oldId, newId]);
    }

    async changeFlagSelfCoversPlayerIds(oldId, newId){

        const query = `UPDATE nstats_ctf_self_covers SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        return await simpleQuery(query, [oldId, newId, oldId, newId]);
    }
    

    async mergePlayerBest(oldId, newId){

        const query = "DELETE FROM nstats_player_ctf_best WHERE player_id IN (?)";
        await simpleQuery(query, [newId, oldId]);

       // await recalculatePlayerBest(newId);
    }
    

    async mergePlayerBestLife(oldId, newId){

        const query = "DELETE FROM nstats_player_ctf_best_life WHERE player_id IN (?)";
        await simpleQuery(query, [newId, oldId]);

       // await recalculatePlayerBestLife(newId);
    }


    //used for merge players
    async mergeRecalculatePlayerTotals(oldId, newId){

        const deleteQuery = `DELETE FROM nstats_player_ctf_totals WHERE player_id IN (?)`;

        await simpleQuery(deleteQuery, [[oldId, newId]]);


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


        const result = await simpleQuery(query, [newId]);

        for(let i = 0; i < result.length; i++){

            console.log(`Inserting new player total for player ${newId} for gametype ${result[i].gametype_id}`);
            await this.insertNewPlayerTotal(newId, result[i], result[i].gametype_id);
        }

       // await this.mergeRecalculatePlayerTotalsAllTime(newId);
    }


    async getDuplicatePlayerMatchIds(playerId){

        const query = `SELECT COUNT(*) as total_entries, match_id FROM nstats_player_ctf_match WHERE player_id=? GROUP BY match_id ORDER BY total_entries DESC`;

        const result = await simpleQuery(query, [playerId]);

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

        const result = await simpleQuery(query, [playerId, matchId]);

        if(result.length > 0) return result[0];

        return null;
    }

    async deletePlayerMatchData(matchId, playerId){

        const query = `DELETE FROM nstats_player_ctf_match WHERE match_id=? AND player_id=?`;

        return await simpleQuery(query, [matchId, playerId]);
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

        return await simpleQuery(query, vars);
    }

    async mergePlayerMatchData(oldId, newId, matchManager){

        const query = `UPDATE nstats_player_ctf_match SET player_id=? WHERE player_id=?`;
        await simpleQuery(query, [newId, oldId]);

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
        await this.mergeRecalculatePlayerTotals(oldId, newId);
    }

    async bulkInsertFlagPickups(vars){

        const query = `INSERT INTO nstats_ctf_flag_pickups (match_id, match_date, map_id, cap_id, timestamp, player_id, player_team, flag_team) VALUES ?`;

        return await bulkInsert(query, vars);
    }

    async bulkInsertSelfCovers(vars){

        const query = `INSERT INTO nstats_ctf_self_covers (match_id, match_date, map_id, cap_id, timestamp, killer_id, killer_team, victim_id) VALUES ?`;
        return await bulkInsert(query, vars);
    }


    async getGrabAndCapPlayers(capIds){

        if(capIds.length === 0) return {};

        const query = `SELECT id,grab_player,cap_player FROM nstats_ctf_caps WHERE id IN(?)`;

        const result = await simpleQuery(query, [capIds]);

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

        return await simpleQuery(query, [newId, oldId]);
    }

    async changeCapRecordTableGametypes(oldId, newId){

        const query = `UPDATE nstats_ctf_cap_records SET gametype_id=? WHERE gametype_id=?`;
        return await simpleQuery(query, [newId, oldId]);
    }


    async getDuplicateMapCapRecords(gametype, capType){

        const query = `SELECT map_id,COUNT(*) as total_records FROM nstats_ctf_cap_records WHERE gametype_id=? AND cap_type=? GROUP BY map_id`;

        const result = await simpleQuery(query, [gametype, capType]);
   
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

        const result = await simpleQuery(query, [gametypeId, mapId, capType]);

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

        return await simpleQuery(query, [gametypeId, mapId, capType, ignoreId]);
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

        return await simpleQuery(query, [newId, oldId]);
    }

    async getDuplicatePlayerBestRecordIds(gametypeId, bBestLife){

        if(bBestLife === undefined) bBestLife = false;

        const tableName = (!bBestLife) ? "nstats_player_ctf_best" : "nstats_player_ctf_best_life";

        const query = `SELECT player_id,COUNT(*) total_results FROM ${tableName} WHERE gametype_id=? GROUP BY player_id`;

        const result = await simpleQuery(query, [gametypeId]);

        const duplicates = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.total_results <= 1) continue;
            duplicates.push(r.player_id);
        }

        return duplicates;
    }

    async deletePlayerCTFBestRecords(playerId, gametypeId, bBestLife){

        if(bBestLife === undefined) bBestLife = false;

        const table = (!bBestLife) ? "nstats_player_ctf_best" : "nstats_player_ctf_best_life";

        const query = `DELETE FROM ${table} WHERE player_id=? AND gametype_id=?`;

        return await simpleQuery(query, [playerId, gametypeId]);
    }

    async fixDuplicatePlayerBestRecords(playerId, gametypeId, bBestLife){

        if(bBestLife === undefined) bBestLife = false;

        console.log(`fixDuplicatePlayerBestRecords(${playerId}, ${gametypeId}, ${bBestLife})`);

        const table = (!bBestLife) ? "nstats_player_ctf_best" :"nstats_player_ctf_best_life";

        const query = `SELECT gametype_id,
        MAX(flag_assist) as flag_assist,
        MAX(flag_return) as flag_return,
        MAX(flag_return_base) as flag_return_base,
        MAX(flag_return_mid) as flag_return_mid,
        MAX(flag_return_enemy_base) as flag_return_enemy_base,
        MAX(flag_return_save) as flag_return_save,
        MAX(flag_dropped) as flag_dropped,
        MAX(flag_kill) as flag_kill,
        ${(bBestLife) ? "" : `MAX(flag_suicide) as flag_suicide,`}
        MAX(flag_seal) as flag_seal,
        MAX(flag_seal_pass) as flag_seal_pass,
        MAX(flag_seal_fail) as flag_seal_fail,
        MAX(best_single_seal) as best_single_seal,
        MAX(flag_cover) as flag_cover,
        MAX(flag_cover_pass) as flag_cover_pass,
        MAX(flag_cover_fail) as flag_cover_fail,
        MAX(flag_cover_multi) as flag_cover_multi,
        MAX(flag_cover_spree) as flag_cover_spree,
        MAX(best_single_cover) as best_single_cover,
        MAX(flag_capture) as flag_capture,
        MAX(flag_carry_time) as flag_carry_time,
        MAX(flag_taken) as flag_taken,
        MAX(flag_pickup) as flag_pickup,
        MAX(flag_self_cover) as flag_self_cover,
        MAX(flag_self_cover_pass) as flag_self_cover_pass,
        MAX(flag_self_cover_fail) as flag_self_cover_fail,
        MAX(best_single_self_cover) as best_single_self_cover,
        MAX(flag_solo_capture) as flag_solo_capture
        FROM ${table} WHERE player_id=? AND gametype_id=?`;

        const result = await simpleQuery(query, [playerId, gametypeId]);

        if(result.length === 0){
            new Message(`ctf.fixDuplicatePlayerBestRecords result is empty, bBestLife = ${bBestLife}`,"error");
            return;
        }

        await this.deletePlayerCTFBestRecords(playerId, gametypeId, bBestLife);

        if(!bBestLife){
           // await this.insertNewPlayerBest(playerId, result[0]);
        }else{
            await this.insertNewPlayerBestSingleLife(playerId, result[0]);
        }

    }

    async fixDuplicatePlayersBestRecords(gametypeId){

        const duplicatePlayerIds = await this.getDuplicatePlayerBestRecordIds(gametypeId, false);

        for(let i = 0; i < duplicatePlayerIds.length; i++){

            const playerId = duplicatePlayerIds[i];

            await this.fixDuplicatePlayerBestRecords(playerId, gametypeId, false);
        }
    }


    async fixDuplicatePlayersBestLifeRecords(gametypeId){

        const duplicatePlayerIds = await this.getDuplicatePlayerBestRecordIds(gametypeId, true);

        for(let i = 0; i < duplicatePlayerIds.length; i++){

            const playerId = duplicatePlayerIds[i];

            await this.fixDuplicatePlayerBestRecords(playerId, gametypeId, true);
        }
    }

    async changeMatchDataGamtypeIds(oldId, newId){

        const query = `UPDATE nstats_player_ctf_match SET gametype_id=? WHERE gametype_id=?`;

        return await simpleQuery(query, [newId, oldId]);
    }

    async debugGetTotalsColumnNames(){

        const query = `SHOW COLUMNS FROM nstats_player_ctf_totals`;

        const result = await simpleQuery(query);

        return result.map((c) =>{
            return c.Field;
        });
    }

    async changeTotalsGametypeIds(oldId, newId){

        const query = `UPDATE nstats_player_ctf_totals SET gametype_id=? WHERE gametype_id=?`;

        return await simpleQuery(query, [newId, oldId]);
    }

    async getDuplicateTotalIds(gametypeId){

        const query = `SELECT player_id,COUNT(*) as total_results FROM nstats_player_ctf_totals WHERE gametype_id=? GROUP BY player_id`;

        const result = await simpleQuery(query, [gametypeId]);

        const duplicates = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.total_results < 2) continue;
            duplicates.push(r.player_id);
        }

        return duplicates;
    }


    async deletePlayerTotalData(playerId, gametypeId){

        const query = `DELETE FROM nstats_player_ctf_totals WHERE player_id=? AND gametype_id=?`;

        return await simpleQuery(query, [playerId, gametypeId]);
    }

    async deletePlayerTotalDataAllGametypes(playerId){

        const query = `DELETE FROM nstats_player_ctf_totals WHERE player_id=?`;

        return await simpleQuery(query, [playerId]);
    }

    async mergeTotals(gametypeId){

        const duplicatePlayerIds = await this.getDuplicateTotalIds(gametypeId);

        const query = `SELECT player_id,gametype_id,
        SUM(total_matches) as total_matches,
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
        SUM(flag_solo_capture) as flag_solo_capture
        FROM nstats_player_ctf_totals WHERE player_id=? AND gametype_id=?`;

        for(let i = 0; i < duplicatePlayerIds.length; i++){

            const playerId = duplicatePlayerIds[i];

            const result = await simpleQuery(query, [playerId, gametypeId]);

            if(result.length === 0){
                new Message(`CTF.mergeTotals(${gametypeId}) playerId ${playerId} result = null`,"error");
                continue;
            }

            await this.deletePlayerTotalData(playerId, gametypeId);
            await this.insertNewPlayerTotal(playerId, result[0], gametypeId);
        }
    }

    async mergeGametypes(oldId, newId){

        await this.changeCapTableGametypes(oldId, newId);

        await this.changeCapRecordTableGametypes(oldId, newId);

        await this.fixDuplicateMapCapRecords(newId);
        //need to check for duplicate cap records and only save the fastest

        await this.mergeCTFBest(oldId, newId);
        await this.fixDuplicatePlayerBestRecords(newId);
        await this.fixDuplicatePlayersBestLifeRecords(newId);
        await this.changeMatchDataGamtypeIds(oldId, newId);
        await this.changeTotalsGametypeIds(oldId, newId);
        await this.mergeTotals(newId);

    }

    async getMapCapRecord(mapId, gametypeId, capType){

        const query = `SELECT * FROM nstats_ctf_cap_records WHERE map_id=? AND gametype_id=? AND cap_type=? ORDER BY travel_time DESC LIMIT 1`;

        const result = await simpleQuery(query, [mapId, gametypeId, capType]);

        if(result.length === 0) return null;

        return result[0];
    }

    /**
     * 
     * @param {*} rowId the row that must not be deleted
     * @param {*} mapId target map
     * @param {*} gametypeId target gametype
     * @param {*} capType assist or solo cap(1,0)
     */
    async deleteAllOtherMapCapRecords(rowId, mapId, gametypeId, capType){

        const query = `DELETE FROM nstats_ctf_cap_records WHERE map_id=? AND gametype_id=? AND cap_type=? AND id!=?`;

        return await simpleQuery(query, [mapId, gametypeId, capType, rowId]);

    }

    async mapMergeDeleteDuplicateMapCapRecords(mapId){

        const query = `SELECT COUNT(*) as total_entries,cap_type,gametype_id FROM nstats_ctf_cap_records WHERE map_id=? GROUP BY cap_type,gametype_id`;

        const result = await simpleQuery(query, [mapId]);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            const capRecord = await this.getMapCapRecord(mapId, r.gametype_id, r.cap_type);

            if(capRecord === null) continue;

            await this.deleteAllOtherMapCapRecords(capRecord.id, mapId, r.gametype_id, r.cap_type);
        }
    }


    async deleteDuplicateMapFlags(mapId){

        const getQuery = `SELECT MIN(id) as id, team, COUNT(*) as total_entries FROM nstats_maps_flags WHERE map=? GROUP BY team`;

        const getResult = await simpleQuery(getQuery, [mapId]);

        const cleanResult = getResult.filter((r) =>{
            return r.total_entries > 1;
        });

        if(cleanResult.length === 0) return;

        const deleteQuery = `DELETE FROM nstats_maps_flags WHERE map=? AND team=? AND id!=?`;

        for(let i = 0; i < cleanResult.length; i++){

            const r = cleanResult[i];

            await simpleQuery(deleteQuery, [mapId, r.team, r.id]);
        }
    }

    async changeMapId(oldId, newId){


        const tables = [
            "ctf_assists",
            "ctf_caps",
            "ctf_cap_records",
            "ctf_carry_times",
            "ctf_covers",
            "ctf_cr_kills",
            "ctf_flag_deaths",
            "ctf_flag_drops",
            "ctf_flag_pickups",
            "ctf_returns",
            "ctf_seals",
            "ctf_self_covers",
        ];

        //need to check for duplicate map records and delete the slowest time

        

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const query = `UPDATE nstats_${t} SET map_id=? WHERE map_id=?`;
            await simpleQuery(query, [newId, oldId]);
        }

        await this.mapMergeDeleteDuplicateMapCapRecords(newId);


        //missed flag table

        const flagQuery = `UPDATE nstats_maps_flags SET map=? WHERE map=?`;

        await simpleQuery(flagQuery, [newId, oldId]);

        await this.deleteDuplicateMapFlags(newId);

    }
}



async function getCapsBasicInfo(capIds){

    if(capIds.length === 0) return {};

    const query = `SELECT id,match_id,match_date,grab_player,cap_player,total_drops FROM nstats_ctf_caps WHERE id IN (?)`;

    const result = await simpleQuery(query, [capIds]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        data[r.id] = {
            "matchId": r.match_id,
            "date": r.match_date,
            "grabPlayer": r.grab_player,
            "capPlayer": r.cap_player,
            "totalDrops": r.total_drops
        };
    }

    return data;
}

export async function getCapAssistPlayers(capIds){

    if(capIds.length === 0) return {};

    const query = `SELECT cap_id,player_id FROM nstats_ctf_assists WHERE cap_id IN (?)`;

    const result = await simpleQuery(query, [capIds]);

    const caps = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(caps[r.cap_id] === undefined) caps[r.cap_id] = new Set();

        caps[r.cap_id].add(r.player_id);
    }

    return caps;
}

async function getCapRecordsData(capType, gametypeId){

    let query = `SELECT cap_id,map_id,gametype_id,match_id,travel_time,drop_time FROM nstats_ctf_cap_records WHERE cap_type=?`;

    let where = "";
    const vars = [capType];

    if(gametypeId !== 0){
        where = " AND gametype_id=?";
        vars.push(gametypeId);
    }else{
        where = " AND gametype_id!=0";
    }

    query = `${query} ${where}`;

    return await simpleQuery(query, vars);
}

function getUniqueValuesFromCapRecords(data){

    const gametypeIds = new Set();
    const mapIds = new Set();
    const capIds = new Set();

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        gametypeIds.add(d.gametype_id);
        mapIds.add(d.map_id);
        capIds.add(d.cap_id);
    }

    return {
        "gametypeIds": [...gametypeIds], 
        "mapIds": [...mapIds], 
        "capIds": [...capIds]
    };
}

export async function getAllMapCapRecords(type, gametypeId){

    type = type.toLowerCase();
    gametypeId = parseInt(gametypeId);

    if(type !== "solo" && type !== "assist") type = "solo";

    const capType = (type === "solo") ? 0 : 1 ;

    const result = await getCapRecordsData(capType, gametypeId);

    const {gametypeIds, mapIds, capIds} = getUniqueValuesFromCapRecords(result);

    const gametypeNames = await getObjectName("gametypes", gametypeIds);
    const mapNames = await getObjectName("maps", mapIds);

    const capInfo = await getCapsBasicInfo(capIds);


    const playerIds = new Set();
    let assists = {};

    if(type === "assist"){

        assists = await getCapAssistPlayers([...capIds]);

        for(let assistPlayers of Object.values(assists)){

            const assistPlayerIds = [...assistPlayers];

            for(let x = 0; x < assistPlayerIds.length; x++){
                playerIds.add(assistPlayerIds[x]);
            }    
        }
    }

    for(const capData of Object.values(capInfo)){

        playerIds.add(capData.grabPlayer);
        playerIds.add(capData.capPlayer);
    }

    const playersInfo = await getBasicPlayersByIds([...playerIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        const cap = capInfo[r.cap_id] ?? null;
        
        if(cap === null){
            new Message(`getAllMapCapRecords cap is null.`,"warning");
            continue;
        }

        r.grabPlayer = getPlayer(playersInfo, cap.grabPlayer, true);
        r.capPlayer = getPlayer(playersInfo, cap.capPlayer, true);

        r.grabPlayer.id = cap.grabPlayer;
        r.capPlayer.id = cap.capPlayer;
   
        r.mapName = mapNames[r.map_id] ?? "Not Found";
        r.gametypeName = gametypeNames[r.gametype_id] ?? "Not Found";
        r.date = cap.date;

        r.totalDrops = cap.totalDrops;

        if(type !== "assist") continue;

        if(assists[r.cap_id] === undefined) continue;

        const assistIds = [...assists[r.cap_id]];

        r.assistPlayers = [];

        for(let x = 0; x < assistIds.length; x++){

            const p = getPlayer(playersInfo, assistIds[x], true);
            p.id = assistIds[x];

            r.assistPlayers.push(p);
        }
    }

    result.sort((a, b) =>{

        a = a.mapName.toLowerCase();
        b = b.mapName.toLowerCase();

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    return result;
}

export async function getMapCapTotalEntries(type, mapId, gametypeId){

    mapId = parseInt(mapId);
    gametypeId = parseInt(gametypeId);

    let query = `SELECT COUNT(*) as total_rows FROM nstats_ctf_caps WHERE map_id=?`;
    //wehre total drops=0 for solo and drops>0 for assist
    let where = "";

    if(type === "solo"){      
        where = ` AND total_drops=0`;
    }else if(type === "assist"){
        where = ` AND total_drops>0`;
    }

    const vars = [mapId];

    if(gametypeId !== 0){
        where += ` AND gametype_id=?`;
        vars.push(gametypeId);
    }

    query = `${query} ${where}`;

    const result = await simpleQuery(query, vars);

    return result[0].total_rows;

}

export async function getMapCapEntries(type, mapId, gametypeId, page, perPage){

    mapId = parseInt(mapId);
    gametypeId = parseInt(gametypeId);

    page = sanatizePage(page);
    page--;
    perPage = sanatizePerPage(perPage, 25);

    let query = `SELECT id,match_id,gametype_id,match_date,travel_time,cap_player,grab_player,drop_time FROM nstats_ctf_caps WHERE map_id=?`;
    //wehre total drops=0 for solo and drops>0 for assist
    let where = "";

    if(type === "solo"){      
        where = ` AND total_drops=0`;
    }else if(type === "assist"){
        where = ` AND total_drops>0`;
    }

    const vars = [mapId];

    if(gametypeId !== 0){
        where += ` AND gametype_id=?`;
        vars.push(gametypeId);
    }

    const start = page * perPage;


    query = `${query} ${where} ORDER BY travel_time ASC LIMIT ?, ?`;
    vars.push(start, perPage);

    const result = await simpleQuery(query, vars);

    const gametypeIds = new Set();
    const playerIds = new Set();
    const capIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        gametypeIds.add(r.gametype_id);
        playerIds.add(r.grab_player);
        playerIds.add(r.cap_player);
        capIds.add(r.id);
    }

    let assists = {};

    if(type === "assist"){

        assists = await getCapAssistPlayers([...capIds]);

        for(const aP of Object.values(assists)){

            const assistPlayers = [...aP];

            for(let x = 0; x < assistPlayers.length; x++){
                playerIds.add(assistPlayers[x]);
            }
        }
    }
    

    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    //console.log(gametypeNames);
    const playersInfo = await getBasicPlayersByIds([...playerIds]);

   // console.log(playersInfo);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        r.grabPlayer = getPlayer(playersInfo, r.grab_player, true);
        //r.grabPlayer.id = r.grab_player;
        r.capPlayer = getPlayer(playersInfo, r.cap_player, true);
        //r.capPlayer.id = r.cap_player;
        
        r.gametypeName = gametypeNames[r.gametype_id] ?? "Not Found";

        if(type !== "assist") continue;

        let assistedPlayers = assists[r.id];

        if(assistedPlayers === undefined){
            new Message(`assistedPlayers is null getMapCapEntries`,"warning");
            continue;
        }

        assistedPlayers = [...assistedPlayers];

        r.assistPlayers = [];

        for(let x = 0; x < assistedPlayers.length; x++){

            const pId = assistedPlayers[x];
            const p = getPlayer(playersInfo, pId, true);
            p.id = pId;
            r.assistPlayers.push(p);
        }

    }

    return result;
}


export async function getMapCapFastestTime(type, gametypeId, mapId){

    if(type === "solo"){
        type = 0;
    }else{
        type = 1;
    }

    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);

    let query = `SELECT travel_time FROM nstats_ctf_cap_records WHERE map_id=? AND gametype_id=? AND cap_type=?`;

    const vars = [mapId, gametypeId, type];
   
    const result = await simpleQuery(query, vars);

    if(result.length > 0) return result[0].travel_time;

    return 9999999;
}


export async function getFlagLocations(id){

    const query = "SELECT team,x,y,z FROM nstats_maps_flags WHERE map=?";

    return await simpleQuery(query, [id]);
}


async function getAssistedPlayers(capIds){

        if(capIds.length === 0) return {"assists": {}, "uniquePlayers": []};

        const query = `SELECT cap_id,player_id FROM nstats_ctf_assists WHERE cap_id IN(?)`;
        const result = await simpleQuery(query, [capIds]);

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



async function getMapSoloCaps(mapId, page, perPage){

    const query = `SELECT id,match_id,match_date,cap_team,flag_team,cap_player,travel_time,carry_time,drop_time 
    FROM nstats_ctf_caps WHERE map_id=? AND total_assists=0 ORDER BY travel_time ASC LIMIT ?, ?`;

    const start = page * perPage;
    const vars = [mapId, start, perPage];

    const result = await simpleQuery(query, vars);

    const playerIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        playerIds.add(r.cap_player);
    }

    return {"caps": result, "playerIds": playerIds};
}

async function getMapAssistedCaps(mapId, page, perPage){

    const query = `SELECT id,match_id,match_date,cap_team,flag_team,grab_player,cap_player,travel_time,carry_time,drop_time 
    FROM nstats_ctf_caps WHERE map_id=? AND total_assists>0 ORDER BY travel_time ASC LIMIT ?, ?`;

    const start = page * perPage;
    const vars = [mapId, start, perPage];

    const result = await simpleQuery(query, vars);

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

export async function getMapTotalCaps(mapId, capType){

    const soloQuery = `SELECT COUNT(*) as total_matches FROM nstats_ctf_caps WHERE map_id=? AND total_assists=0`;
    const assistQuery = `SELECT COUNT(*) as total_matches FROM nstats_ctf_caps WHERE map_id=? AND total_assists>0`;

    const query = (capType === "solo") ? soloQuery : assistQuery;

    const result = await simpleQuery(query, [mapId]);

    return result[0].total_matches;
}

export async function getMapCaps(mapId, mode, page, perPage){

    page = page - 1;
    if(page < 0) page = 0;
    if(perPage < 5 || perPage > 100) perPage = 10;

    if(mode === "solo"){
        return await getMapSoloCaps(mapId, page, perPage);
    }

    const {caps, capIds, playerIds} = await getMapAssistedCaps(mapId, page, perPage);

    const assistDetails = await getAssistedPlayers(capIds);

    for(let i = 0; i < assistDetails.uniquePlayers.length; i++){
        playerIds.add(assistDetails.uniquePlayers[i]);
    }

    delete assistDetails.uniquePlayers;

    return {"caps": caps, "assistData": assistDetails.assists, "playerIds": playerIds};
}


export async function bMapHaveCTFCaps(mapId){
    
    const query = `SELECT COUNT(*) as total_caps FROM nstats_ctf_caps WHERE map_id=?`;

    const result = await simpleQuery(query, [mapId]);
    return result[0].total_caps > 0;
}

export async function getPlayerMatchCTFData(matchId, playerIds){

    if(playerIds.length === 0) return {};

    const query = `SELECT 
    player_id,flag_assist,flag_assist_best,flag_return,flag_return_best,
    flag_return_base,flag_return_base_best,flag_return_mid,flag_return_mid_best,
    flag_return_enemy_base,flag_return_enemy_base_best,flag_return_save,flag_return_save_best,
    flag_dropped,flag_dropped_best,flag_kill,flag_kill_best,flag_suicide,
    flag_seal,flag_seal_best,flag_seal_pass,flag_seal_pass_best,flag_seal_fail,
    flag_seal_fail_best,best_single_seal,flag_cover,flag_cover_best,flag_cover_pass,
    flag_cover_pass_best,flag_cover_fail,flag_cover_fail_best,flag_cover_multi,flag_cover_multi_best,
    flag_cover_spree,flag_cover_spree_best,best_single_cover,flag_capture,flag_capture_best,
    flag_carry_time, flag_carry_time_best,flag_taken,flag_taken_best,flag_pickup,flag_pickup_best,
    flag_self_cover,flag_self_cover_best,flag_self_cover_pass,flag_self_cover_pass_best,
    flag_self_cover_fail,flag_self_cover_fail_best,best_single_self_cover,flag_solo_capture,
    flag_solo_capture_best
    FROM nstats_player_ctf_match WHERE match_id=? AND player_id IN(?)`;

    const result =  await simpleQuery(query, [matchId, playerIds]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        data[result[i].player_id] = result[i];
    }

    return data;
}


async function getMapFlags(mapId){

    const query = `SELECT * FROM nstats_maps_flags WHERE map=?`;

    return await simpleQuery(query, [mapId]);
}

export async function getMatchFlagKillDetails(matchId, mapId, playerId){

    const flagBases = await getMapFlags(mapId);

    if(flagBases.length < 2) return {};

    const a = flagBases[0];
    const b = flagBases[1];

    const dX =  a.x - b.x;
    const dY =  a.y - b.y;
    const dZ =  a.z - b.z;
    const distance = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

    if(distance === 0) throw new Error("Flag bases distance is 0");

    let query = `SELECT killer_id,killer_team,victim_id,victim_team,distance_to_cap 
    FROM nstats_ctf_flag_deaths WHERE match_id=? AND victim_id!=-1`;
    const vars = [matchId];
    if(playerId !== -1){
        query += ` AND killer_id=?`;
        vars.push(playerId);
    }

    const result = await simpleQuery(query, vars);

    const data = {};

    //console.log(result);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(data[r.killer_id] === undefined){

            data[r.killer_id] = {
                "closeSave": 0,
                "enemyBase": 0,
                "mid": 0,
                "homeBase": 0,
                "homeFlagStand": 0,
                "far": 0
            };
        }

        const d = data[r.killer_id];

        const dtc = r.distance_to_cap;

        if(dtc <= distance * 0.05){
            d.closeSave++;
        }else if(dtc <= distance * 0.33){
            d.enemyBase++;
        }else if(dtc <= distance * 0.67){
            d.mid++;
        }else if(dtc < distance * 0.95){
            d.homeBase++;
        }else if(dtc >= distance * 0.95 && dtc < distance * 1.05){
            d.homeFlagStand++;
        }else{
            d.far++;
        }
    }

    return data;
}


async function getMatchCovers(matchId, bOnlyCapped, bIgnoreId){

    if(bIgnoreId === undefined) bIgnoreId = false;

    const extra = " AND cap_id!=-1";

    const query = `SELECT ${(bIgnoreId) ? "" :"id,"}cap_id,timestamp,killer_id,victim_id FROM nstats_ctf_covers
    WHERE match_id=? ${(bOnlyCapped) ? extra : ""} ORDER BY timestamp ASC`;

    return await simpleQuery(query, [matchId]);
}

async function getMatchFailedCovers(matchId){

    const query = `SELECT id,timestamp,killer_id,victim_id,killer_team FROM nstats_ctf_covers
    WHERE match_id=? AND cap_id=-1 ORDER BY timestamp ASC`;

    return await simpleQuery(query, [matchId]);
}


async function getMatchSelfCovers(matchId, bOnlyCapped){

    const extra = " AND cap_id!=-1";

    const query = `SELECT id,cap_id,timestamp,killer_id,victim_id FROM nstats_ctf_self_covers
    WHERE match_id=? ${(bOnlyCapped) ? extra : ""} ORDER BY timestamp ASC`;

    return await simpleQuery(query, [matchId]);
}

async function getMatchSeals(matchId, bOnlyCapped){

    const extra = " AND cap_id!=-1";

    const query = `SELECT id,cap_id,timestamp,killer_id,victim_id FROM nstats_ctf_seals
    WHERE match_id=? ${(bOnlyCapped) ? extra : ""} ORDER BY timestamp ASC`;

    return await simpleQuery(query, [matchId]);
}

async function getMatchCarryTimes(matchId, bOnlyCapped){

    const extra = " AND cap_id!=-1";

    const query = `SELECT id,cap_id,flag_team,player_id,player_team,start_time,end_time,carry_time,carry_percent 
    FROM nstats_ctf_carry_times
    WHERE match_id=? ${(bOnlyCapped) ? extra : ""} ORDER BY start_time ASC`;

    return await simpleQuery(query, [matchId]);
}

/**
 * 
 * @param {Number} matchId 
 * @param {String} include all, only-returns, only-capped
 * @returns 
 */
async function getMatchFlagDeaths(matchId, include){

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
    return await simpleQuery(query, [matchId]);
}

/**
 * 
 * @param {Number} matchId 
 * @param {String} include all, only-returns, only-capped
 * @returns 
 */
async function getMatchFlagDrops(matchId, include){

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

    return await simpleQuery(query, [matchId]);
}

async function getMatchFlagPickups(matchId, include){

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

    return await simpleQuery(query, [matchId]);

}

async function getMatchReturns(matchId){

    const query = "SELECT * FROM nstats_ctf_returns WHERE match_id=? ORDER BY return_time ASC";

    return await simpleQuery(query, [matchId]);
}

async function getMatchReturnsInteractiveData(matchId){

    const query = `SELECT flag_team,return_time,return_player,pos_x,pos_y,pos_z FROM nstats_ctf_returns WHERE match_id=? ORDER BY return_time DESC`;

    return await simpleQuery(query, [matchId]);
}

function filterFlagCovers(covers, team, start, end, bSelfCovers){

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

async function getMatchFailedSelfCovers(matchId){

    const query = `SELECT id,timestamp,killer_id,killer_team,victim_id FROM nstats_ctf_self_covers 
    WHERE match_id=? AND cap_id=-1
    ORDER BY timestamp ASC`;

    return await simpleQuery(query, [matchId]);
}

function filterFlagDeaths(deaths, returnData, startKey, endKey){

    return deaths.filter((death) =>{

        const start = returnData[startKey];
        const end = returnData[endKey];
        const time = death.timestamp;

        if(death.victim_team !== returnData.flag_team && time >= start && time <= end){
            return true;
        }
    });
}

function filterFlagDrops(drops, returnData, startTimestampKey, endTimestampKey){
        
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

function filterFlagPickups(pickups, returnData, startKey, endKey){

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

async function getCapFragEvents(matchId, option){

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

    const result = await simpleQuery(query, [matchId]);

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

export async function getMatchDetailedReturns(matchId){

    const returns = await getMatchReturns(matchId);
    const covers = await getMatchFailedCovers(matchId);
    const selfCovers = await getMatchFailedSelfCovers(matchId);
    const flagDeaths = await getMatchFlagDeaths(matchId, "only-returns");
    const flagDrops = await getMatchFlagDrops(matchId, "only-returns");
    const flagPickups = await getMatchFlagPickups(matchId, "only-returns");    
    const teamFrags = await getCapFragEvents(matchId, "only-returns");

    for(let i = 0; i < returns.length; i++){

        const r = returns[i];
        r.coverData = filterFlagCovers(covers, r.flag_team, r.grab_time, r.return_time, false);
        r.selfCoverData = filterFlagCovers(selfCovers, r.flag_team, r.grab_time, r.return_time, true);
        r.deathsData = filterFlagDeaths(flagDeaths, r, "grab_time", "return_time");
        r.flagDrops = filterFlagDrops(flagDrops, r, "grab_time", "return_time");
        r.flagPickups = filterFlagPickups(flagPickups, r, "grab_time", "return_time");

        r.returnKills = teamFrags.kills[r.return_time] ?? []; 
        r.returnSuicides = teamFrags.suicides[r.return_time] ?? []; 
    }

    return returns;
}


export async function getMatchCaps(matchId){

    const query = `SELECT 
    id,cap_team,flag_team,grab_time,grab_player,cap_time,cap_player,
    travel_time,carry_time,carry_time_percent,drop_time,drop_time_percent,
    total_drops,total_pickups,total_covers,total_seals,total_assists,
    total_self_covers,total_deaths,total_suicides,team_0_kills,
    team_1_kills,team_2_kills,team_3_kills,team_0_suicides,
    team_1_suicides,team_2_suicides,team_3_suicides
    FROM nstats_ctf_caps WHERE match_id=? ORDER BY grab_time ASC`;

    return await simpleQuery(query, [matchId]);
}

export async function getMatchAssists(matchId){

    const query = `SELECT id,cap_id,player_id,pickup_time,dropped_time,carry_time 
    FROM nstats_ctf_assists WHERE match_id=? ORDER BY pickup_time ASC`;

    return await simpleQuery(query, [matchId]);
}

function filterByCapId(data, capId){

    return data.filter((d) =>{
        if(d.cap_id === capId) return true;
    });
}

export async function getMatchDetailedCaps(matchId){

    const caps = await getMatchCaps(matchId);
    const assists = await getMatchAssists(matchId);
    const covers = await getMatchCovers(matchId, true);
    const selfCovers = await getMatchSelfCovers(matchId, true);
    const seals = await getMatchSeals(matchId, true);
    const carryTimes = await getMatchCarryTimes(matchId, true);
    const capFragEvents = await getCapFragEvents(matchId, "only-capped");
    const flagDeaths = await getMatchFlagDeaths(matchId, "only-capped");
    const flagDrops = await getMatchFlagDrops(matchId, "only-capped");
    const flagPickups = await getMatchFlagPickups(matchId, "only-capped"); 

    for(let i = 0; i < caps.length; i++){

        const c = caps[i];

        c.coverData = filterByCapId(covers, c.id);
        c.selfCoverData = filterByCapId(selfCovers, c.id);
        c.flagDrops = filterByCapId(flagDrops, c.id);
        c.flagPickups = filterByCapId(flagPickups, c.id);
        c.flagDeaths = filterByCapId(flagDeaths, c.id);
        c.flagAssists = filterByCapId(assists, c.id);
        c.flagSeals = filterByCapId(seals, c.id);
        c.carryTimes = filterByCapId(carryTimes, c.id);

        c.capKills = capFragEvents.kills[c.cap_time] ?? [];
        c.capSuicides = capFragEvents.suicides[c.cap_time] ?? [];
    }

    return caps;
}

export async function getCarryTimes(matchId){

    const query = `SELECT 
    player_id,playtime,flag_carry_time,flag_carry_time_best,flag_capture,flag_assist,
    flag_capture_best,flag_assist_best
    FROM 
    nstats_player_ctf_match WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}

async function getMatchEvents(id){

    const query = "SELECT player,event,team,timestamp FROM nstats_ctf_events WHERE match_id=? ORDER BY timestamp ASC";
    return await simpleQuery(query, [id]);

}

export async function getEventGraphData(id, players, teams){

    const data = await getMatchEvents(id);

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

    const labels = {
        "caps": [],
        "grabs": [],
        "pickups": [],
        "drops": [],
        "kills": [],
        "assists": [],
        "covers": [],
        "returns": [],
        "saves": [],
        "seals": [],
    };

    for(let i = 0; i < players.length; i++/*const [key, value] of Object.entries(players)*/){

        const id = parseInt(players[i].player_id);
        const name = players[i].name;
        playerIndexes.push(id);

        capData.push({"name": name, "values": [0], "lastValue": 0});
        grabData.push({"name": name, "values": [0], "lastValue": 0});
        pickupData.push({"name": name, "values": [0], "lastValue": 0});
        dropData.push({"name": name, "values": [0], "lastValue": 0});
        killData.push({"name": name, "values": [0], "lastValue": 0});
        assistData.push({"name": name, "values": [0], "lastValue": 0});
        coverData.push({"name": name, "values": [0], "lastValue": 0});
        returnData.push({"name": name, "values": [0], "lastValue": 0});
        saveData.push({"name": name, "values": [0], "lastValue": 0});
        sealData.push({"name": name, "values": [0], "lastValue": 0});

    }

    for(let i = 0; i < teams; i++){

        const teamName = getTeamName(i);

        teamsCapData.push({"name": teamName, "values": [0], "lastValue": 0});
        teamsGrabData.push({"name": teamName, "values": [0], "lastValue": 0});
        teamsPickupData.push({"name": teamName, "values": [0], "lastValue": 0});
        teamsDropData.push({"name": teamName, "values": [0], "lastValue": 0});
        teamsKillData.push({"name": teamName, "values": [0], "lastValue": 0});
        teamsAssistData.push({"name": teamName, "values": [0], "lastValue": 0});
        teamsCoverData.push({"name": teamName, "values": [0], "lastValue": 0});
        teamsReturnData.push({"name": teamName, "values": [0], "lastValue": 0});
        teamsSaveData.push({"name": teamName, "values": [0], "lastValue": 0});
        teamsSealData.push({"name": teamName, "values": [0], "lastValue": 0});
    }

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        const playerIndex = playerIndexes.indexOf(d.player);

        const {event, timestamp} = d;

        let current = null;
        let currentTeam = null;
        

        if(event === "captured"){

            current = capData;
            currentTeam = teamsCapData;

            labels.caps.push(timestamp);

        }else if(event === "taken"){

            current = grabData;
            currentTeam = teamsGrabData;

            labels.grabs.push(timestamp);

        }else if(event === "pickedup"){

            current = pickupData;
            currentTeam = teamsPickupData;
            labels.pickups.push(timestamp);

        }else if(event === "dropped"){

            current = dropData;
            currentTeam = teamsDropData;
            labels.drops.push(timestamp);

        }else if(event === "kill"){

            current = killData;
            currentTeam = teamsKillData;
            labels.kills.push(timestamp);

        }else if(event === "assist"){

            current = assistData;
            currentTeam = teamsAssistData;
            labels.assists.push(timestamp);

        }else if(event === "cover"){

            current = coverData;
            currentTeam = teamsCoverData;
            labels.covers.push(timestamp);

        }else if(event === "returned"){

            current = returnData;
            currentTeam = teamsReturnData;
            labels.returns.push(timestamp);

        }else if(event === "save"){

            current = saveData;
            currentTeam = teamsSaveData;
            labels.saves.push(timestamp);

        }else if(event === "seal"){
            
            current = sealData;
            currentTeam = teamsSealData;
            labels.seals.push(timestamp);
        }

        if(current !== null){

            current[playerIndex].lastValue++;

            for(let x = 0; x < playerIndexes.length; x++){
                current[x].values.push(current[x].lastValue);
            }
        }

        if(currentTeam !== null){

            currentTeam[d.team].lastValue++;

            for(let x = 0; x < teams; x++){

                currentTeam[x].values.push(currentTeam[x].lastValue);
            }
        }
    }


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
        "labels": labels,
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

export async function getPlayerMatchReturns(matchId, playerId){

    const query = `SELECT grab_time,return_time,return_string,distance_to_cap,travel_time,carry_time,drop_time 
    FROM nstats_ctf_returns WHERE match_id=? AND return_player=?`;

    return await simpleQuery(query, [matchId, playerId]);
}

async function getPlayerCapCarryTime(capId, playerId){

    const query = `SELECT SUM(carry_time) as total_carry_time, SUM(carry_percent) as total_carry_percent 
    FROM nstats_ctf_carry_times WHERE cap_id=? AND player_id=?`;

    const r = await simpleQuery(query, [capId, playerId]);

    const totalCarryTime = (r[0].total_carry_time === null) ? 0 : r[0].total_carry_time; 
    const totalCarryPercent = (r[0].total_carry_percent === null) ? 0 : r[0].total_carry_percent; 

    return {"carryTime": totalCarryTime, "carryPercent": totalCarryPercent};
}

export async function getPlayerMatchCaps(matchId, playerId){

    const query = `SELECT id,cap_team,flag_team,grab_time,cap_time,travel_time,total_assists 
    FROM nstats_ctf_caps WHERE match_id=? AND cap_player=? ORDER BY cap_time ASC`;

    const caps = await simpleQuery(query, [matchId, playerId]);

    for(let i = 0; i < caps.length; i++){
        
        const c = caps[i];
        c.times = await getPlayerCapCarryTime(c.id, playerId);
    }

    return caps;
}

async function getPlayerTotals(playerId){

    const query = `SELECT * FROM nstats_player_ctf_totals WHERE player_id=? ORDER BY playtime DESC`;
    return await simpleQuery(query, [playerId]);
}

async function getPlayerBestValues(playerId){

    const query = `SELECT * FROM nstats_player_ctf_best WHERE player_id=?`;
    return await simpleQuery(query, [playerId]);
}

async function getPlayerBestSingleLifeValues(playerId){

    const query = `SELECT * FROM nstats_player_ctf_best_life WHERE player_id=?`;
    return await simpleQuery(query, [playerId]);
}


function setProfileNames(data, gametypeNames, mapNames){

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        d.gametypeName = (gametypeNames[d.gametype_id] !== undefined) ? gametypeNames[d.gametype_id] : "Not Found";
        d.mapName = (mapNames[d.map_id] !== undefined) ? mapNames[d.map_id] : "Not Found";
    }
}

export async function getPlayerProfileData(playerId){

    const gametypeIds = new Set();
    const mapIds = new Set();

    const totals = await getPlayerTotals(playerId);
    const best = await getPlayerBestValues(playerId);
    const bestLife = await getPlayerBestSingleLifeValues(playerId);

    for(let i = 0; i < totals.length; i++){
        gametypeIds.add(totals[i].gametype_id);
        mapIds.add(totals[i].map_id);
    }

    for(let i = 0; i < best.length; i++){
        gametypeIds.add(best[i].gametype_id);
        mapIds.add(best[i].map_id);
    }

    for(let i = 0; i < bestLife.length; i++){
        gametypeIds.add(bestLife[i].gametype_id);
        mapIds.add(bestLife[i].map_id);
    }

    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    const mapNames = await getObjectName("maps", [...mapIds]);

    setProfileNames(totals, gametypeNames, mapNames);
    setProfileNames(best, gametypeNames, mapNames);
    setProfileNames(bestLife, gametypeNames, mapNames);
  

    return {"totals": totals, "best": best, "bestLife": bestLife};
}


async function getUniqueRecordCapIds(){

    const query = `SELECT DISTINCT cap_id FROM nstats_ctf_cap_records`;

    const result = await simpleQuery(query);
    
    return result.map((r) =>{
        return r.cap_id;
    })
}

export async function getPlayerSoloCapRecords(playerId){

    const capIds = await getUniqueRecordCapIds();

    if(capIds.length === 0) return null;

    const query = `SELECT gametype_id,map_id,travel_time FROM nstats_ctf_caps 
    WHERE id IN(?) AND cap_player=? AND total_drops=0 ORDER BY travel_time ASC`;
    const result = await simpleQuery(query, [capIds, playerId, playerId]);


    const gametypeIds = new Set();
    const mapIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        gametypeIds.add(r.gametype_id);
        mapIds.add(r.map_id);
    }

    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    const mapNames = await getObjectName("maps", [...mapIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        r.gametypeName = gametypeNames[r.gametype_id] ?? "Not Found";
        r.mapName = mapNames[r.map_id] ?? "Not Found";
    }

    return result;
}

async function deleteMatchesCaps(ids){

    if(ids.length === 0) return;
    const query = "DELETE FROM nstats_ctf_caps WHERE match_id IN (?)";

    await simpleQuery(query, [ids]);
}

async function deleteMatchesEvents(ids){

    if(ids.length === 0) return;

    await simpleQuery("DELETE FROM nstats_ctf_events WHERE match_id IN (?)", [ids]);
}

async function insertNewPlayerBestAfterMatchDelete(playerId, data, gametypeId, mapId){

    const d = data;


    const query = `INSERT INTO nstats_player_ctf_best VALUES(NULL,?,?,
        ?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,
        ?,?,?,?,?,?,
        ?,?,?,?,?,?,
        ?,?,?)`;


    const vars = [playerId, gametypeId, mapId,
        d.flag_assist, d.flag_return, d.flag_return_base, d.flag_return_mid, d.flag_return_enemy_base, d.flag_return_save,
        d.flag_dropped, d.flag_kill, d.flag_suicide, d.flag_seal, d.flag_seal_pass, d.flag_seal_fail, d.best_single_seal,
        d.flag_cover, d.flag_cover_pass, d.flag_cover_fail, d.flag_cover_multi, d.flag_cover_spree, d.best_single_cover,
        d.flag_capture, d.flag_carry_time, d.flag_taken, d.flag_pickup, d.flag_self_cover, d.flag_self_cover_pass,
        d.flag_self_cover_fail, d.best_single_self_cover, d.flag_solo_capture,
    ];

    return await simpleQuery(query, vars);
}



async function insertNewPlayerBestSingleLife(playerId, data, gametypeId, mapId){

    const query = `INSERT INTO nstats_player_ctf_best_life VALUES(NULL,?,?,
        ?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,?,
        ?,?,?)`;

    const d = data;

    const vars = [playerId, gametypeId, mapId,
        d.flag_assist, d.flag_return, d.flag_return_base, d.flag_return_mid, d.flag_return_enemy_base, d.flag_return_save,
        d.flag_dropped, d.flag_kill, d.flag_seal, d.flag_seal_pass, d.flag_seal_fail, d.best_single_seal,
        d.flag_cover, d.flag_cover_pass, d.flag_cover_fail, d.flag_cover_multi, d.flag_cover_spree, d.best_single_cover,
        d.flag_capture, d.flag_carry_time, d.flag_taken, d.flag_pickup, d.flag_self_cover, d.flag_self_cover_pass,
        d.flag_self_cover_fail, d.best_single_self_cover, d.flag_solo_capture,
    ];

    return await simpleQuery(query, vars);
}


export async function deleteMatches(ids){

    await deleteMatchesCaps(ids);
    await deleteMatchesEvents(ids);

    const targetTables = [
        "nstats_ctf_assists",
        "nstats_ctf_carry_times",
        "nstats_ctf_covers",
        "nstats_ctf_cr_kills",
        "nstats_ctf_flag_deaths",
        "nstats_ctf_flag_drops",
        "nstats_ctf_flag_pickups",
        "nstats_ctf_returns",
        "nstats_ctf_seals",
        "nstats_ctf_self_covers",
        "nstats_player_ctf_match"
    ];

    for(let i = 0; i < targetTables.length; i++){

        const t = targetTables[i];

        const query = `DELETE FROM ${t} WHERE match_id IN (?)`;
        await simpleQuery(query, [ids]);
    }
}

async function insertNewPlayerTotal(playerId, data, gametypeId, mapId){

    const query = `INSERT INTO nstats_player_ctf_totals VALUES(NULL,?,?,?,
        ?,?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?)`;

    const d = data;

    const vars = [
        playerId, gametypeId, mapId, d.total_matches,
        d.playtime, d.flag_assist, d.flag_return, d.flag_return_base, d.flag_return_mid,
        d.flag_return_enemy_base, d.flag_return_save, d.flag_dropped, d.flag_kill, d.flag_suicide,
        d.flag_seal, d.flag_seal_pass, d.flag_seal_fail, d.best_single_seal,
        d.flag_cover, d.flag_cover_pass, d.flag_cover_fail, d.flag_cover_multi, d.flag_cover_spree,
        d.best_single_cover, d.flag_capture, d.flag_carry_time, d.flag_taken, d.flag_pickup,
        d.flag_self_cover, d.flag_self_cover_pass, d.flag_self_cover_fail, d.best_single_self_cover,
        d.flag_solo_capture
    ];

    return await simpleQuery(query, vars);
}

async function recalculatePlayerTotalAfterMatchDelete(playerId, gametypeId, mapId){


    const deleteQuery = `DELETE FROM nstats_player_ctf_totals WHERE player_id=? AND gametype_id=? AND map_id=?`;

    await simpleQuery(deleteQuery, [playerId, gametypeId, mapId]);

    let query = `SELECT
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
    SUM(flag_solo_capture) as flag_solo_capture
    FROM nstats_player_ctf_match
    WHERE player_id=?`;

    const vars = [playerId];

    if(gametypeId !== 0){
        vars.push(gametypeId);
        query += ` AND gametype_id=?`;
    }

    if(mapId !== 0){
        vars.push(mapId);
        query += ` AND map_id=?`;
    }

    const result = await simpleQuery(query, vars);


    //ignore spectator matches
    if(result[0].playtime === 0) return;

    await insertNewPlayerTotal(playerId, result[0], gametypeId, mapId);
}

async function recalculatePlayerBestAfterMatchDelete(playerId, gametypeId, mapId){

    const deleteQuery = `DELETE FROM nstats_player_ctf_best WHERE player_id=? AND gametype_id=? AND map_id=?`;

    await simpleQuery(deleteQuery, [playerId, gametypeId, mapId]);

    let query = `SELECT
    IFNULL(SUM(playtime), 0) as playtime,
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
    IFNULL(MAX(flag_suicide), 0) as flag_suicide
    FROM nstats_player_ctf_match
    WHERE player_id=?`;

    const vars = [playerId];

    if(gametypeId !== 0){
        vars.push(gametypeId);
        query += ` AND gametype_id=?`;
    }

    if(mapId !== 0){
        vars.push(mapId);
        query += ` AND map_id=?`;
    }

    const result = await simpleQuery(query, vars);

    if(result[0].playtime === 0) return;

    await insertNewPlayerBestAfterMatchDelete(playerId, result[0], gametypeId, mapId);
}


async function recalculatePlayerBestLifeAfterMatchDelete(playerId, gametypeId, mapId){

    let query = `SELECT 
    IFNULL(SUM(playtime), 0) as playtime,
    IFNULL(MAX(flag_assist), 0) as flag_assist,
    IFNULL(MAX(flag_return), 0) as flag_return,
    IFNULL(MAX(flag_return_base), 0) as flag_return_base,
    IFNULL(MAX(flag_return_mid), 0) as flag_return_mid,
    IFNULL(MAX(flag_return_enemy_base), 0) as flag_return_enemy_base,
    IFNULL(MAX(flag_return_save), 0) as flag_return_save,
    IFNULL(MAX(flag_dropped), 0) as flag_dropped,
    IFNULL(MAX(flag_kill), 0) as flag_kill,
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
    FROM nstats_player_ctf_match WHERE player_id=?`;

    const vars = [playerId];

    if(gametypeId !== 0){
        query += ` AND gametype_id=?`;
        vars.push(gametypeId);
    }

    if(mapId !== 0){
        query += ` AND map_id=?`;
        vars.push(mapId);
    }

    const result = await simpleQuery(query, vars);

    if(result[0].playtime === 0) return;

    await insertNewPlayerBestSingleLife(playerId, result[0], gametypeId, mapId);
}

export async function recalculatePlayers(playerIds, gametypeId, mapId){

    if(playerIds.length === 0) return;


    for(let i = 0; i < playerIds.length; i++){

        const pId = playerIds[i];

        //map & gametype combo
        await recalculatePlayerTotalAfterMatchDelete(pId, gametypeId, mapId);
        await recalculatePlayerBestAfterMatchDelete(pId, gametypeId, mapId);
        await recalculatePlayerBestLifeAfterMatchDelete(pId, gametypeId, mapId);

        //map totals
        await recalculatePlayerTotalAfterMatchDelete(pId, 0, mapId);
        await recalculatePlayerBestAfterMatchDelete(pId, 0, mapId);
        await recalculatePlayerBestLifeAfterMatchDelete(pId, 0, mapId);

        //gametype totals
        await recalculatePlayerTotalAfterMatchDelete(pId, gametypeId, 0);
        await recalculatePlayerBestAfterMatchDelete(pId, gametypeId, 0);
        await recalculatePlayerBestLifeAfterMatchDelete(pId, gametypeId, 0);

        //all time totals
        await recalculatePlayerTotalAfterMatchDelete(pId, 0, 0);
        await recalculatePlayerBestAfterMatchDelete(pId, 0, 0);
        await recalculatePlayerBestLifeAfterMatchDelete(pId, 0, 0);

    }
}

//check if the match_id helds a cap record, recalcultate map cap record if it is
async function bMatchWasCapRecord(matchId, gametypeId, mapId){

    let query = `SELECT COUNT(*) as total_rows FROM nstats_ctf_cap_records WHERE match_id=? AND map_id=?`;

    const vars = [matchId, mapId];

    if(gametypeId !== 0){
        query += ` AND gametype_id=?`;
        vars.push(gametypeId);
    }

    const result = await simpleQuery(query, vars);

    return result[0].total_rows > 0;
}

async function deleteCapRecord(gametypeId, mapId){

    const query = `DELETE FROM nstats_ctf_cap_records WHERE gametype_id=? AND map_id=?`;
    return await simpleQuery(query, [gametypeId, mapId]);
}


async function getCapRecordFromMatchesTable(gametypeId, mapId, bSolo){

    const query = `SELECT id,match_id,travel_time,carry_time,drop_time,total_drops 
    FROM nstats_ctf_caps WHERE ${(gametypeId !== 0) ? "gametype_id=? AND " : ""} map_id=? ${(bSolo) ? "AND total_drops=0" : "AND total_drops>0"}
    ORDER BY travel_time ASC LIMIT 1`;

    const vars = [mapId];
    if(gametypeId !== 0) vars.unshift(gametypeId);

    const result = await simpleQuery(query, vars);

    if(result.length > 0) return result[0];

    return null;
}

async function insertNewCapRecord(capId, mapId, matchId, gametypeId, capType, travelTime, carryTime, dropTime){

    const query = `INSERT INTO nstats_ctf_cap_records VALUES(NULL,?,?,?,?,?,?,?,?)`;

    return await simpleQuery(query, [capId, mapId, gametypeId, matchId, travelTime, carryTime, dropTime, capType]);
}

export async function recalculateCapRecordsAfterMatchDelete(matchId, gametypeId, mapId){
  
    //map gametype combo
    if(await bMatchWasCapRecord(matchId, gametypeId, mapId)){

        await deleteCapRecord(gametypeId, mapId);

        const soloRecord = await getCapRecordFromMatchesTable(gametypeId, mapId, true);
        const assistRecord = await getCapRecordFromMatchesTable(gametypeId, mapId, false)

        if(soloRecord !== null){
            await insertNewCapRecord(soloRecord.id, mapId, matchId, gametypeId, 0, soloRecord.travel_time, soloRecord.carry_time, soloRecord.drop_time);
        }

        if(assistRecord !== null){
            await insertNewCapRecord(assistRecord.id, mapId, matchId, gametypeId, 1, assistRecord.travel_time, assistRecord.carry_time, assistRecord.drop_time);
        }
    }

    //map alltime record
    if(await bMatchWasCapRecord(matchId, 0, mapId)){

        await deleteCapRecord(0, mapId);

        const soloRecord = await getCapRecordFromMatchesTable(0, mapId, true);
        const assistRecord = await getCapRecordFromMatchesTable(0, mapId, false)

        if(soloRecord !== null){
            await insertNewCapRecord(soloRecord.id, mapId, matchId, 0, 0, soloRecord.travel_time, soloRecord.carry_time, soloRecord.drop_time);
        }

        if(assistRecord !== null){
            await insertNewCapRecord(assistRecord.id, mapId, matchId, 0, 1, assistRecord.travel_time, assistRecord.carry_time, assistRecord.drop_time);
        }
    }
}