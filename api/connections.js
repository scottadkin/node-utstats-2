import { simpleQuery, bulkInsert } from "./database.js";


export default class Connections{

    constructor(){

    }

    async insert(matchId, timestamp, type, player){

        const query = "INSERT INTO nstats_match_connections VALUES(NULL,?,?,?,?)";

        return await simpleQuery(query, [matchId, timestamp, player, type]);

    }

    async bulkInsert(vars){

        const query = "INSERT INTO nstats_match_connections (match_id, timestamp, player, event) VALUES ?";

        return await bulkInsert(query, vars);
    }

    async getMatchData(matchId){

        const query = "SELECT timestamp,player,event FROM nstats_match_connections WHERE match_id=?";
        return await simpleQuery(query, matchId);
    }

    async deletePlayerFromMatch(playerId, matchId){

        const query = "DELETE FROM nstats_match_connections WHERE player=? AND match_id=?";
        return await simpleQuery(query, [playerId, matchId]);
    }

    async changePlayerIds(oldId, newId){

        await simpleQuery("UPDATE nstats_match_connections SET player=? WHERE player=?", [newId, oldId]);
    }

    async deletePlayer(playerId){

        await simpleQuery("DELETE FROM nstats_match_connections WHERE player=?", [playerId]);
    }

    async deleteMatches(ids){

        if(ids.length === 0) return;

        await simpleQuery("DELETE FROM nstats_match_connections WHERE match_id IN (?)", [ids]);
    }

    async getPlayerMatchData(matchId, playerId){

        const query = "SELECT timestamp,event FROM nstats_match_connections WHERE match_id=? AND player=?";

        return await simpleQuery(query, [matchId, playerId]);
    }
}

export async function deleteMatchData(matchId){

    const query = "DELETE FROM nstats_match_connections WHERE match_id=?";
    return await simpleQuery(query, [matchId]);

}

export async function deletePlayerData(playerId){

    const query = `DELETE FROM nstats_match_connections WHERE player=?`;
    return await simpleQuery(query, [playerId]);
}

export async function deletePlayerFromMatch(playerId, matchId){

    const query = `DELETE FROM nstats_match_connections WHERE match_id=? AND player=?`;

    return await simpleQuery(query, [matchId, playerId]);
}