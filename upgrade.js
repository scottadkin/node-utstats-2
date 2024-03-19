const mysql = require("./api/database.js");
const Message = require("./api/message.js");
const config = require("./config.json");


async function bColumnExists(table, column){

    const query = `SELECT COUNT(*) as total_results FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?`;

    const result = await mysql.simpleQuery(query, [config.mysql.database, table, column]);

    if(result[0].total_results >= 1) return true;

    return false;
}

async function removeColumn(table, column){

    if(!await bColumnExists(table, column)) return;

    const query = `ALTER TABLE ${table} DROP ${column}`;

    new Message(query, "note");

    return await mysql.simpleQuery(query);
}


async function updateSessionTable(){

    await removeColumn("nstats_sessions", "created");
    await removeColumn("nstats_sessions", "expires");
}


async function main(){

    new Message(`--------------------------------------------------------`,"note");
    new Message(`Node UTStats 2 Upgrade`,"note");
    new Message(`--------------------------------------------------------`,"note");
    new Message(`This upgrade only supports version above v2.14.0`, "note");
    new Message(`--------------------------------------------------------`,"note");

    try{

        await updateSessionTable();

    }catch(err){
        console.trace(err);
    }

    process.exit();
}


main();