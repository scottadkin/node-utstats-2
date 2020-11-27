const config = require('../../config.json');
const WeaponStats = require('./weaponstats');

class PlayerInfo{

    constructor(id, name, timeStamp){

        this.id = id;
        this.name = name;
        this.connects = [timeStamp];
        this.disconnects = [];
        this.teams = [];
        this.bBot = false;

        this.bWinner = false;
        this.bDrew = false;

        this.weaponStats = new Map();

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
            "currentMulti": 0,
            "fastestKill": 0,
            "slowestKill": 0,
            "bestspawnkillspree":0,
            "spawnKills": 0,
            "ctf": {
                "assist": 0,
                "return": 0,
                "taken": 0,
                "dropped": 0,
                "capture": 0,
                "pickedup": 0,
                "cover": 0,
                "kill": 0,
                "save": 0
            }
            //type === 'assist' || type === 'returned' || type === 'taken' || type === 'dropped' || type === 'captured' || type === 'pickedup'
        };

        this.lastDeath = -999;
        this.lastKill = timeStamp;


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

    killedPlayer(timeStamp, weapon){

        timeStamp = parseFloat(timeStamp);

        const timeDiff = timeStamp - this.lastKill;

        this.updateWeaponStats('kill', weapon);

        this.currentSpree++;

        if(timeDiff !== 0){
            if(timeDiff > this.stats.slowestKill || this.stats.slowestKill === 0){

                this.stats.slowestKill = timeDiff;
            }

            if(timeDiff < this.stats.fastestKill || this.stats.fastestKill === 0){
                this.stats.fastestKill = timeDiff;
            }
        }


        if(timeDiff <= config.multiKillTimeLimit){

            this.currentMulti++;

        }else{

            this.updateMultis();
            this.currentMulti++;
            
        }

        this.lastKill = timeStamp;
    }

    updateWeaponStats(type, weapon){

        if(this.weaponStats.has(weapon)){

            const stats = this.weaponStats.get(weapon);

            if(type === 'kill'){
                stats.killedPlayer();
            }else if(type === 'death'){
                stats.died();
            }

        }else{

            this.weaponStats.set(weapon, new WeaponStats(weapon));
            const stats = this.weaponStats.get(weapon);

            if(type === 'kill'){
                stats.killedPlayer();
            }else if(type === 'death'){
                stats.died();
            }

            //console.log(this.weaponStats);
        }
    }

    setWeaponStat(weapon, type, value){


        if(this.weaponStats.has(weapon)){

            const stats = this.weaponStats.get(weapon);

            stats.setValue(type, value);

        }else{

            this.weaponStats.set(weapon, new WeaponStats(weapon));
            const stats = this.weaponStats.get(weapon);

            stats.setValue(type, value);
        }
    }

    getTeam(){

        return this.teams[this.teams.length - 1].id;
    }
}


module.exports = PlayerInfo;