const mysql = require('../database');
const Message = require('../message');


class AceManager{

    constructor(){}

    async importLog(fileName, mode, data){

        const lines = data.match(/^.+$/img);

        if(mode === "join"){
            await this.importJoinLog(fileName, lines);
        }
    }

    async importJoinLog(fileName, lines){

        const joins = [];


        const reg = /^\[.+?\]: \[(.+?)\]: \[(.+)\](.+?)$/i;
        const dateReg = /^(\d\d)-(\d\d)-(\d\d\d\d) \/ (\d\d):(\d\d):(\d\d)$/i;

        for(let i = 0; i < lines.length; i++){

            const line = lines[i];
            const result = reg.exec(line);

            if(result !== null){

                const type = result[2].toLowerCase();

                if(type === "ip") joins.push({"name": result[1]});
            
                const current = joins[joins.length - 1];

                let currentData = result[3].trim();

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

        console.log(joins);

    }
}


module.exports = AceManager;