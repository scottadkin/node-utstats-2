const mysql = require('../database');
const Promise = require('promise');
const PlayerInfo = require('./playerinfo');
const Message = require('../message');
const geoip = require('geoip-lite');
const P = require('../player');
const Player = new P();
const Faces = require('../faces');
const Voices = require('../voices');
const WeaponStats = require('./weaponstats');
const ConnectionsManager = require('./connectionsmanager');

class PlayerManager{


    constructor(data, spawnManager){

        this.data = data;

        this.players = [];
        this.uniqueNames = [];
        this.duplicateNames = [];
        this.orginalIds = new Map();
    

        this.faces = new Faces();
        this.voices = new Voices();
        this.spawnManager = spawnManager;
        this.connectionsManager = new ConnectionsManager();

        this.teamChanges = [];

        this.createPlayers();
        this.setNStatsValues();
        this.setPlayerSpawns();
        this.parsePlayerStrings();
        this.setWeaponStats();

    }

    debugDisplayPlayerStats(){

        this.players.forEach((value, key, map) =>{

            console.log(value);
        });
    }

    getPlayerById(id){

        id = parseInt(id);


        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].id === id){
                return this.players[i];
            }
        }

        return null;

    }

    getPlayerNameById(id){

        id = parseInt(id);

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].id === id){
                return this.players[i].name;
            }
        }

        return null;
    }

    parsePlayerStrings(){

        let d = 0;
        let result = 0;
        let type = 0;
        let player = 0;

        const reg = /^(\d+\.\d+)\tplayer\t(.+?)\t(.+)$/i;
        const statReg = /^\d+\.\d+\tstat_player\t(.+?)\t(.+?)\t(.+)$/i;
        const firstBloodReg = /^\d+\.\d+\tfirst_blood\t(\d+)$/;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(reg.test(d)){

                result = reg.exec(d);
                type = result[2].toLowerCase();

                if(type === 'team' /*|| type === 'teamchange'*/){
                    this.setTeam(result[3], result[1]);
                }else if(type == 'isabot'){
                    this.setBotStatus(result[3]);
                }else if(type == 'ip'){
                    this.setIp(result[3]);
                }else if(type == 'connect'){
                    this.connectionsManager.lines.push(d);
                }else if(type == 'disconnect'){
                    this.connectionsManager.lines.push(d);
                }else if(type === 'teamchange'){
                    this.teamChanges.push(d);
                }

            }else if(statReg.test(d)){

                result = statReg.exec(d);
                type = result[1].toLowerCase();

                player = this.getPlayerById(result[2]);

                if(player !== null){

                    player.setStatsValue(result[1], result[3], true);

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

    createPlayers(){

        let d = 0;

        const reg = /^(\d+\.\d+)\tplayer\t(.+?)\t(.+)$/i;
        
        let result = 0;
        let type = 0;
        let timeStamp = 0;
        let subString = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);

            if(result !== null){

                type = result[2].toLowerCase();
                timeStamp = parseFloat(result[1]);
                subString = result[3];
          
                if(type === 'connect'){
                    this.connectPlayer(timeStamp, subString);
                }else if(type === 'disconnect'){
                     this.disconnectPlayer(subString, timeStamp);
                }
            }
        }
    }

    setNStatsValues(){

        const reg = /^(\d+\.\d+)\tnstats\t(.+?)\t(.+)$/i;
        const secondReg = /^(.+?)\t(.+)$/i;

        const legacySpawnReg = /,/;
        const spawnLocationReg = /^(\d+?\t.+?,.+?,.+?)\t(\d+)$/;

        let type = 0;
        let result = 0;
        let subResult = 0;
        let d = 0;
        let player = 0;
        let timestamp = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);
            
            //console.log(result);

            if(result !== null){

                timestamp = parseFloat(result[1]);
                type = result[2].toLowerCase();
               // console.log(`type = ${type}`);

                if(type === 'face' || type === 'voice' || type === 'netspeed'){
                    this.setPlayerFeature(d);
                }else{

                    result = secondReg.exec(result[3]);

                    //console.log(result);

                    if(result !== null){

                        if(type !== 'spawn_loc' && type !== 'spawn_point'){

                            player = this.getPlayerById(result[1]);

                            if(player !== null){

                                player.setStatsValue(type, result[2], true);
                            }

                        }else if(type === 'spawn_loc'){


                            if(legacySpawnReg.test(result[2])){

                                this.spawnManager.playerSpawnedLegacy(
                                    timestamp,
                                    parseInt(result[1]),
                                    result[2].split(',')
                                );

                            }else{

                                this.spawnManager.playerSpawned(timestamp, result[1], result[2]);
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

    connectPlayer(timeStamp, string){

        const connectReg = /^(.+?)\t(.+?)\t(.+?)$/i

        const result = connectReg.exec(string);  

        if(result !== null){

            const player = this.getPlayerById(result[2]);

            if(this.uniqueNames.indexOf(result[1]) === -1){
                this.uniqueNames.push(result[1]);
            }else{

                if(this.duplicateNames.indexOf(result[1]) === -1){
                    this.duplicateNames.push(result[1]);
                }
            }

            if(player === null){
                //this.players.push(new PlayerInfo(parseInt(result[2]), result[1], timeStamp));
                this.players.push(new PlayerInfo(parseInt(result[2]), result[1], timeStamp));

               // if(!this.orginalIds.has(result[1])){
               //     this.orginalIds.set(result[1], parseInt(result[2]));
                //}

            }else{
                player.connect(timeStamp);
            }

        }else{
            new Message(`ConnectPlayer Reg did not match for ${string}.`,'warning');
        }
    }

    disconnectPlayer(id, timeStamp){
        
        id = parseInt(id);

        const player = this.getPlayerById(id);

        if(player !== null){
            player.disconnect(timeStamp);
        }else{
            new Message(`Player with the id of ${id} does not exist(disconnectPlayer).`,'warning');
        }
    }

    setTeam(subString, timeStamp){

        const reg = /^(.+?)\t(.+)$/i;

        const result = reg.exec(subString);

        if(result !== null){

            const id = parseInt(result[1]);
            const team = parseInt(result[2]);
            const player = this.getPlayerById(id);

            if(player !== null){
                player.setTeam(timeStamp, team);      
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

        let reg = /^\d+\.\d+\tnstats\t(.+?)\t(.+?)\t(.+)$/i;

        const result = reg.exec(string);

        if(result !== null){

            const type = result[1].toLowerCase();

            const player = this.getPlayerById(result[2]);

            const value = result[3].toLowerCase();

            if(player !== null){

                if(type === 'face'){
                    player.setFace(value);
                }else if(type === 'voice'){
                    player.setVoice(value);
                }else if(type === 'netspeed'){
                    player.setNetspeed(value);
                }


            }else{
                new Message(`Player with the id of ${result[2]} does not exist(setFace).`,'warning');
            }
        }
    }


    setKills(kills){

        let k = 0;

        let killer = 0;
        let victim = 0;

        //console.log(kills);

        for(let i = 0; i < kills.length; i++){

            k = kills[i];

            //console.log(k);


            if(k.type === 'kill'){

                killer = this.getPlayerById(k.killerId);
                victim = this.getPlayerById(k.victimId);

                if(killer !== null){
                    killer.killedPlayer(k.timestamp, k.killerWeapon);
      
                }

              
                if(victim !== null){
                    victim.died(k.timestamp, k.killerWeapon);
                }

            }else if(k.type === 'suicide'){
                victim = this.getPlayerById(k.killerId);
                if(victim !== null){
                    victim.died(k.timestamp, k.killerWeapon);
                }
            }
        }

        //this.debugDisplayPlayerStats();
    }


    setIp(string){    

        const reg = /^(.+?)\t(.+)$/i;

        const result = reg.exec(string);

        if(result !== null){
            const player = this.getPlayerById(result[1]);

            if(player !== null){

                const geo = geoip.lookup(result[2]);

                //console.log(geo);
                let country = 'xx';
                if(geo !== null){
                    country = geo.country.toLowerCase();
                }

                player.setIp(result[2], country);

            }else{
                new Message(`There is no player with id ${result[1]}(setIp).`,'warning');
            }
        }
    }


    getOriginalConnection(name){

        name = name.toLowerCase();

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].name.toLowerCase() === name){
                return this.players[i];
            }
        }


        return null;
    }

    getOriginalConnectionById(id){

        id = parseInt(id);
        
        const name = this.getPlayerNameById(id);

        if(name !== null){

            return this.getOriginalConnection(name);
        }

        return null;

    }

    displayDebugDuplicates(){

        const names = [];

        this.players.forEach((player, key) =>{

            //console.log(`${value} ${key} `);

            if(names.indexOf(player.name) === -1){
                names.push(player.name);
            }else{
                new Message(`Found duplicate for player ${player.name}`,'note');
            }

        });
    }


    mergePlayer(master, duplicate){

       
        master.connects.push(...duplicate.connects);
        master.disconnects.push(...duplicate.disconnects);
        master.teams.push(...duplicate.teams);
        // master.weaponStats.push(...duplicate.weaponStats);

        for(const c in master.stats.sprees){
            master.stats.sprees[c] += duplicate.stats.sprees[c];
        }


        for(const c in master.stats.multis){
            master.stats.multis[c] += duplicate.stats.multis[c];
        }

        for(const c in master.stats.ctf){
            master.stats.ctf[c] += duplicate.stats.ctf[c];
        }

        /*for(const c in master.stats.dom){
            master.stats.dom[c] += duplicate.stats.dom[c];
        }*/

        const higherBetter = [
            'bestSpree',
            'bestMulti',
            'bestspawnkillspree',
            'longesttimebetweenkills',
        ];

        const lowerBetter = [
            'shortesttimebetweenkills'
        ];

        const combine = [
            'spawnkills',
            'score',
            'frags',
            'kills',
            'deaths',
            'suicides',
            'teamkills',
            'time_on_server'
        ];

        for(const c in master.stats){
           // console.log(c);

            if(c !== 'sprees' && c !== 'multis'){

                if(higherBetter.indexOf(c) !== -1){

                    if(duplicate.stats[c] > master.stats[c]){
                        master.stats[c] = duplicate.stats[c];
                    }

                }else if(lowerBetter.indexOf(c) !== -1){

                    if(duplicate.stats[c] < master.stats[c]){
                        master.stats[c] = duplicate.stats[c];
                    }

                }else if(combine.indexOf(c) !== -1){

                    if(this.bLastManStanding && c === 'score'){      
                        //dont want players that left the match or started late to win
                       // master.stats[c].score = 0;
                        //master.stats[c].frags = 0;           
                        new Message(`Skipping score merge for LMS game for player ${master.name}.`, 'note');
                        //continue;
                    }else{
                        master.stats[c] += duplicate.stats[c];
                    }

                }
            }
        }

        if(master.stats.firstBlood === 1 || duplicate.stats.firstBlood === 1){
            master.stats.firstBlood = 1;
        }


        //weapon stats

        //console.log(master);

        let currentWeapon = 0;

        //console.log(master.weaponStats);

        let mergedStats = 0;

        for(const [key, value] of duplicate.weaponStats){

            //console.log(key,value);

            if(master.weaponStats.has(key)){

                currentWeapon = master.weaponStats.get(key);


                mergedStats = new WeaponStats(key);

                mergedStats.kills = currentWeapon.kills + value.kills;
                mergedStats.deaths = currentWeapon.deaths + value.deaths;
                mergedStats.shots = currentWeapon.shots + value.shots;
                mergedStats.hits = currentWeapon.hits + value.hits;
                mergedStats.damage = currentWeapon.damage + value.damage;

                if(mergedStats.hits > 0 && mergedStats.shots > 0){
                    mergedStats.accuracy = mergedStats.hits / mergedStats.shots;
                }else{

                    if(mergedStats.hits == 0){
                        mergedStats.accuracy = 0;
                    }else if(mergedStats.hits > 0){
                        mergedStats.accuracy = 100;
                    }
                }

                mergedStats.accuracy *= 100;

                master.weaponStats.set(key, mergedStats);
 
            }else{
                currentWeapon = new WeaponStats(key);
                currentWeapon.kills = value.kills;
                currentWeapon.deaths = value.deaths;
                currentWeapon.accuracy = value.accuracy;
                currentWeapon.shots = value.shots;
                currentWeapon.hits = value.hits;
                currentWeapon.damage = value.damage;
                master.weaponStats.set(key, currentWeapon)
            }

        }

        
       // console.log(duplicate.weaponStats);

       // console.log(master.weaponStats);

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

        let d = 0;

        let result = 0;
        let player = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);

            if(result !== null){

                player = this.getPlayerById(parseInt(result[4]));

                if(player !== null){

                    player.setWeaponStat(result[3], result[2], result[5]);

                }else{
                    new Message(`Player with id ${result[4]} does not exist.`,'warning');
                }

                //console.log(result);
            }
        }

       // this.debugDisplayPlayerStats();
    }


    async setPlayerIds(gametypeId){

        try{

            let currentId = 0;

            for(let i = 0; i < this.players.length; i++){

                currentId = await Player.getNameId(this.players[i].name, gametypeId, true);

                this.players[i].masterId = currentId.totalId;
                this.players[i].gametypeId = currentId.gametypeId;

            }


        }catch(err){
            new Message(`Problem setting player id ${err}`,'error');
        }

    }

    async updateFragPerformance(gametypeId){

        try{

            let p = 0;


            //get current gametype id here
            

            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];

                

                
                if(p.bDuplicate === undefined){

                    //update combined gametypes totals
                    await Player.updateFrags(
                        p.masterId, 
                        p.stats.time_on_server, 
                        p.stats.score, 
                        p.stats.frags, 
                        p.stats.kills, 
                        p.stats.deaths, 
                        p.stats.suicides, 
                        p.stats.teamkills,
                        p.stats.spawnkills,
                        p.stats.multis,
                        p.stats.bestMulti,
                        p.stats.sprees,
                        p.stats.bestSpree,
                        p.stats.fastestKill,
                        p.stats.slowestKill,
                        p.stats.bestspawnkillspree,
                        p.stats.firstBlood,
                        0
                    );

                    //update gametype specific totals
                    await Player.updateFrags(
                        p.gametypeId, 
                        p.stats.time_on_server, 
                        p.stats.score, 
                        p.stats.frags, 
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
                        gametypeId
                    );
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

            let p = 0;

            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];

                if(p.bDuplicate === undefined){

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

            mysql.query(query, [ip,country, id], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }

    async setIpCountry(){

        try{

            let p = 0;

            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];

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

            let p = 0;

            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];

                if(p.bDuplicate === undefined){

                    await Player.updateWinStats(p.masterId, p.bWinner, p.bDrew);
                    await Player.updateWinStats(p.gametypeId, p.bWinner, p.bDrew, gametypeId);
                }
            }

        }catch(err){
            console.log(err);
        }
    }

    setPlayerSpawns(){

        let p = 0;

        for(let i = 0; i < this.players.length; i++){

            p = this.players[i];
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

            let p = 0;

            const data = {};

            for(let i = 0; i < this.players.length; i++){
                
                p = this.players[i];

                if(data[p.voice] === undefined){
                    data[p.voice] = 1;
                }else{
                    data[p.voice]++;
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

            let p = 0;


            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];

                if(p.bDuplicate === undefined){

                    //console.log(p);
                    p.matchId = await Player.insertMatchData(p, matchId, gametypeId, mapId, matchDate);
                    
                }else{
                    new Message(`${p.name} is a duplicate not inserting match data.`,'note');
                }
            }

            //console.log(this.players);

        }catch(err){
            new Message(`insertMatchData ${err}`,'error');
        }
    }


    async updateWeaponStats(){

        try{

            let p = 0;

            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];

            }

        }catch(err){
            new Message(`updateWeaponStats ${err}`,'error');
        }
    }


    async insertConnectionData(matchId){

        try{

            this.connectionsManager.parseData(this);

            await this.connectionsManager.insertData(matchId);

        }catch(err){
            new Message(`PlayerManager.inserConnectionData ${err}`,'error');
        }
    }

    parseTeamChanges(){

        const data = [];

        const reg = /^(\d+?\.\d+?)\tplayer\tteamchange\t(.+?)\t(.+)$/i;

        let d = 0;
        let result = 0;
        let currentPlayer = 0;

        for(let i = 0; i < this.teamChanges.length; i++){

            d = this.teamChanges[i];

            result = reg.exec(d);

            if(result !== null){

                currentPlayer = this.getOriginalConnectionById(parseInt(result[2]));

                if(currentPlayer !== null){
                    data.push({
                        "timestamp": parseFloat(result[1]),
                        "player": currentPlayer.masterId,
                        "team": parseInt(result[3])
                    });
                }else{
                    new Message(`PlayerManager.parseTeamChanges Can't find original connection for player with id ${result[2]}`,'warning');
                }
            }
        }

        this.teamChanges = data;
    }

    insertTeamChange(match, time, player, team){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_match_team_changes VALUES(NULL,?,?,?,?)";

            mysql.query(query, [match, time, player, team], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertTeamChanges(matchId){

        try{

            let t = 0;

            for(let i = 0; i < this.teamChanges.length; i++){

                t = this.teamChanges[i];

                await this.insertTeamChange(matchId, t.timestamp, t.player, t.team);
            }

        }catch(err){
            new Message(`PlayerManager.insertTeamChanges() ${err}`,'error');
        }
    }
}

module.exports = PlayerManager;