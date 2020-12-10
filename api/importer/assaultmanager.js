class AssaultManager{

    constructor(){

        this.data = [];

        this.objectives = [];
        this.takenObjectives = [];
        this.attackers = null;
        this.defenders = null;

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
                    "objId": parseInt(result[4])
                });

            }else if(attackerReg.test(d)){

                result = attackerReg.exec(d);
                this.attackers = parseInt(result[1]);

            }else if(defenderReg.test(d)){

                result = defenderReg.exec(d);
                this.defenders = parseInt(result[1]);
            }
        }

        console.log(this);
    }
}


module.exports = AssaultManager;