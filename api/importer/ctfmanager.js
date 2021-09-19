const Promise = require('promise');
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


    getLatestTimeframe(player, timestamp){


        let c = 0;

        for(let i = this.carryTimeFrames.length - 1; i >= 0; i--){

            c = this.carryTimeFrames[i];

            if(c.start < timestamp && c.player === player && c.end === undefined){
                return c;
            }
        }

        return null;
    }

    parseData(){
        
        const reg = /^(\d+?\.\d+?)\tflag_(.+?)\t(\d+?)(|\t(\d+?)|\t(\d+?)\t(\d+?))$/i;
        

        let d = 0;
        let result = 0;
        let type = 0;

        const ignored = [];

        let currentTimeframe = [];

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);

            //console.log(result);

            if(result != null){

                type = result[2].toLowerCase();

                if(type === 'kill'){

                    this.events.push({
                        "timestamp": parseFloat(result[1]),
                        "type": type,
                        "player": parseInt(result[3]),
                        "team": this.playerManager.getPlayerTeamAt(parseInt(result[3]), result[1])
                    });
                    
                }else if(type === 'assist' || type === 'returned'|| type === 'taken' || type === 'dropped' || type === 'captured' || type === 'pickedup'){

                    if(type === 'taken' || type === 'pickedup'){

                        this.carryTimeFrames.push({"start": parseFloat(result[1]), "player": parseInt(result[3]), "bFail": true});

                    }else if(type === 'dropped' || type === 'captured'){

                        currentTimeframe = this.getLatestTimeframe(parseInt(result[3]), parseFloat(result[1]));
      
                        if(currentTimeframe !== null){
                            currentTimeframe.end = parseFloat(result[1]);
                            currentTimeframe.bFail = (type === 'dropped') ? true : false
                        }else{
                            new Message(`CTFManager.parseData() currentTimeframe is null`,'warning');
                        }
                    }

                    this.events.push({
                        "timestamp": parseFloat(result[1]),
                        "type": type,
                        "player": parseInt(result[3]),
                        "team": this.playerManager.getPlayerTeamAt(parseInt(result[3]), result[1])
                    });

                }else if(type === 'cover'){

                    this.events.push({
                        "timestamp": parseFloat(result[1]),
                        "type": type,
                        "player": parseInt(result[3]),
                        "team": parseInt(result[7])
                    });

                }else if(type === 'return_closesave'){

                    this.events.push({
                        "timestamp": parseFloat(result[1]),
                        "type": "save",
                        "player": parseInt(result[3]),
                        "team": parseInt(result[5])
                    });

                }else if(type === 'seal'){

                    // KillerPRI.PlayerID, VictimPRI.PlayerID, KillerPRI.Team
              
                    this.events.push({
                        "timestamp": parseFloat(result[1]),
                        "type": "seal",
                        "player": parseInt(result[3]),
                        "team": parseInt(result[7])
                    });
                }
            } 
        }

        const locationReg = /^\d+?\.\d+?\tnstats\tflag_location\t(.+?)\t(.+?)\t(.+?)\t(.+)$/i;

        this.flagLocations = [];

        for(let i = 0; i < this.flagLines.length; i++){

            result = locationReg.exec(this.flagLines[i]);

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




    createCapData(){

        const caps = [];

        let current = [];
        let currentRed = [];
        let currentBlue = [];
        let currentGreen = [];
        let currentYellow = [];
        let matchingPickup = 0;


        const getCurrent = (team) =>{

            switch(team){
                case 0: {   return currentRed; } 
                case 1: {   return currentBlue; } 
                case 2: {   return currentGreen; } 
                case 3: {   return currentYellow; } 
            }
        }

        const setCurrent = (team, data) =>{

            switch(team){
                case 0: {    currentRed = data; } break;
                case 1: {    currentBlue = data; }  break;
                case 2: {    currentGreen = data; } break;
                case 3: {    currentYellow = data; } break;
            }
        }

        //console.log(this.events);

        for(let i = 0; i < this.events.length; i++){

            const e = this.events[i];

            if(e.type === 'taken'){

                matchingPickup = 0;

                //console.log(e);

                current = {
                    "team": e.team,
                    "grabTime": e.timestamp,
                    "grab": e.player,
                    "covers": [],
                    "coverTimes": [],
                    "assists": [],
                    "pickupTimes": [],
                    "dropTimes": [],
                    "carryTimes": [],
                    "carryIds": []
                };

    
                setCurrent(e.team, current);
                current = getCurrent(e.team);
                

            }else if(e.type === 'pickedup'){

                current = getCurrent(e.team);

                if(current === undefined){
                    new Message(`CTFManager.createCapData() current is undefined (PICKEDUP)`);
                    continue;
                }

                current.pickupTimes.push({"timestamp":e.timestamp,"player": e.player});
                
            }else if(e.type === 'dropped'){
                
                current = getCurrent(e.team);
                if(current === undefined){
                    new Message(`CTFManager.createCapData() current is undefined (DROPPED)`);
                    continue;
                }
                //console.log(current);
                current.dropTimes.push({"timestamp":e.timestamp,"player": e.player});
                
            }else if(e.type === 'cover'){

                current = getCurrent(e.team);

                if(current === undefined){
                    new Message(`CTFManager.createCapData() current is undefined (COVER)`);
                    continue;
                }
    
                //work around for players that have changed teams
                if(current.covers !== undefined){

                    current.covers.push(e.player);
                    current.coverTimes.push(e.timestamp);
                    
                }else{
                    switch(e.team){
                        case 1: {   current = currentRed; } break;
                        case 0: {   current = currentBlue; } break;
                    }

                    current.covers.push(e.player);
                    current.coverTimes.push(e.timestamp);
                }
                
            }else if(e.type === 'assist'){

               // console.log(e);
                current = getCurrent(e.team);
                if(current === undefined){
                    new Message(`CTFManager.createCapData() current is undefined (ASSIST)`);
                    continue;
                }
                //work around for players that have changed teams
                if(current.assists !== undefined){
                    current.assists.push(e.player);
                }else{
                    switch(e.team){
                        case 1: {   current = currentRed; } break;
                        case 0: {   current = currentBlue; } break;
                    }
                    current.assists.push(e.player);
                }

                //(current.assists);

            }else if(e.type === 'captured'){

                current = getCurrent(e.team);

                if(current === undefined){
                    new Message(`CTFManager.createCapData() current is undefined (CAPTURED)`);
                    continue;
                }

                current.cap = e.player;
                current.capTime = e.timestamp;
                current.travelTime = (current.capTime - current.grabTime).toFixed(2);

                this.setCoverSprees(current.covers);

                for(let x = current.dropTimes.length - 1; x >= 0; x--){

                    //first drop will always be the grab player
                    if(current.dropTimes[x].player === current.grab && x === 0){

                        current.carryTimes.push(parseFloat(parseFloat(current.dropTimes[x].timestamp - current.grabTime).toFixed(2)));
                        current.carryIds.push(current.dropTimes[x].player);

                    }else{
   
                        matchingPickup = this.getMatchingPickupId(current.pickupTimes, current.dropTimes[x].player, current.dropTimes[x].timestamp);

                        if(matchingPickup !== null){
                            current.carryTimes.push(parseFloat(parseFloat(current.dropTimes[x].timestamp - matchingPickup.timestamp).toFixed(2)));
                            current.carryIds.push(current.dropTimes[x].player);
                        }else{
                            new Message(`CTFManager.createCapData() matchingPickup is null`,'warning');
                        }
                      
                    }    
                }

                current.carryTimes.reverse();
                current.carryIds.reverse();

                //dont forget cap carry time
                if(current.pickupTimes.length > 0){
                    if(current.pickupTimes[current.pickupTimes.length - 1].player === current.cap){

                        current.carryIds.push(current.cap);
                        current.carryTimes.push(parseFloat(parseFloat(current.capTime - current.pickupTimes[current.pickupTimes.length - 1].timestamp).toFixed(2)));
                    }
                }

                
               // console.log(current);

                //check for solo caps
                if(current.grab === current.cap){
                    if(current.pickupTimes.length === 0){
                        current.carryIds.push(current.cap);
                        current.carryTimes.push(current.travelTime);
                    }
                }

                this.capData.push(current);
                
            }else if(e.type === 'returned'){

                current = getCurrent(e.team);

                if(current === undefined){
                    new Message(`CTFManager.createCapData() current is undefined (RETURNED)`);
                    continue;
                }

                this.setCoverSprees(current.covers);
            }
        }
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

    async insertCaps(matchId, mapId){

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

            let c = 0;

            for(let i = 0; i < this.capData.length; i++){

                c = this.capData[i];

                currentGrab = this.playerManager.getOriginalConnectionById(c.grab);
                
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

                for(let x = 0; x < c.dropTimes.length; x++){

                    currentDrop = this.playerManager.getOriginalConnectionById(c.dropTimes[x].player);
                    currentDrops.push(currentDrop.masterId);
                    currentDropTimes.push(c.dropTimes[x].timestamp);
                }

                for(let x = 0; x < c.pickupTimes.length; x++){

                    currentPickup = this.playerManager.getOriginalConnectionById(c.pickupTimes[x].player);
                    currentPickups.push(currentPickup.masterId);
                    currentPickupTimes.push(c.pickupTimes[x].timestamp);
                }


                for(let x = 0; x < c.covers.length; x++){

                    currentCover = this.playerManager.getOriginalConnectionById(c.covers[x]);
                    currentCover.stats.ctf.coverPass++;
                    currentCovers.push(currentCover.masterId);
                }

                for(let x = 0; x < c.assists.length; x++){

                    currentAssist = this.playerManager.getOriginalConnectionById(c.assists[x]);
                    currentAssists.push(currentAssist.masterId);
                }

                for(let x = 0; x < c.carryIds.length; x++){     

                    currentCarry = this.playerManager.getOriginalConnectionById(c.carryIds[x]);
                    currentCarryIds.push(currentCarry.masterId);
                }


                currentCap = this.playerManager.getOriginalConnectionById(c.cap);

                await this.ctf.insertCap(matchId, mapId, c.team, c.grabTime, currentGrab.masterId, currentDrops, currentDropTimes,
                    currentPickups, currentPickupTimes, currentCovers, c.coverTimes, currentAssists, c.carryTimes, currentCarryIds, currentCap.masterId, c.capTime, c.travelTime);
            }

            let p =0;

            for(let i = 0; i < this.playerManager.players.length; i++){

                p = this.playerManager.players[i];

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

            currentKills =  killManager.getKillsBetween(c.start, c.end, c.player, true);

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