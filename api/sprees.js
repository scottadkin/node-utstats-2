import { bulkInsert, simpleQuery } from "./database.js";

export default class Sprees{

    constructor(){}

    async getPlayerMatchData(matchId, playerId){

        const query = "SELECT player,kills,killer,start_timestamp,end_timestamp,total_time FROM nstats_sprees WHERE match_id=? AND (player=? || killer=?)";
        const vars = [matchId, playerId, playerId];
        return await simpleQuery(query, vars);

    }

    async deletePlayerMatchData(playerId, matchId){

        const query = "DELETE FROM nstats_sprees WHERE match_id=? AND player=?";

        await simpleQuery(query, [matchId, playerId]);
    }

    async deletePlayer(playerId){

        const query = "DELETE FROM nstats_sprees WHERE player=?";

        await simpleQuery(query, [playerId]);
    }

    async changePlayerIds(oldId, newId){

        const query = `UPDATE nstats_sprees SET player=? WHERE player=?`;
        const query2 = `UPDATE nstats_sprees SET killer=? WHERE killer=?`;

        await simpleQuery(query, [newId, oldId]);
        await simpleQuery(query2, [newId, oldId]);
        
    }
}


export async function getDetailedMatchSprees(id){

    const query = "SELECT player,kills,killer,start_timestamp,end_timestamp,total_time FROM nstats_sprees WHERE match_id=?";
    const vars = [id];
    return await simpleQuery(query, vars);

}

export async function deleteMatchData(id){

    const query = `DELETE FROM nstats_sprees WHERE match_id=?`;

    return await simpleQuery(query, [id]);
}


export async function deletePlayerData(id){

    const query = `DELETE FROM nstats_sprees WHERE player=?`;
    return await simpleQuery(query, [id]);
}


export async function bulkInsertMatchSprees(sprees, gametypeId, mapId, matchId){

    const query = `INSERT INTO nstats_sprees (
    gametype_id,map_id,match_id,player,
    kills,start_timestamp,end_timestamp,total_time,
    killer) VALUES ?`;


    const insertVars = [];

    for(let i = 0; i < sprees.length; i++){

        const s = sprees[i];

        insertVars.push([
            gametypeId, mapId, matchId, s.player, s.kills,
            s.start, s.end, s.totalTime, s.killedBy
        ]);
    }


    return await bulkInsert(query, insertVars);
}


export async function deleteGametype(id){

    const query = `DELETE FROM nstats_sprees WHERE gametype_id=?`;

    return await simpleQuery(query, [id]);
}


export async function mergeGametypes(oldId, newId){

    const query = `UPDATE nstats_sprees SET gametype_id=? WHERE gametype_id=?`;

    return await simpleQuery(query, [newId, oldId]);
}


export async function deletePlayerFromMatch(playerId, matchId){

    const query = `DELETE FROM nstats_sprees WHERE match_id=? AND player=?`;

    return await simpleQuery(query, [matchId, playerId]);
}