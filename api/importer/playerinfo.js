import config from '../../config.js';

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
                "brutalizing": 0
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

    setIp(ip, country){
        this.ip = ip;
        this.country = country;
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

        this.updateSprees();
        this.updateMultis();
        this.currentSpree = 0;
        this.currentMulti = 0;
    }


    updateMultis(){


        if(this.currentMulti > this.stats.bestMulti){
            this.stats.bestMulti = this.currentMulti;
        }

        const m = this.currentMulti;

        if(m === 2){
            this.stats.multis.double++;
        }else if(m === 3){
            this.stats.multis.multi++;
        }else if(m === 4){
            this.stats.multis.mega++;
        }else if(m === 5){
            this.stats.multis.ultra++;
        }else if(m === 6){
            this.stats.multis.monster++;
        }else if(m === 7){
            this.stats.multis.ludicrous++;
        }else if(m >= 8){
            this.stats.multis.holyshit++;
        }

        this.currentMulti = 0;

    }

    updateSprees(){

        if(this.currentSpree > this.stats.bestSpree){
            this.stats.bestSpree = this.currentSpree;
        }

        const k = this.currentSpree;

        if(k >= 5 && k < 10){
            this.stats.sprees.spree++;
        }else if(k >= 10 && k < 15){
            this.stats.sprees.rampage++;
        }else if(k >= 15 && k < 20){
            this.stats.sprees.dominating++;
        }else if(k >= 20 && k < 25){
            this.stats.sprees.unstoppable++;
        }else if(k >= 25 && k < 30){
            this.stats.sprees.godlike++;
        }else if(k >= 30 && k < 35){
            this.stats.sprees.massacre++;
        }else if(k >= 35){
            this.stats.spree.brutalizing++;
        }

        this.currentSpree = 0;
    }

    killedPlayer(timeStamp){

        timeStamp = parseFloat(timeStamp);

        const timeDiff = timeStamp - this.lastKill;

       // console.log(`timeDiff = ${timeDiff}`);

        this.currentSpree++;


        if(timeDiff <= config.multiKillTimeLimit){

            this.currentMulti++;

        }else{

            this.updateMultis();
            this.currentMulti++;
            
        }

        this.lastKill = timeStamp;



    }
}


export default PlayerInfo;