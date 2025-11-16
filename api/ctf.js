import { simpleQuery, bulkInsert, mysqlGetColumns } from "./database.js";
import Message from "./message.js";
import { getTeamName, getPlayer, sanatizePage, sanatizePerPage } from "./generic.mjs";
import { getObjectName } from "./genericServerSide.mjs";
import { getBasicPlayersByIds } from "./players.js";

const PLAYER_CTF_MATCH_TOTALS_COLUMNS = `COUNT(*) as total_matches,
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
    SUM(flag_solo_capture) as flag_solo_capture`;

const PLAYER_CTF_MATCH_BEST_COLUMNS = `SUM(playtime) as playtime,
    MAX(flag_assist) as flag_assist,
    MAX(flag_return) as flag_return,
    MAX(flag_return_base) as flag_return_base,
    MAX(flag_return_mid) as flag_return_mid,
    MAX(flag_return_enemy_base) as flag_return_enemy_base,
    MAX(flag_return_save) as flag_return_save,
    MAX(flag_dropped) as flag_dropped,
    MAX(flag_kill) as flag_kill,
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
    MAX(flag_solo_capture) as flag_solo_capture,
    MAX(flag_suicide) as flag_suicide`;

const PLAYER_CTF_MATCH_BEST_LIFE_COLUMNS = `SUM(playtime) as playtime,
    MAX(flag_assist_best) as flag_assist,
    MAX(flag_return_best) as flag_return,
    MAX(flag_return_base_best) as flag_return_base,
    MAX(flag_return_mid_best) as flag_return_mid,
    MAX(flag_return_enemy_base_best) as flag_return_enemy_base,
    MAX(flag_return_save_best) as flag_return_save,
    MAX(flag_dropped_best) as flag_dropped,
    MAX(flag_kill_best) as flag_kill,
    MAX(flag_seal_best) as flag_seal,
    MAX(flag_seal_pass_best) as flag_seal_pass,
    MAX(flag_seal_fail_best) as flag_seal_fail,
    MAX(best_single_seal) as best_single_seal,
    MAX(flag_cover_best) as flag_cover,
    MAX(flag_cover_pass_best) as flag_cover_pass,
    MAX(flag_cover_fail_best) as flag_cover_fail,
    MAX(flag_cover_multi_best) as flag_cover_multi,
    MAX(flag_cover_spree_best) as flag_cover_spree,
    MAX(best_single_cover) as best_single_cover,
    MAX(flag_capture_best) as flag_capture,
    MAX(flag_carry_time_best) as flag_carry_time,
    MAX(flag_taken_best) as flag_taken,
    MAX(flag_pickup_best) as flag_pickup,
    MAX(flag_self_cover_best) as flag_self_cover,
    MAX(flag_self_cover_pass_best) as flag_self_cover_pass,
    MAX(flag_self_cover_fail_best) as flag_self_cover_fail,
    MAX(best_single_self_cover) as best_single_self_cover,
    MAX(flag_solo_capture_best) as flag_solo_capture,
    MAX(flag_suicide) as flag_suicide`;

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

            for(let i = 0; i < data.length; i++){

                let d = data[i];

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

        for(let i = 0; i < caps.length; i++){

            const c = caps[i];

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


    async deletePlayerMatchData(matchId, playerId){

        const query = `DELETE FROM nstats_player_ctf_match WHERE match_id=? AND player_id=?`;

        return await simpleQuery(query, [matchId, playerId]);
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

async function deletePlayerType(type, gametypeId, mapId){

    type = type.toLowerCase();

    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);

    if(gametypeId !== gametypeId || mapId !== mapId){
        throw new Error(`Both gametypeId & mapId must be valid integers`);
    }

    if(gametypeId === 0 && mapId === 0){
        throw new Error(`GametypeId or mapId can't both be 0`);
    }

    const types = {
        "totals": "nstats_player_ctf_totals", 
        "best": "nstats_player_ctf_best", 
        "best_life": "nstats_player_ctf_best_life"
    };

    if(types[type] === undefined){
        throw new Error(`not a valid deletePlayerX type (${type})`);
    }

    const table = types[type];


    const query = `DELETE FROM ${table}`;

    const vars = [];
    let where = ``;

    if(gametypeId !== 0){
        where = ` WHERE gametype_id=?`;
        vars.push(gametypeId);
    }

    if(mapId !== 0){

        if(vars.length === 0){
            where = ` WHERE map_id=?`;
        }else{
            where += ` AND map_id=?`
        }

        vars.push(mapId);
    }


    return await simpleQuery(`${query}${where}`, vars);
}

async function deletePlayerTotals(gametypeId, mapId){

    return await deletePlayerType("totals", gametypeId, mapId);

}


async function recalculatePlayerTotal(playerId, gametypeId, mapId){


    const deleteQuery = `DELETE FROM nstats_player_ctf_totals WHERE player_id=? AND gametype_id=? AND map_id=?`;

    await simpleQuery(deleteQuery, [playerId, gametypeId, mapId]);

    let query = `SELECT
    ${PLAYER_CTF_MATCH_TOTALS_COLUMNS}
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

async function recalculatePlayerBest(playerId, gametypeId, mapId){

    const deleteQuery = `DELETE FROM nstats_player_ctf_best WHERE player_id=? AND gametype_id=? AND map_id=?`;

    await simpleQuery(deleteQuery, [playerId, gametypeId, mapId]);

    //is ifnull even needed?
    let query = `SELECT
    ${PLAYER_CTF_MATCH_BEST_COLUMNS}
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

async function deletePlayerBestLife(playerId, gametypeId, mapId){

    let query = `DELETE FROM nstats_player_ctf_best_life WHERE player_id=?`;

    const vars = [playerId];

    if(gametypeId !== 0){
        query += ` AND gametype_id=?`;
        vars.push(gametypeId);
    }

    if(mapId !== 0){
        query += ` AND map_id=?`;
        vars.push(mapId);
    }

    return await simpleQuery(query, vars);
}

async function recalculatePlayerBestLife(playerId, gametypeId, mapId){

    await deletePlayerBestLife();

    let query = `SELECT 
    ${PLAYER_CTF_MATCH_BEST_LIFE_COLUMNS}
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

    if(result[0].playtime === 0){
        return await deletePlayerBestLife(playerId, gametypeId, mapId);
    }

    await insertNewPlayerBestSingleLife(playerId, result[0], gametypeId, mapId);
}


export async function recalculatePlayers(playerIds, gametypeId, mapId){

    if(playerIds.length === 0) return;

    for(let i = 0; i < playerIds.length; i++){

        const pId = playerIds[i];

      
        //gametype totals
        await recalculatePlayerTotal(pId, gametypeId, 0);
        await recalculatePlayerBest(pId, gametypeId, 0);
        await recalculatePlayerBestLife(pId, gametypeId, 0);

        //map & gametype combo
        await recalculatePlayerTotal(pId, gametypeId, mapId);
        await recalculatePlayerBest(pId, gametypeId, mapId);
        await recalculatePlayerBestLife(pId, gametypeId, mapId);

        //map totals
        await recalculatePlayerTotal(pId, 0, mapId);
        await recalculatePlayerBest(pId, 0, mapId);
        await recalculatePlayerBestLife(pId, 0, mapId);


      
        //all time totals
        await recalculatePlayerTotal(pId, 0, 0);
        await recalculatePlayerBest(pId, 0, 0);
        await recalculatePlayerBestLife(pId, 0, 0);
    

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

async function deleteCapRecord(gametypeId, mapId, capType){

    if(capType === undefined) capType = null;


    let query = `DELETE FROM nstats_ctf_cap_records WHERE gametype_id=? AND map_id=?`;

    const vars = [gametypeId, mapId];

    if(capType !== null){

        capType = capType.toLowerCase();

        if(capType !== "solo" && capType !== "assist"){
            throw new Error(`Not a valid cap type`);
        }
        
        query += ` AND cap_type=?`;
        vars.push((capType === "solo") ? 0 : 1);
    }

    return await simpleQuery(query, vars);
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

async function recalculateSoloCapRecord(gametypeId, mapId){
    
    await deleteCapRecord(gametypeId, mapId, "solo");
    const soloRecord = await getCapRecordFromMatchesTable(gametypeId, mapId, true);

    if(soloRecord !== null){
        await insertNewCapRecord(soloRecord.id, mapId, soloRecord.match_id, gametypeId, 0, soloRecord.travel_time, soloRecord.carry_time, soloRecord.drop_time);
    }
}

async function recalculateAssistCapRecord(gametypeId, mapId){

    await deleteCapRecord(gametypeId, mapId, "assist");

    const assistRecord = await getCapRecordFromMatchesTable(gametypeId, mapId, false);

    if(assistRecord !== null){
        await insertNewCapRecord(assistRecord.id, mapId, assistRecord.match_id, gametypeId, 1, assistRecord.travel_time, assistRecord.carry_time, assistRecord.drop_time);
    }
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


async function getPlayerCapRecords(playerId){


    //get gametype and map from cap_records because we have gametype records & gametype + mapRecords
    //ctf_caps does not know if its a gametype alltime record or map gametype combo
    //we won't have to do another check later to see if gametype all time record has been beaten
    const query = `SELECT nstats_ctf_cap_records.id,
    nstats_ctf_cap_records.cap_id,
    nstats_ctf_cap_records.cap_type,
    nstats_ctf_cap_records.gametype_id,
    nstats_ctf_cap_records.map_id,
    nstats_ctf_caps.match_id 
    FROM nstats_ctf_cap_records 
    INNER JOIN nstats_ctf_caps ON nstats_ctf_cap_records.cap_id = nstats_ctf_caps.id
    WHERE nstats_ctf_caps.grab_player=? OR nstats_ctf_caps.cap_player=?`;

    return await simpleQuery(query, [playerId, playerId]);

}

export async function deletePlayerData(playerId){

    //need to fetch this before deleting data so we can check if a map record has been deleted
    const capRecords = await getPlayerCapRecords(playerId);

    const queries = [
        ["DELETE FROM nstats_ctf_assists WHERE player_id=?", [playerId]],
        ["DELETE FROM nstats_ctf_caps WHERE grab_player=? OR cap_player=?", [playerId, playerId]],
        ["DELETE FROM nstats_ctf_carry_times WHERE player_id=?", [playerId]],
        ["DELETE FROM nstats_ctf_covers WHERE killer_id=? OR victim_id=?", [playerId, playerId]],
        ["DELETE FROM nstats_ctf_cr_kills WHERE player_id=?", [playerId]],
        ["DELETE FROM nstats_ctf_events WHERE player=?", [playerId]],
        ["DELETE FROM nstats_ctf_flag_deaths WHERE killer_id=? OR victim_id=?", [playerId, playerId]],
        ["DELETE FROM nstats_ctf_flag_drops WHERE player_id=?", [playerId]],
        ["DELETE FROM nstats_ctf_flag_pickups WHERE player_id=?", [playerId]],
        ["DELETE FROM nstats_ctf_returns WHERE grab_player=? OR return_player=?", [playerId, playerId]],
        ["DELETE FROM nstats_ctf_seals WHERE killer_id=? OR victim_id=?", [playerId, playerId]],
        ["DELETE FROM nstats_ctf_self_covers WHERE killer_id=? OR victim_id=?", [playerId, playerId]],
        ["DELETE FROM nstats_player_ctf_match WHERE player_id=?", [playerId]],
        ["DELETE FROM nstats_player_ctf_best WHERE player_id=?", [playerId]],
        ["DELETE FROM nstats_player_ctf_best_life WHERE player_id=?", [playerId]],
        ["DELETE FROM nstats_player_ctf_totals WHERE player_id=?", [playerId]],
    ];

    for(let i = 0; i < queries.length; i++){

        const q = queries[i];
 
        await simpleQuery(q[0], q[1]);
    }


    for(let i = 0; i < capRecords.length; i++){

        const c = capRecords[i];

        if(c.cap_type === 0){
            await recalculateSoloCapRecord(c.gametype_id, c.map_id);
        }else if(c.cap_type === 1){
            await recalculateAssistCapRecord(c.gametype_id, c.map_id);
        }
    }
}


async function changeMatchGametypes(oldId, newId){

    const query = `UPDATE nstats_player_ctf_match SET gametype_id=? WHERE gametype_id=?`;

    return await simpleQuery(query, [newId, oldId]);

}

async function changeCapGametypes(oldGametypeId, newGametypeId){

    const query = `UPDATE nstats_ctf_caps SET gametype_id=? WHERE gametype_id=?`;

    return await simpleQuery(query, [newGametypeId, oldGametypeId]);
}

async function deleteGametypeCapRecords(gametypeId){

    const query = `DELETE FROM nstats_ctf_cap_records WHERE gametype_id=?`;

    return await simpleQuery(query, [gametypeId]);
}


async function getGametypeUniquePlayedMaps(gametypeId){

    const query = `SELECT DISTINCT map_id FROM nstats_player_ctf_match WHERE gametype_id=?`;

    const result = await simpleQuery(query, [gametypeId]);

    return result.map((r) =>{
        return r.map_id;
    });
}

async function bulkInsertPlayerTotals(data){

    const query = `INSERT INTO nstats_player_ctf_totals (
                                player_id,
        gametype_id,            map_id,
        total_matches,          playtime,
        flag_assist,            flag_return,
        flag_return_base,       flag_return_mid,
        flag_return_enemy_base, flag_return_save,
        flag_dropped,           flag_kill,
        flag_suicide,           flag_seal,
        flag_seal_pass,         flag_seal_fail,
        best_single_seal,       flag_cover,
        flag_cover_pass,        flag_cover_fail,
        flag_cover_multi,       flag_cover_spree,
        best_single_cover,      flag_capture,
        flag_carry_time,        flag_taken,
        flag_pickup,            flag_self_cover,
        flag_self_cover_pass,   flag_self_cover_fail,
        best_single_self_cover, flag_solo_capture
    ) VALUES ?`;


    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.playtime === 0) continue;

        insertVars.push([
            d.player_id, d.gametype_id, d.map_id,
            d.total_matches,          d.playtime,
            d.flag_assist,            d.flag_return,
            d.flag_return_base,       d.flag_return_mid,
            d.flag_return_enemy_base, d.flag_return_save,
            d.flag_dropped,           d.flag_kill,
            d.flag_suicide,           d.flag_seal,
            d.flag_seal_pass,         d.flag_seal_fail,
            d.best_single_seal,       d.flag_cover,
            d.flag_cover_pass,        d.flag_cover_fail,
            d.flag_cover_multi,       d.flag_cover_spree,
            d.best_single_cover,      d.flag_capture,
            d.flag_carry_time,        d.flag_taken,
            d.flag_pickup,            d.flag_self_cover,
            d.flag_self_cover_pass,   d.flag_self_cover_fail,
            d.best_single_self_cover, d.flag_solo_capture
        ]);
    }

    await bulkInsert(query, insertVars);
}

async function recalculateGametypePlayerTotals(gametypeId){

    const query = `SELECT
    player_id,map_id,gametype_id,
    ${PLAYER_CTF_MATCH_TOTALS_COLUMNS}
    FROM nstats_player_ctf_match
    WHERE gametype_id=? GROUP BY player_id,map_id`;

    const result = await simpleQuery(query, [gametypeId]);


    const addKeys = ["total_matches",          "playtime",
        "flag_assist",            "flag_return",
        "flag_return_base",       "flag_return_mid",
        "flag_return_enemy_base", "flag_return_save",
        "flag_dropped",           "flag_kill",
        "flag_suicide",           "flag_seal",
        "flag_seal_pass",         "flag_seal_fail",
        "flag_cover",
        "flag_cover_pass",        "flag_cover_fail",
        "flag_cover_multi",       "flag_cover_spree",
        "flag_capture",
        "flag_carry_time",        "flag_taken",
        "flag_pickup",            "flag_self_cover",
        "flag_self_cover_pass",   "flag_self_cover_fail",
         "flag_solo_capture"
    ];

    const higherBetterKeys = [
        "best_single_seal",
        "best_single_cover", 
        "best_single_self_cover",
    ];


    const gametypeTotals = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(gametypeTotals[r.player_id] === undefined){
            gametypeTotals[r.player_id] = {...r};
            gametypeTotals[r.player_id].map_id = 0;

            continue;
        }

        for(let x = 0; x < addKeys.length; x++){

            const k = addKeys[x];
            gametypeTotals[r.player_id][k] = parseFloat(gametypeTotals[r.player_id][k]) + parseFloat(r[k]);
        }

        for(let x = 0; x < higherBetterKeys.length; x++){

            const k = higherBetterKeys[x];
            const g = gametypeTotals[r.player_id];

            if(g[k] < r[k]){
                g[k] = r[k];
            }
        }
    }

    for(const pData of Object.values(gametypeTotals)){
        result.push(pData);
    }

    return await bulkInsertPlayerTotals(result);
}

async function deleteGametypePlayerBest(gametypeId, mapId){

    return await deletePlayerType("best", gametypeId, mapId);
}


async function bulkInsertPlayerBest(data){

    const query = `INSERT INTO nstats_player_ctf_best (
        player_id,
        gametype_id,            map_id,
        flag_assist,            flag_return,
        flag_return_base,       flag_return_mid,
        flag_return_enemy_base, flag_return_save,
        flag_dropped,           flag_kill,
        flag_suicide,           flag_seal,
        flag_seal_pass,         flag_seal_fail,
        best_single_seal,       flag_cover,
        flag_cover_pass,        flag_cover_fail,
        flag_cover_multi,       flag_cover_spree,
        best_single_cover,      flag_capture,
        flag_carry_time,        flag_taken,
        flag_pickup,            flag_self_cover,
        flag_self_cover_pass,   flag_self_cover_fail,
        best_single_self_cover, flag_solo_capture) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.playtime === 0) continue;

        insertVars.push([
            d.player_id,
            d.gametype_id,            d.map_id,
            d.flag_assist,         d.flag_return,
            d.flag_return_base,       d.flag_return_mid,
            d.flag_return_enemy_base, d.flag_return_save,
            d.flag_dropped,         d.flag_kill,
            d.flag_suicide,          d.flag_seal,
            d.flag_seal_pass,        d.flag_seal_fail,
            d.best_single_seal,      d.flag_cover,
            d.flag_cover_pass,       d.flag_cover_fail,
            d.flag_cover_multi,      d.flag_cover_spree,
            d.best_single_cover,      d.flag_capture,
            d.flag_carry_time,       d.flag_taken,
            d.flag_pickup,           d.flag_self_cover,
            d.flag_self_cover_pass,  d.flag_self_cover_fail,
            d.best_single_self_cover, d.flag_solo_capture
        ]);
    }
    
    return await bulkInsert(query, insertVars);
}

async function recalculateGametypePlayerBest(gametypeId){

    const query = `SELECT map_id,player_id,${PLAYER_CTF_MATCH_BEST_COLUMNS} FROM nstats_player_ctf_match WHERE gametype_id=? GROUP BY map_id,player_id`;

    const data = await simpleQuery(query, [gametypeId]);

    const higherBetterKeys = [
        "flag_assist",            "flag_return",
        "flag_return_base",       "flag_return_mid",
        "flag_return_enemy_base", "flag_return_save",
        "flag_dropped",           "flag_kill",
        "flag_suicide",           "flag_seal",
        "flag_seal_pass",         "flag_seal_fail",
        "best_single_seal",       "flag_cover",
        "flag_cover_pass",        "flag_cover_fail",
        "flag_cover_multi",       "flag_cover_spree",
        "best_single_cover",      "flag_capture",
        "flag_carry_time",        "flag_taken",
        "flag_pickup",            "flag_self_cover",
        "flag_self_cover_pass",   "flag_self_cover_fail",
        "best_single_self_cover", "flag_solo_capture"
    ];

    const gametypeTotals = {};

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        d.gametype_id = gametypeId;

        if(gametypeTotals[d.player_id] === undefined){
            
            gametypeTotals[d.player_id] = {...d};
            gametypeTotals[d.player_id].map_id = 0;
            continue;
        }

        const g = gametypeTotals[d.player_id];

        for(let x = 0; x < higherBetterKeys.length; x++){

            const k = higherBetterKeys[x];

            if(g[k] < d[k]) g[k] = d[k];
        }

        g.playtime += d.playtime;
    }

    for(const playerData of Object.values(gametypeTotals)){

        data.push(playerData);
    }

    //console.log(data);

    await deleteGametypePlayerBest(gametypeId, 0);

    await bulkInsertPlayerBest(data);
    
}

async function deleteGametypePlayerBestLife(gametypeId, mapId){

    return await deletePlayerType("best_life", gametypeId, mapId);
}

async function bulkInsertPlayerBestLife(data){

    const query = `INSERT INTO nstats_player_ctf_best_life (
        player_id,
        gametype_id,            map_id,
        flag_assist,            flag_return,
        flag_return_base,       flag_return_mid,
        flag_return_enemy_base, flag_return_save,
        flag_dropped,           flag_kill,
        flag_seal,              flag_seal_pass,
        flag_seal_fail,         best_single_seal,
        flag_cover,             flag_cover_pass,
        flag_cover_fail,        flag_cover_multi,
        flag_cover_spree,       best_single_cover,
        flag_capture,           flag_carry_time,
        flag_taken,             flag_pickup,
        flag_self_cover,        flag_self_cover_pass,
        flag_self_cover_fail,   best_single_self_cover,
        flag_solo_capture
    ) VALUES ?`;

    const insertVars = [];


    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.playtime === 0) continue;


        insertVars.push([
            d.player_id,
            d.gametype_id,            d.map_id,
            d.flag_assist,            d.flag_return,
            d.flag_return_base,       d.flag_return_mid,
            d.flag_return_enemy_base, d.flag_return_save,
            d.flag_dropped,           d.flag_kill,
            d.flag_seal,              d.flag_seal_pass,
            d.flag_seal_fail,         d.best_single_seal,
            d.flag_cover,             d.flag_cover_pass,
            d.flag_cover_fail,        d.flag_cover_multi,
            d.flag_cover_spree,       d.best_single_cover,
            d.flag_capture,           d.flag_carry_time,
            d.flag_taken,             d.flag_pickup,
            d.flag_self_cover,        d.flag_self_cover_pass,
            d.flag_self_cover_fail,   d.best_single_self_cover,
            d.flag_solo_capture
        ]);
    }


    return await bulkInsert(query, insertVars);
}

async function recalculateGametypePlayerBestLife(gametypeId){

    const query = `SELECT map_id,player_id,${PLAYER_CTF_MATCH_BEST_LIFE_COLUMNS} FROM nstats_player_ctf_match WHERE gametype_id=? GROUP BY map_id,player_id`;

    const data = await simpleQuery(query, [gametypeId]);

    const higherBetterKeys = [
        "flag_assist",            "flag_return",
        "flag_return_base",       "flag_return_mid",
        "flag_return_enemy_base", "flag_return_save",
        "flag_dropped",           "flag_kill",
        "flag_seal",              "flag_seal_pass",
        "flag_seal_fail",         "best_single_seal",
        "flag_cover",             "flag_cover_pass",
        "flag_cover_fail",        "flag_cover_multi",
        "flag_cover_spree",       "best_single_cover",
        "flag_capture",           "flag_carry_time",
        "flag_taken",             "flag_pickup",
        "flag_self_cover",        "flag_self_cover_pass",
        "flag_self_cover_fail",   "best_single_self_cover",
        "flag_solo_capture"
    ];

    const gametypeTotals = {};

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        d.gametype_id = gametypeId;

        if(gametypeTotals[d.player_id] === undefined){

            gametypeTotals[d.player_id] = {...d};
            gametypeTotals[d.player_id].map_id = 0;
            continue;
        }

        const g = gametypeTotals[d.player_id];

        for(let x = 0; x < higherBetterKeys.length; x++){

            const k = higherBetterKeys[x];
            
            if(g[k] < d[k]){
                g[k] = d[k];
            }
        }
    }

    for(const playerData of Object.values(gametypeTotals)){

        data.push(playerData);
    }

    await deleteGametypePlayerBestLife(gametypeId, 0);
    await bulkInsertPlayerBestLife(data);
   // console.log(await mysqlGetColumns("nstats_player_ctf_best_life"));
}

async function recalculateGametype(gametypeId){

    await deletePlayerTotals(gametypeId, 0);
    await recalculateGametypePlayerTotals(gametypeId);
    await recalculateGametypePlayerBest(gametypeId);
    await recalculateGametypePlayerBestLife(gametypeId);
}


export async function mergeGametypes(oldId, newId){

    await changeMatchGametypes(oldId, newId);
    await changeCapGametypes(oldId, newId);

    await deleteGametypeCapRecords(oldId);
    await deleteGametypeCapRecords(newId);


    const mapIds = await getGametypeUniquePlayedMaps(newId);

    for(let i = 0; i < mapIds.length; i++){

        const m = mapIds[i];

        await recalculateSoloCapRecord(newId, m);
        await recalculateAssistCapRecord(newId, m);
    }

    await deletePlayerTotals(oldId, 0);
    await deleteGametypePlayerBest(oldId, 0);
    await deleteGametypePlayerBestLife(oldId, 0);
    await recalculateGametype(newId);
    
}


async function getUniqueMapsFromCaps(){

    const query = `SELECT DISTINCT map_id FROM nstats_ctf_caps`;

    const result = await simpleQuery(query);

    return result.map((r) =>{
        return r.map_id;
    })
}

/**
 * gametypeId = 0 only
 */
async function recalculateAllTimeCapRecords(){

    const mapIds = await getUniqueMapsFromCaps();


    for(let i = 0; i < mapIds.length; i++){

        const m = mapIds[i];
        console.log(`recalculate all time map cap records for mapId =${m}`);
        await recalculateSoloCapRecord(0, m);
        await recalculateAssistCapRecord(0, m);
    }

}

export async function deleteGametype(id){

    const tables = [
        "nstats_ctf_caps",
        "nstats_player_ctf_match",
        "nstats_player_ctf_totals",
        "nstats_player_ctf_best",
        "nstats_player_ctf_best_life",
        "nstats_ctf_cap_records",
    ];

    for(let i = 0; i < tables.length; i++){

        const t = tables[i];
        await simpleQuery(`DELETE FROM ${t} WHERE gametype_id=?`, [id]);
    }

    await recalculateAllTimeCapRecords();

    //TODO: recalculate totals, best, best_life

}