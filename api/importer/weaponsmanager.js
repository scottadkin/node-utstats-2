const Weapons = require('../weapons');
const Message = require('../message');

class WeaponsManager{

    constructor(){

        this.weapons = new Weapons();
        this.data = [];
        this.names = [];

    }

    parseData(){

        //console.log(this.data);

        const nameReg = /^\d+\.\d+\tweap_.+?\t(.+?)\t.+$/i;

        let d = 0;
        let result = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(nameReg.test(d)){

                result = nameReg.exec(d);

                if(this.names.indexOf(result[1]) === -1){
                    this.names.push(result[1]);
                }

            }
        }
    }


    async update(matchId, playerManager){

        try{

            await this.weapons.getIdsByName(this.names);

            let p = 0;

            let currentWeaponId = 0;

            for(let i = 0; i < playerManager.players.length; i++){

                p = playerManager.players[i];

                for(const [key, value] of p.weaponStats.entries()){

                    currentWeaponId = this.weapons.getSavedWeaponByName(key);

                    if(currentWeaponId !== null){
                        await this.weapons.insertPlayerMatchStats(matchId, p.masterId, currentWeaponId, value);
                    }else{
                        new Message(`currentWeaponId is null for ${key}`,'warning');
                    }
                }
            }

        }catch(err){
            new Message(`weaponsmanager update ${err}`,'error');
        }
    }
}

module.exports = WeaponsManager;