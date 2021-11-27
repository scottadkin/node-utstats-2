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


    getLatestTimeframe(player, timestamp, flagTeam){


        for(let i = this.carryTimeFrames.length - 1; i >= 0; i--){

            const c = this.carryTimeFrames[i];

            if(c.start < timestamp && c.player === player && c.end === null && c.flagTeam === flagTeam){
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

                if(returnReg.test(type) || type === "taken" || type === "pickedup" || type === "captured" || type === "assist" || type === "dropped"){
                    
                    if(type === "return_closesave"){
                        type = "save";
                    }else if(type !== "taken" && type !== "pickedup" && type !== "captured" && type !== "assist" && !type !== "dropped"){
                        type = "return";
                    }

                    if(type === "taken" || type === "pickedup"){

                        this.carryTimeFrames.push(
                            {
                                "start": timestamp,
                                "player": parseInt(result[3]),
                                "bFail": true,
                                "end": null,
                                "flagTeam": parseInt(result[5])
                            }
                        );

                    }else if(type === "captured" || type === "dropped"){

                        const currentTimeFrame = this.getLatestTimeframe(parseInt(result[3]), timestamp, parseInt(result[5]));

                        if(currentTimeFrame !== null){

                            currentTimeFrame.end = timestamp;      
                            if(type === "captured") currentTimeFrame.bFail = false;

                        }else{
                            new Message(`CTFManager.parseData() currentTimeframe is null`,'warning');
                        }

                    }

                    this.events.push(
                        {
                            "time": timestamp,
                            "type": type,
                            "player": parseInt(result[3]),
                            "playerTeam": this.playerManager.getPlayerTeamAt(parseInt(result[3]), timestamp),
                            "flagTeam": parseInt(result[5])
                        }
                    );

                }else if(type === "cover"){

                    //"flag_cover", KillerPRI.PlayerID, VictimPRI.PlayerID, KillerPRI.Team 
                   // console.log(result);

                    this.events.push(
                        {
                            "time": timestamp,
                            "type": type,
                            "player": parseInt(result[3]),
                            "playerTeam": parseInt(result[7])
                        }
                    );

                }else if(type === "kill"){

                    //"flag_kill", KillerPRI.PlayerID
                    
                    this.events.push(
                        {
                            "time": timestamp,
                            "type": type,
                            "player": parseInt(result[3]),
                            "playerTeam": this.playerManager.getPlayerTeamAt(parseInt(result[3]), timestamp)
                        }
                    );

                }else if(type === "seal"){

                   // console.log(result);

                    //"flag_seal", KillerPRI.PlayerID, VictimPRI.PlayerID, KillerPRI.Team

                    this.events.push({
                        "time": timestamp,
                        "type": type,
                        "player": parseInt(result[3]),
                        "playerTeam": this.playerManager.getPlayerTeamAt(parseInt(result[3]), timestamp)
                    });
                }

            }

            //console.log(result);

        }

        console.log(this.carryTimeFrames);

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
            "carryIds": [],
            "assists": [],
            "assistsTimes": [],
            "pickups": [],
            "pickupTimes": [],
            "selfCovers": [],
            "covers": [],
            "coverTimes": [],
            "dropTimes": []
        };
    }

    createCapData(){

        const flags = [
            this.resetCurrentCapData(),
            this.resetCurrentCapData(),
            this.resetCurrentCapData(),
            this.resetCurrentCapData()
        ];

        const caps = [];

        console.log(flags);

        //this.capData = caps;
        //this.events 
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

        let e = 0;
        let player = 0;
        

        for(let i = 0; i < this.events.length; i++){

            e = this.events[i];

            player = this.playerManager.getPlayerById(e.player);

            if(player !== null){

                if(e.type !== 'captured' && e.type !== 'returned' && e.type !== 'pickedup'){

                    if(e.type === "taken"){
                        player.stats.ctf.pickupTime = e.timestamp;
                    }else if(e.type === 'dropped'){
                        this.updateCarryTime(e.timestamp, player);
                    }

                    player.stats.ctf[e.type]++;
                }else{

                    if(e.type === 'captured'){
                        player.stats.ctf.capture++
                        this.updateCarryTime(e.timestamp, player);
                    }else if(e.type === 'returned'){
                        player.stats.ctf.return++;
                    }else if(e.type === 'pickedup'){
                        player.stats.ctf.pickup++;
                        player.stats.ctf.pickupTime = e.timestamp;
                    }
                }

            }else{
                new Message(`Could not find a player with id ${e.player}`,'warning');
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

    //temp fix for ctf4
    tempCTF4Botch(c){

        return;

        if(c.dropTimes === undefined){
            c.dropTimes = [];
            new Message(`c.dropTimes is undefined (CTF4)`,"warning");
        }

        if(c.pickupTimes === undefined){
            c.pickupTimes = [];
            new Message(`c.pickupTimes is undefined (CTF4)`,"warning");
        }

        if(c.coverTimes === undefined){
            c.coverTimes = [];
            new Message(`c.coverTimes is undefined (CTF4)`,"warning");
        }

        if(c.covers === undefined){
            c.covers = [];
            new Message(`c.covers is undefined (CTF4)`,"warning");
        }

        if(c.assists === undefined){
            c.assists = [];
            new Message(`c.assists is undefined (CTF4)`,"warning");
        }

        if(c.carryIds === undefined){
            c.carryIds = [];
            new Message(`c.carryIds is undefined (CTF4)`,"warning");
        }

        if(c.carryTimes === undefined){
            c.carryTimes = [];
            new Message(`c.carryTimes is undefined (CTF4)`,"warning");
        }

        if(c.team === undefined){
            c.team = -1;
            new Message(`c.team is undefined (CTF4)`,"warning");
        }

        if(c.grabTime === undefined){
            c.grabTime = -1;
            new Message(`c.grabTime is undefined (CTF4)`,"warning");
        }


        if(c.travelTime !== c.travelTime || c.travelTime === "NaN"){
            c.travelTime = 0;
            new Message(`c.travelTime is NaN (CTF4)`,"warning");
        }
        

    }

    async insertCaps(matchId, mapId, matchDate){

        try{

            let currentCover = 0;
            let currentCovers = [];
            let currentAssist = [];
            let currentAssists = [];
            let currentGrab = 0;
            let currentCap = 0;
            let currentCarryTimes = [];
            let currentCarryIds = [];
            let currentCarry = 0;
            let currentDrop = 0;
            let currentDrops = [];
            let currentDropTimes = [];
            let currentPickups = [];
            let currentPickupTimes = [];
            let currentPickup = 0;

            let fastestSolo = null;
            let fastestAssist = null;

            for(let i = 0; i < this.capData.length; i++){

                const c = this.capData[i];

                this.tempCTF4Botch(c);

                if(c.assists.length === 0){

                    if(fastestSolo === null){
                        fastestSolo = Object.assign({}, c);
                    }else{
                        if(fastestSolo.travelTime > c.travelTime){
                            fastestSolo = Object.assign({}, c);
                        }
                    }

                }else{

                    if(fastestAssist === null){
                        fastestAssist = Object.assign({}, c);
                    }else{
                        if(fastestAssist.travelTime > c.travelTime){
                            fastestAssist = Object.assign({}, c);
                        }
                    }
                }

                currentGrab = this.playerManager.getOriginalConnectionById(c.grab);

                if(currentGrab === null){
                    currentGrab = {"masterId": -1};
                }
                
                currentCovers = [];
                currentAssists = [];
                currentCarryTimes = [];
                currentCarryIds = [];
                currentDrops = [];
                currentDropTimes = [];
                currentCarry = 0;
                currentDrop = 0;
                currentPickups = [];
                currentPickupTimes = [];
                currentPickup = 0;
                const currentSelfCovers = [];
                const currentSelfCoversCount = [];
                
                for(const [key, value] of Object.entries(c.selfCovers)){

                    const currentPlayer = this.playerManager.getOriginalConnectionById(parseInt(key));

                    if(currentPlayer !== null){
                        currentSelfCovers.push(currentPlayer.masterId);
                        currentSelfCoversCount.push(value);
                    }
                }

                for(let x = 0; x < c.dropTimes.length; x++){

                    currentDrop = this.playerManager.getOriginalConnectionById(c.dropTimes[x].player);

                    if(currentDrop !== null){
                        currentDrops.push(currentDrop.masterId);
                        currentDropTimes.push(c.dropTimes[x].timestamp);
                    }
                }

                for(let x = 0; x < c.pickupTimes.length; x++){

                    currentPickup = this.playerManager.getOriginalConnectionById(c.pickupTimes[x].player);

                    if(currentPickup !== null){
                        currentPickups.push(currentPickup.masterId);
                        currentPickupTimes.push(c.pickupTimes[x].timestamp);
                    }
                }


                for(let x = 0; x < c.covers.length; x++){

                    currentCover = this.playerManager.getOriginalConnectionById(c.covers[x]);

                    if(currentCover !== null){
                        currentCover.stats.ctf.coverPass++;
                        currentCovers.push(currentCover.masterId);
                    }
                }

                for(let x = 0; x < c.assists.length; x++){

                    currentAssist = this.playerManager.getOriginalConnectionById(c.assists[x]);

                    if(currentAssist !== null){
                        currentAssists.push(currentAssist.masterId);
                    }
                }

                for(let x = 0; x < c.carryIds.length; x++){     

                    currentCarry = this.playerManager.getOriginalConnectionById(c.carryIds[x]);
                    if(currentCarry !== null){
                        currentCarryIds.push(currentCarry.masterId);
                    }
                }


                currentCap = this.playerManager.getOriginalConnectionById(c.cap);

                if(currentCap !== null){

                    await this.ctf.insertCap(matchId, matchDate, mapId, c.team, c.grabTime, currentGrab.masterId, currentDrops, currentDropTimes,
                        currentPickups, currentPickupTimes, currentCovers, c.coverTimes, currentAssists, c.carryTimes, currentCarryIds, 
                        currentCap.masterId, c.capTimestamp, c.travelTime, currentSelfCovers, currentSelfCoversCount);
                }else{
                    new Message(`CTFManager.insertCaps() currentCap is null`,"warning");
                }
            }


            this.capData.sort((a, b) =>{

                a = a.travelTime;
                b = b.travelTime;

                if(a > b){
                    return 1;
                }else if(a < b){
                    return -1;
                }

                return 0;

            });


            if(fastestSolo !== null){

                const grabPlayer = this.playerManager.getOriginalConnectionById(fastestSolo.grab);
                const capPlayer = this.playerManager.getOriginalConnectionById(fastestSolo.cap);

                if(grabPlayer !== null){
                    fastestSolo.grab = grabPlayer.masterId;
                }

                if(capPlayer !== null){
                    fastestSolo.cap = capPlayer.masterId;
                }
            }

            await this.ctf.updateCapRecord(matchId, mapId, 0, fastestSolo, matchDate);
   

            if(fastestAssist !== null){

                const grabPlayer = this.playerManager.getOriginalConnectionById(fastestAssist.grab);
                const capPlayer = this.playerManager.getOriginalConnectionById(fastestAssist.cap);
                

                if(grabPlayer !== null){
                    fastestAssist.grab = grabPlayer.masterId;
                }

                if(capPlayer !== null){
                    fastestAssist.cap = capPlayer.masterId;
                }

                const assistPlayers = [];
                
                for(let i = 0; i < fastestAssist.assists.length; i++){

                    const assist = fastestAssist.assists[i];

                    const currentAssistPlayer = this.playerManager.getOriginalConnectionById(assist);

                    if(currentAssistPlayer !== null){
                        assistPlayers.push(currentAssistPlayer.masterId);
                    }
                }

                fastestAssist.assists = assistPlayers;
            }
            
            await this.ctf.updateCapRecord(matchId, mapId, 1, fastestAssist, matchDate);


            for(let i = 0; i < this.playerManager.players.length; i++){

                const p = this.playerManager.players[i];

                p.stats.ctf.coverFail = p.stats.ctf.cover - p.stats.ctf.coverPass;
                
            }

        }catch(err){
            console.trace(err);
            new Message(`inserCaps ${err}`,'error');
        }
    }


    async insertEvents(matchId){

        try{

            let e = 0;
            let currentPlayer = 0;

            for(let i = 0; i < this.events.length; i++){

                e = this.events[i];

                currentPlayer = this.playerManager.getOriginalConnectionById(e.player);

                if(currentPlayer !== null){

                    if(this.bIgnoreBots){
                        if(currentPlayer.bBot) continue;
                    }

                    await this.ctf.insertEvent(matchId, e.timestamp, currentPlayer.masterId, e.type, e.team);
                   
                }else{
                    new Message(`CTFManager.insertEvent() currentPlayer is null`,'warning');
                }
            }

        }catch(err){
            console.trace(err);
        }
    }


    setSelfCovers(killManager){

        let c = 0;

        let currentKills = 0;
        let currentPlayer = 0;

        for(let i = 0; i < this.carryTimeFrames.length; i++){

            c = this.carryTimeFrames[i];

            currentKills = killManager.getKillsBetween(c.start, c.end, c.player, true);

            currentPlayer = this.playerManager.getOriginalConnectionById(c.player);

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