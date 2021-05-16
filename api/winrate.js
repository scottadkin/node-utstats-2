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


            let vars = [];

            let query = "INSERT INTO nstats_winrates VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

            if(bLatest !== undefined){

                query = "INSERT INTO nstats_winrates_latest VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

                vars = [
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

            }else{

                vars = [
                    date, 
                    matchId, 
                    data.player, 
                    data.gametype, 
                    data.match_result,
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
            }

            

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
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


    getPlayerLatest(player){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_winrates_latest WHERE player=?";

            mysql.query(query, [player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    getPlayerGametypeHistory(player, gametype, limit){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_winrates WHERE player=? AND gametype=? ORDER BY date DESC LIMIT ?";

            mysql.query(query, [player, gametype, limit], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });
        });
    }
    

    async getPlayerWinrateHistory(player, gametypes, maxPerGametype){

        try{

            if(gametypes.length === 0) return [];

            const data = [];

            for(let i = 0; i < gametypes.length; i++){

                data.push(await this.getPlayerGametypeHistory(player, gametypes[i], maxPerGametype));
            }

            return data;
            
        }catch(err){
            console.trace(err);
        }

    
       
    }


    getPreviousMatchByDate(date, gametype, player){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_winrates WHERE date <= ? AND gametype = ? AND player = ? ORDER BY date DESC, id DESC LIMIT 1";

            mysql.query(query, [date, gametype, player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve();
                }
                resolve([]);
            });
        });
    }


    getAllPlayerGametypeHistory(player, gametype){

        return new Promise((resolve, reject) =>{

            const query = `SELECT 
            id,date,match_result

            FROM nstats_winrates WHERE gametype=? AND player=? ORDER BY date ASC
            `;

            mysql.query(query, [gametype, player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    updateHistoryEntry(data){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_winrates SET 
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
            WHERE id=?
            `;

            const vars = [

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
                data.id

            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);
   
                resolve();
            });
        });
    }

    //call when a match date is lower then the latest one
    async recalculateWinRates(player, gametype){

        try{

            const history = await this.getAllPlayerGametypeHistory(player, gametype);

            console.log(`player ${player} has ${history.length} data to calculate`);

            let currentWinStreak = 0;
            let currentDrawStreak = 0;
            let currentLoseStreak = 0;

            let maxWinStreak = 0;
            let maxDrawStreak = 0;
            let maxLoseStreak = 0;

            let currentWins = 0;
            let currentDraws = 0;
            let currentLosses = 0;

            let wins = 0;
            let draws = 0;
            let losses = 0;

            let h = 0;

            for(let i = 0; i < history.length; i++){

                h = history[i];

                if(h.match_result === 0){

                    currentWinStreak++;
                    currentDrawStreak = 0;
                    currentLoseStreak = 0;

                    if(currentWinStreak > maxWinStreak){
                        maxWinStreak = currentWinStreak;
                    }

                    currentWins++;

                }else if(h.match_result === 1){

                    currentWinStreak = 0;
                    currentDrawStreak = 0;
                    currentLoseStreak++;

                    if(currentLoseStreak > maxLoseStreak){
                        maxLoseStreak = currentLoseStreak;
                    }

                    currentLosses++;

                }else{

                    currentWinStreak = 0;
                    currentDrawStreak++;
                    currentLoseStreak = 0;

                    if(currentDrawSteak > maxDrawStreak){
                        maxDrawStreak = currentDrawStreak;
                    }

                    currentDraws++;
                }

                h.wins = currentWins;
                h.draws = currentDraws;
                h.losses = currentLosses;
                h.current_win_streak = currentWinStreak;
                h.current_draw_streak = currentDrawStreak;
                h.current_lose_streak = currentLoseStreak;
                h.max_win_streak = maxWinStreak;
                h.max_draw_streak = maxDrawStreak;
                h.max_lose_streak = maxLoseStreak;
                h.matches = i + 1;
                
                if(h.wins > 0){

                    if(h.draws === 0 && h.losses === 0){
                        h.winrate = 100;
                    }else{
                        h.winrate = (h.wins / h.matches) * 100;
                    }
                }else{
                    h.winrate = 0;
                }

            }

        }catch(err){
            console.trace(err);
        }   
    }


    deleteMatchData(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_winrates WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async getPlayerGamtypeHistoryDetailed(playerId, gametypeId){

        return await mysql.simpleFetch("SELECT * FROM nstats_winrates WHERE gametype=? AND player=? ORDER BY id ASC",[
            gametypeId, playerId
        ]);
    }

    async recalculatePlayerHistory(data, playerId, gametypeId){

        try{

            if(data.length === 0) return;

            // loser = 0
            // winner = 1
            // draw = 2

            let matches = 0;
            let wins = 0;
            let draws = 0;
            let losses = 0;
            let currentWinStreak = 0;
            let currentDrawStreak = 0;
            let currentLoseStreak = 0;
            let maxWinStreak = 0;
            let maxDrawStreak = 0;
            let maxLoseStreak = 0;
            let winrate = 0;
            let matchId = 0;
            let matchDate = 0;

            let d = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                matches++;

                matchId = d.match_id;
                matchDate = d.date;

                if(d.match_result === 0){

                    losses++;
                    currentWinStreak = 0;
                    currentDrawStreak = 0;
                    currentLoseStreak++;

                }else if(d.match_result === 1){

                    wins++;
                    currentWinStreak++;
                    currentDrawStreak = 0;
                    currentLoseStreak = 0;

                }else if(d.match_result === 2){

                    draws++;
                    currentDrawStreak++;
                    currentWinStreak = 0;
                    currentLoseStreak = 0;
                }


                if(currentWinStreak >= maxWinStreak) maxWinStreak = currentWinStreak;
                if(currentDrawStreak >= maxDrawStreak) maxDrawStreak = currentDrawStreak;
                if(currentLoseStreak >= maxLoseStreak) maxLoseStreak = currentLoseStreak;


                winrate = 0;

                if(wins > 0){

                    if(losses === 0 && draws === 0){
                        winrate = 100;
                    }else{

                        winrate = (wins / matches) * 100
                    }

                }

                //query here

                await this.updateHistoryEntry({
                    "id": d.id,
                    "matches": matches,
                    "wins": wins,
                    "draws": draws,
                    "losses": losses,
                    "current_win_streak": currentWinStreak,
                    "current_draw_streak": currentDrawStreak,
                    "current_lose_streak": currentLoseStreak,
                    "max_win_streak": maxWinStreak,
                    "max_draw_streak": maxDrawStreak,
                    "max_lose_streak": maxLoseStreak,
                    "winrate": winrate

                });
            }

            await this.updateLatest(matchId, matchDate, {
                "id": d.id,
                "matches": matches,
                "wins": wins,
                "draws": draws,
                "losses": losses,
                "current_win_streak": currentWinStreak,
                "current_draw_streak": currentDrawStreak,
                "current_lose_streak": currentLoseStreak,
                "max_win_streak": maxWinStreak,
                "max_draw_streak": maxDrawStreak,
                "max_lose_streak": maxLoseStreak,
                "winrate": winrate,
                "player": playerId,
                "gametype": gametypeId

            });

        }catch(err){
            console.trace(err);
        }
    }

    async deletePlayerFromMatch(playerId, matchId, gametypeId){

        try{

            await mysql.simpleDelete("DELETE FROM nstats_winrates WHERE player=? AND match_id=?", [playerId, matchId]);

            const allHistory = await this.getPlayerGamtypeHistoryDetailed(playerId, 0);
            const gametypeHistory = await this.getPlayerGamtypeHistoryDetailed(playerId, gametypeId);

            console.table(allHistory);

            await this.recalculatePlayerHistory(allHistory, playerId, gametypeId);
            await this.recalculatePlayerHistory(gametypeHistory, playerId, gametypeId);

        }catch(err){
            console.trace(err);
        }
    }
}

module.exports = WinRate;