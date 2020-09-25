const mysql = require('./database');

class Matches{

    constructor(){

    }

    insertMatch(date, server, map, version, admin, email, region, motd, playtime, endType, start, end, insta){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_matches VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?)";

            const vars = [date, server, map, version, admin, email, region, motd, playtime, endType, start, end, insta];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}
module.exports = Matches;