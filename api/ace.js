const mysql = require('./database');

class ACE{

    constructor(){}

    async insertJoin(fileName, data){

        const query = "INSERT INTO nstats_ace_players VALUES(NULL,?,?,?,?,?,?,?,?,?)";

        const vars = [
            fileName, 
            data.ace, 
            data.time, 
            data.name, 
            data.ip, 
            data.os,
            data.mac1, 
            data.mac2, 
            data.hwid
        ];

        await mysql.simpleInsert(query, vars);
    }
}

module.exports = ACE;