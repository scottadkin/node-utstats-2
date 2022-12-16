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
const WeaponsManager = require('./weaponsmanager');
const ItemsManager = require('./itemsmanager');
const CountriesManager = require('./countriesmanager');
const Rankings = require('../rankings');
const MonsterHuntManager = require('./monsterhuntmanager');
const CombogibManager = require('./combogibmanager');
const geoip = require('geoip-lite');

class MatchManager{

    constructor(data, fileName, bIgnoreBots, minPlayers, minPlaytime){

        this.data = data;
        this.fileName = fileName;
        this.bIgnoreBots = bIgnoreBots;

        this.minPlayers = minPlayers;
        this.minPlaytime = minPlaytime;

        this.bLinesNull = false;

        this.combogibLines = [];

        new Message(`Starting import of log file ${fileName}`,'note');

        this.convertFileToLines();

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


            this.mapInfo = new MapInfo(this.mapLines);
            this.gameInfo = new GameInfo(this.gameLines);

            if(this.gameInfo.matchLength < this.minPlaytime){
                new Message(`Match length is less then the minimum specified, skipping.`, "note");
                return null;
            }

            this.spawnManager = new SpawnManager();
            this.playerManager = new PlayerManager(this.playerLines, this.spawnManager, this.bIgnoreBots, this.gameInfo.getMatchLength(), geoip);

            const playersWithPlaytime = this.playerManager.getTotalPlayersWithPlaytime();

            if(playersWithPlaytime < this.minPlayers){
                new Message(`Total players is less then the minimum specified, skipping.`, "note");
                return null;
            }

            const logId = await Logs.insert(this.fileName);

            new Message(`Log file id is ${logId}`,"note");

            this.killManager = new KillManager(this.killLines, this.playerManager, this.bIgnoreBots, this.gameInfo.getMatchLength());

            if(this.mapInfo.mapPrefix === "mh"){
                this.gameInfo.totalTeams = 0;
            }
 
            
            this.serverInfo = new ServerInfo(this.serverLines, this.gameInfo.getMatchLength());

            this.gametype = new Gametypes(this.gameInfo.gamename);

            await this.gametype.updateStats(this.gameInfo.gamename, this.serverInfo.date, this.gameInfo.getMatchLength().length);      
            this.gametype.currentMatchGametype = await this.gametype.getGametypeId(this.gameInfo.gamename, true);

            if(this.gametype.currentMatchGametype === undefined){
                new Message(`Incomplete log skipping...`,'error');
                return null;
            }

            this.playerManager.setKills(this.killManager.kills);
            this.playerManager.matchEnded(this.gameInfo.end);
            this.playerManager.setHeadshots(this.killManager.headshots);

            this.match = new Match();
            this.matches = new Matches();
            this.maps = new Maps();

            await this.serverInfo.updateServer(geoip);
            new Message(`Inserted server info into database.`, 'pass');

            const matchTimings = this.gameInfo.getMatchLength();
            await this.mapInfo.updateStats(this.serverInfo.date, matchTimings.length);


            this.spawnManager.setMapId(this.mapInfo.mapId);
            await this.spawnManager.updateMapStats();
            new Message(`Inserted map info into database.`, 'pass');

            this.serverId = await this.serverInfo.getServerId();

            await this.insertMatch();
            new Message(`Inserted match info into database.`,'pass');
            
            await this.serverInfo.setLastIds(this.serverId, this.matchId, this.mapInfo.mapId);

            await this.playerManager.setPlayerIds(this.gametype.currentMatchGametype);

            this.playerManager.fixPlaytime(this.gameInfo.hardcore, this.gameInfo.matchLength);

            const bLMS = this.bLastManStanding();

            //this.playerManager.mergeDuplicates(bLMS);
            
            if(this.CTFManager !== undefined){

                this.CTFManager.totalTeams = this.gameInfo.totalTeams;
                this.CTFManager.playerManager = this.playerManager;
                this.CTFManager.bIgnoreBots = this.bIgnoreBots;

                if(this.CTFManager.bHasData()){
                    new Message(`Found ${this.CTFManager.data.length} Capture The Flag Data to parse`,'note');
                    // console.table(this.CTFManager.data);
                    
                    this.CTFManager.parseData(this.killManager, matchTimings.start);
                    this.CTFManager.createCapData();
                    this.CTFManager.setPlayerStats();
                    await this.CTFManager.insertCaps(this.matchId, this.mapInfo.mapId, this.serverInfo.date);
                    await this.CTFManager.insertFlagLocations(this.mapInfo.mapId);
                    await this.CTFManager.addCTF4Data();
                    await this.CTFManager.updateMapCapRecords(this.mapInfo.mapId, this.matchId, this.serverInfo.date);
                   

                    new Message(`Capture The Flag stats update complete.`,'pass');
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
                await this.assaultManager.setMatchCaps();

                new Message(`Assault stats update complete.`,'pass');
            }

            if(this.domManager !== undefined){

                this.domManager.mapId =this.mapInfo.mapId;
                this.domManager.matchId = this.matchId;
                this.domManager.playerManager = this.playerManager;
                this.domManager.parseData();
                await this.domManager.updateControlPointStats();
                await this.domManager.insertMatchControlPointStats();
                await this.domManager.updateMatchDomCaps();
                this.domManager.setPlayerDomCaps();
                await this.domManager.insertMatchControlPointCaptures(this.matchId, this.mapInfo.mapId);

                new Message(`Domination stats update complete.`,'pass');
            }

            

            this.playerManager.mergeDuplicates(bLMS);

            if(bLMS){
                
                this.LMSManager = new LMSManager(this.playerManager, this.killManager, this.gameInfo.getMatchLength(), this.gameInfo.fraglimit);
                const LMSWinner = this.LMSManager.getWinner();
                const winner = this.playerManager.getPlayerById(LMSWinner.id);
      
                if(winner !== null){

                    winner.bWinner = true;
                    await this.match.setDMWinner(this.matchId, LMSWinner.name, LMSWinner.score);

                    new Message(`Last man standing stats update complete.`,'pass');

                }else{
                    new Message(`Winner for LMS is null`, 'warning');
                }
            }

            await this.playerManager.updateFaces(this.serverInfo.date);
            await this.playerManager.updateVoices(this.serverInfo.date);
            await this.playerManager.setIpCountry();
            

            if(!bLMS){
                this.setMatchWinners();
            }

            await this.playerManager.updateFragPerformance(this.gametype.currentMatchGametype, this.serverInfo.date);

            new Message(`Updated player frag performance.`,'pass');
            await this.playerManager.updateWinStats(this.gametype.currentMatchGametype);
            new Message(`Updated player winstats performance.`,'pass');
            this.playerManager.pingManager.parsePings(this.playerManager);
            await this.playerManager.pingManager.insertPingData(this.matchId);


            await this.playerManager.insertMatchData(this.gametype.currentMatchGametype, this.matchId, this.mapInfo.mapId, this.serverInfo.date);
            new Message(`Updated player match data.`,'pass');

            if(this.domManager !== undefined){
                this.domManager.setLifeCaps(this.killManager);
                await this.domManager.updatePlayersMatchStats();
                await this.domManager.insertMatchPlayerScores(this.matchId);
                await this.domManager.updatePlayerLifeCaps(this.matchId);
            }

            if(this.assaultManager !== undefined){
                await this.assaultManager.updatePlayersMatchStats();
            }

            if(this.CTFManager !== undefined){


                this.CTFManager.setSelfCovers(this.killManager);
                await this.CTFManager.updatePlayersMatchStats();
                await this.CTFManager.updatePlayerTotals();
                await this.CTFManager.insertEvents(this.matchId);
                
                
            }

            if(this.monsterHuntManager !== undefined){

                this.monsterHuntManager.parseData(this.playerManager, this.killManager);

                await this.monsterHuntManager.updatePlayerMatchData(this.matchId, this.playerManager.players);
                await this.monsterHuntManager.updatePlayerTotals(this.gametype.currentMatchGametype, this.playerManager.players);
                await this.monsterHuntManager.updateMatchMonsterTotals(this.matchId);
                await this.monsterHuntManager.insertPlayerMatchTotals(this.matchId);
                await this.monsterHuntManager.insertKills(this.matchId);
                await this.monsterHuntManager.setMatchMonsterKills(this.matchId);
            }


            if(this.weaponsManager !== undefined){
                
                this.weaponsManager.parseData();
                this.weaponsManager.addKillNames(this.killManager.killNames);
                await this.weaponsManager.update(this.matchId, this.gametype.currentMatchGametype, this.playerManager);
                new Message(`Updated player weapon stats.`,'pass');

            }else{
                this.weaponsManager = new WeaponsManager();
            }

            this.itemsManager = new ItemsManager(this.itemLines);
            this.itemsManager.playerManager = this.playerManager;
            await this.itemsManager.updateTotals(this.serverInfo.date);

            this.itemsManager.setPlayerPickupTimes(this.gameInfo.end);
            this.itemsManager.setPlayerPickups();
            

            new Message(`Updating player match pickups.`,"pass");
            await this.itemsManager.setPlayerMatchPickups(this.matchId);

            new Message(`Updated item totals.`,'pass');
            await this.itemsManager.insertMatchData(this.matchId, this.serverInfo.date);
            new Message(`Updated item match data.`,'pass');

            await this.playerManager.insertConnectionData(this.matchId);
            new Message(`Updated played connection data.`,'pass');

            this.playerManager.teamsManager.parseTeamChanges(this.playerManager);
            await this.playerManager.teamsManager.insertTeamChanges(this.matchId);
            new Message(`Updated player team changes`,'pass');


            this.countiresManager = new CountriesManager();
            await this.countiresManager.insertBulk(this.playerManager.players, this.serverInfo.date);
            new Message(`Updated Country stats`,'pass');

            await this.killManager.insertKills(this.matchId, this.weaponsManager);
            new Message(`Inserted match kill data`,'pass');

            await this.killManager.insertHeadshots(this.matchId);
            new Message(`Updated player headshots`,'pass');

            await this.playerManager.insertScoreHistory(this.matchId);
            new Message(`Inserted player score history`,'pass');

            new Message(`Updating player winrates.`,'note');
            await this.playerManager.updateWinRates(this.matchId, this.serverInfo.date, this.gametype.currentMatchGametype);

    
            new Message(`Update player spree history`,'note');

            await this.playerManager.insertSprees(this.matchId);


            new Message(`Updating Player Map History.`,'note');
            await this.maps.updateAllPlayersHistory(this.playerManager.players, this.mapInfo.mapId, this.matchId, this.serverInfo.date);
            new Message(`Updated player map history.`,'pass');
            //this.maps.updatePlayerHistory(this.playerManager.players[0].masterId, this.mapInfo.matchId);


            this.rankingsManager = new Rankings();

            await this.rankingsManager.init();

            //await this.rankingsManager.setRankingSettings();

            //new Message("Getting player totals for rankings calculation.","note");
            //const playerRankingTotals = await this.playerManager.getPlayerTotals(this.gametype.currentMatchGametype);

            //need to get player current totals then add them to the scores
            new Message("Updating player rankings.","note");
            //await this.rankingsManager.update(this.matchId, playerRankingTotals, this.gametype.currentMatchGametype, this.bIgnoreBots);
            await this.playerManager.updateRankings(this.rankingsManager, this.gametype.currentMatchGametype, this.matchId);

            //if(this.combogibLines.length !== 0){

                this.combogibManager = new CombogibManager(
                    this.playerManager, this.killManager, 
                    this.combogibLines, this.gametype.currentMatchGametype, this.matchId, 
                    this.mapInfo.mapId, this.bIgnoreBots,
                    this.gameInfo.matchLength
                );
           
                new Message("Parsing combogib data.","note");
                
                this.combogibManager.createKillTypeData();
                this.combogibManager.createPlayerEvents();

                await this.combogibManager.insertPlayerMatchData();
                await this.combogibManager.updateMapTotals();
                
            //}
            

            await Logs.setMatchId(logId, this.matchId);

            new Message(`Finished import of log file ${this.fileName}.`, 'note');

            return {
                "updatedPlayers": this.playerManager.getAllNonDuplicateMasterIds(), 
                "updatedGametype": this.gametype.currentMatchGametype
            }

        }catch(err){

            console.trace(err);
        }
    }


    async insertMatch(){

        try{

            //date, server, version, admin, region, motd, playtime, endType, start, end


            const motd = this.serverInfo.getMotd();

            this.matchId = await this.matches.insertMatch(
                this.serverInfo.date, 
                this.serverId, 
                this.gametype.currentMatchGametype,
                this.mapInfo.mapId,
                this.gameInfo.gameversion, 
                this.gameInfo.minnetversion, 
                this.serverInfo.server_adminname,
                this.serverInfo.server_adminemail,
                this.serverInfo.server_region,
                motd,
                this.gameInfo.mutators,
                this.gameInfo.matchLength,
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
                this.gameInfo.totalTeams,
                this.playerManager.getTotalPlayers(),
                this.gameInfo.timelimit,
                this.gameInfo.targetScore,
                '',
                0,
                this.gameInfo.teamScores[0],
                this.gameInfo.teamScores[1],
                this.gameInfo.teamScores[2],
                this.gameInfo.teamScores[3],
                (this.mapInfo.mapPrefix === "mh") ? true : false
            );


        }catch(err){
            if(err) console.log(err);
        }
    }

    convertFileToLines(){

        const reg = /^(.+?)$/img;
        const typeReg = /^\d+\.\d+?\t(.+?)(\t.+|)$/i;
        const nstatsReg = /^\d+\.\d+?\tnstats\t(.+?)\t.+$/i;
        const monsterReg = /monsterkill\t(\d+?)\t(.+)$/i
        const monsterKilledPlayerReg = /mk\t(.+?)\t(.+)/;
        this.lines = this.data.match(reg);


        if(this.lines === null){
            this.bLinesNull = true;
            new Message("matchmanager.ConvertFileToLines() this.lines is null","error");
            return;
        }

        this.serverLines = [];
        this.mapLines = [];
        this.gameLines = [];
        this.playerLines = [];
        this.killLines = [];
        this.itemLines = [];
        this.headshotLines = [];

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
            "spawn_point",
            "p_s"
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


                if(gameTypes.indexOf(currentType) !== -1){

                    this.gameLines.push(this.lines[i]);

                }


                if(currentType == 'info'){

                    this.serverLines.push(this.lines[i]);
                }
                
                if(currentType == 'map'){

                    this.mapLines.push(this.lines[i]);

                }
                
                if(playerTypes.indexOf(currentType) !== -1 || currentType.startsWith('weap_')){

                    this.playerLines.push(this.lines[i]);

                    if(currentType.startsWith('weap_')){

                        if(this.weaponsManager === undefined) this.weaponsManager = new WeaponsManager();

                        this.weaponsManager.data.push(this.lines[i]);
                    }

                }
                
                if(currentType === 'nstats'){

                    typeResult = nstatsReg.exec(this.lines[i]);

                    if(typeResult !== null){

                        currentType = typeResult[1].toLowerCase();

                        if(playerTypes.indexOf(currentType) !== -1){

                            this.playerLines.push(this.lines[i]);

                        }else if(currentType === 'kill_distance' || currentType == 'kill_location'){

                            this.killLines.push(this.lines[i]);

                        }else if(currentType === 'dom_point'){

                            if(this.domManager === undefined){
                                this.domManager = new DOMManager();
                            }

                            this.domManager.data.push(this.lines[i]);

                        }else if(currentType === 'flag_location' || currentType === "flag_kill"){

                            if(this.CTFManager === undefined){
                                this.CTFManager = new CTFManager();
                                this.CTFManager.bHaveNStatsData = true;
                            }
                            this.CTFManager.flagLines.push(this.lines[i]);

                        }else{

                            if(monsterReg.test(this.lines[i]) || monsterKilledPlayerReg.test(this.lines[i])){

                                if(this.monsterHuntManager === undefined){

                                    this.monsterHuntManager = new MonsterHuntManager();

                                }

                                this.monsterHuntManager.lines.push(this.lines[i]);
                            }      
                        }
                    }

                }
                
                if(currentType === 'kill' || currentType === 'teamkill' || currentType === 'suicide' || currentType === 'headshot'){
            
                    this.killLines.push(this.lines[i]);

                }
                
                if(assaultTypes.indexOf(currentType) !== -1){

                    if(this.assaultManager === undefined){
                        this.assaultManager = new AssaultManager();
                    }

                    this.assaultManager.data.push(this.lines[i]);

                    
                }
                
                if(domTypes.indexOf(currentType) !== -1){

                    //console.log(currentType);

                    if(this.domManager === undefined){
                        this.domManager = new DOMManager();
                    }

                    this.domManager.data.push(this.lines[i]);

                }
                
                if(currentType === 'item_get' || currentType === "item_activate" || currentType === "item_deactivate"){

                    this.itemLines.push(this.lines[i]);

                }
                
                if(currentType === "combo_kill" || currentType === "combo_insane"){

                    this.combogibLines.push(this.lines[i]);
                    
                    //this.combogibManager.addComboEvent(this.lines[i]);
                    
                }

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


    setMatchWinners(){

        
        if(this.gameInfo.endReason.toLowerCase() === "hunt successfull!"){

            let p = 0;

            for(let i = 0; i < this.playerManager.players.length; i++){

                p = this.playerManager.players[i];

                if(p.bPlayedInMatch && !p.bSpectator){
                    p.bWinner = true;
                }
            }

            return;
        }

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

            
            if(this.playerManager.players.length > 0){
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