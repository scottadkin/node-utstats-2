import { simpleQuery, mysqlGetAllTableNames, mysqlGetColumns } from "./database.js";
import fs from "fs";
import JSZip from "jszip";


function columnsToArray(columns){

    const rows = [];
    
    for(let i = 0; i < columns.length; i++){
        
        const data = [];

        for(const value of Object.values(columns[i])){

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
    const month = now.getMonth() + 1;
    const date = now.getDate();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

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