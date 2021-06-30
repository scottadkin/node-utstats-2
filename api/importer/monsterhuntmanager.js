const MonsterHunt = require('../monsterhunt');
const Message = require('../message');

class MonsterHuntManager{

    constructor(){

        this.monsterHunt = new MonsterHunt();
        this.lines = [];

        this.monsterStats = {};
        this.playerTotals = {};
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
                        "deaths": 0,
                        "id": -1
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

                    this.kills.push({
                        "timestamp": timestamp,
                        "name": monsterName,
                        "killer": currentKiller.masterId,
                        "monsterId": -1          
                    });

                }
            }
        }

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


    setMonsterKillIds(ids){

        let k = 0;

        for(let i = 0; i < this.kills.length; i++){

            k = this.kills[i];

            k.monsterId = ids[k.name].id;
            //this.monsterStats[k.name].deaths++;
            this.monsterStats[k.name].id = k.monsterId;

            if(this.playerTotals[k.killer] === undefined){
                this.playerTotals[k.killer] = {};
            }

            if(this.playerTotals[k.killer][k.monsterId] === undefined){
                this.playerTotals[k.killer][k.monsterId] = 0;
            }

            this.playerTotals[k.killer][k.monsterId]++;
        }


    }

    

    async updateMatchMonsterTotals(matchId){
   
        try{

            const monsterClasses = [];

            for(const [key, value] of Object.entries(this.monsterStats)){

                if(monsterClasses.indexOf(key) === -1){
                    monsterClasses.push(key);
                }
            }

            const monsterIds = await this.monsterHunt.getMonsterIds(monsterClasses);

            this.setMonsterKillIds(monsterIds);

            //console.table(this.monsterStats);

            for(const [key, value] of Object.entries(this.monsterStats)){
                

                await this.monsterHunt.updateMonsterTotals(value.id, value.deaths);
                await this.monsterHunt.insertMonsterMatchTotals(matchId, value.id, value.deaths);
            }

        }catch(err){
            console.trace(err);
            new Message(`MonsterHuntManager.updateMonsterTotals() ${err}`);
        }
    }         

    async insertKills(matchId){

        try{

            let k = 0;

            for(let i = 0; i < this.kills.length; i++){

                k = this.kills[i];

                await this.monsterHunt.insertKill(matchId, k.timestamp, k.monsterId, k.killer);
            }

        }catch(err){
            console.trace(err);
            new Message(`MonsterHuntManager.insertKills() ${err}`);
        }
    }

    async insertPlayerMatchTotals(matchId){

        try{

            for(const [player, monsters] of Object.entries(this.playerTotals)){

                for(const [monster, kills] of Object.entries(monsters)){

                    await this.monsterHunt.insertPlayerMatchTotals(matchId, player, monster, kills);
                    await this.monsterHunt.updatePlayerMonsterTotals(player, monster, kills);
                }
            }

        }catch(err){
            console.trace(err);
            new Message(`MonsterHuntManager.insertPlayerMatchTotals() ${err}`);
        }
    }
}


module.exports = MonsterHuntManager;