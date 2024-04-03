const mysql = require('./database.js');
const Message = require('./message');
const fs = require('fs');

class Weapons{

    constructor(){

        this.weaponNames = [];
    }

    async exists(name){

        const query = "SELECT COUNT(*) as total_matches FRON nstats_weapons WHERE name=?";

        const result = await mysql.simpleQuery(query, [name]);

        if(result[0].total_matches >= 1) return true;

        return false;
    }


    async create(name){

        const query = "INSERT INTO nstats_weapons VALUES(NULL,?,0,0,0,0,0,0,0)";

        const result = await mysql.simpleQuery(query, [name]);

        return result.insertId;

    }

    async update(weapon, kills, deaths, shots, hits, damage){

        damage = Math.abs(damage);

        const query = `UPDATE nstats_weapons SET matches=matches+1,kills=kills+?,deaths=deaths+?,shots=shots+?,hits=hits+?,damage=damage+?,
            accuracy=IF(hits > 0 AND shots > 0, (hits/shots)*100, IF(hits > 0, 100,0))
            WHERE id=?`;
        
        return await mysql.simpleQuery(query, [kills, deaths, shots, hits, damage, weapon]);

    }

    async getIdsByNamesQuery(names){

        const query = "SELECT * FROM nstats_weapons WHERE name IN (?)";

        return await mysql.simpleQuery(query, [names]);
    }



    async getIdsByName(names){

        try{

            if(names.indexOf("None") === -1){
                names.push('None');
            }

            const current = await this.getIdsByNamesQuery(names);

            const currentNames = current.map((weapon) =>{
                return weapon.name;
            });

            for(let i = 0; i < names.length; i++){

                const name = names[i];

                if(currentNames.indexOf(name) === -1){       

                    const currentId = await this.create(name); 

                    current.push({"id": currentId, "name": name});
             
                    new Message(`Inserted new weapon ${name} into database.`,'pass');

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

    /*async insertPlayerMatchStats(matchId, mapId, gametypeId, playerId, weaponId, stats){

        const query = "INSERT INTO nstats_player_weapon_match VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        const vars = [
            matchId, mapId, gametypeId, playerId, weaponId, stats.kills, stats.bestKills, stats.deaths, stats.suicides,
            stats.teamKills, stats.bestTeamKills,
            stats.accuracy, stats.shots, stats.hits, Math.abs(stats.damage), stats.efficiency
        ];

        return await mysql.simpleQuery(query, vars);

    }*/

    async bulkInsertPlayerMatchStats(data){

        const query = `INSERT INTO nstats_player_weapon_match (
            match_id,map_id,gametype_id,player_id,weapon_id,kills,best_kills,
            deaths,suicides,team_kills,best_team_kills,accuracy,shots,hits,damage,efficiency
        ) VALUES ?`;

        return await mysql.bulkInsert(query, data);
    }


    async bPlayerTotalExists(mapId, gametypeId, playerId, weaponId){

        const query = "SELECT COUNT(*) as total_stats FROM nstats_player_weapon_totals WHERE player_id=? AND map_id=? AND gametype=? AND weapon=?";
        const result = await mysql.simpleQuery(query, [playerId, mapId, gametypeId, weaponId]);

        if(result[0].total_stats > 0) return true;
        return false;

    }

    async updatePlayerTotals(mapId, gametypeId, playerId, weaponId, playtime, stats){

        const query = `UPDATE nstats_player_weapon_totals SET playtime=playtime+?,kills=kills+?, 
            deaths=deaths+?, shots=shots+?, hits=hits+?, damage=damage+?,
            accuracy=IF(hits > 0 && shots > 0, (hits/shots) * 100, IF(hits > 0, 100, 0)), 
            efficiency=IF(kills > 0 && deaths > 0, (kills/(kills + deaths)) * 100, IF(kills > 0, 100, 0)),
            matches=matches+1, team_kills=team_kills+?
            WHERE player_id=? AND weapon=? AND map_id=? AND gametype=?`;

        const vars = [
            playtime, 
            stats.kills, 
            stats.deaths, 
            stats.shots, 
            stats.hits, 
            Math.abs(stats.damage), 
            stats.teamKills, 
            playerId, 
            weaponId, 
            mapId,
            gametypeId
        ];

        return await mysql.simpleQuery(query, vars);

    }

    async updatePlayerTotalStats(mapId, gametypeId, playerId, playtime, weaponId, stats){

        try{
            /*
            //map totals
            if(!await this.bPlayerTotalExists(mapId, gametypeId, playerId, weaponId)){

                await this.createPlayerTotal(mapId, gametypeId, playerId, weaponId, playtime, 
                    stats.kills, stats.teamKills, stats.deaths, stats.suicides, stats.accuracy, 
                    stats.shots, stats.hits, stats.damage);

            }else{
               await this.updatePlayerTotals(mapId, gametypeId, playerId, weaponId, playtime, stats);
            }

            //gametype totals
            if(!await this.bPlayerTotalExists(0, gametypeId, playerId, weaponId)){

                await this.createPlayerTotal(0, gametypeId, playerId, weaponId, playtime,
                    stats.kills, stats.teamKills, stats.deaths, stats.suicides, stats.accuracy, 
                    stats.shots, stats.hits, stats.damage);

            }else{
               await this.updatePlayerTotals(0, gametypeId, playerId, weaponId, playtime, stats);
            }
            */
            //all totals
            if(!await this.bPlayerTotalExists(0, 0, playerId, weaponId)){

                await this.createPlayerTotal(0, 0, playerId, weaponId, playtime,
                    stats.kills, stats.teamKills, stats.deaths, stats.suicides, stats.accuracy, 
                    stats.shots, stats.hits, stats.damage);
            }else{
                await this.updatePlayerTotals(0, 0, playerId, weaponId, playtime, stats);
            }

        }catch(err){
            console.trace(err);
        } 
    }
    

    async getPlayerTotals(playerId){

        const query = `SELECT weapon,kills,team_kills,deaths,suicides,efficiency,accuracy,shots,hits,damage,matches
        FROM nstats_player_weapon_totals
        WHERE player_id=? AND map_id=0 AND gametype=0`;

        return await mysql.simpleQuery(query, [playerId]);
    }

    async getPlayerBest(playerId){

        const query = `SELECT weapon_id,kills,kills_best_life,team_kills,team_kills_best_life,deaths,suicides,efficiency,accuracy,shots,hits,damage
        FROM nstats_player_weapon_best
        WHERE player_id=? AND gametype_id=0 AND map_id=0`;

        return await mysql.simpleQuery(query, [playerId]);

    }

    async getAllPlayerTotals(id){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_weapon_totals WHERE player_id=?", [id]);
    }

    async getAllNames(){

        const query = "SELECT id,name FROM nstats_weapons";

        return await mysql.simpleFetch(query);
    }

    async getNamesByIds(ids, bReturnObject){

        if(bReturnObject === undefined) bReturnObject = false;

        if(ids.length === 0){
            return (bReturnObject) ? {} : [];
        }

        const query = "SELECT id,name FROM nstats_weapons WHERE id IN(?)";
        const result =  await mysql.simpleQuery(query, [ids]);

        if(!bReturnObject) return result;

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            data[r.id] = r.name;
        }

        return data;
    }


    async getImageList(){

        try{

            const files = fs.readdirSync('public/images/weapons/');

            const images = [];

            for(let i = 0; i < files.length; i++){

                const f = files[i];

                const result = /^(.+)\.png$/i.exec(f);

                if(result === null){
                    console.log(`Warning: weapons.getImageList() result is null for file ${f}`);
                    continue;
                }

                images.push(result[1]);
            }

            return images;

        }catch(err){
            console.trace(err);
        }
    }

    async getImages(weaponNames){

        if(weaponNames.length === 0) return {};

        const imageList = await this.getImageList();

        const weaponToImage = {};

        for(const [weaponId, weaponName] of Object.entries(weaponNames)){

            const cleanName = weaponName.replace(" ", "").toLowerCase();

            const index = imageList.indexOf(cleanName);

            if(index !== -1){
                weaponToImage[weaponId] = cleanName;
            }else{
                weaponToImage[weaponId] = "default";
            }
        }


        return weaponToImage;
    }


    async getMatchPlayerData(id){

        const query = `SELECT player_id,weapon_id,kills,best_kills,team_kills,best_team_kills,
        deaths,suicides,accuracy,shots,hits,damage,efficiency 
        FROM nstats_player_weapon_match WHERE match_id=? ORDER BY kills DESC, deaths ASC`;

        return await mysql.simpleQuery(query, [id]);

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

    async deletePlayerMatchData(id){

        const query = "DELETE FROM nstats_player_weapon_match WHERE match_id=?";
        return await mysql.simpleQuery(query, [id]);

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

    async changePlayerIdMatches(oldId, newId){

        const query = "UPDATE nstats_player_weapon_match SET player_id=? WHERE player_id=?";
        return await mysql.simpleQuery(query, [newId, oldId]);
    }

    async changePlayerIdTotals(oldId, newId){

        const query = "UPDATE nstats_player_weapon_totals SET player_id=? WHERE player_id=?";
        return await mysql.simpleQuery(query, [newId, oldId]);
    }


    async getCombinedMatchData(matchId, playerId, weaponId){

        const query = `SELECT 
            SUM(kills) as total_kills, 
            SUM(team_kills) as total_team_kills,
            SUM(deaths) as total_deaths, 
            SUM(suicides) as total_suicides,
            SUM(hits) as total_hits, 
            SUM(shots) as total_shots, 
            SUM(damage) as total_damage
            FROM nstats_player_weapon_match
            WHERE match_id=? AND player_id=? AND weapon_id=?`;

        const data = await mysql.simpleQuery(query, [matchId, playerId, weaponId]);

        if(data.length > 0){
            return data[0];
        }

        return null;
    }

    async deleteMatchRows(matchId, playerId, weaponId){

        const query = "DELETE FROM nstats_player_weapon_match WHERE match_id=? AND player_id=? AND weapon_id=?";
        return await mysql.simpleQuery(query, [matchId, playerId, weaponId]);
    }

    async insertMatchRow(matchId, mapId, gametypeId, playerId, weaponId, kills, bestKills, teamKills, bestTeamKills, deaths, suicides, accuracy, shots, hits, damage){

        let efficiency = 0;

        if(kills > 0){
            
            if(deaths > 0){
                efficiency = (kills / (deaths + kills)) * 100;
            }else{
                efficiency = 100;
            }
        }

        const query = "INSERT INTO nstats_player_weapon_match VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        const vars = [
            matchId, mapId, gametypeId, playerId, weaponId, kills, 
            bestKills ?? 0, teamKills, bestTeamKills ?? 0, deaths, suicides, 
            accuracy, shots, hits, damage, efficiency
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async mergePlayerMatchData(newId){

        const query = "SELECT match_id,map_id,gametype_id,weapon_id,COUNT(*) as total_entries FROM nstats_player_weapon_match WHERE player_id=? GROUP BY match_id, map_id, gametype_id, weapon_id";

        const result = await mysql.simpleQuery(query, [newId]);

        const needsRecalculation = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.total_entries > 1){
                needsRecalculation.push(r);
            }
        }

        for(let i = 0; i < needsRecalculation.length; i++){

            const n = needsRecalculation[i];
            
            const mergedData = await this.getCombinedMatchData(n.match_id, newId, n.weapon_id);

            if(mergedData !== null){

                await this.deleteMatchRows(n.match_id, newId, n.weapon_id);

                mergedData.accuracy = 0;

                if(mergedData.total_shots > 0){

                    if(mergedData.total_hits > 0){
                        mergedData.accuracy = (mergedData.total_hits / mergedData.total_shots) * 100;
                    }
                }

                await this.insertMatchRow(
                    n.match_id, 
                    n.map_id,
                    n.gametype_id,
                    newId, 
                    n.weapon_id, 
                    mergedData.total_kills,
                    mergedData.best_kills,
                    mergedData.total_team_kills,
                    mergedData.best_total_team_kills,
                    mergedData.total_deaths, 
                    mergedData.total_suicides, 
                    mergedData.accuracy, 
                    mergedData.total_shots, 
                    mergedData.total_hits, 
                    mergedData.total_damage
                );

            }else{
                console.log(`mergedData is null`);
            }
        }
    }

    async deletePlayerTotalData(playerId){

        const query = "DELETE FROM nstats_player_weapon_totals WHERE player_id=?";
        return await mysql.simpleQuery(query, [playerId]);
    }

    async mergePlayerTotalData(newId){

        const query = `SELECT 
        map_id,gametype,weapon,playtime,kills,team_kills,deaths,suicides,efficiency,accuracy,shots,hits,damage,matches 
        FROM nstats_player_weapon_totals WHERE player_id=?`;

        const data = await mysql.simpleQuery(query, [newId]);

        await this.deletePlayerTotalData(newId);

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(!await this.bPlayerTotalExists(d.map_id, d.gametype, newId, d.weapon)){

                await this.createPlayerTotalCustom(newId, d.map_id, d.gametype, d.weapon, d.playtime, d.kills, d.team_kills, 
                    d.deaths, d.suicides, d.efficiency, d.accuracy, d.shots, d.hits, d.damage, d.matches);
            }else{
                await this.updatePlayerTotalCustom(newId, d.map_id, d.gametype, d.weapon, d.playtime, d.kills, d.team_kills, d.deaths, d.suicides, 
                    d.efficiency, d.accuracy, d.shots, d.hits, d.damage, d.matches);
            }
        }
    }

    async createPlayerTotal(mapId, gametypeId, playerId, weaponId, playtime, kills, teamKills, deaths, suicides, accuracy, shots, hits, damage){

        const query = "INSERT INTO nstats_player_weapon_totals VALUES(NULL,?,?,?,?,?,?,?,?,?,0,?,?,?,?,1)";//13
        const vars = [playerId, mapId, gametypeId, playtime, weaponId, kills, teamKills, deaths, suicides, accuracy, shots, hits, Math.abs(damage)];

        return await mysql.simpleQuery(query, vars);

    }

    async createPlayerTotalCustom(playerId, mapId, gametypeId, weaponId, playtime, kills, teamKills, deaths, suicides, efficiency, accuracy, shots, hits, damage, matches){

        const query = "INSERT INTO nstats_player_weapon_totals VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        const vars = [playerId, mapId, gametypeId, playtime, weaponId, kills, teamKills, deaths, suicides, efficiency, accuracy, shots, hits, damage, matches];
        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerTotalCustom(playerId, mapId, gametypeId, weaponId, playtime, kills, teamKills, deaths, suicides, efficiency, accuracy, shots, hits, damage, matches){

        const query = `UPDATE nstats_player_weapon_totals SET 
        playtime = playtime + ?,
        kills = kills + ?,
        team_kills = team_kills + ?,
        deaths = deaths + ?,
        suicides = suicides + ?,
        efficiency = IF(kills > 0, IF(deaths > 0, (kills / (kills + deaths)) * 100 ,100), 0),
        shots = shots + ?,
        hits = hits + ?,
        accuracy = IF(shots > 0, IF(hits > 0, (hits / shots) * 100, 0), 0),
        damage = damage + ?,
        matches = matches + ?
        WHERE player_id=? AND map_id=? AND gametype=? AND weapon=?`;

        const vars = [playtime, kills, teamKills, deaths, suicides, shots, hits, damage, matches, playerId, mapId, gametypeId, weaponId];
        return await mysql.simpleQuery(query, vars);
    }

    async mergePlayers(oldId, newId){

        await this.changePlayerIdMatches(oldId, newId);
        await this.changePlayerIdTotals(oldId, newId);
        await this.changePlayerIdBest(oldId, newId);

        await this.mergePlayerMatchData(newId);
        await this.mergePlayerTotalData(newId);
        await this.mergePlayerBestData(newId);
       
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

    async bPlayerBestExist(playerId, mapId, gametypeId, weaponId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_weapon_best WHERE player_id=? AND map_id=? AND gametype_id=? AND weapon_id=?`;

        const result = await mysql.simpleQuery(query, [playerId, mapId, gametypeId, weaponId]);

        if(result[0].total_matches > 0) return true;

        return false;
    }

    async createPlayerBest(playerId, mapId, gametypeId, weaponId, stats){

        const query = `INSERT INTO nstats_player_weapon_best VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vars = [playerId, mapId, gametypeId, weaponId,
            stats.kills,
            stats.bestKills,
            stats.teamKills,
            stats.bestTeamKills,
            stats.deaths,
            stats.suicides,
            stats.efficiency,
            stats.accuracy,
            stats.shots,
            stats.hits,
            stats.damage
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerBestQuery(playerId, mapId, gametypeId, weaponId, stats){

        const query = `UPDATE nstats_player_weapon_best SET
        kills = IF(kills < ?, ?, kills),
        kills_best_life = IF(kills_best_life < ?, ?, kills_best_life),
        team_kills = IF(team_kills < ?, ?, team_kills),
        team_kills_best_life = IF(team_kills_best_life < ?, ?, team_kills_best_life),
        deaths = IF(deaths < ?, ?, deaths),
        suicides = IF(suicides < ?, ?, suicides),
        efficiency = IF(efficiency < ?, ?, efficiency),
        accuracy = IF(accuracy < ?, ?, accuracy),
        shots = IF(shots < ?, ?, shots),
        hits = IF(hits < ?, ?, hits),
        damage = IF(damage < ?, ?, damage)
        WHERE player_id=? AND map_id=? AND gametype_id=? AND weapon_id=?`;

        const vars = [
            stats.kills, stats.kills,
            stats.bestKills, stats.bestKills,
            stats.teamKills, stats.teamKills,
            stats.bestTeamKills, stats.bestTeamKills,
            stats.deaths, stats.deaths,
            stats.suicides, stats.suicides,
            stats.efficiency, stats.efficiency,
            stats.accuracy, stats.accuracy,
            stats.shots, stats.shots,
            stats.hits, stats.hits,
            stats.damage, stats.damage,
            playerId, mapId, gametypeId, weaponId
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerBest(playerId, mapId, gametypeId, weaponId, stats){

        /*//map totals
        if(!await this.bPlayerBestExist(playerId, mapId, gametypeId, weaponId)){
            await this.createPlayerBest(playerId, mapId, gametypeId, weaponId, stats);
        }else{
            await this.updatePlayerBestQuery(playerId, mapId, gametypeId, weaponId, stats);
        }

        //gametype totals
        if(!await this.bPlayerBestExist(playerId, 0, gametypeId, weaponId)){
            await this.createPlayerBest(playerId, 0, gametypeId, weaponId, stats);
        }else{
            await this.updatePlayerBestQuery(playerId, 0, gametypeId, weaponId, stats);
        }*/

        //all totals
        if(!await this.bPlayerBestExist(playerId, 0, 0, weaponId)){
            await this.createPlayerBest(playerId, 0, 0, weaponId, stats);
        }else{
            await this.updatePlayerBestQuery(playerId, 0, 0, weaponId, stats);
        }
    }

    async changePlayerIdBest(oldId, newId){

        const query = `UPDATE nstats_player_weapon_best SET player_id=? WHERE player_id=?`;

        return await mysql.simpleQuery(query, [newId, oldId]);
    }


    async deletePlayerBest(playerId){

        const query = `DELETE FROM nstats_player_weapon_best WHERE player_id=?`;

        return await mysql.simpleQuery(query, [playerId])
    }

    async mergePlayerBestData(playerId){

        const query = `SELECT player_id,map_id,gametype_id,weapon_id,
        COUNT(*) as total_entries,
        MAX(kills) as kills,
        MAX(kills_best_life) as bestKills,
        MAX(team_kills) as teamKills,
        MAX(team_kills_best_life) as bestTeamKills,
        MAX(deaths) as deaths,
        MAX(suicides) as suicides,
        MAX(efficiency) as efficiency,
        MAX(accuracy) as accuracy,
        MAX(shots) as shots,
        MAX(hits) as hits,
        MAX(damage) as damage
        FROM nstats_player_weapon_best
        WHERE player_id=?
        GROUP BY player_id,map_id,gametype_id,weapon_id`;

        const result = await mysql.simpleQuery(query, [playerId]);

        await this.deletePlayerBest(playerId);

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            await this.createPlayerBest(r.player_id, r.map_id, r.gametype_id, r.weapon_id, r);

        }
    }




    async getMissingPlayerWeaponTotals(mapId, gametypeId, weaponIds, playerIds){

        if(weaponIds.length === 0 || playerIds.length === 0) return;

        const query = `SELECT player_id,weapon FROM nstats_player_weapon_totals WHERE map_id=? AND gametype=? AND weapon IN ? AND player_id IN ?`;

        const result = await mysql.simpleQuery(query, [mapId, gametypeId, [weaponIds], [playerIds]]);

        const foundData = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(foundData[r.player_id] === undefined){
                foundData[r.player_id] = [];
            }

            foundData[r.player_id].push(r.weapon);
        }

        const missing = {};

        for(let i = 0; i < playerIds.length; i++){

            const p = playerIds[i];

            if(foundData[p] === undefined){
                
                missing[p] = [...weaponIds];
                //missing.push({"playerId": p, "weapons": [...weaponIds]});
                continue;
            }

            for(let x = 0; x < weaponIds.length; x++){

                const w = weaponIds[x];

                if(foundData[p] === undefined || foundData[p].indexOf(w) === -1){

                    if(missing[p] === undefined){
                        missing[p] = [];
                    }

                    missing[p].push(w);
                }
            }
        }

        return missing;
    }


    async createMissingPlayerTotalData(data, mapId, gametypeId){

        const query = `INSERT INTO nstats_player_weapon_totals 
        (player_id,map_id,gametype,playtime,weapon,kills,team_kills,deaths,suicides,efficiency,accuracy,shots,hits,damage,matches) VALUES ?`;

        const insertVars = [];

        for(const [playerId, value] of Object.entries(data)){


            for(let i = 0; i < value.length; i++){
                insertVars.push([parseInt(playerId), mapId, gametypeId, 0, value[i],0,0,0,0,0,0,0,0,0,0]);
            }    
        }   

        return await mysql.bulkInsert(query, insertVars);
    }

    async bulkUpdatePlayerTotals(data){
          
        let query = "";

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            query += `UPDATE nstats_player_weapon_totals SET 
            playtime=playtime+${d.playtime},
            kills=kills+${d.kills},
            team_kills=team_kills+${d.teamKills},
            deaths=deaths+${d.deaths},
            suicides=suicides+${d.suicides},
            shots=shots+${d.shots},
            hits=hits+${d.hits},
            efficiency=IF(kills > 0, IF(deaths > 0,  (kills / (kills+deaths)) * 100, 100), 0),
            accuracy=IF(hits > 0, IF(shots > 0, (hits / shots) * 100, 100),0),     
            damage=damage+${d.damage},
            matches=matches+${d.matches}
            WHERE player_id=${d.playerId} AND weapon=${d.weaponId} AND gametype=${d.gametypeId} AND map_id=${d.mapId} LIMIT 1;`;
        }

        await mysql.simpleQuery(query);     
    }

    async getCurrentPlayerTotals(mapId, gametypeId, playerIds, weaponIds){

        const query = `SELECT * FROM nstats_player_weapon_totals WHERE map_id=? AND gametype=? AND player_id IN(?) AND weapon IN(?)`;

        const result = await mysql.simpleQuery(query, [mapId, gametypeId, playerIds, weaponIds]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(data[r.weapon] === undefined){
                data[r.weapon] = {};
            }

            data[r.weapon][r.player_id] = r;
        }

        return data;
    }

    async deleteTotalPlayerDataRowsById(ids){

        if(ids.length === 0) return;

        const query = `DELETE FROM nstats_player_weapon_totals WHERE id IN (?)`;

        return await mysql.simpleQuery(query, [ids]);
    }

    async insertNewPlayerTotalStats(data){

        const query = `INSERT INTO nstats_player_weapon_totals 
        (player_id, map_id, gametype, playtime, weapon, kills, team_kills, deaths, suicides, efficiency, accuracy, shots, hits, damage, matches) VALUES ?`;

        const insertVars = [];

        for(const [weaponId, playerData] of Object.entries(data)){

            for(const [playerId, weaponStats] of Object.entries(playerData)){
  
                insertVars.push([
                    playerId,
                    weaponStats.map_id,
                    weaponStats.gametype,
                    weaponStats.playtime,
                    weaponId,
                    weaponStats.kills,
                    weaponStats.team_kills,
                    weaponStats.deaths,
                    weaponStats.suicides,
                    weaponStats.efficiency,
                    weaponStats.accuracy,
                    weaponStats.shots,
                    weaponStats.hits,
                    weaponStats.damage,
                    weaponStats.matches
                ]);
            }
        }

        await mysql.bulkInsert(query, insertVars);
    }


    async deleteOldTotalData(gametypeId, mapId, playerIds, weaponIds){

        const query = `DELETE FROM nstats_player_weapon_totals WHERE gametype=? AND map_id=? AND player_id IN (?) AND weapon IN (?)`;

        return await mysql.simpleQuery(query, [gametypeId, mapId, playerIds, weaponIds]);
    }


    async changeMatchGametypes(oldId, newId){

        const query = `UPDATE nstats_player_weapon_match SET gametype_id=? WHERE gametype_id=?`;

        return await mysql.simpleQuery(query, [newId, oldId]);
    }

    async changeTotalsGametypes(oldId, newId){

        const query = `UPDATE nstats_player_weapon_totals SET gametype=? WHERE gametype=?`;

        return await mysql.simpleQuery(query, [newId, oldId]);
    }

    async getDuplicateTotalsData(gametypeId){

        const query = `SELECT player_id,weapon,map_id,gametype,COUNT(*) as total_matches FROM nstats_player_weapon_totals WHERE gametype=? GROUP BY player_id,map_id,weapon`;

        const result = await mysql.simpleQuery(query, [gametypeId]);

        const duplicates = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.total_matches < 2) continue;

            duplicates.push(r);
        }

        return duplicates;
    }

    async deletePlayerTotalDataCustom(playerId, gametypeId, mapId, weaponId){

        const query = `DELETE FROM nstats_player_weapon_totals WHERE player_id=? AND gametype=? AND map_id=? AND weapon=?`;

        return await mysql.simpleQuery(query, [playerId, gametypeId, mapId, weaponId]);
    }

    async combineTotalsData(playerId, gametypeId, mapId, weaponId){

        const fetchQuery = `SELECT 
        SUM(playtime) as playtime,
        SUM(kills) as kills,
        SUM(team_kills) as team_kills,
        SUM(deaths) as deaths,
        SUM(suicides) as suicides,
        SUM(shots) as shots,
        SUM(hits) as hits,
        SUM(damage) as damage,
        SUM(matches) as matches
        FROM nstats_player_weapon_totals WHERE player_id=? AND gametype=? AND map_id=? AND weapon=?`;

        const result = await mysql.simpleQuery(fetchQuery, [playerId, gametypeId, mapId, weaponId]);

        if(result.length === 0) return;

        await this.deletePlayerTotalDataCustom(playerId, gametypeId, mapId, weaponId);

        const r = result[0];

        let accuracy = 0;
        let efficiency = 0;

        if(r.shots > 0){
            if(r.hits > 0){
                accuracy = (r.hits / r.shots) * 100;
            }
        }

        if(r.kills > 0){
            if(r.deaths > 0){
                efficiency = (r.kills / (r.kills + r.deaths)) * 100;
            }else{
                efficiency = 100;
            }
        }

        await this.createPlayerTotalCustom(
            playerId, 
            mapId, 
            gametypeId, 
            weaponId, 
            r.playtime, 
            r.kills, 
            r.team_kills, 
            r.deaths, 
            r.suicides, 
            efficiency, 
            accuracy, 
            r.shots, 
            r.hits, 
            r.damage, 
            r.matches
        );
    }

    async fixDuplicateTotalsData(gametypeId){

        const duplicates = await this.getDuplicateTotalsData(gametypeId);
        
        for(let i = 0; i < duplicates.length; i++){

            const d = duplicates[i];

            await this.combineTotalsData(d.player_id, d.gametype, d.map_id, d.weapon);
        }
    }

    async mergeGametypes(oldId, newId){

        await this.changeMatchGametypes(oldId, newId);
        await this.changeTotalsGametypes(oldId, newId);
    }


    async fixMapDuplicateBestData(mapId){

        const query = `SELECT player_id,gametype_id,COUNT(*) as total_rows FROM nstats_player_weapon_best GROUP BY player_id, gametype_id`;
    
        const result = await mysql.simpleQuery(query, [mapId]);

        console.log(result);
    }



    async changeMapId(oldId, newId){

        const tables = [
            //"player_weapon_best",
            "player_weapon_match",
           // "player_weapon_totals"
        ];

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const query = `UPDATE nstats_${t} SET map_id=? WHERE map_id=?`;
            await mysql.simpleQuery(query, [newId, oldId]);
        }

        //await this.fixMapDuplicateBestData(newId);
        // looks like I disabled these stats a while ago...
    }
}


module.exports = Weapons;