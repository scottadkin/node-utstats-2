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
}


module.exports = Players;