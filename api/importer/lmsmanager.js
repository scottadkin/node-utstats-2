const Message = require('../message');

class LMSManager{

    constructor(playerManager, killManager, matchLength, fragLimit){

        this.playerManager = playerManager;
        this.killManager = killManager;
        this.matchLength = matchLength;
        this.fragLimit = fragLimit;

        this.cutOffPoint = null;
        this.winner = null;
        this.setCutOffTimestamp();
    }


    setCutOffTimestamp(){

        //TotalKills > 0.15 * (NumPlayers + NumBots) * Lives 

        let kill = 0;
        let currentKills = 0;
        let currentPlayers = 0;

        for(let i = 0; i < this.killManager.kills.length; i++){

            currentKills++;

            kill = this.killManager.kills[i];
            currentPlayers = this.playerManager.getCurrentConnectedPlayers(kill.timestamp);

          //  console.log(0.15 * (currentPlayers.length * this.fragLimit));

            if(currentKills >= 0.15 * (currentPlayers.length * this.fragLimit)){

                new Message(`(LMS) Match join cutoff point is ${kill.timestamp}`,'note');
                //console.log(`FOUND CUTOFFPOINT ${kill.timestamp}`);
                this.cutOffPoint = kill.timestamp;
                break;
            }
        }
    }


    getWinner(){
        
        let players = this.playerManager.getCurrentConnectedPlayers(this.matchLength.end);

        players.sort((a, b) =>{

            if(a.stats.score > b.stats.score){
                return -1;
            }else if(a.stats.score < b.stats.score){
                return 1;
            }else{

                if(a.stats.deaths < b.stats.deaths){
                    return -1;
                }else if(a.stats.deaths > b.stats.deaths){
                    return 1;
                }
            }

            return 0;
        });

        return {"name": players[0].name, "score": players[0].stats.score, "id": players[0].id};
    }
}

module.exports = LMSManager;