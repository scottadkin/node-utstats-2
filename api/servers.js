const mysql = require('./database');
const Promise = require('promise');

class Servers{

    constructor(){

    }

    bServerExists(ip, port){

        return new Promise((resolve, reject) =>{

            port = parseInt(port);

            if(port !== port){
                reject(`Server Port must be a valid integer`);
            }

            const query = `SELECT COUNT(*) as total_servers FROM nstats_servers WHERE ip=? AND port=?`;

            mysql.query(query, [ip, port], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    
                    if(result[0].total_servers > 0){
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });
    }

    insertServer(ip, port, name, date, playtime){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_servers VALUES(NULL,?,?,?,?,?,1,?)";

            mysql.query(query, [name, ip, port, date, date, playtime], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateServer(ip, port, name, date, playtime){

        return new Promise((resolve, reject) =>{


            date = parseInt(date);
            playtime = parseFloat(playtime);

            const query = `UPDATE nstats_servers SET
            name=?, playtime=playtime+?
            WHERE ip=? AND port=?`;

            mysql.query(query, [name, playtime, ip, port], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}

module.exports = Servers;