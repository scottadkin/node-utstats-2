import {simpleQuery} from "../database.js";
import PlayerInfo from "./playerinfo.js";
import Message from "../message.js";
import Pl from "../player.js";
const Player = new Pl();
import Faces from "../faces.js";
import Voices from "../voices.js";
import ConnectionsManager from "./connectionsmanager.js";
import PingManager from "./pingmanager.js";
import TeamsManager from "./teamsmanager.js";
import SpreeManager  from "./spreemanager.js";
import {scalePlaytime} from "../functions.js";
import { updatePlayerWinrates } from "../winrate.js";

export default class PlayerManager{

    constructor(data, spawnManager, bIgnoreBots, matchTimings, geoip, bUsePlayerACEHWID, bHardcore){

        this.data = data;

        this.bIgnoreBots = bIgnoreBots;
        this.matchTimings = matchTimings;

        this.geoip = geoip;
        this.bUsePlayerACEHWID = bUsePlayerACEHWID;

        //to scale multi kill times
        this.bHardcore = bHardcore;


        this.players = [];

        this.HWIDS = {};

        this.HWIDSToNames = {};

        this.namesToIds = {};


        this.faces = new Faces();
        this.voices = new Voices();
        this.spawnManager = spawnManager;
        this.connectionsManager = new ConnectionsManager(this);
        this.teamsManager = new TeamsManager();

        this.scoreHistory = [];

        this.teamChanges = [];

        this.pingManager = new PingManager();

        this.spreeManager = new SpreeManager(matchTimings.start);


        //issue with player reconnects before old connection is dropped
        this.delayedDisconnects =[];

    }

    init(){

        this.setNStatsValues();
        this.setPlayerSpawns();
        this.parsePlayerStrings();
        this.setWeaponStats();

        
    }

    parseHWIDS(){


        //if(!this.bUsePlayerACEHWID) return;

        const reg = /^\d+?\.\d+?\tnstats\thwid\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            const result = reg.exec(d);

            if(result === null) continue;

            const playerId = parseInt(result[1]);
            const HWID = result[2];

            this.HWIDS[playerId] = HWID;
        }
    }


    getNameFromIdList(id){

        id = parseInt(id);

        let latestName = null;

        for(let [key, value] of Object.entries(this.namesToIds)){
            key = parseInt(key);

            if(key === id) return value;
        }

        return latestName;
    }

    createPreliminary(timestamp, id, name, bForceAsPlayer){

        id = parseInt(id);

        this.preliminaryPlayers.push({
            "ids": [id],
            "name": name,
            "bSpectator": bForceAsPlayer === false,
            "hwid": "",
            "connectEvents": [{"type": "rename", "timestamp": timestamp}],
            "teamPlaytimes": {
                "0": 0,
                "1": 0,
                "2": 0,
                "3": 0,
                "255": 0,
            }
        });
        
    }

    /**
    *  Update player id list if already exists
    */
    renamePreliminary(timestamp, subString){

       // new Message(subString, "error");
        const reg = /^(.+?)\t(\d+)$/i;

        const result = reg.exec(subString);

        if(result === null){
            new Message(`renamePreliminary reg expression failed.`, "error");
            return;
        }

        //let name = result[1];

        let id = parseInt(result[2]);

        let name = this.getNameFromIdList(id);

        if(name === null){
            throw new Error(`PlayerManager.connectPreliminary() name is null!`);
        }

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            let p = this.preliminaryPlayers[i];

            if(p.name.toLowerCase() === name.toLowerCase()){
                p.ids.push(id);
                p.connectEvents.push({"type": "rename", "timestamp": timestamp, "playerId": id});
                return;
            }
        }

        this.createPreliminary(timestamp, id, name, false);
    
    }

    connectPreliminary(timestamp, subString){

        const reg = /^(.+?)\t(\d+)\t.+$/i;

        const result = reg.exec(subString);

        if(result === null){
            new Message("ConnectPreliminary reg expression failed", "error");
            return;
        }

        const originalName = result[1];
        let id = parseInt(result[2]);
        let name = this.getNameFromIdList(id);

        if(name === null){
            throw new Error(`PlayerManager.connectPreliminary() name is null!`);
        }

        
        //work around connect events not having the players correct name if they are named player

        if(name.toLowerCase() === "player"){
            //append player id like connect should do
            name = `${name}${id}`;
        }

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];
            //spectators don't get connect events only rename events
            if(p.ids.indexOf(id) !== -1){
                p.bSpectator = false;
                p.connectEvents.push({"type": "connect", "timestamp": timestamp, "playerId": id});
                return;
            }
        }
    }

    disconnectPreliminary(timestamp, subString){

        const playerId = parseInt(subString);

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            if(p.ids.indexOf(playerId) !== -1){

                p.connectEvents.push({"type": "disconnect", "timestamp": timestamp, "playerId": playerId});
                return;
            }
        }
    }

    teamChangePreliminary(timestamp, subString){


        const reg = /^(\d+?)\t(\d+)$/i;

        const result = reg.exec(subString);

        if(result === null){
            new Message(`teamChangePreliminary reg expression failed`,"error");
            return;
        }

        const playerId = parseInt(result[1]);
        const teamId = parseInt(result[2]);

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            if(p.ids.indexOf(playerId) !== -1){
                p.connectEvents.push({"type": "teamChange", "newTeam": teamId, "timestamp": timestamp, "playerId": playerId});
                return;
            }
        }
    }

    setPreliminaryPlaytimes(){

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            //only applies to an event where a user changed team
            let previousTimestamp = 0;
            let previousTeam = 255;
            let bConnectedToServer = false;

            for(let x = 0; x < p.connectEvents.length; x++){

                const e = p.connectEvents[x];

                const timestamp = this.ignoreWarmpup(e.timestamp);

                //user joins as spectator
                if(e.type === "rename" && !bConnectedToServer){
                    //previousTeam = 255;    
                    bConnectedToServer = true;  
                    previousTimestamp = timestamp;   
                }

                //user joins as player
                if(e.type === "connect"){
                    bConnectedToServer = true;
                    previousTimestamp = timestamp;
                }

                if(e.type === "disconnect"){
                    bConnectedToServer = false;
                    //calc time on team or as spectator here

                    const diff = timestamp - previousTimestamp;

                    p.teamPlaytimes[previousTeam] += diff;
                   // console.log(`${p.name} was on the ${previousTeam} for ${diff}, Disconnect!`);
                    previousTimestamp = timestamp;
                }   

                if(e.type === "teamChange"){
                    bConnectedToServer = true;
                    const diff = timestamp - previousTimestamp;

                    p.teamPlaytimes[previousTeam] += diff;

                    previousTeam = e.newTeam;
                    previousTimestamp = timestamp;
                }
            }

            //if player didn't have disconnect event they stayed to the end
            if(bConnectedToServer){

                const diff = this.ignoreWarmpup(this.matchTimings.end) - previousTimestamp;
                p.teamPlaytimes[previousTeam] += diff;
               // console.log(p.name,"played to the end", diff, previousTeam);
               // console.log(p.teamPlaytimes);
            }
        }

        //console.log(this.preliminaryPlayers);
     
        //process.exit();
    }

    //example issue of a player joing the server before their last connection to the server has been dropped
    // ID 6 & 7 are the same player, the discconect event for their previous connection happens after their rejoin
    // this confusses the importer making it think player id 7 disconnected and not 6
    /*
     99.48	player	Teamchange	7	1
    99.48	player	Connect	Player	7	False
    99.48	player	TeamName	7	Blue
    99.48	player	Team	7	1
    99.48	player	TeamID	7	1
    99.48	player	Ping	7	0
    99.48	player	IsABot	7	False
    99.48	player	Skill	7	1.000000
    99.48	player	Rename	Player7	7
    99.49	player	IP	7	0.0.0.0
    100.59	player	Disconnect	6
    */
    /**
     * Sometimes a log will trigger the rename(on rejoin) event on a new id before a disconnect on their previous id
     * we need to check if a player has a disconnect event on an id less than
     * their most recent connection 
     */
    fixReconnectBeforeDisconnect(){

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const player = this.preliminaryPlayers[i];

            //only happens to players with multiple connections to servers
            if(player.ids.length <= 1) continue;
            //new Message(`${player.name} ${player.ids.length}`,"error");

            let highestUsedId = -1;
            //timestamp for when the highest id was first used
            let highestUsedIdTimestamp = -1;

            let latestTeamId = -1;

            for(let x = 0; x < player.connectEvents.length; x++){

                const e = player.connectEvents[x];
                
                if(e.playerId === undefined) continue;
               // console.log(e);

                if(e.type === "teamChange"){
                    latestTeamId = e.newTeam;
                }

                if(e.playerId < highestUsedId){

                    //const diff = e.timestamp - highestUsedIdTimestamp;

                    if(e.type === "disconnect"){

                        this.delayedDisconnects.push({
                            "playerId": e.playerId,
                            "timestamp": e.timestamp,
                            "highestIdConnectTimestamp": highestUsedIdTimestamp,
                            "highestId": highestUsedId,
                            "latestTeamId": latestTeamId
                        });
                        ////
                        e.timestamp = highestUsedIdTimestamp;

                    }
                }


               // if(e.type === "teamchange" && e.playerId === highestUsedId){
                  //      new Message(`sdfgfj biopfsdjgiopdsjhopsdf jhopjdfgophjdfponjdfopjnopdfj`,"error");
                  //      latestTeamId = e.newTeam;
                  //  }
                
                if(e.playerId > highestUsedId){
                    highestUsedId = e.playerId;
                    highestUsedIdTimestamp = e.timestamp;
                }
            }

            
            //resort
            player.connectEvents.sort((a, b) =>{
                a = a.timestamp;
                b = b.timestamp;

                if(a < b) return -1;
                if(a > b) return 1;
                return 0;
            });

           // process.exit();
        }
    }

    createPreliminaryPlayers(){

        this.preliminaryPlayers = [];

        const reg = /^(\d+\.\d+)\tplayer\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];
            const result = reg.exec(d);      
            
            if(result === null) continue;

            const type = result[2].toLowerCase();
            const timestamp = parseFloat(result[1]);
            const subString = result[3];

            if(type === "connect"){


                //don't create new players on connect due to connect event not having correct player name if player is named player
                //only players have this event
                this.connectPreliminary(timestamp, subString);

            }else if(type === "disconnect"){
                this.disconnectPreliminary(timestamp, subString);
            }else if(type === "rename"){
                this.renamePreliminary(timestamp, subString);
            }else if(type === "teamchange"){
                this.teamChangePreliminary(timestamp, subString);
            }
        }

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];
         
            const lastUsedId = p.ids[p.ids.length - 1];

            p.connectEvents.sort((a, b) =>{
                a = a.timestamp;
                b = b.timestamp;

                if(a < b) return -1;
                if(a > b) return 1;
                return 0;
            });

            p.hwid = this.HWIDS[lastUsedId] ?? "";
           // console.log(p.connectEvents);
        }

       /* console.table(this.preliminaryPlayers);

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];
        }*/

        this.fixReconnectBeforeDisconnect();

        //process.exit();
       // process.exit();
        this.setPreliminaryPlaytimes();
    }


    setNamesToIds(){

        const cReg = /^\d+?\.\d+?\tplayer\tconnect\t(.+?)\t(\d+)\t.+$/i;
        const rReg = /^\d+?\.\d+?\tplayer\trename\t(.+?)\t(\d+)$/i;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            if(cReg.test(d)){

                const result = cReg.exec(d);
                this.namesToIds[parseInt(result[2])] = result[1];
                continue;
            }

            if(rReg.test(d)){

                const result = rReg.exec(d);
                this.namesToIds[parseInt(result[2])] = result[1];
            }
        }
    }

    async createPlayers(gametypeId, mapId){

        this.parseHWIDS();

        //work around connect name issue
        this.setNamesToIds();

        //process.exit();

        this.createPreliminaryPlayers();

        //console.log(this.delayedDisconnects);

        //now fix the player's team being set to -1, either delete the team change from player
        //or set it to the teamId the highestUsedId used before the delayed disconnect

       // console.log(this.preliminaryPlayers);

        //process.exit();

        //process.exit();

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            new Message(`Player.getMasterIds(${p.name}, ${gametypeId}, ${mapId})`,"note");

            if(p.hwid !== ""){

                const nameHWIDOverride = await Player.getHWIDNameOverride(p.hwid);

                if(nameHWIDOverride !== null){
                    p.name = nameHWIDOverride;
                    //this.idsToNames[p.id] = p.name.toLowerCase();
                }
            }

            const masterIds = await Player.getMasterIds(p.name, gametypeId, mapId);
            
            if(p.hwid !== ""){
                await Player.setLatestHWIDInfo(masterIds.masterId, p.hwid);
            }

            //this.masterIdsToNames[masterIds.masterId] = p.name.toLowerCase();

            const player = new PlayerInfo(
                p.ids, 
                p.name, 
                masterIds.masterId, 
                masterIds.gametypeId, 
                masterIds.mapId, 
                masterIds.mapGametypeId, 
                p.hwid, 
                p.bSpectator,
            );

            player.setConnectionEvents(p.connectEvents);
            //console.log(p.teamPlaytimes);
            player.setTeamPlaytimes(p.teamPlaytimes);

            this.players.push(player);
        }



        /*for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];
            console.log(p.name, p.ids, p.masterId);
        }*/
    }


    getPlayerById(id){
        
        id = parseInt(id);

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            if(p.ids.indexOf(id) !== -1){
                return p;
            }
        }

        return null;

    }

    getPlayerByMasterId(id){

        id = parseInt(id);

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            if(p.masterId === id) return p;
        }

        return null;
    
    }

    getPlayerByName(name){

        name = name.toLowerCase();

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            if(p.name.toLowerCase() === name){
                return p;
            }
        }

        return null;
    }

    getTotalPlayers(){

        let found = 0;

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            const playtime = p.getTotalPlaytime(this.totalTeams);

            if(playtime > 0){

                if(p.bBot && this.bIgnoreBots) continue;
                found++;
            }
        }

        return found;
    }

    debugDisplayPlayerStats(){

        this.players.forEach((value, key, map) =>{

            console.log(value);
        });
    }

    parsePlayerStrings(){

        let result = 0;
        let type = 0;
        let player = 0;

        const reg = /^(\d+\.\d+)\tplayer\t(.+?)\t(.+)$/i;
        const statReg = /^\d+\.\d+\tstat_player\t(.+?)\t(.+?)\t(.+)$/i;
        const firstBloodReg = /^\d+\.\d+\tfirst_blood\t(\d+)$/;

        const faceReg = /^(\d+)\t(.+)$/i;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            if(reg.test(d)){

                result = reg.exec(d);
                type = result[2].toLowerCase();

                /*if(type === 'team'){
                    //this.setTeam(result[3], result[1]);
                }else*/ if(type == 'isabot'){
                    this.setBotStatus(result[3]);
                }else if(type == 'ip'){
                    this.setIp(result[3]);
                }else if(type === 'connect' || type === "rename"){
                    continue;
                }else if(type === 'disconnect'){
                    this.setTeam(result[3], result[1], true);
                    continue;
                }else if(type === 'teamchange'){
                    this.setTeam(result[3], result[1], false);
                    this.teamsManager.lines.push(d);
                }else if(type === 'ping'){
                    this.pingManager.lines.push(d);
                }else if(type === "face"){

                    const faceResult = faceReg.exec(result[3]);

                    if(faceResult !== null){

                        const player = this.getPlayerById(faceResult[1]);

                        if(player !== null){

                            player.setFace(faceResult[2].toLowerCase());
                        }

                    }else{
                        new Message(`PlayerManager.parsePlayerStrings() faceResult is null.`,"warning");
                    }
                    

                    //const player = this.getPlayerById(parseInt(result[3]));
                }

            }else if(statReg.test(d)){

                result = statReg.exec(d);
                type = result[1].toLowerCase();

                player = this.getPlayerById(result[2]);

                if(player !== null){

                    player.setStatsValue(result[1], result[3]);

                }else{
                    new Message(`There is no player with the id ${result[2]}(parsePlayerStrings).`,'warning');
                }

            }else if(firstBloodReg.test(d)){

                result = firstBloodReg.exec(d);
                player = this.getPlayerById(result[1]);

                if(player !== null){
                    player.stats.firstBlood = 1;
                }
            }
        }

        /*for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            console.log(p.name, p.ids, p.teams);
        }*/
    }

    setNStatsValues(){

        const reg = /^(\d+\.\d+)\tnstats\t(.+?)\t(.+)$/i;
        const secondReg = /^(.+?)\t(.+)$/i;

        const legacySpawnReg = /,/;
        const spawnLocationReg = /^(\d+?\t.+?,.+?,.+?)\t(\d+)$/;

        let subResult = 0;
        let player = 0;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            let result = reg.exec(d);
            
            if(result !== null){

                const timestamp = parseFloat(result[1]);
                const type = result[2].toLowerCase();
                

                if(type === 'face' || type === 'voice' || type === 'netspeed' || type === "hwid"){
                    this.setPlayerFeature(d);
                }else{

                    result = secondReg.exec(result[3]);


                    if(result !== null){
                        

                        if(type !== 'spawn_loc' && type !== 'spawn_point' && type !== 'p_s'){

                            player = this.getPlayerById(result[1]);


                            if(player !== null){

                                player.setStatsValue(type, result[2]);
                            }

                        }else if(type === 'p_s'){

                            if(timestamp < this.matchTimings.start){
                                //new Message(`Score update before match start, ignoring.`,"note");
                                continue;
                            }

                            this.scoreHistory.push(
                                {
                                    "timestamp": timestamp,
                                    "player":   parseInt(result[1]),
                                    "score": parseInt(result[2])
                                }
                            );
                            
                        }else if(type === 'spawn_loc'){


                            if(legacySpawnReg.test(result[2])){

                                const playerId = parseInt(result[1]);

                                const player = this.getPlayerById(playerId);
                                player.spawned(timestamp);

                                this.spawnManager.playerSpawnedLegacy(
                                    timestamp,
                                    player.masterId,
                                    result[2].split(',')
                                );

                            }else{

                                const playerId = parseInt(result[1]);

                                const player = this.getPlayerById(playerId);
                                

                                if(player === null){
                                    new Message(`PlayerManager.setNStatsValues() player is null, playerID =${playerId}`,"warning");
                                    this.spawnManager.playerSpawned(timestamp, -1, result[2]);
                                    continue;
                                }

                                player.spawned(timestamp);

                                this.spawnManager.playerSpawned(timestamp, player.masterId, result[2]);
                            }

                        }else if(type === 'spawn_point'){

                            if(spawnLocationReg.test(result[2])){

            
                                subResult = spawnLocationReg.exec(result[2]);

                                this.spawnManager.addSpawnPoint(result[1], subResult[1], subResult[2]);

                            }else{
              
                                this.spawnManager.addSpawnPoint(result[1], result[2]);
                            }
                        }
                    }
                }
            }
        }

        //set bestspawnkillspree, spawnkills ect
    }


    getDelayedDisconnectInfo(timestamp, playerId){

        timestamp = parseFloat(timestamp);
        for(let i = 0; i < this.delayedDisconnects.length; i++){

            const d = this.delayedDisconnects[i];

            if(d.playerId !== playerId) continue;
            if(d.timestamp == timestamp) return d;
        }
        return null;
    }

    setTeam(subString, timestamp, bDisconnect){

        if(bDisconnect){

            const id = parseInt(subString);
            const player = this.getPlayerById(id);

           // new Message(`${id}, ${timestamp}`,"error");

            if(player === null){
                new Message(`PlayerManager.setTeam() player is null id = ${id}`,"error");
                return;
            }
           // timestamp = parseFloat(timestamp);

            const delayInfo = this.getDelayedDisconnectInfo(timestamp, id);

            //if player had a delayed disconect skip this step to prevent importer thinking player disconnected on their rejoin connection
            if(player !== null && delayInfo === null){
                player.setTeam(timestamp, -1);
                return;
            }

            /*if(delayInfo !== null){
                console.log(delayInfo)
            }*/

            return;
        }
           
        

        const reg = /^(.+?)\t(.+)$/i;

        const result = reg.exec(subString);

        if(result !== null){

            const id = parseInt(result[1]);
            const team = parseInt(result[2]);
            const player = this.getPlayerById(id);

            if(player !== null){
                player.setTeam(timestamp, team);      
            }else{
                new Message(`Player with the id of ${id} does not exist(setTeam).`,'warning');
            }
        }
    }
        

    setBotStatus(string){

        const reg = /^(.+?)\t(.+)$/i;

        const result = reg.exec(string);

        if(result !== null){

            let bBot = false;

            if(result[2].toLowerCase() === 'true'){
                bBot = true;
            }

            if(bBot){
                const player = this.getPlayerById(result[1]);

                if(player !== null){
                    player.setAsBot();
                }else{
                    new Message(`Player with the id of ${result[1]} does not exist(setBotStatus).`,'warning');
                }
            }
        }
    }

    setPlayerFeature(string){

        const reg = /^\d+\.\d+\tnstats\t(.+?)\t(.+?)\t(.+)$/i;

        const result = reg.exec(string);

        if(result !== null){

            const type = result[1].toLowerCase();

            const player = this.getPlayerById(result[2]);

            const value = result[3].toLowerCase();

            if(player === null){
                new Message(`Player with the id of ${result[2]} does not exist(setFace).`,'warning');
                return;
            }

            if(type === 'face'){
                player.setFace(value);
            }else if(type === 'voice'){
                player.setVoice(value);
            }else if(type === 'netspeed'){
                player.setNetspeed(value);
            }/*else if(type === "hwid"){
                player.setHWID(value);
            }*/
        }
    }


    kill(killInfo, bTeamGame){

        const {killerId, victimId, timestamp, killDistance, deathType, killerWeapon, victimWeapon} = killInfo;

        const killer = this.getPlayerByMasterId(killerId);
        const victim = this.getPlayerByMasterId(victimId);

        if(killer !== null && this.bIgnoreBots && killer.bBot) return;
        if(victim !== null && this.bIgnoreBots && victim.bBot) return;

        const victimTeam = this.getPlayerTeamAt(victimId, timestamp);
        const killerTeam = this.getPlayerTeamAt(killerId, timestamp);

        let bTeamKill = false;

        if(bTeamGame){
            bTeamKill = killerTeam === victimTeam;
        }


        if(killer !== null){   

            killer.killedPlayer(timestamp, killerWeapon, killDistance, bTeamKill, victimWeapon, deathType, this.bHardcore);

            if(killerWeapon.toLowerCase() === "translocator"){

                killer.teleFragKill(timestamp, this.bHardcore);
                this.killManager.addTeleFrag(timestamp, killerId, killerTeam, victimId, victimTeam, false);

            }else if(victimWeapon.toLowerCase() === "translocator" && deathType.toLowerCase() === "gibbed"){

                killer.teleDiscKill(timestamp, this.bHardcore);
                this.killManager.addTeleFrag(timestamp, killerId, killerTeam, victimId, victimTeam, true);
            }
        }

        
        if(victim !== null){

            if(victim.onASpree()){

                if(killer === null){
                    killer = {"id": -1}
                }

                this.spreeManager.add(
                    victim.masterId, 
                    victim.getCurrentSpree(), 
                    killer.masterId,
                    victim.getPreviousSpawn(timestamp),
                    timestamp
                );
            }

            if(victimWeapon.toLowerCase() === "translocator" && deathType.toLowerCase() === "gibbed"){
                victim.teleDiscDeath();
            }

            if(victim.died(timestamp, killerWeapon, false, killerWeapon.toLowerCase() === "translocator")){
                
                if(killer !== null){
                    killer.stats.spawnKills++;
                }
            }
        }
    }

    suicide(killInfo){

        const {killerId, timestamp, killerWeapon} = killInfo;

        const victim = this.getPlayerByMasterId(killerId);

        if(victim !== null){

            if(victim.onASpree()){

                this.spreeManager.add(
                    victim.masterId, 
                    victim.getCurrentSpree(), 
                    -1,
                    victim.getPreviousSpawn(timestamp),
                    timestamp
                );
                
            }

            victim.died(timestamp, killerWeapon, true, false);
        }
    }

    setKills(kills){

        const bTeamGame = this.totalTeams >= 2;

        for(let i = 0; i < kills.length; i++){

            const k = kills[i];
            
            if(k.type === 'kill'){

                this.kill(k, bTeamGame);

            }else if(k.type === 'suicide'){
               
                this.suicide(k);
            }
        }
    }

    /**
     * Make sure sprees and multis that are still going at the end of the match are counted
     */

    matchEnded(endTimestamp){

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            if(p.onASpree()){

                this.spreeManager.add(
                    p.masterId, 
                    p.getCurrentSpree(), 
                    -1,
                    p.getPreviousSpawn(endTimestamp),
                    endTimestamp
                );
                /*this.sprees.addToList(
                    p.masterId, 
                    p.getCurrentSpree(), 
                    -1,
                    p.getPreviousSpawn(endTimestamp),
                    endTimestamp
                );*/
                
            }

            p.matchEnded();
        }
    }

    setHeadshots(data){

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const killer = this.getPlayerByMasterId(d.killer);

            if(killer !== null){

                killer.stats.headshots++;

            }else{
                new Message(`PlayerManager.setHeadshots() killer is null`,'warning');
            }
        }    
    }

    setIp(string){    

        const reg = /^(.+?)\t(.+)$/i;

        const result = reg.exec(string);

        if(result !== null){

            const player = this.getPlayerById(result[1]);

            if(player !== null){

                const geo = this.geoip.lookup(result[2]);

                let country = "xx";

                if(geo !== null){
                    country = geo.country.toLowerCase();
                }

                player.setIp(result[2], country);

            }else{
                new Message(`There is no player with id ${result[1]}(setIp).`,'warning');
            }
        }
    }

    setAccuracy(player, accuracy){

        player = parseInt(player);
        accuracy = parseFloat(accuracy);

        console.log(`player = ${player} accuracy = ${accuracy}`);
    }


    mergePlayer(master, duplicate){

        new Message(`PlayerManager.mergePlayer() is deprecated`,"error");
        return;

    }

    setWeaponStats(){

        //console.log(this.data);

        const reg = /^(\d+\.\d+)\tweap_(.+?)\t(.+?)\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            const result = reg.exec(d);

            if(result !== null){

                const timestamp = parseFloat(result[1]);
                const statType = result[2];
                const weaponName = result[3];
                const playerId = parseInt(result[4]);
                const value = result[5];

                const player = this.getPlayerById(playerId);

                if(player !== null){

                    if(this.bIgnoreBots && player.bBot) continue;

                    player.setWeaponStat(weaponName, statType, value);

                }else{
                    new Message(`Player with id ${playerId} does not exist.`,'warning');
                }

                //console.log(result);
            }
        }

       // this.debugDisplayPlayerStats();
    }


    async updateFragPerformance(gametypeId, mapId, date){

        try{


            const updatedMasterIds = [];
            const updatedGametypeIds = [];
            const updatedMapIds = [];
            const updatedMapGametypeIds = [];
   
            //get current gametype id here

            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                if(this.bIgnoreBots && p.bBot) continue;
                
                const totalPlaytime = p.getTotalPlaytime(this.totalTeams);

                const teamPlaytime = p.getPlaytimeByTeam(this.totalTeams);

                //update combined gametypes totals
                await Player.updateFrags(
                    p.masterId, 
                    date,
                    totalPlaytime, 
                    teamPlaytime.red,
                    teamPlaytime.blue,
                    teamPlaytime.green,
                    teamPlaytime.yellow,
                    teamPlaytime.spec,
                    p.stats.frags,
                    p.stats.score,  
                    p.stats.kills, 
                    p.stats.deaths, 
                    p.stats.suicides, 
                    p.stats.teamkills,
                    p.stats.spawnKills,
                    p.stats.multis,
                    p.stats.bestMulti,
                    p.stats.sprees,
                    p.stats.bestSpree,
                    p.stats.fastestKill,
                    p.stats.slowestKill,
                    p.stats.bestspawnkillspree,
                    p.stats.firstBlood,
                    p.stats.accuracy,
                    p.stats.killsNormalRange,
                    p.stats.killsLongRange,
                    p.stats.killsUberRange,
                    p.stats.headshots,
                    0,
                    0
                );

                //update gametype specific totals
                await Player.updateFrags(
                    p.gametypeId, 
                    date,
                    totalPlaytime, 
                    teamPlaytime.red,
                    teamPlaytime.blue,
                    teamPlaytime.green,
                    teamPlaytime.yellow,
                    teamPlaytime.spec,
                    p.stats.frags,
                    p.stats.score, 
                    p.stats.kills, 
                    p.stats.deaths, 
                    p.stats.suicides, 
                    p.stats.teamkills,
                    p.stats.spawnKills,
                    p.stats.multis,
                    p.stats.bestMulti,
                    p.stats.sprees,
                    p.stats.bestSpree,
                    p.stats.fastestKill,
                    p.stats.slowestKill,
                    p.stats.bestspawnkillspree,
                    p.stats.firstBlood,
                    p.stats.accuracy,
                    p.stats.killsNormalRange,
                    p.stats.killsLongRange,
                    p.stats.killsUberRange,
                    p.stats.headshots,
                    gametypeId,
                    0
                );

                //update map specific totals
                await Player.updateFrags(
                    p.mapId, 
                    date,
                    totalPlaytime, 
                    teamPlaytime.red,
                    teamPlaytime.blue,
                    teamPlaytime.green,
                    teamPlaytime.yellow,
                    teamPlaytime.spec,
                    p.stats.frags,
                    p.stats.score, 
                    p.stats.kills, 
                    p.stats.deaths, 
                    p.stats.suicides, 
                    p.stats.teamkills,
                    p.stats.spawnKills,
                    p.stats.multis,
                    p.stats.bestMulti,
                    p.stats.sprees,
                    p.stats.bestSpree,
                    p.stats.fastestKill,
                    p.stats.slowestKill,
                    p.stats.bestspawnkillspree,
                    p.stats.firstBlood,
                    p.stats.accuracy,
                    p.stats.killsNormalRange,
                    p.stats.killsLongRange,
                    p.stats.killsUberRange,
                    p.stats.headshots,
                    0,
                    mapId
                );

                //update map+gametype specific totals
                await Player.updateFrags(
                    p.mapGametypeId, 
                    date,
                    totalPlaytime, 
                    teamPlaytime.red,
                    teamPlaytime.blue,
                    teamPlaytime.green,
                    teamPlaytime.yellow,
                    teamPlaytime.spec,
                    p.stats.frags,
                    p.stats.score, 
                    p.stats.kills, 
                    p.stats.deaths, 
                    p.stats.suicides, 
                    p.stats.teamkills,
                    p.stats.spawnKills,
                    p.stats.multis,
                    p.stats.bestMulti,
                    p.stats.sprees,
                    p.stats.bestSpree,
                    p.stats.fastestKill,
                    p.stats.slowestKill,
                    p.stats.bestspawnkillspree,
                    p.stats.firstBlood,
                    p.stats.accuracy,
                    p.stats.killsNormalRange,
                    p.stats.killsLongRange,
                    p.stats.killsUberRange,
                    p.stats.headshots,
                    gametypeId,
                    mapId
                );

                //to prevent players that used multiple names during a match to update matches played by more than 1
                if(updatedMasterIds.indexOf(p.masterId) === -1){
                    await Player.incrementMatchesPlayed(p.masterId);
                    updatedMasterIds.push(p.masterId);
                }

                if(updatedGametypeIds.indexOf(p.gametypeId) === -1){
                    await Player.incrementMatchesPlayed(p.gametypeId);
                    updatedGametypeIds.push(p.gametypeId);
                }

                if(updatedMapIds.indexOf(p.mapId) === -1){
                    await Player.incrementMatchesPlayed(p.mapId);
                    updatedMapIds.push(p.mapId);
                }

                if(updatedMapGametypeIds.indexOf(p.mapGametypeId) === -1){
                    await Player.incrementMatchesPlayed(p.mapGametypeId);
                    updatedMapGametypeIds.push(p.mapGametypeId);
                }
            
            }


        }catch(err){
            console.trace(err);
            new Message(err, 'error');
        }
    }

    

    async updateFaces(date){

        try{

            await this.faces.updateFaceStats(this.players, date);
            this.faces.setPlayerFaceIds(this.players);

            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                const playtime = p.getTotalPlaytime(this.totalTeams);

                if(playtime > 0){
                    if(this.bIgnoreBots && p.bBot) continue;
                    await this.faces.updatePlayerFace(p.masterId, p.faceId);
                }
            }

        }catch(err){
            console.trace(err);
        }
    }

    async updateIpCountry(id, ip, country){

        if(ip === undefined) ip = "";
        if(country === undefined) country = "xx";

        const query = "UPDATE nstats_player_totals SET ip=?,country=? WHERE id=? OR player_id=?";

        return await simpleQuery(query, [ip, country, id, id]);
    }

    async setIpCountry(){

        try{


            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                if(p.bBot) continue;
                await this.updateIpCountry(p.masterId, p.ip, p.country);
                
            }

        }catch(err){
            console.log(err);
        }   
    }

    sortByScore(){

        this.players.sort((a, b) =>{

            a = a.stats;
            b = b.stats;


            if(a.score < b.score){
                return 1;
            }else if(a.score > b.score){
                return -1;
            }

            if(a.deaths < b.deaths){
                return -1;
            }else if(a.deaths > b.deaths){
                return 1;
            }
            return 0;
        });

       // console.table(this.players);
    }

    async updateWinStats(gametypeId, mapId){

        try{     

            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                const playtime = p.getTotalPlaytime(this.totalTeams);

                if(this.bIgnoreBots && p.bBot) continue;
       
                if(playtime > 0){
                    //all time totals
                    await Player.updateWinStats(p.masterId, p.bWinner, p.bDrew, 0, 0);
                    //gametype totals
                    await Player.updateWinStats(p.gametypeId, p.bWinner, p.bDrew, gametypeId, 0);
                    //map totals
                    await Player.updateWinStats(p.mapId, p.bWinner, p.bDrew, 0, mapId);
                    //map + gametype totals
                    await Player.updateWinStats(p.mapGametypeId, p.bWinner, p.bDrew, gametypeId, mapId);
                }
            }
            

        }catch(err){
            console.log(err);
        }
    }

    setPlayerSpawns(){

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];
            p.spawns = this.spawnManager.getPlayerSpawns(p.id);
        }
    }



    getCurrentConnectedPlayers(timestamp){

        timestamp = parseFloat(timestamp);

        const found = [];

        for(let p = 0; p < this.players.length; p++){

            for(let i = 0; i < this.players[p].connects.length; i++){

                const connect = this.players[p].connects[i];
                const disconnect = (this.players[p].disconnects[i] !== undefined) ? this.players[p].disconnects[i] : 999999999999;


                if(connect <= timestamp && timestamp < disconnect){
                    found.push(this.players[p]);   
                }
            }
        }

        return found;
    }

    async updateVoices(date){

        try{

            const data = {};

            for(let i = 0; i < this.players.length; i++){
                
                const p = this.players[i];

                const playtime = p.getTotalPlaytime(this.totalTeams);

                if(this.bIgnoreBots && p.bBot) continue;
                
                if(playtime > 0){

                    if(data[p.voice] === undefined){
                        data[p.voice] = 1;
                    }else{
                        data[p.voice]++;
                    }
                }

            }

            await this.voices.updateStatsBulk(data, date);

            await this.voices.getAllIds();

            this.voices.setPlayerVoices(this.players);

        }catch(err){
            new Message(`updateVoices ${err}`,'error');
        }
    }


    async insertMatchData(gametypeId, matchId, mapId, matchDate){

        try{

            let pingData = 0;
    
            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                //if(p.bDuplicate === undefined){

                    pingData = this.pingManager.getPlayerValues(p.masterId);

                    if(pingData === null){
                        pingData = {
                            "min": 0,
                            "average": 0,
                            "max": 0
                        };
                    }

                    if(this.bIgnoreBots){

                        if(p.bBot) continue;
                      
                    }

                    p.matchId = await Player.insertMatchData(p, matchId, gametypeId, mapId, matchDate, pingData, this.totalTeams);

                    
                    
                //}else{
                //    new Message(`${p.name} is a duplicate not inserting match data.`,'note');
                //}
            }

            //console.log(this.players);

        }catch(err){
            new Message(`insertMatchData ${err}`,'error');
        }
    }


    async insertConnectionData(matchId){

        try{

            await this.connectionsManager.insertData(matchId);

        }catch(err){
            new Message(`PlayerManager.insertConnectionData ${err}`,'error');
        }
    }


    getPlayerTeamAt(id, timestamp){

        id = parseInt(id);
        timestamp = parseFloat(timestamp)

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].masterId === id){
                return this.players[i].getTeamAt(timestamp);
            }
        }

       // new Message(`getPlayerTeamAt failed to get team for player ${id} @ ${timestamp}`, "error");
       // console.trace("a");

        return -1;
    }

    async insertScoreHistory(matchId){

        try{

            const scoreInsertVars = [];

            for(let i = 0; i < this.scoreHistory.length; i++){

                const s = this.scoreHistory[i];

                const currentPlayer = this.getPlayerById(s.player);

                if(currentPlayer === null){
                    new Message(`PlayerManager.insertSCoreHistory() currentPlayer is null`,'warning');
                    continue;
                }

                if(this.bIgnoreBots && currentPlayer.bBot) continue;
                

                const playtime = currentPlayer.getTotalPlaytime(this.totalTeams);

                if(playtime > 0){
                    //await Player.insertScoreHistory(matchId, s.timestamp, currentPlayer.masterId, s.score);
                    scoreInsertVars.push([matchId, s.timestamp, currentPlayer.masterId, s.score]);
                }   
            }

            await Player.bulkInsertScoreHistory(scoreInsertVars);

        }catch(err){
            new Message(`PlayerManager.insertScoreHistory ${err}`,'error');
        }
    }

    async updateCurrentWinRates(gametypeId, mapId, matchDate, matchId, bNeedToRecalulate){

        try{

           // const playerIds = new Set();

            const playerResults = {};

            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                if(this.bIgnoreBots && p.bBot) continue;
                const playtime = p.getTotalPlaytime(this.totalTeams);

                if(playtime === 0) continue;
          
                let currentResult = p.matchResult;
                
                console.log(currentResult);

                //playerIds.add(p.masterId);

                playerResults[p.masterId] = currentResult;

                /*
                //map + gametype win rates
                await this.winRateManager.updatePlayerLatest(p.masterId, gametypeId, mapId, currentResult, matchDate, matchId);
                //gametype win rates
                await this.winRateManager.updatePlayerLatest(p.masterId, gametypeId, 0, currentResult, matchDate, matchId);
                //map win rates
                await this.winRateManager.updatePlayerLatest(p.masterId, 0, mapId, currentResult, matchDate, matchId);
                //all time win rate
                await this.winRateManager.updatePlayerLatest(p.masterId, 0, 0, currentResult, matchDate, matchId);
                */
            }


            await updatePlayerWinrates(playerResults, matchId, gametypeId, mapId, matchDate);
            process.exit();

        }catch(err){
            new Message(`PlayerManager.updateCurrentWinRates() ${err}`,'error');
            console.trace(err);
        }
    }

    async updateWinRates(matchId, date, gametypeId, mapId){

        try{
    
            //date = -1//Math.floor(Math.random() * 10000000);
            
            //TODO change this so that it's an admin tool from the website, 
            //it makes more sense to do it there once instead of after each log if there is an older log

            //const bNeedToRecalulate = await this.winRateManager.bNeedToRecalulate(date);
        
            await this.updateCurrentWinRates(gametypeId, mapId, date, matchId, false/*bNeedToRecalulate*/);

        }catch(err){
            new Message(`PlayerManager.updateWinRates() ${err}`,'error');
        }
    }

    async getPlayerTotals(gametype){

        try{

            const data = {};

            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                if(this.bIgnoreBots && p.bBot) continue;         

                const playtime = p.getTotalPlaytime(this.totalTeams);

                if(playtime > 0){

                    const current = await Player.getGametypeTotals(p.masterId, gametype);

                    if(current !== null){
                        data[p.masterId] = current;
                    }
                }
            }

            return data;

        }catch(err){
            new Message(`PlayerManager.getPlayerTotals() ${err}`,"error");
            console.trace(err);
            return [];
        }
    }


    async insertSprees(matchId){

        try{

            await this.spreeManager.insertSprees(matchId);
            /*if(this.sprees.currentSprees !== undefined){
                await this.sprees.insertCurrentSprees(matchId);
            }*/

        }catch(err){
            
            new Message(err, "error");
        }
    }

    getTotalPlayersWithPlaytime(){

        let total = 0;

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];
            if(p.stats.time_on_server > 0) total++;
            
        }

        return total;

    }

    getOriginalMasterIds(playerIds){

        if(playerIds.length === 0) return {};

        const players = {};

        for(let i = 0; i < playerIds.length; i++){

            const p = playerIds[i];
            const masterId = this.getOriginalConnectionMasterId(p);

            if(players[p] === undefined){
                players[p] = masterId;
            }
        }

        return players;
    }

    toMasterIds(playerIds){

        if(playerIds.length === 0) return [];

        const masterIds = this.getOriginalMasterIds(playerIds);

        
        const correctPlayerIds = [];

        for(let i = 0; i < playerIds.length; i++){

            const p = playerIds[i];

            correctPlayerIds.push(masterIds[p]);
        }

        return correctPlayerIds;
    }


    bPlayerBot(masterPlayerId){

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            if(p.masterId === masterPlayerId){
                if(p.bBot) return true;
            }
        }

        return false;
    }

    getPlayerPlaytime(masterId){

        const player = this.getPlayerByMasterId(masterId);

        if(player === null){

            new Message(`failed to getPlayerPlaytime(${masterId})`,"error");
            return null;
        }

        return player.stats.time_on_server;
        
    }

    async updateRankings(rankingsManager, gametypeId, matchId){

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            if(p.bBot){
                if(this.bIgnoreBots) continue;
            }

            if(p.stats.time_on_server > 0){
                await rankingsManager.updatePlayerRankings(Player, p.masterId, gametypeId, matchId);    
            }
        }
    }

    ignoreWarmpup(timestamp){

        if(timestamp < this.matchTimings.start){
            return this.matchTimings.start;
        }

        return timestamp;
    }

    setPlayerPlaytime(bHardcore){

        this.scalePlaytimes(bHardcore);
  
    }

    
    

    scalePlaytimes(bHardcore){

       /* if(bHardcore && playtime !== 0){
            return playtime / 1.1;      
        }

        return playtime;*/

        if(!bHardcore) return;

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];
            

            for(const [teamId, playtime] of Object.entries(p.stats.teamPlaytime)){

                //console.log(`scaled ${p.stats.teamPlaytime[teamId]} to ${this.scalePlaytime(playtime, bHardcore)}`);
                p.stats.teamPlaytime[teamId] = scalePlaytime(playtime, bHardcore);
            }
        }
    }
    
    
}
