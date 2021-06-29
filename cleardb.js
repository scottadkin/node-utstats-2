const mysql = require('./api/database');
const Promise = require('promise');
const Message = require("./api/message");

const prefix = "nstats_";

const tables = [
    "assault_match_objectives",
    "assault_objects",
    "countries",
    "ctf_caps",
    "ctf_events",
    "dom_control_points",
    "dom_match_caps",
    "dom_match_control_points",
    "dom_match_player_score",
    "faces",
    "gametypes",
    "headshots",
    "items",
    "items_match",
    "items_player",
    "kills",
    "logs",
    "maps",
    "maps_flags",
    "map_spawns",
    "matches",
    "match_connections",
    "match_pings",
    "match_player_score",
    "match_team_changes",
    "player_maps",
    "player_matches",
    "player_totals",
    "player_weapon_match",
    "player_weapon_totals",
    "servers",
    "voices",
    "weapons",
    "winrates",
    "winrates_latest",
    "ranking_values",
    "ranking_player_current",
    "ranking_player_history",
    "users",
    "sessions",
    "site_settings",
    "sprees",
    "monsters",
    "monsters_match",
    "monster_kills",
    "monsters_player_match"

];

function quickQuery(query){

    new Message(`Performing query "${query}"`, "note");

    return new Promise((resolve, reject) =>{

        mysql.query(query, (err, result) =>{

            if(err) reject(err);

            new Message(`Query "${query}" completed.`, "pass");
            if(result !== undefined){
                resolve(result.affectedRows);
            }else{
                resolve(0);
            }
        });
    });
}


(async () =>{

    try{

        new Message(`Delete everything from database, this is not reversible.`,"note");

        let bit = 100 / tables.length;

        let deleted = 0;

        let i = 0;

        for(i = 0; i < tables.length; i++){

            deleted += await quickQuery(`DELETE FROM ${prefix}${tables[i]}`);
            new Message(`${(bit * (i + 1)).toFixed(2)}% Complete`, "progress");
        }


        new Message(`Deleted ${deleted} rows of data from ${tables.length} tables.`,"pass");
        new Message(`All tables are now empty.`,"pass");

        process.exit();

    }catch(err){
        console.trace(err);
        new Message(err, 'error');
    }

})()

