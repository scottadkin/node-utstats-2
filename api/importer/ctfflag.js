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

    }

    async returned(timestamp, playerId){

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "returned", this.team);

        this.bDropped = false;
        this.bAtBase = true;
        this.carriedBy = null;
        this.takenTimestamp = null;
        this.droppedTimestamps = [];
    }

    async taken(playerId, timestamp){

        console.log(`${this.team} flag was taken by ${playerId}`);
        this.bDropped = false;
        this.bAtBase = false;
        this.carriedBy = playerId;
        this.takenTimestamp = timestamp;

        await this.ctfManager.insertEvent(this.matchId, timestamp, playerId, "taken", this.team);
    }

    async dropped(timestamp){

        await this.ctfManager.insertEvent(this.matchId, timestamp, this.carriedBy, "dropped", this.team);

        this.bDropped = true;
        this.bAtBase = false;
        this.carriedBy = null;
        this.droppedTimestamps.push(timestamp);
    }
}

module.exports = CTFFlag;