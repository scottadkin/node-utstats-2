const Functions = require('../functions');

class GameInfo{

    constructor(data){

        this.data = data;
        this.teamScores = [0,0,0,0];
        
        //no camelcase for this variable as it's always needed and is not always in logs
        this.friendlyfirescale = 0;

        this.start = null;
        this.end = null;
        this.length = null;
        this.endReason = null;

        this.targetScore = 0;

        this.dmWinner = '';
        this.dmWinnerScore = 0;
        


        this.parseData();

        this.setMatchLength();
        this.setGoalScore();   

    }

    parseData(){

        const reg = /^\d+\.\d+\tgame\t(.+?)\t(.+)$/i;
        const scoreReg = /^\d+\.\d+\tteamscore\t(\d+?)\t(.+)$/i;
        const startReg = /^(\d+\.\d+)\tgame_start/;
        const endReg = /^(\d+\.\d+)\tgame_end\t(.+)$/;

        let result = 0;
        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);

            if(result !== null){

                result[1] = result[1].toLowerCase();
                result[2] = result[2].toLowerCase();

                if(result[2] === 'false'){
                    result[2] = 0;
                }else if(result[2] === 'true'){
                    result[2] = 1;
                }
                
                this[result[1]] = result[2];

            }else{

                if(scoreReg.test(d)){

                    result = scoreReg.exec(d);
                    this.teamScores[parseInt(result[1])] = parseFloat(result[2]);

                }else if(startReg.test(d)){
                    
                    result = startReg.exec(d);
                    this.start = parseFloat(result[1]);

                }else if(endReg.test(d)){

                    result = endReg.exec(d);
                    this.end = parseFloat(result[1]);
                    this.endReason = result[2];
                }
            }
        }
    }

    setMatchLength(){

        this.length = 0;

        if(this.start !== null && this.end !== null){

            this.length = this.end - this.start;
        
        }else if(this.start === null && this.end !== null){
            this.length = this.end;
        }
    }

    getMatchLength(){

        return {
            "start": (this.start !== null) ? this.start : 0,
            "end": (this.end !== null) ? this.end : 0,
            "length": (this.length !== null) ? this.length : 0,
        };
    }

    setGoalScore(){

        if(this.teamgame === 1){
            this.targetScore = this.goalteamscore;
        }else{
            this.targetScore = this.fraglimit;
        }
    }

}

module.exports = GameInfo;