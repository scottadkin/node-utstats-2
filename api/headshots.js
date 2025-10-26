import { simpleQuery, bulkInsert } from "./database.js";

export default class Headshots{

    constructor(){}

    async insert(match, timestamp, killer, victim, distance, killerTeam, victimTeam){

        if(distance === undefined) distance = -1;

        if(distance === null) distance = -1;

        const query = "INSERT INTO nstats_headshots VALUES(NULL,?,?,?,?,?,?,?)";

        return await simpleQuery(query, [match, timestamp, killer, victim, distance, killerTeam, victimTeam]);
    }


    async insertAllHeadshots(vars){

        const query = "INSERT INTO nstats_headshots (match_id,timestamp,killer,victim,distance,killer_team,victim_team) VALUES ?";

        return await bulkInsert(query, vars);
    }

    async getMatchData(match){

        const query = "SELECT timestamp,killer,victim,distance,killer_team,victim_team FROM nstats_headshots WHERE match_id=?";
        return await simpleQuery(query, [match]);
    }

    async deletePlayerFromMatch(playerId, matchId){

        const query = `DELETE FROM nstats_headshots WHERE (match_id=? AND killer=?) OR (match_id=? AND victim=?)`;

        return await simpleQuery(query, [matchId, playerId, matchId, playerId]);
    }

    async changePlayerIds(oldId, newId){

        await simpleQuery("UPDATE nstats_headshots SET killer=? WHERE killer=?", [newId, oldId]);
        await simpleQuery("UPDATE nstats_headshots SET victim=? WHERE victim=?", [newId, oldId]);
    }


    async deletePlayer(player){

        await simpleQuery("DELETE FROM nstats_headshots WHERE (killer = ?) OR (victim = ?)", [player, player]);
    }

    async deleteMatches(ids){

        if(ids.length === 0) return;

        await simpleQuery("DELETE FROM nstats_headshots WHERE match_id IN (?)", [ids]);
    }
}


export async function deleteMatchData(id){

    const query = "DELETE FROM nstats_headshots WHERE match_id=?";

    return await simpleQuery(query, [id]);
}