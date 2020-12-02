const Promise = require('promise');
const mysql = require('./database');

class Spawns{

    constructor(){

    }

    getMapSpawns(id){

        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            const query = "SELECT * FROM nstats_map_spawns WHERE map=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
                
            });
        });
    }

    getTotalMapSpawns(id){

        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            const query = "SELECT COUNT(*) as spawns FROM nstats_map_spawns WHERE map=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                resolve(result[0].spawns);
            });
        });
    }

    insert(name, map, x, y, z, spawns){

        return new Promise((resolve, reject) =>{

            name = name.toLowerCase();

            const query = "INSERT INTO nstats_map_spawns VALUES(NULL,?,?,?,?,?,?)";

            mysql.query(query, [name, map, x, y, z, spawns], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    update(name, map, spawns){

        return new Promise((resolve, reject) =>{

            name = name.toLowerCase();

            const query = "UPDATE nstats_map_spawns SET spawns=spawns+? WHERE name=? AND map=?";

            mysql.query(query, [spawns, name, map], (err, result) =>{

                if(err) reject(err);

                resolve(result);
            });
        });
    }
}


module.exports = Spawns;