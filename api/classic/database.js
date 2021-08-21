const mysql = require("mysql");
const Promise = require("promise");
const config = require('../../config.json');


const Database = mysql.createPool({
    "host": config.classic.mysql.host,
    "user": config.classic.mysql.user,
    "password": config.classic.mysql.password,
    "database": config.classic.mysql.database,
    "port": config.classic.mysql.port
});


Database.simpleQuery = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined){

            Database.query(query, (err, result) =>{
    
                if(err) reject(err);
                
                resolve(result);
            });

        }else{
          
            Database.query(query, vars, (err, result) =>{
    
                if(err) reject(err);
    
                resolve(result);
            });
        }

    });

}


export default Database;