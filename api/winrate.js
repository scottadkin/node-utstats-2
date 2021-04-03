const mysql = require('./database');
const Message = require('./message');
const Promise = require('promise');
const { resolve } = require('promise');

class WinRate{

    constructor(){

    }

    getCurrentPlayersData(players, gametypes){

        return new Promise((resolve, reject) =>{

            if(players.length === 0){
                new Message(`WinRate.getCUrrentPlayersData() players.length is 0 skipping.`,'warning');
                resolve([]);
            }

            const query = "SELECT * FROM nstats_winrates WHERE player IN(?) AND gametype IN(?)";

            mysql.query(query, [players, gametypes], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    resolve(this.createMissingData(players, result, gametypes));
                }

                resolve([]);
            });
        });
    }

    bDataExist(data, player, gametype){

        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];
            if(d.player === player && d.gametype === gametype) return true;
        }

        return false;
    }

    createMissingData(players, result, gametypes){

        console.log(`create missing data`);
        console.log(players);
        console.log(result);
        console.log(gametypes);
        console.log(`-0-----------------------`);

        for(let i = 0; i < players.length; i++){

            for(let x = 0; x < gametypes.length; x++){

                if(this.bDataExist(players, players[i], gametypes[x])){
                    console.log(`${players[i]} gametype ${gametypes[x]} data exists.`);
                }else{

                    result.push(
                        {
                            "player": players[i],
                            "gametype": gametypes[x],
                            "wins": 0,
                            "draws": 0,
                            "losses": 0,
                            "winRate": 0,
                            "current_win_streak": 0,
                            "current_draw_streak": 0,
                            "current_lose_streak": 0,
                            "max_win_streak": 0,
                            "max_draw_streak": 0,
                            "max_lose_streak": 0
                        }
                    );
                    console.log(`${players[i]} gametype ${gametypes[x]} data does not exist.`);
                }
            }
        }

       //console.log(result);
        return result;
    }

}

module.exports = WinRate;