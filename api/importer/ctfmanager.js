const CTF = require("../ctf");
const Message = require("../message");
const CTFFlag = require("./ctfflag");

class CTFManager{

    constructor(){

        this.bHaveNStatsData = false;

        this.lines = [];

        this.flagKills = [];
        this.flagReturns = [];
        this.flagTaken = [];

        this.flagDrops = [];

        this.flagDropLocations = [];
        this.flagReturnLocations = [];
        this.smartCTFReturnInfo = [];

        this.flags = [];

        this.returnTypes = [
            "flag_returned", 
            "flag_return_mid",
            "flag_return_base",
            "flag_return_enemybase",
            "flag_return_closesave",
            "flag_returned_timeout"
        ];

        this.ctf = new CTF();
    }


    createFlags(){

        for(let i = 0; i < this.totalTeams; i++){

            this.flags.push(new CTFFlag(
                this.ctf, 
                this.playerManager, 
                this.killManager, 
                this.matchId, 
                this.matchDate, 
                this.mapId, 
                i,
                this.totalTeams
            ));
        }   
    }

    getLineTimestamp(line){

        const timestampReg = /^(\d+?\.\d+?)\t.+$/i;

        const timestampResult = timestampReg.exec(line);

        if(timestampResult === null){

            new Message(`Timestamp regular expression failed.`,"error");
            return null;
        }

        return parseFloat(timestampResult[1]);
    }

    getLineType(line){

        const typeReg = /\d+?\.\d+?\t(.+?)\t.+/i;

        const result = typeReg.exec(line);

        if(result === null){

            new Message(`Event type regular expression failed.`,"error");
            return null;
        }

        return result[1];
    }


    getLineNstatsType(line){

        const reg = /\d+?\.\d+?\tnstats\t(.+?)\t.+/i;

        const result = reg.exec(line);

        if(result === null) return null;

        return result[1];
    }


    getFlagsCarriedBy(playerId){

        const carrying = [];

        for(let i = 0; i < this.flags.length; i++){

            const f = this.flags[i];

            if(f.carriedBy === playerId){
                carrying.push(f.team);
            }
        }

        return carrying;
    }

    async createNstatsFlagKill(timestamp, data){

        const killerId = parseInt(data[1]);
        const victimId = parseInt(data[2]);

        const killDistance = parseFloat(data[3]);
        const distanceToEnemyBase = parseFloat(data[4]);
        const distanceToCap = parseFloat(data[5]);

        const killer = this.playerManager.getPlayerById(killerId);
        const victim = this.playerManager.getPlayerById(victimId);


        //

        if(killer !== null && victim !== null){

            if(killer.masterId === victim.masterId){     

                //new Message("flag suicide", "note");

                killer.stats.ctf.suicide++;
                killer.setCTFNewValue("suicide", null);

                const killerTeam = this.playerManager.getPlayerTeamAt(killer.masterId, timestamp);

                const flagsInPossession = this.getFlagsCarriedBy(killer.masterId);

                for(let i = 0; i < flagsInPossession.length; i++){

       
                    await this.ctf.insertEvent(this.matchId, timestamp, killer.masterId, "suicide", killerTeam);
                    

                    await this.flags[flagsInPossession[i]].killed(
                        timestamp, 
                        killer.masterId, 
                        killerTeam, 
                        -1, 
                        killerTeam, 
                        0, 
                        distanceToCap, 
                        distanceToEnemyBase
                    );
                }
     

            }else{

                killer.stats.ctf.kill++;

                const lastTimestamp = killer.getCTFNewLastTimestamp("kill");
                const totalDeaths = this.killManager.getDeathsBetween(lastTimestamp, timestamp, killer.masterId, false)

                killer.setCTFNewValue("kill", timestamp, totalDeaths);

                //const killerTeam = this.playerManager.getPlayerTeamAt(killer.masterId, timestamp);

                //await this.flags[killerTeam].killed(timestamp, killer.masterId);

                const killerTeam = this.playerManager.getPlayerTeamAt(killer.masterId, timestamp);
                const victimTeam = this.playerManager.getPlayerTeamAt(victim.masterId, timestamp);

                const flagsInPossession = this.getFlagsCarriedBy(victim.masterId);

                for(let i = 0; i < flagsInPossession.length; i++){

 
                    await this.ctf.insertEvent(this.matchId, timestamp, killer.masterId, "kill", killerTeam);
                    

                    await this.flags[flagsInPossession[i]].killed(
                        timestamp, 
                        killer.masterId, 
                        killerTeam, 
                        victim.masterId, 
                        victimTeam, 
                        killDistance, 
                        distanceToCap, 
                        distanceToEnemyBase
                    );
                }
            }
        }
    }


    async createFlagKill(timestamp, line){

        const smartCTFReg = /^\d+?\.\d+?\tflag_kill\t(\d+)$/i;
        const nstatsCTFReg = /^\d+?\.\d+?\tnstats\tflag_kill\t(\d+?)\t(\d+?)\t(.+?)\t(.+?)\t(.+?)$/i;

        //Work around a bug where sometimes the flag_kill is not saved to log by UTStats, so use nstats one instead.
        if(!this.bHaveNStatsData){

            if(smartCTFReg.test(line)){


                const result = smartCTFReg.exec(line);          

                const playerId = parseInt(result[1]);

                const killer = this.playerManager.getPlayerById(playerId);

                if(killer === null){
                    new Message(`CreateFlagKill killer is null`,"error");
                    return;
                }

                const lastTimestamp = killer.getCTFNewLastTimestamp("kill");
                const totalDeaths = this.killManager.getDeathsBetween(lastTimestamp, timestamp, killer.masterId, false);
                //await this.ctf.insertEvent(this.matchId, timestamp, killerId, "kill", this.team));
                killer.setCTFNewValue("kill", timestamp, totalDeaths);


                const killInfo = this.killManager.getMatchingKillNoVictim(timestamp, killer.masterId);


                if(killInfo === null){
                    new Message(`CTFManager.createFlagKIll() killInfo is null.`,"warning");
                    return;
                }

                const victim = this.playerManager.getPlayerByMasterId(killInfo.victimId);

                if(victim === null){
                    new Message(`CreateFlagKill victim is null`,"error");
                    return;
                }

                //console.log(killInfo);

                const killerTeam = this.playerManager.getPlayerTeamAt(killer.masterId, timestamp);
                const victimTeam = this.playerManager.getPlayerTeamAt(victim.masterId, timestamp);

                const droppedFlags = this.getDroppedFlags(timestamp, killInfo.victimId);
         
                if(droppedFlags.length === 0){
                    new Message(`CTFManager.createFlagKill() droppedFlags.length is 0`,"warning");
                }

                for(let i = 0; i < droppedFlags.length; i++){

                    const d = droppedFlags[i];

                    //await this.ctf.insertEvent(this.matchId, d.timestamp, killer.masterId, "kill", killerTeam);

           
                    await this.ctf.insertEvent(this.matchId, timestamp, killer.masterId, "kill",  d.flagTeam);
                    

                    await this.flags[d.flagTeam].killed(
                        timestamp, 
                        killer.masterId, 
                        killerTeam, 
                        victim.masterId, 
                        victimTeam, 
                        -1,//killDistance, 
                        -1, 
                        -1
                    );
                }
            }
        }

        if(nstatsCTFReg.test(line)){

            const result = nstatsCTFReg.exec(line);

            if(result !== null){
                await this.createNstatsFlagKill(timestamp, result);
            }
        }  
    }

    async createFlagTaken(timestamp, line){

        const reg = /^.+?\tflag_taken\t(\d+?)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){
            new Message(`Flag Taken regular expression failed`,"error");
            return null;
        }

        const playerId = parseInt(result[1]);
        const flagTeam = parseInt(result[2]);

        const player = this.playerManager.getPlayerById(playerId);

        if(player === null){
            new Message(`createFlagTaken player is null.`,"error");
            return;
        }


        const previousTimestamp = player.getCTFNewLastTimestamp("taken");
        const totalDeaths = this.killManager.getDeathsBetween(previousTimestamp, timestamp, player.masterId);

        player.setCTFNewValue("taken", timestamp, totalDeaths);

        await this.flags[flagTeam].taken(timestamp, player.masterId);

    }



    async timedOutReturn(timestamp, timeoutResult){

        const flagTeam = parseInt(timeoutResult[1]);

        this.processFlagCovers(flagTeam, true);
        this.processFlagSeals(flagTeam, true);

        await this.flags[flagTeam].timedOutReturn(timestamp);

    }

    async createFlagReturned(timestamp, line){

        const reg = /^.+?\tflag_(.+?)\t(\d+?)\t(\d+)$/i;

        //57.86	flag_returned_timeout	1
        const timeoutReg = /^.+?\tflag_returned_timeout\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){

            const timeoutResult = timeoutReg.exec(line);

            if(timeoutResult !== null){
                await this.timedOutReturn(timestamp, timeoutResult);
                return;
            }

            new Message(`createFlagReturned regular expressions failed.`, "warning");
            return;
        }

        const type = result[1].toLowerCase();

        const playerId = parseInt(result[2]);
        const flagTeam = parseInt(result[3]);

        const player = this.playerManager.getPlayerById(playerId);

        if(player === null){
            new Message(`createFlagReturned player is null`,"error");
            return;
        }

        const lastEventTimestamp = player.getCTFNewLastTimestamp(type);
        
        const totalDeaths = this.killManager.getDeathsBetween(lastEventTimestamp, timestamp, player.masterId, false);

        if(type === "returned"){
            player.setCTFNewValue("return", timestamp, totalDeaths);
            //dont want to process returns more than once as the other return_<type> are always logged at same time
            this.processFlagCovers(flagTeam, true);
            this.processFlagSeals(flagTeam, true);

            const smartCTFInfo = this.getSmartCTFReturnString(timestamp, flagTeam);

            await this.flags[flagTeam].returned(timestamp, player.masterId, smartCTFInfo);
        }

        if(type === "return_closesave"){
            player.setCTFNewValue("returnSave", timestamp, totalDeaths);
        }

        if(type === "return_enemybase"){
            player.setCTFNewValue("returnEnemyBase", timestamp, totalDeaths);
        }

        if(type === "return_mid"){
            player.setCTFNewValue("returnMid", timestamp, totalDeaths);
        }

        if(type === "return_base"){
            player.setCTFNewValue("returnBase", timestamp, totalDeaths);
        }

    }

    async createFlagDropped(timestamp, line){

        const reg = /^.+?\tflag_dropped\t(\d+?)\t(\d+)$/;

        const result = reg.exec(line);

        if(result === null){
            new Message(`createFlagDropped regular expression failed.`);
            return;
        }

        const playerId = parseInt(result[1]);

        const player = this.playerManager.getPlayerById(playerId);

        if(player === null){
            new Message(`createFlagDropped player is null`,"error");
            return;
        }

        //await this.flags[flagTeam].dropped(timestamp);

        //for 4 way CTF
        await this.dropAllFlags(player, timestamp);

    }

    async createFlagCover(timestamp, line){

        const reg = /^\d+?\.\d+?\tflag_cover\t(\d+?)\t(\d+?)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){
            new Message(`createFlagCover regular expression failed.`);
            return;
        }

        const killerId = parseInt(result[1]);
        const victimId = parseInt(result[2]);
        const killerTeam = parseInt(result[3]);

        const killer = this.playerManager.getPlayerById(killerId);

        if(killer === null){
            new Message(`createFlagCover killer is null`,"error");
            return;
        }

        const victim = this.playerManager.getPlayerById(victimId);

        if(victim === null){
            new Message(`createFlagCover victim is null`,"error");
            return;
        }

        const lastTimestamp = killer.getCTFNewLastTimestamp("cover");
        const totalDeaths = this.killManager.getDeathsBetween(lastTimestamp, timestamp, killer.masterId, false);

        killer.setCTFNewValue("cover", timestamp, totalDeaths);

        const victimTeam = this.playerManager.getPlayerTeamAt(victim.masterId, timestamp);

        await this.flags[victimTeam].cover(timestamp, killer.masterId, victim.masterId);

    }

    async createFlagPickedUp(timestamp, line){

        const reg = /^\d+?\.\d+?\tflag_pickedup\t(\d+?)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){
            new Message(`createFlagPickedup regular expression failed.`);
            return;
        }

        const playerId = parseInt(result[1]);
        const flagTeam = parseInt(result[2]);


        const holder = this.playerManager.getPlayerById(playerId);

        if(holder === null){
            new Message(`createFlagPickedUp flag holder is null`,"error");
            return;
        }

        //holder.stats.ctf.pickup++;

        const lastTimestamp = holder.getCTFNewLastTimestamp("pickup");
        const totalDeaths = this.killManager.getDeathsBetween(lastTimestamp, timestamp, holder.masterId);

        holder.setCTFNewValue("pickup", timestamp, totalDeaths);

        const holderTeam = this.playerManager.getPlayerTeamAt(holder.masterId, timestamp);

        await this.flags[flagTeam].pickedUp(timestamp, holder.masterId, holderTeam);
    }

    async createFlagSeal(timestamp, line){

        const reg = /^\d+?\.\d+?\tflag_seal\t(\d+?)\t(\d+?)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){
            new Message(`createFlagSeal regular expression failed.`);
            return;
        }

        const killerId = parseInt(result[1]);
        const victimId = parseInt(result[2]);
        const killerTeam = parseInt(result[3]);

        const killer = this.playerManager.getPlayerById(killerId);

        if(killer === null){
            new Message(`CreateFlagSeal killer is null`,"error");
            return;
        }

        const victim = this.playerManager.getPlayerById(victimId);

        if(victim === null){
            new Message(`CreateFlagSeal victim is null`,"error");
            return;
        }

        const lastEventTimestamp = killer.getCTFNewLastTimestamp("seal"); 
        const totalDeaths = this.killManager.getDeathsBetween(lastEventTimestamp, timestamp, killer.masterId, false);

        killer.setCTFNewValue("seal", timestamp, totalDeaths);

        await this.flags[killerTeam].seal(timestamp, killer.masterId, victim.masterId);
    }

    //need because flag drops logs before flag kills(when no nstats are present)
    getDroppedFlags(timestamp, droppedPlayerId){

        const found = [];

        for(let i = 0; i < this.flagDrops.length; i++){

            const f = this.flagDrops[i];

            if(f.timestamp < timestamp) continue;
            if(f.timestamp > timestamp ) break;
            
            if(f.playerId === droppedPlayerId){
                found.push(f);
            }
        }

        return found;
    }

    async createFlagCaptured(timestamp, line){

        const reg = /^\d+?\.\d+?\tflag_captured\t(\d+?)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){
            new Message(`createFlagCaptured result is null.`,"error");
            return;
        }

        const playerId = parseInt(result[1]);
        const flagTeam = parseInt(result[2]);

        const player = this.playerManager.getPlayerById(playerId);

        if(player === null){
            new Message(`createFlagCaptrued player is null`, "error");
            return;
        }

       
        const lastEventTimestamp = player.getCTFNewLastTimestamp("capture"); 

        const totalDeaths = this.killManager.getDeathsBetween(lastEventTimestamp, timestamp, player.masterId, false);
    
        //console.log(`${timestamp} player ${player.masterId} capped the ${flagTeam} flag, previous cap was ${lastEventTimestamp} deaths since${totalDeaths}`);

        this.processFlagSeals(flagTeam, false);
        this.processFlagCovers(flagTeam, false);

        await this.flags[flagTeam].captured(timestamp, player.masterId, totalDeaths);

        player.setCTFNewValue("capture", timestamp, totalDeaths);

        

        //console.log(result);
    }

    parseLocations(){

        const reg = /^(\d+?\.\d+)\tnstats\t(fdl|frl|ftor)\t(\d+?)\t(.+?)\,(.+?)\,(.+)$/i;
        const flagLocationReg = /^(\d+?\.\d+)\tnstats\tflag_location\t(\d+?)\t(.+?)\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.lines.length; i++){

            const line = this.lines[i];
 
            if(reg.test(line)){

                const result = reg.exec(line);

                const timestamp = parseFloat(result[1]);
                const event = result[2];
                const flagTeam = parseInt(result[3]);

                const location = {
                    "x": parseFloat(result[4]),
                    "y": parseFloat(result[5]),
                    "z": parseFloat(result[6]),
                };

                /*if(event === "frl"){

                    this.flagReturnLocations.push({
                        "timestamp": timestamp,
                        "flagTeam": flagTeam,
                        "location": location,
                        "bTimedOut": false
                    });

                }else if(event === "ftor"){
                    
                    this.flagReturnLocations.push({
                        "timestamp": timestamp,
                        "flagTeam": flagTeam,
                        "location": location,
                        "bTimedOut": true
                    });
                    
                }else*/
                if(event === "fdl"){

                    this.flagDropLocations.push({
                        "timestamp": timestamp,
                        "flagTeam": flagTeam,
                        "location": location
                    });
                }
            }

            if(flagLocationReg.test(line)){

                const result = flagLocationReg.exec(line);

                const flagTeam = parseInt(result[2]);

                if(this.flags[flagTeam] !== undefined){

                    const location = {
                        "x": parseFloat(result[3]),
                        "y": parseFloat(result[4]),
                        "z": parseFloat(result[5])
                    };

                    this.flags[flagTeam].setFlagStandLocation(location);
                }
            }
        }

    }

    getSmartCTFReturnString(timestamp, flagTeam){

        for(let i = 0; i < this.smartCTFReturnInfo.length; i++){

            const info = this.smartCTFReturnInfo[i];

            if(info.timestamp > timestamp) break;

            if(info.timestamp === timestamp && info.flagTeam === flagTeam){
                return info.string;
            }
        }

        return "N/A";
    }

    parseSmartCTFReturns(){

        const reg = /^(\d+?\.\d+?)\tflag_(return.+?)\t\d+?\t(\d+)$/i

        for(let i = 0; i < this.lines.length; i++){

            const line = this.lines[i];

            const result = reg.exec(line);

            if(result !== null){

                //always gets logged with smartCTF returns
                if(result[2] === "returned") continue;

                const timestamp = parseFloat(result[1]);
                const flagTeam = parseInt(result[3]);
                const locationString = result[2];

                this.smartCTFReturnInfo.push({
                    "timestamp": timestamp,
                    "flagTeam": flagTeam,
                    "string": locationString
                });
            }
        }
    }

    async parseData(matchStartTimestamp){

        
        this.parseSmartCTFReturns();
        this.parseLocations();

        this.matchStartTimestamp = matchStartTimestamp;

   
        for(let i = 0; i < this.lines.length; i++){

            const line = this.lines[i];

            const timestamp = this.getLineTimestamp(line);

            if(timestamp === null) continue;

            if(timestamp < matchStartTimestamp){

                //new Message(`CTF event happened before match start timestamp(Warmup)`,"warning");
                continue;
            }

            const eventType = this.getLineType(line);

            if(eventType === null) continue;

            if(eventType === "nstats"){

                const nstatsType = this.getLineNstatsType(line);

                if(nstatsType === null) continue;

                if(nstatsType === "flag_kill"){
                    await this.createFlagKill(timestamp, line);
                }
            }

            if(eventType === "flag_kill"){
          
                await this.createFlagKill(timestamp, line);         
            }

            if(eventType === "flag_taken"){

                await this.createFlagTaken(timestamp, line);
            }

            if(this.returnTypes.indexOf(eventType) !== -1){
                await this.createFlagReturned(timestamp, line);
            }

            if(eventType === "flag_dropped"){
                await this.createFlagDropped(timestamp, line);
            }

            if(eventType === "flag_cover"){
                await this.createFlagCover(timestamp, line);
            }

            if(eventType === "flag_pickedup"){
                await this.createFlagPickedUp(timestamp, line);
            }

            if(eventType === "flag_seal"){
                await this.createFlagSeal(timestamp, line);
            }

            if(eventType === "flag_captured"){
                await this.createFlagCaptured(timestamp, line);
            }
            //console.log(line);
        }

        this.debugDisplayAllPlayers();
    }

    debugDisplayAllPlayers(){

        for(let i = 0; i < this.playerManager.players.length; i++){

            const p = this.playerManager.players[i];

            //console.log(p.name);
            //console.log(p.stats.ctfNew);
        }
    }

    getDropLocation(timestamp, flagTeam){

        for(let i = 0; i < this.flagDropLocations.length; i++){

            const d = this.flagDropLocations[i];

            if(d.timestamp > timestamp) break;

            if(d.flagTeam === flagTeam && d.timestamp === timestamp){
                return d.location;
            }
        }

       // new Message(`CTFManager.getDropLocation() Didnt find drop location`,"warning");

        return {"x": 0, "y": 0, "z": 0};
    }

    getDistanceToCapping(playerTeam, targetLocation){

        if(this.flags[playerTeam] === undefined) return null;

        const flag = this.flags[playerTeam];

        if(flag.flagStand === null) return -1;

        const distanceX = flag.flagStand.x - targetLocation.x;
        const distanceY = flag.flagStand.y - targetLocation.y;
        const distanceZ = flag.flagStand.z - targetLocation.z;

        return Math.hypot(distanceX, distanceY, distanceZ);
    }

    async dropAllFlags(player, timestamp){

        const currentTeam = this.playerManager.getPlayerTeamAt(player.masterId, timestamp);

        for(let i = 0; i < this.flags.length; i++){

            const flag = this.flags[i];           

            if(flag.carriedBy === player.masterId){

                const dropLocation = this.getDropLocation(timestamp, i);

                let distanceToCap = 0;

                distanceToCap = this.getDistanceToCapping(currentTeam, dropLocation);
               
                await flag.dropped(timestamp, dropLocation, distanceToCap, currentTeam);

                const lastTimestamp = player.getCTFNewLastTimestamp("dropped");
                const totalDeaths = this.killManager.getDeathsBetween(lastTimestamp, timestamp, player.masterId, false);

                //player.stats.ctf.dropped++;
                player.setCTFNewValue("dropped", timestamp, totalDeaths);

                this.flagDrops.push({"timestamp": timestamp, "playerId": player.masterId,  "flagTeam": flag.team});
            }
        }
    }


    async updatePlayerMatchStats(){

        for(let i = 0; i < this.playerManager.players.length; i++){

            const player = this.playerManager.players[i];

            await this.ctf.updatePlayerMatchStats(player.masterId, this.matchId, player.stats.ctf);
            
        }
    }

    async insertPlayerMatchData(serverId, mapId, gametypeId){

        new Message("CTFManager.insertPlayerMatchData()", "note");

        for(let i = 0; i < this.playerManager.players.length; i++){

            const p = this.playerManager.players[i];

            await this.ctf.insertPlayerMatchData(p.masterId, this.matchId, mapId, gametypeId, serverId, this.matchDate, p);

        }
    }

    //determine if a flag cover was capped or returned
    processFlagCovers(flagTeam, bFailed){

        const flag = this.flags[flagTeam];
  
        const coverType = (bFailed) ? "coverFail" : "coverPass";

        const playerCovers = {};

        for(let i = 0; i < flag.covers.length; i++){

            const {killerId, timestamp} = flag.covers[i];

            if(playerCovers[killerId] === undefined){
                playerCovers[killerId] = [];
            }

            playerCovers[killerId].push(timestamp);

        }

        for(const [playerId, timestamps] of Object.entries(playerCovers)){

            const player = this.playerManager.getPlayerByMasterId(playerId);

            if(player === null){
                new Message(`CTFManager.processFlagCovers() player is null, playerId was ${playerId}`,"error");
                continue;
            }

            let currentCovers = player.stats.ctfNew[coverType].currentLife;
            let bestCovers = 0;
            let lastTimestamp = player.stats.ctfNew[coverType].lastTimestamp;

            let currentFlagCovers = 0;

            for(let i = 0; i < timestamps.length; i++){

                const totalDeaths = this.killManager.getDeathsBetween(lastTimestamp, timestamps[i], playerId, false)

                if(totalDeaths > 0){
                    currentCovers = 1;
                }else{
                    currentCovers++;
                }

                lastTimestamp = timestamps[i];
              
                if(currentCovers > bestCovers){
                    bestCovers = currentCovers;
                }

                currentFlagCovers++;
            }

            if(currentFlagCovers === 3){

                const previousMultiTimestamp = player.getCTFNewLastTimestamp("coverMulti");
                const totalMultiDeaths = this.killManager.getDeathsBetween(previousMultiTimestamp, lastTimestamp, playerId, false);
                //console.log(`Deaths since last multi cover ${totalMultiDeaths}`);
                player.setCTFNewValue("coverMulti", lastTimestamp, totalMultiDeaths);
                //player.stats.ctfNew.coverMulti.lastTimestamp = lastTimestamp;
            }else if(currentFlagCovers > 3){

                const previousSpreeTimestamp = player.getCTFNewLastTimestamp("coverSpree");
                const totalSpreeDeaths = this.killManager.getDeathsBetween(previousSpreeTimestamp, lastTimestamp, playerId, false);
                //console.log(`Deaths since last spree cover ${totalSpreeDeaths}`);
                player.setCTFNewValue("coverSpree", lastTimestamp, totalSpreeDeaths);

            }

            if(currentFlagCovers > player.stats.ctfNew.bestSingleCover){
                player.stats.ctfNew.bestSingleCover = currentCovers;
            }

            player.setCTFNewCovers(coverType, timestamps.length, bestCovers, currentCovers, lastTimestamp);
        }
    }

    //determine if a flag seal was capped or returned
    processFlagSeals(flagTeam, bFailed){

        const flag = this.flags[flagTeam];

        const seals = flag.seals;

        let currentFlagSeals = {};

        for(let i = 0; i < seals.length; i++){

            const {timestamp, playerId} = seals[i];

            const player = this.playerManager.getPlayerByMasterId(playerId);

            if(player === null){
                new Message(`CTFManager.processFlagSeals() player is null.`,"warning");
                continue;
            }

            if(currentFlagSeals[playerId] === undefined){
                currentFlagSeals[playerId] = 0;
            }   

            currentFlagSeals[playerId]++;

            if(bFailed){

                const lastTimestampFail = player.getCTFNewLastTimestamp("sealFail");
                const totalDeathsFail = this.killManager.getDeathsBetween(lastTimestampFail, timestamp, playerId, false);
                player.setCTFNewValue("sealFail", timestamp, totalDeathsFail);

            }else{
                
                const lastTimestampPass = player.getCTFNewLastTimestamp("sealPass");
                const totalDeathsPass = this.killManager.getDeathsBetween(lastTimestampPass, timestamp, playerId, false);
                player.setCTFNewValue("sealPass", timestamp, totalDeathsPass);
            }
        }

        for(const [playerId, totalSeals] of Object.entries(currentFlagSeals)){

            const player = this.playerManager.getPlayerByMasterId(playerId);

            if(player === null){
                new Message(`CTFManager.processFlagSeals() currentFlagSeals player is null`, "warning");
                continue;
            }

            if(player.stats.ctfNew.bestSingleSeal < totalSeals){
                player.stats.ctfNew.bestSingleSeal = totalSeals;
            }
        }
    }


    async updatePlayerTotals(serverId, mapId, gametypeId){

        for(let i = 0; i < this.playerManager.players.length; i++){

            const p = this.playerManager.players[i];

            const playtime = p.getTotalPlaytime(this.totalTeams);
            const stats = p.stats.ctfNew;

            //combined totals
            await this.ctf.updatePlayerTotals(p.masterId, 0, playtime, stats);
            //gametype totals
            await this.ctf.updatePlayerTotals(p.masterId, gametypeId, playtime, stats);

            //console.log(p.stats.ctfNew);
        }
    }

    async updatePlayerBestValues(gametypeId){

        for(let i = 0; i < this.playerManager.players.length; i++){

            const p = this.playerManager.players[i];
            //combined totals
            await this.ctf.updatePlayerBestValues(p.masterId, 0, p.stats.ctfNew);
            //gametype totals
            await this.ctf.updatePlayerBestValues(p.masterId, gametypeId, p.stats.ctfNew);
        }
    }
    
}

module.exports = CTFManager;