//const mysql = require("mysql2"); //MYSQL2 CAUSING BUILD ERROR?
/*const config = require( "../config.json");

const connection = mysql.createPool({
    "host": config.mysql.host,
    "user": config.mysql.user,
    "password": config.mysql.password,
    "database": config.mysql.database
});

class Test{

    constructor(){

        this.connection = connection;
    }


    async simpleQuery(query, vars){

        if(query === undefined) throw new Error("No query specified.");
        
        if(vars === undefined){

            const [result] = await connection.query(query);
            return result;
        }

        const [result] = await connection.query(query, vars);     
        return result;   
    }

    async simpleFetch(query, vars){

        return await this.simpleQuery(query, vars);
    }

    async simpleInsert(query, vars){

        return await this.simpleQuery(query, vars);
    }

    async simpleDelete(query, vars){
        
        return await this.simpleQuery(query, vars);
    }

    async simpleUpdate(query, vars){
        
        return await this.simpleQuery(query, vars);
    }

    async insertReturnInsertId(query, vars){

        const result = await this.simpleQuery(query, vars);
        return result.insertId;
    }

    async updateReturnAffectedRows(query, vars){
        const result = await this.simpleQuery(query, vars);
        return result.affectedRows;
    }


    async bulkInsert(query, vars, maxPerInsert){

        if(vars.length === 0) return;
        if(maxPerInsert === undefined) maxPerInsert = 100000;

        let startIndex = 0;

        if(vars.length < maxPerInsert){
            await connection.query(query, [vars]);
            return;
        }

        while(startIndex < vars.length){

            const end = (startIndex + maxPerInsert > vars.length) ? vars.length : startIndex + maxPerInsert;
            const currentVars = vars.slice(startIndex, end);
            await connection.query(query, [currentVars]);
            startIndex += maxPerInsert;
        }

        return;
    }

}

const Database = new Test();

module.exports = {};*/

const mysql = require('mysql');
const config = require( '../config.json');


const Database = mysql.createPool({
    "host": config.mysql.host,
    "user": config.mysql.user,
    "password": config.mysql.password,
    "database": config.mysql.database
});

Database.simpleFetch = async (query, vars) =>{

    return await Database.simpleQuery(query, vars);
}

Database.simpleDelete = async (query, vars) =>{

    return await Database.simpleQuery(query, vars);
}

Database.simpleUpdate = async (query, vars) =>{

    return await Database.simpleQuery(query, vars);
}

Database.simpleInsert = async (query, vars) =>{

    return await Database.simpleQuery(query, vars);
  
}

Database.insertReturnInsertId = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined) vars = [];

        Database.query(query, vars, (err, result) =>{

            if(err) reject(err);

            if(result !== undefined){
                resolve(result.insertId);
            }

            resolve(-1);
        });
        
    });
}

Database.updateReturnAffectedRows = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined) vars = [];
        
        Database.query(query, vars, (err, result) =>{

            if(err){
                console.trace(err);
                reject(err);
                return
            }

            if(result !== undefined){
                resolve(result.affectedRows);
                return;
            }

            resolve(0);
        });
        
    });
}


Database.simpleQuery = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined) vars = [];

        Database.query(query, vars, (err, result) =>{

            if(err){
                console.trace(err);
                reject(err);
                return;
            }

            if(result !== undefined){
                resolve(result);
                return;
            }

            resolve([]);
            return;
        });
    });  
}

Database.bulkInsert = (query, vars, maxPerInsert) =>{

    return new Promise(async (resolve, reject) =>{

        if(vars.length === 0){
            resolve();
            return;
        }

        if(maxPerInsert === undefined) maxPerInsert = 100000;

        let startIndex = 0;

        if(vars.length < maxPerInsert){
            await Database.simpleQuery(query, [vars]);
            resolve();
            return;
        }

        while(startIndex < vars.length){

            const end = (startIndex + maxPerInsert > vars.length) ? vars.length : startIndex + maxPerInsert;
            const currentVars = vars.slice(startIndex, end);
            await Database.simpleQuery(query, [currentVars]);
            startIndex += maxPerInsert;
        }

        resolve();

    });
}


module.exports = Database;