import { simpleQuery, bulkInsert } from "./database.js";

export default class Teams{

    constructor(){

    }

    async insertTeamChange(match, time, player, team){

        const query = "INSERT INTO nstats_match_team_changes VALUES(NULL,?,?,?,?)";

        return await simpleQuery(query, [match, time, player, team]);
    }

    async bulkInsertTeamChanges(matchId, data){

        const query = `INSERT INTO nstats_match_team_changes (match_id, timestamp, player, team) VALUES ?`;

        const insertVars = data.map((d) =>{
            return [matchId, d.timestamp, d.player, d.team];
        });

        return await bulkInsert(query, insertVars);

    }

    async deletePlayer(playerId){

        await simpleQuery("DELETE FROM nstats_match_team_changes WHERE player=?", [playerId]);
    }
}

export async function getMatchTeamChanges(matchId){

    const query = "SELECT timestamp,player,team FROM nstats_match_team_changes WHERE match_id=?";
    return await simpleQuery(query, [matchId]);
}

export async function getPlayerMatchData(matchId, playerId){

    const query = "SELECT timestamp,team FROM nstats_match_team_changes WHERE match_id=? AND player=? ORDER BY timestamp ASC";

    return await simpleQuery(query, [matchId, playerId]);
}

export async function deleteMatchTeamChanges(id){

    const query = "DELETE FROM nstats_match_team_changes WHERE match_id=?";

    return await simpleQuery(query, [id]);
}


export async function deletePlayerData(playerId){

    const query = `DELETE FROM nstats_match_team_changes WHERE player=?`;

    return await simpleQuery(query, [playerId]);
}