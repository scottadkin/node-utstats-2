import Sprees from "../sprees.js";
import { bulkInsertMatchSprees } from "../sprees.js";


export default class SpreeManager{

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

    async insertSprees(gametypeId, mapId, matchId){

        await bulkInsertMatchSprees(this.spreeList, gametypeId, mapId, matchId);

    }
}
