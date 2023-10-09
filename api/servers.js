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
                    if(result.length > 0) resolve(result[0]);     
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


    async adminGetServerList(){

        const query = "SELECT * FROM nstats_servers ORDER BY name ASC";

        return await mysql.simpleQuery(query);
    }


    async bServerIDExist(serverId){

        serverId = parseInt(serverId);

        if(serverId !== serverId) throw new Error("ServerID must be a valid integer.");

        const query = "SELECT COUNT(*) as total_servers FROM nstats_servers WHERE id=?";

        const result = await mysql.simpleQuery(query, [serverId]);

        if(result[0].total_servers > 0) return true;

        return false;
    }


    async adminUpdateServer(serverId, serverName, serverIP, serverPort, serverPassword){  


        if(!await this.bServerIDExist(serverId)) throw new Error(`There are no servers with the id of ${serverId}`);

        const query = `UPDATE nstats_servers SET name=?,ip=?,port=?,password=? WHERE id=?`;

        serverPort = parseInt(serverPort);
        if(serverPort !== serverPort) throw new Error("ServerPort must be a valid integer.");

        const result = await mysql.simpleQuery(query, [serverName, serverIP, serverPort, serverPassword, serverId]);

        if(result.affectedRows !== 0) return true;

        return false;
    }


    async adminDeleteServerById(serverId){

        serverId = parseInt(serverId);

        if(serverId !== serverId) throw new Error("Server ID must be a valid integer.");

        const query = `DELETE FROM nstats_servers WHERE id=?`;

        return await mysql.simpleQuery(query, [serverId]);
    }

    async getQueryList(){

        const query = `SELECT * FROM nstats_server_query`;

        return await mysql.simpleQuery(query);
    }

    async setQueryStats(ip, port, name, gametype, map, currentPlayers, maxPlayers){

        const query = `UPDATE nstats_server_query SET 
        last_response=?,
        server_name=?,
        gametype_name=?,
        map_name=?,
        current_players=?,
        max_players=? 
        WHERE ip=? AND port=?`;

        const now = Math.floor(Date.now() * 0.001);
        return await mysql.simpleQuery(query, [now, name, gametype, map, currentPlayers, maxPlayers, ip, port]);
    }

    async getQueryId(ip, port){

        const query = `SELECT id FROM nstats_server_query WHERE ip=? AND port=?`;

        const result = await mysql.simpleQuery(query, [ip, port]);

        if(result.length > 0) return result[0].id;

        return null;
    }

    async createQueryMapId(mapName){

        const query = `INSERT INTO nstats_server_query_maps VALUES(NULL,?)`;

        const result = await mysql.simpleQuery(query, [mapName]);

        return result.insertId;
    }

    async getQueryMapId(mapName){

        const query = `SELECT id FROM nstats_server_query_maps WHERE name=?`;

        const result = await mysql.simpleQuery(query, [mapName]);

        if(result.length === 0){
            return this.createQueryMapId(mapName);
        }

        return result[0].id;
    }

    async getQueryMapNames(mapIds){

        if(mapIds.length === 0) return {};

        const query = `SELECT id,name FROM nstats_server_query_maps WHERE id IN(?)`;

        const result = await mysql.simpleQuery(query, [mapIds]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            data[r.id] = r.name;
        }

        return data;
    }

    async insertQueryHistory(ip, port, timestamp, currentPlayers, mapName){

        const id = await this.getQueryId(ip, port);

        if(id === null){
            console.trace(`There is no server with the address of ${ip}:${port}`);
            return;
        }

        const mapId = await this.getQueryMapId(mapName);

        const query = `INSERT INTO nstats_server_query_history VALUES(NULL,?,?,?,?)`;

        return await mysql.simpleQuery(query, [id, timestamp, currentPlayers, mapId]);
    }


    /**
     * Get the previous 24 hours data for all servers in the database
     */
    async getQueryPlayerCountHistory(){

        const query = `SELECT server,timestamp,player_count,map_id FROM nstats_server_query_history WHERE timestamp>? ORDER BY timestamp DESC`;

        const now = Math.floor(Date.now() * 0.001);
        const limit = now - 60 * 60 * 24;

        return await mysql.simpleQuery(query, [limit]);
    }

    async deletePreviousQueryPlayers(serverId){

        const query = `DELETE FROM nstats_server_query_players WHERE server=?`;

        return await mysql.simpleQuery(query, [serverId]);

    }

    async insertQueryPlayers(serverId, players){

        const timestamp = Math.floor(Date.now() * 0.001);

        console.log(`serverId = ${serverId}`);
        console.log(players);

        await this.deletePreviousQueryPlayers(serverId);

        const vars = [];

        for(const [playerId, player] of Object.entries(players)){

            vars.push([
                serverId, 
                timestamp, 
                player.name ?? "Not Found",
                player.face ?? "N/A", 
                player.countryc ?? "xx", 
                player.team ?? 0,
                player.ping ?? 0,
                player.time ?? 0,
                player.frags ?? 0,
                player.deaths ?? 0,
                player.spree ?? 0
            ]);
        }

        const query = `INSERT INTO nstats_server_query_players (server,timestamp,name,face,country,team,ping,time,frags,deaths,spree) VALUES ?`;
        await mysql.bulkInsert(query, vars);
    }
}

module.exports = Servers;