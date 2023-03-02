const Assault = require('../assault');
const Message = require('../message');

class AssaultManager{

    constructor(){

        this.data = [];

        this.objectives = [];
        this.takenObjectives = [];
        this.attackers = null;
        this.defenders = null;

        this.assault = new Assault();

    }

    parseData(){

        const objNameReg = /^\d+\.\d+\tassault_objname\t(.+?)\t(.+?)$/i;
        const objTakenReg = /^(\d+\.\d+)\tassault_obj\t(.+?)\t(.+?)\t(.+?)$/;
        const attackerReg = /^\d+\.\d+\tassault_attacker\t(.+)$/;
        const defenderReg = /^\d+\.\d+\tassault_defender\t(.+)$/;

        let result = 0;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            if(objNameReg.test(d)){

                result = objNameReg.exec(d);

                this.objectives.push(
                    {
                        "name": result[2],
                        "id": parseInt(result[1])
                    }
                );
                
            }else if(objTakenReg.test(d)){
               
                result = objTakenReg.exec(d);

                this.takenObjectives.push({
                    "timestamp": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "bFinal":  (result[3].toLowerCase() === 'true') ? 1 : 0,
                    "objId": parseInt(result[4]),
                    "masterPlayerId": null,
                    "gametypeId": null,
                    "playerName": null
                });

            }else if(attackerReg.test(d)){

                result = attackerReg.exec(d);
                this.attackers = parseInt(result[1]);

            }else if(defenderReg.test(d)){

                result = defenderReg.exec(d);
                this.defenders = parseInt(result[1]);
            }
        }

        //console.log(this);
    }


    async updateMapObjectives(){

        try{

            for(let i = 0; i < this.objectives.length; i++){

                const o = this.objectives[i];
                await this.assault.updateMapObjective(this.mapId, o.name, o.id);
            }
        }catch(err){
            console.trace(err);
        }
    }

    async insertCapturedMapObjectives(){

        try{

            for(let i = 0; i < this.takenObjectives.length; i++){

                const o = this.takenObjectives[i];

                const player = this.playerManager.getPlayerById(o.player);

                if(player === null){
                    new Message(`assaultManager.insertCapturedMapObjectives() player is null.`,"warning");
                    continue;
                }

                o.masterPlayerId = player.masterId;
                o.gametypePlayerId = player.gametypeId;
                o.playerName = player.name;

                await this.assault.insertObjectiveCapture(this.matchId, this.mapId, o.timestamp, o.objId, player.masterId, o.bFinal);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async updatePlayerCaptureTotals(){

        try{
            
            const totals = {};

            for(let i = 0; i < this.takenObjectives.length; i++){

                const o = this.takenObjectives[i];

                if(totals[o.playerName] !== undefined){
                    totals[o.playerName].taken++;
                }else{
                    totals[o.playerName] = {
                        "taken": 1,
                        "name": o.playerName,
                        "masterId": o.masterPlayerId,
                        "gametypeId": o.gametypePlayerId
                    };
                }
            }

            for(const playerData of Object.values(totals)){

                await this.assault.updatePlayerCaptureTotals(playerData.taken, playerData.masterId, playerData.gametypeId);
                const player = this.playerManager.getPlayerByMasterId(playerData.masterId);

                if(player !== null){
                    player.stats.assault.caps = playerData.taken;   
                }else{
                    new Message(`updatePlayerCaptureTotals: currentPlayer is null`,'warning');
                }
            }

        }catch(err){
            new Message(`updatePlayerCaptureTotals: ${err}`, 'error');
        }
    }

    async updateMapCaptureTotals(){

        try{

            for(let i = 0; i < this.takenObjectives.length; i++){

                const o = this.takenObjectives[i];

                await this.assault.updateMapCaptureTotals(this.mapId, o.objId, 1);
            }

        }catch(err){
            new Message(`updateMapCaptureTotals: ${err}`, 'error');
        }
    }


    async setAttackingTeam(){

        try{

            await this.assault.setAttackingTeam(this.matchId, this.attackers);

        }catch(err){
            new Message(`setAttackingTeam: ${err}`, 'error');
        }
    }

    async setMatchCaps(){

        try{

            await this.assault.setMatchAssaultCaps(this.matchId, this.takenObjectives.length);

        }catch(err){
            new Message(`setMatchCaps: ${err}`, 'error');
        }
    }


    async updatePlayersMatchStats(){

        try{

            const players = this.playerManager.players;

            for(let i = 0; i < players.length; i++){

                const p = players[i];

                if(p.stats.assault.caps > 0){
                    await this.assault.updatePlayerMatchCaps(p.matchId, p.stats.assault.caps);
                }
            
            }

        }catch(err){
            new Message(`updatePlayersMatchStats ${err}`,'error');
        }
    }
}


module.exports = AssaultManager;