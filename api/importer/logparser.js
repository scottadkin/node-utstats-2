const Promise = require('promise');
const ServerInfo = require('./serverinfo');
const MapInfo = require('./mapinfo');
const GameInfo = require('./gameinfo');

class LogParser{

    constructor(data){

        console.log(`new log parser`);

        this.data = data;

        this.convertFileToLines();

        this.serverInfo = new ServerInfo(this.serverLines);
        this.mapInfo = new MapInfo(this.mapLines);
        this.gameInfo = new GameInfo(this.gameLines);


    }


    convertFileToLines(){

        const reg = /^(.+?)$/img;
        const typeReg = /^\d+\.\d+?\t(.+?)\t.+$/i;

        this.lines = this.data.match(reg);

        this.serverLines = [];
        this.mapLines = [];
        this.gameLines = [];

        let typeResult = 0;
        let currentType = 0;

        for(let i = 0; i < this.lines.length; i++){

            typeResult = typeReg.exec(this.lines[i]);

            if(typeResult !== null){

                currentType = typeResult[1].toLowerCase();

                if(currentType == 'info'){
                    this.serverLines.push(this.lines[i]);
                }else if(currentType == 'map'){
                    this.mapLines.push(this.lines[i]);
                }else if(currentType == 'game' || currentType == "game_start" || currentType == "game_end"){
                    this.gameLines.push(this.lines[i]);
                }
            }

        }

        console.log(this.gameLines);




    }



}

module.exports = LogParser;