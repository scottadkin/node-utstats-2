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
    async insertPlayerCarryTimes(matchId, matchDate, playerId, powerUpId, start, end, carryTime, kills, endReason){

        const query = `INSERT INTO nstats_powerups_carry_times VALUES(NULL,?,?,?,?,?,?,?,?,?)`;
        const vars = [matchId, matchDate, playerId, powerUpId, start, end, carryTime, kills, endReason];

        return await mysql.simpleQuery(query, vars);
    }

    async insertPlayerMatchData(matchId, matchDate, playerId, powerUpId, stats){

        const query = `INSERT INTO nstats_powerups_player_match VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vars = [
            matchId,
            matchDate, 
            playerId,
            powerUpId,
            stats.timesUsed,
            stats.carryTime,
            stats.bestCarryTime,
            stats.totalKills,
            stats.bestKills,
            stats.totalDeaths,
            stats.totalSuicides,
            stats.totalTimeouts,
            stats.matchEnds
        ];

        return await mysql.simpleQuery(query, vars);
    }


    async bPlayerTotalExist(playerId, powerUpId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_powerups_player_totals WHERE player_id=? AND powerup_id=?`;

        const result = await mysql.simpleQuery(query, [playerId, powerUpId]);

        if(result.length > 0){
            if(result[0].total_matches > 0) return true;
        }

        return false;
    }

    async insertPlayerTotal(playerId, powerUpId, stats, playerPlaytime){

        const query = `INSERT INTO nstats_powerups_player_totals VALUES(NULL,?,1,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const vars = [
            playerId,
            playerPlaytime,
            powerUpId,     
            stats.timesUsed,
            stats.timesUsed,
            stats.carryTime,
            stats.bestCarryTime,
            stats.totalKills,
            stats.totalKills,
            stats.bestKills,
            stats.totalDeaths,
            stats.totalSuicides,
            stats.totalTimeouts,
            stats.matchEnds
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerTotals(playerId, powerUpId, stats, playerPlaytime){

        if(!await this.bPlayerTotalExist(playerId, powerUpId)){
            await this.insertPlayerTotal(playerId, powerUpId, stats, playerPlaytime);
            return;
        }

        const query = `UPDATE nstats_powerups_player_totals SET
            total_matches=total_matches+1,
            total_playtime=total_playtime+?,
            times_used=times_used+?,
            times_used_best = IF(times_used_best < ?, ?, times_used_best),
            carry_time=carry_time+?,
            carry_time_best = IF(carry_time_best < ?, ?, carry_time_best),
            total_kills=total_kills+?,
            best_kills = IF(best_kills < ?, ?, best_kills),
            best_kills_single_use = IF(best_kills_single_use < ?, ?, best_kills_single_use),
            end_deaths=end_deaths+?,
            end_suicides=end_suicides+?,
            end_timeouts=end_timeouts+?,
            end_match_end=end_match_end+?
            WHERE player_id=?
            AND powerup_id=?
            
        `;

        const vars = [
            playerPlaytime,
            stats.timesUsed,
            stats.timesUsed, stats.timesUsed,
            stats.carryTime,
            stats.carryTime, stats.carryTime,
            stats.totalKills,
            stats.totalKills, stats.totalKills,
            stats.bestKills, stats.bestKills,
            stats.totalDeaths,
            stats.totalSuicides,
            stats.totalTimeouts,
            stats.matchEnds,
            playerId,
            powerUpId
        ];

        return await mysql.simpleQuery(query, vars);
    }
}



module.exports = PowerUps;