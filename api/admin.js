import { simpleQuery, insertReturnInsertId, updateReturnAffectedRows } from "./database.js";
import fs from "fs";
import Maps from "./maps.js";
import User from "./user.js";
import Matches from "./matches.js";
import WinRate from "./winrate.js";

export default class Admin{

    constructor(){

    }

    async getMapsFolder(){

        try{

            const m = new Maps();
            const databaseNames = await m.getAllNames();
            const files = fs.readdirSync("./public/images/maps/");
            return {"files": files, "databaseNames": databaseNames};

        }catch(err){
            console.trace(err);
        }
    }


    async getAllUsers(){

        try{

            const u = new User();

            const data = await u.adminGetAll();

            return data;

        }catch(err){
            console.trace(err);
        }   
    }

    async activateAccount(id){

        try{

            const u = new User();

            await u.activateAccount(id);

            return true;

        }catch(err){
            console.trace(err);
            return false;
        }
    }




    async getDuplicateMatches(){

        try{

            const m = new Matches();

            return await m.getDuplicates();
 

        }catch(err){
            console.trace(err);
        }
    }

    async deleteDuplicateMatches(logNames){

        try{

            const matchManager = new Matches();

            const matches = await matchManager.getLogMatches(logNames);

            const toDelete = [];
            const alreadyFound = [];


            let m = 0;

            for(let i = 0; i < matches.length; i++){

                m = matches[i];

                if(alreadyFound.indexOf(m.name) !== -1){
                    toDelete.push(m.match_id);
                }else{
                    alreadyFound.push(m.name);
                }

            }

            const affectedGametypes = [];

            let currentGametype = 0;

            for(let i = 0; i < toDelete.length; i++){

                currentGametype = await matchManager.deleteMatch(toDelete[i]);

                if(currentGametype !== undefined){

                    if(affectedGametypes.indexOf(currentGametype) === -1){
                        affectedGametypes.push(currentGametype);
                    }
                }
            }


            const winrateManager = new WinRate();

            for(let i = 0; i < affectedGametypes.length; i++){

                await winrateManager.recalculateGametype(affectedGametypes[i]);
            }



        }catch(err){
            console.trace(err);
        }
    }

    async getAllFTPServers(){

        const query = "SELECT * FROM nstats_ftp ORDER BY id ASC";

        return await simpleQuery(query);
    }

    async updateFTPServer(id, name, host, port, user, password, folder, deleteAfterImport, deleteTmpFiles, ignoreBots, ignoreDuplicates,
        minPlayers, minPlaytime, bSecureFTP, importAce, deleteAceLogs, deleteAceScreenshots, bUseACEPlayerHWID, enable){

            console.log(arguments);

        const query = `UPDATE nstats_ftp SET
            name=?,
            host=?,
            port=?,
            user=?,
            password=?,
            target_folder=?,
            delete_after_import=?,
            delete_tmp_files=?,
            ignore_bots=?,
            ignore_duplicates=?,
            min_players=?,
            min_playtime=?,
            sftp=?,
            import_ace=?,
            delete_ace_logs=?,
            delete_ace_screenshots=?,
            enabled=?,
            use_ace_player_hwid=?
            WHERE id=?`;
        
        bSecureFTP = bSecureFTP ?? 0;

        const vars = [
            name,
            host, 
            port,
            user,
            password,
            folder,
            deleteAfterImport,
            deleteTmpFiles,
            ignoreBots,
            ignoreDuplicates,
            minPlayers,
            minPlaytime,
            bSecureFTP,
            importAce,
            deleteAceLogs,
            deleteAceScreenshots,
            enable,
            bUseACEPlayerHWID,
            id
        ];


        return await simpleQueryupdateReturnAffectedRows(query, vars);
    }


    async addFTPServer(name, host, port, user, password, folder, deleteAfterImport, deleteTmpFiles, 
        ignoreBots, ignoreDuplicates, minPlayers, minPlaytime, bSecureFTP, importAce, deleteAceLogs, deleteAceScreenshots,
        bUseACEPlayerHWID, enable){

        
        bSecureFTP = bSecureFTP ?? 0;

        deleteAfterImport = (deleteAfterImport === "true") ? 1 : 0;
        deleteTmpFiles = (deleteTmpFiles === "true") ? 1 : 0;
        ignoreBots = (ignoreBots === "true") ? 1 : 0;
        ignoreDuplicates = (ignoreDuplicates === "true") ? 1 : 0;
        bSecureFTP = (bSecureFTP === "true") ? 1 : 0;
        importAce = (importAce === "true") ? 1 : 0;
        deleteAceLogs = (deleteAceLogs === "true") ? 1 : 0;
        deleteAceScreenshots = (deleteAceScreenshots === "true") ? 1 : 0;
        enable = (enable === "true") ? 1 : 0 ;
        bUseACEPlayerHWID = (bUseACEPlayerHWID === "true")  ? 1 : 0;

      
        const query = "INSERT INTO nstats_ftp VALUES(NULL,?,?,?,?,?,?,?,0,0,0,?,0,?,?,?,?,?,?,?,?,0,0,0,?,?)";

        const vars = [
            name, 
            host, 
            port, 
            user, 
            password, 
            folder, 
            deleteAfterImport, 
            deleteTmpFiles, 
            ignoreBots, 
            ignoreDuplicates, 
            minPlayers, 
            minPlaytime, 
            bSecureFTP,
            importAce,
            deleteAceLogs,
            deleteAceScreenshots,
            enable,
            bUseACEPlayerHWID
        ];

        return await insertReturnInsertId(query, vars);
    }

    async deleteFTPServer(id){

        const query = "DELETE FROM nstats_ftp WHERE id=?";

        return await updateReturnAffectedRows(query, [id]);
    }


    async getLogsFolderSettings(){

        const query = "SELECT * FROM nstats_logs_folder";

        return await simpleQuery(query);
    }


    async updateLogsFolderSettings(bIgnoreDuplicates, bIgnoreBots, minPlayers, minPlaytime, bImportAce, bUseACEPlayerHWID){

        const query = `UPDATE nstats_logs_folder SET 
        ignore_bots=?, 
        ignore_duplicates=?, 
        min_players=?, 
        min_playtime=?, 
        import_ace=?, 
        use_ace_player_hwid=? 
        WHERE id > -1`;

        await simpleQuery(query, [bIgnoreBots, bIgnoreDuplicates, minPlayers, minPlaytime, bImportAce, bUseACEPlayerHWID]);
    }


    async clearTables(){

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
            "map_items",
            "map_items_locations",
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
            "player_telefrags",
            "player_weapon_totals",
            "player_weapon_best",
            "tele_frags"
        ];

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const query = `TRUNCATE ${prefix}${t}`;
            await simpleQuery(query);
        }

    }
}
