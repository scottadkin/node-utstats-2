const Sprees = require("../sprees");


class SpreeManager{

    constructor(matchStart){

        this.matchStart = matchStart;

        this.sprees = new Sprees();

        this.spreeList = [];
    }

    add(victimId, totalKills, killerId, victimLastSpawn, timestamp){


        const start = (victimLastSpawn < this.matchStart) ? this.matchStart : victimLastSpawn;

        this.spreeList.push({
            "player": victimId,
            "kills": totalKills,
            "killedBy": killerId,
            "start": start,
            "end": timestamp,
            "totalTime": timestamp - start
        });
    }

    async insertSprees(matchId){

        for(let i = 0; i < this.spreeList.length; i++){

            const s = this.spreeList[i];

            await this.sprees.insertSpree(matchId, s.player, s.kills, s.start, s.end, s.totalTime, s.killedBy);
        }
    }
}

module.exports = SpreeManager;