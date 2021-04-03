const mysql = require('./database');
const Message = require('./message');
const Promise = require('promise');

class WinRate{

    constructor(){

    }

    getCurrentPlayersData(players, gametypes){

        return new Promise((resolve, reject) =>{

            if(players.length === 0){
                new Message(`WinRate.getCUrrentPlayersData() players.length is 0 skipping.`,'warning');
                resolve([]);
            }

            const query = "SELECT * FROM nstats_winrates_latest WHERE player IN(?) AND gametype IN(?) ORDER BY id DESC";

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

        for(let i = 0; i < players.length; i++){

            for(let x = 0; x < gametypes.length; x++){

                if(!this.bDataExist(result, players[i], gametypes[x])){

                    result.push(
                        {
                            "player": players[i],
                            "gametype": gametypes[x],
                            "matches": 0,
                            "wins": 0,
                            "draws": 0,
                            "losses": 0,
                            "winrate": 0,
                            "current_win_streak": 0,
                            "current_draw_streak": 0,
                            "current_lose_streak": 0,
                            "max_win_streak": 0,
                            "max_draw_streak": 0,
                            "max_lose_streak": 0
                        }
                    );
                }
            }
        }

       //console.log(result);
        return result;
    }

    insertHistory(matchId, date, data, bLatest){

        return new Promise((resolve, reject) =>{

            let query = "INSERT INTO nstats_winrates VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

            if(bLatest !== undefined){
                query = "INSERT INTO nstats_winrates_latest VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            }

            const vars = [
                date, 
                matchId, 
                data.player, 
                data.gametype, 
                data.matches,
                data.wins, 
                data.draws, 
                data.losses,
                data.winrate,
                data.current_win_streak,
                data.current_draw_streak,
                data.current_lose_streak,
                data.max_win_streak,
                data.max_draw_streak,
                data.max_lose_streak

            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    deletePreviousLatest(){

    }

    updateLatest(matchId, date, data){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_winrates_latest SET 
            date=?,
            match_id=?,
            matches=?,
            wins=?,
            draws=?,
            losses=?,
            winrate=?,
            current_win_streak=?,
            current_draw_streak=?,
            current_lose_streak=?,
            max_win_streak=?,
            max_draw_streak=?,
            max_lose_streak=?
            WHERE player=? AND gametype=?`;

            const vars = [
                date, 
                matchId, 
                data.matches,
                data.wins, 
                data.draws, 
                data.losses,
                data.winrate,
                data.current_win_streak,
                data.current_draw_streak,
                data.current_lose_streak,
                data.max_win_streak,
                data.max_draw_streak,
                data.max_lose_streak,
                data.player,
                data.gametype
            ];

            mysql.query(query, vars, async (err, result) =>{

                if(err) reject(err);

                if(result.changedRows === 0){
                    await this.insertHistory(matchId, date, data, true);
                }
                
                resolve();
            });

        });
    }

    

}

module.exports = WinRate;