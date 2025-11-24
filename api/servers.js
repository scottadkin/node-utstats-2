import { simpleQuery, bulkInsert } from "./database.js";
import { toMysqlDate } from "./generic.mjs";
import { getObjectName } from "./genericServerSide.mjs";



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

    async insertServer(ip, port, name, date, playtime, country){

        const query = `INSERT INTO nstats_servers VALUES(NULL,?,?,?,?,?,1,?,"","",0,"",?,0,0)`;
        const vars = [name, ip, port, date, date, playtime, country];

        return await simpleQuery(query, vars);
    }

    async updateServer(ip, port, name, date, playtime, country){

        try{

           // date = toMysqlDate(new Date(date * 1000))
    
            playtime = parseFloat(playtime);

            //if(port !== port) throw new Error(`Port must be a valid integer.`);

            //If server doesn't exist create it
            if(!await this.updateBasicInfo(ip, port, name, 1, playtime, country)){
                await this.insertServer(ip, port, name, date, playtime, country);
            }

            const dates = await this.getFirstLast(name);

            if(dates === null) throw new Error(`Dates for server were not found.`);

            await this.updateDate('first', name, date, dates.first);
            await this.updateDate('last', name, date, dates.last);
            


        }catch(err){
            console.trace(err);
        }
    }

    async updateBasicInfo(ip, port, name, matches, playtime, country){

        const query = `UPDATE nstats_servers SET
            ip=?,port=?,name=?, playtime=playtime+?, matches=matches+?, country=?
            WHERE name=?`;
        
        const vars = [ip,port,name, playtime, matches, country, name];

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

        return await getServerNames([id]);
    }

    async getNames(ids){

         return await getServerNames(ids);
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

}


export async function deleteServerById(id){
    const query = `DELETE FROM nstats_servers WHERE id=?`;
    return await simpleQuery(query, [id]);
}

async function updateTotals(serverId, first, last, totalMatches, playtime, lastMatchId, lastMapId){

    const query = `UPDATE nstats_servers SET first=?,last=?,matches=?,playtime=?,last_match_id=?,last_map_id=?
    WHERE id=?`;

    return await simpleQuery(query, [first, last, totalMatches, playtime, lastMatchId, lastMapId, serverId]);
}

async function getLatestMatchPlayedIds(serverId){

    const query = `SELECT id,map FROM nstats_matches WHERE server=? ORDER BY date DESC LIMIT 1`;

    const result = await simpleQuery(query, [serverId]);

    if(result.length === 0) return {"mapId": -1, "matchId": -1};

    return {"mapId": result[0].map, "matchId": result[0].id}
}

export async function recalculateTotals(serverId){


    const query = `SELECT COUNT(*) as total_matches,MAX(date) as last_match,MIN(date) as first_match,SUM(playtime) as playtime FROM nstats_matches WHERE server=?`;

    const result = await simpleQuery(query, [serverId]);

    const r = result[0];

    if(r.total_matches === 0){  
        return await deleteServerById(serverId);
    }


    const {mapId, matchId} = await getLatestMatchPlayedIds(serverId);

    await updateTotals(serverId, r.first_match, r.last_match, r.total_matches, r.playtime, matchId, mapId);

}


/**
 * We need to check for a display name & address for this table
 */
export async function getServerNames(ids){

    if(ids.length === 0) return {};

    const query = `SELECT id,name,display_name FROM nstats_servers WHERE id IN(?)`;

    const result = await simpleQuery(query, [ids]);

    const found = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.display_name !== ""){
            found[r.id] = r.display_name;
        }else{
            found[r.id] = r.name;
        }
    }

    return found;
}

export async function getAllNames(bReturnArray){

    if(bReturnArray === undefined) bReturnArray = false;

    const query = `SELECT id,name,display_name FROM nstats_servers`;

    const result = await simpleQuery(query);


    const found = (bReturnArray) ? []: {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        const name = (r.display_name !== "") ? r.display_name : r.name; 

        if(!bReturnArray){
            found[r.id] = name;
        }else{
            found.push({"id": r.id, "name": name});
        }
        
    }

    return found;
}


export async function getServer(id){

    const query = `SELECT * FROM nstats_servers WHERE id=?`;

    const result = await simpleQuery(query, [id]);

    if(result.length > 0){

        if(result[0].display_name !== "") result[0].name = result[0].display_name;
        if(result[0].display_address !== "") result[0].address = result[0].display_address;
        if(result[0].display_port !== "") result[0].port = result[0].display_port;

        return result[0];
    }
    
    return null;
}

export async function getAll(){

    const query = `SELECT * FROM nstats_servers ORDER BY name ASC`;

    return await simpleQuery(query);
}


export async function saveChanges(changes){

    const query = `UPDATE nstats_servers SET display_name=?,display_address=?,
    display_port=?,password=?,country=? WHERE id=?`;

    for(let i = 0; i < changes.length; i++){

        const c = changes[i];

        const vars = [
            c.display_name,c.display_address,
            c.display_port,c.password,c.country,c.id
        ];

        await simpleQuery(query, vars);
    }
}


export async function getRecentPingInfo(serverId, limit){

    const query = `SELECT id,date,ping_min_average,ping_average_average,ping_max_average 
    FROM nstats_matches WHERE server=? ORDER BY date DESC LIMIT ?`;

    const result = await simpleQuery(query, [serverId, limit]);

    return result.map((r) =>{
        return {"matchId": r.id, "date": r.date, "min": r.ping_min_average, "average": r.ping_average_average, "max": r.ping_max_average}
    });
}