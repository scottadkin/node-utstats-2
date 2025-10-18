import { simpleQuery } from "./database.js";

async function bHostPortFolderComboInUse(host, port, targetFolder){
    
    const query = `SELECT COUNT(*) as total_rows FROM nstats_ftp WHERE host=? AND port=? AND target_folder=?`;

    const result = await simpleQuery(query, [host, port, targetFolder]);

    return result[0].total_rows > 0;
}

async function checkFTPParams(params, bSkipHostPortCheck){

    if(params.name === "") throw new Error(`FTP server name can't be an empty string`);
    if(params.host === "") throw new Error(`Host can't be an empty string`);
    if(params.port === "") throw new Error(`Port can't be an empty string`);
    const port = parseInt(params.port);
    if(port !== port) throw new Error(`Port must be an integer`);

    if(port < 0 || port > 65535) throw new Error(`Post must be an integer value between 0-65535`);
    params.port = port;

    if(!bSkipHostPortCheck && await bHostPortFolderComboInUse(params.host, params.port, params.folder)){
        throw new Error(`An FTP entry with the same host,port, and target folder already exist.`);
    }

    if(params.minPlayers === "") params.minPlayers = 0;
    if(params.minPlaytime === "") params.minPlaytime = 0;
}

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


    async addFTPServer(params){

        await checkFTPParams(params, false);

        const query = `INSERT INTO nstats_ftp VALUES (NULL,?,?,?,?,?,
        ?,?,0,0,0,
        ?,0,?,?,?,
        ?,?,?,?,?,
        0,0,0,?,?)`;

        const vars = [
            params.name,
            params.host,
            params.port,
            params.user,
            params.password,
            params.folder,
            params.deleteLogsAfterImport,
            params.deleteTmpFiles,
            params.ignoreBots,
            params.ignoreDuplicates,
            params.minPlayers,
            params.minPlaytime,
            params.sftp,
            params.importAce,
            params.deleteAceLogs,
            params.deleteAceSShots,
            params.enabled,
            0
        ];

        await simpleQuery(query, vars);
    }


    async updateFTPServer(params){

        await checkFTPParams(params, true);

        const query = `UPDATE nstats_ftp SET name=?,host=?,port=?,user=?,
        password=?,target_folder=?,delete_after_import=?,
        delete_tmp_files=?,ignore_bots=?,ignore_duplicates=?,
        min_players=?,min_playtime=?,sftp=?,
        import_ace=?,
        delete_ace_logs=?,delete_ace_screenshots=?,enabled=? WHERE id=?`;

        const vars = [
            params.name,
            params.host,
            params.port,
            params.user,
            params.password,
            params.folder,
            params.deleteLogsAfterImport,
            params.deleteTmpFiles,
            params.ignoreBots,
            params.ignoreDuplicates,
            params.minPlayers,
            params.minPlaytime,
            params.sftp,
            params.importAce,
            params.deleteAceLogs,
            params.deleteAceSShots,
            params.enabled,
            params.id
        ];

        await simpleQuery(query, vars);
    }


    async getFTPList(){

        const query = `SELECT * FROM nstats_ftp ORDER BY name ASC`;

        return await simpleQuery(query);
    }
}
