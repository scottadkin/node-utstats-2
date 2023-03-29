const mysql = require('../database');
const PlayerInfo = require('./playerinfo');
const Message = require('../message');
const P = require('../player');
const Player = new P();
const Faces = require('../faces');
const Voices = require('../voices');
const ConnectionsManager = require('./connectionsmanager');
const PingManager = require('./pingmanager');
const TeamsManager = require('./teamsmanager');
const WinRateManager = require('../winrate');
const SpreeManager = require("./spreemanager");
const Functions = require("../functions");

class PlayerManager{

    constructor(data, spawnManager, bIgnoreBots, matchTimings, geoip, bUsePlayerACEHWID){

        this.data = data;

        this.bIgnoreBots = bIgnoreBots;
        this.matchTimings = matchTimings;

        this.geoip = geoip;
        this.bUsePlayerACEHWID = bUsePlayerACEHWID;


        this.players = [];
        this.uniqueNames = [];
        this.duplicateNames = [];

        this.HWIDS = {};

        this.HWIDSToNames = {};
        this.idsToNames = {};
        this.masterIdsToNames = {};

        this.faces = new Faces();
        this.voices = new Voices();
        this.spawnManager = spawnManager;
        this.connectionsManager = new ConnectionsManager(this);
        this.teamsManager = new TeamsManager();

        this.scoreHistory = [];

        this.teamChanges = [];

        this.pingManager = new PingManager();
        this.winRateManager = new WinRateManager();

        this.spreeManager = new SpreeManager(matchTimings.start);

    }

    init(){

        this.setNStatsValues();
        this.setPlayerSpawns();
        this.parsePlayerStrings();
        this.setWeaponStats();

        
    }

    parseHWIDS(){


        if(!this.bUsePlayerACEHWID) return;

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


    getPreliminaryPlayerByHWID(HWID){

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            if(p.hwid === HWID) p;
        }

        return null;
    }

    connectPlayer(subString){

        const reg = /^(.+?)\t(\d+?)\t.+$/i;

        const result = reg.exec(subString);
        //console.log(result);
        if(result === null) return;

        const playerName = result[1];
        const playerId = parseInt(result[2]);
        const HWID = this.HWIDS[playerId] ?? "";

        this.idsToNames[playerId] = playerName.toLowerCase();

        //connect(timestamp, bSpectator)

        if(HWID !== ""){

            this.HWIDSToNames[HWID] = playerName.toLowerCase();

            if(this.bPreliminaryPlayerExits(playerId, HWID)){

                const player = this.getPreliminaryPlayerByHWID(HWID);
                if(player !== null) player.bSpectator = false;
                return;
            }
        }

        this.createPreliminaryPlayer(playerName, playerId, HWID, false);

        //this.preliminaryPlayers.push({"name": playerName, "id": playerId, "hwid": HWID ?? "", "bSpectator": false});
    }

    renameIdsToName(oldName, newName){


        oldName = oldName.toLowerCase();
        newName = newName.toLowerCase();

        for(const [playerId, playerName] of Object.entries(this.idsToNames)){

            if(playerName.toLowerCase() === oldName){
                this.idsToNames[playerId] = newName;
            } 
        }
    }

    renamePreliminaryByHWID(HWID, newName){

        if(HWID === "") return;

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            if(p.hwid === HWID){
                this.renameIdsToName(p.name, newName);
                p.name = newName;
            }
        }
    }

    renamePreliminaryByPlayerId(id, newName){

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            if(p.id === id){
                this.renameIdsToName(p.name, newName);
                p.name = newName;
            }
        }
    }


    bPreliminaryPlayerExits(playerId, HWID){

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            if(HWID !== "" && p.hwid === HWID) return true;
            if(p.id === playerId) return true;

        }

        return false;
    }


    createPreliminaryPlayer(name, id, hwid, bSpectator){

        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            if(p.name === name || p.id === id){
                p.bSpectator = bSpectator;
                return;
            }
            
            if(p.hwid !== "" && hwid !== ""){

                if(p.hwid === hwid){
                    p.bSpectator = bSpectator;
                    return;
                }
            }
        }

        this.preliminaryPlayers.push({"name": name, "id": id, "hwid": hwid ?? "", "bSpectator": bSpectator});
    }

    renamePlayer(subString){

        const reg = /^(.+?)\t(\d+)$/i;

        const result = reg.exec(subString);

        if(result === null) return;

        const playerName = result[1];
        const playerId = parseInt(result[2]);

        const HWID = this.HWIDS[playerId] ?? "";

        this.createPreliminaryPlayer(playerName, playerId, HWID, true);

        if(HWID !== "") this.HWIDSToNames[HWID] = playerName.toLowerCase();
        this.idsToNames[playerId] = playerName.toLowerCase();

        if(HWID === ""){

            this.renamePreliminaryByPlayerId(playerId, playerName);
        }
        

        if(HWID === "") return;

        this.renamePreliminaryByHWID(HWID, playerName);
    }

    updatePreliminaryPlayers(subString, type){

        
        if(type === "connect"){
            this.connectPlayer(subString);
            return;
        }

        if(type === "rename"){
            this.renamePlayer(subString);
            return;
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

            if(type === "connect" || type === "rename"){

                //console.log(subString);

                this.updatePreliminaryPlayers(subString, type)

                //await this.connectPlayer(timestamp, subString, gametypeId);
            }else if(type === "disconnect"){
                //this.disconnectPlayer(timestamp, subString);
            }
        }

        console.log(this.preliminaryPlayers);
    }



    async createPlayers(gametypeId){


        this.parseHWIDS();

        console.log(this.HWIDS);

        this.createPreliminaryPlayers();

        
        for(let i = 0; i < this.preliminaryPlayers.length; i++){

            const p = this.preliminaryPlayers[i];

            let masterIds = null;

            if(!this.bUsePlayerACEHWID || p.hwid === ""){

                new Message(`Player.getMasterIds(${p.name}, ${gametypeId})`,"note");
                masterIds = await Player.getMasterIds(p.name, gametypeId);

            }else{

                new Message(`Player.getMasterIdsByHWID(${p.hwid}, ${p.name}, ${gametypeId})`,"note");
                masterIds = await Player.getMasterIdsByHWID(p.hwid, p.name, gametypeId);
                //player.setHWID(p.hwid);
            }

            this.masterIdsToNames[masterIds.masterId] = p.name.toLowerCase();

            const player = new PlayerInfo(p.id, p.name, masterIds.masterId, masterIds.gametypeId, p.hwid);

            this.players.push(player);

        }

        console.log(this.idsToNames);
        console.log(this.HWIDSToNames);
        console.log(this.masterIdsToNames);
        console.table(this.preliminaryPlayers);

    }


    getPlayerByHWID(hwid){

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            if(p.HWID === hwid) return p;
        }

        return null;
    }

    getPlayerById(id){
        
        id = parseInt(id);

        const name = this.idsToNames[id];

        //console.log(`getPlayerById(${id}) name = ${name}`);

        if(name === undefined){

            new Message(`getPlayerById(${id}) Name is undefined`,"error");
            return null;
        }

        return this.getPlayerByName(name);
    }

    getPlayerByMasterId(id){

        id = parseInt(id);

        const name = this.masterIdsToNames[id];

        if(name === undefined){
            
            new Message(`getPlayerByMasterId(${id}) Name is undefined`,"error");
            return null;
        }

        return this.getPlayerByName(name);
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
            
            if(p.bDuplicate === undefined && p.bPlayedInMatch && p.stats.time_on_server > 0){

                if(this.bIgnoreBots){
                    if(p.bBot) continue;
                }

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

                if(type === 'team'){
                    //this.setTeam(result[3], result[1]);
                }else if(type == 'isabot'){
                    this.setBotStatus(result[3]);
                }else if(type == 'ip'){
                    this.setIp(result[3]);
                }else if(type == 'connect'){
                    this.connectionsManager.lines.push(d);
                }else if(type == 'disconnect'){
                    this.setTeam(result[3], result[1], true);
                    this.connectionsManager.lines.push(d);
                }else if(type === "rename"){
                    this.connectionsManager.lines.push(d);          
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

    updateDuplicateNames(name){

        const uniqueNameIndex = this.uniqueNames.indexOf(name);
        const duplicateNameIndex = this.duplicateNames.indexOf(name);

        if(uniqueNameIndex === -1){
            this.uniqueNames.push(name);
        }else{

            if(duplicateNameIndex === -1){
                this.duplicateNames.push(name);
            }
        }
    }

    

    setTeam(subString, timestamp, bDisconnect){


        if(bDisconnect){

            const id = parseInt(subString);
            const player = this.getPlayerById(id);

            if(player !== null){
                player.setTeam(timestamp, -1);
            }else{
                new Message(`PlayerManager.setTeam() player is null id = ${id}`,"error");
            }

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

            killer.killedPlayer(timestamp, killerWeapon, killDistance, bTeamKill, victimWeapon, deathType);

            if(killerWeapon.toLowerCase() === "translocator"){

                killer.teleFragKill(timestamp);
                this.killManager.addTeleFrag(timestamp, killerId, killerTeam, victimId, victimTeam, false)
            }
    
            if(victimWeapon.toLowerCase() === "translocator" && deathType.toLowerCase() === "gibbed"){

                killer.teleDiscKill(timestamp);
                this.killManager.addTeleFrag(timestamp, killerId, killerTeam, victimId, victimTeam, true)
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

    setKills(kills, totalTeams){

        const bTeamGame = totalTeams >= 2;

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

    async mergeDuplicates(bLastManStanding){

        //console.log('MERGE DUPLCIATES');

        this.bLastManStanding = bLastManStanding;


        if(this.duplicateNames.length > 0){

            new Message(`Found ${this.duplicateNames.length} duplicate players to merge`,'pass');
            
            let originalIndex = 0;

            for(let i = 0; i < this.duplicateNames.length; i++){

                originalIndex = -1;

                for(let x = 0; x < this.players.length; x++){

                    if(this.players[x].name === this.duplicateNames[i]){

                        if(originalIndex === -1){
                            originalIndex = x;
                        }else{
                            
                            this.players[x].bDuplicate = true;
                            this.mergePlayer(this.players[originalIndex], this.players[x]);
                            
                        }                
                    }
                }
            }

        }else{
            new Message(`There are no duplicates to import`,'pass');
        }
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


    async updateFragPerformance(gametypeId, date, totalTeams){

        try{


            const updatedMasterIds = [];
            const updatedGametypeIds = [];
   
            //get current gametype id here

            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                if(!p.bPlayedInMatch) continue;

                if(this.bIgnoreBots){
                    if(p.bBot) continue;
                }

                const totalPlaytime = p.getTotalPlaytime(totalTeams);

                const teamPlaytime = p.getPlaytimeByTeam(totalTeams);

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
                    p.stats.teleFrags
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
                    p.stats.teleFrags
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

                if(p.bDuplicate === undefined && p.bPlayedInMatch){

                    if(this.bIgnoreBots){
                        if(p.bBot) continue;
                    }

                    await this.faces.updatePlayerFace(p.masterId, p.faceId);
                }
            }

        }catch(err){
            console.trace(err);
        }
    }

    updateIpCountry(id, ip, country){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_player_totals SET ip=?,country=? WHERE id=?";

            if(ip === undefined) ip = "";
            if(country === undefined) country = "xx";

            mysql.query(query, [ip, country, id], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
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

    async updateWinStats(gametypeId){

        try{     

            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                if(!p.bPlayedInMatch) continue;
                if(this.bIgnoreBots && p.bBot) continue;
       
                await Player.updateWinStats(p.masterId, p.bWinner, p.bDrew);
                await Player.updateWinStats(p.gametypeId, p.bWinner, p.bDrew, gametypeId);
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

        let connect = 0;
        let disconnect = 0;

        for(let p = 0; p < this.players.length; p++){

            for(let i = 0; i < this.players[p].connects.length; i++){

                connect = this.players[p].connects[i];
                disconnect = (this.players[p].disconnects[i] !== undefined) ? this.players[p].disconnects[i] : 999999999999;

                //console.log(`connect = ${connect}  disconnect = ${disconnect}`);

                if(connect <= timestamp && timestamp < disconnect){

                    if(this.players[p].bDuplicate === undefined){
                        found.push(this.players[p]);
                    }
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

                if(p.bDuplicate === undefined && p.bPlayedInMatch){

                    if(this.bIgnoreBots){

                        if(p.bBot) continue;
                    }

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


    async insertMatchData(gametypeId, matchId, mapId, matchDate, totalTeams){

        try{

            let pingData = 0;
    
            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                if(p.bDuplicate === undefined){

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

                    p.matchId = await Player.insertMatchData(p, matchId, gametypeId, mapId, matchDate, pingData, totalTeams);

                    
                    
                }else{
                    new Message(`${p.name} is a duplicate not inserting match data.`,'note');
                }
            }

            //console.log(this.players);

        }catch(err){
            new Message(`insertMatchData ${err}`,'error');
        }
    }


    async insertConnectionData(matchId){

        try{

            this.connectionsManager.parseData();

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

        return -1;
    }

    async insertScoreHistory(matchId){

        try{

            for(let i = 0; i < this.scoreHistory.length; i++){

                const s = this.scoreHistory[i];

                const currentPlayer = this.getPlayerById(s.player);

                if(currentPlayer !== null){

                    if(currentPlayer.bPlayedInMatch){

                        if(this.bIgnoreBots){
                            if(currentPlayer.bBot) continue;
                        }

                        await Player.insertScoreHistory(matchId, s.timestamp, currentPlayer.masterId, s.score);
                    }
                }else{
                    new Message(`PlayerManager.insertSCoreHistory() currentPlayer is null`,'warning');
                }
            }

        }catch(err){
            new Message(`PlayerManager.insertScoreHistory ${err}`,'error');
        }
    }


    updateCurrentWinRates(data, matchResult){

        let d = 0;

        let current = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            current = matchResult[`${d.player}`];

            if(current !== undefined){

                d.matches++;

                d.match_result = current;
                
                if(current === 1){

                    d.wins++;   
                    d.current_win_streak++;
                    d.current_draw_streak = 0;
                    d.current_lose_streak = 0;

                    if(d.current_win_streak > d.max_win_streak){
                        d.max_win_streak = d.current_win_streak;
                    }

                }else if(current === 0){

                    d.current_win_streak = 0;
                    d.current_draw_streak = 0;
                    d.current_lose_streak++;
                    d.losses++;

                    if(d.current_lose_streak > d.max_lose_streak){
                        d.max_lose_streak = d.current_lose_streak;
                    }

                }else if(current === 2){
                    
                    d.current_win_streak = 0;
                    d.current_lose_streak = 0;
                    d.current_draw_streak++;
                    d.draws++;

                    if(d.current_draw_streak > d.max_draw_streak){
                        d.max_draw_streak = d.current_draw_streak;
                    }
                };

                if(d.wins > 0){

                    if(d.wins === 0){
                        d.winrate = 1;
                    }else{
                        d.winrate = d.wins / d.matches;
                    }

                    d.winrate *= 100;

                }else{
                    d.winrate = 0;
                }

                

            }else{
                console.log(`NOT FOUND`);
            }
        }
    }

    async setCurrentWinRates(gametypeId){

        try{

            const playerIds = [];

            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                if(p.bPlayedInMatch){

                    if(this.bIgnoreBots){
                        if(p.bBot) continue;
                    }

                    playerIds.push(p.masterId);
                }
            }


            const data = await this.winRateManager.getCurrentPlayersData(playerIds, [0, gametypeId]);

            const currentResult = {};

            for(let i = 0; i < this.players.length; i++){

                const p = this.players[i];

                if(p.bWinner){
                    currentResult[p.masterId] = 1;
                }else if(!p.bWinner && !p.bDrew){
                    currentResult[p.masterId] = 0;
                }else if(p.bDrew){
                    currentResult[p.masterId] = 2;
                }         
            }

            this.updateCurrentWinRates(data, currentResult);

            return data;


        }catch(err){
            new Message(`PlayerManager.setCurrentWinRates() ${err}`,'error');
        }
    }

    async updateWinRates(matchId, date, gametypeId){

        try{

            const data = await this.setCurrentWinRates(gametypeId);

            for(let i = 0; i < data.length; i++){

                await this.winRateManager.insertHistory(matchId, date, data[i]);

                await this.winRateManager.updateLatest(matchId, date, data[i]);

            }

        }catch(err){
            new Message(`PlayerManager.updateWinRates() ${err}`,'error');
        }
    }

    async getPlayerTotals(gametype){

        try{

            const data = {};

            let p = 0;
            let current = 0;

            for(let i = 0; i < this.players.length; i++){


                p = this.players[i];

                if(p.bDuplicate === undefined && p.bPlayedInMatch){

                    if(this.bIgnoreBots){
                        if(p.bBot) continue;
                    }

                    current = await Player.getGametypeTotals(p.masterId, gametype);

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

    /*fixPlaytime(bHardcore, matchLength){


        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            let playtime = p.stats.time_on_server;

            if(bHardcore){
                if(playtime > 0){
                    playtime = playtime / 1.1;
                }
            }

            //lazy way to ignore warm up
            if(playtime > matchLength){
                playtime = matchLength;
            }

            p.stats.time_on_server = playtime;

        }
    }*/

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

        const matchTimings = this.matchTimings;

        for(let i = 0; i < this.players.length; i++){

            const p = this.players[i];

            const events = [...p.teamChangeEvents];

            events.sort((a, b) =>{

                a = a.timestamp;
                b = b.timestamp;

                if(a < b) return -1;
                if(a > b) return 1;
                return 0;
            });

            let previousTimestamp = 0;
            let bLastDisconnect = false;
            let previousTeam = 255;

            for(let x = 0; x < events.length; x++){

                const currentEvent = events[x];

                if(x === 0){

                    previousTimestamp = this.ignoreWarmpup(currentEvent.timestamp);

                    if(currentEvent.type === "change"){
                        previousTeam = currentEvent.newTeam;
                    }

                    continue;
                }


                const diff = this.ignoreWarmpup(currentEvent.timestamp) - previousTimestamp;

                if(currentEvent.type === "disconnect"){
                    bLastDisconnect = true;
                    p.stats.teamPlaytime[previousTeam] += diff;
                }else{
                    bLastDisconnect = false;
                    p.stats.teamPlaytime[previousTeam] += diff;
                    previousTeam = currentEvent.newTeam;             
                }

                previousTimestamp = this.ignoreWarmpup(currentEvent.timestamp);
                
            }

            if(!bLastDisconnect){
                
                const finalDiff = matchTimings.end - previousTimestamp;
                p.stats.teamPlaytime[previousTeam] += finalDiff;
            }
        }


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
                p.stats.teamPlaytime[teamId] = Functions.scalePlaytime(playtime, bHardcore);
            }
        }
    }
    
    
}

module.exports = PlayerManager;