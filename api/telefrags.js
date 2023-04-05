const mysql = require("./database");

class Telefrags{

    constructor(){}


    async getMatchData(matchId){

        const query = `SELECT timestamp,killer_id,killer_team,victim_id,victim_team,disc_kill 
        FROM nstats_tele_frags WHERE match_id=? ORDER BY timestamp ASC`;

        return await mysql.simpleQuery(query, [matchId]);
    }

    async getPlayerMatchKills(matchId, targetPlayerId){

        const query = `SELECT timestamp,killer_id,killer_team,victim_id,victim_team,disc_kill 
        FROM nstats_tele_frags WHERE match_id=? 
        AND (killer_id=? || victim_id=?)`;

        return await mysql.simpleQuery(query, [matchId, targetPlayerId, targetPlayerId]);
    }

    async bPlayerTotalExist(playerId, mapId, gametypeId){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_telefrags WHERE player_id=? AND map_id=? AND gametype_id=?`;

        const result = await mysql.simpleQuery(query, [playerId, mapId, gametypeId]);

        if(result[0].total_matches > 0) return true;
        return false;
    }

    async createPlayerTotal(playerId, mapId, gametypeId){

        const query = `INSERT INTO nstats_player_telefrags VALUES(NULL,?,?,?,0,0,0,0,0,0,0,0,0,0,0,0,0,0)`;

        return await mysql.simpleQuery(query, [playerId, mapId, gametypeId]);
    }

    async updatePlayerTotal(playerId, mapId, gametypeId, playtime, stats){

        const query = `UPDATE nstats_player_telefrags SET 
        total_matches=total_matches+1,
        playtime=playtime+?,
        tele_kills = tele_kills+?,
        tele_deaths = tele_deaths+?,
        tele_efficiency = IF(tele_kills > 0, IF(tele_deaths > 0, (tele_kills / (tele_kills + tele_deaths)) * 100, 100) ,0),
        best_tele_kills = IF(best_tele_kills < ?, ?, best_tele_kills),
        best_tele_multi = IF(best_tele_multi < ?, ?, best_tele_multi),
        best_tele_spree = IF(best_tele_spree < ?, ?, best_tele_spree),
        disc_kills = disc_kills+?,
        disc_deaths = disc_deaths+?,
        disc_efficiency = IF(disc_kills > 0, IF(disc_deaths > 0, (disc_kills / (disc_kills + disc_deaths)) * 100, 100), 0),
        best_disc_kills = IF(best_disc_kills < ?, ?, best_disc_kills),
        best_disc_multi = IF(best_disc_multi < ?, ?, best_disc_multi),
        best_disc_spree = IF(best_disc_spree < ?, ?, best_disc_spree)
        WHERE player_id=? AND map_id=? AND gametype_id=?`;

        const vars = [     
            playtime, 
            stats.total,
            stats.deaths,
            stats.total, stats.total,
            stats.bestMulti, stats.bestMutli,
            stats.bestSpree, stats.bestSpree,
            stats.discKills,
            stats.discDeaths,
            stats.discKills, stats.discKills,
            stats.discKillsBestMulti, stats.discKillsBestMulti,
            stats.discKillsBestSpree, stats.discKillsBestSpree,
            playerId, mapId, gametypeId,
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerTotals(playerId, mapId, gametypeId, playtime, stats){

        if(!await this.bPlayerTotalExist(playerId, mapId, gametypeId)){
            await this.createPlayerTotal(playerId, mapId, gametypeId);
        }

        await this.updatePlayerTotal(playerId, mapId, gametypeId, playtime, stats);

        if(mapId === 0 || gametypeId === 0) return;

        //map totals
        await this.updatePlayerTotals(playerId, 0, gametypeId, playtime, stats);
        //gametype totals
        await this.updatePlayerTotals(playerId, mapId, 0, playtime, stats);
        //all time totals
        await this.updatePlayerTotals(playerId, 0, 0, playtime, stats);
        
        
    }
}

module.exports = Telefrags;