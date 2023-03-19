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

async function updatePlayerTotals(){

    new Message(`Starting update of nstats_player_totals.`,"note");
    await alterTable("nstats_player_totals", "team_0_playtime", "float NOT NULL", "AFTER playtime");
    await alterTable("nstats_player_totals", "team_1_playtime", "float NOT NULL", "AFTER team_0_playtime");
    await alterTable("nstats_player_totals", "team_2_playtime", "float NOT NULL", "AFTER team_1_playtime");
    await alterTable("nstats_player_totals", "team_3_playtime", "float NOT NULL", "AFTER team_2_playtime");
    await alterTable("nstats_player_totals", "spec_playtime", "float NOT NULL", "AFTER team_3_playtime");
    new Message(`Updated table nstats_player_totals.`,"pass");
}

(async () =>{

    try{

        new Message("Node UTStats 2 Upgrade", "note");
        new Message("There is no upgrading from the previous version(2.6 & 2.7.X)","warning");
        new Message("You have to do a fresh install.", "warning");

        await updatePlayerTotals();
        

        process.exit(0);

    }catch(err){
        console.trace(err);
    }


})();