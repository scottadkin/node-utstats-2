const mysql = require('../database');
const Message = require('../message');
const ACE = require('../ace');


class AceManager{

    constructor(){
        this.ace = new ACE();
    }

    async importLog(fileName, mode, data){

        const lines = data.match(/^.+$/img);

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
            await this.ace.insertJoin(fileName, j);
        }
    }

    parseJoinLog(lines){

        const reg = /^\[(.+?)\]: \[(.+?)\]: \[(.+)\](.+?)$/i;

        const joins = [];

        for(let i = 0; i < lines.length; i++){

            const line = lines[i];
            const result = reg.exec(line);

            if(result !== null){

                const type = result[3].toLowerCase();

                if(type === "ip") joins.push({"ace": result[1], "name": result[2]});
            
                const current = joins[joins.length - 1];

                let currentData = result[4].trim();

                if(type === "time"){
             
                    currentData = this.ace.convertTimeStamp(currentData);

                }
    
                current[type] = currentData;
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

                let type = result[2].toLowerCase();

                let currentValue = result[3];

                if(type === "cpuspeed"){

                    const speedResult = speedReg.exec(currentValue);
                    currentValue = speedResult[1];

                }else if(type === "timestamp"){

                    currentValue = this.ace.convertTimeStamp(currentValue);

                }

                if(type === "libraryname") type = "packagename";
                if(type === "librarypath") type = "packagepath";
                if(type === "librarysize") type = "packagesize";
                if(type === "libraryhash") type = "packagehash";
                if(type === "libraryver") type = "packagever";
                
                

                data[type] = currentValue;

            }
        }

        return data;
    }

    async importKickLog(fileName, rawData, lines){

        const data = this.parseKickLog(lines);

        if(data.kickreason){
            await this.ace.insertKick(fileName, rawData, data);
        }
        
    }
}


module.exports = AceManager;