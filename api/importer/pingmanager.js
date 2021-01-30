const Promise = require('promise');
const Pings = require('../pings');
const Message = require('../message');

class PingManager{

    constructor(){

        this.lines = [];
        this.data = [];
        this.pings = new Pings();

        this.playerValues = [];
        
    }

    parsePings(playerManager){

        const reg = /^(\d+?\.\d+?)\tplayer\tping\t(.+?)\t(.+)$/i;

        let p = 0;
        let result = 0;
        let currentPlayer = 0;

        let valueIndex = 0;
        let currentPing = 0;
        let masterId = 0;
        
        for(let i = 0; i < this.lines.length; i++){

            p = this.lines[i];

            result = reg.exec(p);

            if(result !== null){

                if(parseInt(result[3]) != 0){

                    currentPlayer = playerManager.getOriginalConnectionById(result[2]);

                    currentPing = parseInt(result[3]);

                    if(currentPlayer !== null){

                        if(currentPlayer.bDuplicate === undefined){
                            //don't want to save bot ping data as it's pointless
                            if(!currentPlayer.bBot){

                                masterId = currentPlayer.masterId;

                                //valueIndex = this.playerValues.indexOf(masterId);

                                if(this.playerValues[masterId] !== undefined){

                                    this.playerValues[masterId].totalData++;

                                    if(currentPing < this.playerValues[masterId].min){
                                        this.playerValues[masterId].min = currentPing;
                                    }

                                    if(currentPing > this.playerValues[masterId].max){
                                        this.playerValues[masterId].max = currentPing;
                                    }

                                    this.playerValues[masterId].total += currentPing;

                                    if(this.playerValues[masterId].total > 0){
                                        this.playerValues[masterId].average = this.playerValues[masterId].total / this.playerValues[masterId].totalData;
                                    }
                                   

                                }else{

                                    this.playerValues[masterId] = {
                                        "min": currentPing,
                                        "max": currentPing,
                                        "average": currentPing,
                                        "totalData": 1,
                                        "total": currentPing
                                    };
                                }

                                this.data.push({
                                    "timestamp": parseInt(result[1]), //no need to save decimals with how far between ping events are
                                    "player": currentPlayer.masterId,
                                    "ping": currentPing
                                });
                            }
                        }
                    }else{
                        new Message(`Pings.parsePings() There is no player with the id ${result[2]}`,'warning');
                    }
                }
            }
        }
    }

    async insertPingData(matchId){

        try{

            new Message(`Starting to insert player ping data.`,'note');
            let d = 0;

            for(let i = 0; i < this.data.length; i++){

                d = this.data[i];

                await this.pings.insert(matchId, d.timestamp, d.player, d.ping);
            }

            new Message(`Inserted all player ping data.`,'pass');

        }catch(err){
            console.trace(`PingManager.insertPingData() ${err}`,'error');
        }
    }

    getPlayerValues(id){

        if(this.playerValues[id] !== undefined){
            return this.playerValues[id];
        }
        return null;
    }
}

module.exports = PingManager;