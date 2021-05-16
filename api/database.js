const mysql =  require('mysql');
const config = require( '../config.json');


const Database = mysql.createPool({
    "host": config.mysql.host,
    "user": config.mysql.user,
    "password": config.mysql.password,
    "database": config.mysql.database
});

Database.simpleFetch = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined){

            Database.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });

        }else{

            Database.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        }
    });
}

Database.simpleDelete = (query, vars) =>{

    return new Promise((resolve, reject) =>{
    
        if(vars === undefined){

            Database.query(query, (err) =>{

                if(err) reject(err);

                resolve();
            }); 

        }else{

            Database.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        }
    });
}

Database.simpleUpdate = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined){

            Database.query(query, (err) =>{

                if(err) reject(err);

                resolve();

            });

        }else{

            Database.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        }
    });
}

module.exports = Database;