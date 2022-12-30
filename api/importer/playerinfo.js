const config = require('../../config.json');
const WeaponStats = require('./weaponstats');
const Message = require("../message");

class PlayerInfo{

    constructor(id, name, timeStamp, bSpectator){

        this.id = id;
        this.name = name;
        this.connects = [timeStamp];
        this.disconnects = [];
        this.teams = [];
        this.bBot = false;
        this.bSpectator = (bSpectator === undefined) ? false : bSpectator;
        this.face = 0;
        this.faceId = 0;

        this.bPlayedInMatch = !this.bSpectator;

        this.bWinner = false;
        this.bDrew = false;


        this.weaponStats = new Map();

        this.stats = {
            "frags":0,
            "score":0,
            "kills":0,
            "killsNormalRange": 0,
            "killsLongRange": 0,
            "killsUberRange": 0,
            "killTotalDistance": 0,
            "killMinDistance": null,
            "killAverageDistance": 0,
            "killMaxDistance": 0,
            "deaths":0,
            "suicides":0,
            "teamkills": 0,
            "firstBlood": 0,
            "headshots": 0,
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
            "accuracy": 0,
            "ctfNew":{
                "return":{
                    "total": 0,
                    "currentLife": 0,
                    "bestLife": 0,
                    "lastTimestamp": 0
                },
                "returnMid":{
                    "total": 0,
                    "currentLife": 0,
                    "bestLife": 0,
                    "lastTimestamp": 0
                },
                "returnBase":{
                    "total": 0,
                    "currentLife": 0,
                    "bestLife": 0,
                    "lastTimestamp": 0
                },
                "returnEnemyBase":{
                    "total": 0,
                    "currentLife": 0,
                    "bestLife": 0,
                    "lastTimestamp": 0
                },
                "returnSave":{
                    "total": 0,
                    "currentLife": 0,
                    "bestLife": 0,
                    "lastTimestamp": 0
                },
                "dropped":{
                    "total": 0,
                    "currentLife": 0,
                    "bestLife": 0,
                    "lastTimestamp": 0
                },
                "kill":{
                    "total": 0,
                    "currentLife": 0,
                    "bestLife": 0,
                    "lastTimestamp": 0
                },
                "suicide":{"total": 0},
                "seal":{
                    "total": 0,
                    "currentLife": 0,
                    "bestLife": 0,
                    "lastTimestamp": 0
                },
                "cover":{
                    "total": 0,
                    "currentLife": 0,
                    "bestLife": 0,
                    "lastTimestamp": 0
                },
                "coverPass":{
                    "total": 0,
                    "bestLife": 0,
                    "currentLife": 0,
                    "lastTimestamp": 0
                },
                "coverFail":{
                    "total": 0,
                    "bestLife": 0,
                    "currentLife": 0,
                    "lastTimestamp": 0
                },
                "capture":{
                    "total": 0,
                    "bestLife": 0,
                    "currentLife": 0,
                    "lastTimestamp": 0
                },
                
            },
            "ctf": {
                "assist": 0,
                "return": 0,
                "returnBest": 0,//most flag returns in one life
                "currentReturns": 0,
                "returnMid": 0,
                "returnBase": 0,
                "returnEnemyBase": 0,
                "save": 0,
                "taken": 0,
                "dropped": 0,
                "capture": 0,
                "pickup": 0,
                "cover": 0,
                "seal": 0,
                "coverFail": 0, //covers where the flag was returned 
                "coverPass": 0, //covers where the flag was capped
                "selfCover": 0, //kills while carrying the flag
                "selfCoverPass": 0, //capped self covers
                "selfCoverFail": 0, //returned self covers
                "multiCover": 0, // player got 3 covers during one flag
                "spreeCover": 0, // player got 4 or more covers during one flag
                "bestCover": 0, //most covers during one flag
                "bestSelfCover": 0, //most self covers during one flag
                "kill": 0,
                "carryTime": 0,
                "pickupTime": 0,
                "suicide": 0 //suicide while carrying flag
            },
            "dom": {
                "caps": 0,
                "mostCapsLife": 0,
                "mostCapsSinglePoint": 0,
                "lastCapTime": 0,
                "currentCaps": 0
            },
            "assault": {
                "caps": 0
            },
            "monsterHunt": {
                "kills": 0,
                "bestKillsInLife": 0,
                "currentKills": 0,
                "lastKill": 0,
                "deaths": 0
            },
            "time_on_server": 0,
            "teamPlaytime": {
                "0": 0,
                "1": 0,
                "2": 0,
                "3": 0,
                "255": 0,
            }
            //type === 'assist' || type === 'returned' || type === 'taken' || type === 'dropped' || type === 'captured' || type === 'pickedup'
        };

        this.lastDeath = -999;
        this.lastKill = timeStamp;
        this.lastSpawn = timeStamp;
        this.timeAlive = 0;

        this.spawns = [];

        //console.log(this);

    }

    connect(timeStamp, bSpectator){

        this.connects.push(timeStamp);

        if(bSpectator !== undefined){
            this.bSpectator = true;
        }else{
            this.bSpectator = false;
            this.bPlayedInMatch = true;
        }
    }

    disconnect(timeStamp){

        this.disconnects.push(timeStamp);

    }

    bDuplicateTeamData(timestamp, id){

        let t = 0;

        for(let i = 0; i < this.teams.length; i++){

            t = this.teams[i];

            if(t.time === timestamp && t.id === id){
                return true;
            }
        }

        return false;
    }

    setTeam(timestamp, id){

        timestamp = parseFloat(timestamp);
        id = parseInt(id);

        if(!this.bDuplicateTeamData(timestamp, id)){
            this.teams.push({
                "time": timestamp,
                "id": id
            });
        }
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

    //return true if player was spawnkilled, false if not
    died(timestamp, weapon){


        this.lastSpawn = this.getPreviousSpawn(timestamp);

        if(this.lastSpawn !== null){
            this.timeAlive += timestamp - this.lastSpawn;
        }

        //console.log(`I died to ${weapon}`);
        if(weapon !== undefined){
            this.updateWeaponStats('death', weapon);
        }

        this.updateMonsterHuntSprees();

        const deathTimestamp = parseFloat(timestamp);

        this.lastDeath = deathTimestamp

        this.updateSprees();
        this.updateMultis();
        this.currentSpree = 0;
        this.currentMulti = 0;

        if(this.lastSpawn !== null){

            if(timestamp - this.lastSpawn < config.spawnKillTimeLimit){
                return true;
            }
        }


        return false;
    }


    updateMultis(){


        if(this.stats.currentMulti > this.stats.bestMulti){
            this.stats.bestMulti = this.stats.currentMulti;
        }

        const m = this.stats.currentMulti;

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

        this.stats.currentMulti = 0;

    }

    updateSprees(){


        if(this.stats.currentSpree > this.stats.bestSpree){
            this.stats.bestSpree = this.stats.currentSpree;
        }

        const k = this.stats.currentSpree;

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
            this.stats.sprees.brutalizing++;
        }

        this.stats.currentSpree = 0;
    }


    updateKillDistances(distance){

        distance = parseFloat(distance);

        this.stats.killTotalDistance += distance;

        if(this.stats.killTotalDistance !== 0 && this.stats.kills !== 0){
            this.stats.killAverageDistance = this.stats.killTotalDistance / this.stats.kills;
        }

        if(distance > this.stats.killMaxDistance){
            this.stats.killMaxDistance = distance;
        }

        if(distance < this.stats.killMinDistance || this.stats.killMinDistance === null){
            this.stats.killMinDistance = distance;
        }

    }


    killedPlayer(timestamp, weapon, distance){

        timestamp = parseFloat(timestamp);

        const timeDiff = timestamp - this.lastKill;

        this.updateKillDistances(distance);

        this.updateWeaponStats('kill', weapon);

        this.stats.currentSpree++;

        if(timeDiff !== 0){

            if(timeDiff > this.stats.slowestKill || this.stats.slowestKill === 0){

                this.stats.slowestKill = timeDiff;
            }

            if(timeDiff < this.stats.fastestKill || this.stats.fastestKill === 0){
                this.stats.fastestKill = timeDiff;
            }
        }


        if(timeDiff <= config.multiKillTimeLimit){

            this.stats.currentMulti++;

        }else{

            this.updateMultis();
            
        }

        if(distance <= 1536){
            this.stats.killsNormalRange++;

        }else if(distance > 1536 && distance <= 3072 ){
            this.stats.killsLongRange++;

        }else if(distance > 3072){
            this.stats.killsUberRange++;
        }

        this.lastKill = timestamp;
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

        if(this.teams.length === 0) return 255;

        return this.teams[this.teams.length - 1].id;
    }

    getTeamAt(timestamp){

        let t = 0;

        timestamp = parseFloat(timestamp);

        let currentTeam = -1;

        for(let i = 0; i < this.teams.length; i++){

            t = this.teams[i];

            if(t.time <= timestamp){
                currentTeam = t.id;
            }else{
                break;
            }
        }

        return currentTeam;
    }

    getPreviousSpawn(timestamp){

        let s = 0;

        for(let i = this.spawns.length - 1; i >= 0; i--){

            s = this.spawns[i];

            if(s.timestamp < timestamp){
                return s.timestamp;
            }
        }

        return null;

    }

    updateMonsterHuntSprees(){

        if(this.stats.monsterHunt.currentKills > this.stats.monsterHunt.bestKillsInLife){

            this.stats.monsterHunt.bestKillsInLife = this.stats.monsterHunt.currentKills;
        }

        this.stats.monsterHunt.currentKills = 0;
    }

    matchEnded(){

        this.updateSprees();
        this.updateMultis();
        this.updateMonsterHuntSprees();
    }

    getCurrentSpree(){

        return this.stats.currentSpree;
    }

    onASpree(){

        if(this.stats.currentSpree >= 5){
            return true;
        }

        return false;
    }

    killedMonster(timestamp){

        this.stats.monsterHunt.kills++;
        this.stats.monsterHunt.currentKills++;
        this.stats.monsterHunt.lastKill = timestamp;
    }

    diedToMonster(){
        this.stats.monsterHunt.deaths++;
    }   


    setCTFNewValue(type, timestamp, totalDeaths, value){

        if(timestamp === null){
            this.stats.ctfNew[type].total++;
            return;
        }

        if(value === undefined) value = 1;

        if(totalDeaths > 0){
            this.stats.ctfNew[type].currentLife = 0;
        }


        this.stats.ctfNew[type].total += value;
        this.stats.ctfNew[type].lastTimestamp = timestamp;
        this.stats.ctfNew[type].currentLife++;

        const bestLife = this.stats.ctfNew[type].bestLife;
        const currentLife = this.stats.ctfNew[type].currentLife;

        if(bestLife < currentLife){
            this.stats.ctfNew[type].bestLife = currentLife;
        }
    }

    getCTFNewLastTimestamp(type){


        if(type === "return_closesave"){
            type = "returnSave";
        }else if(type === "return_enemybase"){
           type = "returnEnemyBase";
        }else if(type === "return_mid"){
            type = "returnMid"
        }else if(type === "return_base"){
            type = "returnBase";
        }else if(type === "returned"){
            type = "return";
        }

        return this.stats.ctfNew[type].lastTimestamp;
    }

    setCTFNewCovers(coverType, totalCovers, bestCovers, currentCovers, timestamp){

        const data = this.stats.ctfNew[coverType];

        data.total += totalCovers;

        if(data.bestLife < bestCovers){
            data.bestLife = bestCovers;
        }

        data.currentLife = currentCovers;
        data.lastTimestamp = timestamp;
    }
}


module.exports = PlayerInfo;