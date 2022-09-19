const Message = require("../message");
const Combogib = require("../combogib");

class CombogibManager{

    constructor(playerManager, killManager, lines, matchId, mapId, bIgnoreBots){
        
        this.playerManager = playerManager;
        this.killManager = killManager;

        this.lines = lines;

        this.matchId = matchId;
        this.mapId = mapId;
        this.bIgnoreBots = bIgnoreBots;
        //used by smartCTF mod like sp0ngeb0bs
        this.comboEvents = [];

        this.playerStats = [];

        this.playerBestCombos = {};

        this.multiKillCombos = [];


        this.bUsedComboEvents = false;
        this.bUsedComboDamageType = false;

        this.combogib = new Combogib();

        this.parseComboLines();

    }

    parseComboLines(){

        if(this.lines.length > 0){
            this.bUsedComboEvents = true;
        }

        for(let i = 0; i < this.lines.length; i++){

            this.addComboEvent(this.lines[i]);
        }
    }

    getPlayerStats(playerId){

        playerId = parseInt(playerId);

        for(let i = 0; i < this.playerStats.length; i++){

            const p = this.playerStats[i];

            if(p.player === playerId){

                return p;
            }
        }

        this.playerStats.push({
            "player": playerId,
            "kills":{
                "primary": 0,
                "shockBall": 0,
                "combo": 0
            },
            "deaths":{
                "primary": 0,
                "shockBall": 0,
                "combo": 0
            },
            "bestKillsSingleCombo": 0,
            "bestComboKillsSingleLife": 0,
            "comboKillsSinceLastDeath": 0,
            "lastDeath": -1,
            "bestPrimaryKillsLife": 0,
            "primaryKillsSinceDeath": 0,
            "bestShockBallKillsLife": 0,
            "shockBallKillsSinceDeath": 0,
            "bestSingleShockBall": 0
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
        const killerMatchId = parseInt(result[2]);
        const victimMatchId = parseInt(result[3]);

        const killerId = this.playerManager.getOriginalConnectionMasterId(killerMatchId);
        const victimId = this.playerManager.getOriginalConnectionMasterId(victimMatchId);

        const killer = this.getPlayerStats(killerId);
        const victim = this.getPlayerStats(victimId);

        killer.kills.combo++;
        victim.deaths.combo++;
 

        this.comboEvents.push({
            "timestamp": timestamp,
            "killer": killerId,
            "victim": victimId
        });
    }

    getComboKillsWithTimestamp(timestamp, bComboEvents){

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

        const player = this.getPlayerStats(playerId);

        if(player.bestKillsSingleCombo < kills){
            player.bestKillsSingleCombo = kills;
        }
  
    }

    //probably overkill checking if two different players get a combo at the exact same time
    createMultiComboKills(duplicateTimes){

        for(const timestamp of duplicateTimes){

            const killers = {};

            const currentKills = this.getComboKillsWithTimestamp(timestamp, true);

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

            const kills = this.getComboKillsWithTimestamp(timestamp, false);

            const players = {};

            for(let i = 0; i < kills.length; i++){

                //const player = this.playerManager.getOriginalConnectionMasterId(kills[i].player);
                const player = kills[i].player;

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


    updatePlayerBestSingleShockBall(playerId, totalKills){

        const stats = this.getPlayerStats(playerId);

        if(stats.bestSingleShockBall < totalKills){
            stats.bestSingleShockBall = totalKills;
        }
    }

    getShockBallKillsWithTimestamp(timestamp){

        timestamp = parseFloat(timestamp);

        const found = [];

        for(let i = 0; i < this.shockBallKills.length; i++){

            const s = this.shockBallKills[i];

            if(s.timestamp > timestamp) break;

            if(s.timestamp === timestamp){
                found.push(s);
            }
        }


        return found;
    }

    createMultiShockBallKills(){

        if(this.shockBallTimestamps === undefined) return;

        for(const [timestamp, kills] of Object.entries(this.shockBallTimestamps)){

            if(kills < 2) continue;

            const currentPlayerStats = {};

            const currentKills = this.getShockBallKillsWithTimestamp(timestamp);

            for(let i = 0; i < currentKills.length; i++){

                const k = currentKills[i];

                if(currentPlayerStats[k.player] === undefined){
                    currentPlayerStats[k.player] = 0;
                }

                if(k.player !== k.victim){
                    currentPlayerStats[k.player]++;
                }
            }

            for(const [playerId, bestKills] of Object.entries(currentPlayerStats)){

                this.updatePlayerBestSingleShockBall(playerId, bestKills);
            }
        }
    }

    createPlayerEvents(){
        

        if(this.comboEvents.length > 0){

            this.createMultiCombosFromComboEvents();
        }else{

            this.createMultiComboEventsFromKillsData();
        }

        this.createMultiShockBallKills();

        this.setPlayerStats();
        
    }

    createKillTypeData(){

        this.shockBallKills = [];
        this.shockBallTimestamps = {};
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
                "player": this.playerManager.getOriginalConnectionMasterId(k.killerId),
                "victim": this.playerManager.getOriginalConnectionMasterId(k.victimId)
            };

            if(deathType === "shockball"){

                this.shockBallKills.push(currentKill);

                if(this.shockBallTimestamps[k.timestamp] === undefined){
                    this.shockBallTimestamps[k.timestamp] = 0;
                }

                this.shockBallTimestamps[k.timestamp]++;
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

        //console.log(`Shock Ball kills = ${this.shockBallKills.length}, Primary Fire kills = ${this.primaryFireKills.length}, Combo Kills = ${this.comboKills.length}`);
    }


    updatePlayerStat(playerId, event, killType, timestamp){

        const player = this.getPlayerStats(playerId);

        const data = (event === "kill") ? player.kills : player.deaths;

        const deathsSinceLastEvent = this.killManager.getDeathsBetween(player.lastDeath, timestamp, playerId);

        if(deathsSinceLastEvent > 0){

            player.comboKillsSinceLastDeath = 0;
            player.shockBallKillsSinceDeath = 0;
            player.primaryKillsSinceDeath = 0;

            player.lastDeath = timestamp;
        }
    

        if(killType === "combo"){

            data.combo++;
            player.comboKillsSinceLastDeath++;

            if(player.comboKillsSinceLastDeath > player.bestComboKillsSingleLife){
                player.bestComboKillsSingleLife = player.comboKillsSinceLastDeath;
            }

        }else if(killType === "shockball"){

            data.shockBall++;

            player.shockBallKillsSinceDeath++;

            if(player.shockBallKillsSinceDeath > player.bestShockBallKillsLife){
                player.bestShockBallKillsLife = player.shockBallKillsSinceDeath;
            }

        }else if(killType === "primary"){

            data.primary++;

            player.primaryKillsSinceDeath++;

            if(player.primaryKillsSinceDeath > player.bestPrimaryKillsLife){
                player.bestPrimaryKillsLife = player.primaryKillsSinceDeath;
            }
        }

    }


    resetAllPlayerKillsSinceDeath(){

        for(let i = 0; i < this.playerStats.length; i++){

            const p = this.playerStats[i];

            p.comboKillsSinceLastDeath = 0;
        }
    }

    //set the stats with combo events if they have not been set with damagetypes
    setPlayersBestComboSingleLife(){


        this.resetAllPlayerKillsSinceDeath();

        const playersLastComboKill = {};

        for(let i = 0; i < this.comboEvents.length; i++){

            const e = this.comboEvents[i];

            if(playersLastComboKill[e.killer] === undefined){
                playersLastComboKill[e.killer] = e.timestamp;
            }

            const totalDeaths = this.killManager.getDeathsBetween(playersLastComboKill[e.killer], e.timestamp, e.killer);

            const playerStats = this.getPlayerStats(e.killer);

            if(totalDeaths === 0){

                playerStats.comboKillsSinceLastDeath++;

                if(playerStats.comboKillsSinceLastDeath > playerStats.bestComboKillsSingleLife){
                    playerStats.bestComboKillsSingleLife = playerStats.comboKillsSinceLastDeath;
                }

            }else{

                playerStats.comboKillsSinceLastDeath = 1;
            }

            playersLastComboKill[e.killer] = e.timestamp;
        }
    }


    setPlayerStats(){


        if(this.comboEvents.length === 0){

            for(let i = 0; i < this.comboKills.length; i++){
                
                const k = this.comboKills[i];

                this.updatePlayerStat(k.player, "kill", "combo", k.timestamp);
                this.updatePlayerStat(k.victim, "death", "combo", k.timestamp);
            }
        }


        for(let i = 0; i < this.shockBallKills.length; i++){

            const k = this.shockBallKills[i];

            this.updatePlayerStat(k.player, "kill", "shockball", k.timestamp);
            this.updatePlayerStat(k.victim, "death", "shockball", k.timestamp);
        }
            

        for(let i = 0; i < this.primaryFireKills.length; i++){

            const k = this.primaryFireKills[i];

            this.updatePlayerStat(k.player, "kill", "primary", k.timestamp);
            this.updatePlayerStat(k.victim, "death", "primary", k.timestamp);
        }


        //set player best kills with combos in single life but only with the combo events, 

        this.setPlayersBestComboSingleLife();
       
    }


    async insertPlayerMatchData(){

        try{

            for(const player of Object.values(this.playerStats)){

                if(this.playerManager.bPlayerBot(player.player) && this.bIgnoreBots){
                    break;
                }

                const combos = {
                    "kills": player.kills.combo,
                    "deaths": player.deaths.combo,
                    "efficiency": 0,
                    "best": player.bestComboKillsSingleLife,
                    "bestSingle": player.bestKillsSingleCombo
                };

                const shockBalls = {
                    "kills": player.kills.shockBall,
                    "deaths": player.deaths.shockBall,
                    "efficiency": 0,
                    "best": player.bestShockBallKillsLife,
                    "bestSingle": player.bestSingleShockBall
                };


                const primary = {
                    "kills": player.kills.primary,
                    "deaths": player.deaths.primary,
                    "efficiency": 0,
                    "best": player.bestPrimaryKillsLife
                };

                const killTypes = ["combo", "shockBall", "primary"];

                for(let i = 0; i < killTypes.length; i++){

                    const type = killTypes[i];

                    const kills = player.kills[type];
                    const deaths = player.deaths[type];

                    let efficiency = 0;

                    if(kills > 0){

                        if(deaths > 0){

                            efficiency = ((kills / (kills + deaths)) * 100).toFixed(5);

                        }else{
                            efficiency = 100;
                        }
                    }

                    if(i === 0){
                        combos.efficiency = efficiency;
                    }else if(i === 1){
                         shockBalls.efficiency = efficiency;
                    }else{
                        primary.efficiency = efficiency;
                    }
                }

                await this.combogib.insertPlayerMatchData(player.player, this.matchId, this.mapId, combos, shockBalls, primary);
            }

        }catch(err){
            console.trace(err);
            new Message(err,"error");
        }
    }

}


module.exports = CombogibManager;