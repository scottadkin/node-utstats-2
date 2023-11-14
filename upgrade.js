const mysql = require('./api/database');
const Message = require('./api/message');
const config = require('./config.json');
const Players = require("./api/players");


async function columnExists(table, column){

    const query = `SELECT COUNT(*) as total_results FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?`;

    const vars = [config.mysql.database, table, column];
    
    const result = await mysql.simpleQuery(query, vars);

    if(result.length > 0){

        if(result[0].total_results > 0) return true;
    }

    return false;
}

async function alterTable(table, column, datatype, after){

    if(await columnExists(table, column)){
        new Message(`${table} already has the column ${column}.`,"pass");
        return;
    }
    
    if(after === undefined) after = "";

    const query = `ALTER TABLE ${table} ADD COLUMN ${column} ${datatype} ${after}`;

    await mysql.simpleQuery(query);
    new Message(query, "pass");
}

async function changeColumnName(table, oldName, newName){

    //RENAME COLUMN old_column_name TO new_column_name;
    const query = `ALTER TABLE ${table} RENAME COLUMN ${oldName} TO ${newName}`;

    await mysql.simpleQuery(query);
}

async function changeColumnType(table, columnName, newColumnType){

    const query = `ALTER TABLE ${table} MODIFY ${columnName} ${newColumnType}`;

    await mysql.simpleQuery(query);
}

async function bSettingExist(category, name){

    const query = `SELECT COUNT(*) as total_rows FROM nstats_site_settings WHERE category=? AND name=?`;

    const result = await mysql.simpleQuery(query, [category, name]);

    if(result[0].total_rows > 0) return true;

    return false;
}

async function updatePlayerTotals(){

    const table = "nstats_player_totals";

    new Message(`Starting update of ${table}.`,"note");

    await alterTable(table, "map", "INT(11) NOT NULL", "AFTER gametype");
    await alterTable(table, "team_0_playtime", "float NOT NULL", "AFTER playtime");
    await alterTable(table, "team_1_playtime", "float NOT NULL", "AFTER team_0_playtime");
    await alterTable(table, "team_2_playtime", "float NOT NULL", "AFTER team_1_playtime");
    await alterTable(table, "team_3_playtime", "float NOT NULL", "AFTER team_2_playtime");
    await alterTable(table, "spec_playtime", "float NOT NULL", "AFTER team_3_playtime");

    new Message(`Updated table ${table}.`,"pass");
}

async function updatePlayerWeaponsMatch(){

    const table = "nstats_player_weapon_match";

    new Message(`Starting update of ${table}.`,"note");

    await alterTable(table, "map_id", "INT NOT NULL", "AFTER match_id");
    await alterTable(table, "gametype_id", "INT NOT NULL", "AFTER map_id");
    await alterTable(table, "best_kills", "INT NOT NULL", "AFTER kills");
    await alterTable(table, "suicides", "INT NOT NULL", "AFTER deaths");
    await alterTable(table, "team_kills", "INT NOT NULL", "AFTER suicides");
    await alterTable(table, "best_team_kills", "INT NOT NULL", "AFTER team_kills");

    new Message(`Updated table ${table}.`,"pass");
}

async function updatePlayerWeaponsTotals(){

    const table = "nstats_player_weapon_totals";

    new Message(`Starting update of ${table}.`,"note");

    //await alterTable(table, "total_matches", "INT NOT NULL", "AFTER gametype");
    await alterTable(table, "playtime", "FLOAT NOT NULL", "AFTER gametype");
    await alterTable(table, "map_id", "INT NOT NULL", "AFTER player_id");
    await alterTable(table, "team_kills", "INT NOT NULL", "AFTER kills");
    await alterTable(table, "suicides", "INT NOT NULL", "AFTER deaths");

    new Message(`Updated table ${table}.`,"pass");
}

async function createPlayerWeaponBest(){

    new Message(`Creating table nstats_player_weapon_best.`,"note");

    const query = `CREATE TABLE IF NOT EXISTS nstats_player_weapon_best (
        id int(11) NOT NULL AUTO_INCREMENT,
        player_id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        gametype_id int(11) NOT NULL,
        weapon_id int(11) NOT NULL,
        kills int(11) NOT NULL,
        kills_best_life int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        team_kills_best_life int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        efficiency int(11) NOT NULL,
        accuracy float NOT NULL,
        shots int(11) NOT NULL,
        hits int(11) NOT NULL,
        damage bigint NOT NULL,
      PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

    return await mysql.simpleQuery(query);
}

async function addTeleFrags(){

    const matchTable = "nstats_player_matches";

    new Message(`Adding telefrag columns to ${matchTable}`,"note");

    await alterTable(matchTable, "telefrag_kills", "INT NOT NULL", "AFTER mh_deaths");
    await alterTable(matchTable, "telefrag_deaths", "INT NOT NULL", "AFTER telefrag_kills");
    await alterTable(matchTable, "telefrag_best_spree", "INT NOT NULL", "AFTER telefrag_deaths");
    await alterTable(matchTable, "telefrag_best_multi", "INT NOT NULL", "AFTER telefrag_best_spree");
    await alterTable(matchTable, "tele_disc_kills", "INT NOT NULL", "AFTER telefrag_best_multi");
    await alterTable(matchTable, "tele_disc_deaths", "INT NOT NULL", "AFTER tele_disc_kills");
    await alterTable(matchTable, "tele_disc_best_spree", "INT NOT NULL", "AFTER tele_disc_deaths");
    await alterTable(matchTable, "tele_disc_best_multi", "INT NOT NULL", "AFTER tele_disc_best_spree");


    new Message(`Updated table ${matchTable}.`,"pass");

    /*const totalsTable = "nstats_player_totals";

    new Message(`Adding telefrag columns to ${totalsTable}`,"note");

    await alterTable(totalsTable, "telefrag_kills", "INT NOT NULL", "AFTER mh_deaths_worst");
    await alterTable(totalsTable, "telefrag_kills_best", "INT NOT NULL", "AFTER telefrag_kills");
    await alterTable(totalsTable, "telefrag_deaths", "INT NOT NULL", "AFTER telefrag_kills_best");
    await alterTable(totalsTable, "telefrag_deaths_worst", "INT NOT NULL", "AFTER telefrag_deaths");
    await alterTable(totalsTable, "telefrag_best_spree", "INT NOT NULL", "AFTER telefrag_deaths_worst");
    await alterTable(totalsTable, "telefrag_best_multi", "INT NOT NULL", "AFTER telefrag_best_spree");
    await alterTable(totalsTable, "tele_disc_kills", "INT NOT NULL", "AFTER telefrag_best_multi");
    await alterTable(totalsTable, "tele_disc_kills_best", "INT NOT NULL", "AFTER tele_disc_kills");
    await alterTable(totalsTable, "tele_disc_deaths", "INT NOT NULL", "AFTER tele_disc_kills_best");
    await alterTable(totalsTable, "tele_disc_deaths_worst", "INT NOT NULL", "AFTER tele_disc_deaths");
    await alterTable(totalsTable, "tele_disc_best_spree", "INT NOT NULL", "AFTER tele_disc_deaths_worst");
    await alterTable(totalsTable, "tele_disc_best_multi", "INT NOT NULL", "AFTER tele_disc_best_spree");

    new Message(`Updated table ${totalsTable}.`,"pass");*/
}


async function createTeleFragTables(){

    const queries = [
        `CREATE TABLE IF NOT EXISTS nstats_tele_frags(
            id int(11) NOT NULL AUTO_INCREMENT,
            match_id INT(11) NOT NULL,
            map_id INT(11) NOT NULL,
            gametype_id INT(11) NOT NULL,
            timestamp float NOT NULL,
            killer_id INT(11) NOT NULL,
            killer_team INT(3) NOT NULL,
            victim_id INT(11) NOT NULL,
            victim_team INT(3) NOT NULL,
            disc_kill TINYINT(1) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS nstats_player_telefrags(
            id int(11) NOT NULL AUTO_INCREMENT,
            player_id INT(11) NOT NULL,
            map_id INT(11) NOT NULL,
            gametype_id INT(11) NOT NULL,
            playtime FLOAT NOT NULL,
            total_matches INT(11) NOT NULL,
            tele_kills INT(11) NOT NULL,
            tele_deaths INT(11) NOT NULL,
            tele_efficiency FLOAT NOT NULL,
            best_tele_kills INT(11) NOT NULL,
            worst_tele_deaths INT(11) NOT NULL,
            best_tele_multi INT(11) NOT NULL,
            best_tele_spree INT(11) NOT NULL,
            disc_kills INT(11) NOT NULL,
            disc_deaths INT(11) NOT NULL,
            disc_efficiency FLOAT NOT NULL,
            best_disc_kills INT(11) NOT NULL,
            worst_disc_deaths INT(11) NOT NULL,
            best_disc_multi INT(11) NOT NULL,
            best_disc_spree INT(11) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    for(let i = 0; i < queries.length; i++){
        const query = queries[i];
        await mysql.simpleQuery(query);
    }
}

async function updateSiteSettings(){

    const query = `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Telefrag Stats","true",18)`;

    if(!await bSettingExist("Match Pages", "Display Telefrag Stats")){
        await mysql.simpleQuery(query);
    }

    const query2 = `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Telefrag Stats","true",10)`;

    if(!await bSettingExist("Player Pages", "Display Telefrag Stats")){
        await mysql.simpleQuery(query2);
    }

    const query3 = `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Popular Countries Display Type",0,999999)`;

    if(!await bSettingExist("Home", "Popular Countries Display Type")){
        await mysql.simpleQuery(query3);
    }

    const query4 = `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Popular Countries Display Limit",5,999999)`;

    if(!await bSettingExist("Home", "Popular Countries Display Limit")){
        await mysql.simpleQuery(query4);
    }

    const query5 = `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Map Stats","true",999999)`;

    if(!await bSettingExist("Player Pages", "Display Map Stats")){
        await mysql.simpleQuery(query5);
    }

    const query6 = `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Win Rates","true",999995)`;

    if(!await bSettingExist("Player Pages", "Display Win Rates")){
        await mysql.simpleQuery(query6);
    }

    const query7 = `INSERT INTO nstats_site_settings VALUES(NULL,"Servers Page","Default Display Type",0,0)`;

    if(!await bSettingExist("Servers Pages", "Default Display Type")){
        await mysql.simpleQuery(query7);
    }
}


async function updateWinrateTables(){

    const table1 = "nstats_winrates";
    const table2 = "nstats_winrates_latest";

    await alterTable(table1, "map", "INT NOT NULL", "AFTER gametype");
    await alterTable(table2, "map", "INT NOT NULL", "AFTER gametype");
}

async function createMapItemTables(){


    const queries = [
        `CREATE TABLE IF NOT EXISTS nstats_map_items_locations(
        id BIGINT NOT NULL AUTO_INCREMENT,
        map_id int(11) NOT NULL,
        match_id int(11) NOT NULL,
        item_id int(11) NOT NULL,
        item_name varchar(100) NOT NULL,
        pos_x float NOT NULL,
        pos_y float NOT NULL,
        pos_z float NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS nstats_map_items(
        id int(11) NOT NULL AUTO_INCREMENT,
        item_class varchar(100) NOT NULL,
        item_type varchar(20) NOT NULL,
        item_image varchar(100) NOT NULL,
        item_display_name varchar(100) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    for(let i = 0; i < queries.length; i++){

        const q = queries[i];
        await mysql.simpleQuery(q);
    }
  
}

async function updateKillsTable(){

    const table = "nstats_kills";

    await changeColumnType(table, "id", "bigint AUTO_INCREMENT");

    await alterTable(table, "killer_x", "float NOT NULL", "AFTER distance");
    await alterTable(table, "killer_y", "float NOT NULL", "AFTER killer_x");
    await alterTable(table, "killer_z", "float NOT NULL", "AFTER killer_y");

    await alterTable(table, "victim_x", "float NOT NULL", "AFTER killer_z");
    await alterTable(table, "victim_y", "float NOT NULL", "AFTER victim_x");
    await alterTable(table, "victim_z", "float NOT NULL", "AFTER victim_y");
}


async function createQueryTables(){

    const queries = [
        `CREATE TABLE IF NOT EXISTS nstats_server_query(
            id int(11) NOT NULL AUTO_INCREMENT,
            ip varchar(100) NOT NULL,
            port int(11) NOT NULL,
            last_response int(11) NOT NULL,
            server_name varchar(100) NOT NULL,
            gametype_name varchar(100) NOT NULL,
            map_name varchar(100) NOT NULL,
            current_players int(3) NOT NULL,
            max_players int(3) NOT NULL,
            PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    
            `CREATE TABLE IF NOT EXISTS nstats_server_query_history(
            id int(11) NOT NULL AUTO_INCREMENT,
            server int(11) NOT NULL,
            timestamp int(11) NOT NULL,
            player_count int(3) NOT NULL,
            map_id int(11) NOT NULL,
            PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      
            `CREATE TABLE IF NOT EXISTS nstats_server_query_maps(
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

            `CREATE TABLE IF NOT EXISTS nstats_server_query_players(
            id int(11) NOT NULL AUTO_INCREMENT,
            server int(11) NOT NULL,
            timestamp int(11) NOT NULL,
            name varchar(30) NOT NULL,
            face varchar(100) NOT NULL,
            country varchar(2) NOT NULL,
            team int(3) NOT NULL,
            ping int(11) NOT NULL,
            time int(11) NOT NULL,
            frags int(11) NOT NULL,
            deaths int(11) NOT NULL,
            spree int(11) NOT NULL, 
            PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
    ];

    for(let i = 0; i < queries.length; i++){

        const q = queries[i];
        await mysql.simpleQuery(q);
    }
}


async function fixACETables(){

    const table = "nstats_ace_kicks";

    await changeColumnType(table, "game_version", "varchar(100) NOT NULL");
    //nstats_ace_sshot_requests
    await changeColumnType("nstats_ace_sshot_requests", "game_version", "varchar(100) NOT NULL");
}

(async () =>{

    try{

        new Message("Node UTStats 2 Upgrade", "note");
        new Message("There is no upgrading from the previous version(2.6 & 2.7.X)","warning");
        new Message("You have to do a fresh install.", "warning");

        await updatePlayerTotals();
        
        await updatePlayerWeaponsMatch();
        await updatePlayerWeaponsTotals();
        await createPlayerWeaponBest();
        await addTeleFrags();
        await createTeleFragTables();
        await updateSiteSettings();

        if(!await columnExists("nstats_ctf_caps", "gametype_id")){
            await alterTable("nstats_ctf_caps", "gametype_id", "INT NOT NULL", "AFTER match_id");
        }

        await updateWinrateTables();
        
        //const p = new Players();
        //new Message(`Recalculating player total records, this may take a while.`,"note");
        //await p.recalculateAllPlayerMapGametypeRecords();


        await alterTable("nstats_matches", "match_hash", "varchar(32) NOT NULL", "AFTER id");


        await alterTable("nstats_gametypes", "auto_merge_id", "int(11) NOT NULL", "AFTER playtime");


        await createMapItemTables();

        await updateKillsTable();

        //await createQueryTables();

        await fixACETables();

        //import_as_id int(11) NOT NULL
        await alterTable("nstats_maps", "import_as_id", "int(11) NOT NULL", "AFTER playtime");

        process.exit(0);

    }catch(err){
        console.trace(err);
    }


})();