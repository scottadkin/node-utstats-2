const Functions = require('../functions');
const Maps = require('../maps');

class MapInfo{

    constructor(data){

        this.data = data;      
        this.maps = new Maps();
        this.mapId = null;
        this.mapPrefix = "";
        this.parseData();
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
        const prefixReg = /^(.+?)-.+$/i;

        let currentResult = 0;

        for(let i = 0; i < this.data.length; i++){

            currentResult = reg.exec(this.data[i]);            

            if(currentResult !== null){

                this[Functions.firstCharLowerCase(currentResult[1])] = currentResult[2];   
                
                if(currentResult[1].toLowerCase() === "name"){

                    currentResult = prefixReg.exec(currentResult[2]);

                    if(currentResult !== null){
                        this.mapPrefix = currentResult[1].toLowerCase();
                    }

                }
            }
        }
    }


    async updateStats(date, matchLength){


        try{

            await this.maps.updateStats(this.name, this.title, this.author, this.idealPlayerCount, this.levelEnterText, date, matchLength);
            
            this.mapId = await this.maps.getId(this.name);

        }catch(err){
            console.trace(err);
        }   
    }

}

module.exports = MapInfo;