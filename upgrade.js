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


async function updateCapsTable(){

    const table = "nstats_ctf_caps";

    const coverExists = await columnExists(table, "self_covers");
    const coverTimesExists = await columnExists(table, "self_covers_times");

    if(coverExists && coverTimesExists){

        new Message(`TABLE ${table} does not need to be updated.`,"pass");

    }else{

        if(!coverExists){
            await alterTable(table, "self_covers", "text NOT NULL");
        }

        if(!coverTimesExists){
            await alterTable(table, "self_covers_times", "text NOT NULL");
        }

    }
}

async function updateSiteSettings(){

    const query = "SELECT category, name FROM nstats_site_settings";

    const result = await mysql.simpleFetch(query);

    const currentSettings = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(currentSettings[r.category] === undefined){
            currentSettings[r.category] = [];
        }

        currentSettings[r.category].push(r.name);
    }

    const queries = [
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Mutators","true")`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Time Limit","true")`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Target Score","true")`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Minimum Players","0")`,
        `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Minimum Playtime","0")`,
    ];

    const reg = /^.+,"(.+?)","(.+?)",.+$/i;

    for(let i = 0; i < queries.length; i++){

        const q = queries[i];

        const result = reg.exec(q);

        if(result !== null){

            if(currentSettings[result[1]].indexOf(result[2]) === -1){
                await mysql.simpleUpdate(q);
                new Message(`GerneralQuery ${i+1} of ${queries.length} completed.`,"pass");
            }else{
                new Message(`GerneralQuery ${i+1} of ${queries.length} did not need to be updated.`,"pass");
            }
        }
    }
}

(async () =>{

    try{

        new Message("Database Upgrade", "note");

        await updateFTPTable();
        await updateCapsTable();
        await updateSiteSettings();

        process.exit(0);

    }catch(err){
        console.trace(err);
    }


})();