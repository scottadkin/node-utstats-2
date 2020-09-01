const Promise = require('promise');
const ServerInfo = require('./serverInfo');

class LogParser{

    constructor(data){

        console.log(`new log parser`);

        this.data = data;

        this.convertFileToLines();

        console.log(this.lines);
        this.serverInfo = new ServerInfo(this.serverLines);

    }


    convertFileToLines(){


        const reg = /^(.+?)$/img;
        const serverReg = /^\d+\.\d+?\tinfo\t.+$/i;

        this.lines = this.data.match(reg);

        this.serverLines = [];

        for(let i = 0; i < this.lines.length; i++){

            if(serverReg.test(this.lines[i])){
                this.serverLines.push(this.lines[i]);
            }
        }

        console.log(this.serverLines);




    }



}

module.exports = LogParser;