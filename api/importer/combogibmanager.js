const Message = require("../message");

class CombogibManager{

    constructor(){

        this.lines = [];
        this.kills = [];

        this.playerStats = [];
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
            "bestKillsSingleCombo": 0
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

    setPlayerEvents(){
        
    }
}


module.exports = CombogibManager;