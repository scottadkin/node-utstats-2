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

    const [result, fields] = await Database.execute(query, vars);
    
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



export async function bulkInsert(query, vars, maxPerInsert){

    if(vars.length === 0) return;

    if(maxPerInsert === undefined) maxPerInsert = 100000;

    let startIndex = 0;

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

    return;
}
