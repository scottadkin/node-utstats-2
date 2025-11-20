import { simpleQuery, mysqlGetAllTableNames, mysqlGetColumns, bulkInsert } from "./database.js";
import fs from "fs";
import JSZip from "jszip";
import { readdir } from 'node:fs/promises';
import { toMysqlDate } from "./generic.mjs";


function columnsToArray(columns){

    const rows = [];
    
    for(let i = 0; i < columns.length; i++){
        
        const data = [];

        for(let value of Object.values(columns[i])){

            if(typeof value != "string" && typeof value != "number"){
                console.log(typeof value);
                console.log(value);
            }

            if(typeof value === "object"){

                value = toMysqlDate(value);
            }

            data.push(value);
        }

        rows.push(data);
    }

    return rows;
}

export async function createBackup(){

    const zip = new JSZip();

    const names = await mysqlGetAllTableNames();

    for(let i = 0; i < names.length; i++){

        const currentColumns = await mysqlGetColumns(names[i]);

        const currentJSON = {
            "columns": currentColumns,
            "rows": []
        };

        const a = await simpleQuery(`SELECT ${currentColumns.toString()} FROM ${names[i]}`);
        

      
        currentJSON.rows = columnsToArray(a);
   
        zip.file(`${names[i]}.json`, JSON.stringify(currentJSON));
    }


    const now = new Date();

    const year = now.getFullYear();
    let month = now.getMonth() + 1;
    let date = now.getDate();
    

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    if(month < 10) month = `0${month}`;
    if(date < 10) date = `0${date}`;
    if(hours < 10) hours = `0${hours}`;
    if(minutes < 10) minutes = `0${minutes}`;
    if(seconds < 10) seconds = `0${seconds}`;

    const fileName = `./backups/backup-${year}-${month}-${date}-${hours}-${minutes}-${seconds}.zip`;

    zip
    .generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fs.createWriteStream(fileName))
    .on('finish', function () {
        // JSZip generates a readable stream with a "end" event,
        // but is piped here in a writable stream which emits a "finish" event.
        console.log(`${fileName} zip created.`);
    });


    return fileName;
}


async function resetTable(table){

    console.log(`TRUNCATE ${table}`);

    return await simpleQuery(`TRUNCATE ${table}`);
}


async function restoreTable(table, columns, rows){

    await resetTable(table);

    const query = `INSERT INTO ${table} (${columns.toString()}) VALUES ?`;

    console.log(query);

    return await bulkInsert(query, rows);
}

export async function restoreDatabaseFromFile(fileName){

    const targetFile = fs.readFileSync(`./backups/${fileName}`);

    const zip = await JSZip.loadAsync(targetFile);

    const fileList = Object.keys(zip.files);

    for(let i = 0; i < fileList.length; i++){

        const file = zip.files[fileList[i]];

        let data = await file.async('string');

        data = JSON.parse(data);

        const reg = /^(.+)\.json$/i;

        const regResult = reg.exec(file.name);

        if(regResult === null) throw new Error(`Unexpected file found ${file.name}`);
        
        const {columns, rows} = data;
    
        await restoreTable(regResult[1], columns, rows);
    }  
}


export async function getBackupList(){

    const files = await readdir("./backups/");

    const found = [];

    const reg = /^backup-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.zip$/i;

    for(let i = 0; i < files.length; i++){

        const f = files[i];

        if(reg.test(f)) found.push(f);

    }

    found.sort((a, b) =>{
        a = a.toLowerCase();
        b = b.toLowerCase();

        if(a < b) return 1;
        if(a > b) return -1;
        return 0;
    });

    return found;
}

export async function restoreFrom(){

    //get list of nstats_xxx.json files in folder restore-from
    //trunicate each of the found tables
    //bulk insert found data
}