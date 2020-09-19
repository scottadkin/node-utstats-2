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

    async updateServer(ip, port, name, date, playtime){

        try{

            date = parseInt(date);
            playtime = parseFloat(playtime);

            if(port !== port) throw new Error(`Port must be a valid integer.`);

            await this.updateBasicInfo(ip, port, name, playtime);

            const dates = await this.getFirstLast(ip, port);

            if(dates === null) throw new Error(`Dates for server were not found.`);

            await this.updateDate('first', ip, port, date, dates.first);
            await this.updateDate('last', ip, port, date, dates.last);
            


        }catch(err){
            console.trace(err);
        }
    }

    updateBasicInfo(ip, port, name, playtime){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_servers SET
            name=?, playtime=playtime+?
            WHERE ip=? AND port=?`;

            mysql.query(query, [name, playtime, ip, port], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getFirstLast(ip, port){

        return new Promise((resolve, reject) =>{

            const query = `SELECT first,last FROM nstats_servers WHERE ip=? AND port=? LIMIT 1`;

            mysql.query(query, [ip, port], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result !== []) resolve(result[0]);     
                }

                resolve(null);
            });
        });
    }

    updateDate(type, ip, port, current, previous){

        return new Promise((resolve, reject) =>{

            type = type.toLowerCase();

            if(type === 'first'){
                if(current >= previous){
                    resolve();
                }
            }else{
                type = 'last';
                if(current <= previous){
                    resolve();
                }
            }

            const query = `UPDATE nstats_servers SET ${type}=? WHERE ip=? AND port=?`;

            mysql.query(query, [current, ip, port], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}

module.exports = Servers;