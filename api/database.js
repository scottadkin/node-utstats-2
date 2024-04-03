const mysql = require("mysql2/promise"); //MYSQL2 CAUSING BUILD ERROR?
const config = require( "../config.json");

const pool = mysql.createPool({
    "host": config.mysql.host,
    "user": config.mysql.user,
    "password": config.mysql.password,
    "database": config.mysql.database
});



class Test{

    constructor(){

        this.init();
    }

    async init(){
        this.connection = await pool.getConnection();
    }


    async simpleQuery(query, vars){

        if(query === undefined) throw new Error("No query specified.");
        
        if(vars === undefined){

            const [result] = await this.connection.query(query);
            return result;
        }

        const [result] = await this.connection.query(query, vars);     
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

module.exports = Database;
