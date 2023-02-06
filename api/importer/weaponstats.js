class WeaponStats{

    constructor(name){

        this.name = name;  
        this.kills = 0;
        this.deaths = 0;

        this.accuracy = 0;
        this.shots = 0;
        this.hits = 0;
        this.damage = 0;
        this.efficiency = 0;

    }

    updateEfficiency(){

        if(this.kills > 0){

            if(this.deaths === 0){
                this.efficiency = 100;
            }else{
                this.efficiency = (this.kills / (this.deaths + this.kills)) * 100;
            }

            return;
        }

        this.efficiency = 0;
    }

    killedPlayer(){
        this.kills++;
        this.updateEfficiency();
    }

    died(){
        this.deaths++;
        this.updateEfficiency();
    }

    setValue(type, value){

        type = type.toLowerCase();

        if(type === 'accuracy'){
            value = parseFloat(value);
        }else if(type === 'shotcount'){
            type = 'shots';
            value = parseInt(value);
        }else if(type === 'hitcount'){
            type = 'hits';
            value = parseInt(value);
        }else if(type === 'damagegiven'){
            type = 'damage';
            value = parseInt(value);
        }

        this[type] = value;
    }




}

module.exports = WeaponStats;