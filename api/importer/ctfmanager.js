const CTF = require("../ctf");
const Message = require("../message");
const CTFFlag = require("./ctfflag");

class CTFManager{

    constructor(){

        this.bHaveNStatsData = false;

        this.lines = [];

        this.flagKills = [];
        this.flagReturns = [];
        this.flagTaken = [];

        this.flags = [];

        this.ctf = new CTF();
    }


    createFlags(){

        for(let i = 0; i < this.totalTeams; i++){
            this.flags.push(new CTFFlag(this.ctf, this.matchId, i));
        }   
    }

    getLineTimestamp(line){

        const timestampReg = /^(\d+?\.\d+?)\t.+$/i;

        const timestampResult = timestampReg.exec(line);

        if(timestampResult === null){

            new Message(`Timestamp regular expression failed.`,"error");
            return null;
        }

        return parseFloat(timestampResult[1]);
    }

    getLineType(line){

        const typeReg = /\d+?\.\d+?\t(.+?)\t.+/i;

        const result = typeReg.exec(line);

        if(result === null){

            new Message(`Event type regular expression failed.`,"error");
            return null;
        }

        return result[1];
    }


    getLineNstatsType(line){

        const reg = /\d+?\.\d+?\tnstats\t(.+?)\t.+/i;

        const result = reg.exec(line);

        if(result === null) return null;

        return result[1];
    }


    async createNstatsFlagKill(timestamp, data){

        const killerId = parseInt(data[1]);
        const victimId = parseInt(data[2]);

        const killDistance = parseFloat(data[3]);
        const distanceToEnemyBase = parseFloat(data[4]);
        const distanceToCap = parseFloat(data[5]);

        const killer = this.playerManager.getOriginalConnectionById(killerId);
        const victim = this.playerManager.getOriginalConnectionById(victimId);

        if(killer !== null && victim !== null){

            if(killer.masterId === victim.masterId){        
                new Message("flag suicide", "note");

                killer.stats.ctf.suicide++;
            }else{
                killer.stats.ctf.kill++;
            }

        }

        if(victim !== null){
            
            const victimTeam = this.playerManager.getPlayerTeamAt(victimId, timestamp);
            await this.flags[victimTeam].killed(timestamp, killer.masterId);
        }

    }


    async createFlagKill(timestamp, line){

        const smartCTFReg = /^\d+?\.\d+?\tflag_kill\t(\d+)$/i;
        const nstatsCTFReg = /^\d+?\.\d+?\tnstats\tflag_kill\t(\d+?)\t(\d+?)\t(.+?)\t(.+?)\t(.+?)$/i;

        if(smartCTFReg.test(line)){

            const result = smartCTFReg.exec(line);          

            const playerId = parseInt(result[1]);

            const player = this.playerManager.getOriginalConnectionById(playerId);

            if(player === null){
                new Message(`CreateFlagKill player is null`,"error");
                return;
            }

            player.stats.ctf.kill++;
        }

        if(nstatsCTFReg.test(line)){

            const result = nstatsCTFReg.exec(line);

            if(result !== null){
                await this.createNstatsFlagKill(timestamp, result);
            }
        }  
    }

    async createFlagTaken(timestamp, line){

        const reg = /^.+?\tflag_taken\t(\d+?)\t(\d+)$/;

        const result = reg.exec(line);

        if(result === null){
            new Message(`Flag Taken regular expression failed`,"error");
            return null;
        }

        const playerId = parseInt(result[1]);
        const flagTeam = parseInt(result[2]);

        const player = this.playerManager.getOriginalConnectionById(playerId);

        if(player === null){
            new Message(`createFlagTaken player is null.`,"error");
            return;
        }

        player.stats.ctf.taken++;

        await this.flags[flagTeam].taken(timestamp, player.masterId);

    }


    async createFlagReturned(timestamp, line){

        const reg = /^.+?\tflag_(.+?)\t(\d+?)\t(\d+)$/;

        const result = reg.exec(line);

        if(result === null){
            new Message(`createFlagReturned regular expression failed.`);
            return;
        }

        const type = result[1].toLowerCase();

        const playerId = parseInt(result[2]);
        const flagTeam = parseInt(result[3]);

        const player = this.playerManager.getOriginalConnectionById(playerId);

        if(player === null){
            new Message(`createFlagReturned player is null`,"error");
            return;
        }

        player.stats.ctf.return++;

        if(type === "return_closesave") player.stats.ctf.save++;
        if(type === "return_enemybase") player.stats.ctf.returnEnemyBase++;
        if(type === "return_mid") player.stats.ctf.returnMid++;
        if(type === "return_base") player.stats.ctf.returnBase++;

        await this.flags[flagTeam].returned(timestamp, player.masterId);
    }

    async createFlagDropped(timestamp, line){

        const reg = /^.+?\tflag_dropped\t(\d+?)\t(\d+)$/;

        const result = reg.exec(line);

        if(result === null){
            new Message(`createFlagReturned regular expression failed.`);
            return;
        }

        const playerId = parseInt(result[1]);

        const player = this.playerManager.getOriginalConnectionById(playerId);

        if(player === null){
            new Message(`createFlagReturned player is null`,"error");
            return;
        }

        //await this.flags[flagTeam].dropped(timestamp);

        //for 4 way CTF
        await this.dropAllFlags(player, timestamp);

    }

    async createFlagCover(timestamp, line){

        const reg = /^\d+?\.\d+?\tflag_cover\t(\d+?)\t(\d+?)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){
            new Message(`createFlagCover regular expression failed.`);
            return;
        }

        const killerId = parseInt(result[1]);
        //const victimId = parseInt(result[2]);
        const killerTeam = parseInt(result[3]);

        const killer = this.playerManager.getOriginalConnectionById(killerId);

        if(killer === null){
            new Message(`createFlagCover killer is null`,"error");
            return;
        }

        killer.stats.ctf.cover++;

        await this.flags[killerTeam].cover(timestamp, killer.masterId);

    }

    async createFlagPickedUp(timestamp, line){

        const reg = /^\d+?\.\d+?\tflag_pickedup\t(\d+?)\t(\d+)$/i;

        const result = reg.exec(line);

        if(result === null){
            new Message(`createFlagPickedup regular expression failed.`);
            return;
        }

        const playerId = parseInt(result[1]);
        const flagTeam = parseInt(result[2]);


        const holder = this.playerManager.getOriginalConnectionById(playerId);

        if(holder === null){
            new Message(`createFlagPickedUp flag holder is null`,"error");
            return;
        }

        holder.stats.ctf.pickup++;

        await this.flags[flagTeam].pickedUp(timestamp, holder.masterId);
    }

    async parseData(matchStartTimestamp){

        this.matchStartTimestamp = matchStartTimestamp;

        const returnTypes = [
            "flag_returned", 
            "flag_return_mid",
            "flag_return_base",
            "flag_return_enemybase",
            "flag_return_closesave"
        ];
   
        for(let i = 0; i < this.lines.length; i++){

            const line = this.lines[i];

            const timestamp = this.getLineTimestamp(line);

            if(timestamp === null) continue;

            if(timestamp < matchStartTimestamp){

                new Message(`CTF event happened before match start timestamp(Warmup)`,"warning");
                continue;
            }

            const eventType = this.getLineType(line);

            if(eventType === null) continue;

            if(eventType === "nstats"){

                const nstatsType = this.getLineNstatsType(line);

                if(nstatsType === null) continue;

                console.log(`nstatsType = ${nstatsType}`);

                if(nstatsType === "flag_kill"){

                    await this.createFlagKill(timestamp, line);
                }
            }

            if(eventType === "flag_kill"){

                if(!this.bHaveNStatsData){

                    await this.createFlagKill(timestamp, line);
                }
            }

            if(eventType === "flag_taken"){

                await this.createFlagTaken(timestamp, line);
            }

            if(returnTypes.indexOf(eventType) !== -1){
                await this.createFlagReturned(timestamp, line);
            }

            if(eventType === "flag_dropped"){
                await this.createFlagDropped(timestamp, line);
            }

            if(eventType === "flag_cover"){
                await this.createFlagCover(timestamp, line);
            }

            if(eventType === "flag_pickedup"){
                await this.createFlagPickedUp(timestamp, line);
            }

            console.log(line);
        }

        this.debugDisplayAllPlayers();
    }

    debugDisplayAllPlayers(){

        for(let i = 0; i < this.playerManager.players.length; i++){

            const p = this.playerManager.players[i];

            console.log(p.name);
            console.log(p.stats.ctf);
        }
    }

    async dropAllFlags(player, timestamp){

        for(let i = 0; i < this.flags.length; i++){

            const flag = this.flags[i];

            if(flag.carriedBy === player.masterId){

                await flag.dropped(timestamp);

                player.stats.ctf.dropped++;
            }
        }
    }
}

module.exports = CTFManager;