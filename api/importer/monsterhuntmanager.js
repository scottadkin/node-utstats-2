const MonsterHunt = require('../monsterhunt');
const Message = require('../message');

class MonsterHuntManager{

    constructor(){

        this.monsterHunt = new MonsterHunt();
        this.lines = [];

        this.monsterStats = {};
        this.kills = [];
    }

    parseData(playerManager, killManager){
        
        const killReg = /^(\d+\.\d+?)\tnstats\tmonsterkill\t(.+?)\t(.+)$/i;

        let result = 0;
        let monsterName = "";
        let killerId = 0;
        let currentKiller = 0;
        let killerDeaths = 0;
        let timestamp = 0;

        let d = 0;

        for(let i = 0; i < this.lines.length; i++){

            d = this.lines[i];

            if(killReg.test(d)){

                result = killReg.exec(d);

                timestamp = parseFloat(result[1]);
                monsterName = result[3].toLowerCase();

                if(this.monsterStats[monsterName] === undefined){

                    this.monsterStats[monsterName] = {
                        "deaths": 0
                    };
                }

                this.monsterStats[monsterName].deaths++;

                killerId = parseInt(result[2]);

                currentKiller = playerManager.getOriginalConnectionById(killerId);

               // console.log(currentKiller);

                if(currentKiller !== null){

                    killerDeaths = killManager.getDeathsBetween(currentKiller.stats.monsterHunt.lastKill, timestamp, currentKiller.id, true);
                    //console.log(`I had ${killerDeaths} deaths between my last kill ${timestamp}`);

                    if(killerDeaths > 0){
                        currentKiller.updateMonsterHuntSprees();
                    }
                    
                    currentKiller.killedMonster(timestamp);

                }

               // console.log(result);
            }
        }

        console.table(this.monsterStats);
    }


    

    async updatePlayerMatchData(matchId, players){

        try{

            let p = 0;

            for(let i = 0; i < players.length; i++){

                p = players[i];

                if(p.bDuplicate === undefined){
                    await this.monsterHunt.updatePlayerMatchData(matchId, p.masterId, p.stats.monsterHunt.kills, p.stats.monsterHunt.bestKillsInLife);
                }
            }

        }catch(err){
            console.trace(err);
            new Message(`MonsterHuntManager.updatePlayersMatchData() ${err} `,"error");
        }
    }

    async updatePlayerTotals(gametypeId, players){

        try{

            let p = 0;

            for(let i = 0; i < players.length; i++){

                p = players[i];

                if(p.bDUplicate === undefined){

                    await this.monsterHunt.updatePlayerTotals(gametypeId, p.masterId, p.stats.monsterHunt.kills, p.stats.monsterHunt.bestKillsInLife);
                }
            }

        }catch(err){
            console.trace(err);
            new Message(`MonsterHuntManager.updatePlayerTotals() ${err} `,"error");
        }
    }
}


module.exports = MonsterHuntManager;