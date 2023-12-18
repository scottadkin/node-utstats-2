const Player = require("./player");
const mysql = require("./database");
const Functions = require("./functions");
const Matches = require("./matches");
const Assault = require("./assault");
const CTF = require("./ctf");
const Domination = require("./domination");
const Headshots = require("./headshots");
const Items = require("./items");
const Kills = require("./kills");
const Connections = require("./connections");
const Pings = require("./pings");
const Maps = require("./maps");
const Weapons = require("./weapons");
const Rankings = require("./rankings");
const Winrate = require("./winrate");
const CountriesManager = require("./countriesmanager");
const Faces = require("./faces");
const Teams = require("./teams");
const Voices = require("./voices");
const Sprees = require("./sprees");
const MonsterHunt = require("./monsterhunt");
const Combogib = require("./combogib");
const PowerUps = require("./powerups");
const Telefrags = require("./telefrags");
const Message = require("./message");

class Players{

    constructor(){
        this.player = new Player();
    }


    //get all player all time total ids
    async getAllPlayerIds(){

        const query = `SELECT id FROM nstats_player_totals WHERE player_id=0`;

        const result = await mysql.simpleQuery(query);

        return result.map((r) =>{
            return r.id;
        });
    }

    debugGetAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_player_totals WHERE gametype=0 AND map=0 ORDER BY name ASC";

            const players = [];

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                Functions.removeIps(result);
                resolve(result);
            });
        });
    }

    async getTotalPlayers(name){

        let query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE gametype=0 AND map=0 AND playtime>0";
        let vars = [];

        if(name !== undefined){

            query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE gametype=0 AND map=0 AND playtime>0 AND name LIKE(?) ";
            vars = [`%${name}%`];
        }

        let result = 0;

        if(name === undefined){
            result = await mysql.simpleQuery(query);
        }else{
            result = await mysql.simpleQuery(query, vars);
        }

        return result[0].total_players;

    }


    async getTotalUniqueIps(name){

        let query = "SELECT COUNT(DISTINCT ip) as unique_ips FROM nstats_player_totals WHERE gametype=0";
        let vars = [];

        if(name !== undefined){

            query = "SELECT COUNT(DISTINCT ip) as unique_ips FROM nstats_player_totals WHERE gametype=0 AND name=?";
            vars = [name];
        }

        let result = 0;

        if(name === undefined){
            result = await mysql.simpleQuery(query);
        }else{
            result = await mysql.simpleQuery(query, vars);
        }

        return result[0].unique_ips;


    }

    async getMaxValues(types){

        try{

            const data = {};

            for(let i = 0; i < types.length; i++){

                data[types[i]] = await this.player.getMaxValue(types[i]);
            }

            return data;

        }catch(err){
            console.trace(err);
        }
    }


    getPlayers(page, perPage, sort, order, name){

        return new Promise((resolve, reject) =>{

            page = page - 1;

            const start = page * perPage;

            const validTypes = [
                "name",
                "country",
                "score",
                "frags",
                "kills",
                "playtime",
                "winrate",
                "wins",
                "loses",
                "draws",
                "matches",
                "first",
                "last",
                "deaths",
                "efficiency",
                "accuracy"
            ];

            sort = sort.toLowerCase();

            let index = validTypes.indexOf(sort);

            if(index === -1){
                index = 0;
            }

            if(order !== "ASC" && order !== "DESC"){
                order = "ASC";
            }

            let query = `SELECT * FROM nstats_player_totals WHERE gametype=0 AND map=0 AND playtime>0 ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;
            let vars = [start, perPage];

            if(name !== ""){
                query = `SELECT * FROM nstats_player_totals WHERE gametype=0 AND map=0 AND playtime>0 AND name LIKE(?) ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;
                vars = [`%${name}%`, start, perPage];
            }

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    Functions.removeIps(result);
                    resolve(result);
                }

                resolve([]);
            });
        });    
    }


    createNotFoundPlayers(foundStatus, bObject){

        const players = (bObject) ? {} : [];

        for(const [playerId, status] of Object.entries(foundStatus)){

            if(status) continue;

            const current = {"id": parseInt(playerId), "name": "Not Found", "country": "xx"};

            if(bObject){
                players[playerId] = current;
            }else{
                players.push(current);
            }
        }


        return players;
    }

    async getNamesByIds(ids, bReturnObject){

        if(ids === undefined) return [];
        if(ids.length === 0) return [];
        if(bReturnObject === undefined) bReturnObject = false;

        const query = "SELECT id,name,country,face FROM nstats_player_totals WHERE id IN (?)";

        const data = await mysql.simpleQuery(query, [ids]);

        const foundStatus = {};

        for(let i = 0; i < ids.length; i++){
            foundStatus[ids[i]] = false;
        }

        for(let i = 0; i < data.length; i++){

            const d = data[i];
            foundStatus[d.id] = true;
        }

        const missingPlayers = this.createNotFoundPlayers(foundStatus, bReturnObject);

        if(bReturnObject){

            const obj = {};

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                obj[d.id] = {
                    "name": d.name,
                    "country": d.country,
                    "face": d.face,
                    "id": d.id
                }
            }

            return {...obj, ...missingPlayers};
        }else{
            return [...data, ...missingPlayers];
        }
    }


    getAddictedPlayers(max, gametype){

        return new Promise((resolve, reject) =>{

            if(gametype === undefined) gametype = 0;

            const query = "SELECT id,name,country,matches,playtime,face,first,last FROM nstats_player_totals WHERE gametype=? ORDER BY playtime DESC LIMIT ?";

            mysql.query(query, [gametype, max], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getRecentPlayers(max){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,country,matches,playtime,face,first,last FROM nstats_player_totals WHERE gametype=0 AND playtime>0 ORDER BY last DESC LIMIT ?";

            mysql.query(query, [max], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    async getBestOfTypeTotal(validTypes, type, gametype, limit, page){

        if(gametype === undefined) gametype = 0;
        if(limit === undefined) limit = 25;
        if(page === undefined) page = 0;

        const start = page * limit;

        const typeIndex = validTypes.indexOf(type.toLowerCase());

        if(typeIndex === -1) return [];

        const query = `SELECT id as player_id,name,country,matches,last,playtime,${validTypes[typeIndex]} as value 
        FROM nstats_player_totals WHERE gametype=? ORDER BY ${validTypes[typeIndex]} DESC LIMIT ?, ?`;

        return await mysql.simpleQuery(query, [gametype, start, limit]);

    }


    async getTotalResults(gametype){

        const query = `SELECT COUNT(*) as total_results FROM nstats_player_totals WHERE gametype=?`;

        const result = await mysql.simpleQuery(query, [gametype]);

        if(result.length > 0){
            return result[0].total_results;
        }

        return 0;
    }

    async getBestMatchValueDetails(valid, type, playerId, value){

        type = type.toLowerCase();

        let index = valid.indexOf(type);

        if(index === -1) index = 0;

        const query = `SELECT player_id,match_id,map_id,match_date,country,playtime,${valid[index]} as value FROM 
        nstats_player_matches WHERE ${valid[index]}=? AND player_id=? LIMIT 1`;

        return await mysql.simpleQuery(query, [value, playerId]);

    }


    async getBestMatchValues(valid, type, page, perPage){


        type = type.toLowerCase();

        let index = valid.indexOf(type);

        if(index === -1) index = 0;

        if(page < 0) page = 0;

        perPage = parseInt(perPage);
        if(perPage !== perPage) perPage = 25;

        const start = perPage * page;

        const query = `SELECT MAX(${valid[index]}) as value, player_id
        FROM nstats_player_matches GROUP BY player_id ORDER BY value DESC LIMIT ?, ?`;

        const result = await mysql.simpleQuery(query, [start, perPage]);

        for(let i = 0; i < result.length; i++){

            const data = await this.getBestMatchValueDetails(valid, type, result[i].player_id, result[i].value);

            if(data.length > 0){
                result[i] = data[0];
            }
        }

        return result;
      
    }

    async getTotalBestMatchValues(valid, type){

        type = type.toLowerCase();

        let index = valid.indexOf(type);

        if(index === -1) index = 0;

        const query = `SELECT COUNT(DISTINCT player_id) as total_results FROM nstats_player_matches WHERE played=1`;
        const result = await mysql.simpleQuery(query);

        return result[0].total_results;
    }

    async getTotalMatchResults(gametype){
        
        let vars = [];
        let query = "SELECT COUNT(*) as total_matches FROM nstats_player_matches";

        if(gametype !== undefined){
            
            query = "SELECT COUNT(*) as total_matches FROM nstats_player_matches WHERE gametype=?"; 
            vars.push(gametype);
        }

        const result = await mysql.simpleQuery(query, vars);

        return result[0].total_matches;
    }


    getBestMatchRecord(valid, type){
        
        return new Promise((resolve, reject) =>{

            type = type.toLowerCase();

            let index = valid.indexOf(type);

            if(index === -1) index = 0;

            const query = `SELECT ${valid[index]} as value FROM nstats_player_matches ORDER BY ${valid[index]} DESC`;

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 0){
                        resolve(result);
                    }
                }

                resolve([{"value": 0}]);
            });
        });
    }



    async getJustNamesByIds(ids){

        if(ids === undefined || ids.length === 0) return {}

        const query = "SELECT id,name FROM nstats_player_totals WHERE gametype=0 AND id IN(?)";

        const result = await mysql.simpleQuery(query, [ids]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            data[r.id] = r.name;
        }

        return data;
    }

    async deleteMatchData(id){

        const query = "DELETE FROM nstats_player_matches WHERE match_id=?";
        return await mysql.simpleQuery(query, [id]);
    }




    async getPlayerTotalsFromMatchesTable(playerId, gametypeId, mapId){

        let query = `SELECT
        COUNT(*) as total_matches,
        player_id,
        COUNT(*) as total_matches,
        MIN(match_date) as first_match,
        MAX(match_date) as last_match,
        SUM(winner) as wins,
        SUM(draw) as draws,
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
        AVG(accuracy) as accuracy,
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
        MAX(mh_kills_best_life) as mh_kills_best_life,
        MAX(mh_kills) as mh_kills_best,
        SUM(mh_deaths) as mh_deaths,
        MAX(mh_deaths) as mh_deaths_worst,
        SUM(telefrag_kills) as telefrag_kills,
        MAX(telefrag_kills) as telefrag_kills_best,
        SUM(telefrag_deaths) as telefrag_deaths,
        MAX(telefrag_deaths) as telefrag_deaths_worst,
        MAX(telefrag_best_spree) as telefrag_best_spree,
        MAX(telefrag_best_multi) as telefrag_best_multi,
        SUM(tele_disc_kills) as tele_disc_kills,
        MAX(tele_disc_kills) as tele_disc_kills_best,
        SUM(tele_disc_deaths) as tele_disc_deaths,
        MAX(tele_disc_deaths) as tele_disc_deaths_worst,
        MAX(tele_disc_best_spree) as tele_disc_best_spree,
        MAX(tele_disc_best_multi) as tele_disc_best_multi
        FROM nstats_player_matches
        WHERE playtime>0 AND player_id=?`;

        const vars = [playerId];

        if(gametypeId !== 0){

            query += " AND gametype=?";

            vars.push(gametypeId);
        }

        if(mapId !== 0){

            query += " AND map_id=?";
            vars.push(mapId);
        }

        

        const result = await mysql.simpleQuery(query, vars);

        if(result.length > 0){

            result[0].efficiency = 0;

            if(result[0].total_matches === 0) return null;

            result[0].winRate = 0;
            result[0].losses = 0;

            if(result[0].total_matches > 0 && result[0].wins > 0){        
                result[0].winRate = (result[0].wins / result[0].total_matches) * 100;
            }

            result[0].losses = result[0].total_matches - result[0].draws - result[0].wins;

            if(result[0].kills > 0){

                if(result[0].deaths > 0){

                    result[0].efficiency = (result[0].kills / (result[0].kills + result[0].deaths)) * 100;

                }else{
                    result[0].efficiency = 100;
                }
            }

            return result[0];
        }

        return null;

    }

    async resetPlayerTotals(playerId, gametypeId, mapId){

        const query = `UPDATE nstats_player_totals SET
        first=0,
        last=0,
        matches=0,
        wins=0,
        losses=0,
        draws=0,
        winrate=0,
        playtime=0,
        team_0_playtime=0,
        team_1_playtime=0,
        team_2_playtime=0,
        team_3_playtime=0,
        spec_playtime=0,
        first_bloods=0,
        frags=0,
        score=0,
        kills=0,
        deaths=0,
        suicides=0,
        team_kills=0,
        spawn_kills=0,
        efficiency=0,
        multi_1=0,
        multi_2=0,
        multi_3=0,
        multi_4=0,
        multi_5=0,
        multi_6=0,
        multi_7=0,
        multi_best=0,
        spree_1=0,
        spree_2=0,
        spree_3=0,
        spree_4=0,
        spree_5=0,
        spree_6=0,
        spree_7=0,
        spree_best=0,
        fastest_kill=0,
        slowest_kill=0,
        best_spawn_kill_spree=0,
        assault_objectives=0,
        dom_caps=0,
        dom_caps_best=0,
        dom_caps_best_life=0,
        accuracy=0,
        k_distance_normal=0,
        k_distance_long=0,
        k_distance_uber=0,
        headshots=0,
        shield_belt=0,
        amp=0,
        amp_time=0,
        invisibility=0,
        invisibility_time=0,
        pads=0,
        armor=0,
        boots=0,
        super_health=0,
        mh_kills=0,
        mh_kills_best_life=0,
        mh_kills_best=0,
        mh_deaths=0,
        mh_deaths_worst=0
        WHERE ${(gametypeId !== 0 && mapId !== 0) ? "player_id" : "id"}=? AND gametype=? AND map=?`;

        return await mysql.simpleQuery(query, [playerId, gametypeId, mapId]);
    }

    
    async reduceTotals(playerIds, gametypeId, mapId){

        for(let i = 0; i < playerIds.length; i++){

            const playerId = playerIds[i];

            const playerGametypeMapTotals = await this.getPlayerTotalsFromMatchesTable(playerId, gametypeId, mapId);
            const playerGametypeTotals = await this.getPlayerTotalsFromMatchesTable(playerId, gametypeId, 0);
            const playerMapTotals = await this.getPlayerTotalsFromMatchesTable(playerId, 0, mapId);
            const playerTotals = await this.getPlayerTotalsFromMatchesTable(playerId, 0, 0);
            
            if(playerTotals === null){
                await this.resetPlayerTotals(playerId, 0, 0);
            }else{
                await this.updatePlayerTotal(playerId, 0, 0, playerTotals);
            }

            if(playerMapTotals === null){
                await this.resetPlayerTotals(playerId, 0, mapId);
            }else{
                await this.updatePlayerTotal(playerId, 0, mapId, playerMapTotals);
            }

            if(playerGametypeTotals === null){
                await this.resetPlayerTotals(playerId, gametypeId, 0);
            }else{
                await this.updatePlayerTotal(playerId, gametypeId, 0, playerGametypeTotals);
            }

            if(playerGametypeMapTotals === null){
                await this.resetPlayerTotals(playerId, gametypeId, mapId);
            }else{
                await this.updatePlayerTotal(playerId, gametypeId, mapId, playerGametypeMapTotals);
            }
        }
    }

    async getAllNames(bOnlyNames, bObject){

        if(bOnlyNames === undefined) bOnlyNames = false;

        if(bObject === undefined) bObject = false;

        const names = (bObject) ? {} : [];

        const nameOnlyQuery = "SELECT name FROM nstats_player_totals WHERE gametype=0 AND map=0 ORDER BY name ASC";
        const normalQuery = "SELECT id,name,country FROM nstats_player_totals WHERE gametype=0 AND map=0 ORDER BY name ASC";

        const result = await mysql.simpleQuery((bOnlyNames) ? nameOnlyQuery : normalQuery);

        for(let i = 0; i < result.length; i++){

            if(!bObject){
                names.push(result[i].name);
            }else{
                names[result[i].id] = {"name": result[i].name, "country": result[i].country};
            }
        }

        return names;
    }

    async getNameIdPairs(){

        const query = "SELECT id,name FROM nstats_player_totals WHERE gametype=0 AND map=0 ORDER BY name ASC";

        return await mysql.simpleQuery(query);
    }
    
    async renamePlayer(oldName, newName){

        try{

            await mysql.simpleUpdate("UPDATE nstats_player_totals SET name=? WHERE name=?", [newName, oldName]);

            const matchManager = new Matches();

            //await matchManager.renameDmWinner(oldName, newName);
            return true;


        }catch(err){
            console.trace(err);
            return false;
        }
    }

    async bNameInUse(name){

        try{

            const result = await mysql.simpleFetch("SELECT COUNT(*) as total_found FROM nstats_player_totals WHERE name=? AND gametype=0", 
            [name]);


            if(result.length > 0){
                if(result[0].total_found > 0) return true;
            }

            return false;

        }catch(err){
            console.trace(err);
            return true;
        }
    }

    async getPlayerTotals(name){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_totals WHERE name=?",[name]);
    }


    async insertNewTotalsFromMerge(playerName, gametypeId, data){

        try{
            const query = `INSERT INTO nstats_player_totals VALUES(
                NULL,?,?,?,?,?,
                ?,?,?,?,?, 
                ?,?,?,?,?, 
                ?,?,?,?,?, 
                ?,?,?,?, 
                ?,?,?,?,?,?,?,?, 
                ?,?,?,?,?,?,?,?, 
                ?,?,?,?,?, 
                ?,?,?,?,?, 
                ?,?,?,?,?, 
                ?,?,?,?,
                ?,?,?,?,?, 
                ?,?,?,?,?,?, 
                ?,?,?,?,?,?,?,?,
                ?,?,?,?,?,?,?,?,?
            )`;

            const d = data;

            const vars = [
                playerName, d.player_id, d.first, d.last, d.ip,
                d.country, d.face, d.voice, gametypeId, d.matches,

                d.wins, d.losses, d.draws, d.winrate, d.playtime,

                d.first_bloods, d.frags, d.score, d.kills, d.deaths,

                d.suicides, d.team_kills, d.spawn_kills, d.efficiency,

                d.multi_1, d.multi_2, d.multi_3, d.multi_4, d.multi_5, d.multi_6, d.multi_7, d.multi_best,
                d.spree_1, d.spree_2, d.spree_3, d.spree_4, d.spree_5, d.spree_6, d.spree_7, d.spree_best,

                d.fastest_kill, d.slowest_kill, d.best_spawn_kill_spree, d.flag_assist, d.flag_return,
                
                d.flag_taken, d.flag_dropped, d.flag_capture, d.flag_pickup, d.flag_seal,
                d.flag_cover, d.flag_cover_pass, d.flag_cover_fail, d.flag_self_cover, d.flag_self_cover_pass,
                d.flag_self_cover_fail, d.flag_multi_cover, d.flag_spree_cover, d.flag_cover_best, d.flag_self_cover_best,
                d.flag_kill, d.flag_save, d.flag_carry_time, d.assault_objectives, d.dom_caps,
                d.dom_caps_best, d.dom_caps_best_life, d.accuracy, d.k_distance_normal, d.k_distance_long,
                d.k_distance_uber, d.headshots, d.shield_belt, d.amp, d.amp_time,
                d.invisibility, d.invisibility_time,
                d.pads, d.armor, d.boots, d.super_health,
                d.mh_kills, d.mh_kills_best_life, d.mh_kills_best, d.views, d.mh_deaths, d.mh_deaths_worst
            ];
            
            await mysql.simpleQuery(query, vars);

        }catch(err){
            console.trace(err);
        }
    }


    async bPlayerGametypeTotalExists(playerId, gametypeId){

        const query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE player_id=? AND gametype=?";
        const result = await mysql.simpleFetch(query, [playerId, gametypeId]);

        if(result[0].total_players === 0) return false;
        return true;
    }
    

    //first player gets merged into second
    async mergePlayersById(first, second, matchManager, combogibManager){

        try{


            console.log(`Merge ${first} into ${second}`);

            first = parseInt(first);
            second = parseInt(second);

            if(first !== first || second !== second){
                return false;
            }

            if(first === second) return false;

            const names = await this.getNamesByIds([second]);
            

            await matchManager.mergePlayerMatches(first, second);
   

            const assaultManager = new Assault();
            await assaultManager.changeCapDataPlayerId(first, second);

            const ctfManager = new CTF();
            await ctfManager.mergePlayers(first, second, matchManager);


            const domManager = new Domination();

            await domManager.changeCapPlayerId(first, second);
            await domManager.changeScoreHistoryPlayerId(first, second);

            const headshotManager = new Headshots();
            await headshotManager.changePlayerIds(first, second);

            const itemsManager = new Items();

            await itemsManager.changePlayerIdsMatch(first, second);
            await itemsManager.mergePlayerTotals(first, second);

            const connectionsManager = new Connections();
            await connectionsManager.changePlayerIds(first, second);

            const pingManager = new Pings();
            await pingManager.changePlayerIds(first, second);

            await matchManager.changeDMWinner(first, second);
            await matchManager.changePlayerScoreHistoryIds(first, second);
            await matchManager.changeTeamChangesPlayerIds(first, second);

            const killsManager = new Kills();
            await killsManager.changePlayerIds(first, second);

            const mapManager = new Maps();

            //await mapManager.mergePlayerHistory(first.id, second.id);
            await mapManager.deletePlayer(first);
            await mapManager.deletePlayer(second);
            await mapManager.recalculatePlayerTotalsAfterMerge(second);


            await this.deletePlayerTotals(first);


            //const playerGametypeTotals = await this.getPlayerTotalsPerGametypeByMatches(second);
            //const playerTotals = await this.getPlayerTotalsByMatches(second);
            
            //const updatedPlayerMatches = await matchManager.getAllPlayerMatches(second);
            await this.recalculatePlayerTotalsAfterMerge(second, names[0]);

            const weaponsManager = new Weapons();
            await weaponsManager.mergePlayers(first, second, matchManager);


            const winrateManager = new Winrate();

            await winrateManager.deletePlayer(first);
            await winrateManager.deletePlayer(second);
            await winrateManager.recalculatePlayerHistoryAfterMerge(second);


            const spreeManager = new Sprees();
            await spreeManager.changePlayerIds(first, second);

            await combogibManager.mergePlayers(first, second);


            const rankingsManager = new Rankings();
            await rankingsManager.init();

            await rankingsManager.deletePlayer(first);
            await rankingsManager.deletePlayer(second);
            await rankingsManager.fullPlayerRecalculate(this, second);


            const powerupManager = new PowerUps();

            await powerupManager.mergePlayers(first, second);

            const teleFragManager = new Telefrags();

            await teleFragManager.mergePlayers(first, second);


            return true;
        }catch(err){
            console.trace(err);
            return false;
        }

        /*try{    


            if(names.length > 1){

    
                const matchIds = await matchManager.getAllPlayerMatchIds(first.id);

                const monsterHuntManager = new MonsterHunt();
                await monsterHuntManager.mergePlayers(first.id, second.id);

                return true;
            }else{
                throw new Error("Only found 1 player out of 2, can't merge players.");
            }

        }catch(err){
            console.trace(err);
            return false;
        }*/
    }


    async getPlayerTotalsFromMatchData(playerId, type){

        type = type.toLowerCase();

        let part1 = "";
        let part2 = "";

        // /${(bAllTotals) ? "" : "gametype,map_id,"}
        if(type === "gametypes"){
            part1 = "gametype,";
            part2 = " GROUP BY gametype";
        }

        if(type === "maps"){
            part1 = "map_id,";
            part2 = " GROUP BY map_id";
        }

        if(type === "all"){
            part1 = "gametype, map_id,";
            part2 = " GROUP BY gametype,map_id";
        }


        let query = `SELECT ${part1}
        COUNT(*) as total_matches,
        SUM(winner) as wins,
        SUM(draw) as draws,
        SUM(playtime) as playtime,
        MIN(match_date) as first,
        MAX(match_date) as last,
        SUM(team_0_playtime) team_0_playtime,
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
        AVG(accuracy) as accuracy,
        MIN(ping_min) as ping_min,
        AVG(ping_average) as ping_average,
        MAX(ping_max) as ping_max,
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
        SUM(mh_deaths) as mh_deaths,
        MAX(mh_deaths) as mh_deaths_worst,
        SUM(telefrag_kills) as telefrag_kills,
        SUM(telefrag_deaths) as telefrag_deaths,
        MAX(telefrag_best_spree) as telefrag_best_spree,
        MAX(telefrag_best_multi) as telefrag_best_multi,
        SUM(tele_disc_kills) as tele_disc_kills,
        SUM(tele_disc_deaths) as tele_disc_deaths,
        MAX(tele_disc_best_spree) as tele_disc_best_spree,
        MAX(tele_disc_best_multi) as tele_disc_best_multi
        FROM nstats_player_matches
        WHERE player_id=?`;

        //part2
        //if(!bAllTotals) query += ` GROUP BY gametype, map_id`;

        query += part2;

        const result = await mysql.simpleQuery(query, [playerId]);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            let efficiency = 0;

            if(r.kills > 0){

                if(r.deaths === 0){
                    efficiency = 100;
                }else{

                    efficiency = (r.kills / (r.kills + r.deaths)) * 100;
                }
            }

            r.efficiency = efficiency;


            let winRate = 0;

            if(r.total_matches > 0 && r.wins > 0){          

                winRate = (r.wins / r.total_matches) * 100;        
            }

            r.winRate = winRate;
            r.losses = r.total_matches - r.wins - r.draws;
        }

        return result;
    }

    async updatePlayerTotal(playerId, gametypeId, mapId, data){

        if(data === undefined){
       
            console.log(`-----------playerID--${playerId}- gametypeId---${gametypeId}--mapId-${mapId}---------------------------------`);
            return;
        }

        const query = `UPDATE nstats_player_totals SET 
        first=?,
        last=?,
        matches=?,
        wins=?,
        losses=?,
        draws=?,
        winrate=?,
        playtime=?,
        team_0_playtime=?,
        team_1_playtime=?,
        team_2_playtime=?,
        team_3_playtime=?,
        spec_playtime=?,
        first_bloods=?,
        frags=?,
        score=?,
        kills=?,
        deaths=?,
        suicides=?,
        team_kills=?,
        spawn_kills=?,
        efficiency=?,
        multi_1=?,
        multi_2=?,
        multi_3=?,
        multi_4=?,
        multi_5=?,
        multi_6=?,
        multi_7=?,
        multi_best=?,
        spree_1=?,
        spree_2=?,
        spree_3=?,
        spree_4=?,
        spree_5=?,
        spree_6=?,
        spree_7=?,
        spree_best=?,
        best_spawn_kill_spree=?,
        assault_objectives=?,
        dom_caps=?,
        dom_caps_best=?,
        dom_caps_best_life=?,
        accuracy=?,
        k_distance_normal=?,
        k_distance_long=?,
        k_distance_uber=?,
        headshots=?,
        shield_belt=?,
        amp=?,
        amp_time=?,
        invisibility=?,
        invisibility_time=?,
        pads=?,
        armor=?,
        boots=?,
        super_health=?,
        mh_kills=?,
        mh_kills_best_life=?,
        mh_kills_best=?,
        mh_deaths=?,
        mh_deaths_worst=?
        WHERE ${(gametypeId === 0 && mapId === 0) ? "id" : "player_id" }=? AND gametype=? AND map=?`;

        const vars = [
            data.first_match ?? data.first,
            data.last_match ?? data.last,
            data.total_matches,
            data.wins,
            data.losses,
            data.draws,
            data.winRate,
            data.playtime,
            data.team_0_playtime,
            data.team_1_playtime,
            data.team_2_playtime,
            data.team_3_playtime,
            data.spec_playtime,
            data.first_bloods,
            data.frags,
            data.score,
            data.kills,
            data.deaths,
            data.suicides,
            data.team_kills,
            data.spawn_kills,
            data.efficiency,
            data.multi_1,
            data.multi_2,
            data.multi_3,
            data.multi_4,
            data.multi_5,
            data.multi_6,
            data.multi_7,
            data.multi_best,
            data.spree_1,
            data.spree_2,
            data.spree_3,
            data.spree_4,
            data.spree_5,
            data.spree_6,
            data.spree_7,
            data.spree_best,

            data.best_spawn_kill_spree,
            data.assault_objectives,
            data.dom_caps,
            data.dom_caps_best,
            data.dom_caps_best_life,
            data.accuracy,
            data.k_distance_normal,
            data.k_distance_long,
            data.k_distance_uber,
            data.headshots,
            data.shield_belt,
            data.amp,
            data.amp_time,
            data.invisibility,
            data.invisibility_time,
            data.pads,
            data.armor,
            data.boots,
            data.super_health,
            data.mh_kills,
            data.mh_kills_best_life,
            data.mh_kills_best,
            data.mh_deaths,
            data.mh_deaths_worst,
            playerId, gametypeId, mapId
        ];

        const result = await mysql.simpleQuery(query, vars);

        return result;
    }

    updateCurrentTotals(totals, id, data){

        if(totals[id] === undefined){

            totals[id] = data;
            return;
        }
        
        const mergeTypes = [
            "total_matches", "wins", "draws", "playtime",
            "team_0_playtime", "team_1_playtime", "team_2_playtime", "team_3_playtime",
            "spec_playtime", "first_bloods", "frags", "score", "kills", "deaths", "suicides",
            "team_kills", "spawn_kills", "multi_1", "multi_2", "multi_3", "multi_4", "multi_5",
            "multi_6", "multi_7", "spree_1", "spree_2", "spree_3","spree_4","spree_5","spree_6",
            "spree_7", "assault_objectives", "dom_caps", "k_distance_normal", "k_distance_long",
            "k_distance_uber", "headshots", "shield_belt", "amp", "amp_time", "invisibility",
            "invisibility_time", "pads", "armor", "boots", "super_health", "mh_kills", "mh_deaths",
            "telefrag_kills", "telefrag_deaths", "tele_disc_kills", "tele_disc_deaths"      
        ];

        const lowerBetter = [
            "first", "ping_min", "shortest_kill_distance"
        ];

        const higherBetter = [
            "last", "multi_best", "spree_best", "best_spawn_kill_spree",
            "dom_caps_best", "dom_caps_best_life", "ping_max", "longest_kill_distance",
            "mh_kills_best", "mg_kills_best_life", "mh_deaths_worst", "telefrag_best_spree",
            "telefrag_best_multi", "tele_disc_best_multi"
        ];

        const current = totals[id];


        for(let i = 0; i < mergeTypes.length; i++){

            const t = mergeTypes[i];

            current[t] += data[t];
        }

        for(let i = 0; i < lowerBetter.length; i++){

            const t = lowerBetter[i];

            if(current[t] > data[t]) current[t] = data[t];
        }

        for(let i = 0; i < higherBetter.length; i++){

            const t = higherBetter[i];

            if(current[t] < data[t]) current[t] = data[t];
        }     

        
    }

    async recalculatePlayerTotalsAfterMerge(playerId, playerName){

        
        //const mapsData = await this.getGametypeTotals(playerId, false);
        //const allTotals = await this.getGametypeTotals(playerId, true);

        const data = await this.getPlayerTotalsFromMatchData(playerId, "all");
        const combinedData = await this.getPlayerTotalsFromMatchData(playerId, "combined");


        const mapTotals = {};
        const gametypeTotals = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            console.log(`gametype = ${d.gametype}, map = ${d.map_id}, playedMatches = ${d.total_matches}`);

            this.updateCurrentTotals(mapTotals, d.map_id, d);
            this.updateCurrentTotals(gametypeTotals, d.gametype, d);

        }
        
        //first do all the map + gametype totals

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            d.name = playerName.name;

            const updateResult = await this.updatePlayerTotal(playerId, d.gametype, d.map_id, d);

            if(updateResult.affectedRows === 0){
                await this.createTotalsFromMerge(playerId, d.gametype, d.map_id, d);
            }
        }

        //map totals

        for(const [mapId, mapData] of Object.entries(mapTotals)){

            mapData.name = playerName.name;

            const updateResult = await this.updatePlayerTotal(playerId, 0, mapId, mapData);

            if(updateResult.affectedRows === 0){
                await this.createTotalsFromMerge(playerId, 0, mapId, mapData);
            }
        }
        
        for(const [gametypeId, gametypeData] of Object.entries(gametypeTotals)){

            gametypeData.name = playerName.name;

            const updateResult = await this.updatePlayerTotal(playerId, gametypeId, 0, gametypeData);

            if(updateResult.affectedRows === 0){
                await this.createTotalsFromMerge(playerId, gametypeId, 0, gametypeData);
            }
        }

        //update combined totals

        await this.updatePlayerTotal(playerId, 0, 0, combinedData[0]);

    }

    async createTotalsFromMerge(playerId, gametypeId, mapId, data){

        console.log(`createTotalsFromMerge(playerId=${playerId}, gametypeId=${gametypeId}, mapId=${mapId})`);

        const query = `INSERT INTO nstats_player_totals VALUES(NULL,
        ?,?,?,?,?,
        ?,?,?,?,?,?,
        ?,?,?,?,?, 
        ?,?,?,?, 
        ?,?,?,?,?,  
        ?,?,?,?,?,?, 
        ?,?,?,?,?,?,?,?, 
        ?,?,?,?,?,?,?,?,  
        ?,?,?,?,   
        ?,?,?,?,  
        ?,?,?,?,   
        ?,?,?,?,?,  
        ?,?,?,?,?, 
        ?,?,?,?,?)`;  

        const vars = [
            "", data.name, playerId, data.first, data.last,  
            "", "", 0, 0, gametypeId, mapId,
            data.total_matches, data.wins, data.losses, data.draws, data.winRate, //5
            data.playtime, data.team_0_playtime, data.team_1_playtime, data.team_2_playtime, //4
            data.team_3_playtime, data.spec_playtime, data.first_bloods, data.frags, data.score, //5
            data.kills, data.deaths, data.suicides, data.team_kills, data.spawn_kills, data.efficiency, //6
            data.multi_1, data.multi_2, data.multi_3, data.multi_4, data.multi_5, data.multi_6, data.multi_7, data.multi_best, //8
            data.spree_1, data.spree_2, data.spree_3, data.spree_4, data.spree_5, data.spree_6, data.spree_7, data.spree_best, //8
            0,0, data.best_spawn_kill_spree, data.assault_objectives, //4
            data.dom_caps, data.dom_caps_best, data.dom_caps_best_life, data.accuracy,  //44       
            data.k_distance_normal, data.k_distance_long, data.k_distance_uber, data.headshots,  //4
            data.shield_belt, data.amp, data.amp_time, data.invisibility, data.invisibility_time,  //5
            data.pads, data.armor, data.boots, data.super_health, data.mh_kills, //5
            data.mh_kills_best_life, data.mh_kills_best, 0, data.mh_deaths, data.mh_deaths_worst, //5
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async deletePlayerTotals(id){
        await mysql.simpleQuery("DELETE FROM nstats_player_totals WHERE player_id=?", [id]);
        await mysql.simpleQuery("DELETE FROM nstats_player_totals WHERE id=?", [id]);

    }


    async getPlayerName(player){

        try{

            const result = await mysql.simpleFetch("SELECT name FROM nstats_player_totals WHERE id=?", [player]);

            if(result.length > 0){

                return result[0].name;

            }else{

                return "Not Found";
            }

        }catch(err){
            console.trace(err);
        }
    }

    async deleteScoreHistory(playerId){
        await mysql.simpleDelete("DELETE FROM nstats_match_player_score WHERE player=?", [playerId]);
    }

    async deleteMapTotals(playerId){
        await mysql.simpleDelete("DELETE FROM nstats_player_maps WHERE player=?", [playerId]);
    }


    async deleteAllMatches(playerId){

        await mysql.simpleDelete("DELETE FROM nstats_player_matches WHERE player_id=?", [playerId]);
    }

    async deletePlayer(playerId, matchManager){

        try{
            const assaultManager = new Assault();

            await assaultManager.deletePlayer(playerId);

            const matches = await matchManager.getAllPlayerMatches(playerId);

            const matchIds = await matchManager.getAllPlayerMatchIds(playerId);

            const countriesManager = new CountriesManager();

            await countriesManager.deletePlayerViaMatchData(matches);

            const ctfManager = new CTF();

            await ctfManager.deletePlayerViaMatchData(playerId, matchIds);

            const domManager = new Domination();

            await domManager.deletePlayer(playerId);

            const monsterHuntManager = new MonsterHunt();

            await monsterHuntManager.deletePlayer(playerId);

            const faceManager = new Faces();

            await faceManager.deletePlayer(matches);

            const headshotsManager = new Headshots();

            await headshotsManager.deletePlayer(playerId);

            const itemsManager = new Items();

            await itemsManager.deletePlayer(playerId);

            const killsManager = new Kills();

            await killsManager.deletePlayer(playerId);


            //const name = await this.getPlayerName(playerId);

            await matchManager.recalculateDmWinners(matchIds);
            

            const connectionManager = new Connections();

            await connectionManager.deletePlayer(playerId);


            const pingManager = new Pings();

            await pingManager.deletePlayer(playerId);


            await this.deleteScoreHistory(playerId);

            const teamManager = new Teams();

            await teamManager.deletePlayer(playerId);

            await this.deleteMapTotals(playerId);

            await this.deleteAllMatches(playerId);


            const weaponsManager = new Weapons();

            await weaponsManager.deletePlayer(playerId);

            const rankingManager = new Rankings();

            await rankingManager.deletePlayer(playerId);

            const voiceManager = new Voices();

            await voiceManager.deletePlayer(matches);

            const winrateManager = new Winrate();

            await winrateManager.deletePlayer(playerId);

            const spreeManager = new Sprees();

            await spreeManager.deletePlayer(playerId);

            //delete player totals last

            await this.deletePlayerTotals(playerId);


            const comboManager = new Combogib();

            await comboManager.deletePlayer(playerId);

            return true;

        }catch(err){    
            console.trace(err);
            return false;
        }
    }

    async getAllGametypeMatchData(gametypeId){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_matches WHERE gametype=?", [gametypeId]);
    }

    async getAllPlayersGametypeMatchData(gametypeId, playerId){

        const query = "SELECT * FROM nstats_player_matches WHERE gametype=? AND player_id=?";

        return await mysql.simpleQuery(query, [gametypeId, playerId]);
    }

    async reducePlayerGametypeTotals(gametypeId, playerId, data){

        playerId = parseInt(playerId);
        
        const query = `UPDATE nstats_player_totals SET
            matches=matches-?,
            wins=wins-?,
            draws=draws-?,
            losses=losses-?,
            winrate = IF(matches > 0, IF(wins > 0, (wins / matches * 100), 0) ,0)
            playtime=playtime-?,
            first_bloods=first_bloods-?,
            frags=frags-?,
            score=score-?,
            kills=kills-?,
            deaths=deaths-?,
            suicides=suicides-?,
            team_kills=team_kills-?,
            spawn_kills=spawn_kills-?,
            efficiency = IF(kills > 0, IF(deaths > 0, (kills / (deaths + kills)) * 100 ,100), 0),
            multi_1=multi_1-?,
            multi_2=multi_2-?,
            multi_3=multi_3-?,
            multi_4=multi_4-?,
            multi_5=multi_5-?,
            multi_6=multi_6-?,
            multi_7=multi_7-?,
            spree_1=spree_1-?,
            spree_2=spree_2-?,
            spree_3=spree_3-?,
            spree_4=spree_4-?,
            spree_5=spree_5-?,
            spree_6=spree_7-?,
            spree_7=spree_7-?,
            flag_assist=flag_assist-?,
            flag_return=flag_return-?,
            flag_taken=flag_taken-?,
            flag_dropped=flag_dropped-?,
            flag_capture=flag_capture-?,
            flag_pickup=flag_pickup-?,
            flag_seal=flag_seal-?,
            flag_cover=flag_cover-?,
            flag_cover_pass=flag_cover_pass-?,
            flag_cover_fail=flag_cover_fail-?,
            flag_self_cover=flag_self_cover-?,
            flag_self_cover_pass=flag_self_cover_pass-?,
            flag_self_cover_fail=flag_self_cover_fail-?,
            flag_multi_cover=flag_multi_cover-?,
            flag_spree_cover=flag_spree_cover-?,
            flag_kill=flag_kill-?,
            flag_save=flag_save-?,
            flag_carry_time=flag_carry_time-?,
            assault_objectives=assault_objectives-?,
            dom_caps=dom_caps-?,
            k_distance_normal=k_distance_normal-?,
            k_distance_long=k_distance_long-?,
            k_distance_uber=k_distance_uber-?,
            headshots=headshots-?,
            shield_belt=shield_belt-?,
            amp=amp-?,
            amp_time=amp_time-?,
            invisibility=invisibility-?,
            invisibility_time=invisibility_time-?,
            pads=pads-?,
            armor=armor-?,
            boots=boots-?,
            super_health=super_health-?

            WHERE gametype=? AND player_id=?
        `;


        const vars = [
            data.matches, data.wins, data.draws, data.losses,
            data.playtime, data.first_bloods, data.frags, data.score,
            data.kills, data.deaths, data.suicides, data.team_kills, data.spawn_kills,
            data.multi_1, data.multi_2, data.multi_3, data.multi_4, data.multi_5, data.multi_6, data.multi_7,
            data.spree_1, data.spree_2, data.spree_3, data.spree_4, data.spree_5, data.spree_6, data.spree_7,
            data.flag_assist, data.flag_return, data.flag_taken, data.flag_dropped, data.flag_capture,
            data.flag_pickup, data.flag_seal, data.flag_cover, data.flag_cover_pass,
            data.flag_cover_fail, data.flag_self_cover, data.flag_self_cover_pass, data.flag_self_cover_fail, data.flag_multi_cover,
            data.flag_spree_cover, data.flag_kill, data.flag_save, data.flag_carry_time,
            data.assault_objectives, data.dom_caps, data.k_distance_normal, data.k_distance_long, data.k_distance_uber,
            data.headshots, data.shield_belt, data.amp, data.amp_time, data.invisibility, data.invisibility_time, data.pads,
            data.armor, data.boots, data.super_health,


            gametypeId, playerId

        ];



        await mysql.simpleUpdate(query, vars);
    }

    async deleteGametypeTotals(id){

        console.log(`delete gametype ${id}`);
        await mysql.simpleDelete("DELETE FROM nstats_player_totals WHERE gametype=?", [id]);
    }

    async deletePlayerMatchesData(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_player_matches WHERE match_id IN (?)", [ids]);

    }

    async deleteMatches(matchIds, playersData, gametypeId){

        try{

            if(playersData === undefined){

                //fetch player match data here if not supplied
                playersData = [];

                if(gametypeId !== undefined){
                    playersData = await this.getAllGametypeMatchData(gametypeId);
                }else{
                    console.log("You didnt specify a gametype");
                    return;
                }     
            }


            const dontMerge = [
                "winner", "draw",
                "ip", "country", "face", "voice", "gametype", "efficiency",
                "spree_best", "best_spawn_kill_spree", "flag_cover_best", "multi_best",
                "flag_self_cover_best", "dom_caps_best_life", "ping_min", "ping_average",
                "ping_max", "accuracy", "shortest_kill_distance", "average_kill_distance",
                "longest_kill_distance", "accuracy"
            ];

            const higherBetter = [
                "spree_best",
                "multi_best",
                "best_spawn_kill_spree",
                "flag_cover_best",
                "flag_self_cover_best",
                "dom_caps_best_life",
            ];

            const totals = {};

            for(let i = 0; i < playersData.length; i++){

                const p = playersData[i];

                if(totals[p.player_id] === undefined){

                    totals[p.player_id] = {
                        "matches": 0, "losses": 0,
                        "wins": 0,"draws": 0,"playtime": 0,"first_blood": 0,"frags": 0,"score": 0,"kills": 0,
                        "deaths": 0,"suicides": 0,"team_kills": 0,"spawn_kills": 0,"efficiency": 0,"multi_1": 0,"multi_2": 0,"multi_3": 0,
                        "multi_4": 0,"multi_5": 0,"multi_6": 0,"multi_7": 0,"multi_best": 0,"spree_1": 0,"spree_2": 0,"spree_3": 0,"spree_4": 0,
                        "spree_5": 0,"spree_6": 0,"spree_7": 0,"spree_best": 0,"best_spawn_kill_spree": 0,"flag_assist": 0,"flag_return": 0,
                        "flag_taken": 0,"flag_dropped": 0,"flag_capture": 0,"flag_pickup": 0,"flag_seal": 0,"flag_cover": 0,"flag_cover_pass": 0,
                        "flag_cover_fail": 0,"flag_self_cover": 0,"flag_self_cover_pass": 0,"flag_self_cover_fail": 0,"flag_multi_cover": 0,
                        "flag_spree_cover": 0,"flag_cover_best": 0,"flag_self_cover_best": 0,"flag_kill": 0,"flag_save": 0,"flag_carry_time": 0,
                        "assault_objectives": 0,"dom_caps": 0,"dom_caps_best_life": 0,
                        "k_distance_normal": 0,"k_distance_long": 0,
                        "k_distance_uber": 0,"headshots": 0,"shield_belt": 0,"amp": 0,"amp_time": 0,"invisibility": 0,"invisibility_time": 0,"pads": 0,
                        "armor": 0,"boots": 0,"super_health": 0
                    };
                }

                totals[p.player_id].matches++;

                if(p.winner){
                    totals[p.player_id].wins++;
                }else{

                    if(p.draw){
                        totals[p.player_id].draws++;
                    }else{
                        totals[p.player_id].losses++;
                    }
                }

                for(const [key, value] of Object.entries(p)){

                    if(dontMerge.indexOf(key) === -1){

                        if(totals[p.player_id][key] !== undefined){
                            
                            totals[p.player_id][key] += value;
                        }

                    }else if(higherBetter.indexOf(key) !== -1){

                        if(totals[p.player_id][key] < p[key]){
                            totals[p.player_id][key] = p[key];
                        }
                    }
                }
            }


            //delete player data for this gametype

            await this.deleteGametypeTotals(gametypeId);

            //reduce for totals aka gametype 0

            for(const [playerId, data] of Object.entries(totals)){

                await this.reducePlayerGametypeTotals(0, playerId, data);
            }

            await this.deletePlayerMatchesData(matchIds);


        }catch(err){
            console.trace(err);
        }
    }


    async setPlayerMatchNames(players){

        const ids = players.map((player) =>{
            return player.player_id;
        });


        const names = await this.getJustNamesByIds(ids);

        for(let i = 0; i < players.length; i++){

            const p = players[i];

            if(names[`${p.player_id}`] !== undefined){
                p.name = names[`${p.player_id}`];
            }else{
                p.name = "Not Found";
            }
        }

    }

    async getAllInMatch(id){

        const query = "SELECT * FROM nstats_player_matches WHERE match_id=?";

        const players = await mysql.simpleQuery(query, [id]);

        for(let i = 0; i < players.length; i++){
            delete players[i].ip;
            delete players[i].hwid;
        }

        const ctf = new CTF();
        await ctf.setMatchCTFData(id, players);
        await this.setPlayerMatchNames(players);
        
        return players;
    }

    async getSinglePlayerInMatch(matchId, playerId){

        const query = "SELECT * FROM nstats_player_matches WHERE match_id=? AND player_id=?";

        const players = await mysql.simpleQuery(query, [matchId, playerId]);


        for(let i = 0; i < players.length; i++){
            delete players[i].ip;
        }

        const ctf = new CTF();
        await ctf.setMatchCTFData(matchId, players);
        await this.setPlayerMatchNames(players);

        return players;


    }

    async getUniquePlayersBetween(start, end){

        const query = "SELECT COUNT(DISTINCT player_id) as players FROM nstats_player_matches WHERE match_date>? AND match_date<=?";

        const data = await mysql.simpleFetch(query, [start, end]);

        if(data.length > 0) return data[0].players;

        return 0;
    }

    /**
     * 
     * @param {*} units How many days/minutes/years
     * @param {*} timeUnit How many seconds a unit is 60 * 60 is one hour, ect
     * @returns Array of times frames starting with most recent to latest
     */
    async getUniquePlayersInRecentUnits(units, timeUnit){

        const now = Math.floor(Date.now() * 0.001);

        const data = [];

        for(let i = 0; i < units; i++){

            const min = now - (timeUnit * (i + 1));
            const max = now - (timeUnit * i);

            data.push(await this.getUniquePlayersBetween(min, max));         
        }

        return data;
    }

    updateOtherScoresGraphData(players, ignoredPlayers){

        for(const [playerId, playerData] of Object.entries(players)){

            const index = ignoredPlayers.indexOf(parseInt(playerId));

            if(index === -1){
                playerData.values.push(playerData.lastScore);
            }
        }

    }

    createPlayerScoreHistory(data, players){

        const playerScores = {};

        for(const [playerId, playerName] of Object.entries(players)){

            playerScores[parseInt(playerId)] = {
                "name": playerName, 
                "values": [0], 
                "lastScore": 0
            };
        }

        //console.log(playerScores);

        if(Object.keys(playerScores).length === 0) return [];

        let previousTimestamp = -1;
        let currentIgnoreList = [];

        for(let i = 0; i < data.length; i++){

            const {timestamp, player, score} = data[i];

            if(timestamp !== previousTimestamp){
                this.updateOtherScoresGraphData(playerScores, currentIgnoreList);
                currentIgnoreList = [];
            }

            if(playerScores[player] === undefined){
                //console.log(`Players.createPlayerScoreHistory(${player}) player is null`);
                continue;
            }


            const currentPlayer = playerScores[player];

            //reconnected players scores can have duplicated data
            if(currentIgnoreList.indexOf(player) !== -1){
                currentPlayer.values[currentPlayer.values.length - 1] = score;
                continue;
            }

            currentPlayer.values.push(score);
            currentPlayer.lastScore = score;

            currentIgnoreList.push(player);

            previousTimestamp = timestamp;
        }

        this.updateOtherScoresGraphData(playerScores, currentIgnoreList);

        return Object.values(playerScores);
    }

    async getScoreHistory(matchId, players){    

        
        const query = "SELECT timestamp,player,score FROM nstats_match_player_score WHERE match_id=? ORDER BY timestamp ASC";

        const data = await mysql.simpleQuery(query, [matchId]);

        const timestamps = [...new Set(data.map((d) =>{
            return d.timestamp;
        }))];

        const graphData = this.createPlayerScoreHistory(data, players);

        graphData.sort((a, b) =>{

            a = a.lastValue;
            b = b.lastValue;

            return b-a;
        });

        return {"data": graphData, "labels": timestamps};
    }

    async getTeamMatePlayedMatchIds(players){

        if(players.length < 2) return [];

        const query = "SELECT match_id, player_id, team FROM nstats_player_matches WHERE player_id IN (?) AND playtime>0";

        const result = await mysql.simpleQuery(query, [players]);

        const matchIds = {};


        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(matchIds[r.match_id] === undefined){
                matchIds[r.match_id] = {"players": 1, "teams": [r.team]};
            }else{

                matchIds[r.match_id].players++;

                if(matchIds[r.match_id].teams.indexOf(r.team) === -1){
                    matchIds[r.match_id].teams.push(r.team);
                }
            }
        }

        const bothPlayed = [];
        const bothPlayedTeams = {};

        for(const [key, value] of Object.entries(matchIds)){

            if(value.players === players.length){

                if(value.teams.length === 1){

                    const matchId = parseInt(key);

                    bothPlayed.push(matchId);
                    bothPlayedTeams[matchId] = value.teams[0];
                }
            }
        }

        return {"matches": bothPlayed, "teams": bothPlayedTeams};
    }


    async getMuliplePlayersPlayedMatches(playerIds){

        if(playerIds.length === 0) return [];

        const query = "SELECT match_id FROM nstats_player_matches WHERE player_id IN (?)";

        const result = await mysql.simpleQuery(query, [playerIds]);

        const data = [];

        for(let i = 0; i < result.length; i++){

            const id = result[i].match_id;

            if(data.indexOf(id) === -1){
                data.push(id);
            }
        }

        return data;
    }

    createTeamsDataObject(){

        return {
            "matches": 0,
            "playtime": 0,
            "kills": 0,
            "score": 0,
            "frags": 0,
            "deaths": 0,
            "suicides": 0,
            "teamKills": 0,
            "spawnKills": 0,
            "spreeBest": 0,
            "multiBest": 0,
            "firstBloods": 0,
            "flagAssist": 0,
            "flagReturn": 0,
            "flagTaken": 0,
            "flagDropped": 0,
            "flagCapture": 0,
            "flagPickup": 0,
            "flagSeal": 0,
            "flagCover": 0,
            "flagCoverPass": 0,
            "flagCoverFail": 0,
            "flagSelfCover": 0,
            "flagSelfCoverPass": 0,
            "flagSelfCoverFail": 0,
            "flagMultiCover": 0,
            "flagSpreeCover": 0,
            "flagCoverBest": 0,
            "flagSelfCoverBest": 0,
            "flagKill": 0,
            "flagSave": 0,
            "flagCarryTime": 0,
            "flagCarryTimeBest": 0
        };
    }

    updateTeamsDataObject(obj, data){

        obj.flagAssist += data.flag_assist;
        obj.flagReturn += data.flag_return;
        obj.flagTaken += data.flag_taken;
        obj.flagDropped += data.flag_dropped;
        obj.flagCapture += data.flag_capture;
        obj.flagPickup += data.flag_pickup;
        obj.flagSeal += data.flag_seal;
        obj.flagCover += data.flag_cover;
        obj.flagCoverPass += data.flag_cover_pass;
        obj.flagCoverFail += data.flag_cover_fail;
        obj.flagSelfCover += data.flag_self_cover;
        obj.flagSelfCoverPass += data.flag_self_cover_pass;
        obj.flagSelfCoverFail += data.flag_self_cover_fail;
        obj.flagMultiCover += data.flag_multi_cover;
        obj.flagSpreeCover += data.flag_spree_cover;
        obj.flagCarryTime += data.flag_carry_time;
      
        if(data.flag_carry_time > obj.flagCarryTimeBest) obj.flagCarryTimeBest = data.flag_carry_time;

        if(obj.flagCoverBest < data.flag_cover_best) obj.flagCoverBest = data.flag_cover_best;
        if(obj.flagSelfCoverBest < data.flag_self_cover_best) obj.flagSelfCoverBest = data.flag_self_cover_best;

        obj.flagKill += data.flag_kill;
        obj.flagSave += data.flag_save;

        obj.matches++;
        obj.playtime += data.playtime;
        obj.kills += data.kills;
        obj.score += data.score;
        obj.frags += data.frags;
        obj.deaths += data.deaths;
        obj.suicides += data.suicides;
        obj.teamKills += data.team_kills;
        obj.spawnKills += data.spawn_kills;
        obj.firstBloods += data.first_blood;
        
        if(data.multi_best > obj.multiBest){
            obj.multiBest = data.multi_best;
        }

        if(data.spree_best > obj.spreeBest){
            obj.spreeBest = data.spree_best;
        }
    }

    async getTeamsMatchesTotals(playerIds, matchIds){

        if(playerIds.length === 0 || matchIds.length === 0) return [];

        const query = `SELECT match_id,map_id,player_id,gametype,playtime,first_blood,
        frags,score,kills,team_kills,deaths,suicides,spawn_kills,spree_best,multi_best,
        ping_average,
        flag_assist,flag_return,flag_taken,flag_dropped,flag_capture,flag_pickup,
        flag_seal,flag_cover,flag_cover_pass,flag_cover_fail,flag_self_cover,flag_self_cover_pass,
        flag_self_cover_fail,flag_multi_cover,flag_spree_cover,flag_cover_best,flag_self_cover_best,
        flag_kill,flag_save,flag_carry_time
        FROM nstats_player_matches WHERE match_id IN (?) AND player_id IN (?)`;

        const result = await mysql.simpleQuery(query, [matchIds, playerIds]);

        const maps = {};
        const gametypes = {};
        const totals = this.createTeamsDataObject();
        const players = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(maps[r.map_id] === undefined){
                maps[r.map_id] = this.createTeamsDataObject();
            }

            if(gametypes[r.gametype] === undefined){
                gametypes[r.gametype] = this.createTeamsDataObject();
            }

            if(players[r.player_id] === undefined){
                players[r.player_id] = this.createTeamsDataObject();
            }

            const currentMap = maps[r.map_id];
            const currentGametype = gametypes[r.gametype];
            const currentPlayer = players[r.player_id];

            this.updateTeamsDataObject(currentMap, r);
            this.updateTeamsDataObject(currentGametype, r);
            this.updateTeamsDataObject(totals, r);
            this.updateTeamsDataObject(currentPlayer, r);
            
        }

        return {"totals": totals, "gametypes": gametypes, "maps": maps, "players": players};       
    }

    async getPlayersAfter(start, maxPlayers, bAdmin){

        if(bAdmin === undefined) bAdmin = false;

        const query = `SELECT name,player_id,first,last,country${(bAdmin) ? ",ip" : ""} 
        FROM nstats_player_totals WHERE gametype=0 AND last>=? ORDER BY last DESC LIMIT ?`;

        const vars = [start, maxPlayers];

        return await mysql.simpleQuery(query, vars);
    }


    async adminTotalsSearchFor(columnName, value){

        columnName = columnName.toLowerCase();

        const valid = ["name", "ip"];

        if(valid.indexOf(columnName) === -1) return [];

        const query = `SELECT id,player_id,hwid,name,ip,country,first,last,playtime,matches as total_matches
        FROM nstats_player_totals WHERE player_id=0 AND ${columnName} LIKE ? AND gametype=0 ORDER BY ${columnName} ASC`;

        const result = await mysql.simpleQuery(query, [`%${value}%`]);

        return result;
    }

    async ipSearch(ip){

        const query = `SELECT player_id, MIN(match_date) as first_match, MAX(match_date) as last_match, 
            SUM(playtime) as playtime, country,
            COUNT(*) as total_matches, ip
            FROM nstats_player_matches
            WHERE ip LIKE ? GROUP BY player_id, ip`;

        return await mysql.simpleQuery(query, [`%${ip}%`]);

   
    }

    async bulkIpSearch(ips){

        const data = [];
        const playerIds = [];

        for(let i = 0; i < ips.length; i++){

            const ip = ips[i];

            const result = await this.ipSearch(ip)

            /*if(result === null) continue;

            if(playerIds.indexOf(result.player_id) === -1){
                playerIds.push(result.player_id);
            }*/

            if(result.length === 0) continue;

            for(let x = 0; x < result.length; x++){

                const r = result[x];

                if(playerIds.indexOf(r.player_id) === -1){
                    playerIds.push(r.player_id);
                }
            }
            

            data.push(...result);
        }

        const playerNames = await this.getJustNamesByIds(playerIds);


        Functions.setIdNames(data, playerNames, "player_id", "name");

        data.sort((a, b) =>{

            a = a.total_matches;
            b = b.total_matches;

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }
            return 0;
        });

        return data;
    }

    async adminSearch(name, ip){

        let nameTotalsResult = [];
        let ipTotalsResult = [];

        const totalsResult = [];
        const usedIps = [];
        const playerIds = [];
        const playerNames = [];

        if(name !== null && name !== ""){

            nameTotalsResult = await this.adminTotalsSearchFor("name", name);

            totalsResult.push(...nameTotalsResult);

            for(let i = 0; i < nameTotalsResult.length; i++){

                const n = nameTotalsResult[i];

                if(usedIps.indexOf(n.ip) === -1) usedIps.push(n.ip);
                if(playerIds.indexOf(n.player_id) === -1) playerIds.push(n.player_id);
                if(playerNames.indexOf(n.name) === -1) playerNames.push(n.name);
            }

        }

        if(ip !== null && ip !== ""){

            ipTotalsResult = await this.adminTotalsSearchFor("ip", ip);
            totalsResult.push(...ipTotalsResult);

            for(let i = 0; i < ipTotalsResult.length; i++){

                const n = ipTotalsResult[i];

                if(usedIps.indexOf(n.ip) === -1) usedIps.push(n.ip);
                if(playerIds.indexOf(n.player_id) === -1) playerIds.push(n.player_id);
                if(playerNames.indexOf(n.name) === -1) playerNames.push(n.name);
            }
        }

     
        const ipStats = await this.bulkIpSearch(usedIps);


        //return
        return {
            "nameResult": nameTotalsResult,
           // "ipResult": ipTotalsResult,
            "ipDetails": ipStats 
        };

    }

    async getFullIPHistory(ip){

        const query = "SELECT match_id,player_id,country,match_date FROM nstats_player_matches WHERE ip=? ORDER BY match_date DESC";

        const result = await mysql.simpleQuery(query, [ip]);

        const uniquePlayerIds = Functions.getUniqueValues(result, "player_id");

        const playerNames = await this.getJustNamesByIds(uniquePlayerIds);

        return {"matchData": result, "playerNames": playerNames};
    }

    async getUsedIps(playerId){

        const query = `SELECT ip, MIN(match_date) as first_match, MAX(match_date) as last_match, COUNT(*) as total_matches,
        SUM(playtime) as total_playtime
        FROM nstats_player_matches WHERE player_id=? GROUP BY(ip)`;

        const result = await mysql.simpleQuery(query, [playerId]);

        const ips = [];

        for(let i = 0; i < result.length; i++){

            ips.push(result[i].ip);

        }

        return {"ips": ips, "data": result}

    }

    async getAliasesByIPs(ips){

        if(ips.length === 0) return [];

        const query = `SELECT player_id,ip, MIN(match_date) as first_match, MAX(match_date) as last_match, 
        COUNT(*) as total_matches, SUM(playtime) as total_playtime
        FROM nstats_player_matches WHERE ip IN(?) GROUP BY(player_id)`;

        const result = await mysql.simpleQuery(query, [ips]);

        const playerIds = [];

        for(let i = 0; i < result.length; i++){

            playerIds.push(result[i].player_id);
        }

        const playerDetails = await this.getNamesByIds(playerIds, true);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(playerDetails[r.player_id] !== undefined){

                r.name = playerDetails[r.player_id].name;
                r.country = playerDetails[r.player_id].country;

            }else{
                r.name = "Not Found";
                r.country = "xx";
            }
        }

        result.sort((a, b) =>{

            a = a.name.toLowerCase();
            b = b.name.toLowerCase();

            if(a < b){
                return -1;
            }else if(a > b){
                return 1;
            }
            return 0;
        });
        
        return result;
    }

    async getUsedHWIDs(playerId){

        const query = `SELECT hwid,MIN(match_date) as first_match, MAX(match_date) as last_match, COUNT(*) as total_uses 
        FROM nstats_player_matches WHERE player_id=? GROUP BY hwid`;

        return await mysql.simpleQuery(query, [playerId]);
    }

    async getAliasesByHWIDs(hwids){
        
        const cleanHWIDS = hwids.filter((h) => h !== "");

        if(cleanHWIDS.length === 0) return [];

        const query = `SELECT player_id, hwid, COUNT(*) as total_matches, 
        MIN(match_date) as first_match, MAX(match_date) as last_match, 
        SUM(playtime) as total_playtime FROM nstats_player_matches WHERE hwid IN (?) GROUP BY player_id,hwid`;

        return await mysql.simpleQuery(query, [cleanHWIDS]);
        
    }

    async getFullHistory(playerId){

        const usedIps = await this.getUsedIps(playerId);
        const aliasesByIp = await this.getAliasesByIPs(usedIps.ips);
        const usedHWIDs = await this.getUsedHWIDs(playerId);
        const aliasesByHWID = await this.getAliasesByHWIDs(usedHWIDs.map((h) =>{
            return h.hwid;
        }));

        const uniquePlayerIds = [...new Set(aliasesByHWID.map(m => m.player_id))];

        const names = await this.getBasicInfo(uniquePlayerIds, true);

        for(let i = 0; i < aliasesByHWID.length; i++){

            const a = aliasesByHWID[i];
            a.playerInfo = names[a.player_id] ?? {"name": "Not Found", "country": "xx"};
        }

        return {"usedIps": usedIps, "aliasesByIp": aliasesByIp, "usedHWIDs": usedHWIDs, "aliasesByHWID": aliasesByHWID};
        
    }

    async getConnectionsById(playerId, page, perPage){

        const query = "SELECT match_id,ip,country,playtime,match_date FROM nstats_player_matches WHERE player_id=? ORDER BY match_date DESC LIMIT ?, ?";

        if(page < 0) page = 0;
        if(perPage <= 0) perPage = 25;

        const start = perPage * page;

        return await mysql.simpleQuery(query, [playerId, start, perPage]);

    }


    async getTotalConnectionsById(playerId){

        const query = "SELECT COUNT(*) as total_connections FROM nstats_player_matches WHERE player_id=?";

        const result = await mysql.simpleQuery(query, [playerId]);

        return result[0].total_connections;
    }


    getValidRecordTypes(bJustTypes){

        if(bJustTypes === undefined) bJustTypes = false;


        const both = [
            {"type": "playtime", "display": "Playtime"},
            {"type": "kills", "display": "Kills"},
            {"type": "deaths", "display": "Deaths"},
            {"type": "suicides", "display": "Suicides"},
            {"type": "team_kills", "display": "Team Kills"},
            {"type": "spawn_kills", "display": "Spawn Kills"},
            {"type": "frags", "display": "Frags"},
            {"type": "score", "display": "Score"},
            {"type": "spree_best", "display": "Best Killing Spree"},
            {"type": "multi_best", "display": "Best Multi Kill"},
            {"type": "efficiency", "display": "Efficiency"},
        
            /*{"type": "flag_assist", "display": "CTF Flag Assists"},
            {"type": "flag_return", "display": "CTF Flag Returns"},
            {"type": "flag_taken", "display": "CTF Flag Grabs"},
            {"type": "flag_dropped", "display": "CTF Flag Drops"},
            {"type": "flag_capture", "display": "CTF Flag Captures"},
            {"type": "flag_pickup", "display": "CTF Flag Pickups"},
            {"type": "flag_seal", "display": "CTF Flag Seals"},
            {"type": "flag_cover", "display": "CTF Flag Covers"},
            {"type": "flag_kill", "display": "CTF Flag Kills"},
            {"type": "flag_save", "display": "CTF Flag Close Returns"},
            {"type": "flag_carry_time", "display": "CTF Flag Carry Time"},
            {"type": "flag_self_cover", "display": "CTF Kills Carrying Flag"},
            {"type": "flag_multi_cover", "display": "CTF Multi Covers"},
            {"type": "flag_spree_cover", "display": "CTF Cover Sprees"},
        
            {"type": "flag_cover_best", "display": "CTF Most Cover Kills"},
            {"type": "flag_self_cover_best", "display": "CTF Most Kills With Flag"}*/
        ];
    
        const totalTypes =  [
            ...both,
            {"type": "matches", "display": "Matches"},
            {"type": "wins", "display": "Match Wins"},
            {"type": "losses", "display": "Match Losses"},
            {"type": "draws", "display": "Match Draws"},
            {"type": "first_bloods", "display": "First Bloods"}
        ];

        const matchTypes = [
            ...both
        ];
    
    
        if(!bJustTypes){
            return {"totals": totalTypes, "matches": matchTypes};
        }
    
        let totalKeys = [];
    
        for(let i = 0; i < totalTypes.length; i++){
    
            const {type} = totalTypes[i];
            totalKeys.push(type);
        }

        let matchKeys = [];

        for(let i = 0; i < matchTypes.length; i++){
    
            const {type} = matchTypes[i];
            matchKeys.push(type);
        }
    
        return {"totals": totalKeys, "matches": matchKeys};
        
    }


    async getPlayedGametypes(playerId){

        const query = "SELECT DISTINCT gametype FROM nstats_player_matches WHERE player_id=?";

        const result = await mysql.simpleQuery(query, [playerId]);

        const gametypes = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            gametypes.push(r.gametype);
        }

        return gametypes;
    }

    getUniqueFaces(data){

        const found = new Set();

        for(let i = 0; i < data.length; i++){

            found.add(data[i].face);
        }

        return [...found];
    }


    async getBasicInfo(playerIds, bIgnoreIdsInObject){

        if(bIgnoreIdsInObject === undefined) bIgnoreIdsInObject = false;
        if(playerIds.length === 0) return {};

        const query = `SELECT name,id,country FROM nstats_player_totals WHERE id IN(?)`;
        const result = await mysql.simpleQuery(query, [playerIds]);
        const found = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            const current = {"name": r.name, "country": r.country};

            if(!bIgnoreIdsInObject) current.id = r.id;
            
            found[r.id] = current;
        }

        return found;
    }


    async adminGetHWIDUsageFromMatchData(){

        const query = `SELECT player_id,hwid,MIN(match_date) as first_match,MAX(match_date) as last_match,
        SUM(playtime) as total_playtime,COUNT(*) as total_matches FROM nstats_player_matches WHERE hwid!="" GROUP BY hwid,player_id`;

        return await mysql.simpleQuery(query);
    }

    async adminGetPlayersWithHWIDS(){

        const query = `SELECT id,name,country,hwid,matches,last FROM nstats_player_totals WHERE gametype=0 AND map=0 AND hwid!="" ORDER BY name ASC`;

        return await mysql.simpleQuery(query);
    }


    async bHWIDAlreadyAssigned(hwid){

        const query = `SELECT COUNT(*) as total_rows FROM nstats_hwid_to_name WHERE hwid=?`;

        const result = await mysql.simpleQuery(query, [hwid]);

        if(result.length > 0) return result[0].total_rows !== 0;

        return false;
    }

    async adminAssignHWIDToName(hwid, name){

        if(await this.bHWIDAlreadyAssigned(hwid)){

            throw new Error("HWID is already assigned to a name.");
        }

        //TODO: Check HWID isn't al;ready assigned to another player name, if it is throw error
        const query = `INSERT INTO nstats_hwid_to_name VALUES(NULL,?,?)`;

        await mysql.simpleQuery(query, [hwid, name]);
    }

    async adminDeleteHWIDToName(hwid){

        const query = `DELETE FROM nstats_hwid_to_name WHERE hwid=?`;

        return await mysql.simpleQuery(query, [hwid]);
    }

    async adminGetPlayersBasic(){

        const query = `SELECT id,name,country,hwid,matches,last FROM nstats_player_totals WHERE gametype=0 AND map=0 ORDER BY name ASC`;

        return await mysql.simpleQuery(query);
    }


    async adminGetPlayerByHWID(hwid){

        const query = `SELECT id,name,country FROM nstats_player_totals WHERE hwid=? AND gametype=0 LIMIT 1`;

        const result = await mysql.simpleQuery(query, [hwid]);

        if(result.length === 0) return null;
        return result[0];
    }


    async adminSetPlayerHWID(playerId, hwid){

        const query = `UPDATE nstats_player_totals SET hwid=?,player_id=? WHERE (player_id=? || id=?)`;
        return await mysql.simpleQuery(query, [hwid, playerId, playerId, playerId]);
    }


    async adminGetMostRecentPlayerTotalByHWID(hwid){

        const query = `SELECT id,name,country,face FROM nstats_player_totals WHERE hwid=? AND gametype=0 ORDER BY last DESC LIMIT 1`;

        const result = await mysql.simpleQuery(query, [hwid]);

        if(result.length > 0) return result[0];

        return null;
    }


    //delete left over data from merging players by HWID
    async adminDeleteOutdatedPlayerHWID(hwid, ){

    }


    async adminFixPlayersHWID(hwid, affectedPlayerIds, matchManager, combogibManager){

        const mostRecentPlayerInfo = await this.adminGetMostRecentPlayerTotalByHWID(hwid);

        if(mostRecentPlayerInfo === null){
            throw new Error(`There was a problem getting the most recent player total usage of HWID ${hwid}`);
        }

        console.log(`mostRecentPlayerInfo that used ${hwid}`);
        console.log(mostRecentPlayerInfo);

        for(let i = 0; i < affectedPlayerIds.length; i++){

            const playerId = affectedPlayerIds[i];

            console.log(mostRecentPlayerInfo.id, playerId);

            if(playerId === mostRecentPlayerInfo.id) continue;

            await this.mergePlayersById(playerId, mostRecentPlayerInfo.id, matchManager, combogibManager);
            console.log(playerId);
        }

    }

    async adminAssignPlayerHWID(playerIds, targetHWID, matchManager, combogibManager){

        console.log(playerIds, targetHWID);

        const hwidPlayer = await this.adminGetPlayerByHWID(targetHWID);

        console.log(`hwidPlayer`);
        console.log(hwidPlayer);

        if(hwidPlayer === null){
            throw new Error(`There are no players with the HWID of ${targetHWID}`);
        }

        const removedPlayerIds = [];

        for(let i = 0; i < playerIds.length; i++){

            const id = playerIds[i];
            removedPlayerIds.push(id);
            await this.adminSetPlayerHWID(id, targetHWID);
        }

        await this.adminFixPlayersHWID(targetHWID, playerIds, matchManager, combogibManager);

        //set all playerIds to the hwidPlayer
        //merge player data


        return removedPlayerIds;
    }


    async getUniquePlayersByDay(start, end){

        //getUniquePlayersBetween(start, end)
        const day = (60 * 60) * 24;

        let current = start;

        const data = {};

        let dayIndex = 0;

        while(current < end){

            data[dayIndex] = await this.getUniquePlayersBetween(current, current + day);
            current += day;
            dayIndex++;
        }

        return data;
    }


    async getCountries(playerIds){

        if(playerIds.length === 0) return {};

        const query = `SELECT id,country FROM nstats_player_totals WHERE id IN(?)`;

        const result = await mysql.simpleQuery(query, [playerIds]);

        const obj = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            obj[r.id] = r.country;
        }

        return obj;
    }
    

    async getPlayerMapGametypeRecords(){

        const query = `SELECT 
        player_id,
        map_id,
        gametype,
        COUNT(*) as total_matches,
        MIN(match_date) as first_match,
        MAX(match_date) as last_match,
        SUM(winner) as wins,
        SUM(draw) as draws,
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
        AVG(accuracy) as accuracy,
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
        MAX(mh_kills_best_life) as mh_kills_best_life,
        MAX(mh_kills) as mh_kills_best,
        SUM(mh_deaths) as mh_deaths,
        MAX(mh_deaths) as mh_deaths_worst,
        SUM(telefrag_kills) as telefrag_kills,
        MAX(telefrag_kills) as telefrag_kills_best,
        SUM(telefrag_deaths) as telefrag_deaths,
        MAX(telefrag_deaths) as telefrag_deaths_worst,
        MAX(telefrag_best_spree) as telefrag_best_spree,
        MAX(telefrag_best_multi) as telefrag_best_multi,
        SUM(tele_disc_kills) as tele_disc_kills,
        MAX(tele_disc_kills) as tele_disc_kills_best,
        SUM(tele_disc_deaths) as tele_disc_deaths,
        MAX(tele_disc_deaths) as tele_disc_deaths_worst,
        MAX(tele_disc_best_spree) as tele_disc_best_spree,
        MAX(tele_disc_best_multi) as tele_disc_best_multi

        FROM nstats_player_matches GROUP BY player_id,map_id,gametype`;

        return await mysql.simpleQuery(query);
    }

    /**
     * Delete all player totals apart from gametype=0 and map=0(all time totals)
    */   
    async deleteAllPlayerGametypeMapTotals(){

        const query = `DELETE FROM nstats_player_totals WHERE player_id!=0`;

        return await mysql.simpleQuery(query);
    }


    async testInsertPlayerTotal(){

    }


    


    async bGametypeMapStatsExist(playerId, gametypeId, mapId){

        const query = `SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE player_id=? AND gametype=? AND map=?`;

        const result = await mysql.simpleQuery(query, [playerId, gametypeId, mapId]);

        if(result[0].total_players > 0) return true;

        return false;
    }

    async createNewGametypeMapStats(playerName, playerId, gametypeId, mapId){

        gametypeId = parseInt(gametypeId);
        mapId = parseInt(mapId);

        //dont update all time totals
        if(gametypeId === 0 && mapId === 0) return;
     

        const query = `INSERT INTO nstats_player_totals VALUES(
            NULL,?,?,?,0,0,0,"",0,0,?,?,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0)`;

        return await mysql.simpleQuery(query, ["", playerName, playerId, gametypeId, mapId]);
    }

    async updateNewGametypeMapStats(playerId, gametypeId, mapId, data){

        gametypeId = parseInt(gametypeId);
        mapId = parseInt(mapId);

        //dont update all time totals
        if(gametypeId === 0 && mapId === 0) return;
        

        const query = `UPDATE nstats_player_totals SET
        matches = matches + ?,
        first = IF(first < ? || first = 0, ?, first),
        last = IF(last > ? || last = 0, ?, last),
        wins = wins + ?,
        losses = losses + ?,
        draws = draws + ?,
        winrate = IF(wins > 0 && losses > 0, (wins / matches) * 100 , IF(losses = 0 && draws = 0, 100, 0)),
        playtime = playtime + ?,
        team_0_playtime = team_0_playtime + ?,
        team_1_playtime = team_1_playtime + ?,
        team_2_playtime = team_2_playtime + ?,
        team_3_playtime = team_3_playtime + ?,
        spec_playtime = spec_playtime + ?,
        first_bloods = first_bloods + ?,
        frags = frags + ?,
        score = score + ?,
        kills = kills + ?,
        deaths = deaths + ?,
        suicides = suicides + ?,
        team_kills = team_kills + ?,
        spawn_kills = spawn_kills + ?,
        efficiency = IF(kills > 0, if(deaths > 0, (kills / (kills + deaths)) * 100, 100), 0),
        multi_1 = multi_1 + ?,
        multi_2 = multi_2 + ?,
        multi_3 = multi_3 + ?,
        multi_4 = multi_4 + ?,
        multi_5 = multi_5 + ?,
        multi_6 = multi_6 + ?,
        multi_7 = multi_7 + ?,
        multi_best = IF(multi_best < ?, ?, multi_best),
        spree_1 = spree_1 + ?,
        spree_2 = spree_2 + ?,
        spree_3 = spree_3 + ?,
        spree_4 = spree_4 + ?,
        spree_5 = spree_5 + ?,
        spree_6 = spree_6 + ?,
        spree_7 = spree_7 + ?,
        spree_best = IF(spree_best < ?, ?, spree_best),
        fastest_kill = IF(fastest_kill > ?, ?, fastest_kill),
        slowest_kill = IF(slowest_kill < ?, ?, slowest_kill),
        best_spawn_kill_spree = IF(best_spawn_kill_spree < ?, ?, best_spawn_kill_spree),
        assault_objectives = assault_objectives + ?,
        dom_caps = dom_caps + ?,
        dom_caps_best = IF(dom_caps_best < ?, ?, dom_caps_best),
        dom_caps_best_life = IF(dom_caps_best_life < ?, ?, dom_caps_best_life),
        accuracy = ?,
        k_distance_normal = k_distance_normal + ?,
        k_distance_long = k_distance_long + ?,
        k_distance_uber = k_distance_uber + ?,
        headshots = headshots + ?,
        shield_belt = shield_belt + ?,
        amp = amp + ?,
        amp_time = amp_time + ?,
        invisibility = invisibility + ?,
        invisibility_time = invisibility_time + ?,
        pads = pads + ?,
        armor = armor + ?,
        boots = boots + ?,
        super_health = super_health + ?,
        mh_kills = mh_kills + ?,
        mh_kills_best_life = IF(mh_kills_best_life < ?, ?, mh_kills_best_life),
        mh_kills_best = IF(mh_kills_best < ?, ?, mh_kills_best),
        mh_deaths = mh_deaths + ?,
        mh_deaths_worst = IF(mh_deaths_worst < ?, ?, mh_deaths_worst)



        WHERE player_id=? AND gametype=? AND map=?`;

        //console.log(data);

        const losses = data.total_matches - data.draws - data.wins;

        const vars = [
            data.total_matches,
            data.first_match, data.first_match,
            data.last_match, data.last_match,
            data.wins,
            losses,
            data.draws,
            data.playtime,
            data.team_0_playtime,
            data.team_1_playtime,
            data.team_2_playtime,
            data.team_3_playtime,
            data.spec_playtime,
            data.first_bloods,
            data.frags,
            data.score,
            data.kills,
            data.deaths,
            data.suicides,
            data.team_kills,
            data.spawn_kills,
            data.multi_1,
            data.multi_2,
            data.multi_3,
            data.multi_4,
            data.multi_5,
            data.multi_6,
            data.multi_7,
            data.multi_best, data.multi_best,
            data.spree_1,
            data.spree_2,
            data.spree_3,
            data.spree_4,
            data.spree_5,
            data.spree_6,
            data.spree_7,
            data.spree_best, data.spree_best,
            data.fastest_kill, data.fastest_kill,
            data.slowest_kill, data.slowest_kill,
            data.best_spawn_kill_spree, data.best_spawn_kill_spree,
            data.assault_objectives,
            data.dom_caps,
            data.dom_caps_best, data.dom_caps_best,
            data.dom_caps_best_life, data.dom_caps_best_life,
            data.accuracy,//probably need to do it differently,
            data.k_distance_normal,
            data.k_distance_long,
            data.k_distance_uber,
            data.headshots,
            data.shield_belt,
            data.amp,
            data.amp_time,
            data.invisibility,
            data.invisibility_time,
            data.pads,
            data.armor,
            data.boots,
            data.super_health,
            data.mh_kills,
            data.mh_kills_best_life, data.mh_kills_best_life,
            data.mh_kills_best, data.mh_kills_best,
            data.mh_deaths,
            data.mh_deaths_worst, data.mh_deaths_worst,



            playerId, gametypeId, mapId
        ];

        return await mysql.simpleQuery(query, vars);
    }

    updateRecalulatePlayerCurrent(totals, playerId, gametypeId, mapId, data){

        if(totals[playerId] === undefined){
            totals[playerId] = {};
        }

        if(totals[playerId][mapId] === undefined){
            totals[playerId][mapId] = {};
        }

        if(totals[playerId][mapId][gametypeId] === undefined){
            totals[playerId][mapId][gametypeId] = data;
            return;
        }
    }

    async recalculateAllPlayerMapGametypeRecords(){

        const data = await this.getPlayerMapGametypeRecords();

        const playerIds = [...new Set(data.map((d) =>{
            return d.player_id;
        }))];


        const playerNames = await this.getNamesByIds(playerIds, true);

        //update gametype = 0, map = 0, but delete everything else for player totals
        await this.deleteAllPlayerGametypeMapTotals();


        const currentTotals = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(currentTotals[d.player_id] === undefined){
                currentTotals[d.player_id] = {};
            }

            this.updateRecalulatePlayerCurrent(currentTotals, d.player_id, d.gametype, d.map_id, d);
            
        }


        for(const [player, map] of Object.entries(currentTotals)){

            const currentPlayer = playerNames[player] ?? {"name": ""};

            for(const [mapId, data] of Object.entries(map)){

                //console.log(mapId, "gametypeID = 0", data[0].total_matches);

                for(const [gametypeId, gametypeData] of Object.entries(data)){

                    //map all time totals
                    if(!await this.bGametypeMapStatsExist(player, 0, mapId)){

                        await this.createNewGametypeMapStats(currentPlayer.name, player, 0, mapId);
                    }

                    await this.updateNewGametypeMapStats(player, 0, mapId, gametypeData);

                    //map and gametype totals
                    if(!await this.bGametypeMapStatsExist(player, gametypeId, mapId)){
                        await this.createNewGametypeMapStats(currentPlayer.name, player, gametypeId, mapId);
                    }

                    await this.updateNewGametypeMapStats(player, gametypeId, mapId, gametypeData);
                    
                    // gametype totals
                    if(!await this.bGametypeMapStatsExist(player, gametypeId, 0)){
                        await this.createNewGametypeMapStats(currentPlayer.name, player, gametypeId, 0);
                    }
                    
                    await this.updateNewGametypeMapStats(player, gametypeId, 0, gametypeData);
                    
                }
            }
        }
    }


    async getBasicMapStats(playerId){

        const query = `SELECT first,last,map,matches,wins,draws,losses,winrate,playtime,spec_playtime 
        FROM nstats_player_totals WHERE map!=0 AND gametype=0 AND player_id=?`;

        return await mysql.simpleQuery(query, [playerId]);
    }

    async insertNewPlayerTotalFromData(gametypeId, data){


        const playerInfo = await this.getBasicInfo([data.player_id]);

        if(playerInfo[data.player_id] === undefined){
            new Message(`Players.insertNewPlayerTotalFromData(${gametypeId}) playerInfo is undefined`,"error");
            return;
        }

        const player = playerInfo[data.player_id];

        const query = `INSERT INTO nstats_player_totals VALUES(
            NULL,"",?,?,?,?,
            "",?,0,0,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?
        )`;

        const d = data;

        const losses = d.total_matches - d.wins - d.draws;

        let winrate = 0;
        
        if(d.wins > 0 && d.total_matches > 0){
            winrate = (d.wins / d.total_matches) * 100;
        }

        let eff = 0;

        if(d.kills > 0){

            if(d.deaths === 0){
                eff = 100;
            }else{
                eff = (d.kills / (d.kills + d.deaths)) * 100;
            }
        }

        const vars = [
            player.name, d.player_id, d.first_match, d.last_match,
            player.country, gametypeId,
            d.map_id, d.total_matches, d.wins, losses, d.draws,
            winrate, d.playtime, d.team_0_playtime, d.team_1_playtime, d.team_2_playtime,
            d.team_3_playtime, d.spec_playtime, d.first_bloods, d.frags,
            d.score, d.kills, d.deaths, d.suicides, d.team_kills,
            d.spawn_kills, eff, d.multi_1, d.multi_2, d.multi_3,
            d.multi_4, d.multi_5, d.multi_6, d.multi_7, d.multi_best,
            d.spree_1, d.spree_2, d.spree_3, d.spree_4, d.spree_5,
            d.spree_6, d.spree_7, d.spree_best, 0, 0,
            d.best_spawn_kill_spree, d.assault_objectives, d.dom_caps, d.dom_caps_best, d.dom_caps_best_life,
            d.accuracy, d.k_distance_normal, d.k_distance_long, d.k_distance_uber, d.headshots,
            d.shield_belt, d.amp, d.amp_time, d.invisibility, d.invisibility_time,
            d.pads, d.armor, d.boots, d.super_health, d.mh_kills,
            d.mh_kills_best_life, d.mh_kills_best, 0, 0, 0
        ];

        await mysql.simpleQuery(query, vars);
    }
    
    async adminHWIDSearch(hwid){

        const query = `SELECT COUNT(*) as total_matches, player_id, 
        MIN(match_date) as first_match,
        MAX(match_date) as last_match,
        ip,
        country
        FROM nstats_player_matches WHERE hwid=? 
        GROUP BY player_id, hwid, ip, country`;

        const result = await mysql.simpleQuery(query, [hwid]);

        const uniqueIds = [...new Set(result.map((r) =>{
            return r.player_id;
        }))];

        const names = await this.getJustNamesByIds(uniqueIds);

        return {"data": result, "playerNames": names};
    }

    async deletePlayerMapsDataWithRowIds(rowIds){

        const query = `DELETE FROM nstats_player_maps WHERE id IN(?)`;

        return await mysql.simpleQuery(query, [rowIds]);
    }

    async fixDuplucateMapsData(newId){

        const getQuery = `SELECT id,player,first,first_id,last,last_id,matches,playtime,longest,longest_id FROM nstats_player_maps WHERE map=?`;
        const getResult = await mysql.simpleQuery(getQuery, [newId]);

        const rowsToDelete = [];
        const totals = {};

        for(let i = 0; i < getResult.length; i++){

            const r = getResult[i];

            rowsToDelete.push(r.id);

            if(totals[r.player] === undefined){
                totals[r.player] = r;
                continue;
            }
       

            totals[r.player].matches += r.matches;
            totals[r.player].playtime += r.playtime;

            if(r.first < totals[r.player].first){
                totals[r.player].first = r.first;
                totals[r.player].first_id = r.first_id;
            }

            if(r.last > totals[r.player].last){
                totals[r.player].last = r.last;
                totals[r.player].last_id = r.last_id;
            }

            if(r.longest > totals[r.player].longest){
                totals[r.player].longest = r.longest;
                totals[r.player].longest_id = r.longest_id;
            }
        }

        const insertQuery = `INSERT INTO nstats_player_maps (map,player,first,first_id,last,last_id,matches,playtime,longest,longest_id) VALUES ?`;


        const insertVars = [];

        for(const d of Object.values(totals)){

            insertVars.push([newId, d.player, d.first, d.first_id, d.last, d.last_id, d.matches, d.playtime, d.longest, d.longest_id]);
        }

        await mysql.bulkInsert(insertQuery, insertVars);

        await this.deletePlayerMapsDataWithRowIds(rowsToDelete);

    }

    async deletePlayerTotalsByRowIds(rowIds){

        if(rowIds.length === 0) return;

        const query = `DELETE FROM nstats_player_totals WHERE id IN(?)`;

        return await mysql.simpleQuery(query, [rowIds]);
    }



    async insertMergedPlayerMapTotals(data){

        const query = `INSERT INTO nstats_player_totals (
            hwid, name, player_id, first, last,
            ip, country, face, voice, gametype,
            map, matches, wins, losses, draws,
            winrate, playtime, team_0_playtime, team_1_playtime, team_2_playtime,
            team_3_playtime, spec_playtime, first_bloods, frags, score,
            kills, deaths, suicides, team_kills, spawn_kills,
            efficiency, multi_1, multi_2, multi_3,  multi_4,
            multi_5, multi_6, multi_7, multi_best, spree_1,
            spree_2, spree_3, spree_4, spree_5, spree_6,
            spree_7, spree_best, fastest_kill, slowest_kill, best_spawn_kill_spree,
            assault_objectives, dom_caps, dom_caps_best, dom_caps_best_life, accuracy,
            k_distance_normal, k_distance_long, k_distance_uber, headshots, shield_belt,
            amp, amp_time, invisibility, invisibility_time, pads,
            armor, boots, super_health, mh_kills, mh_kills_best_life,
            mh_kills_best, views, mh_deaths, mh_deaths_worst) VALUES ?`;

        const insertVars = [];

        const gametypesKeys = Object.keys(data);

        //loop through gametypes
        for(let i = 0; i < gametypesKeys.length; i++){

            const gId = gametypesKeys[i];

            const playerKeys = Object.keys(data[gId]);

            //loop through player gametype data
            for(let x = 0; x < playerKeys.length; x++){

                const pId = playerKeys[x];

                const d = data[gId][pId];

                insertVars.push([
                    d.hwid, d.name, d.player_id, d.first, d.last,
                    d.ip, d.country, d.face, d.voice, d.gametype,
                    d.map, d.matches, d.wins, d.losses, d.draws,
                    d.winrate, d.playtime, d.team_0_playtime, d.team_1_playtime, d.team_2_playtime,
                    d.team_3_playtime, d.spec_playtime, d.first_bloods, d.frags, d.score,
                    d.kills, d.deaths, d.suicides, d.team_kills, d.spawn_kills,
                    d.efficiency, d.multi_1, d.multi_2, d.multi_3,  d.multi_4,
                    d.multi_5, d.multi_6, d.multi_7, d.multi_best, d.spree_1,
                    d.spree_2, d.spree_3, d.spree_4, d.spree_5, d.spree_6,
                    d.spree_7, d.spree_best, d.fastest_kill, d.slowest_kill, d.best_spawn_kill_spree,
                    d.assault_objectives, d.dom_caps, d.dom_caps_best, d.dom_caps_best_life, d.accuracy,
                    d.k_distance_normal, d.k_distance_long, d.k_distance_uber, d.headshots, d.shield_belt,
                    d.amp, d.amp_time, d.invisibility, d.invisibility_time, d.pads,
                    d.armor, d.boots, d.super_health, d.mh_kills, d.mh_kills_best_life,
                    d.mh_kills_best, d.views, d.mh_deaths, d.mh_deaths_worst
                ]);
            }
        }

        await mysql.bulkInsert(query, insertVars);

    }


    async fixDuplicateMapTotals(mapId){

        const query = `SELECT * FROM nstats_player_totals WHERE map=?`;

        const result = await mysql.simpleQuery(query, [mapId]);

        //result = [...result, ...result];
        const totals = {};

        const mergeTypes = [
            "matches","wins","draws","playtime","team_0_playtime","team_1_playtime","team_2_playtime","team_3_playtime",
            "spec_playtime","first_bloods","frags","score","kills","deaths","suicides","team_kills","spawn_kills",
            "multi_1","multi_2","multi_3","multi_4","multi_5","multi_6","multi_7","spree_1","spree_2","spree_3",
            "spree_4","spree_5","spree_6","spree_7","assault_objectives","dom_caps","k_distance_normal","k_distance_long",
            "k_distance_uber","headshots","shield_belt","amp","amp_time","invisibility","invisibility_time","pads","armor",
            "boots","super_health","mh_kills","mh_deaths", "views"
        ];

        const higherBetter = [
            "multi_best","spree_best","slowest_kill","best_spawn_kill_spree","dom_caps_best","dom_caps_best_life",
            "mh_kills_best_life","mh_kills_best","mh_deaths_worst","last"
        ];

        const lowerBetter = [
            "fastest_kill", "first"
        ];


        const rowsToDelete = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            

            rowsToDelete.push(r.id);

            if(totals[r.gametype] === undefined) totals[r.gametype] = {};

            if(totals[r.gametype][r.player_id] === undefined){
                totals[r.gametype][r.player_id] = r;
                totals[r.gametype][r.player_id].total_entries = 1;
                totals[r.gametype][r.player_id].total_accuracy = r.accuracy;
                continue;
            }

            const t = totals[r.gametype][r.player_id];

            t.total_entries++;

            for(let x = 0; x < mergeTypes.length; x++){

                const m = mergeTypes[x];

                t[m] += r[m];
            }

            for(let x = 0; x < higherBetter.length; x++){

                const h = higherBetter[x];

                if(t[h] < r[h]) t[h] = r[h];
            }

            
            for(let x = 0; x < lowerBetter.length; x++){

                const low = lowerBetter[x];

                if(t[low] > r[low]) t[low] = r[low];
            }

            //TODO: EFF, accuracy

            if(t.kills > 0){

                if(t.deaths === 0){
                    t.efficiency = 100;
                }else{
                    t.efficiency = t.kills / (t.kills + t.deaths) * 100;
                }

            }else{
                t.efficiency = 0;
            }

            t.total_accuracy += r.accuracy;

            if(t.total_accuracy > 0){

                t.accuracy = t.total_accuracy / t.total_entries;
            }
        }

        
        //return;

        await this.deletePlayerTotalsByRowIds(rowsToDelete);
        await this.insertMergedPlayerMapTotals(totals);
    }

    async changeMapId(oldId, newId){

        const tables = [
            "player_maps", //map
            "player_matches", //map_id
            "player_telefrags", //map_id
            "player_totals", //map need to merge dupliactes

        ];

        //merge maps dupliactes

        const columns = [
            "map", "map_id", "map_id", "map"
        ];

        //map not map_id
        for(let i = 0; i < tables.length; i++){

            const t = tables[i];
            const c = columns[i];

            const query = `UPDATE nstats_${t} SET ${c}=? WHERE ${c}=?`;

            await mysql.simpleQuery(query, [newId, oldId]);
        }


        await this.fixDuplucateMapsData(newId);
        await this.fixDuplicateMapTotals(newId);
    }

    async getAllHWIDtoNames(){

        const query = `SELECT * FROM nstats_hwid_to_name ORDER BY player_name ASC`;

        return await mysql.simpleQuery(query);
    }
}



module.exports = Players;