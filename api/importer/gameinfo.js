const Functions = require('../functions');

class GameInfo{

    constructor(data){

        this.data = data;
        this.teamScores = [0,0,0,0];

        this.parseData();

        this.data = null;

    }

    parseData(){

        const reg = /^\d+\.\d+\tgame\t(.+?)\t(.+)$/i;
        const scoreReg = /^\d+\.\d+\tteamscore\t(\d+?)\t(.+)$/i;

        let result = 0;

        for(let i = 0; i < this.data.length; i++){

            result = reg.exec(this.data[i]);

            if(result !== null){
                this[Functions.firstCharLowerCase(result[1])] = result[2];
            }else{

                if(scoreReg.test(this.data[i])){
                    result = scoreReg.exec(this.data[i]);
                    this.teamScores[parseInt(result[1])] = parseFloat(result[2]);
                }
            }
        }
    }
}

module.exports = GameInfo;