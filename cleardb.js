const mysql = require('./api/database');
const Message = require("./api/message");

const prefix = "nstats_";

const tables = [
    "ace_joins",
    "ace_kicks",
    "ace_players",
    "ace_screenshots",
    "ace_sshot_requests",
    "assault_match_objectives",
    "assault_objects",
    "countries",
    "ctf_assists",
    "ctf_caps",
    "ctf_cap_records",
    "ctf_carry_times",
    "ctf_covers",
    "ctf_cr_kills",
    "ctf_events",
    "ctf_flag_deaths",
    "ctf_flag_drops",
    "ctf_flag_pickups",
    "ctf_returns",
    "ctf_seals",
    "ctf_self_covers",
    "dom_control_points",
    "dom_match_caps",
    "dom_match_control_points",
    "dom_match_player_score",
    "faces",
    "gametypes",
    "headshots",
    //"items",
    "items_match",
    "items_player",
    "kills",
    "logs",
    "maps",
    "maps_flags",
    "map_combogib",
    "map_spawns",
    "matches",
    "match_combogib",
    "match_connections",
    "match_pings",
    "match_player_score",
    "match_team_changes",
    "monsters",
    "monsters_match",
    "monsters_player_match",
    "monsters_player_totals",
    "monster_kills",
    "nexgen_stats_viewer",
    "player_combogib",
    "player_ctf_best",
    "player_ctf_best_life",
    "player_ctf_match",
    "player_ctf_totals",
    "player_maps",
    "player_matches",
    "player_totals",
    "player_weapon_match",
    "player_weapon_totals",
    "powerups",
    "powerups_carry_times",
    "powerups_player_match",
    "powerups_player_totals",
    "ranking_player_current",
    "ranking_player_history",
    "servers",
    "sprees",
    "voices",
    "weapons",
    "winrates",
    "winrates_latest",

];



(async () =>{

    try{

        new Message(`Delete everything from database, this is not reversible.`,"note");

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const query = `TRUNCATE ${prefix}${t}`;

            await mysql.simpleQuery(query);
            new Message(query, "pass");
        }

        process.exit();

    }catch(err){
        console.trace(err);
        new Message(err, 'error');
    }

})()

