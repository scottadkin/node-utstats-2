import mysql from './database.js';
import Promise from 'promise';

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

            //If server doesn't exist create it
            if(!await this.updateBasicInfo(ip, port, name, 1, playtime)){
                await this.insertServer(ip, port, name, date, playtime);
            }

            const dates = await this.getFirstLast(ip, port);

            if(dates === null) throw new Error(`Dates for server were not found.`);

            await this.updateDate('first', ip, port, date, dates.first);
            await this.updateDate('last', ip, port, date, dates.last);
            


        }catch(err){
            console.trace(err);
        }
    }

    updateBasicInfo(ip, port, name, matches, playtime){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_servers SET
            name=?, playtime=playtime+?, matches=matches+?
            WHERE ip=? AND port=?`;

            mysql.query(query, [name, playtime, matches, ip, port], (err, result) =>{

                if(err) reject(err);

                if(result.changedRows > 0){
                    resolve(true);
                }
                //console.log(result);

                resolve(false);
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

    deleteServer(ip, port){

        return new Promise((resolve, reject) =>{

            port = parseInt(port);

            if(port !== port) reject(`Port must be a valid integer.`);

            const query = "DELETE FROM nstats_servers WHERE ip=? AND port=?";

            mysql.query(query, [ip, port], (err, result) =>{

                if(err) reject(err);

                (result.affectedRows > 0) ? resolve(true) : resolve(false);


            });

        });
    }

    deleteServerById(id){

        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            if(id !== id) reject(`Id must be a valid integer.`);

            const query = "DELETE FROM nstats_servers WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                (result.affectedRows > 0) ? resolve(true) : resolve(false);       
                
            });

            
        });
    }
}

export default Servers;