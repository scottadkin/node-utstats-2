const mysql = require('./database');

class Servers{

    constructor(){}

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

    async insertServer(ip, port, name, date, playtime, country){

        const query = `INSERT INTO nstats_servers VALUES(NULL,?,?,?,?,?,1,?,"","","",?,0,0)`;
        const vars = [name, ip, port, date, date, playtime, country];

        return await mysql.simpleQuery(query, vars);
    }

    async updateServer(ip, port, name, date, playtime, country){

        try{

            date = parseInt(date);
            playtime = parseFloat(playtime);

            if(port !== port) throw new Error(`Port must be a valid integer.`);

            //If server doesn't exist create it
            if(!await this.updateBasicInfo(ip, port, name, 1, playtime, country)){
                await this.insertServer(ip, port, name, date, playtime, country);
            }

            const dates = await this.getFirstLast(ip, port);

            if(dates === null) throw new Error(`Dates for server were not found.`);

            await this.updateDate('first', ip, port, date, dates.first);
            await this.updateDate('last', ip, port, date, dates.last);
            


        }catch(err){
            console.trace(err);
        }
    }

    async updateBasicInfo(ip, port, name, matches, playtime, country){

        const query = `UPDATE nstats_servers SET
            name=?, playtime=playtime+?, matches=matches+?, country=?
            WHERE ip=? AND port=?`;
        
        const vars = [name, playtime, matches, country, ip, port];

        const result = await mysql.simpleQuery(query, vars);

        if(result.affectedRows > 0) return true;

        return false;
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


    async getServerId(ip, port){

        const query = "SELECT id FROM nstats_servers WHERE ip=? AND port=? LIMIT 1";

        const result = await mysql.simpleQuery(query, [ip, port]);

        if(result.length > 0){
            return result[0].id;
        }

        return null;       
    }

    debugGetAllServers(){

        return new Promise((resolve, reject) =>{

            let servers = [];

            const query = "SELECT * FROM nstats_servers";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    servers = result;
                }
                resolve(servers);

            });
        });
    }

    async getName(id){

        const query = "SELECT name FROM nstats_servers WHERE id=?";

        const result = await mysql.simpleQuery(query, [id]);

        if(result.length > 0){
            return result[0].name;
        }

        return "Server not found";
    }

    async getNames(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,name FROM nstats_servers WHERE id IN(?)";
        const result = await mysql.simpleFetch(query, [ids]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = r.name;
        }

        return data;
    }

    async getAllNames(){

        const query = "SELECT id,name FROM nstats_servers";

        const result = await mysql.simpleQuery(query);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = r.name;
        }

        return data;
    }

    async reduceServerTotals(id, playtime){

        const query = "UPDATE nstats_servers SET matches=matches-1, playtime=playtime-? WHERE id=?";

        return await mysql.simpleQuery(query, [playtime, id]);
    }

    async reduceTotals(id, matches, playtime){

        await mysql.simpleUpdate("UPDATE nstats_servers SET matches=matches-?, playtime=playtime-? WHERE id=?",[matches, playtime, id]);
    }

    async reduceMultipleTotals(data){

        try{

            for(const [server, stats] of Object.entries(data)){

                await this.reduceTotals(parseInt(server), stats.matches, stats.playtime);
            }

        }catch(err){
            console.trace(err);
        }
    }


    async getAll(){

        const query = "SELECT * FROM nstats_servers ORDER BY name ASC";

        return await mysql.simpleQuery(query);
    }

    async setLastIds(serverId, matchId, mapId){

        const query = "UPDATE nstats_servers SET last_match_id=?, last_map_id=? WHERE id=?";

        return await mysql.simpleQuery(query, [matchId, mapId, serverId]);
    }

    async getDetails(serverId){

        const query = "SELECT * FROM nstats_servers WHERE id=?";

        const result = await mysql.simpleQuery(query, [serverId]);

        if(result.length > 0) return result[0];

        return null;
    }


    async getServerRecentPings(serverId, limit){

        const query = `SELECT id,date,gametype,map,ping_min_average,ping_average_average,ping_max_average
        FROM nstats_matches WHERE server=? ORDER BY date DESC LIMIT ?`;

        return await mysql.simpleQuery(query, [serverId, limit]);
    }
}

module.exports = Servers;