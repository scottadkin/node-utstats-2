const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

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

            const query = "INSERT INTO nstats_weapons VALUES(NULL,?)";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                resolve(result.insertId);

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

            names.push('None');
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

            const vars = [matchId, playerId, weaponId, stats.kills, stats.deaths, stats.accuracy, stats.shots, stats.hits, stats.damage];

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

            const query = "INSERT INTO nstats_player_weapon_totals VALUES(NULL,?,?,?,?,?,?,?,?,?)";

            mysql.query(query, [playerId, gametypeId, weaponId, kills, deaths, accuracy, shots, hits, damage], (err) =>{

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
               
            }

            //all totals
            if(!await this.bPlayerTotalExists(gametypeId, playerId, weaponId)){

                await this.createPlayerTotal(0, playerId, weaponId, 
                    stats.kills, stats.deaths, stats.accuracy, stats.shots, stats.hits, stats.damage);
            }else{
               
            }

        }catch(err){
            console.trace(err);
        }
        
    }

}


module.exports = Weapons;