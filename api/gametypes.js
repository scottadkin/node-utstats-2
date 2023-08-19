const mysql = require('./database');
const Message = require('./message');
const CTF = require('./ctf');
const Assault = require('./assault');
const Domination = require('./domination');
const Faces = require('./faces');
const Headshots = require('./headshots');
const Items = require('./items');
const Kills = require('./kills');
const Logs = require('./logs');
const Maps = require('./maps');
const Connections = require('./connections');
const Pings = require('./pings');
const Weapons = require('./weapons');
const Rankings = require('./rankings');
const Servers = require('./servers');
const Voices = require('./voices');
const Winrate = require('./winrate');
const fs = require('fs');

class Gametypes{

    constructor(){


    }

    async bExists(name){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_gametypes WHERE name=?`;
        const result = await mysql.simpleQuery(query, [name]);

        if(result[0].total_matches > 0) return true;
        return false;
    }

    async create(name){

        if(name === undefined) throw new Error("Gametype name is undefined");

        if(await this.bExists(name)) throw new Error("Gametype already exists");

        const query = "INSERT INTO nstats_gametypes VALUES(NULL,?,0,0,0,0,0)";
        const result = await mysql.simpleQuery(query, [name]);

        return result.insertId;
    }

    getIdByName(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id FROM nstats_gametypes WHERE name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result[0] !== undefined){
                    resolve(result[0].id);
                }

                resolve(null);

            });
        });
    }

    updateQuery(id, date, playtime){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_gametypes SET 
            first = IF(first > ? OR first = 0, ?, first),
            last = IF(last > ?, last, ?),
            playtime=playtime+?,
            matches=matches+1
            WHERE id=?`;

            const vars = [date,date,date,date,playtime,id];

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result.affectedRows > 0){
                    resolve(true);
                }

                resolve(false);

            });
        });
    }


    async updateStats(name, date, playtime){

        try{

            let id = await this.getGametypeId(name, true);

            const autoMergeId = await this.getGametypeAutoMergeId(id);

            if(autoMergeId !== null){
                new Message(`Gametype has an auto merge id of ${autoMergeId}.`,"note");
                id = autoMergeId;
                this.currentMatchGametype = id;
            }


            const bPassed = await this.updateQuery(id, date, playtime);

            if(bPassed){
                new Message(`Inserted gametype info into database.`,'pass');
            }else{
                new Message(`Failed to update gametype database.`,'warning');
            }


        }catch(err){
            new Message(err, 'error');
        }
    }



    async getGametypeId(name, bCreate){

        try{

            new Message(`Gametype is ${name}`,'note');

            let currentId = await this.getIdByName(name);
            
            if(currentId === null){

                if(bCreate !== undefined){

                    new Message(`A gametype with that name does not have an id yet, creating one now.`,'note');

                    const newId = await this.create(name);

                    new Message(`Gametype ${name} has been inserted to database with the id of ${newId}`,'note');

                    return newId;

                }else{
                    new Message(`A gametype with that name does not have an id yet, bCreate is undefined a new one will not be created.`,'note');
                }
                
                return null;

            }else{
                return currentId;
            }

        }catch(err){
            new Message(err,'warning');
        }
    }

    async getName(id){

        const query = "SELECT name FROM nstats_gametypes WHERE id=?";

        const result = await mysql.simpleQuery(query, [id]);

        if(result.length > 0){
            return result[0].name;
        }

        return "Not Found";
    }

    async getNames(ids){

        if(ids.length === 0) return {};

        const query = "SELECT id,name FROM nstats_gametypes WHERE id IN(?)";

        const result = await mysql.simpleQuery(query, [ids]);

        const data = {"0": "Combined"};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = r.name;
        }

        return data;

    }


    async getAllNames(){


        const query = "SELECT id,name FROM nstats_gametypes ORDER BY name ASC";
        const result = await mysql.simpleQuery(query);
        
        const data = {};

        for(let i = 0; i < result.length; i++){

            data[result[i].id] = result[i].name
        }

        return data;
    }


    getMostPlayed(limit){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_gametypes ORDER BY matches DESC LIMIT ?";

            mysql.query(query, [limit], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    reduceMatchStats(gametype, playtime){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_gametypes SET matches=matches-1, playtime=playtime-? WHERE id=?";

            mysql.query(query, [playtime, gametype], (err) =>{

                if(err) reject(err);

                resolve([]);
            });
        });
    }

    async getAll(){
        return await mysql.simpleFetch("SELECT * FROM nstats_gametypes ORDER BY name ASC");
    }


    async bNameInUse(name){

        try{

            const result = await mysql.simpleFetch("SELECT COUNT(*) as same_names FROM nstats_gametypes WHERE name=?", [name]);

            if(result[0].same_names > 0) return true;

            return false;

        }catch(err){
            console.trace(err);
            return true;
        }
    }


    async rename(id, newName){

        if(!await this.bNameInUse(newName)){

            return await mysql.updateReturnAffectedRows("UPDATE nstats_gametypes SET name=? WHERE id=?", [newName, id]);

        }else{
            console.log(`gametype name already in use`);
            return 0;
        }
    }

    async changeMatchGametypes(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_matches SET gametype=? WHERE gametype=?", [newId, oldId]);
    }

    async changePlayerMatchGametypes(oldId, newId){
        await mysql.simpleUpdate("UPDATE nstats_player_matches SET gametype=? WHERE gametype=?", [newId, oldId]);
    }

    async changePlayerTotalsGametype(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_player_totals SET gametype=? WHERE gametype=?", [newId, oldId]);
    }

    async getOldIdPlayerGametypeTotals(oldId){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_totals WHERE gametype=?", [oldId]);
    }

    async mergePlayerGametypeTotals(data, newId){

        try{

            const query = `UPDATE nstats_player_totals SET
            matches=matches+?,
            wins=wins+?,
            losses=losses+?,
            draws=draws+?,
            winrate = IF(wins > 0, (wins / matches) * 100, 0),
            playtime=playtime+?,
            first_bloods=first_bloods+?,
            frags=frags+?,
            score=score+?,
            kills=kills+?,
            deaths=deaths+?,
            suicides=suicides+?,
            team_kills=team_kills+?,
            spawn_kills=spawn_kills+?,
            efficiency = IF (kills > 0, 
                    IF(deaths > 0, (kills / (deaths + kills) * 100), 100), 
                    0
            ),
            multi_1=multi_1+?,
            multi_2=multi_2+?,
            multi_3=multi_3+?,
            multi_4=multi_4+?,
            multi_5=multi_5+?,
            multi_6=multi_6+?,
            multi_7=multi_7+?,
            multi_best = IF(multi_best < ?, ?, multi_best),
            spree_1=spree_1+?,
            spree_2=spree_2+?,
            spree_3=spree_3+?,
            spree_4=spree_4+?,
            spree_5=spree_5+?,
            spree_6=spree_6+?,
            spree_7=spree_7+?,
            spree_best = IF(spree_best < ?, ?, spree_best),
            fastest_kill = IF(fastest_kill > ?, ?, fastest_kill),
            slowest_kill = IF(slowest_kill < ?, ?, slowest_kill),
            best_spawn_kill_spree = IF(best_spawn_kill_spree < ?, ?, best_spawn_kill_spree),
            assault_objectives=assault_objectives+?,
            dom_caps=dom_caps+?,
            dom_caps_best = IF(dom_caps_best < ?, ?, dom_caps_best),
            dom_caps_best_life = IF(dom_caps_best_life < ?, ?, dom_caps_best_life),
            k_distance_normal=k_distance_normal+?,
            k_distance_long=k_distance_long+?,
            k_distance_uber=k_distance_uber+?,
            headshots=headshots+?,
            shield_belt=shield_belt+?,
            amp=amp+?,
            amp_time=amp_time+?,
            invisibility=invisibility+?,
            invisibility_time=invisibility_time+?,
            pads=pads+?,
            armor=armor+?,
            boots=boots+?,
            super_health=super_health+?,
            
            mh_kills=mh_kills+?,
            mh_kills_best_life=IF(mh_kills_best_life < ?, ?, mh_kills_best_life),
            mh_kills_best=IF(mh_kills_best < ?, ?, mh_kills_best),
            mh_deaths=mh_deaths+?,
            mh_deaths_worst=IF(mh_deaths_worst < ?, ?, mh_deaths_worst)



            WHERE player_id=? AND gametype=?`;

            
            for(let i = 0; i < data.length; i++){

                const d = data[i];

                console.log(d.gametype, d.player_id, d.matches, d.playtime);
                const vars = [
                    d.matches,
                    d.wins,
                    d.losses,
                    d.draws,
                    d.playtime,
                    d.first_bloods,
                    d.frags,
                    d.score,
                    d.kills,
                    d.deaths,
                    d.suicides,
                    d.team_kills,
                    d.spawn_kills,
                    d.multi_1,
                    d.multi_2,
                    d.multi_3,
                    d.multi_4,
                    d.multi_5,
                    d.multi_6,
                    d.multi_7,
                    d.multi_best,
                    d.multi_best,
                    d.spree_1,
                    d.spree_2,
                    d.spree_3,
                    d.spree_4,
                    d.spree_5,
                    d.spree_6,
                    d.spree_7,
                    d.spree_best,
                    d.spree_best,
                    d.fastest_kill,
                    d.fastest_kill,
                    d.slowest_kill,
                    d.slowest_kill,
                    d.best_spawn_kill_spree,
                    d.best_spawn_kill_spree,
                    d.assault_objectives,
                    d.dom_caps,
                    d.dom_caps_best,
                    d.dom_caps_best,
                    d.dom_caps_best_life,
                    d.dom_caps_best_life,
                    d.k_distance_normal,
                    d.k_distance_long,
                    d.k_distance_uber,
                    d.headshots,
                    d.shield_belt,
                    d.amp,
                    d.amp_time,
                    d.invisibility,
                    d.invisibility_time,
                    d.pads,
                    d.armor,
                    d.boots,
                    d.super_health,

                    d.mh_kills,
                    d.mh_kills_best_life, d.mh_kills_best_life,
                    d.mh_kills_best, d.mh_kills_best,
                    d.mh_deaths,
                    d.mh_deaths_worst, d.mh_deaths_worst,


                    d.player_id,
                    newId
                ];

                await mysql.simpleUpdate(query, vars);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async deleteGametypePlayerTotals(oldId){

        await mysql.simpleDelete("DELETE FROM nstats_player_totals WHERE gametype=?", [oldId]);
    }


    async getWeaponTotals(id){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_weapon_totals WHERE gametype=?", [id]);
    }


    async insertPlayerGametypeWeaponTotal(gametype, data){

        try{

            const query = `INSERT INTO nstats_player_weapon_totals VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            
            let efficiency = 0;
            let accuracy = 0;

            if(data.shots > 0){

                if(data.hits > 0){
                    accuracy = (data.hits / data.shots) * 100;
                }
            }

            if(data.kills > 0){

                if(data.deaths > 0){

                    efficiency = (data.kills / (data.kills + data.deaths)) * 100

                }else{
                    efficiency = 100;
                }
            }

            const vars = [
                data.player_id,
                gametype,
                data.weapon,
                data.kills,
                data.deaths,
                efficiency,
                accuracy,
                data.shots,
                data.hits,
                data.damage,
                data.matches

            ];


            await mysql.simpleUpdate(query, vars);

        }catch(err){
            console.trace(err);
        }   
    }

    async updateWeaponPlayerTotal(gametype, data){

        try{

            const query = `UPDATE nstats_player_weapon_totals SET
            kills=Kills+?,
            deaths=deaths+?,
            efficiency = IF(kills > 0, IF(deaths > 0, (kills / (deaths + kills)) * 100 , 100)
            , 0),
            shots=shots+?,
            hits=hits+?,
            accuracy = IF(shots > 0, IF(hits > 0, (hits / shots) * 100 ,0) ,0),
            damage=damage+?,
            matches=matches+?
            WHERE gametype=? AND weapon=? AND player_id=?`;

            const vars = [
                data.kills,
                data.deaths,
                data.shots,
                data.hits,
                data.damage,
                data.matches,
                gametype,
                data.weapon,
                data.player_id
            ];


            const affectedRows = await mysql.updateReturnAffectedRows(query, vars);

            if(affectedRows === 0){

                await this.insertPlayerGametypeWeaponTotal(gametype, data);
            }

        }catch(err){
            console.trace(err);
        }
    }


    async deleteGametype(id){

        await mysql.simpleDelete("DELETE FROM nstats_gametypes WHERE id=?", [id]);

    }

    async getGametypeTotalsFromMatchData(gametypeId, bSeparateByMap){


        if(bSeparateByMap === undefined) bSeparateByMap = true;

        const query = `
        SELECT
        ${(bSeparateByMap) ? "map_id," : ""}
        player_id,
        COUNT(*) as total_matches,
        SUM(winner) as wins,
        SUM(draw) as draws,
        MIN(match_date) as first_match,
        MAX(match_date) as last_match,
        SUM(playtime) as playtime,
        SUM(team_0_playtime) as team_0_playtime,
        SUM(team_1_playtime) as team_1_playtime,
        SUM(team_2_playtime) as team_2_playtime,
        SUM(team_3_playtime) as team_3_playtime,
        SUM(spec_playtime) as spec_playtime,
        SUM(first_blood) as first_bloods,
        SUM(frags) as frags,
        SUM(score) as score,
        SUM(kills) as kills,
        SUM(deaths) as deaths,
        SUM(suicides) as suicides,
        SUM(team_kills) as team_kills,
        SUM(spawn_kills) as spawn_kills,
        AVG(efficiency) as efficiency,
        SUM(multi_1) as multi_1,
        SUM(multi_2) as multi_2,
        SUM(multi_3) as multi_3,
        SUM(multi_4) as multi_4,
        SUM(multi_5) as multi_5,
        SUM(multi_6) as multi_6,
        SUM(multi_7) as multi_7,
        MAX(multi_best) as multi_best,
        SUM(spree_1) as spree_1,
        SUM(spree_2) as spree_2,
        SUM(spree_3) as spree_3,
        SUM(spree_4) as spree_4,
        SUM(spree_5) as spree_5,
        SUM(spree_6) as spree_6,
        SUM(spree_7) as spree_7,
        MAX(spree_best) as spree_best,
        MAX(best_spawn_kill_spree) as best_spawn_kill_spree,
        SUM(assault_objectives) as assault_objectives,
        SUM(dom_caps) as dom_caps,
        MAX(dom_caps) as dom_caps_best,
        MAX(dom_caps_best_life) as dom_caps_best_life,
        MIN(ping_min) as ping_min,
        AVG(ping_average) as ping_average,
        MAX(ping_max) as ping_max,
        AVG(accuracy) as accuracy,
        MIN(shortest_kill_distance) as shortest_kill_distance,
        AVG(average_kill_distance) as average_kill_distance,
        MAX(longest_kill_distance) as longest_kill_distance,
        SUM(k_distance_normal) as k_distance_normal,
        SUM(k_distance_long) as k_distance_long,
        SUM(k_distance_uber) as k_distance_uber,
        SUM(headshots) as headshots,
        SUM(shield_belt) as shield_belt,
        SUM(amp) as amp,
        SUM(amp_time) as amp_time,
        SUM(invisibility) as invisibility,
        SUM(invisibility_time) as invisibility_time,
        SUM(pads) as pads,
        SUM(armor) as armor,
        SUM(boots) as boots,
        SUM(super_health) as super_health,
        SUM(mh_kills) as mh_kills,
        MAX(mh_kills) as mh_kills_best,
        MAX(mh_kills_best_life) as mh_kills_best_life,
        SUM(views) as views,
        SUM(mh_deaths) as mh_deaths,
        SUM(telefrag_kills) as telefrag_kills,
        SUM(telefrag_deaths) as telefrag_deaths,
        MAX(telefrag_best_spree) as telefrag_best_spree,
        MAX(telefrag_best_multi) as telefrag_best_multi,
        SUM(tele_disc_kills) as tele_disc_kills,
        SUM(tele_disc_deaths) as tele_disc_deaths,
        MAX(tele_disc_best_spree) as tele_disc_best_spree,
        MAX(tele_disc_best_multi) as tele_disc_best_multi
        FROM nstats_player_matches
        WHERE gametype=?
        GROUP BY player_id${(bSeparateByMap) ? ",map_id" : ""}`;

        const result = await mysql.simpleQuery(query, [gametypeId]);  

        if(bSeparateByMap) return result;
        
        if(result.length > 0) result[0].map_id = 0;
        return result;
    }


    async deleteGametypeTotals(gametypeId){

        const query = `DELETE FROM nstats_player_totals WHERE gametype=?`;

        return await mysql.simpleQuery(query, [gametypeId]);
    }

    

    async recalculateGametypeTotals(gametypeId, playerManager){


        await this.deleteGametypeTotals(gametypeId);
        const mapData = await this.getGametypeTotalsFromMatchData(gametypeId, true);

        for(let i = 0; i < mapData.length; i++){

            await playerManager.insertNewPlayerTotalFromData(gametypeId, mapData[i]);
        }

        const allTimeData = await this.getGametypeTotalsFromMatchData(gametypeId, false);

        if(allTimeData.length > 0){
            
            await playerManager.insertNewPlayerTotalFromData(gametypeId, allTimeData[0]);
            //console.log(allTimeData);
        }
        
        
    }

    async merge(oldId, newId, rankingManager, winrateManager, ctfManager, weaponsManager, playersManager){

        try{

            //const oldGametypePlayerTotals = await this.getOldIdPlayerGametypeTotals(oldId);

            await this.changeMatchGametypes(oldId, newId);
            await this.changePlayerMatchGametypes(oldId, newId);
           // await this.changePlayerTotalsGametype(oldId, newId);

            

           // console.log(oldGametypePlayerTotals);

            //merge player gametype totals here

            await this.recalculateGametypeTotals(newId, playersManager);
            //await this.mergePlayerGametypeTotals(oldGametypePlayerTotals, newId);
            await this.deleteGametypePlayerTotals(oldId);

            //TODO add ctf stuff here

            await ctfManager.mergeGametypes(oldId, newId);


            //TODO: Fix weapon stats
            await weaponsManager.mergeGametypes(oldId, newId);


            //update rankings

            await rankingManager.changeGametypeId(this, oldId, newId);

            await this.deleteGametype(oldId);

            await winrateManager.changeGametypeId(oldId, newId);

            await winrateManager.recalculateGametype(newId);

        }catch(err){
            console.trace(err);
        }
    }



    async delete(id){
        await mysql.simpleDelete("DELETE FROM nstats_gametypes WHERE id=?", [id]);
    }


    async deleteAllData(gametypeId, matchManager, playerManager, countriesManager){

        try{

            const matches = await matchManager.getAll(gametypeId);
            const playersData = await playerManager.getAllGametypeMatchData(gametypeId);


            const matchIds = [];
            const mapMatches = {};
            const mapStats = {};
            const serverStats = {};

            const playerIds = [];

            let m = 0;
            
            for(let i = 0; i < matches.length; i++){

                m = matches[i];

                matchIds.push(m.id);

                if(mapMatches[m.map] === undefined){
                    mapMatches[m.map] = 0;
                }

                mapMatches[m.map]++;

                if(mapStats[m.map] === undefined){
                    mapStats[m.map] = {
                        "matches": 0,
                        "playtime": 0
                    };
                }

                mapStats[m.map].matches++;
                mapStats[m.map].playtime += m.playtime;

                if(serverStats[m.server] === undefined){

                    serverStats[m.server] = {
                        "matches": 0,
                        "playtime": 0
                    };
                }

                serverStats[m.server].matches++;
                serverStats[m.server].playtime+=m.playtime;
            }



            let p = 0;

            for(let i = 0; i < playersData.length; i++){

                p = playersData[i];

                if(playerIds.indexOf(p.player_id) === -1){
                    playerIds.push(p.player_id);
                }
            }
            

            const countryUses = countriesManager.countCountriesUses(playersData);

            for(const [key, value] of Object.entries(countryUses)){
                await countriesManager.reduceUses(key, value);
            }

            
           // console.log(matchIds);
            //console.log(mapMatches);

            //console.log(`Trying to delete gametype ${gametypeId}`);
            //console.log(`Found ${matches.length} matches to delete.`);
            //console.log(`Found ${playersData.length} player data to delete.`);



            const assaultManager = new Assault();
            await assaultManager.deleteMatches(matchIds, mapMatches);

            const ctfManager = new CTF();
            await ctfManager.deleteMatches(matchIds);


            const domManager = new Domination();
            await domManager.deleteMatches(matchIds);

            const faceManager = new Faces();

            await faceManager.deleteViaPlayerMatchesData(playersData);

            const headshotsManager = new Headshots();  
            await headshotsManager.deleteMatches(matchIds);


            const itemsManager = new Items();

            await itemsManager.deleteMatches(matchIds);


            const killManager = new Kills();

            await killManager.deleteMatches(matchIds);

            await Logs.deleteMatches(matchIds);

            const mapsManager = new Maps();

            await mapsManager.reduceTotals(mapStats);
            await mapsManager.reducePlayersTotals(playersData);


            const connectionsManager = new Connections();

            await connectionsManager.deleteMatches(matchIds);

            const pingManager = new Pings();

            await pingManager.deleteMatches(matchIds);

            await playerManager.deleteMatches(matchIds, playersData, gametypeId);


            const weaponsManager = new Weapons();

            await weaponsManager.deleteMatches(gametypeId, matchIds);

            const rankingsManager = new Rankings();

            await rankingsManager.deleteGametype(gametypeId);

            const serverManager = new Servers();

            await serverManager.reduceMultipleTotals(serverStats);

            const voiceManager = new Voices();
            
            await voiceManager.reduceViaPlayerMatchData(playersData);

            const winrateManager = new Winrate();

            await winrateManager.deleteMatches(matchIds, gametypeId, playerIds);


            await matchManager.deleteMatches(matchIds);

            await this.delete(gametypeId);

        }catch(err){
            console.trace(err);
        }
    }


    getImages(){

        return fs.readdirSync("./public/images/gametypes/");
    }


    getSimilarImage(name, images){

        for(let i = 0; i < images.length; i++){

            if(name.includes(images[i])){
                return images[i];
            }
        }

        return null;
    }

    getMatchingImage(images, name, bStrict){

        let partialMatch = null;

        let currentPartial = null;

        for(let i = 0; i < images.length; i++){

            if(images[i] === name){
                return `${images[i]}.jpg`;
            }else{

                if(!bStrict){

                    currentPartial = this.getSimilarImage(name, images);

                    if(currentPartial !== null) partialMatch = `${currentPartial}.jpg`;
                }
            }
        }

        return partialMatch;
    }

    getMatchingImages(images, bStrict){
        

        if(images.length === 0) return [];

        const currentImages = this.getImages();

        for(let i = 0; i < currentImages.length; i++){

            currentImages[i] = currentImages[i].replace(/\.jpg/i, '');
        }

        const foundImages = {};

        for(let i = 0; i < images.length; i++){

            foundImages[images[i]] = this.getMatchingImage(currentImages, images[i], bStrict);
        }

        return foundImages;
    }

    async getAllPlayerMatchData(gametypeId){

        gametypeId = parseInt(gametypeId);

        if(gametypeId !== gametypeId){
            throw new Error(`GametypeId must be a valid integer`);
        }

        const query = "SELECT * FROM nstats_player_matches WHERE gametype=? ORDER BY match_date ASC";

        return await mysql.simpleQuery(query, [gametypeId]);
    }

    async getDropDownOptions(){

        const gametypeNames = await this.getAllNames();

        const options = [
            {"value": 0, "displayValue": "All Gametypes"}
        ];

        for(const [id, name] of Object.entries(gametypeNames)){

            options.push({
                "value": parseInt(id), "displayValue": name
            });
        }

        return options;
    }

    async getGametypeAutoMergeId(gametypeId){

        const query = `SELECT auto_merge_id FROM nstats_gametypes WHERE id=?`;

        const result = await mysql.simpleQuery(query, [gametypeId]);

        if(result.length > 0 && result[0].auto_merge_id !== 0){
            return result[0].auto_merge_id;
        }

        return null;
    }
}

module.exports = Gametypes;