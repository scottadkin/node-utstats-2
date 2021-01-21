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
}


module.exports =Teams;