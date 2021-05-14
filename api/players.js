const Promise = require('promise');
const Player = require('./player');
const mysql = require('./database');
const Functions = require('./functions');

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

            let query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE gametype=0";
            let vars = [];

            if(name !== undefined){
                query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE gametype=0 AND name LIKE(?) ";
                vars = [`%${name}%`]
            }

            if(name === undefined){

                mysql.query(query, (err, result) =>{

                    if(err) reject(err);

                    resolve(result[0].total_players);
                });

            }else{

                mysql.query(query, vars, (err, result) =>{

                    if(err) console.log(err);//reject(err);

                    resolve(result[0].total_players);
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

            let query = `SELECT * FROM nstats_player_totals WHERE gametype=0 ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;
            let vars = [start, perPage];

            if(name !== ''){
                query = `SELECT * FROM nstats_player_totals WHERE gametype=0 AND name LIKE(?) ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;
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

            const query = "SELECT id,name,country,matches,playtime,face,first,last FROM nstats_player_totals WHERE gametype=0 ORDER BY last DESC LIMIT ?";

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

    reduceTotal(player, gametypeId){

        console.log(`update ${player.name} totals`);

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET 
            matches=matches-1,
            wins = IF(? = 1, wins-1, wins),
            losses = IF(? = 0, losses-1, losses),
            draws = IF(? = 1, draws-1, draws),
            winrate = (wins / matches) * 100,
            playtime = playtime-?,
            first_bloods = IF(? = 1, first_bloods-1, first_bloods),
            frags = frags-?,
            score = score-?,
            kills = kills-?,
            deaths = deaths-?,
            suicides = suicides-?,
            team_kills = team_kills-?,
            spawn_kills = spawn_kills-?,
            efficiency = (kills / (kills + deaths)) * 100,
            multi_1 = multi_1 - ?,
            multi_2 = multi_2 - ?,
            multi_3 = multi_3 - ?,
            multi_4 = multi_4 - ?,
            multi_5 = multi_5 - ?,
            multi_6 = multi_6 - ?,
            multi_7 = multi_7 - ?,
            spree_1 = spree_1 - ?,
            spree_2 = spree_2 - ?,
            spree_3 = spree_3 - ?,
            spree_4 = spree_4 - ?,
            spree_5 = spree_5 - ?,
            spree_6 = spree_6 - ?,
            spree_7 = spree_7 - ?,

            flag_assist = flag_assist - ?,
            flag_return = flag_return - ?,
            flag_taken = flag_taken - ?,
            flag_dropped = flag_dropped - ?,
            flag_capture = flag_capture - ?,
            flag_pickup = flag_pickup - ?,
            flag_seal = flag_seal - ?,
            flag_cover = flag_cover - ?,
            flag_cover_pass = flag_cover_pass - ?,
            flag_cover_fail = flag_cover_fail - ?,
            flag_self_cover = flag_self_cover - ?,
            flag_self_cover_pass = flag_self_cover_pass - ?,
            flag_self_cover_fail = flag_self_cover_fail - ?,
            flag_multi_cover = flag_multi_cover - ?,
            flag_spree_cover = flag_spree_cover - ?,
            flag_kill = flag_kill - ?,
            flag_save = flag_save - ?,
            flag_carry_time = flag_carry_time - ?,
            assault_objectives = assault_objectives - ?,
            dom_caps = dom_caps - ?,
            k_distance_normal = k_distance_normal - ?,
            k_distance_long = k_distance_long - ?,
            k_distance_uber = k_distance_uber - ?,

            headshots = headshots - ?,
            shield_belt = shield_belt - ?,
            amp = amp - ?,
            amp_time = amp_time - ?,
            invisibility = invisibility - ?,
            invisibility_time = invisibility_time - ?,
            pads = pads - ?,
            armor = armor - ?,
            boots = boots - ?,
            super_health = super_health - ?


            WHERE name=? AND gametype IN(?)
            `;

            const gametypes = [0, gametypeId];

            const vars = [
                player.winner,
                player.winner,
                player.draw,
                player.playtime,
                player.first_blood,
                player.frags,
                player.score,
                player.kills,
                player.deaths,
                player.suicides,
                player.team_kills,
                player.spawn_kills,
                player.multi_1,
                player.multi_2,
                player.multi_3,
                player.multi_4,
                player.multi_5,
                player.multi_6,
                player.multi_7,
                player.spree_1,
                player.spree_2,
                player.spree_3,
                player.spree_4,
                player.spree_5,
                player.spree_6,
                player.spree_7,

                player.flag_assist,
                player.flag_return,
                player.flag_taken,
                player.flag_dropped,
                player.flag_capture,
                player.flag_pickup,
                player.flag_seal,
                player.flag_cover,
                player.flag_cover_pass,
                player.flag_cover_fail,
                player.flag_self_cover,
                player.flag_self_cover_pass,
                player.flag_self_cover_fail,
                player.flag_multi_cover,
                player.flag_spree_cover,
                player.flag_kill,
                player.flag_save,
                player.flag_carry_time,
                player.assault_objectives,
                player.dom_caps,
                player.headshots,
                player.k_distance_normal,
                player.k_distance_long,
                player.k_distance_uber,

                player.shield_belt,
                player.amp,
                player.amp_time,
                player.invisibility,
                player.invisibility_time,
                player.pads,
                player.armor,
                player.boots,
                player.super_health,

                player.name,
                gametypes
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async reduceTotals(players, gametypeId){

        try{


            for(let i = 0; i < players.length; i++){

                await this.reduceTotal(players[i], gametypeId);
            }

        }catch(err){
            console.trace(err);
        }
    }
}


module.exports = Players;