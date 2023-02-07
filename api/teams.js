const mysql = require('./database');
const Promise = require('promise');

class Teams{

    constructor(){

    }

    insertTeamChange(match, time, player, team){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_match_team_changes VALUES(NULL,?,?,?,?)";

            mysql.query(query, [match, time, player, team], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getMatchData(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT timestamp,player,team FROM nstats_match_team_changes WHERE match_id=?";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                
                resolve([]);
            });
        });
    }

    async deletePlayer(playerId){

        await mysql.simpleDelete("DELETE FROM nstats_match_team_changes WHERE player=?", [playerId]);
    }


    async getPlayerMatchData(matchId, playerId){

        const query = "SELECT timestamp,team FROM nstats_match_team_changes WHERE match_id=? AND player=? ORDER BY timestamp ASC";

        return await mysql.simpleQuery(query, [matchId, playerId]);
    }
}


module.exports =Teams;