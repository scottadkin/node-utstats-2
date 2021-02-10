const Promise = require('promise');
const Player = require('./player');
const mysql = require('./database');

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

                resolve(result);
            });
        });
    }

    getTotalPlayers(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE gametype=0";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                resolve(result[0].total_players);
            });
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


    getPlayers(page, perPage, sort, order){

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
                'matches'
            ];

            sort = sort.toLowerCase();

            const index = validTypes.indexOf(sort);

            if(index === -1){
                index = 0;
            }

            if(order !== 'ASC' && order !== 'DESC'){
                order = 'ASC';
            }

            console.log(`search type = ${validTypes[index]}`);

            const query = `SELECT * FROM nstats_player_totals WHERE gametype=0 ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;


            mysql.query(query, [start, perPage], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    resolve(result);
                }

                resolve([]);
            });

        });
        
    }
}


module.exports = Players;