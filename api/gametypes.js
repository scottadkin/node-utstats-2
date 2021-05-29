const Promise = require('promise');
const mysql = require('./database');
const Message = require('./message');

class Gametypes{

    constructor(){


    }

    create(name){

        
        return new Promise((resolve, reject) =>{

            if(name !== undefined){
            
                const query = "INSERT INTO nstats_gametypes VALUES(NULL,?,0,0,0,0)";

                mysql.query(query, [name], (err, result) =>{

                    if(err){
                        reject(err);
                    }

                    resolve(result.insertId);
                });
            }else{
                reject("gametype name is undefined");
            }
        });
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

                if(result.changedRows > 0){
                    resolve(true);
                }

                resolve(false);

            });
        });
    }


    async updateStats(name, date, playtime){

        try{

            const id = await this.getGametypeId(name, true);

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

    getName(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name FROM nstats_gametypes WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result[0].name);
                }

                resolve('Not Found');
            });
        });
    }

    getNames(ids){

        return new Promise((resolve, reject) =>{

            if(ids.length === 0) resolve();

            const query = "SELECT id,name FROM nstats_gametypes WHERE id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                const data = {};

                data['0'] = "All";
                if(result !== undefined){
                    
                    for(let i = 0; i < result.length; i++){
                       data[result[i].id] = result[i].name;
                    }
                    
                }

                resolve(data);
            });
        });
    }


    getAllNames(){

        return new Promise((resolve, reject) =>{

            const data = {};

            const query = "SELECT id,name FROM nstats_gametypes ORDER BY name ASC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    for(let i = 0; i < result.length; i++){
                        data[result[i].id] = result[i].name;
                    }
                }
                resolve(data);
            });
        });
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


            let d = 0;

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
            flag_cover_best = IF(flag_cover_best < ?, ?, flag_cover_best),
            flag_self_cover_best = IF(flag_self_cover_best < ?, ?, flag_self_cover_best),
            flag_kill=flag_kill+?,
            flag_save=flag_save=?,
            flag_carry_time=flag_carry_time+?,
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
            super_health=super_health+?
            
        




            WHERE player_id=? AND gametype=?`;

            //if statments for division by zero
            let vars = [];

            for(let i = 0; i < data.length; i++){

                d = data[i];

                vars = [
                    d.matches,
                    d.wins,
                    d.losses,
                    d.draws,
                    d.playtime,
                    data.first_bloods,
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
                    d.flag_assist,
                    d.flag_return,
                    d.flag_taken,
                    d.flag_dropped,
                    d.flag_capture,
                    d.flag_pickup,
                    d.flag_seal,
                    d.flag_cover,
                    d.flag_cover_pass,
                    d.flag_cover_fail,
                    d.flag_self_cover,
                    d.flag_self_cover_pass,
                    d.flag_self_cover_fail,
                    d.flag_multi_cover,
                    d.flag_spree_cover,
                    d.flag_cover_best,
                    d.flag_cover_best,
                    d.flag_self_cover_best,
                    d.flag_self_cover_best,
                    d.flag_kill,
                    d.flag_save,
                    d.flag_carry_time,
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

            const query = `INSERT INTO nstats_player_weapon_totals VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?)`;
            
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


    async deleteGametypePlayerWeaponTotals(id){

        await mysql.simpleDelete("DELETE FROM nstats_player_weapon_totals WHERE gametype=?", [id]);
    }

    async mergeGametypeWeaponTotals(oldId, newId){

        try{

            const oldGametypeTotals = await this.getWeaponTotals(oldId);

            let d = 0;

            for(let i = 0; i < oldGametypeTotals.length; i++){

                d = oldGametypeTotals[i];

                await this.updateWeaponPlayerTotal(newId, d);
            }


            await this.deleteGametypePlayerWeaponTotals(oldId);

        }catch(err){
            console.trace(err);
        }
    }

    async deleteGametype(id){

        await mysql.simpleDelete("DELETE FROM nstats_gametypes WHERE id=?", [id]);

    }

    async merge(oldId, newId, rankingManager, winrateManager){

        try{

            await this.changeMatchGametypes(oldId, newId);
            await this.changePlayerMatchGametypes(oldId, newId);
           // await this.changePlayerTotalsGametype(oldId, newId);

            const oldGametypePlayerTotals = await this.getOldIdPlayerGametypeTotals(oldId);

           // console.log(oldGametypePlayerTotals);

            //merge player gametype totals here

            await this.mergePlayerGametypeTotals(oldGametypePlayerTotals, newId);
            await this.deleteGametypePlayerTotals(oldId);

            await this.mergeGametypeWeaponTotals(oldId, newId);


            //update rankings

            await rankingManager.changeGametypeId(oldId, newId);

            await this.deleteGametype(oldId);

            await winrateManager.changeGametypeId(oldId, newId);

            await winrateManager.recalculateGametype(newId);

        }catch(err){
            console.trace(err);
        }
    }
}

module.exports = Gametypes;