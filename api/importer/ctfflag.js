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

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "taken", this.team);
    }

    async pickedUp(timestamp, playerId){

        this.bDropped = false;
        this.bAtBase = false;
        this.carriedBy = playerId;
        this.pickupTimestamps.push(timestamp);
        this.pickupPlayerIds.push(playerId);

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "pickedup", this.team);
    }

    async dropped(timestamp){

        await this.ctfManager.insertEvent(this.matchId, timestamp, this.carriedBy, "dropped", this.team);

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

    async captured(timestamp, playerId){

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "captured", this.team);
        this.reset(false);
    }
}

module.exports = CTFFlag;