import Message from "../message.js";

export default class GameInfo{

    constructor(data){

        this.data = data;
        this.teamScores = [0,0,0,0];

        this.totalTeams = 0;
        
        //no camelcase for this variable as it's always needed and is not always in logs
        this.friendlyfirescale = 0;

        this.start = 0;
        this.end = 0;
       // this.length = 0;
        this.endReason = 0;

        this.matchLength = 0;

        this.targetScore = 0;

        this.dmWinner = '';
        this.dmWinnerScore = 0;

        this.mutators = [];
        
        this.hardcore = 0;


        this.parseData();

        this.setMatchLength();
        this.setGoalScore();   

       // console.log(this.teamScores);

    }

    parseData(){

        const reg = /^\d+\.\d+\tgame\t(.+?)\t(.+)$/i;
        const scoreReg = /^\d+\.\d+\tteamscore\t(.+?)\t(.+)$/i;
        const startReg = /^(\d+\.\d+)\tgame_start/;
        const endReg = /^(\d+\.\d+)\tgame_end\t(.+)$/;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];
            let result = reg.exec(d);

            if(result !== null){

                const result1LowerCase = result[1].toLowerCase();
                const result2LowerCase = result[2].toLowerCase();

                if(result2LowerCase === "false"){
                    result[2] = 0;
                }else if(result2LowerCase === "true"){
                    result[2] = 1;
                }

                if(result1LowerCase === "goodmutator"){
                    this.mutators.push(result[2]);
                }else{
                    this[result1LowerCase] = result[2];
                }


            }else{

                if(scoreReg.test(d)){

                    result = scoreReg.exec(d);
                    this.teamScores[parseInt(result[1])] = parseFloat(result[2]);

                    this.totalTeams++;

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

        if(this.gamename !== undefined){

            if(this.insta !== undefined){

                if(this.insta === 1){
                    this.gamename = this.gamename + " (Instagib)";
                }
            }
        }
    }

    setMatchLength(){

        this.matchLength = 0;

        const sn3pValue = 1.09863333333333333333333333333333333333333333333333333333333;

        if(this.start !== null && this.end !== null){

            this.matchLength = this.end - this.start;
        
        }else if(this.start === null && this.end !== null){
            this.matchLength = this.end;
        }

        //gamespeed is 110%
        if(this.hardcore){
            new Message(`Match mode is hardcore!`,"note");
            if(this.matchLength !== 0){
                this.matchLength = this.matchLength / 1.1;
            }
        }
    }

    getMatchLength(){

        return {
            "start": (this.start !== null) ? this.start : 0,
            "end": (this.end !== null) ? this.end : 0,
            "length": (this.matchLength !== null) ? this.matchLength : 0,
        };
    }

    setGoalScore(){

        if(this.teamgame === 1){
            this.targetScore = this.goalteamscore;
        }else{
            this.targetScore = this.fraglimit;
        }
    }

    getWinningTeam(){

        let winner = [];
        let winningScore = null;

        for(let i = 0; i < this.teamScores.length; i++){

            if(winner === null){

                winner.push(i);
                winningScore = this.teamScores[i];

            }else{

                if(this.teamScores[i] > winningScore){
                    winner = [i];
                    winningScore = this.teamScores[i];
                }else if(this.teamScores[i] === winningScore){
                    winner.push(i);
                }
            }
        }

        return winner;
    }

}
