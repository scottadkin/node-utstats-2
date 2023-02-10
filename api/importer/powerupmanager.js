const PowerUps = require("../powerups");

class PowerUpManager{

    constructor(){

        this.powerUps = new PowerUps();
        this.names = [];
        this.namesToIds = {};
        this.events = [];

        this.timeframes = [];
    }

    addName(name){

        if(this.names.indexOf(name) === -1){
            this.names.push(name);
        }
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
        }

        console.log(this.powerUpHistory);
    }

    async createIdsToNames(){

        for(let i = 0; i < this.names.length; i++){

            const id = await this.powerUps.getPowerUpId(this.names[i]);
            this.namesToIds[this.names[i]] = id;
        }
    }

    async insertMatchData(matchId, matchDate){


        for(let i = 0; i < this.powerUpHistory.length; i++){

            const p = this.powerUpHistory[i];

            await this.powerUps.insertPlayerMatchData(
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
}

module.exports = PowerUpManager;