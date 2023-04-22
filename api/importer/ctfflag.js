const Message =  require("../message");

class CTFFlag{

    constructor(ctfManager, playerManager, killManager, matchId, matchDate, mapId, team, totalTeams){

        this.ctfManager = ctfManager;
        this.playerManager = playerManager;
        this.killManager = killManager;
        this.matchId = matchId;
        this.matchDate = matchDate;
        this.mapId = mapId;

        this.flagStand = null;
        
        this.team = team;
        this.totalTeams = totalTeams;

        this.bDropped = false;
        this.bAtBase = true;
        this.carriedBy = null;

        this.pickups = [];

        this.takenTimestamp = null;
        this.takenPlayer = null;
        this.lastCarriedTimestamp = null;

        this.drops = [];

        this.covers = [];

        this.deaths = [];

        this.seals = [];
        this.carryTimes = [];
        this.selfCovers = [];
        this.totalCarryTime = 0;

        this.lastDroppedLocation = null;

        this.lastReturnTimestamp = null;


        this.basicCapsInfo = [];

    }


    setFlagStandLocation(location){

        this.flagStand = location;
    }

    async reset(bFailed, capId){

        if(capId === undefined) capId = -1;
        //this.debugSeals("RESET");

        this.insertDeaths(capId);
        await this.insertCovers(capId);
        await this.processSelfCovers(bFailed, capId);
        await this.insertSeals(capId);
        await this.insertCarryTimes(capId);
        await this.insertDrops(capId);
        await this.insertPickups(capId);

        this.bDropped = false;
        this.bAtBase = true;
        this.carriedBy = null;
        this.takenTimestamp = null;
        this.drops = [];

        this.covers = [];

        this.pickups = [];
        this.deaths = [];
        this.seals = [];
        this.lastCarriedTimestamp = null;
        this.carryTimes = [];
        this.selfCovers = [];
        this.takenPlayer = null;
        this.deaths = [];
        this.lastDroppedLocation = null;
        this.lastReturnTimestamp = null;
    }

    async returned(timestamp, playerId, smartCTFLocation){

        //this.debugSeals("RETURNED");

        //await this.processSelfCovers(false, -1);

        this.lastReturnTimestamp = timestamp;

        this.ctfManager.addEvent(this.matchId, timestamp, playerId, "returned", this.team);

        await this.processReturn(timestamp, playerId, smartCTFLocation);

        await this.reset(true, -1);
    }

    async timedOutReturn(timestamp){

        this.lastReturnTimestamp = timestamp;

        this.ctfManager.addEvent(this.matchId, timestamp, -1, "returned_timeout", this.team);

        await this.processReturn(timestamp, -1, "timeout");
        
        await this.reset(true, -1);
    }

    async taken(timestamp, playerId){

        //just in case some data isn't reset
        //await this.reset(true);

        if(this.pickups.length > 0){
            new Message(`CTFFlag.taken() this.pickups is not empty.`, "warning");
        }   

        if(this.deaths.length > 0){
            new Message(`CTFFlag.taken() this.deaths is not empty.`, "warning");
        }

        if(this.covers.length > 0){
            new Message(`CTFFlag.taken() this.covers is not empty.`,"warning");
        }

        this.bDropped = false;
        this.bAtBase = false;
        this.carriedBy = playerId;
        this.takenTimestamp = timestamp;
        this.lastCarriedTimestamp = timestamp;
        this.takenPlayer = playerId;
        this.covers = [];

        this.ctfManager.addEvent(this.matchId, timestamp, playerId, "taken", this.team);
    }

    async pickedUp(timestamp, playerId, playerTeam){

        this.bDropped = false;
        this.bAtBase = false;
        this.carriedBy = playerId;

        this.pickups.push({
            "timestamp": timestamp, 
            "playerId": playerId,
            "playerTeam": playerTeam
        });
     
        this.lastCarriedTimestamp = timestamp;

        this.ctfManager.addEvent(this.matchId, timestamp, playerId, "pickedup", this.team);
    }

    async dropped(timestamp, dropLocation, distanceToCap, playerTeam){

        this.ctfManager.addEvent(this.matchId, timestamp, this.carriedBy, "dropped", this.team);

        await this.setCarryTime(timestamp);

        if(dropLocation !== null){
            this.lastDroppedLocation = dropLocation;
        }

        this.bDropped = true;
        this.bAtBase = false;

        this.drops.push({
            "playerId": this.carriedBy, 
            "playerTeam": playerTeam,
            "timestamp": timestamp, 
            "dropLocation": dropLocation, 
            "distanceToCap": distanceToCap
        });

        this.carriedBy = null;
    }

    async cover(timestamp, killerId, victimId){

        this.covers.push({
            "timestamp": timestamp,
            "killerId": killerId,
            "victimId": victimId,
        });

        this.ctfManager.addEvent(this.matchId, timestamp, killerId, "cover", this.team);
    }

    async killed(timestamp, killerId, killerTeam, victimId, victimTeam, killDistance, distanceToCap, distanceToEnemyBase){

        this.deaths.push({
            "timestamp": timestamp, 
            "killerId": killerId,
            "killerTeam": killerTeam,
            "victimId": victimId,
            "victimTeam": victimTeam,
            "killDistance": killDistance,
            "distanceToCap": distanceToCap,
            "distanceToEnemyBase": distanceToEnemyBase,
        });

        /*if(victimId === -1){
            await this.ctfManager.insertEvent(this.matchId, timestamp, killerId, "suicide", this.team);
        }else{
            await this.ctfManager.insertEvent(this.matchId, timestamp, killerId, "kill", this.team);
        }*/
        
    }

    async seal(timestamp, killerId, victimId){

        //new Message(`SEAL by ${killerId} @ ${timestamp}`,"error");

        this.seals.push({"timestamp": timestamp, "playerId": killerId, "victimId": victimId});
        this.ctfManager.addEvent(this.matchId, timestamp, killerId, "seal", this.team);
    }

    async setCarryTime(timestamp){

        const currentCarryTime = timestamp - this.lastCarriedTimestamp;

        const totalDeaths = this.killManager.getDeathsBetween(this.lastCarriedTimestamp, timestamp, this.carriedBy, false);

        const player = this.playerManager.getPlayerByMasterId(this.carriedBy);

        if(player === null){
           
            new Message(`CTFFlag.dropped() player is null`,"warning");
        }else{
            player.setCTFNewValue("carryTime", timestamp, totalDeaths, currentCarryTime);
        }

        const killsWhileCarrying = this.killManager.getKillsBetween(this.lastCarriedTimestamp, timestamp, this.carriedBy, false);

        if(killsWhileCarrying.length > 0){

            for(let i = 0; i < killsWhileCarrying.length; i++){
                const kill = killsWhileCarrying[i];
                this.ctfManager.addEvent(this.matchId, kill.timestamp, this.carriedBy, "self_cover", this.team);
            }

            if(killsWhileCarrying.length > player.stats.ctfNew.bestSingleSelfCover){
                player.stats.ctfNew.bestSingleSelfCover = killsWhileCarrying.length;
            }

            const killerTeam = this.playerManager.getPlayerTeamAt(this.carriedBy, timestamp);

            player.setCTFNewValue("selfCover", timestamp, totalDeaths, killsWhileCarrying.length);
            
            this.selfCovers.push({
                "player": this.carriedBy, 
                "total": killsWhileCarrying.length, 
                "timestamp": timestamp, 
                "kills": killsWhileCarrying,
                "killerTeam": killerTeam
            });
        }

        this.carryTimes.push({
            "taken": this.lastCarriedTimestamp,
            "dropped": timestamp,
            "player": this.carriedBy, 
            "carryTime": currentCarryTime
        });
    }

    debugSeals(message){

        if(this.sealPlayerIds.length > 0){
            console.log(`-------${message}-------------`);
            console.log(this.sealTimestamps);
            console.log(this.sealPlayerIds);
        }
    }


    async processSelfCovers(bFailed, capId){

        if(capId === undefined) capId = -1;

        for(let i = 0; i < this.selfCovers.length; i++){

            const s = this.selfCovers[i];

            const player = this.playerManager.getPlayerByMasterId(s.player);

            if(player === null){
                new Message(`CTFFlag.processSelfCovers() player is null`,"warning");
                continue;
            }

            for(let x = 0; x < s.kills.length; x++){

                const kill = s.kills[x];

                await this.ctfManager.insertSelfCover(
                    this.matchId, 
                    this.matchDate, 
                    this.mapId, 
                    capId, 
                    kill.timestamp, 
                    kill.killerId, 
                    s.killerTeam,
                    kill.victimId
                );
            }

            if(!bFailed){

                const previousTimestamp = player.getCTFNewLastTimestamp("selfCoverPass");
                const totalDeaths = this.killManager.getDeathsBetween(previousTimestamp, s.timestamp, s.player);
                player.setCTFNewValue("selfCoverPass", s.timestamp, totalDeaths, s.total);

            }else{

                const previousTimestamp = player.getCTFNewLastTimestamp("selfCoverFail");
                const totalDeaths = this.killManager.getDeathsBetween(previousTimestamp, s.timestamp, s.player);
                player.setCTFNewValue("selfCoverFail", s.timestamp, totalDeaths, s.total);
            }
        }
    }

    getTotalSelfCovers(){

        let found = 0;

        for(let i = 0; i < this.selfCovers.length; i++){

            const s = this.selfCovers[i];
            found += s.total;
        }

        return found;
    }


     insertCovers(capId){

        for(let i = 0; i < this.covers.length; i++){

            const c = this.covers[i];

            this.ctfManager.addCover(
                this.matchId, 
                this.matchDate, 
                this.mapId, 
                capId, 
                c.timestamp, 
                c.killerId, 
                this.team,
                c.victimId
            );
        }
    }


    getTotalDeaths(){

        let totalDeaths = 0;
        let totalSuicides = 0;

        for(let i = 0; i < this.carryTimes.length; i++){

            const c = this.carryTimes[i];

            totalDeaths += this.killManager.getDeathsBetween(c.taken, c.dropped, c.player, true);
            totalSuicides += this.killManager.getSuicidesBetween(c.taken, c.dropped, c.player);
        }

        return {"deaths": totalDeaths, "suicides": totalSuicides};
    }

    getTeamsKills(start, end){

        const redTeamKills = this.killManager.getKillsByTeamBetween(0, start, end);
        const blueTeamKills = this.killManager.getKillsByTeamBetween(1, start, end);

        let greenTeamKills = 0;
        let yellowTeamKills = 0;

        if(this.totalTeams > 2){
            greenTeamKills = this.killManager.getKillsByTeamBetween(2, this.takenTimestamp, timestamp);
        }

        if(this.totalTeams > 3){
            yellowTeamKills = this.killManager.getKillsByTeamBetween(3, this.takenTimestamp, timestamp);
        }

        return {
            "red": redTeamKills, 
            "blue": blueTeamKills, 
            "green": greenTeamKills, 
            "yellow": yellowTeamKills
        };
    }

    getTeamsSuicides(start, end){

        const redSuicides = this.killManager.getSuicidesByTeamBetween(0, start, end);
        const blueSuicides  = this.killManager.getSuicidesByTeamBetween(1, start, end);

        let greenSuicides = 0;
        let yellowSuicides = 0;

        if(this.totalTeams > 2){
            greenSuicides = this.killManager.getSuicidesByTeamBetween(2, this.takenTimestamp, timestamp);
        }

        if(this.totalTeams > 3){
            yellowSuicides = this.killManager.getSuicidesByTeamBetween(3, this.takenTimestamp, timestamp);
        }

        return {
            "red": redSuicides, 
            "blue": blueSuicides, 
            "green": greenSuicides, 
            "yellow": yellowSuicides
        };
    }
    

    async captured(timestamp, playerId){

        await this.ctfManager.addEvent(this.matchId, timestamp, playerId, "captured", this.team);

        const travelTime = timestamp - this.takenTimestamp;

        await this.setCarryTime(timestamp);

        const assistIds = new Set();

        const assistVars = [];

        let totalCarryTime = 0;

        let totalDeaths = 0;
        let totalSuicides = 0;

        for(let i = 0; i < this.carryTimes.length; i++){

            const c = this.carryTimes[i];

            totalCarryTime += c.carryTime;

            totalDeaths += this.killManager.getDeathsBetween(c.taken, c.dropped, c.player, true);

            totalSuicides += this.killManager.getSuicidesBetween(c.taken, c.dropped, c.player);

            //don't want to count the capped player as an assist.
            if(this.carriedBy !== c.player){

                this.ctfManager.addEvent(this.matchId, timestamp, c.player, "assist", this.team);
                assistIds.add(c.player);

                assistVars.push(c);
            }
        }

        for(const playerId of assistIds){

            const player = this.playerManager.getPlayerByMasterId(playerId);

            if(player === null){
                new Message(`CTFFlag.captured() player is null`,"warning");
                continue;
            }

            
            const lastEventTimestamp = player.getCTFNewLastTimestamp("assist"); 
            const playerTotalDeaths = this.killManager.getDeathsBetween(lastEventTimestamp, timestamp, player.masterId, false);
            player.setCTFNewValue("assist", timestamp, playerTotalDeaths);
        }


        const capPlayer = this.playerManager.getPlayerByMasterId(this.carriedBy);

        let capId = -1;

        if(capPlayer !== null){

            //console.log(capPlayer);
            const capTeam = this.playerManager.getPlayerTeamAt(this.carriedBy, timestamp);

            const timeDropped = travelTime - totalCarryTime;

            //console.log(`${capTeam} capped the ${this.team} flag. TravelTime ${travelTime}, carryTime ${totalCarryTime}, timeDropped ${timeDropped}`);
          
            const totalSelfCovers = this.getTotalSelfCovers();

            const teamKills = this.getTeamsKills(this.takenTimestamp, timestamp);
            const teamSuicides = this.getTeamsSuicides(this.takenTimestamp, timestamp);

            //await this.ctfManager.insertCap(this.matchId, this.matchDate, capTeam, this.team, this.takenTimestamp, this.takenPlayer, timestamp, this.carriedBy, travelTime, carryTime, dropTime);
            capId = await this.ctfManager.insertCap(
                this.matchId, 
                this.matchDate, 
                this.mapId,
                capTeam, 
                this.team, 
                this.takenTimestamp, 
                this.takenPlayer, 
                timestamp, 
                this.carriedBy, 
                travelTime, 
                totalCarryTime, 
                timeDropped,
                this.drops.length,
                this.pickups.length,
                this.covers.length,
                this.seals.length,
                assistIds.size, 
                totalSelfCovers,
                totalDeaths,
                totalSuicides,
                teamKills.red,
                teamKills.blue,
                teamKills.green,
                teamKills.yellow,
                teamSuicides.red,
                teamSuicides.blue,
                teamSuicides.green,
                teamSuicides.yellow
            );

            for(let i = 0; i < assistVars.length; i++){

                const a = assistVars[i];
                await this.ctfManager.insertAssist(this.matchId, this.matchDate, this.mapId, capId, a.player, a.taken, a.dropped, a.carryTime);
            }

            await this.insertCapReturnEvents(this.takenTimestamp, timestamp, capId, false);
            await this.insertCapReturnEvents(this.takenTimestamp, timestamp, capId, true);


            this.basicCapsInfo.push({
                "id": capId,
                "travelTime": travelTime, 
                "carryTime": totalCarryTime, 
                "dropTime": timeDropped, 
                "type": ([...assistIds].length === 0) ? 0 : 1
            });

        }else{
            new Message(`capPlayer is null`,"warning");
        }
        
        await this.reset(false, capId);

        return [...assistIds].length;
    }

    async insertSeals(capId){

        for(let i = 0; i < this.seals.length; i++){

            const {timestamp, playerId, victimId} = this.seals[i];

            await this.ctfManager.insertSeal(this.matchId, this.matchDate, this.mapId, capId, timestamp, playerId, victimId);
        }
    }

    async insertCarryTimes(capId){

        let totalCarryTime = this.getTotalCarryTime();

        for(let i = 0; i < this.carryTimes.length; i++){

            const c = this.carryTimes[i];

            const playerTeam = this.playerManager.getPlayerTeamAt(c.player, c.taken);

            let carryPercent = 0;

            if(totalCarryTime > 0){

                if(c.carryTime > 0){
                    carryPercent = (c.carryTime / totalCarryTime) * 100;
                }
            }

            this.ctfManager.addCarryTime(
                this.matchId, 
                this.matchDate, 
                this.mapId, 
                capId, 
                this.team, 
                (c.player === null) ? -1 : c.player, 
                playerTeam, 
                (c.taken === null) ? -1 : c.taken, 
                c.dropped, 
                c.carryTime,
                carryPercent
            );
        }
    }

    getTotalCarryTime(){

        let totalCarryTime = 0;

        for(let i = 0; i < this.carryTimes.length; i++){
            totalCarryTime += this.carryTimes[i].carryTime;
        }

        return totalCarryTime;
    }

    getLastDropInfo(){

        if(this.drops.length > 0){
            return this.drops[this.drops.length - 1];
        }
 
        new Message("DROP NOT Found","error");
        return {"distanceToCap": -1, "dropLocation": {"x": 0, "y": 0, "z": 0} };

    }

    async insertCapReturnEvents(start, end, capId, bSuicides){


        let events = {};

        if(!bSuicides){
            events = this.killManager.getTotalEventsByPlayerBetween(start, end, "kill");
        }else{
            events = this.killManager.getTotalEventsByPlayerBetween(start, end, "suicide");
        }

        for(const [playerId, totalEvents] of Object.entries(events)){

            const playerTeam = this.playerManager.getPlayerTeamAt(playerId, end);

            this.ctfManager.addCRKill(
                (bSuicides) ? 1 : 0,
                this.matchId, 
                this.matchDate, 
                this.mapId, 
                capId, 
                end, 
                playerId, 
                playerTeam, 
                totalEvents
            );
        }
    }

    async processReturn(timestamp, playerId, smartCTFLocation){

        const carryTime = this.getTotalCarryTime();

        const travelTime = timestamp - this.takenTimestamp;

        const dropTime = travelTime - carryTime;

        const totalSelfCovers = this.getTotalSelfCovers();

        const {deaths, suicides} = this.getTotalDeaths();

        const lastDropInfo = this.getLastDropInfo();

        const teamKills = this.getTeamsKills(this.takenTimestamp, timestamp);
        const teamSuicides = this.getTeamsSuicides(this.takenTimestamp, timestamp);

        await this.insertCapReturnEvents(this.takenTimestamp, timestamp, -1, false);
        await this.insertCapReturnEvents(this.takenTimestamp, timestamp, -1, true);

        await this.ctfManager.insertReturn(
            this.matchId, 
            this.matchDate, 
            this.mapId, 
            this.team, 
            this.takenTimestamp, 
            this.takenPlayer, 
            timestamp, 
            playerId, 
            smartCTFLocation,
            lastDropInfo.distanceToCap,
            lastDropInfo.dropLocation,
            travelTime, 
            carryTime, 
            dropTime, 
            this.drops.length, 
            this.pickups.length, 
            this.covers.length, 
            this.seals.length, 
            totalSelfCovers, 
            deaths, 
            suicides,
            teamKills.red,
            teamKills.blue,
            teamKills.green,
            teamKills.yellow,
            teamSuicides.red,
            teamSuicides.blue,
            teamSuicides.green,
            teamSuicides.yellow
        );
    }

    insertDeaths(capId){

        for(let i = 0; i < this.deaths.length; i++){

            const d = this.deaths[i];

            this.ctfManager.addFlagDeath(
                this.matchId, 
                this.matchDate, 
                this.mapId, 
                d.timestamp, 
                capId,
                d.killerId, 
                d.killerTeam, 
                d.victimId, 
                d.victimTeam, 
                d.killDistance, 
                d.distanceToCap, 
                d.distanceToEnemyBase 
            );
        }
    }


    getTimeDropped(timestamp){

        for(let i = 0; i < this.pickups.length; i++){

            const p = this.pickups[i];

            if(p.timestamp < timestamp) continue;

            return p.timestamp - timestamp;
        }

        if(this.lastReturnTimestamp !== null){
            return this.lastReturnTimestamp - timestamp;
        }

        return -1;
    }

    async insertDrops(capId){

        for(let i = 0; i < this.drops.length; i++){

            const d = this.drops[i];

            const currentTimeDropped = this.getTimeDropped(d.timestamp);

            this.ctfManager.addDrop(this.matchId,
                this.matchDate,
                this.mapId,
                d.timestamp,
                capId,
                this.team,
                d.playerId,
                d.playerTeam,
                d.distanceToCap,
                d.dropLocation,
                currentTimeDropped
            );
            /*await this.ctfManager.insertDrop(
                this.matchId,
                this.matchDate,
                this.mapId,
                d.timestamp,
                capId,
                this.team,
                d.playerId,
                d.playerTeam,
                d.distanceToCap,
                d.dropLocation,
                currentTimeDropped
            );*/
        }
    }


    async insertPickups(capId){

        for(let i = 0; i < this.pickups.length; i++){

            const p = this.pickups[i];

            await this.ctfManager.insertPickup(
                this.matchId, 
                this.matchDate, 
                this.mapId,
                capId,
                p.timestamp,
                p.playerId,
                p.playerTeam,
                this.team
            );
        }
    }
}

module.exports = CTFFlag;