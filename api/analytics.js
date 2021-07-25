const mysql = require('./database');

class Analytics{

    constructor(){

    }


    static async insertHit(ip){

        const query = "INSERT INTO nstats_hits VALUES(NULL,?,?)";

        await mysql.simpleInsert(query, [ip, Date.now() * 0.001]);
    }
}

module.exports = Analytics;