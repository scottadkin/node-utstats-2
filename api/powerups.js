const mysql = require("./database");

class PowerUps{

    constructor(){}


    async createPowerUp(name){

        const query = `INSERT INTO nstats_powerups VALUES(NULL,?,?)`;
        return await mysql.simpleQuery(query, [name, name]);
    }
    

    async getPowerUpId(name){

        const query = "SELECT id FROM nstats_powerups WHERE name=? LIMIT 1";

        const result = await mysql.simpleQuery(query, [name]);

        if(result.length !== 0) return result[0].id;

        const createResult = await this.createPowerUp(name);

        return createResult.insertId;
    }


    //end reasons : -1 match ended, 0 power up ended, 1 killed, 2 suicide
    async insertPlayerMatchData(matchId, matchDate, playerId, powerUpId, start, end, carryTime, kills, endReason){

        const query = `INSERT INTO nstats_powerups_carry_times VALUES(NULL,?,?,?,?,?,?,?,?,?)`;
        const vars = [matchId, matchDate, playerId, powerUpId, start, end, carryTime, kills, endReason];

        return await mysql.simpleQuery(query, vars);

    }
}

module.exports = PowerUps;