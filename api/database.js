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

module.exports = Database;