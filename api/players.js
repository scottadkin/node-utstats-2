const Promise = require('promise');
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

    getTotalPlayers(name){

        return new Promise((resolve, reject) =>{

            let query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE gametype=0 AND playtime>0";
            let vars = [];

            if(name !== undefined){
                query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE gametype=0 AND playtime>0 AND name LIKE(?) ";
                vars = [`%${name}%`]
            }

            if(name === undefined){

                mysql.query(query, (err, result) =>{

                    if(err) reject(err);

                    if(result !== undefined){

                        if(result.length > 0){
                            resolve(result[0].total_players);
                        }
                    }

                    resolve(0);
                });

            }else{

                mysql.query(query, vars, (err, result) =>{

                    if(err) reject(err);

                    if(result !== undefined){
                        
                        if(result.length > 0){
                            resolve(result[0].total_players);
                        }
                    }

                    resolve(0);
                });

            }
        });
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


    async getNamesByIds(ids){

        return new Promise((resolve, reject) =>{

            if(ids === undefined) resolve([]);
            if(ids.length === 0) resolve([]);

            const query = "SELECT id,name,country,face FROM nstats_player_totals WHERE id IN (?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
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

    async getAllNames(){

        return await mysql.simpleFetch("SELECT id,name,country FROM nstats_player_totals WHERE gametype=0 ORDER BY name ASC");
    }
    
    async renamePlayer(oldName, newName){

        try{

            await mysql.simpleUpdate("UPDATE nstats_player_totals SET name=? WHERE name=?", [newName, oldName]);

            const matchManager = new Matches();

            await matchManager.renameDmWinner(oldName, newName);


        }catch(err){
            console.trace(err);
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
                ?,?,?
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
                d.mh_kills, d.mh_kills_best_life, d.mh_kills_best
            ];

            await mysql.simpleInsert(query, vars);

        }catch(err){
            console.trace(err);
        }
    }

    
    async recalculatePlayerTotalsAfterMerge(matches, playerName){

        try{

            const mergeTypes = [
                                 /*'first',
                'last',                  'ip',                   'country',
                'face',                  'voice',                'gametype',*/
                            /*'wins',                 'losses',
                'draws',                 'winrate',*/              'playtime',
                /*'first_bloods',*/          'frags',                'score',
                'kills',                 'deaths',               'suicides',
                'team_kills',            'spawn_kills',          /*'efficiency',*/
                'multi_1',               'multi_2',              'multi_3',
                'multi_4',               'multi_5',              'multi_6',
                'multi_7',               /*'multi_best',*/           'spree_1',
                'spree_2',               'spree_3',              'spree_4',
                'spree_5',               'spree_6',              'spree_7',
                /*'spree_best',*/            /*'fastest_kill',         'slowest_kill',
                'best_spawn_kill_spree',*/ 'flag_assist',          'flag_return',
                'flag_taken',            'flag_dropped',         'flag_capture',
                'flag_pickup',           'flag_seal',            'flag_cover',
                'flag_cover_pass',       'flag_cover_fail',      'flag_self_cover',
                'flag_self_cover_pass',  'flag_self_cover_fail', 'flag_multi_cover',
                'flag_spree_cover',      /*'flag_cover_best',      'flag_self_cover_best'*/,
                'flag_kill',             'flag_save',            'flag_carry_time',
                'assault_objectives',    'dom_caps',             /*'dom_caps_best',
                'dom_caps_best_life',    'accuracy',*/             'k_distance_normal',
                'k_distance_long',       'k_distance_uber',      'headshots',
                'shield_belt',           'amp',                  'amp_time',
                'invisibility',          'invisibility_time',    'pads',
                'armor',                 'boots',                'super_health',
                'mh_kills'
            ];


            const gametypeTotals = {};

            function update(m, gametype){

               // console.log(m);

                //console.log(`update gametype ${gametype}`);

                if(gametypeTotals[gametype] === undefined){

                    //gametypeTotals[gametype] = m;

                    gametypeTotals[gametype] = {};

                    for(let i = 0; i < mergeTypes.length; i++){

                        gametypeTotals[gametype][mergeTypes[i]] = 0;
                    }

                    gametypeTotals[gametype].player_id = m.player_id;
                    gametypeTotals[gametype].matches = 0;
                    gametypeTotals[gametype].first = m.match_date;
                    gametypeTotals[gametype].last = m.match_date;
                    gametypeTotals[gametype].dom_caps = 0;
                    gametypeTotals[gametype].dom_caps_best = 0;
                    //gametypeTotals[gametype].spree_best = 0;
                    gametypeTotals[gametype].first_bloods = 0;
                    gametypeTotals[gametype].slowest_kill = 0;
                    gametypeTotals[gametype].fastest_kill = 0;
      
                    gametypeTotals[gametype].wins = 0;
                    gametypeTotals[gametype].losses = 0;
                    gametypeTotals[gametype].winrate = 0;
                    gametypeTotals[gametype].draws = 0;

                    gametypeTotals[gametype].mh_kills_best = 0;
                    gametypeTotals[gametype].mh_kills_best_life = 0;

                    gametypeTotals[gametype].multi_best = 0;
                    gametypeTotals[gametype].spree_best = 0;
                    gametypeTotals[gametype].best_spawn_kill_spree = 0;
                    gametypeTotals[gametype].flag_cover_best = 0;
                    gametypeTotals[gametype].flag_self_cover_best = 0;
                    gametypeTotals[gametype].dom_caps_best = 0;
                    gametypeTotals[gametype].dom_caps_best_life = 0;
                    gametypeTotals[gametype].accuracy = 0;
                  
                }


                if(m.winner){

                    gametypeTotals[gametype].wins++;
                }else{
                    gametypeTotals[gametype].losses++;
                }

                if(m.draw){
                    gametypeTotals[gametype].draws++;
                }

                gametypeTotals[gametype].matches++;

                if(gametypeTotals[gametype].first > m.match_date){
                    gametypeTotals[gametype].first = m.match_date;
                }

                if(gametypeTotals[gametype].last < m.match_date){
                    gametypeTotals[gametype].last = m.match_date;
                }


                if(m.first_blood) gametypeTotals[gametype].first_bloods++;

                gametypeTotals[gametype].ip = m.ip;
                gametypeTotals[gametype].country = m.country;
                gametypeTotals[gametype].face = m.face;
                gametypeTotals[gametype].voice = m.voice;


                gametypeTotals[gametype].winrate = 0;

                if(gametypeTotals[gametype].wins > 0){

                    if(gametypeTotals[gametype].losses === 0){
                        gametypeTotals[gametype].winrate = 100;
                    }else{
                        gametypeTotals[gametype].winrate = (gametypeTotals[gametype].wins / gametypeTotals[gametype].matches) * 100;
                    }
                }


                gametypeTotals[gametype].efficiency = 0;

                if(gametypeTotals[gametype].kills > 0){
                    
                    if(gametypeTotals[gametype].deaths === 0){
                        gametypeTotals[gametype].efficiency = 100;
                    }else{
                        gametypeTotals[gametype].efficiency = (gametypeTotals[gametype].kills / 
                        (gametypeTotals[gametype].kills + gametypeTotals[gametype].deaths)) * 100;
                    }
                }

                if(gametypeTotals[gametype].spree_best < m.spree_best){
                    gametypeTotals[gametype].spree_best = m.spree_best;
                }

                if(gametypeTotals[gametype].multi_best < m.multi_best){
                    gametypeTotals[gametype].multi_best = m.multi_best;
                }

                if(gametypeTotals[gametype].best_spawn_kill_spree < m.best_spawn_kill_spree){
                    gametypeTotals[gametype].best_spawn_kill_spree = m.best_spawn_kill_spree;
                }

                if(gametypeTotals[gametype].flag_cover_best < m.flag_cover_best){
                    gametypeTotals[gametype].flag_cover_best = m.flag_cover_best;
                }

                if(gametypeTotals[gametype].flag_self_cover_best < m.flag_self_cover_best){
                    gametypeTotals[gametype].flag_self_cover_best = m.flag_self_cover_best;
                }

                if(gametypeTotals[gametype].dom_caps_best_life < m.dom_caps_best_life){
                    gametypeTotals[gametype].dom_caps_best_life = m.dom_caps_best_life;
                }

                if(gametypeTotals[gametype].dom_caps_best < m.dom_caps_best){
                    gametypeTotals[gametype].dom_caps_best = m.dom_caps_best;
                }

                if(gametypeTotals[gametype].mh_kills_best < m.mh_kills){
                    gametypeTotals[gametype].mh_kills_best = m.mh_kills;
                }

                if(gametypeTotals[gametype].mh_kills_best_life < m.mh_kills_best_life){
                    gametypeTotals[gametype].mh_kills_best_life = m.mh_kills_best_life;
                }

                //gametypeTotals[gametype].playtime += m.playtime;

                for(let x = 0; x < mergeTypes.length; x++){
                    gametypeTotals[gametype][mergeTypes[x]] += m[mergeTypes[x]];
                }
            
            }


            let m = 0;

            for(let i = 0; i < matches.length; i++){

                //console.log(i);
                m = matches[i];

                update(m, 0);
                update(m, m.gametype);
                
            }


            const query = `UPDATE nstats_player_totals SET
                first=?, last=?, ip=?, country=?, face=?, voice=?,                
                matches=?, wins=?, losses=?, draws=?, winrate=?,  playtime=?,
                first_bloods=?, frags=?, score=?, kills=?, deaths=?, suicides=?,
                team_kills=?, spawn_kills=?, efficiency=?,
                multi_1=?, multi_2=?, multi_3=?, multi_4=?, multi_5=?, multi_6=?, multi_7=?, 
                multi_best = IF(multi_best < ?, ?, multi_best),
                spree_1=?, spree_2=?, spree_3=?, spree_4=?, spree_5=?, spree_6=?, spree_7=?, 
                spree_best = IF(spree_best < ?, ?, spree_best),
                fastest_kill = IF(fastest_kill > ?, ?, fastest_kill), 
                slowest_kill = IF(slowest_kill < ?, ?, slowest_kill), 
                best_spawn_kill_spree = IF(best_spawn_kill_spree < ?, ?, best_spawn_kill_spree),
                 flag_assist=?, flag_return=?,
                flag_taken=?, flag_dropped=?, flag_capture=?, flag_pickup=?, flag_seal=?, 
                flag_cover=?,
                flag_cover_pass=?, flag_cover_fail=?, flag_self_cover=?, 
                flag_self_cover_pass=?, flag_self_cover_fail=?, flag_multi_cover=?,
                flag_spree_cover=?, 
                flag_cover_best = IF(flag_cover_best < ?, ?, flag_cover_best), 
                flag_self_cover_best = IF(flag_self_cover_best < ?, ?, flag_self_cover_best), 
                flag_kill=?, flag_save=?, flag_carry_time=?,
                assault_objectives=?, dom_caps=?, 
                dom_caps_best = IF(dom_caps_best < ?, ?, dom_caps_best), 
                dom_caps_best_life = IF(dom_caps_best_life < ?, ?, dom_caps_best_life),
                k_distance_normal=?,
                k_distance_long=?, 
                k_distance_uber=?, headshots=?, shield_belt=?, amp=?, amp_time=?,
                invisibility=?,
                invisibility_time=?, pads=?, armor=?, boots=?, super_health=?,
                mh_kills=?,
                mh_kills_best = IF(mh_kills_best < ?, ?, mh_kills_best),
                mh_kills_best_life = IF(mh_kills_best_life < ?, ?, mh_kills_best_life)
                
                WHERE gametype=? AND player_id=?
            `;

            let vars = [];

            for(const [k, v] of Object.entries(gametypeTotals)){


                vars = [
                    v.first, v.last, v.ip, v.country, v.face, v.voice,                
                    v.matches, v.wins, v.losses, v.draws, v.winrate,  v.playtime,
                    v.first_blood, v.frags, v.score, v.kills, v.deaths, v.suicides,
                    v.team_kills, v.spawn_kills, v.efficiency,
                    v.multi_1, v.multi_2, v.multi_3, v.multi_4, v.multi_5, v.multi_6, v.multi_7, v.multi_best, v.multi_best,
                    v.spree_1, v.spree_2, v.spree_3, v.spree_4, v.spree_5, v.spree_6, v.spree_7, v.spree_best, v.spree_best,
                    v.fastest_kill, v.fastest_kill, v.slowest_kill, v.slowest_kill, v.best_spawn_kill_spree, v.best_spawn_kill_spree,
                     v.flag_assist, v.flag_return,
                    v.flag_taken, v.flag_dropped, v.flag_capture, v.flag_pickup, v.flag_seal, v.flag_cover,
                    v.flag_cover_pass, v.flag_cover_fail, v.flag_self_cover, v.flag_self_cover_pass, v.flag_self_cover_fail, v.flag_multi_cover,
                    v.flag_spree_cover, v.flag_cover_best, v.flag_cover_best, v.flag_self_cover_best, v.flag_self_cover_best,
                     v.flag_kill, v.flag_save, v.flag_carry_time,
                    v.assault_objectives, v.dom_caps, v.dom_caps_best, v.dom_caps_best, v.dom_caps_best_life, v.dom_caps_best_life, v.k_distance_normal,
                    v.k_distance_long, v.k_distance_uber, v.headshots, v.shield_belt, v.amp, v.amp_time,v.invisibility,
                    v.invisibility_time, v.pads, v.armor, v.boots, v.super_health,
                    v.mh_kills,
                    v.mh_kills_best, v.mh_kills_best, v.mh_kills_best,
                    v.mh_kills_best_life, v.mh_kills_best_life, v.mh_kills_best_life,

                    k, playerId
                ];
    

                //console.log(`update gametype totals WHERE playerName = ${playerName} and gametype=${k}, totalPlaytime = ${v.playtime}, matches=${v.matches}, wins=${v.wins} losses=${v.losses}`);

                const updatedRows = await mysql.updateReturnAffectedRows(query, vars);


                if(updatedRows === 0){
                    await this.insertNewTotalsFromMerge(playerName, k, v);
                }
            }

        }catch(err){
            console.trace(err);
        }
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

                await this.recalculatePlayerTotalsAfterMerge(updatedPlayerMatches, second.id);

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


            }else{
                throw new Error("Only found 1 player out of 2, can't merge players.");
            }

        }catch(err){
            console.trace(err);
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

            //console.log(matches);


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

        }catch(err){    
            console.trace(err);
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
            winrate = IF(wins > 0, IF(losses > 0, (wins / matches) * 100 , 100), 0),
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

}


module.exports = Players;