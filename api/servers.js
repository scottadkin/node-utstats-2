import { simpleQuery, bulkInsert } from "./database.js";


export default class Servers{

    constructor(){}

    async bServerExists(ip, port){

        port = parseInt(port);

        if(port !== port){
            throw new Error(`Server Port must be a valid integer`);
        }

        const query = `SELECT COUNT(*) as total_servers FROM nstats_servers WHERE ip=? AND port=?`;

        const result = await simpleQuery(query, [ip, port]);

        return result[0].total_servers > 0;   
    }

    async insertServer(/*ip, port,*/ name, date, playtime, country){

        const query = `INSERT INTO nstats_servers VALUES(NULL,?,"",7777,?,?,1,?,"","","",?,0,0)`;
        const vars = [name, /*ip, port,*/ date, date, playtime, country];

        return await simpleQuery(query, vars);
    }

    async updateServer(/*ip, port,*/ name, date, playtime, country){

        try{

            date = parseInt(date);
            playtime = parseFloat(playtime);

            //if(port !== port) throw new Error(`Port must be a valid integer.`);

            //If server doesn't exist create it
            if(!await this.updateBasicInfo(/*ip, port,*/ name, 1, playtime, country)){
                await this.insertServer(/*ip, port,*/ name, date, playtime, country);
            }

            const dates = await this.getFirstLast(name);

            if(dates === null) throw new Error(`Dates for server were not found.`);

            await this.updateDate('first', name, date, dates.first);
            await this.updateDate('last', name, date, dates.last);
            


        }catch(err){
            console.trace(err);
        }
    }

    async updateBasicInfo(/*ip, port,*/ name, matches, playtime, country){

        const query = `UPDATE nstats_servers SET
            name=?, playtime=playtime+?, matches=matches+?, country=?
            WHERE name=?`;
        
        const vars = [name, playtime, matches, country, name];

        const result = await simpleQuery(query, vars);

        if(result.affectedRows > 0) return true;

        return false;
    }

    async getFirstLast(name){

        const query = `SELECT first,last FROM nstats_servers WHERE name=? LIMIT 1`;

        const result = await simpleQuery(query, [name]);

        if(result.length === 0) return null;

        return result[0];
    }

    async updateDate(type, name, current, previous){

        type = type.toLowerCase();

        if(type === "first" && current >= previous) return;
        if(type === "last" && current <= previous) return
        
        const query = `UPDATE nstats_servers SET ${type}=? WHERE name=?`;

        await simpleQuery(query, [current, name]);
    }

    deleteServer(ip, port){

        return new Promise((resolve, reject) =>{

            port = parseInt(port);

            if(port !== port) reject(`Port must be a valid integer.`);

            const query = "DELETE FROM nstats_servers WHERE ip=? AND port=?";

            simpleQuery(query, [ip, port], (err, result) =>{

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

            simpleQuery(query, [id], (err, result) =>{

                if(err) reject(err);

                (result.affectedRows > 0) ? resolve(true) : resolve(false);       
                
            });      
        });
    }


    async getServerId(ip, port){

        const query = "SELECT id FROM nstats_servers WHERE ip=? AND port=? LIMIT 1";

        const result = await simpleQuery(query, [ip, port]);

        if(result.length > 0){
            return result[0].id;
        }

        return null;       
    }

    async getServerIdByName(name){

        const query = `SELECT id FROM nstats_servers WHERE LOWER(name)=?`;

        const result = await simpleQuery(query, [name.toLowerCase()]);
     
        if(result.length > 0) return result[0].id;
        return null;
    }

    async debugGetAllServers(){

        const query = "SELECT * FROM nstats_servers";

        return await simpleQuery(query);
    }

    async getName(id){

        const query = "SELECT name FROM nstats_servers WHERE id=?";

        const result = await simpleQuery(query, [id]);

        if(result.length > 0){
            return result[0].name;
        }

        return "Server not found";
    }

    async getNames(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,name FROM nstats_servers WHERE id IN(?)";
        const result = await simpleQuery(query, [ids]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = r.name;
        }

        return data;
    }

    async getAllNames(){

        const query = "SELECT id,name FROM nstats_servers";

        const result = await simpleQuery(query);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = r.name;
        }

        return data;
    }

    async reduceServerTotals(id, playtime){

        const query = "UPDATE nstats_servers SET matches=matches-1, playtime=playtime-? WHERE id=?";

        return await simpleQuery(query, [playtime, id]);
    }

    async reduceTotals(id, matches, playtime){

        await simpleQuery("UPDATE nstats_servers SET matches=matches-?, playtime=playtime-? WHERE id=?",[matches, playtime, id]);
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

        return await simpleQuery(query);
    }

    async setLastIds(serverId, matchId, mapId){

        const query = "UPDATE nstats_servers SET last_match_id=?, last_map_id=? WHERE id=?";

        return await simpleQuery(query, [matchId, mapId, serverId]);
    }

    async getDetails(serverId){

        const query = "SELECT * FROM nstats_servers WHERE id=?";

        const result = await simpleQuery(query, [serverId]);

        if(result.length > 0) return result[0];

        return null;
    }


    async getServerRecentPings(serverId, limit){

        const query = `SELECT id,date,gametype,map,ping_min_average,ping_average_average,ping_max_average
        FROM nstats_matches WHERE server=? ORDER BY date DESC LIMIT ?`;

        return await simpleQuery(query, [serverId, limit]);
    }


    async adminGetServerList(){

        const query = "SELECT * FROM nstats_servers ORDER BY name ASC";

        return await simpleQuery(query);
    }


    async bServerIDExist(serverId){

        serverId = parseInt(serverId);

        if(serverId !== serverId) throw new Error("ServerID must be a valid integer.");

        const query = "SELECT COUNT(*) as total_servers FROM nstats_servers WHERE id=?";

        const result = await simpleQuery(query, [serverId]);

        if(result[0].total_servers > 0) return true;

        return false;
    }


    async adminUpdateServer(serverId, serverName, serverIP, serverPort, serverPassword, country){  


        if(!await this.bServerIDExist(serverId)) throw new Error(`There are no servers with the id of ${serverId}`);

        const query = `UPDATE nstats_servers SET name=?,ip=?,port=?,password=?,country=? WHERE id=?`;

        if(serverPort !== ""){
            serverPort = parseInt(serverPort);
            if(serverPort !== serverPort) throw new Error("ServerPort must be a valid integer.");
        }else{
            serverPort = 7777;
        }

        const result = await simpleQuery(query, [serverName, serverIP, serverPort, serverPassword, country, serverId]);

        if(result.affectedRows !== 0) return true;

        return false;
    }


    async adminDeleteServerById(serverId){

        serverId = parseInt(serverId);

        if(serverId !== serverId) throw new Error("Server ID must be a valid integer.");

        const query = `DELETE FROM nstats_servers WHERE id=?`;

        return await simpleQuery(query, [serverId]);
    }


    async adminMergeServers(oldId, newId){

        oldId = parseInt(oldId);
        newId = parseInt(newId);

        if(oldId !== oldId || newId !== newId) throw new Error("Server ids must be valid intergers");

        const matchesQuery = `UPDATE nstats_matches SET server=? WHERE server=?`;
        await simpleQuery(matchesQuery, [newId, oldId]);

        const serversQuery = `SELECT * FROM nstats_servers WHERE id IN(?)`;
        const serversResult = await simpleQuery(serversQuery, [[oldId, newId]]);

        const totals = {};

        let master = null;

        for(let i = 0; i < serversResult.length; i++){

            const s = serversResult[i];

            if(s.id === newId){
                master = {...s};
            }

            if(i === 0){
                totals.first = s.first;
                totals.last = s.last;
                totals.matches = s.matches;
                totals.playtime = s.playtime;
                totals.lastMatchId = s.last_match_id;
                totals.lastMapId = s.last_map_id;
                continue;
            }

            totals.matches += s.matches;
            totals.playtime += s.playtime;

            if(s.last > totals.last){
                totals.last = s.last;
                totals.lastMatchId = s.last_match_id;
                totals.lastMapId = s.last_map_id;
            }
        }

        const updateQuery = `UPDATE nstats_servers SET first=?,last=?,matches=?,playtime=?,last_match_id=?,last_map_id=? WHERE id=?`;

        await simpleQuery(updateQuery, [
            totals.first, totals.last,
            totals.matches, totals.playtime, totals.lastMatchId, 
            totals.lastMapId, newId]
        );

        const deleteQuery = `DELETE FROM nstats_servers WHERE id=?`;
        await simpleQuery(deleteQuery, [oldId]);
    }

    async getQueryList(){

        const query = `SELECT * FROM nstats_server_query`;

        return await simpleQuery(query);
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
        return await simpleQuery(query, [now, name, gametype, map, currentPlayers, maxPlayers, ip, port]);
    }

    async getQueryId(ip, port){

        const query = `SELECT id FROM nstats_server_query WHERE ip=? AND port=?`;

        const result = await simpleQuery(query, [ip, port]);

        if(result.length > 0) return result[0].id;

        return null;
    }

    async createQueryMapId(mapName){

        const query = `INSERT INTO nstats_server_query_maps VALUES(NULL,?)`;

        const result = await simpleQuery(query, [mapName]);

        return result.insertId;
    }

    async getQueryMapId(mapName){

        const query = `SELECT id FROM nstats_server_query_maps WHERE name=?`;

        const result = await simpleQuery(query, [mapName]);

        if(result.length === 0){
            return this.createQueryMapId(mapName);
        }

        return result[0].id;
    }

    async getQueryMapNames(mapIds){

        if(mapIds.length === 0) return {};

        const query = `SELECT id,name FROM nstats_server_query_maps WHERE id IN(?)`;

        const result = await simpleQuery(query, [mapIds]);

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

        return await simpleQuery(query, [id, timestamp, currentPlayers, mapId]);
    }


    /**
     * Get the previous 24 hours data for all servers in the database
     */
    async getQueryPlayerCountHistory(){

        const query = `SELECT server,timestamp,player_count,map_id FROM nstats_server_query_history WHERE timestamp>? ORDER BY timestamp DESC`;

        const now = Math.floor(Date.now() * 0.001);
        const limit = now - 60 * 60 * 24;

        return await simpleQuery(query, [limit]);
    }

    async deletePreviousQueryPlayers(serverId){

        const query = `DELETE FROM nstats_server_query_players WHERE server=?`;

        return await simpleQuery(query, [serverId]);

    }

    async insertQueryPlayers(serverId, players){

        const timestamp = Math.floor(Date.now() * 0.001);

        console.log(`serverId = ${serverId}`);
        console.log(players);

        await this.deletePreviousQueryPlayers(serverId);

        const vars = [];

        for(const player of Object.values(players)){

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
        await bulkInsert(query, vars);
    }

    async getCurrentQueryPlayers(){

        const query = `SELECT server,timestamp,name,face,team,ping,frags FROM nstats_server_query_players ORDER BY frags DESC`;

        return await simpleQuery(query);
    }
}
