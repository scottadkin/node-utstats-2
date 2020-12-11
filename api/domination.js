const mysql = require('./database');
const Promise = require('promise');

class Domination{

    constructor(){

    }

    updateTeamScores(matchId, red, blue, green, yellow){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_matches SET team_score_0=?,team_score_1=?,team_score_2=?,team_score_3=? WHERE id=?";

            mysql.query(query, [red, blue, green, yellow, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });

    }
}


module.exports = Domination;