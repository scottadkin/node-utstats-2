const Promise = require('promise');
const Message = require('../message');

class CTFManager{

    constructor(){

        this.data = [];

        this.events = [];
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

        console.log(`${this.events.length} converted out of a possible ${this.data.length}`);
        //console.log(ignored);
    }


    setPlayerStats(playerManager){

        /**
         * "assist": 0,
                "return": 0,
                "taken": 0,
                "dropped": 0,
                "capture": 0,
                "pickedup": 0,
                "cover": 0,
                "kill": 0,
                "saves": 0
         */

        let e = 0;
        let player = 0;
        

        for(let i = 0; i < this.events.length; i++){

            e = this.events[i];

            player = playerManager.getPlayerById(e.player);

            if(player !== null){

                if(e.type !== 'captured' && e.type !== 'returned'){
                    player.stats.ctf[e.type]++;
                }else{

                    if(e.type === 'captured'){
                        player.stats.ctf.capture++
                    }else if(e.type === 'retuned'){
                        player.stats.ctf.return++;
                    }
                }

            }else{
                new Message(`Could not find a player with id ${e.player}`,'warning');
            }
        }

        for(let i = 0; i < playerManager.players.length; i++){
            console.log(playerManager.players[i].stats.ctf);
        }
    }
}


module.exports = CTFManager;