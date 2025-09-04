import Pings from "../pings.js";
import Message from "../message.js";

export default class PingManager{

    constructor(){

        this.lines = [];
        this.data = [];
        this.pings = new Pings();

        this.playerValues = {};
        
    }

    parsePings(playerManager){

        const reg = /^(\d+?\.\d+?)\tplayer\tping\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.lines.length; i++){

            const p = this.lines[i];

            const result = reg.exec(p);

            if(result !== null){

                const timestamp = parseFloat(result[1]);

                /*if(timestamp < playerManager.matchTimings.start){
                    new Message(`Ping event before match, ignoring.`,"note");
                }*/

                const playerId = parseInt(result[2]);
                const currentPing = parseInt(result[3]);

     

                if(currentPing != 0){

                    const currentPlayer = playerManager.getPlayerById(playerId);

                    //const currentPing = parseInt(result[3]);

                    if(currentPlayer !== null){

                        //don't want to save bot ping data as it's pointless
                        if(!currentPlayer.bBot){

                            const masterId = currentPlayer.masterId;

                            if(masterId === undefined){
                                new Message(`parsePings() masterId is undefined.`, "Warning");
                                continue;
                            }

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
                                "timestamp": parseInt(timestamp), //no need to save decimals with how far between ping events are
                                "player": currentPlayer.masterId,
                                "ping": currentPing
                            });
                        }
                        

                    }else{
                        new Message(`Pings.parsePings() There is no player with the id ${playerId}`,'warning');
                    }
                }
            }
        }
    }

    async insertPingData(matchId){

        try{

            new Message(`Starting to insert player ping data.`,'note');

            const insertVars = [];

            for(let i = 0; i < this.data.length; i++){

                const d = this.data[i];

                if(d.player !== undefined){
                    //await this.pings.insert(matchId, d.timestamp, d.player, d.ping);
                    insertVars.push([matchId, d.timestamp, d.player, d.ping]);
                }
            }

            if(insertVars.length > 0){
                await this.pings.bulkInsert(insertVars);
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

    getMatchAverage(playerManager){

        let dataPoints = 0;

        const min = {"min": null, "average": 0, "max": null, "total": 0};
        const average = {"min": null, "average": 0, "max": null, "total": 0};
        const max = {"min": null, "average": 0, "max": null, "total": 0};
    

        for(let i = 0; i < playerManager.players.length; i++){

            const p = playerManager.players[i];

            if(p.bDuplicate === undefined && p.bPlayedInMatch && p.stats.time_on_server > 0){

                const currentData = this.getPlayerValues(p.masterId);

                if(currentData !== null){

                    dataPoints++;

                    if(min.min === null) min.min = currentData.min;
                    if(min.max === null) min.max = currentData.min;

                    if(average.min === null) average.min = currentData.average;
                    if(average.max === null) average.max = currentData.average;

                    if(max.min === null) max.min = currentData.max;
                    if(max.max === null) max.max = currentData.max;

                    if(currentData.min < min.min) min.min = currentData.min;
                    if(currentData.min > min.max) min.max = currentData.min;

                    if(currentData.average < average.min) average.min = currentData.average;
                    if(currentData.average > average.max) average.max = currentData.average;

                    if(currentData.max < max.min) max.min = currentData.max;
                    if(currentData.max > max.max) max.max = currentData.max;

                    min.total += currentData.min;
                    average.total += currentData.average;
                    max.total += currentData.max;
              
                }
            }
        }

        if(dataPoints > 0){

            if(min.total > 0) min.average = min.total / dataPoints;
            if(average.total > 0) average.average = average.total / dataPoints;
            if(max.total > 0) max.average = max.total / dataPoints;
        }

        return {"min": min, "average": average, "max": max};
    }
}
