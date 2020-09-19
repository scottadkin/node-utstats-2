
import Functions from '../functions.js';

class MapInfo{

    constructor(data){

        this.data = data;
        this.parseData();
        this.data = null;
    }

    getMatchingType(type){

        type = type.toLowerCase();

        for(let i = 0; i < this.types.length; i++){

            if(this.types[i].label === type){
                return this.types[i].var;
            }
        }

        return null;
    }

    parseData(){

        const reg = /^\d+\.\d+?\tmap\t(.+?)\t(.*)$/i;

        let currentResult = 0;

        for(let i = 0; i < this.data.length; i++){

            currentResult = reg.exec(this.data[i]);

            if(currentResult !== null){
                this[Functions.firstCharLowerCase(currentResult[1])] = currentResult[2]      
            }
        }
    }

}

export default MapInfo;