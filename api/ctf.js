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

    async updatePlayerMatchStats(playerId, matchId, stats){

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

    async insertCap(matchId, matchDate, mapId, team, flagTeam, grabTime, grab, drops, dropTimes, pickups, pickupTimes, covers, coverTimes, assists, 
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

    }

    async bMapHaveRecord(mapId, type){

        if(type === undefined) type = 0;

        let query = `SELECT COUNT(*) as total_results FROM nstats_ctf_cap_records WHERE map_id=? AND type=?`;

        const result = await mysql.simpleQuery(query, [mapId, type]);

        if(result.length === 0) return false;

        if(result[0].total_results > 0){
            return true;
        }

        return false;
    }

    async getMapRecord(mapId, type){

        const query = "SELECT travel_time FROM nstats_ctf_cap_records WHERE map_id=? AND type=?";

        const result = await mysql.simpleQuery(query, [mapId, type]);

        if(result.length > 0){
            return result[0].travel_time;
        }

        return -1;

    }

    async updateCapRecord(matchId, mapId, type, cap, date){

        if(cap === null) return;

        const bMapHaveRecord = await this.bMapHaveRecord(mapId, type);

        if(!bMapHaveRecord){
            await this.insertCapRecord(matchId, mapId, type, cap, date);
        }else{

            const currentRecord = await this.getMapRecord(mapId, type);

                if(currentRecord < 0 || currentRecord > cap.travelTime){
                
                const query = `UPDATE nstats_ctf_cap_records SET match_id=?,match_date=?,team=?,grab=?,assists=?,cap=?,travel_time=? WHERE map_id=? AND type=?`;
                const vars = [matchId, date, cap.team, cap.grab, cap.assists.toString(), cap.cap, cap.travelTime, mapId, type];
                await mysql.simpleQuery(query, vars);

            }else{
                new Message(`Current Record is less than 0`,"warning");
            }

        }
    }


    async insertCapRecord(matchId, mapId, type, cap, date){

        const query = "INSERT INTO nstats_ctf_cap_records VALUES(NULL,?,?,?,?,?,?,?,?,?)";

        const vars = [matchId, date, mapId, cap.team, cap.grab, cap.assists.toString(), cap.cap, cap.travelTime ?? cap.travel_time, type];
        //console.log(vars);
        await mysql.simpleQuery(query, vars);
    }

    async getMatchCaps(matchId){

        const query = `SELECT team,grab_time,grab,drops,drop_times,pickups,pickup_times,covers,cover_times,assists,assist_carry_times,
        assist_carry_ids,cap,cap_time,travel_time,self_covers,self_covers_times,flag_team,total_drops,total_covers,total_self_covers,
        total_pickups,total_assists,total_unique_assists,total_seals,time_dropped,carry_time,seals,seal_times
        FROM nstats_ctf_caps WHERE match_id=? ORDER BY grab_time ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }


    async insertEvent(match, timestamp, player, event, team){


        const query = "INSERT INTO nstats_ctf_events VALUES(NULL,?,?,?,?,?)";

        return await mysql.simpleQuery(query, [match, timestamp, player, event, team]);

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

    /**
     * 
     * @param {*} playerId 
     * @param {*} matchId 
     * @param {*} bIgnoreEvents only set this if you want to ignore events
     */
    async deletePlayerFromMatch(playerId, matchId){

        try{

            const matchCaps = await this.getMatchCaps(matchId);

            if(matchCaps.length > 0){
   
                if(this.parseCapEvents(matchCaps, playerId)){

                    for(let i = 0; i < matchCaps.length; i++){

                        await this.updateCap(matchCaps[i]);
                    }
                }
            }

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

    async changeCapEventPlayerIds(oldId, newId, matchIds){

        try{

            const data = await this.getCapDataByMatchIds(matchIds);

            const replaceIds = (array, find, replace) =>{

                for(let i = 0; i < array.length; i++){

                    if(array[i] === find) array[i] = replace;
                }
            }

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

        return await mysql.simpleUpdate("UPDATE nstats_ctf_events SET player=? WHERE player=?", [newId, oldId]);
        
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

    async getPlayerMatchCaps(matchId, playerId){

        const query = `SELECT team,grab_time,grab,drops,drop_times,pickups,pickup_times,covers,cover_times,assists,assist_carry_times,
            assist_carry_ids,cap,cap_time,travel_time FROM nstats_ctf_caps 
            WHERE match_id=? AND (
            grab=? OR
            drops LIKE('%?%') OR
            pickups LIKE('%?%') OR
            covers LIKE('%?%') OR
            assists LIKE('%?%') OR
            cap=?) `;

        const vars = [
            matchId,
            playerId,
            playerId,
            playerId,
            playerId,
            playerId,
            playerId,
            
        ];

        return await mysql.simpleFetch(query, vars);
    }

    async getFastestMatchCaps(matchId){

        const query = "SELECT team,grab,cap,assists,travel_time,cap_time FROM nstats_ctf_caps WHERE match_id=? ORDER BY travel_time ASC";

        const result = await mysql.simpleQuery(query, [matchId]);

        for(let i = 0; i < result.length; i++){

            result[i].assists = result[i].assists.split(",");
        }

        return result;
    }

    async getMapFastestSoloCap(mapId){

        const query = "SELECT match_id,cap,travel_time FROM nstats_ctf_cap_records WHERE map_id=? AND assists='' ORDER BY travel_time ASC LIMIT 1";

        const data = await mysql.simpleQuery(query, [mapId]);

        if(data.length > 0) return data[0];

        return null;
    }

    async getMapFastestAssistCap(mapId){

        const query = "SELECT match_id,cap,travel_time,assists FROM nstats_ctf_cap_records WHERE map_id=? AND assists!='' ORDER BY travel_time ASC LIMIT 1";

        const data = await mysql.simpleQuery(query, [mapId]);

        if(data.length > 0){
            data[0].assists = data[0].assists.split(",");
            return data[0];
        }

        return null;

    }

    async getFastestMapCaps(mapId, playerManager){

        const soloCap = await this.getMapFastestSoloCap(mapId);
        const assistCap = await this.getMapFastestAssistCap(mapId);

        const playerIds = [];

        if(soloCap !== null) playerIds.push(soloCap.cap);

        if(assistCap !== null){

            if(playerIds.indexOf(assistCap.cap) === -1){
                playerIds.push(assistCap.cap);
            }

            const assistIds = assistCap.assists;

            for(let i = 0; i < assistIds.length; i++){

                const a = parseInt(assistIds[i]);

                if(a === a){

                    if(playerIds.indexOf(a) === -1){
                        playerIds.push(a);
                    }       
                }
            }
        }

        const playerNames = await playerManager.getNamesByIds(playerIds);

        return {"solo": soloCap, "assist": assistCap, "playerNames": playerNames};
    }


    async getMapCaps(mapId, page, perPage, type){

        let start = perPage * page;

        if(start === start){

            if(start < 0) start = 0;

            let query = "SELECT match_id,cap,travel_time,assists FROM nstats_ctf_caps WHERE map=? ORDER BY travel_time ASC LIMIT ?, ?";

            if(type === "solo"){
                query = "SELECT match_id,cap,travel_time,assists FROM nstats_ctf_caps WHERE map=? AND assists='' ORDER BY travel_time ASC LIMIT ?, ?";
            }else if(type === "assists"){
                query = "SELECT match_id,cap,travel_time,assists FROM nstats_ctf_caps WHERE map=? AND assists!='' ORDER BY travel_time ASC LIMIT ?, ?";
            }

            const vars = [mapId, start, perPage];

            const result = await mysql.simpleQuery(query, vars);

            for(let i = 0; i < result.length; i++){

                if(result[i].assists !== ""){

                    result[i].assists = result[i].assists.split(",").map(id => parseInt(id));
                }
            }

            return result;


        }else{
            console.log(`Start is NaN`);
        }

        return [];
    }

    async getMapTotalCaps(mapId, type){

        if(type === undefined) type = "";

        let query = "SELECT COUNT(*) as total_caps FROM nstats_ctf_caps WHERE map=?";

        if(type === "solo"){
            query = "SELECT COUNT(*) as total_caps FROM nstats_ctf_caps WHERE map=? AND assists=''";
        }else if(type === "assists"){
            query = "SELECT COUNT(*) as total_caps FROM nstats_ctf_caps WHERE map=? AND assists!=''";
        }

        const result = await mysql.simpleQuery(query, [mapId]);

        if(result.length > 0) return result[0].total_caps;

        return -1;
    }


    async getAllMapsWithCaps(){

        const query = "SELECT DISTINCT map FROM nstats_ctf_caps";

        const result = await mysql.simpleQuery(query);

        const maps = [];

        for(let i = 0; i < result.length; i++){
            maps.push(result[i].map);
        }
        return maps;
    }

    async getMapAssistedCapRecord(mapId){

        const query = "SELECT * FROM nstats_ctf_cap_records WHERE map_id=? AND assists!='' ORDER BY travel_time DESC LIMIT 1";

        const result = await mysql.simpleQuery(query, [mapId]);

        if(result.length > 0){

            const data = result[0];
            const assistIds = data.assists.split(",").map(value => parseInt(value));

            data.assists = assistIds;
            return data;
        }

        return null;
    }

    async getMapSoloCapRecord(mapId){

        const query = "SELECT * FROM nstats_ctf_cap_records WHERE map_id=? AND assists='' ORDER BY travel_time DESC LIMIT 1";

        const result = await mysql.simpleQuery(query, [mapId]);

        if(result.length > 0) return result[0];

        return null;

    }

    async getMapCapRecords(id){

        return {
            "solo": await this.getMapSoloCapRecord(id),
            "assisted": await this.getMapAssistedCapRecord(id)
        };
    }


    /**
     * Fastest solo cap from ctf_caps not ctf_cap_records
     */
    async getMapFastestSoloCapALT(id){

        const query = "SELECT * FROM nstats_ctf_caps WHERE map=? AND assists='' ORDER BY travel_time ASC LIMIT 1";

        const result = await mysql.simpleQuery(query, [id]);
        
        if(result.length > 0){
            return result[0];
        }

        return null;
    }

    /**
     * Fastest assist cap from ctf_caps not ctf_cap_records
     */
     async getMapFastestAssistCapALT(id){

        const query = "SELECT * FROM nstats_ctf_caps WHERE map=? AND assists!='' ORDER BY travel_time ASC LIMIT 1";

        const result = await mysql.simpleQuery(query, [id]);
        
        if(result.length > 0){
            return result[0];
        }

        return null;
    }

    /**
     * Get fastest times from ctf_caps instead ctf_cap_records
     * used for getMapCapRecords.js
     */
    async getMapFastestCaps(id){

        return {"solo": await this.getMapFastestSoloCapALT(id), "assisted": await this.getMapFastestAssistCapALT(id)};
    }

    /**
     * Get fastest times from ctf_caps instead ctf_cap_records
     * used for getMapCapRecords.js
     */
    async getAllMapFastestCaps(mapIds){

        const records = {};

        for(let i = 0; i < mapIds.length; i++){

            const m = mapIds[i];

            records[m] = await this.getMapFastestCaps(m);
        }

        return records;
    }

    async getMapsCapRecords(mapIds){

        if(mapIds.length === 0) return {};

        if(mapIds === "*"){

            mapIds = await this.getAllMapsWithCaps();
        }

        const records = {};

        for(let i = 0; i < mapIds.length; i++){

            const m = mapIds[i];
            records[m] = await this.getMapCapRecords(m);
        }

        return records;
    }


    async clearRecords(){

        const query = "DELETE FROM nstats_ctf_cap_records";
        await mysql.simpleQuery(query);
    }


    async getCapRecords(){

        const mapIds = await this.getAllMapsWithCaps();
       // console.log(mapIds);
        
    }


    async getPlayerTotalSoloCapRecords(minCaps, maxResults){

        const query = `SELECT cap,COUNT(*) as total_records FROM nstats_ctf_cap_records WHERE type=0
        GROUP BY cap 
        ORDER BY total_records DESC LIMIT ?`;

        const result = await mysql.simpleQuery(query, [maxResults]);

        const data = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            if(r.total_records >= minCaps){
                data.push({"player": r.cap, "caps": r.total_records});
            }

        }

        return data;

    }


    async getPlayerTotalAssistCapRecords(minCaps, maxResults){

        const query = "SELECT cap,assists,grab FROM nstats_ctf_cap_records WHERE type=1";

        const result = await mysql.simpleQuery(query);

        const caps = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            const currentPlayers = [];

            const assists = r.assists.split(",");

            currentPlayers.push(r.grab);
            
            for(let x = 0; x < assists.length; x++){

                const a = parseInt(assists[x]);

                if(currentPlayers.indexOf(a) === -1){
                    currentPlayers.push(a);
                }
            }

            if(currentPlayers.indexOf(r.cap) === -1){
                currentPlayers.push(r.cap);
            }


            for(let x = 0; x < currentPlayers.length; x++){

                const p = currentPlayers[x];

                if(caps[p] === undefined) caps[p] = 0;

                caps[p]++;
            }
        }

        let returnData = [];

        for(const [playerId, totalCaps] of Object.entries(caps)){

            if(totalCaps < minCaps) continue;

            returnData.push({"player": parseInt(playerId), "caps": totalCaps});
        }

        returnData.sort((a,b) =>{

            a = a.caps;
            b = b.caps;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }

            return 0;
        });

        returnData = returnData.slice(0, maxResults);

        return returnData;
    }


    async getPlayerSoloCapRecords(playerId){

        const query = "SELECT match_id,match_date,map_id,travel_time FROM nstats_ctf_cap_records WHERE cap=? AND type=0";
        return await mysql.simpleQuery(query, [playerId]);

    }

    async getPlayerAssistCapRecords(playerId){


        /*const query = `SELECT match_id,match_date,map_id,cap,grab,assists FROM nstats_ctf_cap_records WHERE 
        assists=? || 
        assists LIKE ? || 
        assists LIKE ?`;*/

        const query = `SELECT match_id,match_date,map_id,travel_time FROM nstats_ctf_cap_records WHERE 
        assists=? || 
        assists LIKE ? || 
        assists LIKE ?`;

        return await mysql.simpleQuery(query, [playerId, `%${playerId},%`, `%,${playerId}%`]);

    }

    async getPlayerCapRecords(playerId){

        const soloRecords = await this.getPlayerSoloCapRecords(playerId);

        const assistedRecords = await this.getPlayerAssistCapRecords(playerId);

        return {"soloCaps": soloRecords, "assistedCaps": assistedRecords};
    }


    async insertPlayerMatchData(playerId, matchId, mapId, gametypeId, serverId, matchDate, player){

        const query = `INSERT INTO nstats_player_ctf_match VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

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
            player.stats.ctfNew.capture.total,
            player.stats.ctfNew.capture.bestLife,
            player.stats.ctfNew.carryTime.total,
            player.stats.ctfNew.carryTime.bestLife,
            player.stats.ctfNew.taken.total,
            player.stats.ctfNew.taken.bestLife,
            player.stats.ctfNew.pickup.total,
            player.stats.ctfNew.pickup.bestLife,
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async getCarryTimes(matchId){

        const query = `SELECT 
        player_id,playtime,flag_carry_time,flag_carry_time_best,flag_capture,flag_assist
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

    async getMatchCTFData(matchId){

        const query = "SELECT * FROM nstats_player_ctf_match WHERE match_id=?";

        const result =  await mysql.simpleQuery(query, [matchId]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            data[result[i].player_id] = result[i];
        }

        return data;
    }

    async setMatchCTFData(matchId, players){

        const ctfData = await this.getMatchCTFData(matchId);

        for(let i = 0; i < players.length; i++){

            const p = players[i];

            if(ctfData[p.player_id] !== undefined){
                p.ctfData = ctfData[p.player_id];
            }
        }
    }
}


module.exports = CTF;