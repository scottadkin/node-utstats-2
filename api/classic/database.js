const mysql = require("mysql");
const Promise = require("promise");


const Database = mysql.createPool({
    "host": "192.168.0.12",
    "user": "Scott",
    "password": "password",
    "database": "utstats"
});


Database.simpleQuery = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined){

            Database.query(query, (err, result) =>{
    
                if(err) reject(err);
    
                console.log(result);
                
                resolve(result);
            });

        }else{
          
            Database.query(query, vars, (err, result) =>{
    
                if(err) reject(err);
    
                console.log(result);
                resolve(result);
            });
        }

    });

}


export default Database;