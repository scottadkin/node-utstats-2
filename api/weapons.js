const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const fs = require('fs');

class Weapons{

    constructor(){

        this.weaponNames = [];
    }

    exists(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_matches FRON nstats_weapons WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result[0].total_matches >= 1){
                    resolve(true);
                }

                resolve(false);

            });
        });
    }


    create(name){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_weapons VALUES(NULL,?,0,0,0,0,0,0,0)";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                resolve(result.insertId);

            });
        });
    }

    update(weapon, kills, deaths, shots, hits, damage){

        damage = Math.abs(damage);

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_weapons SET matches=matches+1,kills=kills+?,deaths=deaths+?,shots=shots+?,hits=hits+?,damage=damage+?,
            accuracy=IF(hits > 0 AND shots > 0, (hits/shots)*100, IF(hits > 0, 100,0))
            WHERE id=?`;

            mysql.query(query, [kills,deaths,shots,hits,damage, weapon], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    getIdsByNamesQuery(ids){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_weapons WHERE name IN (?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        }); 
    }


    async getIdsByName(names){

        try{

            if(names.indexOf("None") === -1){
                names.push('None');
            }
            const current = await this.getIdsByNamesQuery(names);

            const currentNames = [];

            for(let i = 0; i < current.length; i++){
                currentNames.push(current[i].name);
            }

            if(current.length < names.length){

                new Message(`Some weapons are not in the database.`,'note');

                for(let i = 0; i < names.length; i++){
 
                    if(currentNames.indexOf(names[i]) === -1){       

                        current.push({"id": await this.create(names[i]), "name": names[i]});
                        new Message(`Inserted new weapon ${names[i]} into database.`,'pass');

                    }
                }
            }

            this.weaponNames = current;


        }catch(err){
            console.trace(err);
        }
    }


    getSavedWeaponByName(name){

        if(name === null){
            new Message(`getSavedWeaponByName name is null`,'warning');
            return null;
        }
        name = name.toLowerCase();

        for(let i = 0; i < this.weaponNames.length; i++){

            if(this.weaponNames[i].name.toLowerCase() === name){
                return this.weaponNames[i].id;
            }
        }

        return null;
    }

    insertPlayerMatchStats(matchId, playerId, weaponId, stats){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_player_weapon_match VALUES(NULL,?,?,?,?,?,?,?,?,?)";

            const vars = [matchId, playerId, weaponId, stats.kills, stats.deaths, stats.accuracy, stats.shots, stats.hits, Math.abs(stats.damage)];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    bPlayerTotalExists(gametypeId, playerId, weaponId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_stats FROM nstats_player_weapon_totals WHERE player_id=? AND gametype=? AND weapon=?";

            mysql.query(query, [playerId, gametypeId, weaponId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result[0].total_stats > 0){
                        resolve(true);
                    }
                }

                resolve(false);
            });

        });
    }

    createPlayerTotal(gametypeId, playerId, weaponId, kills, deaths, accuracy, shots, hits, damage){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_player_weapon_totals VALUES(NULL,?,?,?,?,?,0,?,?,?,?,1)";

            mysql.query(query, [playerId, gametypeId, weaponId, kills, deaths, accuracy, shots, hits, Math.abs(damage)], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlayerTotals(gametypeId, playerId, weaponId, stats){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_weapon_totals SET kills=kills+?, deaths=deaths+?, shots=shots+?, hits=hits+?, damage=damage+?,
             accuracy=IF(hits > 0 && shots > 0, (hits/shots) * 100, IF(hits > 0, 100, 0)), 
             efficiency=IF(kills > 0 && deaths > 0, (hits/shots) * 100, IF(kills > 0, 100, 0)),
             matches=matches+1 WHERE player_id=? AND weapon=? AND gametype=?`;

             const vars = [stats.kills, stats.deaths, stats.shots, stats.hits, Math.abs(stats.damage), playerId, weaponId, gametypeId];

             mysql.query(query, vars, (err) =>{
                if(err) reject(err);

                resolve();
             });
        });
    }

    async updatePlayerTotalStats(gametypeId, playerId, weaponId, stats){

        try{

            //gametype totals
            if(!await this.bPlayerTotalExists(gametypeId, playerId, weaponId)){

                await this.createPlayerTotal(gametypeId, playerId, weaponId, 
                    stats.kills, stats.deaths, stats.accuracy, stats.shots, stats.hits, stats.damage);

            }else{
               await this.updatePlayerTotals(gametypeId, playerId, weaponId, stats);
            }

            //all totals
            if(!await this.bPlayerTotalExists(0, playerId, weaponId)){

                await this.createPlayerTotal(0, playerId, weaponId, 
                    stats.kills, stats.deaths, stats.accuracy, stats.shots, stats.hits, stats.damage);
            }else{
                await this.updatePlayerTotals(0, playerId, weaponId, stats);
            }

        }catch(err){
            console.trace(err);
        } 
    }
    

    getPlayerTotals(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_player_weapon_totals WHERE player_id=? AND gametype=0";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    async getAllPlayerTotals(id){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_weapon_totals WHERE player_id=?", [id]);
    }

    async getAllNames(){

        const query = "SELECT id,name FROM nstats_weapons";

        return await mysql.simpleFetch(query);
    }

    getNamesByIds(ids){

        if(ids.length === 0) return [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nstats_weapons WHERE id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });
        });
    }


    async getImageList(){

        try{

            const files = fs.readdirSync('public/images/weapons/');

            return files;

        }catch(err){
            console.trace(err);
        }
    }


    getMatchPlayerData(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT player_id,weapon_id,kills,deaths,accuracy,shots,hits,damage FROM nstats_player_weapon_match WHERE match_id=? ORDER BY kills DESC, deaths ASC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    async getMatchData(id){

        try{

            const playerData = await this.getMatchPlayerData(id);

            const weaponIds = [];

            for(let i = 0; i < playerData.length; i++){

                if(weaponIds.indexOf(playerData[i].weapon_id) === -1){
                    weaponIds.push(playerData[i].weapon_id);
                }
            }


            let weaponNames = [];

            if(weaponIds.length > 0){
                weaponNames = await this.getNamesByIds(weaponIds);
            }

            return {
                "names": weaponNames,
                "playerData": playerData
            };

        }catch(err){
            console.trace(err);
        }
    }

    deletePlayerMatchData(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_player_weapon_match WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        })
    }


    reducePlayerWeaponTotal(data){


        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_weapon_totals SET
            kills=kills-?,deaths=deaths-?,shots=shots-?,hits=hits-?,damage=damage-?,
            matches=matches-1,
            accuracy = IF(hits > 0 AND shots > 0,(hits / shots) * 100, IF(hits > 0, 100, 0)),
            efficiency = IF(kills > 0 && deaths > 0, (kills / (kills + deaths)) * 100, IF(kills > 0, 100, 0))
            WHERE player_id=? AND weapon=?
            `;

            const vars = [
                data.kills,
                data.deaths,
                data.shots,
                data.hits,
                data.damage,
                data.player_id,
                data.weapon_id
            ];


            mysql.query(query, vars, (err) =>{

                if(err) reject(err);
                resolve()
            });

        });
    }


    reduceTotals(weapon, data, dontReduceMatches){

        return new Promise((resolve, reject) =>{

            let query = `UPDATE nstats_weapons SET
            kills=kills-?,
            deaths=deaths-?,
            shots=shots-?,
            hits=hits-?,
            damage=damage-?,
            matches=matches-1,
            accuracy = IF(hits > 0 && shots > 0, (hits / shots) * 100, IF(hits > 0, 100, 0))
            WHERE id=?
            `;

            if(dontReduceMatches !== undefined){
                query = `UPDATE nstats_weapons SET
                kills=kills-?,
                deaths=deaths-?,
                shots=shots-?,
                hits=hits-?,
                damage=damage-?,
                accuracy = IF(hits > 0 && shots > 0, (hits / shots) * 100, IF(hits > 0, 100, 0))
                WHERE id=?
                `;
            }

            const vars = [
                data.kills,
                data.deaths,
                data.shots,
                data.hits,
                data.damage,
                weapon
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    async deleteMatchData(id){

        try{


            let matchData = await this.getMatchData(id);

            matchData = matchData.playerData; 

            const matchWeaponTotals = {};

            for(let i = 0; i < matchData.length; i++){

                await this.reducePlayerWeaponTotal(matchData[i]);

                if(matchWeaponTotals[matchData[i].weapon_id] !== undefined){

                    matchWeaponTotals[matchData[i].weapon_id].kills += matchData[i].kills;
                    matchWeaponTotals[matchData[i].weapon_id].deaths += matchData[i].deaths;
                    matchWeaponTotals[matchData[i].weapon_id].shots += matchData[i].shots;
                    matchWeaponTotals[matchData[i].weapon_id].hits += matchData[i].hits;
                    matchWeaponTotals[matchData[i].weapon_id].damage += matchData[i].damage;

                }else{

                    matchWeaponTotals[matchData[i].weapon_id] = {
                        "kills": matchData[i].kills,
                        "deaths": matchData[i].deaths,
                        "shots": matchData[i].shots,
                        "hits": matchData[i].hits,
                        "damage": matchData[i].damage
                    };
                }
            }

            await this.deletePlayerMatchData(id);

            for(const [key, value] of Object.entries(matchWeaponTotals)){

                await this.reduceTotals(key, value);
            }
        

        }catch(err){
            console.trace(err);
        }
    }

    async getPlayerMatchData(playerId, matchId){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_weapon_match WHERE match_id=? AND player_id=?",[matchId, playerId]);
    }

    async getAllPlayerMatchData(playerId){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_weapon_match WHERE player_id=?", [playerId]);
    }


    async deleteSinglePlayerMatchData(playerId, matchId){

        await mysql.simpleDelete("DELETE FROM nstats_player_weapon_match WHERE player_id=? AND match_id=?",[
            playerId, matchId
        ]);
    }


    async deletePlayerFromMatch(playerId, matchId){

        try{

            const matchData = await this.getPlayerMatchData(playerId, matchId);

            for(let i = 0; i < matchData.length; i++){
 
                await this.reduceTotals(matchData[i].weapon_id, matchData[i]);
                await this.reducePlayerWeaponTotal(matchData[i]);
            }

            await this.deleteSinglePlayerMatchData(playerId, matchId);

        }catch(err){
            console.trace(err);
        }
    }


    async updateMatchRowFromMergedData(data){

        const query = `UPDATE nstats_player_weapon_match SET 
        kills=?, deaths=?, accuracy=?, shots=?, hits=?, damage=? 
        WHERE id=?`;

        const vars = [
            data.kills,
            data.deaths,
            data.accuracy,
            data.shots,
            data.hits,
            data.damage,
            data.id
        ];

        await mysql.simpleUpdate(query, vars);
    }

    /*async deletePlayerMatchData(id, matchIds){

        if(matchIds.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_player_weapon_match WHERE player_id=? AND match_id IN(?)", [id, matchIds]);
    }*/


   /* async updatePlayerWeaponTotalsAfterMerged(player, data){

        console.log("updatePlayerWeaponTotalsAfterMerged");


        //UPDATE nstats_player_weapon_totals not delete
        console.log(data);
    }*/

    async realculatePlayerWeaponTotals(playerId, matchManager){

        //get all player match weapon data
        //then get all match ids gametypes
        //add them up for the new totals

        const data = await this.getAllPlayerMatchData(playerId);

        //get match gametypes

        //console.table(data);

        const matchIds = [];
        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            matchIds.push(d.match_id);
        }

        const gametypes = await matchManager.getMatchGametypes(matchIds);

        //console.log(gametypes);

        const totals = {};

        

        let gametype = 0;
        let weapon = 0;

        const updateTotals = (d, gametype, weapon) =>{

            if(totals[gametype] === undefined){
                totals[gametype] = {};
            }

            if(totals[gametype][weapon] === undefined){

                totals[gametype][weapon] = {
                    "kills": 0,
                    "deaths": 0,
                    "efficiency": 0,
                    "accuracy": 0,
                    "shots": 0,
                    "hits": 0,
                    "damage": 0,
                    "matches": 0
                }
            }

            const current = totals[gametype][weapon];

            current.kills += d.kills;
            current.deaths += d.deaths;

            current.efficiency = 0;

            if(current.kills > 0){

                if(current.deaths === 0){
                    current.efficiency = 100;
                }else{
                    current.efficiency = 
                    (current.kills / (current.kills + current.deaths)) * 100;
                }
            }

            //console.log(`kills = ${current.kills} deaths = ${current.deaths} efficiency = ${current.efficiency}`);


            current.shots += d.shots;
            current.hits += d.hits;

            current.accuracy = 0;

            if(current.hits > 0){

                if(current.shots === 0){
                    current.accuracy = 100;
                }else{

                    current.accuracy = (current.hits / current.shots) * 100;
                }
            }

            current.damage += d.damage;
            current.matches++;
        }


        for(let i = 0; i < data.length; i++){

            d = data[i];

            gametype = gametypes[d.match_id];
            weapon = d.weapon_id;
            //totals
            updateTotals(d, 0, weapon);
            //gametype totals
            updateTotals(d, gametype, weapon);

        
        }

        const updateQuery = `UPDATE nstats_player_weapon_totals SET
            kills=?,
            deaths=?,
            efficiency=?,
            accuracy=?,
            shots=?,
            hits=?,
            damage=?,
            matches=?
            WHERE player_id=? AND gametype=? AND weapon=?

        `;

        const insertQuery = `INSERT INTO nstats_player_weapon_totals VALUES(
            ?,?,?,?,?,?,?,?,?,?,?
        )`;


        let vars = [];

        let updatedRows = 0;

        for(const [gametype, data] of Object.entries(totals)){

            //console.log(`current gametype = ${gametype}`);

            for(const [weapon, weaponData] of Object.entries(data)){

               // console.log(`currentWeapon ${weapon}`);

                vars = [
                    weaponData.kills,
                    weaponData.deaths,
                    weaponData.efficiency,
                    weaponData.accuracy,
                    weaponData.shots,
                    weaponData.hits,
                    weaponData.damage,
                    weaponData.matches,
                    playerId,
                    gametype,
                    weapon
                ];


                updatedRows = await mysql.updateReturnAffectedRows(updateQuery, vars);

               // console.log(`${updatedRows} rows updated`);

                if(updatedRows === 0){

                    //console.log("insert new row");

                    vars = [
                        playerId,
                        gametype,
                        weapon,
                        weaponData.kills,
                        weaponData.deaths,
                        weaponData.efficiency,
                        weaponData.accuracy,
                        weaponData.shots,
                        weaponData.hits,
                        weaponData.damage,
                        weaponData.matches,     
                    ];

                    await mysql.simpleInsert(insertQuery, vars);
                }
            }
        }
    }


    async deletePlayer(id){

        await mysql.simpleDelete("DELETE FROM nstats_player_weapon_match WHERE player_id=?", [id]);
        await mysql.simpleDelete("DELETE FROM nstats_player_weapon_totals WHERE player_id=?", [id]);
    }

    createDummyMatchData(){

        return {
            "shots": 0,
            "hits": 0,
            "kills": 0,
            "deaths": 0,
            "damage": 0,
            "gametype": 0,
            "player_id": 0,
            "accuracy": 0,
        };
    }


    async mergePlayers(oldId, newId, matchManager){

        try{

            const oldPlayerData = await this.getAllPlayerMatchData(oldId);
            const newPlayerData = await this.getAllPlayerMatchData(newId);

            const mergedData = {};
            const weaponData = {};

            
            const matchIds = [];


            const setMatchIds = (data) =>{

                let d = 0;

                for(let i = 0; i < data.length; i++){

                    d = data[i];
                    if(matchIds.indexOf(d.match_id) === -1) matchIds.push(d.match_id);
                }
            }

            setMatchIds(oldPlayerData);
            setMatchIds(newPlayerData);

            const matchGametypes = await matchManager.getMatchGametypes(matchIds);
            
            const createMergedData = (data) =>{

                let d = 0;

                let originalId = 0;

                for(let i = 0; i < data.length; i++){

                    d = data[i];

                    d.gametype = matchGametypes[d.match_id];

                    originalId = d.player_id;
                    
                    if(mergedData[d.match_id] === undefined){
    
                        //console.log(d);
                        mergedData[d.match_id] = this.createDummyMatchData();
                        mergedData[d.match_id].id = d.id;
                        mergedData[d.match_id].player_id = newId;
                        mergedData[d.match_id].weapon_id = d.weapon_id;
                        mergedData[d.match_id].match_id = d.match_id;
                        mergedData[d.match_id].gametype = matchGametypes[d.match_id];

                    }


                    mergedData[d.match_id].kills += d.kills;
                    mergedData[d.match_id].deaths += d.deaths;
                    mergedData[d.match_id].shots += d.shots;
                    mergedData[d.match_id].hits += d.hits;
                    mergedData[d.match_id].damage += d.damage;
                    
                    mergedData[d.match_id].accuracy = 0;

                    if(mergedData[d.match_id].hits > 0){

                        if(mergedData[d.match_id].shots > 0){

                            mergedData[d.match_id].accuracy = (mergedData[d.match_id].hits / mergedData[d.match_id].shots) * 100;

                        }else{
                            mergedData[d.match_id].accuracy = 100;
                        }
                    }
                }
            }

            

            createMergedData(oldPlayerData);
            createMergedData(newPlayerData);

            for(const [k, v] of Object.entries(mergedData)){

                await this.updateMatchRowFromMergedData(v);
            }

           // await this.deletePlayerMatchData(oldId, matchIds);

            //await 

            //await this.updatePlayerWeaponTotalsAfterMerged(newId, weaponData);
            

            await this.deletePlayer(oldId);
            //await this.realculatePlayerWeaponTotals(oldId, matchManager);
            await this.realculatePlayerWeaponTotals(newId, matchManager);

        }catch(err){
           console.trace(err); 
        }
    }

    async deleteAllPlayerMatchData(playerId){
        await mysql.simpleDelete("DELETE FROM nstats_player_weapon_match WHERE player_id=?", [playerId]);
    }

    async deleteAllPlayerTotals(playerId){
        await mysql.simpleDelete("DELETE FROM nstats_player_weapon_totals WHERE player_id=?", [playerId]);
    }

    async deletePlayer(playerId){

        try{

            const data = await this.getAllPlayerTotals(playerId);

            const totals = {};

            let d = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                if(totals[d.weapon] === undefined){

                    totals[d.weapon] = {
                        "kills": 0,
                        "deaths": 0,
                        "shots": 0,
                        "hits": 0,
                        "damage": 0
                    };
                }

                totals[d.weapon].kills += d.kills;
                totals[d.weapon].deaths += d.deaths;
                totals[d.weapon].shots += d.shots;
                totals[d.weapon].hits += d.hits;
                totals[d.weapon].damage += d.damage;

            }

            for(const [key, value] of Object.entries(totals)){

                await this.reduceTotals(parseInt(key), value, true)
            }


            await this.deleteAllPlayerMatchData(playerId);
            await this.deleteAllPlayerTotals(playerId);

        }catch(err){
            console.trace(err);
        }
    }

    async getMatches(ids){

        if(ids.length === 0) return [];

        return await mysql.simpleFetch("SELECT * FROM nstats_player_weapon_match WHERE match_id IN(?)", [ids]);
    }

    async deleteMatchesData(matchIds){

        if(matchIds.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_player_weapon_match WHERE match_id IN(?)", [matchIds]);
    }

    async reduceTotalsAlt(weaponId, matches, data){

        const query = `UPDATE nstats_weapons SET
        matches=matches-?,
        kills=kills-?,
        deaths=deaths-?,
        shots=shots-?,
        hits=hits-?,
        damage=damage-?,
        accuracy = IF(shots > 0 && hits > 0, (hits / shots) * 100, IF(hits > 0, 100, 0))
        WHERE id=?`;

        const vars = [
            matches,
            data.kills,
            data.deaths,
            data.shots,
            data.hits,
            data.damage,
            weaponId
        ];

        await mysql.simpleUpdate(query, vars);
    }

    async deleteMatches(gametypeId, matchIds){

        try{

            if(matchIds.length === 0) return;

            const playerData = await this.getMatches(matchIds);

            const totals = {};

            const weaponTotals = {};

            let p = 0;

            let current = 0;

            for(let i = 0; i < playerData.length; i++){

                p = playerData[i];

                if(totals[p.player_id] === undefined){

                    totals[p.player_id] = {};     
                }

                if(weaponTotals[p.weapon_id] === undefined){

                    weaponTotals[p.weapon_id] = {
                        "kills": 0,
                        "deaths": 0,
                        "shots": 0,
                        "hits": 0,
                        "damage": 0,
                        "matchIds": []
                    };
                }

                weaponTotals[p.weapon_id].kills += p.kills;
                weaponTotals[p.weapon_id].deaths += p.deaths;
                weaponTotals[p.weapon_id].shots += p.shots;
                weaponTotals[p.weapon_id].hits += p.hits;
                weaponTotals[p.weapon_id].damage += p.damage;

                if(weaponTotals[p.weapon_id].matchIds.indexOf(p.match_id) === -1){
                    weaponTotals[p.weapon_id].matchIds.push(p.match_id);
                }

                if(totals[p.player_id][p.weapon_id] === undefined){

                    totals[p.player_id][p.weapon_id] = {
                        "matches": 0,
                        "kills": 0,
                        "deaths": 0,
                        "shots": 0,
                        "hits": 0,
                        "damage": 0
                    };
                }

                current = totals[p.player_id][p.weapon_id];

                current.matches++;

                current.kills += p.kills;
                current.deaths += p.deaths;
                current.shots += p.shots;
                current.hits += p.hits;
                current.damage += p.damage;
   
            }


            for(const [player, weapons] of Object.entries(totals)){

                for(const [weapon, data] of Object.entries(weapons)){

                    await this.reducePlayerGametypeTotals(gametypeId, parseInt(player), parseInt(weapon), data);
                }
            }

            await this.deleteMatchesData(matchIds);

            //reduce weapon totals


            for(const [weapon, data] of Object.entries(weaponTotals)){

                await this.reduceTotalsAlt(parseInt(weapon), data.matchIds.length, data)
            }


        }catch(err){
            console.trace(err);
        }
    }


    /**
     * Reduce player totals for the selected gametype totals and gametype 0
     * @param {*} gametypeId 
     * @param {*} playerId 
     * @param {*} weaponId 
     * @param {*} data 
     */
    async reducePlayerGametypeTotals(gametypeId, playerId, weaponId, data){

        const query = `UPDATE nstats_player_weapon_totals SET 
            matches=matches-?,
            kills=kills-?,
            deaths=deaths-?,
            shots=shots-?,
            hits=hits-?,
            damage=damage-?,
            accuracy= IF(shots > 0, IF(hits > 0, (hits / shots) * 100, 0) ,0))
            WHERE gametype IN(?) AND player_id=? AND weapon=?
            
        `;

        const vars = [
            data.matches,
            data.kills,
            data.deaths,
            data.shots,
            data.hits,
            data.damage,
            [gametypeId, 0],
            playerId,
            weaponId,
        ];

        await mysql.simpleUpdate(query, vars);
    }
}


module.exports = Weapons;