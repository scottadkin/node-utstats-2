const Player = require('./player');
const mysql = require('./database');
const Functions = require('./functions');
const Matches = require('./matches');
const Assault = require('./assault');
const CTF = require('./ctf');
const Domination = require('./domination');
const Headshots = require('./headshots');
const Items = require('./items');
const Kills = require('./kills');
const Connections = require('./connections');
const Pings = require('./pings');
const Maps = require('./maps');
const Weapons = require('./weapons');
const Rankings = require('./rankings');
const Winrate = require('./winrate');
const CountriesManager = require('./countriesmanager');
const Faces = require('./faces');
const Teams = require('./teams');
const Voices = require('./voices');
const Sprees = require('./sprees');
const MonsterHunt = require('./monsterhunt');

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
                'name',
                'country',
                'score',
                'frags',
                'kills',
                'playtime',
                'winrate',
                'wins',
                'loses',
                'draws',
                'matches',
                'first',
                'last',
                'deaths',
                'efficiency',
                'accuracy'
            ];

            sort = sort.toLowerCase();

            let index = validTypes.indexOf(sort);

            if(index === -1){
                index = 0;
            }

            if(order !== 'ASC' && order !== 'DESC'){
                order = 'ASC';
            }

            let query = `SELECT * FROM nstats_player_totals WHERE gametype=0 AND playtime>0 ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;
            let vars = [start, perPage];

            if(name !== ''){
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


    async getNamesByIds(ids, bReturnObject){

        if(ids === undefined) return [];
        if(ids.length === 0) return [];
        if(bReturnObject === undefined) bReturnObject = false;

        const query = "SELECT id,name,country,face FROM nstats_player_totals WHERE id IN (?)";

        const data = await mysql.simpleQuery(query, [ids]);

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

            return obj;

        }else{
            return data;
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

    getBestOfTypeTotal(validTypes, type, gametype, limit, page){

        return new Promise((resolve, reject) =>{

            if(gametype === undefined) gametype = 0;
            if(limit === undefined) limit = 25;
            if(page === undefined) page = 1;

            page--;

            const start = page * limit;

            const typeIndex = validTypes.indexOf(type.toLowerCase());

            if(typeIndex === -1) resolve([]);

            const query = `SELECT id,name,country,face,matches,playtime,${validTypes[typeIndex]} as value 
            FROM nstats_player_totals WHERE gametype=? ORDER BY ${validTypes[typeIndex]} DESC LIMIT ?, ?`;

            
            mysql.query(query, [gametype, start, limit], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getTotalResults(gametype){

        return new Promise((resolve, reject) =>{

            const query = `SELECT COUNT(*) as total_results FROM nstats_player_totals WHERE gametype=?`;

            mysql.query(query, [gametype], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    
                    if(result.length > 0){
                        resolve(result[0].total_results);
                    }
                }

                resolve(0);
            });

        });
    }


    getBestMatchValues(valid, type, page, perPage){

        return new Promise((resolve, reject) =>{

            type = type.toLowerCase();

            let index = valid.indexOf(type);

            if(index === -1) index = 0;

            page--;

            perPage = parseInt(perPage);

            if(perPage !== perPage) perPage = 50;

            const start = perPage * page;

            const query = `SELECT match_id,player_id,map_id,country,playtime,${valid[index]} as value 
            FROM nstats_player_matches ORDER BY ${valid[index]} DESC LIMIT ?, ?`;

            mysql.query(query, [start, perPage], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    getTotalMatchResults(gametype){


        return new Promise((resolve, reject) =>{


            let query = "SELECT COUNT(*) as total_matches FROM nstats_player_matches WHERE gametype=?";
            let vars = [gametype];

            if(gametype === undefined){
                query = "SELECT COUNT(*) as total_matches FROM nstats_player_matches";
                vars = [];
            }

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 0){
                        resolve(result[0].total_matches);
                    }
                }

                resolve(0);
            });
        });
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

    deleteMatchData(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_player_matches WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    
    async reduceTotals(players, gametypeId){

        try{


            for(let i = 0; i < players.length; i++){

                await this.player.reduceTotals(players[i], gametypeId);
            }

        }catch(err){
            console.trace(err);
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

            await matchManager.renameDmWinner(oldName, newName);
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
                ?,?,?,?,?, 
                ?,?,?,?,?, 
                ?,?,?,?,?, 
                ?,?,?,?,?, 
                ?,?,?,?,?,?, 
                ?,?,?,?
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
                d.invisibility, d.invisibility_time, d.pads, d.armor, d.boots, d.super_health,
                d.mh_kills, d.mh_kills_best_life, d.mh_kills_best, d.views
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
    

    async recalculatePlayerTotalsAfterMerge(playerId, playerName, gametypeTotals, allTotals){

        gametypeTotals["0"] = allTotals;


        const query = `UPDATE nstats_player_totals SET 
        matches=?, draws=?, wins=?, losses=?, winrate=?,
        playtime=?, first_bloods=?, frags=?, score=?, kills=?, deaths=?, suicides=?, team_kills=?, spawn_kills=?,
        efficiency=?, multi_1=?, multi_2=?, multi_3=?, multi_4=?, multi_5=?, multi_6=?, multi_7=?, multi_best=?,
        spree_1=?, spree_2=?, spree_3=?, spree_4=?, spree_5=?, spree_6=?, spree_7=?, spree_best=?,
        best_spawn_kill_spree=?, flag_assist=?, flag_return=?, flag_taken=?, flag_dropped=?, flag_capture=?,
        flag_pickup=?, flag_seal=?, flag_cover=?, flag_cover_pass=?, flag_cover_fail=?, flag_self_cover=?,
        flag_self_cover_pass=?, flag_self_cover_fail=?, flag_multi_cover=?, flag_spree_cover=?, flag_cover_best=?,
        flag_self_cover_best=?, flag_kill=?, flag_save=?, flag_carry_time=?, assault_objectives=?, dom_caps=?,
        dom_caps_best=?, dom_caps_best_life=?, accuracy=?, k_distance_normal=?, k_distance_long=?, k_distance_uber=?,
        headshots=?, shield_belt=?, amp=?, amp_time=?, invisibility=?, invisibility_time=?, pads=?, armor=?,
        boots=?, super_health=?, mh_kills=?, mh_kills_best_life=?, mh_kills_best=?
        WHERE gametype=? AND player_id=?`;

        for(const [gametype, d] of Object.entries(gametypeTotals)){

            const losses = d.total_matches - d.wins - d.draws;

    
            let winRate = 0;

            if(d.total_matches > 0){
                if(d.wins > 0){
                    winRate = (d.wins / d.total_matches) * 100;
                }
            }

            let eff = 0;

            if(d.kills > 0){

                if(d.deaths === 0){
                    eff = 100;
                }else{

                    eff = (d.kills / (d.kills + d.deaths)) * 100;
                }

            }


            d.views = 0;
            d.player_id = playerId;
            d.ip = "-1";
            d.country = "xx";
            d.face = 0;
            d.voice = 0;
            d.matches = d.total_matches;
            d.losses = losses;
            d.winrate = winRate;
            d.efficiency = eff;
            d.fastest_kill = 0;
            d.slowest_kill = 0;


            const vars = [
                d.total_matches,
                d.draws,
                d.wins,
                losses,
                winRate,
                d.playtime, d.first_bloods, d.frags, d.score, d.kills, d.deaths, d.suicides, d.team_kills, d.spawn_kills,
                eff, d.multi_1, d.multi_2, d.multi_3, d.multi_4, d.multi_5, d.multi_6, d.multi_7, d.multi_best,
                d.spree_1, d.spree_2, d.spree_3, d.spree_4, d.spree_5, d.spree_6, d.spree_7, d.spree_best, 
                d.best_spawn_kill_spree, d.flag_assist, d.flag_return, d.flag_taken, d.flag_dropped, d.flag_capture,
                d.flag_pickup, d.flag_seal, d.flag_cover, d.flag_cover_pass, d.flag_cover_fail, d.flag_self_cover,
                d.flag_self_cover_pass, d.flag_self_cover_fail, d.flag_multi_cover, d.flag_spree_cover, d.flag_cover_best,
                d.flag_self_cover_best, d.flag_kill, d.flag_save, d.flag_carry_time, d.assault_objectives, d.dom_caps,
                d.dom_caps_best, d.dom_caps_best_life, d.accuracy, d.k_distance_normal, d.k_distance_long, d.k_distance_uber,
                d.headshots, d.shield_belt, d.amp, d.amp_time, d.invisibility, d.invisibility_time, d.pads, d.armor,
                d.boots, d.super_health, d.mh_kills, d.mh_kills_best_life, d.mh_kills_best,

                gametype, playerId
            ];

            const updateRows = await mysql.updateReturnAffectedRows(query, vars);

            if(updateRows === 0){
                await this.insertNewTotalsFromMerge(playerName, gametype, d);
            }
        }
    }
    
    async getPlayerTotalsByMatches(playerId){

        const query = `SELECT gametype, COUNT(*) as total_matches,
        SUM(winner) as wins, SUM(draw) as draws, SUM(playtime) as playtime, SUM(first_blood) as first_bloods,
        SUM(frags) as frags, SUM(score) as score, SUM(kills) as kills, SUM(deaths) as deaths, SUM(suicides) as suicides,
        SUM(team_kills) as team_kills, SUM(spawn_kills) as spawn_kills, AVG(efficiency) as efficiency,
        MIN(match_date) as first, MAX(match_date) as last,
        SUM(multi_1) as multi_1, SUM(multi_2) as multi_2, SUM(multi_3) as multi_3, SUM(multi_4) as multi_4, SUM(multi_5) as multi_5, 
        SUM(multi_6) as multi_6, SUM(multi_7) as multi_7, MAX(multi_best) as multi_best,
        SUM(spree_1) as spree_1, SUM(spree_2) as spree_2, SUM(spree_3) as spree_3, SUM(spree_4) as spree_4, SUM(spree_5) as spree_5,
        SUM(spree_6) as spree_6, SUM(spree_7) as spree_7, MAX(spree_best) as spree_best,
        MAX(best_spawn_kill_spree) as best_spawn_kill_spree, SUM(flag_assist) as flag_assist,
        SUM(flag_return) as flag_return, SUM(flag_taken) as flag_taken, SUM(flag_dropped) as flag_dropped, SUM(flag_capture) as flag_capture, 
        SUM(flag_pickup) as flag_pickup, SUM(flag_seal) as flag_seal, SUM(flag_cover) as flag_cover, SUM(flag_cover_pass) as flag_cover_pass, 
        SUM(flag_cover_fail) as flag_cover_fail, SUM(flag_self_cover) as flag_self_cover, SUM(flag_self_cover_pass) as flag_self_cover_pass, 
        SUM(flag_self_cover_fail) as flag_self_cover_fail, SUM(flag_multi_cover) as flag_multi_cover, SUM(flag_spree_cover) as flag_spree_cover,
        MAX(flag_cover_best) as flag_cover_best, MAX(flag_self_cover_best) as flag_self_cover_best,
        SUM(flag_kill) as flag_kill, SUM(flag_save) as flag_save, SUM(flag_carry_time) as flag_carry_time,
        SUM(assault_objectives) as assault_objectives, SUM(dom_caps) as dom_caps, MAX(dom_caps) as dom_caps_best, MAX(dom_caps_best_life) as dom_caps_best_life,
        MIN(ping_min) as ping_min, AVG(ping_average) as ping_average, MAX(ping_max) as ping_max, AVG(accuracy) as accuracy,
        MIN(shortest_kill_distance) as shortest_kill_distance, AVG(average_kill_distance) as average_kill_distance,
        MAX(longest_kill_distance) as longest_kill_distance, SUM(k_distance_normal) as k_distance_normal, SUM(k_distance_long) as k_distance_long,
        SUM(k_distance_uber) as k_distance_uber, SUM(headshots) as headshots, SUM(shield_belt) as shield_belt, SUM(amp) as amp,
        SUM(amp_time) as amp_time, SUM(invisibility) as invisibility, SUM(invisibility_time) as invisibility_time,
        SUM(pads) as pads, SUM(armor) as armor, SUM(boots) as boots, SUM(super_health) as super_health, SUM(mh_kills) as mh_kills,
        MAX(mh_kills) as mh_kills_best,
        MAX(mh_kills_best_life) as mh_kills_best_life
        FROM nstats_player_matches WHERE player_id=?`;

        const result = await mysql.simpleQuery(query, playerId);

        if(result.length > 0) return result[0];

        return null;

    }

    async getPlayerTotalsPerGametypeByMatches(playerId){

        const query = `SELECT gametype, COUNT(*) as total_matches,
        SUM(winner) as wins, SUM(draw) as draws, SUM(playtime) as playtime, SUM(first_blood) as first_bloods,
        SUM(frags) as frags, SUM(score) as score, SUM(kills) as kills, SUM(deaths) as deaths, SUM(suicides) as suicides,
        SUM(team_kills) as team_kills, SUM(spawn_kills) as spawn_kills, AVG(efficiency) as efficiency,
        MIN(match_date) as first, MAX(match_date) as last,
        SUM(multi_1) as multi_1, SUM(multi_2) as multi_2, SUM(multi_3) as multi_3, SUM(multi_4) as multi_4, SUM(multi_5) as multi_5, 
        SUM(multi_6) as multi_6, SUM(multi_7) as multi_7, MAX(multi_best) as multi_best,
        SUM(spree_1) as spree_1, SUM(spree_2) as spree_2, SUM(spree_3) as spree_3, SUM(spree_4) as spree_4, SUM(spree_5) as spree_5,
        SUM(spree_6) as spree_6, SUM(spree_7) as spree_7, MAX(spree_best) as spree_best,
        MAX(best_spawn_kill_spree) as best_spawn_kill_spree, SUM(flag_assist) as flag_assist,
        SUM(flag_return) as flag_return, SUM(flag_taken) as flag_taken, SUM(flag_dropped) as flag_dropped, SUM(flag_capture) as flag_capture, 
        SUM(flag_pickup) as flag_pickup, SUM(flag_seal) as flag_seal, SUM(flag_cover) as flag_cover, SUM(flag_cover_pass) as flag_cover_pass, 
        SUM(flag_cover_fail) as flag_cover_fail, SUM(flag_self_cover) as flag_self_cover, SUM(flag_self_cover_pass) as flag_self_cover_pass, 
        SUM(flag_self_cover_fail) as flag_self_cover_fail, SUM(flag_multi_cover) as flag_multi_cover, SUM(flag_spree_cover) as flag_spree_cover,
        MAX(flag_cover_best) as flag_cover_best, MAX(flag_self_cover_best) as flag_self_cover_best,
        SUM(flag_kill) as flag_kill, SUM(flag_save) as flag_save, SUM(flag_carry_time) as flag_carry_time,
        SUM(assault_objectives) as assault_objectives, SUM(dom_caps) as dom_caps, MAX(dom_caps) as dom_caps_best, MAX(dom_caps_best_life) as dom_caps_best_life,
        MIN(ping_min) as ping_min, AVG(ping_average) as ping_average, MAX(ping_max) as ping_max, AVG(accuracy) as accuracy,
        MIN(shortest_kill_distance) as shortest_kill_distance, AVG(average_kill_distance) as average_kill_distance,
        MAX(longest_kill_distance) as longest_kill_distance, SUM(k_distance_normal) as k_distance_normal, SUM(k_distance_long) as k_distance_long,
        SUM(k_distance_uber) as k_distance_uber, SUM(headshots) as headshots, SUM(shield_belt) as shield_belt, SUM(amp) as amp,
        SUM(amp_time) as amp_time, SUM(invisibility) as invisibility, SUM(invisibility_time) as invisibility_time,
        SUM(pads) as pads, SUM(armor) as armor, SUM(boots) as boots, SUM(super_health) as super_health, SUM(mh_kills) as mh_kills,
        MAX(mh_kills) as mh_kills_best,
        MAX(mh_kills_best_life) as mh_kills_best_life
        FROM nstats_player_matches WHERE player_id=? GROUP BY (gametype)`;

        const result = await mysql.simpleQuery(query, playerId);
        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            data[r.gametype] = r;

        }

        return data;
    }

    //first player gets merged into second
    async mergePlayers(first, second, matchManager){

        try{    


            const names = await this.getNamesByIds([first, second]);


            if(names.length > 1){

                for(let i = 0; i < names.length; i++){

                    if(names[i].id === first) first = names[i];
                    if(names[i].id === second)  second = names[i];
                    
                }


                const matchIds = await matchManager.getAllPlayerMatchIds(first.id);

                const assaultManager = new Assault();

                await assaultManager.changeCapDataPlayerId(first.id, second.id);

                const ctfManager = new CTF();

                await ctfManager.changeCapEventPlayerIds(first.id, second.id, matchIds);

                await ctfManager.changeEventPlayerId(first.id, second.id);

                const domManager = new Domination();

                await domManager.changeCapPlayerId(first.id, second.id);
                await domManager.changeScoreHistoryPlayerId(first.id, second.id);


                const monsterHuntManager = new MonsterHunt();

                await monsterHuntManager.mergePlayers(first.id, second.id);

                const headshotManager = new Headshots();

                await headshotManager.changePlayerIds(first.id, second.id);

                const itemsManager = new Items();

                await itemsManager.changePlayerIdsMatch(first.id, second.id);

                await itemsManager.mergePlayerTotals(first.id, second.id);

                const killsManager = new Kills();

                await killsManager.changePlayerIds(first.id, second.id);

                await matchManager.renameDmWinner(first.name, second.name);


                const connectionsManager = new Connections();

                await connectionsManager.changePlayerIds(first.id, second.id);

                const pingManager = new Pings();

                await pingManager.changePlayerIds(first.id, second.id);

                await matchManager.changePlayerScoreHistoryIds(first.id, second.id);
                await matchManager.changeTeamChangesPlayerIds(first.id, second.id);

                const mapManager = new Maps();

                //await mapManager.mergePlayerHistory(first.id, second.id);
                await mapManager.deletePlayer(first.id);
                await mapManager.deletePlayer(second.id);
                await mapManager.recalculatePlayerTotalsAfterMerge(second.id, matchManager);

                await matchManager.mergePlayerMatches(first.id, second.id,second.name);
                await this.deletePlayerTotals(first.id);

                const updatedPlayerMatches = await matchManager.getAllPlayerMatches(second.id);

                const playerGametypeTotals = await this.getPlayerTotalsPerGametypeByMatches(second.id);
                const playerTotals = await this.getPlayerTotalsByMatches(second.id);

                await this.recalculatePlayerTotalsAfterMerge(second.id, second.name, playerGametypeTotals, playerTotals );

                //await this.recalculatePlayerTotalsAfterMerge(updatedPlayerMatches, second.id, second.name);

                const weaponsManager = new Weapons();

                await weaponsManager.mergePlayers(first.id, second.id, matchManager);

                const rankingsManager = new Rankings();

                await rankingsManager.deleteAllPlayerHistory(first.id);
                await rankingsManager.deleteAllPlayerCurrent(first.id);

                await rankingsManager.deleteAllPlayerHistory(second.id);
                await rankingsManager.deleteAllPlayerCurrent(second.id);

                await rankingsManager.fullPlayerRecalculate(second.id, updatedPlayerMatches);

                const winrateManager = new Winrate();

                await winrateManager.deletePlayer(first.id);
                
                await winrateManager.deletePlayer(first.id);
                await winrateManager.deletePlayer(second.id);
                await winrateManager.recalculatePlayerHistoryAfterMerge(second.id, updatedPlayerMatches);
                //await winrateManager.recalculatePlayerHistory(updatedPlayerMatches, second.id, );

                const spreeManager = new Sprees();

                await spreeManager.changePlayerIds(first.id, second.id);

                return true;
            }else{
                throw new Error("Only found 1 player out of 2, can't merge players.");
            }

        }catch(err){
            console.trace(err);
            return false;
        }
    }

    async deletePlayerTotals(id){
        await mysql.simpleDelete("DELETE FROM nstats_player_totals WHERE player_id=?", [id]);
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

            const countriesManager = new CountriesManager();

            await countriesManager.deletePlayerViaMatchData(matches);

            const ctfManager = new CTF();

            await ctfManager.deletePlayerViaMatchData(playerId, matches);

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


            const name = await this.getPlayerName(playerId);

            await matchManager.renameDmWinner(name, "Deleted Player");
            

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

            return true;

        }catch(err){    
            console.trace(err);
            return false;
        }
    }

    async getAllGametypeMatchData(gametypeId){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_matches WHERE gametype=?", [gametypeId]);
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
            data.playtime, data.first_blood, data.frags, data.score,
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

            let p = 0;

            for(let i = 0; i < playersData.length; i++){

                p = playersData[i];

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


    async getAllInMatch(id){

        const players = await this.player.getAllInMatch(id);

        const ids = [];

        for(let i = 0; i < players.length; i++){

            ids.push(players[i].player_id);
        }

        const names = await this.getJustNamesByIds(ids);

        let p = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            if(names[`${p.player_id}`] !== undefined){
                p.name = names[`${p.player_id}`];
            }else{
                p.name = "Not Found";
            }
        }

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

    createPlayerScoreHistory(inputData, playerNames){

        const playerIndexes = [];
        const data = [];

        for(const [key, value] of Object.entries(playerNames)){

            data.push({"name": value, "data": [0], "lastValue": 0});
            playerIndexes.push(parseInt(key));

        }

        const timestamps = [];

        for(let i = 0; i < inputData.length; i++){

            const t = inputData[i].timestamp;

            if(timestamps.indexOf(t) === -1){

                timestamps.push(t);
            }
        }

        const updateOthers = (ignore) =>{

            for(let i = 0; i < playerIndexes.length; i++){

                const p = playerIndexes[i];

                if(ignore.indexOf(p) === -1){

                    data[i].data.push(data[i].lastValue);
                }
            }
        }

        let currentTimestamp = -1;

        let updated = [];

        for(let i = 0; i < inputData.length; i++){

            const d = inputData[i];
            
            if(d.timestamp !== currentTimestamp){

                currentTimestamp = d.timestamp;
                updateOthers(updated);
                updated = [];
            }

            updated.push(d.player);

            const currentIndex = playerIndexes.indexOf(d.player);

            data[currentIndex].data.push(d.score);
            data[currentIndex].lastValue = d.score;

        }

        updateOthers(updated);

        return data;

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
            WHERE ip LIKE ? GROUP BY ip`;

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

        console.log(playerNames);

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

        //console.log(ipStats);

        //console.log(ipTotalsResult);

        //return
        return {
            "nameResult": nameTotalsResult,
           // "ipResult": ipTotalsResult,
            "ipDetails": ipStats 
        };

    }

}


module.exports = Players;