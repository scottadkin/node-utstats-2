import Functions from '../functions.js';

class GameInfo{

    constructor(data){

        this.data = data;
        this.teamScores = [0,0,0,0];

        this.start = null;
        this.end = null;
        this.length = null;
        this.endReason = null;


        this.parseData();

        this.setMatchLength();
       

    }

    parseData(){

        const reg = /^\d+\.\d+\tgame\t(.+?)\t(.+)$/i;
        const scoreReg = /^\d+\.\d+\tteamscore\t(\d+?)\t(.+)$/i;
        const startReg = /^(\d+\.\d+)\tgame_start/;
        const endReg = /^(\d+\.\d+)\tgame_end\t(.+)$/;

        //360.83	game_end	timelimit

        let result = 0;


        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);

            if(result !== null){
                this[Functions.firstCharLowerCase(result[1])] = result[2];
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

}

export default GameInfo;