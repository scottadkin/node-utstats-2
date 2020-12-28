const mysql = require('./database');

class Matches{

    constructor(){

    }

    insertMatch(date, server, gametype, map, version, minVersion, admin, email, region, motd, playtime, endType, start, end, insta,
        teamGame, gameSpeed, hardcore, tournament, airControl, useTranslocator, friendlyFireScale, netMode, maxSpectators, 
        maxPlayers, totalTeams, totalPlayers, timeLimit, targetScore, dmWinner, dmScore, redScore, blueScore, greenScore, yellowScore){

        /*aircontrol,
                this.gameInfo.usetranslocator,
                this.gameInfo.friendlyfirescale,
                this.gameInfo.netmode*/

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_matches VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0)";

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

    
}
module.exports = Matches;