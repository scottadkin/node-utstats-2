class WeaponStats{

    constructor(name){

        this.name = name;  
        this.kills = 0;
        this.deaths = 0;

        this.accuracy = 0;
        this.shots = 0;
        this.hits = 0;
        this.damage = 0;

    }

    killedPlayer(){
        this.kills++;
    }

    died(){
        this.deaths++;
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