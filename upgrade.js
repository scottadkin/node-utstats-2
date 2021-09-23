const mysql = require('./api/database');
const Message = require('./api/message');


async function columnExists(table, column){

    const query = `SELECT COUNT(*) as total_results FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME=? AND COLUMN_NAME=?`;

    const result = await mysql.simpleFetch(query, [table, column]);

    if(result.length > 0){

        if(result[0].total_results > 0) return true;
    }

    return false;
}

async function alterTable(table, column, datatype){

    const query = `ALTER TABLE ${table} ADD COLUMN ${column} ${datatype}`;

    await mysql.simpleUpdate(query);
}


async function updateFTPTable(){

    const table = "nstats_ftp";
    const minPlayersExists = await columnExists(table, "min_players");
    const minPlaytimeExists = await columnExists(table, "min_playtime");

    if(minPlayersExists && minPlaytimeExists){

        new Message(`TABLE ${table} does not need to be updated.`,"pass");

    }else{

        if(!minPlayersExists){
            await alterTable(table, "min_players", "INT(2) NOT NULL");
        }

        if(!minPlaytimeExists){
            await alterTable(table, "min_playtime", "INT(11) NOT NULL");
        }
    }
}

(async () =>{

    try{

        new Message("Database Upgrade", "note");

        await updateFTPTable();

        process.exit(0);

    }catch(err){
        console.trace(err);
    }


})();