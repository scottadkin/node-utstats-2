const Message =  require("../message");

class CTFFlag{

    constructor(ctfManager, matchId, team){

        this.ctfManager = ctfManager;
        this.matchId = matchId;
        console.log(`new CTFFlag with team of ${team}`);

        this.team = team;

        this.bDropped = false;
        this.bAtBase = true;
        this.carriedBy = null;

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

    }

    async reset(bCheckIfDropped){


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
    }

    async returned(timestamp, playerId){

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "returned", this.team);

        await this.reset(false);
    }

    async timedOutReturn(timestamp){

        await this.ctfManager.insertEvent(this.matchId, timestamp, -1, "returned_timeout", this.team);
        await this.reset(false);
    }

    async taken(timestamp, playerId){

        //just in case some data isn't reset
        await this.reset(true);

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

    async dropped(playerManager, killManager, timestamp){

        await this.ctfManager.insertEvent(this.matchId, timestamp, this.carriedBy, "dropped", this.team);

        this.setCarryTime(timestamp, playerManager, killManager);

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

        this.sealTimestamps.push(timestamp);
        this.sealPlayerIds.push(killerId);
        await this.ctfManager.insertEvent(this.matchId, timestamp, killerId, "seal", this.team);
    }

    setCarryTime(timestamp, playerManager, killManager){

        const currentCarryTime = timestamp - this.lastCarriedTimestamp;

        const totalDeaths = killManager.getDeathsBetween(this.lastCarriedTimestamp, timestamp, this.carriedBy, false);

        const player = playerManager.getPlayerByMasterId(this.carriedBy);

        if(player === null){
            new Message(`CTFFlag.dropped() player is null`,"warning");
        }else{
            player.setCTFNewValue("carryTime", timestamp, totalDeaths, currentCarryTime);
        }

        this.carryTimes.push({
            "taken": this.lastCarriedTimestamp,
            "dropped": timestamp,
            "player": this.carriedBy, 
            "carryTime": currentCarryTime
        });
    }

    async captured(playerManager, killManager, timestamp, playerId){

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "captured", this.team);

        this.setCarryTime(timestamp, playerManager, killManager);

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

            const player = playerManager.getPlayerByMasterId(playerId);

            if(player === null){
                new Message(`CTFFlag.captured() player is null`,"warning");
                continue;
            }

            const lastEventTimestamp = player.getCTFNewLastTimestamp("assist"); 
            const totalDeaths = killManager.getDeathsBetween(lastEventTimestamp, timestamp, player.masterId, false);
            player.setCTFNewValue("assist", timestamp, totalDeaths);

        }

        this.reset(false);
    }
}

module.exports = CTFFlag;