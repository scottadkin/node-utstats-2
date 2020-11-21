const Promise = require('promise');
const config = require('../../config.json');
const Message = require('../message');
const Logs = require('../logs');
const ServerInfo = require('./serverInfo');
const MapInfo = require('./mapInfo');
const GameInfo = require('./gameinfo');
const PlayerManager = require('./playermanager');
const KillManager = require('./killmanager');
const Matches = require('../matches');
const Maps = require('../maps');
const Gametypes = require('../gametypes');

class MatchManger{

    constructor(data, fileName){

        this.data = data;
        this.fileName = fileName;

        new Message(`Starting import of log file ${fileName}`,'note');

        this.convertFileToLines();

        this.import();

    }

    async import(){

        try{

            if(config.bIgnoreDuplicates){

                if(await Logs.bExists(this.fileName)){
                    new Message(`${this.fileName} has already been imported and will not be re-imported, to change this change bIgnoreDuplicates to false in config.js`,'warning');
                    new Message(`Finished import of log file ${this.fileName}.`, 'note');
                    return;
                }
            }

            await Logs.insert(this.fileName);


            this.mapInfo = new MapInfo(this.mapLines);
            this.gameInfo = new GameInfo(this.gameLines);
            this.killManager = new KillManager(this.killLines);
            this.playerManager = new PlayerManager(this.playerLines);
            this.serverInfo = new ServerInfo(this.serverLines, this.gameInfo.getMatchLength());


            this.playerManager.setKills(this.killManager.kills);

            this.match = new Matches();
            this.maps = new Maps();

            await this.serverInfo.updateServer();
            new Message(`Inserted server info into database.`, 'pass');

            const matchTimings = this.gameInfo.getMatchLength();
            await this.mapInfo.updateStats(this.serverInfo.date, matchTimings.length);
            new Message(`Inserted map info into database.`, 'pass');

            await this.insertMatch();
            new Message(`Inserted match info into database.`,'pass');

            new Message(`Finished import of log file ${this.fileName}.`, 'note');

           // console.log(this.gameInfo);

           await this.playerManager.setPlayerIds();

           
           this.playerManager.mergeDuplicates();

           await this.playerManager.debugUpdateBasic();

        }catch(err){
            console.trace(err);
        }
    }


    async insertMatch(){

        try{

            //date, server, version, admin, region, motd, playtime, endType, start, end
            const serverId = await this.serverInfo.getServerId();

            const motd = this.serverInfo.getMotd();

            this.match.insertMatch(
                this.serverInfo.date, 
                serverId, 
                this.mapInfo.mapId,
                this.gameInfo.gameversion, 
                this.gameInfo.minnetversion, 
                this.serverInfo.server_adminname,
                this.serverInfo.server_adminemail,
                this.serverInfo.server_region,
                motd,
                this.gameInfo.length,
                this.gameInfo.endReason,
                this.gameInfo.start,
                this.gameInfo.end,
                this.gameInfo.insta, 
                this.gameInfo.teamgame,
                this.gameInfo.gamespeed,
                this.gameInfo.hardcore,
                this.gameInfo.tournamentmode,
                this.gameInfo.aircontrol,
                this.gameInfo.usetranslocator,
                this.gameInfo.friendlyfirescale,
                this.gameInfo.netmode,
                this.gameInfo.maxspectators,
                this.gameInfo.maxplayers,
                this.playerManager.uniqueNames.length,
                this.gameInfo.timelimit,
                this.gameInfo.targetScore,
                this.gameInfo.dmWinner,
                this.gameInfo.dmWinnerScore,
                this.gameInfo.teamScores[0],
                this.gameInfo.teamScores[1],
                this.gameInfo.teamScores[2],
                this.gameInfo.teamScores[3]
            );

        }catch(err){
            console.trace(err);
        }
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
    }



}

module.exports = MatchManger;