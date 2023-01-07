const Message =  require("../message");

class CTFFlag{

    constructor(ctfManager, playerManager, killManager, matchId, matchDate, mapId, team){

        console.log(`new CTFFlag with team of ${team}`);

        this.ctfManager = ctfManager;
        this.playerManager = playerManager;
        this.killManager = killManager;
        this.matchId = matchId;
        this.matchDate = matchDate;
        this.mapId = mapId;
        
        this.team = team;

        this.bDropped = false;
        this.bAtBase = true;
        this.carriedBy = null;

        this.pickups = [];

        this.takenTimestamp = null;
        this.takenPlayer = null;
        this.lastCarriedTimestamp = null;

        this.drops = [];

        this.covers = [];

        this.killedByTimestamps = [];
        this.killedByPlayerIds = [];

        this.seals = [];

        this.killsWithFlagTimestamps = [];
        this.killsWithFlagPlayerIds = [];

        this.carryTimes = [];

        this.selfCovers = [];

    }

    async reset(bCheckIfDropped){


        //this.debugSeals("RESET");

        if(bCheckIfDropped){

            if(this.bDropped){

                new Message(`Flag was dropped but not reset. Missing flag_returned_timeout event?`,"warning");
                await this.ctfManager.insertEvent(this.matchId, -1, -1, "returned", this.team);
            }
        }

        this.bDropped = false;
        this.bAtBase = true;
        this.carriedBy = null;
        this.takenTimestamp = null;
        this.drops = [];

        this.covers = [];

        this.pickups = [];
        this.killedByTimestamps = [];
        this.killedByPlayerIds = [];
        this.seals = [];
        this.lastCarriedTimestamp = null;
        this.carryTimes = [];
        this.selfCovers = [];
        this.takenPlayer = null;
    }

    async returned(timestamp, playerId){

        //this.debugSeals("RETURNED");

        await this.processSelfCovers(true);

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "returned", this.team);

        await this.reset(false);
    }

    async timedOutReturn(timestamp){

        //this.debugSeals("timedOutReturn");
        await this.processSelfCovers(true);

        await this.ctfManager.insertEvent(this.matchId, timestamp, -1, "returned_timeout", this.team);
        await this.reset(false);
    }

    async taken(timestamp, playerId){

        //just in case some data isn't reset
        //await this.reset(true);

        this.bDropped = false;
        this.bAtBase = false;
        this.carriedBy = playerId;
        this.takenTimestamp = timestamp;
        this.lastCarriedTimestamp = timestamp;
        this.takenPlayer = playerId;

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "taken", this.team);
    }

    async pickedUp(timestamp, playerId){

        this.bDropped = false;
        this.bAtBase = false;
        this.carriedBy = playerId;

        this.pickups.push({"timestamp": timestamp, "playerId": playerId});
     
        this.lastCarriedTimestamp = timestamp;

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "pickedup", this.team);
    }

    async dropped(timestamp){

        await this.ctfManager.insertEvent(this.matchId, timestamp, this.carriedBy, "dropped", this.team);

        await this.setCarryTime(timestamp);

        this.bDropped = true;
        this.bAtBase = false;
        this.drops.push({"playerId": this.carriedBy, "timestamp": timestamp});
        this.carriedBy = null;
    }

    async cover(timestamp, killerId, victimId){

        this.covers.push({
            "timestamp": timestamp,
            "killerId": killerId,
            "victimId": victimId
        });

        await this.ctfManager.insertEvent(this.matchId, timestamp, killerId, "cover", this.team);
    }

    async killed(timestamp, killerId){

        this.killedByTimestamps.push(timestamp);
        this.killedByPlayerIds.push(killerId);

        await this.ctfManager.insertEvent(this.matchId, timestamp, killerId, "killed", this.team);
    }

    async seal(timestamp, killerId){

        new Message(`SEAL by ${killerId} @ ${timestamp}`,"error");

        this.seals.push({"timestamp": timestamp, "playerId": killerId});
        await this.ctfManager.insertEvent(this.matchId, timestamp, killerId, "seal", this.team);
    }

    async setCarryTime(timestamp){

        const currentCarryTime = timestamp - this.lastCarriedTimestamp;

        const totalDeaths = this.killManager.getDeathsBetween(this.lastCarriedTimestamp, timestamp, this.carriedBy, false);

        const player = this.playerManager.getPlayerByMasterId(this.carriedBy);

        if(player === null){
            new Message(`CTFFlag.dropped() player is null`,"warning");
        }else{
            player.setCTFNewValue("carryTime", timestamp, totalDeaths, currentCarryTime);
        }

        const killsWhileCarrying = this.killManager.getKillsBetween(this.lastCarriedTimestamp, timestamp, this.carriedBy, false);

        if(killsWhileCarrying.length > 0){

            for(let i = 0; i < killsWhileCarrying.length; i++){
                const kill = killsWhileCarrying[i];
                await this.ctfManager.insertEvent(this.matchId, kill.timestamp, this.carriedBy, "self_cover", this.team);
            }

            if(killsWhileCarrying.length > player.stats.ctfNew.bestSingleSelfCover){
                player.stats.ctfNew.bestSingleSelfCover = killsWhileCarrying.length;
            }

            player.setCTFNewValue("selfCover", timestamp, totalDeaths, killsWhileCarrying.length);
            this.selfCovers.push({"player": this.carriedBy, "total": killsWhileCarrying.length, "timestamp": timestamp});
        }

        this.carryTimes.push({
            "taken": this.lastCarriedTimestamp,
            "dropped": timestamp,
            "player": this.carriedBy, 
            "carryTime": currentCarryTime
        });
    }

    debugSeals(message){

        if(this.sealPlayerIds.length > 0){
            console.log(`-------${message}-------------`);
            console.log(this.sealTimestamps);
            console.log(this.sealPlayerIds);
        }
    }


    async processSelfCovers(bFailed){

        for(let i = 0; i < this.selfCovers.length; i++){

            const s = this.selfCovers[i];

            const player = this.playerManager.getPlayerByMasterId(s.player);

            if(player === null){
                new Message(`CTFFlag.processSelfCovers() player is null`,"warning");
                continue;
            }

            if(!bFailed){

                const previousTimestamp = player.getCTFNewLastTimestamp("selfCoverPass");
                const totalDeaths = this.killManager.getDeathsBetween(previousTimestamp, s.timestamp, s.player);
                player.setCTFNewValue("selfCoverPass", s.timestamp, totalDeaths, s.total);

            }else{

                const previousTimestamp = player.getCTFNewLastTimestamp("selfCoverFail");
                const totalDeaths = this.killManager.getDeathsBetween(previousTimestamp, s.timestamp, s.player);
                player.setCTFNewValue("selfCoverFail", s.timestamp, totalDeaths, s.total);
            }
        }
    }

    getTotalSelfCovers(){

        let found = 0;

        for(let i = 0; i < this.selfCovers.length; i++){

            const s = this.selfCovers[i];
            found += s.total;
        }

        return found;
    }


    //covers used in nstats_ctf_covers only caps are counted
    async insertCovers(capId){

        for(let i = 0; i < this.covers.length; i++){

            //const timestamp = this.coverTimestamps[i];
            //const playerId = this.coverPlayerIds[i];

            //await this.ctfManager.insertCover(this.matchId, this.matchDate, this.mapId, capId, timestamp, killerId, victimId);
        }

    }

    async captured(timestamp, playerId){

        //this.debugSeals("CAPTURED");

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "captured", this.team);

        const travelTime = timestamp - this.takenTimestamp;

        await this.setCarryTime(timestamp);

        const assistIds = new Set();

        let totalCarryTime = 0;

        const assistVars = [];

        for(let i = 0; i < this.carryTimes.length; i++){

            const c = this.carryTimes[i];

            totalCarryTime += c.carryTime;

            //don't want to count the capped player as an assist.
            if(this.carriedBy !== c.player){

                await this.ctfManager.insertEvent(this.matchId, timestamp, c.player, "assist", this.team);
                assistIds.add(c.player);

                assistVars.push(c);
            }
        }

        

        //insertAssist(matchId, matchDate, mapId, capId, playerId, pickupTime, droppedTime, carryTime)
        for(const playerId of assistIds){

            const player = this.playerManager.getPlayerByMasterId(playerId);

            if(player === null){
                new Message(`CTFFlag.captured() player is null`,"warning");
                continue;
            }

            
            const lastEventTimestamp = player.getCTFNewLastTimestamp("assist"); 
            const totalDeaths = this.killManager.getDeathsBetween(lastEventTimestamp, timestamp, player.masterId, false);
            player.setCTFNewValue("assist", timestamp, totalDeaths);
        }

        await this.processSelfCovers(false);


        const capPlayer = this.playerManager.getPlayerByMasterId(this.carriedBy);

        if(capPlayer !== null){

            //console.log(capPlayer);
            const capTeam = this.playerManager.getPlayerTeamAt(this.carriedBy, timestamp);

            const timeDropped = travelTime - totalCarryTime;

            console.log(`${capTeam} capped the ${this.team} flag. TravelTime ${travelTime}, carryTime ${totalCarryTime}, timeDropped ${timeDropped}`);

          
            const totalSelfCovers = this.getTotalSelfCovers();

            //await this.ctfManager.insertCap(this.matchId, this.matchDate, capTeam, this.team, this.takenTimestamp, this.takenPlayer, timestamp, this.carriedBy, travelTime, carryTime, dropTime);
            const capId = await this.ctfManager.insertCap(
                this.matchId, 
                this.matchDate, 
                this.mapId,
                capTeam, 
                this.team, 
                this.takenTimestamp, 
                this.takenPlayer, 
                timestamp, 
                this.carriedBy, 
                travelTime, 
                totalCarryTime, 
                timeDropped,
                this.drops.length,
                this.pickups.length,
                this.covers.length,
                this.seals.length,
                assistIds.size, 
                totalSelfCovers,
            );

            for(let i = 0; i < assistVars.length; i++){

                const a = assistVars[i];

                await this.ctfManager.insertAssist(this.matchId, this.matchDate, this.mapId, capId, a.player, a.taken, a.dropped, a.carryTime);
            }


            await this.insertCovers(capId);

        }else{
            new Message(`capPlayer is null`,"warning");
        }
        
        

        this.reset(false);
    }
}

module.exports = CTFFlag;