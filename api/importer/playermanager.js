const PlayerInfo = require('./playerinfo');
const Message = require('../message');
const geoip = require('geoip-country');
const P = require('../player');
const Player = new P();
const Faces = require('../faces');

class PlayerManager{


    constructor(data){

        this.data = data;

        this.players = [];
        this.uniqueNames = [];
        this.duplicateNames = [];
        this.orginalIds = new Map();
    

        this.faces = new Faces();

        this.createPlayers();
        this.setNStatsValues();
        this.parsePlayerStrings();
        this.setWeaponStats();


        //this.displayDebugDuplicates();
        

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

    parsePlayerStrings(){

        let d = 0;
        let result = 0;
        let type = 0;
        let player = 0;

        const reg = /^(\d+\.\d+)\tplayer\t(.+?)\t(.+)$/i;
        const statReg = /^\d+\.\d+\tstat_player\t(.+?)\t(.+?)\t(.+)$/i;

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

        let type = 0;
        let result = 0;
        let d = 0;
        let player = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);

          //  console.log(result);

            if(result !== null){
                type = result[2].toLowerCase();
               // console.log(`type = ${type}`);

                if(type === 'face' || type === 'voice' || type === 'netspeed'){
                    this.setPlayerFeature(d);
                }else{

                    result = secondReg.exec(result[3]);

                    if(result !== null){

                        player = this.getPlayerById(result[1]);

                        if(player !== null){

                            player.setStatsValue(type, result[2], true);
                        }
                       // console.log(result);
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

        for(let i = 0; i < kills.length; i++){

            k = kills[i];

            //console.log(k);

            if(k.type == 'kill'){

                killer = this.getPlayerById(k.killerId);
                victim = this.getPlayerById(k.victimId);

                if(killer !== null){
                    killer.killedPlayer(k.timeStamp, k.killerWeapon);
      
                }

                if(victim !== null){
                    victim.died(k.timeStamp);
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

        this.players.forEach((player, key) =>{

            //console.log(player);
            if(player.name.toLowerCase() === name){
                console.log(player);
            }
        });

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
            'time_on_server',
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

                    master.stats[c] += duplicate.stats[c];
                }
            }
        }

    }

    async mergeDuplicates(){

        console.log('MERGE DUPLCIATES');


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
                            this.mergePlayer(this.players[originalIndex], this.players[x]);
                            this.players[x].bDuplicate = true;
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


    async setPlayerIds(){

        try{

            let currentId = 0;

            for(let i = 0; i < this.players.length; i++){

                currentId = await Player.getNameId(this.players[i].name,true);
                this.players[i].masterId = currentId;

            }


        }catch(err){
            new Message(`Problem setting player id ${err}`,'warning');
        }

    }

    async updateFragPerformance(){

        try{

            let p = 0;

            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];
                
                if(p.bDuplicate === undefined){
                    await Player.updateFrags(
                        p.masterId, 
                        p.stats.time_on_server, 
                        p.stats.score, 
                        p.stats.frags, 
                        p.stats.kills, 
                        p.stats.deaths, 
                        p.stats.suicides, 
                        p.stats.teamkills
                    );
                }
            }

        }catch(err){
            new Message(err, 'error');
        }
    }

    async updateFaceStats(date){

        try{

            new Message(`Starting face stats update`,'note');

            const usageData = {};

            let p = 0;

            for(let i = 0; i < this.players.length; i++){

                p = this.players[i];

                if(p.bDuplicate === undefined){

                    if(usageData[p.face] === undefined){
                        usageData[p.face] = 1;
                    }else{
                        usageData[p.face]++;
                    }
                }
              
            }


            for(const c in usageData){
                await this.faces.update(c, usageData[c], date);
            }

        }catch(err){
            new Message(`Failed to updateFaceStats ${err}`,'warning');
        }

    }

}

module.exports = PlayerManager;