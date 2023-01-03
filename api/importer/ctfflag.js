const Message =  require("../message");

class CTFFlag{

    constructor(ctfManager, playerManager, killManager, matchId, team){

        this.ctfManager = ctfManager;
        this.playerManager = playerManager;
        this.killManager = killManager;
        this.matchId = matchId;
        console.log(`new CTFFlag with team of ${team}`);

        this.team = team;

        this.bDropped = false;
        this.bAtBase = true;
        this.carriedBy = null;

        this.pickupTimestamps = [];
        this.pickupPlayerIds = [];

        this.takenTimestamp = null;
        this.lastCarriedTimestamp = null;

        this.droppedTimestamps = [];
        this.droppedPlayerIds = [];

        this.coverTimestamps = [];
        this.coverPlayerIds = [];

        this.killedByTimestamps = [];
        this.killedByPlayerIds = [];

        this.sealTimestamps = [];
        this.sealPlayerIds = [];

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
        this.droppedTimestamps = [];
        this.droppedPlayerIds = [];
        this.coverTimestamps = [];
        this.coverPlayerIds = [];
        this.pickupTimestamps = [];
        this.pickupPlayerIds = [];
        this.killedByTimestamps = [];
        this.killedByPlayerIds = [];
        this.sealTimestamps = [];
        this.sealPlayerIds = [];
        this.lastCarriedTimestamp = null;
        this.carryTimes = [];
        this.selfCovers = [];
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

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "taken", this.team);
    }

    async pickedUp(timestamp, playerId){

        this.bDropped = false;
        this.bAtBase = false;
        this.carriedBy = playerId;
        this.pickupTimestamps.push(timestamp);
        this.pickupPlayerIds.push(playerId);
        this.lastCarriedTimestamp = timestamp;

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "pickedup", this.team);
    }

    async dropped(timestamp){

        await this.ctfManager.insertEvent(this.matchId, timestamp, this.carriedBy, "dropped", this.team);

        await this.setCarryTime(timestamp);

        this.bDropped = true;
        this.bAtBase = false;
        this.droppedPlayerIds.push(this.carriedBy);
        this.droppedTimestamps.push(timestamp);
        this.carriedBy = null;
    }

    async cover(timestamp, playerId){

        this.coverTimestamps.push(timestamp);
        this.coverPlayerIds.push(playerId);

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "cover", this.team);
    }

    async killed(timestamp, killerId){

        this.killedByTimestamps.push(timestamp);
        this.killedByPlayerIds.push(killerId);

        await this.ctfManager.insertEvent(this.matchId, timestamp, killerId, "killed", this.team);
    }

    async seal(timestamp, killerId){

        new Message(`SEAL by ${killerId} @ ${timestamp}`,"error");

        this.sealTimestamps.push(timestamp);
        this.sealPlayerIds.push(killerId);

        console.log(this.sealTimestamps);
        console.log(this.sealPlayerIds);

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

            console.log(s);

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

    async captured(timestamp, playerId){

        //this.debugSeals("CAPTURED");

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "captured", this.team);

        await this.setCarryTime(timestamp);

        const assistIds = new Set();

        for(let i = 0; i < this.carryTimes.length; i++){

            const c = this.carryTimes[i];

            //don't want to count the capped player as an assist.
            if(this.carriedBy !== c.player){
                await this.ctfManager.insertEvent(this.matchId, timestamp, c.player, "assist", this.team);
                assistIds.add(c.player);
            }
        }

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

        this.reset(false);
    }
}

module.exports = CTFFlag;