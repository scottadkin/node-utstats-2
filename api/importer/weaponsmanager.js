const Weapons = require('../weapons');
const Message = require('../message');

class WeaponsManager{

    constructor(){

        this.weapons = new Weapons();
        this.data = [];
        this.names = [];

    }

    parseData(){

        console.log(this.data);

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
        console.table(this.names);
    }


    async update(playerManager){

        try{

            const ids = await this.weapons.getIdsByName(this.names);

            console.log(ids);

        }catch(err){
            new Message(`weaponsmanager update ${err}`,'error');
        }
    }
}

module.exports = WeaponsManager;