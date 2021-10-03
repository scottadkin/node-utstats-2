const mysql = require('mysql');
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

Database.simpleInsert = (query, vars) =>{

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

Database.insertReturnInsertId = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined){

            Database.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result.insertId);
                }

                resolve(-1);

            });

        }else{

            Database.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result.insertId);
                }

                resolve(-1);
            });
        }
    });
}

Database.updateReturnAffectedRows = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined){

            Database.query(query, (err, result) =>{

                if(err){
                    console.trace(err);
                    reject(err);
                    return;
                }

                if(result !== undefined){
                    resolve(result.affectedRows);
                    return;
                }

                resolve(0);

            });

        }else{

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
        }
    });
}


Database.simpleQuery = (query, vars) =>{

    return new Promise((resolve, reject) =>{

        if(vars === undefined){

            Database.query(query, (err, result) =>{

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
        }else{

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
        }

    });
    
}

module.exports = Database;