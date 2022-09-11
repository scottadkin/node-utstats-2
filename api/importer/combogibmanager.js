const Message = require("../message");

class CombogibManager{

    constructor(){

        this.lines = [];
        this.kills = [];

        this.playerStats = [];

        this.multiKillCombos = [];

    }

    addLine(line){
        this.lines.push(line);
    }

    getPlayerStats(playerId){

        for(let i = 0; i < this.playerStats.length; i++){

            const p = this.playerStats[i];

            if(p.player === playerId){

                return p;
            }
        }

        this.playerStats.push({
            "player": playerId,
            "kills": 0,
            "deaths": 0,
            "bestKillsSingleCombo": 0,
            "bestCombosSingleLife": 0
        });

        return this.playerStats[this.playerStats.length - 1];
    }

    addKill(line){

        const reg = /^(\d+\.\d+)\tcombo_kill\t(\d+)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){

            new Message(`CombogibManager.addKill() reg.exec(line) result was null.`,"warning");
            return;
        }

        const timestamp = parseFloat(result[1]);
        const killer = parseInt(result[2]);
        const victim = parseInt(result[3]);

        this.kills.push({
            "timestamp": timestamp,
            "killer": killer,
            "victim": victim
        });
    }

    getKillsWithTimestamp(timestamp){

        const found = [];

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            if(k.timestamp > timestamp) break;

            if(k.timestamp === timestamp){
                found.push(k);
            }

        }

        return found;
    }

    //probably overkill checking if two different players get a combo at the exact same time
    createMultiComboKills(duplicateTimes){

        for(const timestamp of duplicateTimes){

            const killers = {};

            const currentKills = this.getKillsWithTimestamp(timestamp);

            for(let i = 0; i < currentKills.length; i++){

                const k = currentKills[i];

                if(killers[k.killer] === undefined){
                    killers[k.killer] = 0;
                }

                if(k.killer !== k.victim) killers[k.killer]++;
            }

            for(const [key, value] of Object.entries(killers)){

                if(value < 2) continue;

                this.multiKillCombos.push({"timestamp": timestamp, "player": parseInt(key), "kills": value});
            }
        }
    }

    createPlayerEvents(){
        
        let previousTimestamp = -1;

        const duplicateTimes = new Set();

        for(let i = 0; i < this.kills.length; i++){

            const {timestamp} = this.kills[i];

            if(timestamp === previousTimestamp){
                duplicateTimes.add(timestamp);
            }

            previousTimestamp = timestamp;
        }
        
        this.createMultiComboKills(duplicateTimes);
    }

}


module.exports = CombogibManager;