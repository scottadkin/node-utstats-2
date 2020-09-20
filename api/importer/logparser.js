import Promise from 'promise';
import ServerInfo from './serverInfo.js';
import MapInfo from './mapInfo.js';
import GameInfo from './gameinfo.js';
import PlayerManager from './playermanager.js';
import KillManager from './killmanager.js';

class LogParser{

    constructor(data){

        //console.log(`new log parser`);

        this.data = data;

        this.convertFileToLines();

        
        this.mapInfo = new MapInfo(this.mapLines);
        this.gameInfo = new GameInfo(this.gameLines);
        this.killManager = new KillManager(this.killLines);
        this.playerManager = new PlayerManager(this.playerLines);
        this.serverInfo = new ServerInfo(this.serverLines, this.gameInfo.getMatchLength());


        this.playerManager.setKills(this.killManager.kills);

        //console.log(this.playerManager.players);

    }


    convertFileToLines(){

        const reg = /^(.+?)$/img;
        const typeReg = /^\d+\.\d+?\t(.+?)(\t.+|)$/i;
        const nstatsReg = /^\d+\.\d+?\tnstats\t(.+?)\t.+$/i;

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
            "stat_player",
            "bestspawnkillspree",
            "spawnkills",
            "bestspree",
            "shortesttimebetweenkills",
            "longesttimebetweenkills"
            
        ];


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

                        //console.log(currentType);
                        if(playerTypes.indexOf(currentType) !== -1){

                            this.playerLines.push(this.lines[i]);

                        }else if(currentType === 'kill_distance' || currentType == 'kill_location'){
                            this.killLines.push(this.lines[i]);
                        }
                    }

                }else if(currentType === 'kill' || currentType === 'teamkill' || currentType === 'suicide'){

                    this.killLines.push(this.lines[i]);
                }
            }
        }


       // console.log(this.playerLines);


    }



}

export default LogParser;