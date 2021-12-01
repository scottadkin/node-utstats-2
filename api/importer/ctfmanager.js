const Message = require('../message');
const CTF = require('../ctf');

class CTFManager{

    constructor(){

        this.data = [];

        this.events = [];
        this.capData = [];
        this.flagLines = [];

        this.carryTimeFrames = []; 

        this.ctf = new CTF();
    }

    bHasData(){
        return this.data.length !== 0;
    }


    getLatestTimeframe(player, timestamp/*, flagTeam*/){


        for(let i = this.carryTimeFrames.length - 1; i >= 0; i--){

            const c = this.carryTimeFrames[i];

            if(c.start < timestamp && c.player === player && c.end === null /*&& c.flagTeam === flagTeam*/){
                return c;
            }
        }

        return null;
    }

    parseData(killManager){
        
        const reg = /^(\d+?\.\d+?)\tflag_(.+?)\t(\d+?)(|\t(\d+?)|\t(\d+?)\t(\d+?))$/i;

        const returnReg = /return/i;

        this.killManager = killManager;


        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];
            const result = reg.exec(d);

            if(result !== null){
                
                const timestamp = parseFloat(result[1]);
                let type = result[2].toLowerCase();
                
                const playerId = parseInt(result[3]);

                if(returnReg.test(type) || type === "taken" || type === "pickedup" || type === "captured" || type === "assist" || type === "dropped"){
                    
                    if(type === "return_closesave"){
                        type = "save";
                    }else if(type !== "taken" && type !== "pickedup" && type !== "captured" && type !== "assist" && type !== "dropped"){
                        type = "return";
                    }

                    if(type === "taken" || type === "pickedup"){

                        this.carryTimeFrames.push(
                            {
                                "start": timestamp,
                                "player": playerId,
                                "bFail": true,
                                "end": null,
                                /*"flagTeam": parseInt(result[5])*/
                            }
                        );

                    }else if(type === "captured" || type === "dropped"){

                        const currentTimeFrame = this.getLatestTimeframe(playerId, timestamp, /*parseInt(result[5])*/);

                        if(currentTimeFrame !== null){

                            currentTimeFrame.end = timestamp;      
                            if(type === "captured") currentTimeFrame.bFail = false;

                        }else{
                            new Message(`CTFManager.parseData() currentTimeframe is null`,'warning');
                        }

                    }

                    this.events.push(
                        {
                            "timestamp": timestamp,
                            "type": type,
                            "playerId":playerId,
                            "playerTeam": this.playerManager.getPlayerTeamAt(playerId, timestamp),
                            "flagTeam": parseInt(result[5]),
                            "player": this.playerManager.getOriginalConnectionById(playerId)
                        }
                    );

                }else if(type === "cover"){

                    //"flag_cover", KillerPRI.PlayerID, VictimPRI.PlayerID, KillerPRI.Team 
                   // console.log(result);

                    this.events.push(
                        {
                            "timestamp": timestamp,
                            "type": type,
                            "playerId":playerId,
                            "playerTeam": parseInt(result[7]),
                            "player": this.playerManager.getOriginalConnectionById(playerId)
                        }
                    );

                }else if(type === "kill"){

                    //"flag_kill", KillerPRI.PlayerID
                    
                    this.events.push(
                        {
                            "timestamp": timestamp,
                            "type": type,
                            "playerId": playerId,
                            "playerTeam": this.playerManager.getPlayerTeamAt(playerId, timestamp),
                            "player": this.playerManager.getOriginalConnectionById(playerId)
                        }
                    );

                }else if(type === "seal"){

                   // console.log(result);

                    //"flag_seal", KillerPRI.PlayerID, VictimPRI.PlayerID, KillerPRI.Team

                    this.events.push({
                        "timestamp": timestamp,
                        "type": type,
                        "playerId": playerId,
                        "playerTeam": this.playerManager.getPlayerTeamAt(parseInt(result[3]), timestamp),
                        "player": this.playerManager.getOriginalConnectionById(playerId)
                    });
                }
            }
        }

        const locationReg = /^\d+?\.\d+?\tnstats\tflag_location\t(.+?)\t(.+?)\t(.+?)\t(.+)$/i;

        this.flagLocations = [];

        for(let i = 0; i < this.flagLines.length; i++){

            const result = locationReg.exec(this.flagLines[i]);

            if(result !== null){

                this.flagLocations.push({
                    "team": parseInt(result[1]),
                    "position": {
                        "x": parseFloat(result[2]),
                        "y": parseFloat(result[3]),
                        "z": parseFloat(result[4]),
                    }
                });
            }
        }

        this.setSelfCovers(killManager);

        //console.log(this.events);
        this.createCapData();
        
    }



    getSelfCovers(start, end){

        const selfCovers = {};

        for(let i = 0; i < this.carryTimeFrames.length; i++){

            const c = this.carryTimeFrames[i];

            if(c.end > end) break;

            //if(!c.bFail){

                if(c.start >= start && c.end <= end){    

                    const current = this.killManager.getKillsBetween(c.start, c.end, c.player, true);
                     
                    if(current > 0){
                        selfCovers[c.player] = current;
                    }
                }
            //}
        }

        return selfCovers;

    }

    resetCurrentCapData(){
        return {
            "dropped": false,
            "taken": false,
            "takenTimestamp": null,
            "grab": null,
            "cap": null,
            "capTimestamp": null,
            "capTeam": null,
            "carriedBy": null,
            "travelTime": -1,
            "assists": [],
            "assistsTimes": [],
            "pickups": [],
            "pickupTimes": [],
            "pickupIds": [],
            "selfCovers": [],
            "covers": [],
            "coverTimes": [],
            "dropTimes": [],
            "dropIds": [],
            "seals": [],
            "sealTimestamps": []
        };
    }

    dropFlags(playerId, timestamp, flags){

        for(let i = 0; i < flags.length; i++){

            const f = flags[i];

            if(f.carriedBy === playerId){
                //console.log(`Player ${playerId} dropped the ${i} flag`);

                f.dropTimes.push(timestamp);
                f.dropIds.push(playerId);
                f.dropped = true;
                f.carriedBy = null;

            }
        }
    }

    capFlags(playerId, timestamp, flags){

        let totalCapped = 0;

        for(let i = 0; i < flags.length; i++){

            const f = flags[i];

            if(f.carriedBy === playerId){

                const playerTeam = this.playerManager.getPlayerTeamAt(playerId, timestamp);

                //console.log(`Player ${playerId} capped the ${i} flag`);


                f.capTimestamp = timestamp;
                f.cap = playerId;

                let travelTime = 0;

                if(f.takenTimestamp !== null){    
                    travelTime = timestamp - f.takenTimestamp;
                }

                this.capData.push({
                    "team": playerTeam,
                    "flagTeam": i,
                    "grabTime": f.takenTimestamp,
                    "grab": f.grab,
                    "covers": f.covers,
                    "coverTimes": f.coverTimes,
                    "assists": f.dropIds,
                    "pickupIds": f.pickupIds,
                    "pickupTimes": f.pickupTimes,
                    "dropTimes": f.dropTimes,
                    "dropIds": f.dropIds,
                    "selfCovers": null,
                    "cap": playerId,
                    "capTime": timestamp,
                    "travelTime": travelTime,
                    "seals": f.seals,
                    "sealTimestamp": f.sealTimestamps

                });

                flags[i] = this.resetCurrentCapData();
                totalCapped++;
            }
        }

        //console.log(`player = ${playerId} capped ${totalCapped} FLAGS`);
    }


    createCapData(){

        const flags = [
            this.resetCurrentCapData(),
            this.resetCurrentCapData(),
            this.resetCurrentCapData(),
            this.resetCurrentCapData()
        ];

        for(let i = 0; i < this.events.length; i++){

            const e = this.events[i];

            const type = e.type;
            const timestamp = e.timestamp;

            if(type === "taken" || type === "pickedup"){

                const flag = flags[e.flagTeam];

                if(type === "taken"){

                    flag.grab = e.playerId;
                    flag.takenTimestamp = timestamp;

                }else{

                    flag.pickupTimes.push(timestamp);
                    flag.pickupIds.push(e.playerId);
                }

                flag.taken = true;
                flag.dropped = false;
                flag.carriedBy = e.playerId;
                
            }else if(type === "dropped"){

                this.dropFlags(e.playerId, timestamp, flags);

            }else if(type === "captured"){

                this.capFlags(e.playerId, timestamp, flags);

            }else if(type === "return" || type === "save"){

                flags[e.flagTeam] = this.resetCurrentCapData();

            }else if(type === "cover"){

                const flag = flags[e.playerTeam];

                if(flag !== undefined){
                    flag.covers.push(e.playerId);
                    flag.coverTimes.push(timestamp);
                }else{
                    new Message(`Flag is undefined (cover)`,"warning");
                }

            }else if(type === "seal"){

                const flag = flags[e.playerTeam];

                if(flag !== undefined){

                    flag.seals.push(e.playerId);
                    flag.sealTimestamps.push(timestamp);

                }else{
                    new Message(`Flag is undefined (seal)`,"warning");
                }
            }
        }

        //console.log(flags);
        console.log(this.capData);
    }

    getMatchingPickupId(pickups, player, timestamp){

        for(let i = pickups.length -1; i >= 0; i--){

            if(pickups[i].player === player && pickups[i].timestamp <= timestamp){
                return pickups[i];
            }
        }
        

        return null;
    }

    updateCarryTime(timestamp, player){

        player.stats.ctf.carryTime += timestamp - player.stats.ctf.pickupTime;
        player.stats.ctf.carryTime = parseFloat(parseFloat(player.stats.ctf.carryTime).toFixed(2));
    }

    setPlayerStats(){
        
        for(let i = 0; i < this.events.length; i++){

            const {type, player, timestamp} = this.events[i];

            if(player !== null){

                if(type !== "captured" && type !== "returned" && type !== "pickedup"){

                    if(type === "taken"){
                        player.stats.ctf.pickupTime = timestamp;
                    }else if(type === "dropped"){
                        this.updateCarryTime(timestamp, player);
                    }

                    player.stats.ctf[type]++;

                }else{

                    if(type === "captured"){
                        player.stats.ctf.capture++
                        this.updateCarryTime(timestamp, player);
                    }else if(type === "returned"){
                        player.stats.ctf.return++;
                    }else if(type === "pickedup"){
                        player.stats.ctf.pickup++;
                        player.stats.ctf.pickupTime = timestamp;
                    }
                }

            }else{
                new Message(`CTFManager.setPlayerStats() Player is null`,"warning");
            }
            
        }
    }


    async updatePlayerTotals(){

        try{

            if(this.playerManager !== undefined){

                const players = this.playerManager.players;
                
                for(let i = 0; i < players.length; i++){

                    if(players[i].bDuplicate === undefined){

                        await this.ctf.updatePlayerTotals(players[i].masterId, players[i].gametypeId, players[i].stats.ctf);
                    }
                }
                new Message(`Updated Player CTF totals.`,'pass');
            }else{

                new Message(`ctfmanager.updatePlayerTotals() playermanager.players is undefined`,'error');
            }

            

        }catch(err){
            console.trace(err);
        }
    }

    async updatePlayersMatchStats(){

        try{

            if(this.playerManager !== undefined){

                const players = this.playerManager.players;

                for(let i = 0; i < players.length; i++){

                    if(players[i].bDuplicate === undefined){
                        await this.ctf.updatePlayerMatchStats(players[i].matchId, players[i].stats.ctf);
                    }
                }

            }else{
                new Message(`CTFManager.updatePlayerMatchStats() playerManager is undefined`,'warning');
            }

        }catch(err){
            new Message(`updatePlayersMatchStats ${err}`,'error');
        }
    }


    

    async insertCaps(matchId, mapId, matchDate){

        try{

            for(let i = 0; i < this.capData.length; i++){

                const c = this.capData[i];

                const {team, flagTeam, grab, grabTime, cap, capTime} = c;

                console.log(c);

                const grabPlayer = this.playerManager.getOriginalConnectionById(grab);
                const capPlayer = this.playerManager.getOriginalConnectionById(cap);
                
                let grabPlayerId = -1;
                let capPlayerId = -1;

                if(grabPlayer !== null) grabPlayerId = grabPlayer.masterId;
                if(capPlayer !== null) capPlayerId = capPlayer.masterId;


                const dropIds = this.playerManager.toMasterIds(c.dropIds);
                const assistIds = this.playerManager.toMasterIds(c.assists);
                const coverIds = this.playerManager.toMasterIds(c.covers);
                const pickupIds = this.playerManager.toMasterIds(c.pickupIds);
                const sealIds = this.playerManager.toMasterIds(c.seals);
                

                //insertCap(matchId, matchDate, mapId, c.team, grabTime, grabPlayer, dropIds, dropTimes, pickupIds,
                // pickupTimes, coverIds, coverTimes, assistIds, assistsTimes, carryIds, capPlayer, 
                //capTime, travelTime, selfCovers, selfCoversCount, seals, sealTimes)

            }

        }catch(err){
            console.trace(err);
            new Message(`inserCaps ${err}`,'error');
        }
    }


    async insertEvents(matchId){

        try{

            for(let i = 0; i < this.events.length; i++){

                const e = this.events[i];

                const currentPlayer = e.player;

                if(currentPlayer !== null){

                    if(this.bIgnoreBots){
                        if(currentPlayer.bBot) continue;
                    }

                    await this.ctf.insertEvent(matchId, e.timestamp, currentPlayer.masterId, e.type, e.playerTeam);
                   
                }else{
                    new Message(`CTFManager.insertEvent() currentPlayer is null`,'warning');
                }
            }

        }catch(err){
            console.trace(err);
        }
    }


    setSelfCovers(killManager){


        for(let i = 0; i < this.carryTimeFrames.length; i++){

            const c = this.carryTimeFrames[i];
            const currentKills = killManager.getKillsBetween(c.start, c.end, c.player, true);
            const currentPlayer = this.playerManager.getOriginalConnectionById(c.player);

            if(currentPlayer !== null){

                currentPlayer.stats.ctf.selfCover += currentKills;

                if(c.bFail){
                    currentPlayer.stats.ctf.selfCoverFail += currentKills;
                }else{
                    currentPlayer.stats.ctf.selfCoverPass += currentKills;
                }

                //self covers

                if(currentKills > currentPlayer.stats.ctf.bestSelfCover){
                    currentPlayer.stats.ctf.bestSelfCover = currentKills;
                }
            }
        }
    }

    setCoverSprees(covers){

        const playerCovers = new Map();

        let currentCovers = 0;
        let c = 0;

        if(covers === undefined) return;
        if(covers.length === 0) return;

        for(let i = 0; i < covers.length; i++){

            c = covers[i];

            currentCovers = playerCovers.get(c);

            if(currentCovers === undefined){
                playerCovers.set(c, 1);
            }else{
                currentCovers++;
                playerCovers.set(c, currentCovers);
            }
        }


        let currentPlayer = 0;

        for(const [key, value] of playerCovers){

            currentPlayer = this.playerManager.getOriginalConnectionById(key);


            if(currentPlayer !== null){
            
                if(value === 3){
                    currentPlayer.stats.ctf.multiCover++;
                }else if(value >= 4){
                    currentPlayer.stats.ctf.spreeCover++;
                }

                if(value > currentPlayer.stats.ctf.bestCover){
                    currentPlayer.stats.ctf.bestCover = value;
                }
            }
            

        }    
    }

    async insertFlagLocations(mapId){

        try{
            
            let f = 0;

            for(let i = 0; i < this.flagLocations.length; i++){

                f = this.flagLocations[i];
                await this.ctf.insertFlagLocation(mapId, f.team, f.position);
            }

        }catch(err){
            console.trace(err);
        }
    }

}


module.exports = CTFManager;