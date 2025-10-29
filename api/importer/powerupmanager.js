import PowerUps from "../powerups.js";

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

        for(let i = 0; i < this.powerUpHistory.length; i++){

            const p = this.powerUpHistory[i];

            await this.powerUps.insertPlayerCarryTimes(
                matchId, 
                gametypeId,
                mapId,
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


    async insertPlayerMatchData(matchId, matchDate, mapId, gametypeId){

        for(const [playerId, playerStats] of Object.entries(this.playerTotals)){

            for(const [powerUpId, stats] of Object.entries(playerStats)){

                await this.powerUps.insertPlayerMatchData(matchId, matchDate, mapId, gametypeId, playerId, powerUpId, stats);

                //const playerPlaytime = this.playerManager.getTotalPlaytime();

                const player = this.playerManager.getPlayerByMasterId(playerId);

                let playtime = 0;

                if(player !== null){
                    playtime = player.getTotalPlaytime(this.totalTeams);
                }

                //gametype + map combo
                await this.powerUps.updatePlayerTotals(playerId, gametypeId, mapId, powerUpId, stats, playtime);

                //map total
                await this.powerUps.updatePlayerTotals(playerId, 0, mapId, powerUpId, stats, playtime);
                //gametype total
                await this.powerUps.updatePlayerTotals(playerId, gametypeId, 0, powerUpId, stats, playtime);

                //all time
                await this.powerUps.updatePlayerTotals(playerId, 0, 0, powerUpId, stats, playtime);

                //await this.powerUps.bPlayerTotalExist(playerId, powerUpId, playtime);
            }
        }
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

    async insertCarrierKills(matchId, matchDate, mapId, gametypeId){

        //updatePlayerMatchCarrierKills(matchId, matchDate, playerId, powerUpId, totalKills)

        for(const [playerId, powerupStats] of Object.entries(this.carrierKills)){

            const player = this.playerManager.getPlayerByMasterId(playerId);

            let playtime = -1;

            if(player !== null){
                playtime = player.getTotalPlaytime(this.totalTeams);
            }

            for(const [powerUpId, totalKills] of Object.entries(powerupStats)){

                const bestKills = this.getBestCarrierKills(playerId, powerUpId);
   
                await this.powerUps.updatePlayerMatchCarrierKills(matchId, matchDate, mapId, gametypeId, playerId, powerUpId, totalKills, bestKills);

                //all time totals
                await this.powerUps.updatePlayerTotalCarrierKills(playerId, 0, 0, powerUpId, playtime, totalKills, bestKills);
                //gametype totals
                await this.powerUps.updatePlayerTotalCarrierKills(playerId, gametypeId, 0, powerUpId, playtime, totalKills, bestKills);
                //map totals
                await this.powerUps.updatePlayerTotalCarrierKills(playerId, 0, mapId, powerUpId, playtime, totalKills, bestKills);
                //gametype map combo totals
                await this.powerUps.updatePlayerTotalCarrierKills(playerId, gametypeId, mapId, powerUpId, playtime, totalKills, bestKills);
            }
        }
    }

    async insertMatchData(matchId, matchDate, mapId, gametypeId){

        await this.insertCarryTimes(matchId, matchDate, gametypeId, mapId);
        await this.insertPlayerMatchData(matchId, matchDate, mapId, gametypeId);

        await this.insertCarrierKills(matchId, matchDate, mapId, gametypeId);
        //console.log(this.powerUpHistory);
    

    }
}
