import ACE from "../ace.js";
import fs from "fs";
import config from "../../config.json" with {"type": "json"};
import geoip from "geoip-lite";
import Message from "../message.js";


export default class AceManager{

    constructor(){
        this.ace = new ACE();
    }

    async importLog(fileName, mode, data){

        const lines = data.match(/^.+$/img);

        if(lines === null){
            new Message(`Can't import ${fileName}, regular expression result is null.`,`error`);
            return;
        }

        if(mode === "join"){
            await this.importPlayerJoins(fileName, lines);
        }else if(mode === "kick"){
            await this.importKickLog(fileName, data, lines);
        }
    }

    async importPlayerJoins(fileName, lines){


        const joins = this.parseJoinLog(lines);

        for(let i = 0; i < joins.length; i++){

            const j = joins[i];

            const country = geoip.lookup(j.ip);

            if(country === null){
                j.country = "XX";
            }else{
                j.country = country.country;
            }

            await this.ace.insertJoin(fileName, j);
            await this.ace.updatePlayer(j);
        }

        fs.renameSync(`${config.ace.logDir}/${fileName}`, `Logs/imported/ace/joins/${fileName}`);
    }

    parseJoinLog(lines){

        const reg = /^\[(.+?)\]: \[(.+?)\]: \[(.+?)\](.+)$/i;

        const joins = [];

        for(let i = 0; i < lines.length; i++){

            const line = lines[i];
            const result = reg.exec(line);

            if(result !== null){

                const type = result[3].toLowerCase();

                if(type === "ip") joins.push({"ace": result[1], "name": result[2]});
            
                const current = joins[joins.length - 1];

                if(current !== undefined){

                    let currentData = result[4].trim();

                    if(type === "time"){    
                        currentData = this.ace.convertTimeStamp(currentData);
                    }

                    current[type] = currentData;
                    
                }else{

                    new Message(`current is NULL acemanager.parsejoinlog()`,"warning");
                }
            }
        }
        return joins;
    }

    parseKickLog(lines){

        const reg = /\[(.+?)\]: (.+?)\.*: (.*)/i;
        const speedReg = /^(\d+\.\d+).+$/i;

        const data = {};

        for(let i = 0; i < lines.length; i++){

            const line = lines[i];

            const result = reg.exec(line);

            if(result !== null){

                const aceVersion = result[1];

                if(data.version === undefined){
                    data.version = aceVersion;
                }

                let type = result[2].toLowerCase().trim();

                let currentValue = result[3];

                if(type === "event type") type = "eventtype";

                if(type === "cpuspeed"){

                    const speedResult = speedReg.exec(currentValue);

                    if(speedResult !== null){
                        currentValue = speedResult[1];
                    }else{
                        new Message(`cpuSpeed speedResult = null`,"warning");
                        currentValue = 0;
                    }

                }else if(type === "timestamp"){

                    currentValue = this.ace.convertTimeStamp(currentValue);
                }

                if(type === "libraryname" || type === "modulename") type = "packagename";
                if(type === "librarypath") type = "packagepath";
                if(type === "librarysize") type = "packagesize";
                if(type === "libraryhash") type = "packagehash";
                if(type === "libraryver") type = "packagever";
                
                data[type] = currentValue;
            }
        }

        if(data['packagepath'] === undefined) data['packagepath'] = "N/A";
        if(data['packagehash'] === undefined) data['packagehash'] = "N/A";
        if(data['packagever'] === undefined) data['packagever'] = "N/A";

        if(data['packagesize'] === undefined){

            data['packagesize'] = 0;

        }else{

            const cleanReg = /^(\d+) bytes$/i;
            const cResult = cleanReg.exec(data['packagesize']);

            if(cResult !== null){
                data['packagesize'] = cResult[1];
            }
        }

        if(data['kickreason'] === undefined) data['kickreason'] = "N/A";

        if(data['filename'] === undefined) data['filename'] = "";
        if(data['status'] === undefined) data['status'] = "";

        return data;
    }

    async importKickLog(fileName, rawData, lines){

        const data = this.parseKickLog(lines);

        const country = geoip.lookup(data.playerip);

        if(country === null){
            data.country = "XX";
        }else{
            data.country = country.country;
        }

        if(data.packagename){
            await this.ace.insertKick(fileName, rawData, data);
        }else{
            await this.ace.insertScreenshotRequest(fileName, rawData, data);
        }

        fs.renameSync(`${config.ace.logDir}/${fileName}`, `Logs/imported/ace/kicks/${fileName}`);    
    }

    async updateTypeTotals(type, host, port){

        await this.ace.updateTypeTotals(type, host, port);

    }
}
