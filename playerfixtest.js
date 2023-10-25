//pretty much for utctf pug stats.

const mysql = require("./api/database");
const Message = require("./api/message");


async function getSpectatorsWithPlaytime(){

    const query = `SELECT id,player_id,match_id,spectator,played,playtime,team FROM nstats_player_matches WHERE playtime>0 AND spectator=1 ORDER BY match_id ASC`;

    return await mysql.simpleQuery(query);
}

async function getPlayerLastPlayedTeam(playerId, matchId){

    const query = `SELECT team FROM nstats_match_team_changes WHERE player=? AND match_id=? AND team!=255 ORDER BY timestamp DESC LIMIT 1`;

    const result = await mysql.simpleQuery(query, [playerId, matchId]);

    if(result.length > 0) return result[0].team;

    return null;
}


async function fixPlayerTeam(rowId, teamId){

    const query = `UPDATE nstats_player_matches SET played=1,spectator=0,team=? WHERE id=?`;

    const result = await mysql.simpleQuery(query, [teamId, rowId]);

    return result.changedRows > 0;
}

(async () =>{


    const test = await getSpectatorsWithPlaytime();

    for(let i = 0; i < test.length; i++){

        const t = test[i];

        const lastTeam = await getPlayerLastPlayedTeam(t.player_id, t.match_id);

        if(lastTeam === null){
            new Message(`lastTeam is null, can't fix player team for playerId ${t.player_id} in match ${t.match_id}`,"warning");
            continue;
        }

        if(await fixPlayerTeam(t.id, lastTeam)){
            new Message(`Updated rowId = ${t.id} set team to ${lastTeam}`,"pass");
        }else{
            new Message(`Failed to fix player's team(0 rows updated).`,"warning");
        }
    }
    process.exit();
})();