const mysql = require('./database');
const Message = require('./message');

class ACE{

    constructor(){}

    async bMatchingLog(name, type){

        let query = "";

        if(type === "kick"){

            query = "SELECT COUNT(*) as matching_logs FROM nstats_ace_kicks WHERE file=?";

        }else if(type === "join"){

            query = "SELECT COUNT(*) as matching_logs FROM nstats_ace_joins WHERE log_file=?";

        }

        const result = await mysql.simpleQuery(query, [name]);

        if(result[0].matching_logs > 0) return true;
        
        return false;

    }

    async bKickLogImported(name){

        return await this.bMatchingLog(name, "kick");
      
    }

    async bJoinLogImported(name){

        return await this.bMatchingLog(name, "join");

    }

    async bScreenshotImported(name){

        const query = "SELECT COUNT(*) as total_screenshots FROM nstats_ace_screenshots WHERE name=?";

        const result = await mysql.simpleQuery(query, [name]);

        if(result[0].total_screenshots > 0) return true;
        
        return false;
    }

    async updateScreenshotTable(name){

        const now = Math.floor(new Date() * 0.001);

        const query = "INSERT INTO nstats_ace_screenshots VALUES(NULL,?,?)";

        await mysql.simpleQuery(query, [name, now]);

    }

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
            data.renderer,
            data.sounddevice,
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

    toUniqueVariables(data){

        const uniqueMac1s = [];
        const uniqueMac2s = [];
        const uniqueHWIDs = [];
        const uniqueIps = [];
        const uniqueCountries = [];

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(uniqueMac1s.indexOf(d.mac1) === -1) uniqueMac1s.push(d.mac1);
            if(uniqueMac2s.indexOf(d.mac2) === -1) uniqueMac2s.push(d.mac2);
            if(uniqueHWIDs.indexOf(d.hwid) === -1) uniqueHWIDs.push(d.hwid);
            if(uniqueIps.indexOf(d.ip) === -1) uniqueIps.push(d.ip);
            if(uniqueCountries.indexOf(d.country) === -1) uniqueCountries.push(d.country);

        }

        return {
            "mac1": uniqueMac1s,
            "mac2": uniqueMac2s,
            "hwid": uniqueHWIDs,
            "ip": uniqueIps,
            "country": uniqueCountries
        };
    }


    async getAliases(name, ips, mac1s, mac2s, hwids){

        if(ips.length === 0 && mac1s.length === 0 && mac2s.length === 0 && hwids.length === 0) return [];

        let query = `SELECT name,ip,country,hwid,mac1,mac2 FROM nstats_ace_players WHERE (name != ?) AND (`;

        const vars = [name];

        const appendParameter = (column, data) =>{

            if(data.length === 0) return;

            if(vars.length > 1) query += `OR `;
            query += `${column} IN(?) `;
            
            vars.push(data);

        }

        appendParameter("ip", ips);
        appendParameter("mac1", mac1s);
        appendParameter("mac2", mac2s);
        appendParameter("hwid", hwids);

        query += ")";

        return await mysql.simpleFetch(query, vars);

    }

    async getPlayerByName(name){


        const query = `SELECT * FROM nstats_ace_players WHERE name=? ORDER BY id ASC`;

        return await mysql.simpleFetch(query, [name]);
        
    }
    
    async getPlayerUsedIps(name){

        const query = "SELECT DISTINCT ip FROM nstats_ace_players WHERE name=?";

        const result = await mysql.simpleFetch(query, [name]);

        const data = [];

        for(let i = 0; i < result.length; i++){

            data.push(result[i].ip);
        }

        return data;
    }

    async getPlayerReport(name){

        if(name === undefined) return [];
        if(name === "") return [];

        const playerData = await this.getPlayerByName(name);

        const uniqueVariables = this.toUniqueVariables(playerData);
        //uniqueVariables.ips = await this.getPlayerUsedIps(name);

        const aliases = await this.getAliases(
            name,
            uniqueVariables.ip, uniqueVariables.mac1, 
            uniqueVariables.mac2, uniqueVariables.hwid
        );

        return {"playerData": playerData, "aliases": aliases, "uniqueVariables": uniqueVariables};
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

    
        let gameVersion = 0;

        if(data.gameversion !== ""){
            gameVersion = 0;
        }

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
            gameVersion,
            data.renderer,
            data.sounddevice,
            data.commandline,
            data.timestamp,
            data.adminname ?? "",
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

    async getLatestKickLogsBasic(page, perPage){

        let start = 0;

        page = parseInt(page);
        page--;
        if(page !== page) page = 0;

        perPage = parseInt(perPage);
        if(perPage !== perPage) perPage = 25;

        start = page * perPage;
        if(start < 0) start = 0;
        
        const query = "SELECT id,timestamp,ip,country,hwid,mac1,mac2,name,kick_reason,package_name,package_version FROM nstats_ace_kicks ORDER BY timestamp DESC LIMIT ?, ?";

        return await mysql.simpleFetch(query, [start, perPage]);

    }

    async getTotalKicks(){

        const query = "SELECT COUNT(*) as total_logs FROM nstats_ace_kicks";

        const result = await mysql.simpleFetch(query);

        if(result.length > 0) return result[0].total_logs;

        return 0;
    }

    async getKickLog(id){

        const query = "SELECT * FROM nstats_ace_kicks WHERE id=?";

        const result = await mysql.simpleFetch(query, [id]);

        if(result.length > 0) return result[0];

        return null;
    }


    async getRecentScreenshots(page, perPage){

        page--;

        const query = "SELECT * FROM nstats_ace_sshot_requests ORDER BY timestamp DESC LIMIT ?, ?";

        let start = page * perPage;
        if(start < 0) start = 0;

        return await mysql.simpleFetch(query, [start, perPage]);
    }

    async getTotalScreenshots(){

        const query = "SELECT COUNT(*) as total_sshots FROM nstats_ace_sshot_requests";

        const result = await mysql.simpleFetch(query);

        if(result.length > 0) return result[0].total_sshots;

        return 0;
    }


    async getScreenshotRequest(id){

        const query = "SELECT * FROM nstats_ace_sshot_requests WHERE id=?";

        const result = await mysql.simpleFetch(query, [id]);

        if(result.length > 0) return result[0];

        return [];
        
    }


    async updateTypeTotals(type, host, port){

        type = type.toLowerCase();

        let bNonFtp = (host === null || port === null) ? true : false;

        const ending = (bNonFtp) ? "WHERE id > -1" : "WHERE host=? AND port=?";
        const table = (bNonFtp) ? "nstats_logs_folder" : "nstats_ftp";

        let toChange = "";

        if(type === "kick") toChange = "total_ace_kick_logs=total_ace_kick_logs+1";
        if(type === "join") toChange = "total_ace_join_logs=total_ace_join_logs+1";
        if(type === "screenshot") toChange = "total_ace_screenshots=total_ace_screenshots+1";

        if(toChange === ""){
            new Message(`ACE.updateTypeTotals() toChange is ""`,"warning");
            return;
        }

        const query = `UPDATE ${table} SET ${toChange} ${ending}`;

        const vars = [host, port];

        await mysql.simpleQuery(query, vars);
    }
}


module.exports = ACE;