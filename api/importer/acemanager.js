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
        }
    }

    async importPlayerJoins(fileName, lines){

        const joins = await this.parseJoinLog(lines);

        for(let i = 0; i < joins.length; i++){

            const j = joins[i];
            console.log(j);
            await this.ace.insertJoin(fileName, j);
        }
    }

    async parseJoinLog(lines){

        const reg = /^\[(.+?)\]: \[(.+?)\]: \[(.+)\](.+?)$/i;
        const dateReg = /^(\d\d)-(\d\d)-(\d\d\d\d) \/ (\d\d):(\d\d):(\d\d)$/i;

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

                    const dateResult = dateReg.exec(currentData);
      
                    if(dateResult !== null){

                        const day = dateResult[1];
                        const month = dateResult[2] - 1;
                        const year = dateResult[3];
                        const hour = dateResult[4];
                        const minute = dateResult[5];
                        const second = dateResult[6];

                        const date = new Date(year, month, day, hour, minute, second);

                        currentData = Math.floor(date * 0.001);

                    }else{
                        new Message(`AceManager.importJoinLog() dateResult is null`, "warning");
                    }
                }

                current[type] = currentData;
            }
        }

        return joins;
    }
}


module.exports = AceManager;