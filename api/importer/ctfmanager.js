const Promise = require('promise');
const Message = require('../message');
const CTF = require('../ctf');

class CTFManager{

    constructor(){

        this.data = [];

        this.events = [];

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
                        "player": parseInt(result[6]),
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
            new Message(`updatePlayersMatchStats`,'error');
        }
    }
}


module.exports = CTFManager;