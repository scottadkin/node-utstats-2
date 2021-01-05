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

    addKillNames(names){

        for(let i = 0; i < names.length; i++){

            if(this.names.indexOf(names[i]) === -1){
                this.names.push(names[i]);
            }
        }
    }

    async update(matchId, gametypeId, playerManager){

        try{

            await this.weapons.getIdsByName(this.names);

            let p = 0;

            let currentWeaponId = 0;
            

            for(let i = 0; i < playerManager.players.length; i++){

                p = playerManager.players[i];

                console.log(p.weaponStats);

                for(const [key, value] of p.weaponStats.entries()){

                    currentWeaponId = this.weapons.getSavedWeaponByName(key);

                    if(currentWeaponId !== null){

                        if(p.bDuplicate === undefined){
                            await this.weapons.insertPlayerMatchStats(matchId, p.masterId, currentWeaponId, value);
                            await this.weapons.updatePlayerTotalStats(gametypeId, p.masterId, currentWeaponId, value);
                        }

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