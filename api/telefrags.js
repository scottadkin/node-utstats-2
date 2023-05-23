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

        const query = `INSERT INTO nstats_player_telefrags VALUES(NULL,?,?,?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)`;

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
        worst_tele_deaths = IF(worst_tele_deaths < ?, ?, worst_tele_deaths),
        best_tele_multi = IF(best_tele_multi < ?, ?, best_tele_multi),
        best_tele_spree = IF(best_tele_spree < ?, ?, best_tele_spree),
        disc_kills = disc_kills+?,
        disc_deaths = disc_deaths+?,
        disc_efficiency = IF(disc_kills > 0, IF(disc_deaths > 0, (disc_kills / (disc_kills + disc_deaths)) * 100, 100), 0),
        best_disc_kills = IF(best_disc_kills < ?, ?, best_disc_kills),
        worst_disc_deaths = IF(worst_disc_deaths < ?, ?, worst_disc_deaths),
        best_disc_multi = IF(best_disc_multi < ?, ?, best_disc_multi),
        best_disc_spree = IF(best_disc_spree < ?, ?, best_disc_spree)
        WHERE player_id=? AND map_id=? AND gametype_id=?`;

        const vars = [     
            playtime, 
            stats.total,
            stats.deaths,
            stats.total, stats.total,
            stats.deaths, stats.deaths,
            stats.bestMulti, stats.bestMulti,
            stats.bestSpree, stats.bestSpree,
            stats.discKills,
            stats.discDeaths,
            stats.discKills, stats.discKills,
            stats.discDeaths, stats.discDeaths,
            stats.discKillsBestMulti, stats.discKillsBestMulti,
            stats.discKillsBestSpree, stats.discKillsBestSpree,
            playerId, mapId, gametypeId,
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerTotalCustom(playerId, mapId, gametypeId, data){

       // console.log(`updatePlayerTotalCustom(${playerId}, ${mapId}, ${gametypeId})`);





        if(!await this.bPlayerTotalExist(playerId, mapId, gametypeId)){
            //console.log(`CREATE NEW player total custom ${playerId}, ${mapId}, ${gametypeId}`);
            await this.createPlayerTotal(playerId, mapId, gametypeId);
        }

        //possible fix for merging players with no playtime?
        if(data.deaths === undefined){
            return;
        }

        const query = `UPDATE nstats_player_telefrags SET 
        total_matches=total_matches+?,
        playtime=playtime+?,
        tele_kills = tele_kills+?,
        tele_deaths = tele_deaths+?,
        tele_efficiency = IF(tele_kills > 0, IF(tele_deaths > 0, (tele_kills / (tele_kills + tele_deaths)) * 100, 100) ,0),
        best_tele_kills = IF(best_tele_kills < ?, ?, best_tele_kills),
        worst_tele_deaths = IF(worst_tele_deaths < ?, ?, worst_tele_deaths),
        best_tele_multi = IF(best_tele_multi < ?, ?, best_tele_multi),
        best_tele_spree = IF(best_tele_spree < ?, ?, best_tele_spree),
        disc_kills = disc_kills+?,
        disc_deaths = disc_deaths+?,
        disc_efficiency = IF(disc_kills > 0, IF(disc_deaths > 0, (disc_kills / (disc_kills + disc_deaths)) * 100, 100), 0),
        best_disc_kills = IF(best_disc_kills < ?, ?, best_disc_kills),
        worst_disc_deaths = IF(worst_disc_deaths < ?, ?, worst_disc_deaths),
        best_disc_multi = IF(best_disc_multi < ?, ?, best_disc_multi),
        best_disc_spree = IF(best_disc_spree < ?, ?, best_disc_spree)
        WHERE player_id=? AND map_id=? AND gametype_id=?`;

        const vars = [     
            data.total_matches,
            data.playtime, 
            data.total,
            data.deaths,
            data.total, data.total,
            data.deaths, data.deaths,
            data.bestMulti, data.bestMutli,
            data.bestSpree, data.bestSpree,
            data.discKills,
            data.discDeaths,
            data.discKills, data.discKills,
            data.discDeaths, data.discDeaths,
            data.discKillsBestMulti, data.discKillsBestMulti,
            data.discKillsBestSpree, data.discKillsBestSpree,
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

    async deletePlayer(playerId){

        const query = `DELETE FROM nstats_player_telefrags WHERE player_id=?`;
        return await mysql.simpleQuery(query, [playerId]);
    }

    async changePlayerIds(oldId, newId){

        const query = `UPDATE nstats_tele_frags SET
        killer_id = IF(killer_id = ?, ?, killer_id),
        victim_id = IF(victim_id = ?, ?, victim_id)`;

        const vars = [
            oldId, newId,
            oldId, newId
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async insertCustomTotal(playerId, data){

        const query = `INSERT INTO nstats_player_telefrags VALUES(
            NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )`;

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            let teleEff = 0;

            if(d.telefrag_kills > 0){

                if(d.telefrag_deaths > 0){

                    teleEff = (d.telefrag_kills / (d.telefrag_kills + d.telefrag_deaths)) * 100;
                }else{
                    teleEff = 100;
                }
            }

            let discEff = 0;

            if(d.tele_disc_kills > 0){

                if(d.tele_disc_deaths > 0){

                    discEff = (d.tele_disc_kills / (d.tele_disc_kills + d.tele_disc_deaths)) * 100;
                }else{
                    discEff = 100;
                }
            }
            const vars = [
                playerId, d.map_id, d.gametype, d.playtime, d.total_matches,
                d.telefrag_kills, d.telefrag_deaths, teleEff,
                d.best_telefrag_kills, d.worst_telefrag_deaths, d.telefrag_best_multi, d.telefrag_best_spree,
                d.tele_disc_kills, d.tele_disc_deaths, discEff,
                d.best_tele_disc_kills, d.worst_tele_disc_deaths, d.tele_disc_best_multi, d.tele_disc_best_spree
            ];

            //console.log(`insert new telefrag totals for playerId ${playerId}, ${d.map_id}, ${d.gametype}`);

            await mysql.simpleQuery(query, vars);

            //all time total
            await this.updatePlayerTotalCustom(playerId, 0, 0, d);
            await this.updatePlayerTotalCustom(playerId, d.map_id, 0, d);
            await this.updatePlayerTotalCustom(playerId, 0, d.gametype, d);
        }

        
    }

    async recalculatePlayerTotals(playerId){

        const query = `SELECT gametype,map_id,
        COUNT(*) as total_matches,
        SUM(playtime) as playtime,
        SUM(telefrag_kills) as telefrag_kills,
        MAX(telefrag_kills) as best_telefrag_kills,
        SUM(telefrag_deaths) as telefrag_deaths,
        MAX(telefrag_deaths) as worst_telefrag_deaths,
        MAX(telefrag_best_spree) as telefrag_best_spree,
        MAX(telefrag_best_multi) as telefrag_best_multi,
        SUM(tele_disc_kills) as tele_disc_kills,
        MAX(tele_disc_kills) as best_tele_disc_kills,
        SUM(tele_disc_deaths) as tele_disc_deaths,
        MAX(tele_disc_deaths) as worst_tele_disc_deaths,
        MAX(tele_disc_best_spree) as tele_disc_best_spree,
        MAX(tele_disc_best_multi) as tele_disc_best_multi
        FROM nstats_player_matches WHERE player_id=? GROUP BY gametype, map_id`;
    
        const result = await mysql.simpleQuery(query, [playerId]);

        if(result.length > 0){
            await this.insertCustomTotal(playerId, result);
        }else{
            console.log(`No data to create telefrag totals for playerId ${playerId}`);
        }

    }

    async mergePlayers(oldId, newId){

        await this.deletePlayer(oldId);
        await this.deletePlayer(newId);
        await this.changePlayerIds(oldId, newId);
        await this.recalculatePlayerTotals(newId);
    }

    async getPlayerTotals(playerId){

        const query = `SELECT * FROM nstats_player_telefrags WHERE player_id=?`;

        return await mysql.simpleQuery(query, [playerId]);
    }
}

module.exports = Telefrags;