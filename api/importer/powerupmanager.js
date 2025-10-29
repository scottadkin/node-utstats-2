import PowerUps, { bulkInsertMatchCarryTimes, bulkInsertPlayerMatchData, bulkUpdatePlayerTotals } from "../powerups.js";

export default class PowerUpManager{

    constructor(playerManager, killsManager){

        this.playerManager = playerManager;
        this.killsManager = killsManager;
        this.powerUps = new PowerUps();
        this.names = [];
        this.namesToIds = {};
        this.events = [];

        this.playerTotals = {};

        //kills a player gets on a player that is holding an item
        this.carrierKills = {};

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

    updateCarrierKills(playerId, itemId){

        if(this.carrierKills[playerId] === undefined){
            this.carrierKills[playerId] = {};
        }

        const kills = this.carrierKills[playerId];

        if(kills[itemId] === undefined){
            kills[itemId] = 0;
        }

        kills[itemId]++;
    }

    addEvents(events){


        this.powerUpHistory = [];

        for(let i = 0; i < events.length; i++){

            const e = events[i];

            if(e.endTimestamp === undefined) continue;

            e.powerUpId = this.namesToIds[e.item];

            if(e.killerId !== undefined){
                this.updateCarrierKills(e.killerId, e.powerUpId)
            }

            this.powerUpHistory.push(e);

            this.updatePlayerTotal(e);
        }

        this.events = events;
    }

    async createIdsToNames(){

        for(let i = 0; i < this.names.length; i++){

            const id = await this.powerUps.getPowerUpId(this.names[i]);
            this.namesToIds[this.names[i]] = id;
        }
    }

    async insertCarryTimes(matchId, matchDate, gametypeId, mapId){

        return await bulkInsertMatchCarryTimes(matchId, matchDate, mapId, gametypeId, this.powerUpHistory);
    }


    async insertPlayerMatchData(matchId, matchDate, mapId, gametypeId){

        const data = [];

        for(const [playerId, playerStats] of Object.entries(this.playerTotals)){

            for(const [powerUpId, stats] of Object.entries(playerStats)){

                data.push({"playerId": playerId, "powerUpId": powerUpId, "stats": stats}); 
            }
        }

        await bulkInsertPlayerMatchData(matchId, matchDate, mapId, gametypeId, data);
    }


    //get the most amount of kills of players carrying an item in a single life
    getBestCarrierKills(playerId, powerUpId){

        powerUpId = parseInt(powerUpId);
        playerId = parseInt(playerId);

        let best = 0;
        let current = 0;

        let lastKillTimestamp = 0;

        for(let i = 0; i < this.events.length; i++){

            const e = this.events[i];

            if(e.killerId === undefined) continue;

            if(e.killerId === playerId && e.powerUpId === powerUpId){

                const totalDeaths = this.killsManager.getDeathsBetween(lastKillTimestamp, e.timestamp, e.killerId);
                
                if(totalDeaths > 0){
                    current = 0;
                }

                current++;

                lastKillTimestamp = e.timestamp;
            }

            if(current > best) best = current;
        }

        return best;
    }

    async insertMatchData(matchId, matchDate, mapId, gametypeId){

        await this.insertCarryTimes(matchId, matchDate, gametypeId, mapId);
        await this.insertPlayerMatchData(matchId, matchDate, mapId, gametypeId);

        const playerIds = [];
        const powerupIds = new Set();

        for(const [playerId, playerData] of Object.entries(this.playerTotals)){

            playerIds.push(parseInt(playerId));

            for(const powerupId of Object.keys(playerData)){

                powerupIds.add(parseInt(powerupId));
            }
        }
        
        await bulkUpdatePlayerTotals(playerIds, [...powerupIds], gametypeId, mapId);

    }
}
