import {firstCharLowerCase} from "../functions.js";
import Maps from "../maps.js";

export default class MapInfo{

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
        const nameReg = /^(.+?)(-.+\.)(unr)$/i;

        let currentResult = 0;

        for(let i = 0; i < this.data.length; i++){

            currentResult = reg.exec(this.data[i]);            

            if(currentResult !== null){

                if(currentResult[1].toLowerCase() === "levelentertext"){
                    currentResult[2] = currentResult[2].slice(0,100);
                }

                this[firstCharLowerCase(currentResult[1])] = currentResult[2];   
                
                if(currentResult[1].toLowerCase() === "name"){

                    const nameResult = nameReg.exec(currentResult[2]);
                    

                    if(nameResult !== null){

                        const prefix = nameResult[1].toUpperCase();
                        const unr = nameResult[3].toLowerCase();
                        this.mapPrefix = prefix;
                        this.name = `${prefix}${nameResult[2]}${unr}`;
       
                    }
                }
            }
        }
    }


    async updateStats(date, matchLength){


        try{

            await this.maps.updateStats(this.name, this.title, this.author, this.idealPlayerCount, this.levelEnterText, date, matchLength);
            
            if(this.maps.bMergeError) return;

            this.mapId = await this.maps.getIdSafe(this.name);


        }catch(err){
            console.trace(err);
        }   
    }
}

