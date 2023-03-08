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

class Players{

    constructor(){
        this.player = new Player();
    }

    debugGetAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_player_totals WHERE gametype=0 ORDER BY name ASC";

            const players = [];

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                Functions.removeIps(result);
                resolve(result);
            });
        });
    }

    async getTotalPlayers(name){

        let query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE gametype=0 AND playtime>0";
        let vars = [];

        if(name !== undefined){

            query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE gametype=0 AND playtime>0 AND name LIKE(?) ";
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

            let query = `SELECT * FROM nstats_player_totals WHERE gametype=0 AND playtime>0 ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;
            let vars = [start, perPage];

            if(name !== ""){
                query = `SELECT * FROM nstats_player_totals WHERE gametype=0 AND playtime>0 AND name LIKE(?) ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;
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



    getJustNamesByIds(ids){

        return new Promise((resolve, reject) =>{

            if(ids === undefined) resolve({});
            if(ids.length === 0) resolve({});

            const query = "SELECT id,name FROM nstats_player_totals WHERE gametype=0 AND id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = {};

                    for(let i = 0; i < result.length; i++){
                        data[result[i].id] = result[i].name;
                    }

                    resolve(data);
                }

                resolve({});
            });
        });
    }

    async deleteMatchData(id){

        const query = "DELETE FROM nstats_player_matches WHERE match_id=?";
        return await mysql.simpleQuery(query, [id]);
    }




    async getPlayerTotalsFromMatchesTable(playerId, gametypeId){


        const query = `SELECT
        COUNT(*) as total_matches,
        MIN(match_date) as first,
        MAX(match_date) as last,
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
        efficiency = IF(kills > 0, IF(deaths > 0, (kills / (deaths + kills)) * 100, 100),0) as efficiency,
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
        SUM(pads) as pads,
        SUM(armor) as armor,
        SUM(boots) as boots,
        SUM(super_health) as super_health,
        SUM(mh_kills) as mh_kills,
        MAX(mh_kills) as mh_kills_best,
        MAX(mh_kills_best_life) as mh_kills_best_life,
        SUM(mh_deaths) as mh_deaths,
        MAX(mh_deaths) as mh_deaths_worst
        FROM nstats_player_matches
        WHERE playtime>0 AND player_id=? ${(gametypeId !== 0) ? "AND gametype=?" : ""}`;

        const vars = [playerId];

        if(gametypeId !== 0) vars.push(gametypeId);

        const result = await mysql.simpleQuery(query, vars);

        if(result.length > 0){

            if(result[0].total_matches === 0) return null;

            result[0].winRate = 0;
            result[0].losses = 0;

            if(result[0].total_matches > 0 && result[0].wins > 0){        
                result[0].winRate = result[0].wins / result[0].total_matches * 100;
            }

            result[0].losses = result[0].total_matches - result[0].draws - result[0].wins;

            return result[0];
        }

        return null;

    }

    async resetPlayerTotals(playerId, gametypeId){

        const query = `UPDATE nstats_player_totals SET
        first=0,
        last=0,
        matches=0,
        wins=0,
        losses=0,
        draws=0,
        winrate=0,
        playtime=0,
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
        WHERE ${(gametypeId !== 0) ? "player_id" : "id"}=? AND gametype=?`;

        console.log(`Reset player totals for playerId=${playerId} for gametype = ${gametypeId}`);
        return await mysql.simpleQuery(query, [playerId, gametypeId]);
    }

    
    async reduceTotals(playerIds, gametypeId){

        for(let i = 0; i < playerIds.length; i++){

            const playerId = playerIds[i];

            const playerGametypeTotals = await this.getPlayerTotalsFromMatchesTable(playerId, gametypeId);
            const playerTotals = await this.getPlayerTotalsFromMatchesTable(playerId, 0);
            


            if(playerTotals === null){
                await this.resetPlayerTotals(playerId, 0);
                //need to set player totals to 0
            }else{
                await this.updatePlayerTotal(playerId, 0, playerTotals);
            }

            if(playerGametypeTotals === null){
                await this.resetPlayerTotals(playerId, gametypeId);
            }else{
                await this.updatePlayerTotal(playerId, gametypeId, playerTotals);
            }
            
        }
    }

    async getAllNames(bOnlyNames){

        if(bOnlyNames === undefined) bOnlyNames = false;

        if(!bOnlyNames){
            return await mysql.simpleFetch("SELECT id,name,country FROM nstats_player_totals WHERE gametype=0 ORDER BY name ASC");
        }

        const result = await mysql.simpleQuery("SELECT name FROM nstats_player_totals WHERE gametype=0 ORDER BY name ASC");

        const names = [];

        for(let i = 0; i < result.length; i++){

            names.push(result[i].name);
        }
        return names;
    }

    async getNameIdPairs(){

        const query = "SELECT id,name FROM nstats_player_totals WHERE gametype=0 ORDER BY name ASC";

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
            
            await mysql.simpleInsert(query, vars);

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
            
            const updatedPlayerMatches = await matchManager.getAllPlayerMatches(second);
            await this.recalculatePlayerTotalsAfterMerge(second, names[0]);

            const weaponsManager = new Weapons();
            await weaponsManager.mergePlayers(first, second, matchManager);


            const winrateManager = new Winrate();

            await winrateManager.deletePlayer(first);
            await winrateManager.deletePlayer(second);
            await winrateManager.recalculatePlayerHistoryAfterMerge(second, updatedPlayerMatches);


            const spreeManager = new Sprees();
            await spreeManager.changePlayerIds(first, second);

            await combogibManager.mergePlayers(first, second);


            const rankingsManager = new Rankings();
            await rankingsManager.init();

            await rankingsManager.deletePlayer(first);
            await rankingsManager.deletePlayer(second);
            await rankingsManager.fullPlayerRecalculate(this, second);


            return true;
        }catch(err){
            console.trace(err.toString());
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

    async getGametypeTotals(playerId, bAllTotals){

        let query = `SELECT ${(bAllTotals) ? "" : "gametype,"}
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
        SUM(accuracy) as accuracy
        FROM nstats_player_matches
        WHERE player_id=?`;

        if(!bAllTotals) query += ` GROUP BY gametype`;

        return await mysql.simpleQuery(query, [playerId]);
    }

    async updatePlayerTotal(playerId, gametypeId, data){

        const query = `UPDATE nstats_player_totals SET 
        first=?,
        last=?,
        matches=?,
        wins=?,
        losses=?,
        draws=?,
        winrate=?,
        playtime=?,
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

        WHERE ${(gametypeId === 0) ? "id" : "player_id" }=? AND gametype=?`;


        const vars = [
            data.first,
            data.last,
            data.total_matches,
            data.wins,
            data.losses,
            data.draws,
            data.winRate,
            data.playtime,
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

            playerId, gametypeId
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async recalculatePlayerTotalsAfterMerge(playerId, playerName){

        const gametypes = await this.getGametypeTotals(playerId, false);
        const allTotals = await this.getGametypeTotals(playerId, true);
        allTotals[0].gametype = 0;

        gametypes.push(allTotals[0]);


        for(let i = 0; i < gametypes.length; i++){

            const g = gametypes[i];


            g.winRate = 0;
            g.efficiency = 0;

            if(g.wins > 0 && g.total_matches > 0){
                
                g.winRate = g.wins / g.total_matches * 100;
            }

            g.losses = g.total_matches - g.wins;

            if(g.kills > 0){

                if(g.deaths > 0){
                    g.efficiency = g.kills / (g.kills + g.deaths) * 100;
                }else{
                    g.efficiency = 100;
                }
            }

            if(g.accuracy > 0) g.accuracy = g.accuracy / g.total_matches;

            g.name = playerName.name;


            const updateResult = await this.updatePlayerTotal(playerId, g.gametype, g);

            if(updateResult.affectedRows === 0){
                await this.createTotalsFromMerge(playerId, g.gametype, g);
            }
        }
    }

    async createTotalsFromMerge(playerId, gametypeId, data){

        const query = `INSERT INTO nstats_player_totals VALUES(NULL,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?, 
        ?,?, 
        ?,?,?,?,?, 
        ?,?,?,?,?, 
        ?,?,?,?,?, 
        ?,?,?,?,?, 
        ?,?,?,?,?)`; 

        const vars = [
            "", data.name, playerId, data.first, data.last,  
            "", "", 0, 0, gametypeId, 
            data.total_matches, data.wins, data.losses, data.draws, data.winRate, 
            data.playtime, data.first_bloods, data.frags, data.score, data.kills, 
            data.deaths, data.suicides, data.team_kills, data.spawn_kills, data.efficiency, 
            data.multi_1, data.multi_2, data.multi_3, data.multi_4, data.multi_5, data.multi_6, data.multi_7, data.multi_best, 
            data.spree_1, data.spree_2, data.spree_3, data.spree_4, data.spree_5, data.spree_6, data.spree_7, data.spree_best, 
            0,0, 
            data.best_spawn_kill_spree, data.assault_objectives, data.dom_caps, data.dom_caps_best, data.dom_caps_best_life, 
            data.accuracy, data.k_distance_normal, data.k_distance_long, data.k_distance_uber, data.headshots, 
            data.shield_belt, data.amp, data.amp_time, data.invisibility, data.invisibility_time,  
            data.pads, data.armor, data.boots, data.super_health, data.mh_kills, 
            data.mh_kills_best_life, data.mh_kills_best, 0, data.mh_deaths, data.mh_deaths_worst
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
                playerData.data.push(playerData.lastScore);
            }
        }

    }

    createPlayerScoreHistory(data, players){

        const playerScores = {};

        for(const [playerId, playerName] of Object.entries(players)){

            playerScores[parseInt(playerId)] = {
                "name": playerName, 
                "data": [0], 
                "lastScore": 0
            };
        }

        //console.log(playerScores);

        if(playerScores === {}) return [];

        let previousTimestamp = -1;
        let currentIgnoreList = [];

        for(let i = 0; i < data.length; i++){

            const {timestamp, player, score} = data[i];

            if(timestamp !== previousTimestamp){
                this.updateOtherScoresGraphData(playerScores, currentIgnoreList);
                currentIgnoreList = [];
            }

            if(playerScores[player] === undefined){
                console.log(`Players.createPlayerScoreHistory(${player}) player is null`);
                continue;
            }


            const currentPlayer = playerScores[player];

            //reconnected players scores can have duplicated data
            if(currentIgnoreList.indexOf(player) !== -1){
                currentPlayer.data[currentPlayer.data.length - 1] = score;
                continue;
            }

            currentPlayer.data.push(score);
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

        const graphData = this.createPlayerScoreHistory(data, players);

        graphData.sort((a, b) =>{

            a = a.lastValue;
            b = b.lastValue;

            return b-a;
        });
       
        return Functions.reduceGraphDataPoints(graphData, 50);

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

        const query = `SELECT player_id,name,ip,country,first,last,playtime,matches as total_matches
        FROM nstats_player_totals WHERE ${columnName} LIKE ? AND gametype=0 ORDER BY ${columnName} ASC`;

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

        const query = `SELECT player_id, MIN(match_date) as first_match, MAX(match_date) as last_match, 
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

    async getFullHistory(playerId){

        const usedIps = await this.getUsedIps(playerId);
        const aliases = await this.getAliasesByIPs(usedIps.ips);

        return {"usedIps": usedIps, "aliases": aliases};
        
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


    async getBasicInfo(playerIds){

        if(playerIds.length === 0) return {};

        const query = `SELECT name,id,country FROM nstats_player_totals WHERE id IN(?)`;
        const result = await mysql.simpleQuery(query, [playerIds]);
        const found = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            found[r.id] = {"id": r.id,"name": r.name, "country": r.country};
        }

        return found;
    }


    async adminGetPlayersWithHWIDS(){

        const query = `SELECT id,name,country,hwid,matches,last FROM nstats_player_totals WHERE gametype=0 AND hwid!="" ORDER BY name ASC`;

        return await mysql.simpleQuery(query);
    }

    async adminGetPlayersBasic(){

        const query = `SELECT id,name,country,hwid,matches,last FROM nstats_player_totals WHERE gametype=0 ORDER BY name ASC`;

        return await mysql.simpleQuery(query);
    }
    
}



module.exports = Players;