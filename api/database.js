import mysql from "mysql2/promise";
import config from "../config.json" with { "type": "json"};

const Database = mysql.createPool({
    "host": config.mysql.host,
    "user": config.mysql.user,
    "password": config.mysql.password,
    "database": config.mysql.database
});

export async function simpleQuery(query, vars){

    if(vars === undefined) vars = [];

    const [result, fields] = await Database.query(query, vars);
    
    return result;
}


export async function updateReturnAffectedRows(query, vars){

    const data = await simpleQuery(query, vars);

    return data.affectedRows;
}


export async function insertReturnInsertId(query, vars){

    const data = await simpleQuery(query, vars);

    return data.insertId;
}

export function mysqlEscape(value){
    return Database.escape(value);
}

export async function bulkInsert(query, vars, maxPerInsert){

    if(vars.length === 0) return;

    if(maxPerInsert === undefined) maxPerInsert = 100000;

    let startIndex = 0;

    try{
        if(vars.length < maxPerInsert){
            await simpleQuery(query, [vars]);
            return;
        }

        while(startIndex < vars.length){

            const end = (startIndex + maxPerInsert > vars.length) ? vars.length : startIndex + maxPerInsert;
            const currentVars = vars.slice(startIndex, end);
            await simpleQuery(query, [currentVars]);
            startIndex += maxPerInsert;
        }
    }catch(err){
        console.trace(err);
    }

    return;
}


export async function mysqlGetColumns(table){

    const result = await simpleQuery(`SHOW COLUMNS FROM ${table}`);

    if(result.length === 0) return [];

    return result.map((r) =>{
        return r.Field;
    });
}

export async function mysqlGetAllTableNames(){

    const query = `SELECT name FROM INFORMATION_SCHEMA.INNODB_TABLES WHERE name LIKE ?`;
    const result = await simpleQuery(query, `${config.mysql.database}/%`);

    const names = [];

    const reg = /^.+\/(.+)$/i;

    for(let i = 0; i < result.length; i++){

        const r = result[i].name;

        const regResult = reg.exec(r);

        if(regResult === null) continue;

        names.push(regResult[1]);

    }

    return names;
}


export async function getAllTablesContainingColumns(columnNames){

    if(columnNames.length === 0) return [];

    const tableNames = await mysqlGetAllTableNames();

    const found = {};

    for(let i = 0; i < tableNames.length; i++){

        const t = tableNames[i];

        const columns = await simpleQuery(`SHOW COLUMNS FROM ${t}`);

        for(let x = 0; x < columns.length; x++){

            if(columnNames.indexOf(columns[x].Field) !== -1){

                if(found[t] === undefined) found[t] = columns[x].Field;
                break;
            }
        }
    }

    console.log(found);
    return found;
}