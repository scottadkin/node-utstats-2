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
            accuracy=hits/(shots + hits)*100
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
             accuracy=(hits/shots)*100, 
             efficiency=(kills/(kills + deaths)) * 100,
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

    getAllNames(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nstats_weapons";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });
        });
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
            accuracy = (hits / shots) * 100,
            efficiency = (kills / (kills + deaths)) * 100
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


    reduceTotals(weapon, data){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_weapons SET
            kills=kills-?,
            deaths=deaths-?,
            shots=shots-?,
            hits=hits-?,
            damage=damage-?,
            matches=matches-1,
            accuracy = (hits / shots) * 100
            WHERE id=?
            `;

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


    async deleteSinglePlayerMatchData(playerId, matchId){

        await mysql.simpleDelete("DELETE FROM nstats_player_weapon_match WHERE player_id=? AND match_id=?",[
            playerId, matchId
        ]);
    }


    async deletePlayerFromMatch(playerId, matchId){

        try{

            const matchData = await this.getPlayerMatchData(playerId, matchId);

            for(let i = 0; i < matchData.length; i++){

                await this.reduceTotals(matchData[i].weapon_data, matchData[i]);
                await this.reducePlayerWeaponTotal(matchData[i]);
            }

            await this.deleteSinglePlayerMatchData(playerId, matchId);

        }catch(err){
            console.trace(err);
        }
    }
}


module.exports = Weapons;