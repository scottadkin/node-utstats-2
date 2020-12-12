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

    //LogEventString(GetTimeStamp()$Chr(9)$"assault_obj"$Chr(9)$string(zzPID)$Chr(9)$string(bFinalObj)$chr(9)$string(zzFortID));

    parseData(){

        const objNameReg = /^\d+\.\d+\tassault_objname\t(.+?)\t(.+?)$/i;
        const objTakenReg = /^(\d+\.\d+)\tassault_obj\t(.+?)\t(.+?)\t(.+?)$/;
        const attackerReg = /^\d+\.\d+\tassault_attacker\t(.+)$/;
        const defenderReg = /^\d+\.\d+\tassault_defender\t(.+)$/;

        let d = 0;
        let result = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

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

            let o = 0;

            //console.log(this.objectives);

            for(let i = 0; i < this.objectives.length; i++){

                o = this.objectives[i];

                await this.assault.updateMapObjective(this.mapId, o.name, o.id);
            }
        }catch(err){
            console.trace(err);
        }
    }

    async insertCapturedMapObjectives(){

        try{

            let o = 0;

            let currentPlayerName = 0;
            let originalConnection = 0;

            //console.log(this.takenObjectives);

            for(let i = 0; i < this.takenObjectives.length; i++){

                o = this.takenObjectives[i];

                currentPlayerName = this.playerManager.getPlayerNameById(o.player);
                originalConnection = this.playerManager.getOriginalConnection(currentPlayerName);

                o.masterPlayerId = originalConnection.masterId;
                o.gametypePlayerId = originalConnection.gametypeId;
                o.playerName = originalConnection.name;

                await this.assault.insertObjectiveCapture(this.matchId, this.mapId, o.timestamp, o.objId, originalConnection.masterId, o.bFinal);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async updatePlayerCaptureTotals(){

        try{
            
            const totals = {};

            let o = 0;

            for(let i = 0; i < this.takenObjectives.length; i++){

                o = this.takenObjectives[i];

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

            for(const player in totals){
                await this.assault.updatePlayerCaptureTotals(totals[player].taken, totals[player].masterId, totals[player].gametypeId);

            }

        }catch(err){
            new Message(`updatePlayerCaptureTotals: ${err}`, 'error');
        }
    }

    async updateMapCaptureTotals(){

        try{

            let o = 0;

            for(let i = 0; i < this.takenObjectives.length; i++){

                o = this.takenObjectives[i];

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
}


module.exports = AssaultManager;