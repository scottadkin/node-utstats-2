const CTF = require("../ctf");
const Message = require("../message");

class CTFManager{

    constructor(){

        this.bHaveNStatsData = false;

        this.lines = [];

        this.flagKills = [];
        this.flagReturns = [];
        this.flagTaken = [];
    }

    getLineTimestamp(line){

        const timestampReg = /^(\d+?\.\d+?)\t.+$/i;

        const timestampResult = timestampReg.exec(line);

        if(timestampResult === null){

            new Message(`Timestamp regular expression failed.`,"error");
            return null;
        }

        return parseFloat(timestampResult[1]);
    }

    getLineType(line){

        const typeReg = /\d+?\.\d+?\t(.+?)\t.+/i;

        const result = typeReg.exec(line);

        if(result === null){

            new Message(`Event type regular expression failed.`,"error");
            return null;
        }

        return result[1];
    }


    getLineNstatsType(line){

        const reg = /\d+?\.\d+?\tnstats\t(.+?)\t.+/i;

        const result = reg.exec(line);

        if(result === null) return null;

        return result[1];
    }


    createNstatsFlagKill(timestamp, data){

        const killerId = parseInt(data[1]);
        const victimId = parseInt(data[2]);

        const killDistance = parseFloat(data[3]);
        const distanceToEnemyBase = parseFloat(data[4]);
        const distanceToCap = parseFloat(data[5]);

        const killer = this.playerManager.getOriginalConnectionById(killerId);
        const victim = this.playerManager.getOriginalConnectionById(victimId);


        const flagKill = {
            "timestamp": timestamp,
            "killerId": killer.masterId,
            "victimId": victim.masterId,
            "killDistance": killDistance,
            "distanceToEnemyBase": distanceToEnemyBase,
            "distanceToCap": distanceToCap
        };

        this.flagKills.push(flagKill);
    }


    createFlagKill(timestamp, line){

        const smartCTFReg = /^\d+?\.\d+?\tflag_kill\t(\d+)$/i;
        const nstatsCTFReg = /^\d+?\.\d+?\tnstats\tflag_kill\t(\d+?)\t(\d+?)\t(.+?)\t(.+?)\t(.+?)$/i;

        if(smartCTFReg.test(line)){

            const result = smartCTFReg.exec(line);     
        }

        if(nstatsCTFReg.test(line)){

            const result = nstatsCTFReg.exec(line);

            if(result !== null){
                this.createNstatsFlagKill(timestamp, result);
            }
        }

    
        
    }

    parseData(playerManager, matchStartTimestamp){

        this.playerManager = playerManager;
        this.matchStartTimestamp = matchStartTimestamp;
   

        for(let i = 0; i < this.lines.length; i++){

            const line = this.lines[i];

            const timestamp = this.getLineTimestamp(line);

            if(timestamp === null) continue;

            if(timestamp < matchStartTimestamp){

                new Message(`CTF event happened before match start timestamp(Warmup)`,"warning");
                continue;
            }

            const eventType = this.getLineType(line);

            if(eventType === null) continue;

            if(eventType === "nstats"){

                const nstatsType = this.getLineNstatsType(line);

                if(nstatsType === null) continue;

                console.log(`nstatsType = ${nstatsType}`);

                if(nstatsType === "flag_kill"){

                    this.createFlagKill(timestamp, line);
                }
            }

            if(eventType === "flag_kill"){

                if(!this.bHaveNStatsData){

                    this.createFlagKill(timestamp, line);
                }
            }


      
            console.log(line);
            console.log(timestamp);
        }

        console.log(this.flagKills);
    }
}

module.exports = CTFManager;