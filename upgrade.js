const mysql = require('./api/database');
const Message = require('./api/message');
const config = require('./config.json');


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
        

        process.exit(0);

    }catch(err){
        console.trace(err);
    }


})();