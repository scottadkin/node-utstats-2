const Kill = require('./kill');
const Message = require('../message');
const config = require('../config.json');

class KillManager{

    constructor(data){

        this.data = data;
        this.kills = [];
        this.parseData();

        console.table(this.kills);

    }   


    parseData(){
        
        const killReg = /^(\d+\.\d+)\t(kill|teamkill)\t(\d+?)\t(.+?)\t(\d+?)\t(.+?)\t(.+)$/i;
        const distanceReg = /^(\d+\.\d+)\tnstats\tkill_distance\t(.+?)\t(\d+?)\t(\d+)$/i;
        const locationReg = /^(\d+\.\d+)\tnstats\tkill_location\t(\d+?)\t(.+?),(.+?),(.+?)\t(\d+?)\t(.+?),(.+?),(.+)$/i;

        let result = '';
        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(killReg.test(d)){

                result = killReg.exec(d);
                this.kills.push(new Kill(result[1], result[2], result[3], result[4], result[5], result[6], result[7]));              

            }else if(distanceReg.test(d)){

                result = distanceReg.exec(d);
                this.setDistance(result[1], result[2], result[3], result[4]);

            }else if(locationReg.test(d)){

                result = locationReg.exec(d);

                this.setLocations(
                    result[1],
                    result[2],
                    {
                        "x": result[3],
                        "y": result[4],
                        "z": result[5],
                    },
                    result[6],
                    {
                        "x": result[7],
                        "y": result[8],
                        "z": result[9]
                    }
                );
            }
        }
    }


    getMatchingKill(timeStamp, killer, victim){


        timeStamp = parseFloat(timeStamp);
        killer = parseInt(killer);
        victim = parseInt(victim);

        let k = 0;

        for(let i = 0; i < this.kills.length; i++){

            k = this.kills[i];

            if(k.timeStamp === timeStamp && k.killerId === killer && k.victimId === victim){

                return k;
            }
        }

        return null;
    }


    setDistance(timeStamp, distance, killer, victim){

        const kill = this.getMatchingKill(timeStamp, killer, victim);

        if(kill !== null){
            kill.setDistance(distance);
        }else{
            new Message(`There is no matching kill for ${killer} -> ${victim} @ ${timeStamp}(setDistance).`,'warning');
        }
    }

    setLocations(timeStamp, killerId, killerLocation, victimId, victimLocation){

        const kill = this.getMatchingKill(timeStamp, killerId, victimId);

        if(kill !== null){
            kill.setLocations(killerLocation, victimLocation);
        }else{
            new Message(`There is no matching kill for ${killerId} -> ${victimId} @ ${timeStamp}(setLocations).`,'warning');
        }
    }

}


module.exports = KillManager;