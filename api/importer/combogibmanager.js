const Message = require("../message");
const Combogib = require("../combogib");

class CombogibManager{

    constructor(playerManager, killManager, lines, gametypeId, matchId, mapId, bIgnoreBots, matchLength){
        
        this.playerManager = playerManager;
        this.killManager = killManager;

        this.matchLength = matchLength;

        this.lines = lines;

        this.gametypeId = gametypeId;
        this.matchId = matchId;
        this.mapId = mapId;
        this.bIgnoreBots = bIgnoreBots;
        //used by smartCTF mod like sp0ngeb0bs
        this.comboEvents = [];
        this.insaneComboEvents = [];

        this.playerStats = [];

        this.playerBestCombos = {};

        this.multiKillCombos = [];

        this.shockBallKills = [];
        this.shockBallTimestamps = {};
        this.primaryFireKills = [];
        this.comboKills = [];
        this.comboKillTimestamps = {};


        this.bUsedComboEvents = false;
        this.bUsedComboDamageType = false;

        this.combogib = new Combogib();

        this.parseComboLines();

    }

    parseComboLines(){

        if(this.lines.length > 0){
            this.bUsedComboEvents = true;
        }

        const insaneLines = [];
        const insaneReg = /^\d+?\.\d+?\tcombo_insane\t.+$/i;

        for(let i = 0; i < this.lines.length; i++){

            const check = insaneReg.test(this.lines[i]);

            if(check){
                insaneLines.push(this.lines[i]);
            }else{
                this.addComboEvent(this.lines[i]);
            }          
        }

        for(let i = 0; i < insaneLines.length; i++){

            this.createInsaneComboEvent(insaneLines[i]);
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
                "combo": 0,
                "insane": 0
            },
            "deaths":{
                "primary": 0,
                "shockBall": 0,
                "combo": 0,
                "insane": 0
            },
            "bestKillsSingleCombo": 0,
            "bestComboKillsSingleLife": 0,
            "comboKillsSinceLastDeath": 0,
            "lastDeath": -1,
            "bestPrimaryKillsLife": 0,
            "primaryKillsSinceDeath": 0,
            "bestShockBallKillsLife": 0,
            "shockBallKillsSinceDeath": 0,
            "bestSingleShockBall": 0,
            "insaneKillsSinceDeath": 0,
            "singleInsaneCombo": 0,
            "bestInsaneKillsSingleLife": 0
        });

        return this.playerStats[this.playerStats.length - 1];
    }

    createInsaneComboEvent(line){

        const reg = /^(\d+?\.\d+?)\tcombo_insane\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null) return;

        const timestamp = parseFloat(result[1]);
        const killerId = parseInt(result[2]);

        const player = this.playerManager.getPlayerById(killerId);

        this.insaneComboEvents.push({"timestamp": timestamp, "killer": player.masterId});

        const matchingComboEvent = this.getComboEvent(timestamp, player.masterId);

        if(matchingComboEvent !== null){

            const killer = this.getPlayerStats(matchingComboEvent.killer);
            const victim = this.getPlayerStats(matchingComboEvent.victim);

            const totalKillsWithSingle = this.getTotalInsaneComboKillsWithTimestamp(timestamp, player.masterId);

            if(killer.singleInsaneCombo < totalKillsWithSingle){
                killer.singleInsaneCombo = totalKillsWithSingle;
            }

        
            killer.kills.insane++;
            victim.deaths.insane++;

        }else{

            new Message(`matchingComboEvent is null`,"warning");
        }
   
    }

    getComboEvent(timestamp, player){

        for(let i = 0; i < this.comboEvents.length; i++){

            const e = this.comboEvents[i];

            if(e.timestamp > timestamp) return null;

            if(e.timestamp === timestamp){

                if(e.killer === player) return e;
            }
        }

        return null;
    }

    addComboEvent(line){

        const reg = /^(\d+\.\d+)\tcombo_kill\t(\d+)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){

            //new Message(`CombogibManager.addKill() reg.exec(line) result was null.`,"warning");
            return;
        }

        const timestamp = parseFloat(result[1]);
        const killerMatchId = parseInt(result[2]);
        const victimMatchId = parseInt(result[3]);

        const killerInfo = this.playerManager.getPlayerById(killerMatchId);
        const victimInfo = this.playerManager.getPlayerById(victimMatchId);

        const killer = this.getPlayerStats(killerInfo.masterId);
        const victim = this.getPlayerStats(victimInfo.masterId);

        killer.kills.combo++;
        victim.deaths.combo++;
 

        this.comboEvents.push({
            "timestamp": timestamp,
            "killer": killerInfo.masterId,
            "victim": victimInfo.masterId,
        });

    }


    getTotalInsaneComboKillsWithTimestamp(timestamp, player){

        timestamp = parseFloat(timestamp);
        let found = 0;

        const events = this.insaneComboEvents;

        for(let i = 0; i < events.length; i++){

            const k = events[i];
            if(k.timestamp > timestamp) break;

            if(k.timestamp === timestamp){
                if(k.killer === player){
                    found++;
                }
            }

        }

        return found;

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

        this.createDetailedPlayerStats();
        
    }

    createKillTypeData(){

        for(let i = 0; i < this.killManager.kills.length; i++){

            const k = this.killManager.kills[i];

            if(k.killerId === k.victimId || k.type.toLowerCase() == "suicide") continue;

            const deathType = k.deathType.toLowerCase();

            if(deathType !== "shockball" && deathType !== "jolted" && deathType !== "combo" && deathType !== "shockcombo") continue;


            const currentKill = {
                "timestamp": k.timestamp,
                "player": k.killerId,
                "victim": k.victimId
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

            if(deathType === "combo" || deathType === "shockcombo"){

                if(this.bComboInsane(currentKill.timestamp, currentKill.player)){

                    currentKill.bInsane = true;
                }else{
                    currentKill.bInsane = false;
                }

                this.comboKills.push(currentKill);

                if(this.comboKillTimestamps[k.timestamp] === undefined){
                    this.comboKillTimestamps[k.timestamp] = 0;
                }

                this.comboKillTimestamps[k.timestamp]++;
            }
        }

        //console.log(`Shock Ball kills = ${this.shockBallKills.length}, Primary Fire kills = ${this.primaryFireKills.length}, Combo Kills = ${this.comboKills.length}`);
    }

    bComboInsane(timestamp, killer){


        for(let i = 0; i < this.insaneComboEvents.length; i++){

            const e = this.insaneComboEvents[i];

            if(e.timestamp > timestamp) return false;

            if(e.timestamp === timestamp){
                if(e.killer === killer){
                    return true;
                }
            }
        }
        
        return false;
    }


    updatePlayerStatCombo(event, data, player){

        //stop duplicate data(sp0ngeb0b method + damage type)
        if(this.comboEvents.length === 0){
            data.combo++;
        }

        if(event === "kill"){

            player.comboKillsSinceLastDeath++;

            if(player.comboKillsSinceLastDeath > player.bestComboKillsSingleLife){
                player.bestComboKillsSingleLife = player.comboKillsSinceLastDeath;
            }

            if(player.bestKillsSingleCombo === 0){
                player.bestKillsSingleCombo = 1;
            }
        }

    }

    updatePlayerStat(playerId, event, killType, timestamp){

        const player = this.getPlayerStats(playerId);

        const data = (event === "kill") ? player.kills : player.deaths;

        const deathsSinceLastEvent = this.killManager.getDeathsBetween(player.lastDeath, timestamp, playerId);

        if(deathsSinceLastEvent > 0 || event === "death"){

            player.comboKillsSinceLastDeath = 0;
            player.shockBallKillsSinceDeath = 0;
            player.primaryKillsSinceDeath = 0;
            player.insaneKillsSinceDeath = 0;
            
            player.lastDeath = timestamp;
        }


        if(killType === "combo"){

            this.updatePlayerStatCombo(event, data, player);
            

        }else if(killType === "insane"){

            this.updatePlayerStatCombo(event, data, player);
            
            //stop duplicate counting
            if(this.comboEvents.length === 0){
                data.insane++;
            }

            if(event === "kill"){

                player.insaneKillsSinceDeath++;

                if(player.insaneKillsSinceDeath > player.bestInsaneKillsSingleLife){
                    player.bestInsaneKillsSingleLife = player.insaneKillsSinceDeath;
                }
            }
            
        }else if(killType === "shockball"){

            data.shockBall++;

            if(event === "kill"){

                player.shockBallKillsSinceDeath++;

                if(player.shockBallKillsSinceDeath > player.bestShockBallKillsLife){
                    player.bestShockBallKillsLife = player.shockBallKillsSinceDeath;
                }

                if(player.bestSingleShockBall === 0){
                    player.bestSingleShockBall = 1;
                }     
            }

        }else if(killType === "primary"){

            data.primary++;

            if(event === "kill"){

                player.primaryKillsSinceDeath++;

                if(player.primaryKillsSinceDeath > player.bestPrimaryKillsLife){
                    player.bestPrimaryKillsLife = player.primaryKillsSinceDeath;
                }
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

        let insaneFound = 0;
        

        //if(this.comboEvents.length === 0){

            for(let i = 0; i < this.comboKills.length; i++){
                
                const k = this.comboKills[i];

                const type = (k.bInsane) ? "insane" : "combo";

                if(type === "insane"){
                    insaneFound++;
                }

                this.updatePlayerStat(k.player, "kill", type, k.timestamp);
                this.updatePlayerStat(k.victim, "death", type, k.timestamp);
            }
        //}


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


    createDetailedPlayerStats(){

        this.detailedStats = {};

        const killTypes = ["combo", "shockBall", "primary", "insane"];

        for(const player of Object.values(this.playerStats)){

            const combos = {
                "kills": player.kills.combo,
                "deaths": player.deaths.combo,
                "efficiency": 0,
                "best": player.bestComboKillsSingleLife,
                "bestSingle": player.bestKillsSingleCombo,
                "kpm": 0
            };

            const shockBalls = {
                "kills": player.kills.shockBall,
                "deaths": player.deaths.shockBall,
                "efficiency": 0,
                "best": player.bestShockBallKillsLife,
                "bestSingle": player.bestSingleShockBall,
                "kpm": 0
            };


            const primary = {
                "kills": player.kills.primary,
                "deaths": player.deaths.primary,
                "efficiency": 0,
                "best": player.bestPrimaryKillsLife,
                "kpm": 0
            };

            const insane = {
                "kills": player.kills.insane,
                "deaths": player.deaths.insane,
                "efficiency": 0,
                "best": player.bestInsaneKillsSingleLife,
                "bestSingle": player.singleInsaneCombo,
                "kpm": 0
            };


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
                }else if(i === 2){
                    primary.efficiency = efficiency;
                }else{
                    insane.efficiency = efficiency;
                }
            }

            const playtime = this.playerManager.getPlayerPlaytime(player.player);

            if(playtime !== null){

                if(playtime !== 0){

                    const minutes = playtime / 60;

                    if(combos.kills > 0){
                        combos.kpm = combos.kills / minutes;
                    }
                    if(insane.kills > 0){
                        insane.kpm = insane.kills / minutes;
                    }
                    if(primary.kills > 0){
                        primary.kpm = primary.kills / minutes;
                    }
                    if(shockBalls.kills > 0){
                        shockBalls.kpm = shockBalls.kills / minutes;
                    }
                }
            }

            this.detailedStats[player.player] = {
                "playtime": playtime,
                "combos": combos,
                "insane": insane,
                "primary": primary,
                "shockBalls": shockBalls
            };
        }
    }


    async insertPlayerMatchData(){

        try{

            if(this.detailedStats === undefined){
                throw new Error("This.detailedStats is undefined");
            }

            //console.log(this.detailedStats);

            for(const [key,value] of Object.entries(this.detailedStats)){

                if(this.playerManager.bPlayerBot(key) && this.bIgnoreBots){
                    break;
                }

                console.log(key);
                const {combos, insane, shockBalls, primary, playtime} = value;

                await this.combogib.insertPlayerMatchData(key, this.gametypeId, this.matchId, this.mapId, playtime, combos, shockBalls, primary, insane);

                await this.combogib.updatePlayerTotals(key, this.gametypeId, this.mapId, this.matchId, playtime, combos, insane, shockBalls, primary);
            }            

        }catch(err){
            console.trace(err);
            new Message(err,"error");
        }
    }


    getMatchTotals(){

        const totals = {
            "combos":{
                "kills": 0,
                "deaths": 0,
                "efficiency": 0,
                "best": 0,
                "bestPlayerId": -1,
                "bestSingle": 0,
                "bestSinglePlayerId": -1,
                "kpm": 0,
                "mostKills": 0,
                "mostKillsPlayerId": -1,
            },
            "insane":{
                "kills": 0,
                "deaths": 0,
                "efficiency": 0,
                "best": 0,
                "bestSingle": 0,
                "bestPlayerId": -1,
                "bestSinglePlayerId": -1,
                "kpm": 0,
                "mostKills": 0,
                "mostKillsPlayerId": -1
            },
            "shockBalls":{
                "kills": 0,
                "deaths": 0,
                "efficiency": 0,
                "best": 0,
                "bestPlayerId": -1,
                "bestSingle": 0,
                "bestSinglePlayerId": -1,
                "kpm": 0,
                "mostKills": 0,
                "mostKillsPlayerId": -1,
            },
            "primary":{
                "kills": 0,
                "deaths": 0,
                "efficiency": 0,
                "best": 0,
                "bestPlayerId": -1,
                "kpm": 0,
                "mostKills": 0,
                "mostKillsPlayerId": -1,
            }
        };

        const types = ["combos", "insane", "primary", "shockBalls"];

        for(const [playerId, playerData] of Object.entries(this.detailedStats)){

            for(let i = 0; i < types.length; i++){

                const t = types[i]

                totals[t].kills += playerData[t].kills;
                totals[t].deaths += playerData[t].deaths;

                if(totals[t].mostKills < playerData[t].kills){
                    totals[t].mostKills = playerData[t].kills;
                    totals[t].mostKillsPlayerId = parseInt(playerId);
                }

                if(totals[t].best < playerData[t].best){
                    totals[t].best = playerData[t].best;
                    totals[t].bestPlayerId = parseInt(playerId);
                }

                if(totals[t].bestSingle !== undefined){

                    if(totals[t].bestSingle < playerData[t].bestSingle){
                        totals[t].bestSingle = playerData[t].bestSingle;
                        totals[t].bestSinglePlayerId = parseInt(playerId);
                    }
                }
            }
        }

        const minutes = this.matchLength / 60;

        for(const type of Object.keys(totals)){

            const kills = totals[type].kills;
            const deaths = totals[type].deaths;

            if(kills > 0){

                totals[type].kpm = kills / minutes;

                if(deaths > 0){

                    totals[type].efficiency = (kills / (kills + deaths)) * 100;

                }else{
                    totals[type].efficiency = 100;
                }
            } 
        }

        return totals;

    }

    async updateMapTotals(){

        //await this.combogib.updateMapTotals(this.mapId, this.matchLength, combos, shockBalls, primary, insane);
        const {combos, shockBalls, primary, insane} = this.getMatchTotals();

        await this.combogib.updateMapTotals(this.mapId, this.gametypeId, this.matchId, this.matchLength, combos, shockBalls, primary, insane);
        
    }

}


module.exports = CombogibManager;