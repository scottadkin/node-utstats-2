const Promise = require('promise');
const Player = require('./player');
const mysql = require('./database');
const Functions = require('./functions');
const Matches = require('./matches');
const Assault = require('./assault');
const CTF = require('./ctf');

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

                    if(result !== undefined){

                        if(result.length > 0){
                            resolve(result[0].total_players);
                        }
                    }

                    resolve(0);
                });

            }else{

                mysql.query(query, vars, (err, result) =>{

                    if(err) console.log(err);//reject(err);

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

    //first player gets merged into second
    async mergePlayers(first, second, matchManager){

        try{    

            const names = await this.getNamesByIds([first, second]);

            if(names.length > 1){

                for(let i = 0; i < names.length; i++){

                    if(names[i].id === first) first = names[i];
                    if(names[i].id === second)  second = names[i];
                    
                }

                console.log(first);
                console.log(second);

                const firstPlayerGametypes = await this.getPlayerTotals(first.name);
                const secondPlayerGametypes = await this.getPlayerTotals(second.name);
                

               // console.log(firstPlayerGametypes);
               // console.log(secondPlayerGametypes);

                const matchIds = await matchManager.getAllPlayerMatchIds(first.id);

                console.log(matchIds);

                const assaultManager = new Assault();

                await assaultManager.changeCapDataPlayerId(first.id, second.id);

                const ctfManager = new CTF();

                await ctfManager.changeCapEventPlayerIds(first.id, second.id, matchIds);

                await ctfManager.changeEventPlayerId(first.id, second.id);

            }else{
                throw new Error("Only found 1 player out of 2, can't merge players.");
            }

        }catch(err){
            console.trace(err);
        }
    }
}


module.exports = Players;