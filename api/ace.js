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
}

module.exports = ACE;