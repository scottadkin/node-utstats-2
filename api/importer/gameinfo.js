const Functions = require('../functions');

class GameInfo{

    constructor(data){

        this.data = data;

        this.parseData();
        this.data = null;
    }

    parseData(){

        const reg = /^\d+\.\d+\tgame\t(.+?)\t(.+)$/i;

        let currentResult = 0;

        for(let i = 0; i < this.data.length; i++){

            currentResult = reg.exec(this.data[i]);

            if(currentResult !== null){

                this[Functions.firstCharLowerCase(currentResult[1])] = currentResult[2];
            }
        }
    }
}

module.exports = GameInfo;