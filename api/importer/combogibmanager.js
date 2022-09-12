const Message = require("../message");

class CombogibManager{

    constructor(playerManager, killManager, lines){
        
        this.playerManager = playerManager;
        this.killManager = killManager;

        this.lines = lines;
        //used by smartCTF mod like sp0ngeb0bs
        this.comboEvents = [];

        this.playerStats = [];

        this.playerBestCombos = {};

        this.multiKillCombos = [];

        this.parseComboLines();

    }

    parseComboLines(){

        for(let i = 0; i < this.lines.length; i++){

            this.addComboEvent(this.lines[i]);
        }
    }

    getPlayerStats(playerId){

        for(let i = 0; i < this.playerStats.length; i++){

            const p = this.playerStats[i];

            if(p.player === playerId){

                return p;
            }
        }

        this.playerStats.push({
            "player": playerId,
            "kills": 0,
            "deaths": 0,
            "bestKillsSingleCombo": 0,
            "bestCombosSingleLife": 0
        });

        return this.playerStats[this.playerStats.length - 1];
    }

    addComboEvent(line){

        const reg = /^(\d+\.\d+)\tcombo_kill\t(\d+)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){

            new Message(`CombogibManager.addKill() reg.exec(line) result was null.`,"warning");
            return;
        }

        const timestamp = parseFloat(result[1]);
        const killer = parseInt(result[2]);
        const victim = parseInt(result[3]);

        this.comboEvents.push({
            "timestamp": timestamp,
            "killer": this.playerManager.getOriginalConnectionMasterId(killer),
            "victim": this.playerManager.getOriginalConnectionMasterId(victim)
        });
    }

    getKillsWithTimestamp(timestamp, bComboEvents){

        timestamp = parseFloat(timestamp);
        const found = [];

        const events = (bComboEvents) ? this.comboEvents : this.comboKills;

        for(let i = 0; i < events.length; i++){

            const k = events[i];

            if(k.timestamp > timestamp) break;

            if(k.timestamp === timestamp){
                found.push(k);
            }

        }

        return found;
    }

    updatePlayerBestSingleComboKill(playerId, kills){

        //playerId = this.playerManager.getOriginalConnectionMasterId(playerId);

        if(this.playerBestCombos[playerId] === undefined){
            this.playerBestCombos[playerId] = 0;
        }

        if(this.playerBestCombos[playerId] < kills){
            this.playerBestCombos[playerId] = kills;
        }
    }

    //probably overkill checking if two different players get a combo at the exact same time
    createMultiComboKills(duplicateTimes){

        for(const timestamp of duplicateTimes){

            const killers = {};

            const currentKills = this.getKillsWithTimestamp(timestamp, true);

            for(let i = 0; i < currentKills.length; i++){

                const k = currentKills[i];

                const killer = k.killer;
                const victim = k.victim;


                if(killers[killer] === undefined){
                    killers[killer] = 0;
                }

                if(killer !== victim) killers[killer]++;
            }

            for(const [key, value] of Object.entries(killers)){

                if(value < 2) continue;

                this.multiKillCombos.push({"timestamp": timestamp, "player": parseInt(key), "kills": value});
                this.updatePlayerBestSingleComboKill(key, value);
            }
        }
    }

    //combos captured as combo_kill\tkiller\tvictim
    createMultiCombosFromComboEvents(){

        let previousTimestamp = -1;

        const duplicateTimes = new Set();

        for(let i = 0; i < this.comboEvents.length; i++){

            const {timestamp} = this.comboEvents[i];

            if(timestamp === previousTimestamp){
                duplicateTimes.add(timestamp);
            }

            previousTimestamp = timestamp;
        }
        
        this.createMultiComboKills(duplicateTimes);

    }

    createMultiComboEventsFromKillsData(){

        this.comboMultiKillsAlt = [];

        for(const [timestamp, totalKills] of Object.entries(this.comboKillTimestamps)){

            if(totalKills <= 1) continue;

            const kills = this.getKillsWithTimestamp(timestamp, false);

            const players = {};

            for(let i = 0; i < kills.length; i++){

                const player = this.playerManager.getOriginalConnectionMasterId(kills[i].player);

                if(players[player] === undefined) players[player] = 0;

                players[player]++;
            }


            for(const [player, kills] of Object.entries(players)){

                if(kills > 1){
                    this.comboMultiKillsAlt.push({"timestamp": parseFloat(timestamp), "player": parseInt(player), "kills": kills});
                    this.updatePlayerBestSingleComboKill(player, kills);
                }
            }
        }

    }

    createPlayerEvents(){
        

        //if(this.comboEvents.length > 0){

            this.createMultiCombosFromComboEvents();
       // }else{

            this.createMultiComboEventsFromKillsData();
       // }

        console.log("----------------------------------");
        console.log(this.multiKillCombos);
        console.log(this.comboMultiKillsAlt);

        console.log(this.playerBestCombos);
        
    }

    createKillTypeData(){

        this.shockBallKills = [];
        this.primaryFireKills = [];
        this.comboKills = [];
        this.comboKillTimestamps = {};

        for(let i = 0; i < this.killManager.kills.length; i++){

            const k = this.killManager.kills[i];

            if(k.killerId === k.victimId || k.type.toLowerCase() == "suicide") continue;

            const deathType = k.deathType.toLowerCase();

            if(deathType !== "shockball" && deathType !== "jolted" && deathType !== "combo") continue;

            const currentKill = {
                "timestamp": k.timestamp,
                "player": k.killerId
            };

            if(deathType === "shockball"){
                this.shockBallKills.push(currentKill);
            }

            if(deathType === "jolted"){
                this.primaryFireKills.push(currentKill);
            }

            if(deathType === "combo"){

                this.comboKills.push(currentKill);

                if(this.comboKillTimestamps[k.timestamp] === undefined){
                    this.comboKillTimestamps[k.timestamp] = 0;
                }

                this.comboKillTimestamps[k.timestamp]++;
            }
        }

        console.log(`Shock Ball kills = ${this.shockBallKills.length}, Primary Fire kills = ${this.primaryFireKills.length}, Combo Kills = ${this.comboKills.length}`);
    }

}


module.exports = CombogibManager;