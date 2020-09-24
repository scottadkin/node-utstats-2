const mysql = require('./database');

class Matches{

    constructor(){

    }

    insertMatch(date, server, version, admin, region, motd, playtime, endType, start, end){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_matches VALUES(NULL,?,?,?,?,?,?,?,?,?,?)";

            const vars = [date, server, version, admin, region, motd, playtime, endType, start, end];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}
module.exports = Matches;