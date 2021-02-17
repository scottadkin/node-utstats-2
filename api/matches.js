const mysql = require('./database');

class Matches{

    constructor(){

    }

    insertMatch(date, server, gametype, map, version, minVersion, admin, email, region, motd, mutators, playtime, endType, start, end, insta,
        teamGame, gameSpeed, hardcore, tournament, airControl, useTranslocator, friendlyFireScale, netMode, maxSpectators, 
        maxPlayers, totalTeams, totalPlayers, timeLimit, targetScore, dmWinner, dmScore, redScore, blueScore, greenScore, yellowScore){

        mutators = mutators.toString();

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_matches VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0)";

            const vars = [
                date, 
                server, 
                gametype,
                map, 
                version, 
                minVersion, 
                admin, 
                email, 
                region, 
                motd, 
                mutators,
                playtime, 
                endType, 
                start, 
                end, 
                insta, 
                teamGame, 
                gameSpeed, 
                hardcore, 
                tournament,
                airControl, 
                useTranslocator, 
                friendlyFireScale, 
                netMode,
                maxSpectators,
                maxPlayers,
                totalTeams,
                totalPlayers,
                timeLimit,
                targetScore,
                dmWinner, 
                dmScore, 
                redScore,
                blueScore, 
                greenScore, 
                yellowScore

            ];

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);
                
                resolve(result.insertId);
            });
        });
    }

    getWinners(matchIds){

        return new Promise((resolve, reject) =>{

            if(matchIds === undefined) resolve([]);
            if(matchIds.length === 0) resolve([]);

            const query = "SELECT id,team_game,dm_winner,dm_score,team_score_0,team_score_1,team_score_2,team_score_3,total_teams,gametype FROM nstats_matches WHERE id IN(?)";

            mysql.query(query, [matchIds], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    debugGetAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_matches ORDER BY date DESC, id DESC LIMIT 25";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getRecent(page, perPage, gametype){

        return new Promise((resolve, reject) =>{

            page = parseInt(page);
            perPage = parseInt(perPage);
            gametype = parseInt(gametype);

            if(gametype !== gametype){
                gametype = 0;
            }

            if(page !== page){
                page = 0;
            }

            if(perPage !== perPage){
                perPage = 10;
            }

            const start = page * perPage;

            let query = `SELECT * FROM nstats_matches WHERE gametype=? ORDER BY date DESC, id DESC LIMIT ?, ?`;
            let vars = [gametype, start, perPage];

            if(gametype === 0){
                query = `SELECT * FROM nstats_matches ORDER BY date DESC, id DESC LIMIT ?, ?`;
                vars = [ start, perPage];
            }

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getTotal(gametype){

        return new Promise((resolve, reject) =>{

            if(gametype === undefined){
                gametype = 0;
            }else{
                gametype = parseInt(gametype);

                if(gametype !== gametype){
                    gametype = 0;
                }

            }

            let query = "SELECT COUNT(*) as total_matches FROM nstats_matches";
            let vars = [];

            if(gametype !== 0){
                query = "SELECT COUNT(*) as total_matches FROM nstats_matches WHERE gametype=?";
                vars = [gametype];
            }

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result[0].total_matches);
                }
                resolve(0);
            });
        });
    }

    getServerNames(ids){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,server FROM nstats_matches WHERE id IN(?)";

            const data = {};

            if(ids.length === 0) return data;

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);
                
                if(result !== undefined){

                    for(let i = 0; i < result.length; i++){
                        data[result[i].id] = result[i].server; 
                    }
                }

                resolve(data);
            });
        });
    }


    getPlayerCount(ids){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,players FROM nstats_matches WHERE id IN(?)";

            const data = {};

            if(data.length === 0) return data;

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    for(let i = 0; i < result.length; i++){

                        data[result[i].id] = result[i].players;
                    }
                }
                resolve(data);
            });
        });
    }


    getFirst(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT date FROM nstats_matches ORDER BY date ASC LIMIT 1";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result[0].date);
                }   
                resolve(0);
            });
        });
    }

    getLast(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT date FROM nstats_matches ORDER BY date DESC LIMIT 1";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result[0].date);
                }   
                resolve(0);
            });
        });
    }
    
}
module.exports = Matches;