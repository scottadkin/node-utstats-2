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
const Match = require('../match');
const Maps = require('../maps');
const Gametypes = require('../gametypes');
const CTFManager = require('./ctfmanager');
const LMSManager = require('./lmsmanager');
const AssaultManager = require('./assaultmanager');
const DOMManager = require('./dommanager');
const SpawnManager = require('./spawnmanager');

class MatchManager{

    constructor(data, fileName){

        //console.table(data);
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
            this.spawnManager = new SpawnManager();
            this.playerManager = new PlayerManager(this.playerLines, this.spawnManager);
            this.serverInfo = new ServerInfo(this.serverLines, this.gameInfo.getMatchLength());

            this.gametype = new Gametypes(this.gameInfo.gamename);

            await this.gametype.updateStats(this.gameInfo.gamename, this.serverInfo.date, this.gameInfo.getMatchLength().length);
            
            this.gametype.currentMatchGametype = await this.gametype.getGametypeId(this.gameInfo.gamename, true);

            this.playerManager.setKills(this.killManager.kills);

            this.match = new Match();
            this.matches = new Matches();
            this.maps = new Maps();

            await this.serverInfo.updateServer();
            new Message(`Inserted server info into database.`, 'pass');

            const matchTimings = this.gameInfo.getMatchLength();
            await this.mapInfo.updateStats(this.serverInfo.date, matchTimings.length);
            this.spawnManager.setMapId(this.mapInfo.mapId);
            await this.spawnManager.updateMapStats();
            new Message(`Inserted map info into database.`, 'pass');

            await this.insertMatch();
            new Message(`Inserted match info into database.`,'pass');


            //console.log(this.gameInfo);

            await this.playerManager.setPlayerIds(this.gametype.currentMatchGametype);

            const bLMS = this.bLastManStanding();

            
            if(this.CTFManager !== undefined){

                if(this.CTFManager.bHasData()){
                    new Message(`Found ${this.CTFManager.data.length} Capture The Flag Data to parse`,'note');
                    // console.table(this.CTFManager.data);
                    this.CTFManager.parseData();
                    this.CTFManager.setPlayerStats(this.playerManager);
                    await this.CTFManager.updatePlayerTotals(this.playerManager.players);
                }
            }           
            

            if(this.assaultManager !== undefined){

                this.assaultManager.mapId = this.mapInfo.mapId;
                this.assaultManager.matchId = this.matchId;
                this.assaultManager.parseData();
                this.assaultManager.playerManager = this.playerManager;
                await this.assaultManager.updateMapObjectives();
                await this.assaultManager.insertCapturedMapObjectives(this.matchId);
                await this.assaultManager.updatePlayerCaptureTotals();
                await this.assaultManager.updateMapCaptureTotals();
                await this.assaultManager.setAttackingTeam();
            }

            if(this.domManager !== undefined){
                this.domManager.mapId =this.mapInfo.mapId;
                this.domManager.matchId = this.matchId;
                this.domManager.parseData();
                this.domManager.playerManager = this.playerManager;
                await this.domManager.updateTeamScores();
                await this.domManager.updateControlPointStats();
                await this.domManager.insertMatchControlPointStats();
                await this.domManager.updateMatchDomCaps();
                this.domManager.setPlayerDomCaps();
            }

            this.playerManager.mergeDuplicates(bLMS);

            if(bLMS){
                
                this.LMSManager = new LMSManager(this.playerManager, this.killManager, this.gameInfo.getMatchLength(), this.gameInfo.fraglimit);
                const LMSWinner = this.LMSManager.getWinner();
                const winner = this.playerManager.getPlayerById(LMSWinner.id);
      
                if(winner !== null){

                    winner.bWinner = true;
                    await this.match.setDMWinner(this.matchId, LMSWinner.name, LMSWinner.score);

                }else{
                    new Message(`Winner for LMS is null`, 'warning');
                }
            }

            await this.playerManager.updateFaces(this.serverInfo.date);
            await this.playerManager.setIpCountry();

            if(!bLMS){
                this.setMatchWinners();
            }



            await this.playerManager.updateFragPerformance(this.gametype.currentMatchGametype);
         
            await this.playerManager.updateWinStats(this.gametype.currentMatchGametype);

            new Message(`Finished import of log file ${this.fileName}.`, 'note');

        }catch(err){
            console.trace(err);
        }
    }


    async insertMatch(){

        try{

            //date, server, version, admin, region, motd, playtime, endType, start, end
            const serverId = await this.serverInfo.getServerId();


            const motd = this.serverInfo.getMotd();

            this.matchId = await this.matches.insertMatch(
                this.serverInfo.date, 
                serverId, 
                this.gametype.currentMatchGametype,
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
                '',
                0,
                this.gameInfo.teamScores[0],
                this.gameInfo.teamScores[1],
                this.gameInfo.teamScores[2],
                this.gameInfo.teamScores[3]
            );


        }catch(err){
            if(err) console.log(err);
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
            "longesttimebetweenkills",
            "first_blood",
            "spawn_loc",
            "spawn_point"
        ];

        const assaultTypes = [
            "assault_timelimit",
            "assault_gamename",
            "assault_objname",
            "assault_defender",
            "assault_attacker",
            "assault_obj",
        ];

        const domTypes = [
            "dom_point",
            "dom_playerscore_update",
            "dom_score_update",
            "controlpoint_capture"
        ];


        for(let i = 0; i < this.lines.length; i++){


            typeResult = typeReg.exec(this.lines[i]);

            if(typeResult !== null){

                currentType = typeResult[1].toLowerCase();

                //console.log(currentType);

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
                        }else if(currentType === 'dom_point'){

                            if(this.domManager === undefined){
                                this.domManager = new DOMManager();
                            }

                            this.domManager.data.push(this.lines[i]);
                        }
                    }

                }else if(currentType === 'kill' || currentType === 'teamkill' || currentType === 'suicide'){

                    this.killLines.push(this.lines[i]);

                }else if(assaultTypes.indexOf(currentType) !== -1){

                    if(this.assaultManager === undefined){
                        this.assaultManager = new AssaultManager();
                    }

                    this.assaultManager.data.push(this.lines[i]);

                    
                }else if(domTypes.indexOf(currentType) !== -1){

                    //console.log(currentType);

                    if(this.domManager === undefined){
                        this.domManager = new DOMManager();
                    }

                    this.domManager.data.push(this.lines[i]);

                }else{

                    if(currentType.toLowerCase().startsWith("flag_")){
                        //console.log(`WOFOWOFWOFOWOFW`);

                        if(this.CTFManager === undefined){
                            this.CTFManager = new CTFManager();
                        }

                        this.CTFManager.data.push(this.lines[i]);
                       // this.ctfData.push(this.lines[i]);
                    }
                }
            }
        }

    }


    setMatchWinners(){

        if(this.gameInfo.teamgame){

            new Message(`Match is a team game.`,'note');

            const winningTeams = this.gameInfo.getWinningTeam();

            let p = 0;

            for(let i = 0; i < this.playerManager.players.length; i++){

                p = this.playerManager.players[i];

                if(winningTeams.indexOf(p.getTeam()) !== -1){

                    if(winningTeams.length === 1){
                        p.bWinner = true;
                    }else{
                        p.bDrew = true;
                    }
                }
            }

        }else{

            new Message(`Match is not a team game,`,'note');

            this.playerManager.sortByScore();

            const winnerScore =  this.playerManager.players[0].stats.score;
            const winnerDeaths =  this.playerManager.players[0].stats.deaths;

            let p = 0;

            let totalWinningPlayers = 0;

            for(let i = 0; i < this.playerManager.players.length; i++){

                p = this.playerManager.players[i];

                if(p.stats.score === winnerScore && p.stats.deaths === winnerDeaths){
                    totalWinningPlayers++;
                }
            }

            if(totalWinningPlayers === 1){
                this.playerManager.players[0].bWinner = true;
            }else{

                for(let i = 0; i < totalWinningPlayers; i++){
                    this.playerManager.players[i].bDrew = true;
                }
            }

            this.setDmWinner(this.playerManager.players[0].name, this.playerManager.players[0].stats.score);
        }

        new Message(`Set player match winners.`,'pass');
    }


    async setDmWinner(name, score){

        await this.match.setDMWinner(this.matchId, name, score);
    }


    bLastManStanding(){

        const reg = /last man standing/i;

        return reg.test(this.gameInfo.gamename);

    }
}

module.exports = MatchManager;