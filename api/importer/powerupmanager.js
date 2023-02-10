const PowerUps = require("../powerups");

class PowerUpManager{

    constructor(){

        this.powerUps = new PowerUps();
        this.names = [];
        this.namesToIds = {};
        this.events = [];

        this.playerTotals = {};

    }

    addName(name){

        if(this.names.indexOf(name) === -1){
            this.names.push(name);
        }
    }

    updatePlayerTotal(event){

        if(this.playerTotals[event.player] === undefined){
            this.playerTotals[event.player] = {};
        }

        const player = this.playerTotals[event.player];

        if(player[event.powerUpId] === undefined){
            player[event.powerUpId] = {
                "carryTime": 0,
                "bestCarryTime": 0,
                "totalKills": 0,
                "bestKills": 0,
                "timesUsed": 0,
                "totalDeaths": 0,
                "totalSuicides": 0,
                "totalTimeouts": 0,
                "matchEnds": 0
            };
        }

        const item = player[event.powerUpId];

        item.timesUsed++;

        item.carryTime += event.carryTime;
        if(item.bestCarryTime < event.carryTime) item.bestCarryTime = event.carryTime;

        item.totalKills += event.totalKills;
        if(item.bestKills < event.totalKills) item.bestKills = event.totalKills;

        if(event.endReason === -1) item.matchEnds++;
        if(event.endReason === 0) item.totalTimeouts++;
        if(event.endReason === 1) item.totalDeaths++;
        if(event.endReason === 2) item.totalSuicides++;
    }

    addEvents(events){

        //this.events = events;

        //console.log(this.events);

        this.powerUpHistory = [];


        for(let i = 0; i < events.length; i++){

            const e = events[i];

            if(e.endTimestamp === undefined) continue;
           // console.log(e);
            e.powerUpId = this.namesToIds[e.item];
            this.powerUpHistory.push(e);

            this.updatePlayerTotal(e);
        }
    }

    async createIdsToNames(){

        for(let i = 0; i < this.names.length; i++){

            const id = await this.powerUps.getPowerUpId(this.names[i]);
            this.namesToIds[this.names[i]] = id;
        }
    }

    async insertCarryTimes(matchId, matchDate){

        for(let i = 0; i < this.powerUpHistory.length; i++){

            const p = this.powerUpHistory[i];

            await this.powerUps.insertPlayerCarryTimes(
                matchId, 
                matchDate, 
                p.player, 
                p.powerUpId, 
                p.timestamp, 
                p.endTimestamp, 
                p.carryTime, 
                p.totalKills,
                p.endReason
            );
        }
    }


    async insertPlayerMatchData(matchId, matchDate){

        for(const [playerId, playerStats] of Object.entries(this.playerTotals)){

            for(const [powerUpId, stats] of Object.entries(playerStats)){

                await this.powerUps.insertPlayerMatchData(matchId, matchDate, playerId, powerUpId, stats)
            }
        }
    }

    async insertMatchData(matchId, matchDate){

        await this.insertCarryTimes(matchId, matchDate);
        await this.insertPlayerMatchData(matchId, matchDate);
        

    }
}

module.exports = PowerUpManager;