const Message = require('../message');
const CTF = require('../ctf');

class CTFManager{

    constructor(){

        this.data = [];

        this.events = [];
        this.capData = [];
        this.flagLines = [];
        this.bHaveNStatsData = false;

        this.carryTimeFrames = []; 

        this.currentFlagHolders = [null, null, null, null];

        this.ctf4Data = {};

        this.flagKills = [];

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

    resetCurrentFlags(playerId){

        const affected = [];

        for(let i = 0; i < this.currentFlagHolders.length; i++){

            const current = this.currentFlagHolders[i];

            if(current === playerId){
                affected.push(i);
                this.currentFlagHolders[i] = null;
            }
        }

        return affected;
       // console.log(this.currentFlagHolders);
    }
    
    /*dropCurrentFlags(playerId){

        for(let i = 0; i < this.currentFlagHolders.length; i++){

            const current = this.currentFlagHolders[i];

            if(current === playerId){
                this.currentFlagHolders[i] = null;
            }
        }

       //console.log(this.currentFlagHolders);
    }*/

    parseData(killManager, matchStartTimestamp){

        const reg = /^(\d+?\.\d+?)\tflag_(.+?)\t(\d+?)(|\t(\d+?)|\t(\d+?)\t(\d+?))$/i;

        const returnReg = /return/i;

        this.killManager = killManager;

        const testReg = /flag_kill/i;
        const test2Reg = /nstats/i;
        const test = [];
        const test3Reg = /nstats\tflag_kill/i;
        const test2 = [];

        //361.87	nstats	flag_kill	0	11	6938.494141	450.293762	7157.908691
        const backupReg = /^(\d+?\.\d+?)\tnstats\tflag_kill\t(\d+?)\t(\d+?)\t.+$/i;
        const backupFlagKills = [];

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];
            const result = reg.exec(d);

            if(testReg.test(d) && !test2Reg.test(d)){
                test.push(d);
            }

            if(test3Reg.test(d)){
                test2.push(d);
            }

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

                        this.currentFlagHolders[parseInt(result[5])] = playerId;

                        this.carryTimeFrames.push(
                            {
                                "start": timestamp,
                                "player": playerId,
                                "bFail": true,
                                "end": null,
                                "flagTeam": parseInt(result[5])
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


                        //if(type === "captured"){

                        const affectedFlags = this.resetCurrentFlags(playerId);

                        

                        if(type === "capture"){

                            for(let x = 0; x < affectedFlags.length; x++){

                                //dont cap the one that will be processed below twice
                                if(x !== parseInt(result[5])){
                        
                                    this.events.push(
                                        {
                                            "timestamp": timestamp,
                                            "type": type,
                                            "playerId":playerId,
                                            "playerTeam": this.playerManager.getPlayerTeamAt(playerId, timestamp),
                                            "flagTeam": x,
                                            "player": this.playerManager.getOriginalConnectionById(playerId)
                                        }
                                    );
                                }
                            }
                        }              
                    }

                   // if(type === "dropped"){
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
                    //}
                    

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
                    if(!this.bHaveNStatsData){
                        this.events.push(
                            {
                                "timestamp": timestamp,
                                "type": type,
                                "playerId": playerId,
                                "playerTeam": this.playerManager.getPlayerTeamAt(playerId, timestamp),
                                "player": this.playerManager.getOriginalConnectionById(playerId),
                                "bSuicide": false
                            }
                        );
                    }

                }else if(type === "seal"){

                   // console.log(result);

                    //"flag_seal", KillerPRI.PlayerID, VictimPRI.PlayerID, KillerPRI.Team

                    this.events.push({
                        "timestamp": timestamp,
                        "type": type,
                        "playerId": playerId,
                        "playerTeam": this.playerManager.getPlayerTeamAt(parseInt(result[3]), timestamp),
                        //"team": parseInt(result[7]),
                        "player": this.playerManager.getOriginalConnectionById(playerId)
                    });
                }     
            }else{

                const result = backupReg.exec(d);
                //console.log(result);

                if(result !== null){

                    const timestamp = parseFloat(result[1]);
                    const killerId = parseInt(result[2]);
                    const victimId = parseInt(result[3]);

                    if(timestamp <= matchStartTimestamp){
                        new Message(`CTF event happened before match start. (Warmup mode)`,"note");
                    }else{

                        this.events.push(
                            {
                                "timestamp": timestamp,
                                "type": "kill",
                                "playerId": killerId,
                                "playerTeam": this.playerManager.getPlayerTeamAt(killerId, timestamp),
                                "player": this.playerManager.getOriginalConnectionById(killerId),
                                "bSuicide": killerId === victimId
                            }
                        )
                    }
                }
                /*
                this.events.push(
                    {
                        "timestamp": timestamp,
                        "type": type,
                        "playerId": playerId,
                        "playerTeam": this.playerManager.getPlayerTeamAt(playerId, timestamp),
                        "player": this.playerManager.getOriginalConnectionById(playerId)
                    }
                );*/
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

    getSelfCoversBetween(playerId, start, end){

        const kills = this.killManager.getKillsBetween(start, end, playerId);

        const timestamps = [];

        for(let i = 0; i < kills.length; i++){

            const k = kills[i];

            timestamps.push(k.timestamp);
            
        }

        return timestamps

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
            "carryTeam": null,
            "travelTime": -1,
            "assists": [],
            "assistTimes": [],
            "pickups": [],
            "pickupTimes": [],
            "pickupIds": [],
            "selfCovers": [],
            "selfCoverTimes": [],
            "covers": [],
            "coverTimes": [],
            "dropTimes": [],
            "dropIds": [],
            "seals": [],
            "sealTimes": []
        };
    }

    dropFlags(playerId, timestamp, flags){

        let totalDropped = 0;

        for(let i = 0; i < flags.length; i++){

            const f = flags[i];

            if(f.carriedBy === playerId){
                
                f.dropTimes.push(timestamp);
                f.dropIds.push(playerId);
                f.dropped = true;
                f.carriedBy = null;
                f.carryTeam = null;

                let pickupTime = 0;

                if(f.pickupTimes.length === 0){
                    pickupTime = f.takenTimestamp;
                }else{
                    pickupTime = f.pickupTimes[f.pickupTimes.length - 1];
                }

                const carryTime = (timestamp - pickupTime).toFixed(2);

                const selfCoverTimes = this.getSelfCoversBetween(playerId, pickupTime, timestamp);

                for(let i = 0; i < selfCoverTimes.length; i++){
                    f.selfCovers.push(playerId);
                }

                f.selfCoverTimes.push(...selfCoverTimes);

                f.assistTimes.push(parseFloat(carryTime.toString(2)));

                totalDropped++;

            }
        }

        /*if(totalDropped > 1){

            this.updateCTF4Data(playerId, "drops", totalDropped - 1);
        }*/

    }

    updateCTF4Data(playerId, type, value){

        if(this.ctf4Data[playerId] === undefined){

            this.ctf4Data[playerId] = {
                "caps": 0,
                "assists": 0,
                "drops": 0
            };
        }

        this.ctf4Data[playerId][type] += value;

    }


    eventExists(timestamp, type, playerId, flagTeam){

        for(let i = 0; i < this.events.length; i++){

            const e = this.events[i];

            if(e.timestamp > timestamp) return false;

            if(e.type === type){
                
                if(e.flagTeam === flagTeam && e.playerId === playerId){
                    return true;
                }
            }
        }

        return false;
    }

    capFlags(playerId, timestamp, flags){

        let totalCapped = 0;

        for(let i = 0; i < flags.length; i++){

            const f = flags[i];

            if(f.carriedBy === playerId){

                const playerTeam = this.playerManager.getPlayerTeamAt(playerId, timestamp);

                f.capTimestamp = timestamp;
                f.cap = playerId;

                let travelTime = 0;

                if(f.takenTimestamp !== null){    
                    travelTime = timestamp - f.takenTimestamp;
                }

               // console.log(travelTime);
                if(travelTime < 0){
                   // console.log(f);
                }

                let pickupTime = f.takenTimestamp;

                if(f.pickupTimes.length > 0){

                    pickupTime = f.pickupTimes[f.pickupTimes.length - 1];
                }

                const selfCoverTimes = this.getSelfCoversBetween(playerId, pickupTime, timestamp);

                for(let x = 0; x < selfCoverTimes.length; x++){

                    f.selfCovers.push(playerId);
                }

                f.selfCoverTimes.push(...selfCoverTimes);

                //Don't duplicate data for normal ctf as assist events are logged correctly
                if(this.totalTeams > 2){

                    //count multiple assists
                    for(let x = 0; x < f.dropIds.length; x++){

                        if(f.dropIds[x] !== f.cap){

                            const player = this.playerManager.getOriginalConnectionById(f.dropIds[x]);

                            if(player !== null){

                                this.updateCTF4Data(f.dropIds[x], "assists", 1);

                                ////add missing assist events
                                /*this.events.push(
                                    {
                                        "timestamp": timestamp,
                                        "type": "assist",
                                        "playerId": playerId,
                                        "playerTeam": this.playerManager.getPlayerTeamAt(playerId, timestamp),
                                        "flagTeam": i,
                                        "player": this.playerManager.getOriginalConnectionById(playerId)
                                    }
                                );*/
                            }
                        }
                    }

                    //add missing cap events

                    /*if(!this.eventExists(timestamp, "captured", playerId, i)){

                        this.events.push(
                            {
                                "timestamp": timestamp,
                                "type": "captured",
                                "playerId": playerId,
                                "playerTeam": this.playerManager.getPlayerTeamAt(playerId, timestamp),
                                "flagTeam": i,
                                "player": this.playerManager.getOriginalConnectionById(playerId)
                            }
                        );
                    }*/
                }



                this.capData.push({
                    "team": playerTeam,
                    "flagTeam": i,
                    "grabTime": f.takenTimestamp,
                    "grab": f.grab,
                    "covers": f.covers,
                    "coverTimes": f.coverTimes,
                    "assists": f.dropIds,
                    "assistTimes": f.assistTimes,
                    "pickupIds": f.pickupIds,
                    "pickupTimes": f.pickupTimes,
                    "dropTimes": f.dropTimes,
                    "dropIds": f.dropIds,
                    "selfCovers": f.selfCovers,
                    "selfCoverTimes": f.selfCoverTimes,
                    "cap": playerId,
                    "capTime": timestamp,
                    "travelTime": parseFloat(travelTime.toFixed(3)),
                    "seals": f.seals,
                    "sealTimes": f.sealTimes

                });

                flags[i] = this.resetCurrentCapData();
                totalCapped++;
            }
        }

        
        if(totalCapped > 1){

            this.updateCTF4Data(playerId, "caps", totalCapped - 1)

        }

    }


    coverFlag(playerId, playerTeam, timestamp, flags, bSeal){

        for(let i = 0; i < flags.length; i++){

            const f = flags[i];

            if(f.carryTeam === playerTeam){

                
                if(!bSeal){
                    //console.log(`${timestamp} player ${playerId} covered the ${i} flag`);
                    f.covers.push(playerId);
                    f.coverTimes.push(timestamp);
                }else{
                    //console.log(`${timestamp} player ${playerId} sealed for the ${i} flag`);
                    f.seals.push(playerId);
                    f.sealTimes.push(timestamp);
                }
            }
        }
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

            //console.log(e);

            if(e.flagTeam !== e.flagTeam){
                new Message("this.events[id].flagTeam is NaN, skipping event.(FlagDomination?) (CTFManager.createCapData())","warning");
                continue;
            }

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

                flag.carryTeam = e.playerTeam;
                
            }else if(type === "dropped"){

                this.dropFlags(e.playerId, timestamp, flags, e.player.name);

            }else if(type === "captured"){

                this.capFlags(e.playerId, timestamp, flags);

            }else if(type === "return" || type === "save"){

                flags[e.flagTeam] = this.resetCurrentCapData();

            }else if(type === "cover"){

                this.coverFlag(e.playerId, e.playerTeam, timestamp, flags, false);

            }else if(type === "seal"){

                this.coverFlag(e.playerId, e.playerTeam, timestamp, flags, true);
            }
        }

        //console.log(flags);
        //console.log(flags.length);
        //console.log(this.capData);
        //console.log(this.capData.length);        
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

                    if(type !== "kill"){
                        player.stats.ctf[type]++;
                    }else{

                        if(!this.events[i].bSuicide){
                            player.stats.ctf[type]++;
                        }
                    }

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

                let {team, flagTeam, grab, grabTime, cap, capTime} = c;

                if(grabTime === null){
                    new Message(`ctfManager.insertCaps() grabTime is null`,"warning");
                    grabTime = -1;
                }
                if(grab === null){
                    new Message(`ctfManager.insertCaps() grab is null`,"warning");
                    grab = -1;
                }

                const grabPlayer = this.playerManager.getOriginalConnectionMasterId(grab);
                const capPlayer = this.playerManager.getOriginalConnectionMasterId(cap);


                const dropIds = this.playerManager.toMasterIds(c.dropIds);
                const assistIds = this.playerManager.toMasterIds(c.assists);
                const coverIds = this.playerManager.toMasterIds(c.covers);
                const pickupIds = this.playerManager.toMasterIds(c.pickupIds);
                const sealIds = this.playerManager.toMasterIds(c.seals);
                const travelTime = c.travelTime.toFixed(2);

                const selfCovers = this.playerManager.toMasterIds(c.selfCovers);
                
                //console.log(c);

                const uniqueAssistIds = [];

                for(let x = 0; x < assistIds.length; x++){

                    const a = assistIds[x];

                    if(uniqueAssistIds.indexOf(a) === -1){
                        uniqueAssistIds.push(a);
                    }
                }

                await this.ctf.insertCap(matchId, matchDate, mapId, c.team, flagTeam, grabTime, grabPlayer, dropIds, c.dropTimes, pickupIds,
                c.pickupTimes, coverIds, c.coverTimes, uniqueAssistIds, c.assistTimes, assistIds, capPlayer, 
                capTime, travelTime, selfCovers, c.selfCoverTimes, sealIds, c.sealTimes);

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


    async addCTF4Data(){

        try{


            for(const [playerId, data] of Object.entries(this.ctf4Data)){

                const player = this.playerManager.getOriginalConnectionById(playerId);

                //console.log(player);

                if(player !== null){

                    player.stats.ctf.capture += data.caps;
                    player.stats.ctf.assist += data.assists;
                    //player.stats.ctf.dropped += data.drops;


                }else{
                    new Message("Player is null CTFManager.addCTF4Data()", "warning");
                }
            }

        }catch(err){
            console.trace(err);
        }
    }

    sortCapDataByTravelTime(){

        this.capData.sort((a, b) =>{

            a = a.travelTime;
            b = b.travelTime;

            if(a < b){
                return -1;
            }else if(a > b){
                return 1;
            }

            return 0;
        });

    }

    async updateMapCapRecords(mapId, matchId, date){

        //console.log(this.capData);

        this.sortCapDataByTravelTime();

        let bestSoloCap = null;
        let bestAssistCap = null;

        for(let i = 0; i < this.capData.length; i++){

            const c = this.capData[i];

            if(c.assists.length === 0){

                if(bestSoloCap === null || bestSoloCap.travelTime > c.travelTime){

                    bestSoloCap = c;
                }

            }else{

                if(bestAssistCap === null || bestAssistCap.travelTime > c.travelTime){
                    bestAssistCap = c;
                }
            }
        }

        if(bestSoloCap !== null){

            const capPlayer = this.playerManager.toMasterIds([bestSoloCap.cap]);
            const grabPlayer = this.playerManager.toMasterIds([bestSoloCap.grab]);
        
            bestSoloCap.cap = capPlayer[0];
            bestSoloCap.grab = grabPlayer[0];
            
            await this.ctf.updateCapRecord(matchId, mapId, 0, bestSoloCap, date);
            
        }

        if(bestAssistCap !== null){

            const capPlayer = this.playerManager.toMasterIds([bestAssistCap.cap]);
            const grabPlayer = this.playerManager.toMasterIds([bestAssistCap.grab]);
            const assistPlayers = this.playerManager.toMasterIds(bestAssistCap.assists);
        
            bestAssistCap.cap = capPlayer[0];
            bestAssistCap.grab = grabPlayer[0];
            bestAssistCap.assists = assistPlayers;
            
            await this.ctf.updateCapRecord(matchId, mapId, 1, bestAssistCap, date);
        }
    }
}


module.exports = CTFManager;