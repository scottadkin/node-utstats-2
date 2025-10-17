import { simpleQuery } from "./database.js";


export default class Admin{

    constructor(session){

        this.session = session;
    }

    async load(){

        if(!await this.session.bUserAdmin()) throw new Error(`Access Denied`);
    }

    async clearDatabases(){

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
            "hwid_to_name",
            "items",
            "items_match",
            "items_player",
            "kills",
            "logs",
            "maps",
            "maps_flags",
            "map_combogib",
            "map_items",
            "map_items_locations",
            "map_spawns",
            "map_totals",
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
            "player_telefrags",
            "player_totals",
            "player_weapon_best",
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
            "tele_frags",
            "voices",
            "weapons",
            "winrates",
            "winrates_latest"
        ];

        for(let i = 0; i < tables.length; i++){

            const t= tables[i];

            const query = `TRUNCATE TABLE nstats_${t}`;
            await simpleQuery(query);
        }
    }
}
