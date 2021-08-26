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

    async insertJoin(fileName, data){

        const query = "INSERT INTO nstats_ace_players VALUES(NULL,?,?,?,?,?,?,?,?,?)";

        const vars = [
            fileName, 
            data.ace, 
            data.time, 
            data.name, 
            data.ip, 
            data.os,
            data.mac1, 
            data.mac2, 
            data.hwid
        ];

        await mysql.simpleInsert(query, vars);
    }

    async insertKick(fileName, rawData, data){

        const query = `INSERT INTO nstats_ace_kicks VALUES(NULL,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?)`;

        const vars = [
            fileName,
            rawData,
            data.playername,
            data.version,
            data.playerip,
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
    }
}

module.exports = ACE;