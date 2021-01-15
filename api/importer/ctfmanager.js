const Promise = require('promise');
const Message = require('../message');
const CTF = require('../ctf');

class CTFManager{

    constructor(){

        this.data = [];

        this.events = [];
        this.capData = [];

        this.ctf = new CTF();
    }

    bHasData(){
        return this.data.length !== 0;
    }

    parseData(){
        
        const reg = /^(\d+?\.\d+?)\tflag_(.+?)\t(\d+?)(|\t(\d+?)|\t(\d+?)\t(\d+?))$/i;

        let d = 0;
        let result = 0;
        let type = 0;

        const ignored = [];

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);

           // console.log(result);

            if(result != null){

                type = result[2].toLowerCase();

                if(type === 'kill'){

                    this.events.push({
                        "timestamp": parseFloat(result[1]),
                        "type": type,
                        "player": parseInt(result[3])
                    });
                    
                }else if(type === 'assist' || type === 'returned' || type === 'taken' || type === 'dropped' || type === 'captured' || type === 'pickedup'){

                    
                    this.events.push({
                        "timestamp": parseFloat(result[1]),
                        "type": type,
                        "player": parseInt(result[3]),
                        "team": parseInt(result[5])
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

                }else{
                   // ignored.push(type);
                }
            }
        }

        //console.log(this.events);

        //console.log(`${this.events.length} converted out of a possible ${this.data.length}`);
        //console.log(ignored);

        this.createCapData();
    }




    createCapData(){

        const caps = [];

        let current = [];
        let currentRed = [];
        let currentBlue = [];
        let currentGreen = [];
        let currentYellow = [];
        
        let e = 0;

        for(let i = 0; i < this.events.length; i++){

            e = this.events[i];

            if(e.type === 'taken'){

                current = {
                    "team": e.team,
                    "grabTime": e.timestamp,
                    "grab": e.player,
                    "covers": [],
                    "assists": []
                };

                switch(e.team){
                    case 0: {   currentRed = current; } break;
                    case 1: {   currentBlue = current; } break;
                    case 2: {   currentGreen = current; } break;
                    case 3: {   currentYellow = current; } break;
                }

            }else if(e.type === 'cover'){

                switch(e.team){
                    case 0: {   current = currentRed; } break;
                    case 1: {   current = currentBlue; } break;
                    case 2: {   current = currentGreen; } break;
                    case 3: {   current = currentYellow; } break;
                }
    
                //work around for players that have changed teams
                if(current.covers !== undefined){
                    current.covers.push(e.player);
                }else{
                    switch(e.team){
                        case 1: {   current = currentRed; } break;
                        case 0: {   current = currentBlue; } break;
                    }

                    current.covers.push(e.player);
                }
                
            }else if(e.type === 'assist'){

                switch(e.team){
                    case 0: {   current = currentRed; } break;
                    case 1: {   current = currentBlue; } break;
                    case 2: {   current = currentGreen; } break;
                    case 3: {   current = currentYellow; } break;
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

            }else if(e.type === 'captured'){

                switch(e.team){
                    case 0: {   current = currentRed; } break;
                    case 1: {   current = currentBlue; } break;
                    case 2: {   current = currentGreen; } break;
                    case 3: {   current = currentYellow; } break;
                }

                current.cap = e.player;
                current.capTime = e.timestamp;
                current.travelTime = (current.capTime - current.grabTime).toFixed(2);

                this.capData.push(current);
                
            }

        }

        //console.table(caps);
    }


    setPlayerStats(){

        let e = 0;
        let player = 0;
        

        for(let i = 0; i < this.events.length; i++){

            e = this.events[i];

            player = this.playerManager.getPlayerById(e.player);

            if(player !== null){

                if(e.type !== 'captured' && e.type !== 'returned' && e.type !== 'pickedup'){
                    player.stats.ctf[e.type]++;
                }else{

                    if(e.type === 'captured'){
                        player.stats.ctf.capture++
                    }else if(e.type === 'retuned'){
                        player.stats.ctf.return++;
                    }else if(e.type === 'pickedup'){
                        player.stats.ctf.pickup++;
                    }
                }

            }else{
                new Message(`Could not find a player with id ${e.player}`,'warning');
            }
        }
    }


    async updatePlayerTotals(){

        try{

            const players = this.playerManager.players;
            for(let i = 0; i < players.length; i++){

                if(players[i].bDuplicate === undefined){
                    await this.ctf.updatePlayerTotals(players[i].masterId,players[i].gametypeId,players[i].stats.ctf);
                }
            }

            new Message(`Updated Player CTF totals.`,'pass');
        }catch(err){
            console.trace(err);
        }
    }

    async updatePlayersMatchStats(){

        try{

            const players = this.playerManager.players;

            for(let i = 0; i < players.length; i++){

                if(players[i].bDuplicate === undefined){
                    await this.ctf.updatePlayerMatchStats(players[i].matchId, players[i].stats.ctf);
                }
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

            let c = 0;

            for(let i = 0; i < this.capData.length; i++){

                c = this.capData[i];
                currentGrab = this.playerManager.getOriginalConnectionById(c.grab);
                
                currentCovers = [];
                currentAssists = [];

                for(let x = 0; x < c.covers.length; x++){
                    currentCover = this.playerManager.getOriginalConnectionById(c.covers[x]);
                    currentCovers.push(currentCover.masterId);
                }

                for(let x = 0; x < c.assists.length; x++){
                    currentAssist = this.playerManager.getOriginalConnectionById(c.assists[x]);
                    currentAssists.push(currentCover.masterId);
                }

                currentCap = this.playerManager.getOriginalConnectionById(c.cap);

                await this.ctf.insertCap(matchId, mapId, c.team, c.grabTime, currentGrab.masterId, currentCovers, currentAssists, currentCap.masterId, c.capTime, c.travelTime);
            }

        }catch(err){
            console.trace(err);
            new Message(`inserCaps ${err}`,'error');
        }
    }
}


module.exports = CTFManager;