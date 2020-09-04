const Promise = require('promise');
const ServerInfo = require('./serverinfo');
const MapInfo = require('./mapinfo');
const GameInfo = require('./gameinfo');
const PlayerManager = require('./playermanager');
const KillManager = require('./killmanager');

class LogParser{

    constructor(data){

        //console.log(`new log parser`);

        this.data = data;

        this.convertFileToLines();

        this.serverInfo = new ServerInfo(this.serverLines);
        this.mapInfo = new MapInfo(this.mapLines);
        this.gameInfo = new GameInfo(this.gameLines);
        this.playerManager = new PlayerManager(this.playerLines);
        this.killManager = new KillManager(this.killLines);

        //console.log(this.playerManager.players);

    }


    convertFileToLines(){

        const reg = /^(.+?)$/img;
        const typeReg = /^\d+\.\d+?\t(.+?)\t.+$/i;
        const nstatsReg = /^\d+\.\d+?\tnstats\t(.+?)\t.+$/i;
       // const killReg = /^\d+\.\d+?\tkill.+$/i;

        this.lines = this.data.match(reg);

        this.serverLines = [];
        this.mapLines = [];
        this.gameLines = [];
        this.playerLines = [];
        this.killLines = [];

        let typeResult = 0;
        let currentType = 0;

        const gameTypes = [
            "game",
            "game_start",
            "game_end",
            "teamscore"
        ];

        const playerTypes = [
            "player",
            "face",
            "voice",
            "netspeed",
            "stat_player"

        ];

        //nstats tsusgdusghdushgidshg

        for(let i = 0; i < this.lines.length; i++){

            typeResult = typeReg.exec(this.lines[i]);

            if(typeResult !== null){

                currentType = typeResult[1].toLowerCase();

                if(currentType == 'info'){

                    this.serverLines.push(this.lines[i]);

                }else if(currentType == 'map'){

                    this.mapLines.push(this.lines[i]);

                }else if(gameTypes.indexOf(currentType) !== -1){

                    this.gameLines.push(this.lines[i]);

                }else if(playerTypes.indexOf(currentType) !== -1 || currentType.startsWith('weap_')){

                    this.playerLines.push(this.lines[i]);

                }else if(currentType === 'nstats'){

                    typeResult = nstatsReg.exec(this.lines[i]);
                    
                    if(typeResult !== null){

                        currentType = typeResult[1].toLowerCase();

                        if(playerTypes.indexOf(currentType) !== -1){

                            this.playerLines.push(this.lines[i]);

                        }else if(currentType === 'kill_distance' || currentType == 'kill_location'){
                            this.killLines.push(this.lines[i]);
                        }
                    }

                }else if(currentType === 'kill' || currentType === 'teamkill'){

                    this.killLines.push(this.lines[i]);
                }
            }
        }


       // console.log(this.playerLines);


    }



}

module.exports = LogParser;