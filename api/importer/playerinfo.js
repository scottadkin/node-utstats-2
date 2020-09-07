class PlayerInfo{

    constructor(id, name, timeStamp){

        this.id = id;
        this.name = name;
        this.connects = [timeStamp];
        this.disconnects = [];
        this.teams = [];
        this.bBot = false;
        this.stats = {
            "sprees": {
                "spree": 0,
                "rampage": 0,
                "dominating": 0,
                "unstoppable": 0,
                "godlike": 0,
                "massacre": 0,
            },
            "multis": {
                "double": 0,
                "multi": 0,
                "mega": 0,
                "ultra": 0,
                "monster": 0,
                "ludicrous": 0,
                "holyshit": 0
            },
            "bestSpree": 0,
            "bestMulti": 0,
            "currentSpree": 0,
            "currentMulti": 0
        };

        this.lastDeath = -999;
        this.lastKill = -999;

        //console.log(this);

    }

    connect(timeStamp){
        this.connects.push(timeStamp);
    }

    disconnect(timeStamp){
        this.disconnects.push(timeStamp);
    }

    setTeam(timeStamp, id){

        this.teams.push({
            "time": parseFloat(timeStamp),
            "id": parseInt(id)
        });
    }

    setAsBot(){
        this.bBot = true;
    }

    setFace(face){
        this.face = face;
    }

    setVoice(voice){
        this.voice = voice;
    }

    setNetspeed(speed){
        this.netSpeed = parseFloat(speed);
    }

    setStatsValue(key, value, bInt){

        if(bInt === undefined){
            this.stats[key] = value;
            return;
        }

        this.stats[key] = parseFloat(value);
    }

    died(timeStamp){

        this.lastDeath = parseFloat(timeStamp);
        this.currentSpree = 0;
        this.currentMulti = 0;
    }

    killedPlayer(timeStamp){

    }
}


module.exports = PlayerInfo;