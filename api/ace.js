const mysql = require('./database');
const Message = require('./message');

class ACE{

    constructor(){}

    convertTimeStamp(string){

        const dateReg = /^(\d\d)-(\d\d)-(\d\d\d\d) \/ (\d\d):(\d\d):(\d\d)$/i;

        const dateResult = dateReg.exec(string);
      
        if(dateResult !== null){

            const day = dateResult[1];
            const month = dateResult[2] - 1;
            const year = dateResult[3];
            const hour = dateResult[4];
            const minute = dateResult[5];
            const second = dateResult[6];

            const date = new Date(year, month, day, hour, minute, second);

            return Math.floor(date * 0.001);

        }else{
            new Message("ACE.convertTimeStamp() dateResult is null","warning");
        }

        return 0;
    }


    async createNewPlayer(name, ip, country, mac1, mac2, hwid, time){

        const query = "INSERT INTO nstats_ace_players VALUES(NULL,?,?,?,?,?,?,?,?,1,0,0)";

        const vars = [name, ip, country, mac1, mac2, hwid, time, time];

        await mysql.simpleInsert(query, vars);
    }

    async updatePlayer(data){

        const query = `UPDATE nstats_ace_players SET 
        country=?,
        first = IF(? > first, first, ?),
        last = IF(? > last, ?, last),
        times_connected=times_connected+1
        WHERE name=? AND ip=? AND mac1=? AND mac2=? AND hwid=?`;

        const vars = [
            data.country,
            data.time,
            data.time,
            data.time,
            data.time,
            data.name,
            data.ip,
            data.mac1,
            data.mac2,
            data.hwid
        ];

        const result = await mysql.updateReturnAffectedRows(query, vars);

        if(result === 0){
            await this.createNewPlayer(data.name, data.ip, data.country, data.mac1, data.mac2, data.hwid, data.time);
        }
    }

    async insertJoin(fileName, data){

        const query = "INSERT INTO nstats_ace_joins VALUES(NULL,?,?,?,?,?,?,?,?,?,?)";

        const vars = [
            fileName, 
            data.ace, 
            data.time, 
            data.name, 
            data.ip, 
            data.country,
            data.os,
            data.mac1, 
            data.mac2, 
            data.hwid
        ];

        await mysql.simpleInsert(query, vars);
    }

    async updatePlayerKickStats(name, ip, mac1, mac2, hwid, date){

        const query = `UPDATE nstats_ace_players SET times_kicked=times_kicked+1,
        last_kick = IF(last_kick=0, ?, IF(last_kick > ?, last_kick, ?))
        WHERE name=? AND ip=? AND mac1=? AND mac2=? AND hwid=?`;

        const vars = [date, date, date, name, ip, mac1, mac2, hwid];

        await mysql.simpleUpdate(query, vars);
    }

    async insertKick(fileName, rawData, data){

        const query = `INSERT INTO nstats_ace_kicks VALUES(NULL,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,?)`;

        const vars = [
            fileName,
            rawData,
            data.playername,
            data.version,
            data.playerip,
            data.country,
            data.os,
            data.cpu,
            data.cpuspeed,
            data.nicdesc,
            data.machash1,
            data.machash2,
            data.hwid,
            data.gameversion,
            data.sounddevice,
            data.renderer,
            data.commandline,
            data.timestamp,
            data.kickreason,
            data.packagename,
            data.packagepath,
            data.packagesize,
            data.packagehash,
            data.packagever,
            data.filename,
            data.status
        ];

        await mysql.simpleInsert(query, vars);

        await this.updatePlayerKickStats(data.playername, data.playerip, data.machash1, data.machash2, data.hwid, data.timestamp);
    }


    async getHomeRecentKicks(){


        const query = `SELECT name,ip,country,mac1,mac2,hwid,timestamp,kick_reason,package_name,package_version
        FROM nstats_ace_kicks ORDER BY timestamp DESC LIMIT 5`;

        return await mysql.simpleFetch(query);
       
    }

    async getHomeRecentPlayers(){

        const query = "SELECT name,ip,country,hwid,first,last,times_connected FROM nstats_ace_players ORDER BY last DESC LIMIT 5";

        return await mysql.simpleFetch(query);
    }


    async playerSearch(name, ip, hwid, mac1, mac2){

        let query = "SELECT * FROM nstats_ace_players WHERE ";

        let colsAdded = 0;

        const vars = [];

        const appendParameter = (value, name) =>{

            if(value === undefined) return;
            if(value === "") return;

            if(colsAdded > 0){
                query += "AND ";
            }

            vars.push(`%${value}%`);

            query += `${name} LIKE(?) `;
            colsAdded++;

        }

        appendParameter(name, "name");
        appendParameter(ip, "ip");
        appendParameter(hwid, "hwid");
        appendParameter(mac1, "mac1");
        appendParameter(mac2, "mac2");

        query += " ORDER BY name ASC";

        if(vars.length === 0) return [];

        return await mysql.simpleFetch(query, vars);
    }


    async getTotalPlayerJoins(name){

        const query = "SELECT COUNT(*) as total_joins FROM nstats_ace_joins WHERE player=?";

        const result = await mysql.simpleFetch(query, [name]);

        if(result.length > 0) return result[0].total_joins;

        return 0;
    }

    async getPlayerJoins(name, page, perPage){

        if(name === "") return [];
        if(page < 0) page = 0;
        if(perPage < 0 || perPage > 100) perPage = 25;
        
        const start = page * perPage;

        const query = `SELECT ace_version,timestamp,ip,country,os,mac1,mac2,hwid 
        FROM nstats_ace_joins WHERE player=? ORDER BY timestamp DESC LIMIT ?, ?`;

        const totalPlayerData = await this.getTotalPlayerJoins(name);

        const data = await mysql.simpleFetch(query, [name, start, perPage]);

        return {"data": data, "results": totalPlayerData};
        
    }

    async getPlayerReport(name){

        if(name === undefined) return [];
        if(name === "") return [];

        const playerSearchData = await this.playerSearch(name);

        return {"searchData": playerSearchData};
    }

    async getTotalPlayerKicks(name){

        const query = "SELECT COUNT(*) as total_kicks FROM nstats_ace_kicks WHERE name=?";

        const result = await mysql.simpleFetch(query, [name]);

        if(result.length > 0) return result[0].total_kicks;

        return 0;
    }

    async getPlayerKicks(name, page, perPage){

        if(name === undefined) return [];
        if(name === "") return [];
        if(page < 0) page = 0;
        if(perPage < 1 || perPage > 100) perPage = 10;

        let start = page * perPage;

        if(start < 0) start = 0;

        const query = `SELECT ip,country,hwid,mac1,mac2,kick_reason,package_name,
        package_version,screenshot_file,screenshot_status,timestamp
        FROM nstats_ace_kicks WHERE name=? ORDER BY timestamp DESC LIMIT ?, ?`;

        return await mysql.simpleFetch(query, [name, start, perPage]);
    }

    async insertScreenshotRequest(fileName, rawData, data){

        const query = `INSERT INTO nstats_ace_sshot_requests VALUES(NULL,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
        ?)`;

        const vars = [
            fileName,
            rawData,
            data.playername,
            data.playerip,
            data.country,
            data.version,
            data.os,
            data.cpu,
            data.cpuspeed,
            data.nicdesc,
            data.machash1,
            data.machash2,
            data.hwid,
            data.gameversion,
            data.renderer,
            data.sounddevice,
            data.commandline,
            data.timestamp,
            data.adminname,
            data.filename,
            data.status
        ];

        await mysql.simpleInsert(query, vars);
    }


    async getPlayerScreenshotRequests(name, page){

        page = parseInt(page);
        if(page !== page) page = 0;
        if(page < 0) page = 0;

        const perPage = 10;
        const start = page * perPage;

        const query = `SELECT ip,country,admin_name,screenshot_file,timestamp,hwid,mac1,mac2 FROM nstats_ace_sshot_requests
        WHERE player=? ORDER BY timestamp DESC LIMIT ?, ?`;
        
        return await mysql.simpleFetch(query, [name, start, perPage]);
    }

    async getTotalPlayerScreenshotRequests(name){

        const query = "SELECT COUNT(*) as total_sshots FROM nstats_ace_sshot_requests WHERE player=?";

        const result = await mysql.simpleFetch(query, [name]);

        if(result.length > 0) return result[0].total_sshots;
        return 0;
    }

    async getHomeRecentSShotRequests(){

        const query = `SELECT ip,country,admin_name,screenshot_file,timestamp,hwid,mac1,mac2 FROM nstats_ace_sshot_requests 
        ORDER BY timestamp DESC LIMIT 5`;

        return await mysql.simpleFetch(query);
    }

    static cleanImageURL(url){

        const reg = /^.*\/(.+)$/i;
        
        const result = reg.exec(url);

        if(result !== null){
            return `/images/ace/${result[1]}`;
        }

        return url;

    }
}


module.exports = ACE;