const MonsterHunt = require('../monsterhunt');
const Message = require('../message');

class MonsterHuntManager{

    constructor(){

        this.monsterHunt = new MonsterHunt();
        this.lines = [];

        this.monsterStats = {};
        this.playerTotals = {};
        this.kills = [];
        //kills be monster pawns
        this.monsterKills = [];
    }

    addNewMonsterStats(name){

        if(this.monsterStats[name] === undefined){

            this.monsterStats[name] = {
                "deaths": 0,
                "id": -1,
                "kills": 0
            };
        }
    }

    updateMonsterStats(name, deaths, kills){

        if(this.monsterStats[name] === undefined){
            this.addNewMonsterStats(name);
        }

        if(deaths !== 0) this.monsterStats[name].deaths += deaths;
        if(kills !== 0) this.monsterStats[name].kills += kills;


    }

    parseData(playerManager, killManager){
        
        const killReg = /^(\d+\.\d+?)\tnstats\tmonsterkill\t(.+?)\t(.+)$/i;
        const deathReg = /^(\d+\.\d+?)\tnstats\tmk\t(.+?)\t(.+)$/i;

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

                killerId = parseInt(result[2]);

                currentKiller = playerManager.getPlayerById(killerId);

                if(currentKiller !== null){

                    //moved here 21/07/22 to not log kills from removed players
                    this.updateMonsterStats(monsterName, 1, 0);

                    killerDeaths = killManager.getDeathsBetween(currentKiller.stats.monsterHunt.lastKill, timestamp, currentKiller.id, true);

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

            if(deathReg.test(d)){

                const result = deathReg.exec(d);

                monsterName = result[2].toLowerCase();

                const timestamp = parseFloat(result[1]);
                const monsterClass = result[2].toLowerCase();

                //ignore monsters that are logged as None
                //if(monsterClass === "none") continue;

                const playerId = parseInt(result[3]);

                const currentVictim = playerManager.getPlayerById(playerId);
                
                if(currentVictim !== null){

                    this.updateMonsterStats(monsterName, 0, 1);

                    currentVictim.diedToMonster();

                    this.monsterKills.push(
                        {
                            "timestamp": timestamp,
                            "monsterClass": monsterClass,
                            "playerId": currentVictim.masterId
                        }
                    );

                }else{
                    new Message(`MonsterHuntManager.parseData() Current Victim is null.`,"warn");
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

                    await this.monsterHunt.updatePlayerMatchData(
                        matchId, 
                        p.masterId, 
                        p.stats.monsterHunt.kills, 
                        p.stats.monsterHunt.bestKillsInLife,
                        p.stats.monsterHunt.deaths
                    );
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

                if(p.bDuplicate === undefined){
                    
                    await this.monsterHunt.updatePlayerTotals(
                        gametypeId, 
                        p.masterId, 
                        p.stats.monsterHunt.kills, 
                        p.stats.monsterHunt.bestKillsInLife,
                        p.stats.monsterHunt.deaths
                    );
                }
            }

        }catch(err){
            console.trace(err);
            new Message(`MonsterHuntManager.updatePlayerTotals() ${err} `,"error");
        }
    }



    updatePlayerTotalsObject(killerId, monsterId, kills, deaths){
        
        if(this.playerTotals[killerId] === undefined){

            this.playerTotals[killerId] = {};
        }

        if(this.playerTotals[killerId][monsterId] === undefined){

            this.playerTotals[killerId][monsterId] = {"kills": 0, "deaths": 0};
        }

        this.playerTotals[killerId][monsterId].kills += kills;
        this.playerTotals[killerId][monsterId].deaths += deaths;
    }

    setMonsterKillIds(ids){

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            k.monsterId = ids[k.name].id;

            this.monsterStats[k.name].id = k.monsterId;
            
            this.updatePlayerTotalsObject(k.killer, k.monsterId, 1, 0);

        }

        for(let i = 0; i < this.monsterKills.length; i++){

            const m = this.monsterKills[i];

            const monsterId = ids[m.monsterClass].id;

            this.updatePlayerTotalsObject(m.playerId, monsterId, 0, 1);
 
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

            for(const [key, value] of Object.entries(this.monsterStats)){

                await this.monsterHunt.updateMonsterTotals(value.id, value.deaths, value.kills);
                await this.monsterHunt.insertMonsterMatchTotals(matchId, value.id, value.deaths, value.kills);
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

                for(const [monster, stats] of Object.entries(monsters)){

                    await this.monsterHunt.insertPlayerMatchTotals(matchId, player, monster, stats.kills, stats.deaths);
                    await this.monsterHunt.updatePlayerMonsterTotals(player, monster, stats.kills, stats.deaths);
                }
            }

        }catch(err){
            console.trace(err);
            new Message(`MonsterHuntManager.insertPlayerMatchTotals() ${err}`);
        }
    }
    

    async setMatchMonsterKills(matchId){

        await this.monsterHunt.setMatchMonsterKills(matchId, this.kills.length);
    }
}


module.exports = MonsterHuntManager;