const Kill =  require('./kill');
const Message = require('../message');
const KillsManager = require('../kills');
const Headshots = require('../headshots');

class KillManager{

    constructor(data, playerManager, bIgnoreBots, matchTimings){

        this.data = data;
        this.kills = [];
        this.headshots = [];
        this.bIgnoreBots = bIgnoreBots;

        this.matchTimings = matchTimings;

        this.playerManager = playerManager;

        this.killsManager = new KillsManager();
        this.headshotsManager = new Headshots();

        this.killNames = [];
        this.parseData();
       // console.table(this.kills);

    }   


    parseKill(result){

        const timestamp = parseFloat(result[1]);

        if(timestamp < this.matchTimings.start){
            new Message(`Kill happened before match start ignoring.(Warmpup)`,"note");
            return;
        }

        if(this.killNames.indexOf(result[4]) === -1){
            this.killNames.push(result[4]);
        }

        const killerId = parseInt(result[3]);
        const killer = this.playerManager.getPlayerById(killerId);

        const victimId = parseInt(result[5]);
        const victim = this.playerManager.getPlayerById(victimId);

        let type = result[2];

        if(type === "teamkill") type = "kill";

        const kill = new Kill(result[1], type, killer.masterId ?? -1, result[4], victim.masterId ?? -1, result[6], result[7]);
        
        this.kills.push(kill);     
    }

    parseDistance(result){

        const timestamp = parseFloat(result[1]);

        if(timestamp < this.matchTimings.start){
            new Message(`Kill(Distance) happened before match start ignoring.(Warmpup)`,"note");
            return;
        }

        this.setDistance(result[1], result[2], result[3], result[4]);
    }

    parseHeadshot(result){
 
        const timestamp = parseFloat(result[1]);

        if(timestamp < this.matchTimings.start){
            new Message(`headshot happened before match start ignoring.(Warmpup)`,"note");
            return;
        }

        const killer = this.playerManager.getPlayerById(parseInt(result[2]));
        const victim = this.playerManager.getPlayerById(parseInt(result[3]));

        this.headshots.push({
            "timestamp": parseFloat(result[1]),
            "killer": killer.masterId ?? -1,
            "victim": victim.masterId ?? -1
        });
    }

    parseSuicide(result){

        const victim = this.playerManager.getPlayerById(parseInt(result[2]));

        this.kills.push(new Kill(result[1], 'suicide', victim.masterId ?? -1, result[3], -1, null, result[4]));
    }

    parseLocation(result){

        const timestamp = parseFloat(result[1]);

        if(timestamp < this.matchTimings.start){
            new Message(`Kill(Location) happened before match start ignoring.(Warmpup)`,"note");
            return;
        }

        const killer = this.playerManager.getPlayerById(parseInt(result[2]));
        const victim = this.playerManager.getPlayerById(parseInt(result[6]));

        this.setLocations(
            result[1],
            killer.masterId ?? -1,
            {
                "x": result[3],
                "y": result[4],
                "z": result[5],
            },
            victim.masterId ?? -1,
            {
                "x": result[7],
                "y": result[8],
                "z": result[9]
            }
        );
    }

    parseData(){
        
        const killReg = /^(\d+\.\d+)\t(kill|teamkill)\t(\d+?)\t(.+?)\t(\d+?)\t(.+?)\t(.+)$/i;
        const suicideReg = /^(\d+\.\d+)\tsuicide\t(.+?)\t(.+?)\t(.+?)\t(.+)$/i;
        const distanceReg = /^(\d+\.\d+)\tnstats\tkill_distance\t(.+?)\t(\d+?)\t(\d+)$/i;
        const locationReg = /^(\d+\.\d+)\tnstats\tkill_location\t(\d+?)\t(.+?),(.+?),(.+?)\t(\d+?)\t(.+?),(.+?),(.+)$/i;
        const headshotReg = /^(\d+\.\d+)\theadshot\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            if(killReg.test(d)){

                this.parseKill(killReg.exec(d));         

            }else if(distanceReg.test(d)){

                this.parseDistance(distanceReg.exec(d));

            }else if(locationReg.test(d)){

                this.parseLocation(locationReg.exec(d));

            }else if(suicideReg.test(d)){

                this.parseSuicide(suicideReg.exec(d));

            }else if(headshotReg.test(d)){
            
                this.parseHeadshot(headshotReg.exec(d));

            }
        }

    }


    getMatchingKill(timestamp, killer, victim){


        timestamp = parseFloat(timestamp);
        killer = parseInt(killer);
        victim = parseInt(victim);

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            if(k.timestamp > timestamp) return null;

            if(k.timestamp === timestamp && k.killerId === killer && k.victimId === victim){
                return k;
            }
        }

        return null;
    }

    //mainly for utstats flag_Kill...
    getMatchingKillNoVictim(timestamp, killerId){

        timestamp = parseFloat(timestamp);
        killerId = parseInt(killerId);

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            if(k.timestamp < timestamp) continue;
            if(k.timestamp > timestamp) break;

            if(k.killerId === killerId) return k;
        }

        return null;
    }


    setDistance(timestamp, distance, killerId, victimId){

        const killer = this.playerManager.getPlayerById(killerId);
        const victim = this.playerManager.getPlayerById(victimId);
        
        const kill = this.getMatchingKill(timestamp, killer.masterId, victim.masterId);

        if(kill !== null){
            kill.setDistance(distance);
        }else{
            if(killer.masterId !== victim.masterId){
                new Message(`There is no matching kill for ${killer.masterId} -> ${victim.masterId} @ ${timestamp}(setDistance).`,'warning');
            }
        }
    }

    setLocations(timeStamp, killerId, killerLocation, victimId, victimLocation){


        const kill = this.getMatchingKill(timeStamp, killerId, victimId);

        if(kill !== null){

            kill.setLocations(killerLocation, victimLocation);

        }else{
            if(killerId !== victimId){
                new Message(`There is no matching kill for ${killerId} -> ${victimId} @ ${timeStamp}(setLocations).`,'warning');
            }
        }
    }


    getCurrentKills(timestamp){

        let found = 0;

        for(let i = 0; i < this.kills.length; i++){

            if(this.kills[i].timestamp <= timestamp){
                found++;
            }else{
                break;
            }
        }

        return found;
    }

    async insertKills(matchId, weaponsManager){

        try{

            let currentKiller = 0;
            let currentVictim = 0;
            let currentKillerTeam = 0;
            let currentVictimTeam = 0;
            let currentKillerWeapon = 0;
            let currentVictimWeapon = 0;

            for(let i = 0; i < this.kills.length; i++){

                const k = this.kills[i];

                currentKiller = this.playerManager.getPlayerByMasterId(k.killerId);

                if(k.victimId !== -1){
                    currentVictim = this.playerManager.getPlayerByMasterId(k.victimId);
                }else{
                    currentVictim = currentKiller;
                }
                
                if(this.bIgnoreBots){

                    if(currentKiller !== null){
                        if(currentKiller.bBot) continue;
                    }

                    if(currentVictim !== null){
                        if(currentVictim.bBot) continue;
                    }
                }
                

                currentKillerTeam = this.playerManager.getPlayerTeamAt(k.killerId, k.timestamp);
                currentVictimTeam =  this.playerManager.getPlayerTeamAt(k.victimId, k.timestamp);

                currentKillerWeapon = weaponsManager.weapons.getSavedWeaponByName(k.killerWeapon);

                if(k.victimId !== -1){
                    currentVictimWeapon = weaponsManager.weapons.getSavedWeaponByName(k.victimWeapon);
                }else{
                    currentVictimWeapon = null;
                }


                if(currentKillerWeapon === null) currentKillerWeapon = 0;
                if(currentVictimWeapon === null) currentVictimWeapon = 0;

                if(currentKiller === null){
                    currentKiller = {"masterId": 0};
                }

                if(currentVictim === null){
                    currentVictim = {"masterId": 0};
                }

                //console.log(currentKiller);
                await this.killsManager.insert(
                    matchId, 
                    k.timestamp, 
                    currentKiller.masterId, 
                    currentKillerTeam, 
                    currentVictim.masterId, 
                    currentVictimTeam, 
                    currentKillerWeapon, 
                    currentVictimWeapon, 
                    (k.killDistance != null) ? k.killDistance : 0
                );

            }

        }catch(err){
            console.trace(err);
            new Message(`KillManager.insertKills() ${err}`,'error');
        }
    }


    async insertHeadshots(matchId){

        try{

            if(this.headshots.length > 0){

                let currentKillInformation = 0;
                let currentKiller = 0;
                let currentVictim = 0;
                let killerTeam = 0;
                let victimTeam = 0;


                for(let i = 0; i < this.headshots.length; i++){

                    const h = this.headshots[i];

                    currentKillInformation = this.getMatchingKill(h.timestamp, h.killer, h.victim);

                    if(currentKillInformation === null){
                        new Message(`KillManager.insertHeadshots() currentKillInformation is null`,"warning");
                        currentKillInformation = {"killDistance": -1};
                    }

                    currentKiller = this.playerManager.getPlayerByMasterId(h.killer);
                    currentVictim = this.playerManager.getPlayerByMasterId(h.victim);

                    if(currentVictim !== null){

                        if(this.bIgnoreBots){
                            if(currentVictim.bBot) continue;
                        }

                    }else{
                        currentVictim = {"masterId": -1};
                    }

                    if(currentKiller !== null){

                        if(this.bIgnoreBots){
                            if(currentKiller.bBot) continue;
                        }
                        
                    }else{
                        currentKiller = {"masterId": -1};
                    }

                    killerTeam = this.playerManager.getPlayerTeamAt(h.killer, h.timestamp);
                    victimTeam = this.playerManager.getPlayerTeamAt(h.victim, h.timestamp);

                    await this.headshotsManager.insert(
                        matchId, h.timestamp, currentKiller.masterId, currentVictim.masterId, 
                        currentKillInformation.killDistance, killerTeam, victimTeam
                    );
                }

                new Message(`Imported ${this.headshots.length} headshot data.`, 'pass');

            }else{
                new Message(`Skipping headshots import, no data.`,'note');
            }

        }catch(err){
            new Message(`killManager.insertHeadshots() ${err}`,'error');
        }
    }

    getTotalEventsByPlayerBetween(start, end, eventType){

        const players = {};

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            if(k.timestamp > end) break;
            if(k.timestamp < start) continue;
            if(k.type !== eventType) continue;

            const playerId = k.killerId;

            if(players[playerId] === undefined){
                players[playerId] = 0;
            }

            players[playerId]++;

        }

        return players;
    }


    getKillsBetween(start, end, killer, bOnlyCount){

        const found = [];

        if(bOnlyCount === undefined) bOnlyCount = false;

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            if(k.timestamp >= start && k.timestamp <= end){

                if(k.killerId === killer && k.victimId !== killer && k.victimId !== -1){
                    found.push(k);
                }

            }else if(k.timestamp > end){

                break;
            }
        }

        if(bOnlyCount){
            return found.length;
        }else{
            return found;
        }
    }

    /**
     * 
     * @param {*} start 
     * @param {*} end 
     * @param {*} victim masterId
     * @returns total deaths in timeframe
     */
    getDeathsBetween(start, end, victim, bMonsterHunt){

        let found = 0;
        let currentVictim = 0;

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];
            
            if(k.timestamp > end) break;
            if(k.timestamp < start) continue;

            if(k.type === "kill"){

                currentVictim = this.playerManager.getPlayerByMasterId(k.victimId);

                if(currentVictim !== null){

                    if(currentVictim.masterId === victim) found++;

                }else{
                    new Message(`KillManager.getDeathsBetween() currentVictim is null`,'warning');
                }
            }

            if(k.type === "suicide" && bMonsterHunt === undefined){

                currentVictim = this.playerManager.getPlayerByMasterId(k.killerId);

                if(currentVictim !== null){

                    if(currentVictim.masterId === victim) found++;

                }else{
                    new Message(`KillManager.getDeathsBetween() currentVictim is null (suicide)`,'warning');
                }
            }


            //monsterhunt doesn't require the player master id, just the match id
            if(bMonsterHunt !== undefined){

                if(k.type === "suicide"){

                    if(k.timestamp >= start){

                        if(k.killerId === victim) found++;
                    }
                }
            }
        }

        return found;
    }

    getSuicidesBetween(start, end, victim){

        let suicides = 0;

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            const type = k.type;

            if(k.timestamp < start) continue;
            if(k.timestamp > end) break;

            if(type === "suicide"){
                if(k.killerId === victim) suicides++;
            }
        }

        return suicides;
    }

    getKillsByTeamBetween(teamId, start, end){

        let totalKills = 0;

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            if(k.timestamp > end) break;
            if(k.timestamp < start) continue;
            if(k.type !== "kill") continue;

            const killerTeam = this.playerManager.getPlayerTeamAt(k.killerId, k.timestamp);

            if(killerTeam === teamId) totalKills++;
        }

        return totalKills;
    }

    getSuicidesByTeamBetween(teamId, start, end){

        let totalSuicides = 0;

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            if(k.timestamp > end) break;
            if(k.timestamp < start) continue;
            if(k.type !== "suicide") continue;

            const victimTeam = this.playerManager.getPlayerTeamAt(k.killerId, k.timestamp);

            if(victimTeam === teamId) totalSuicides++;
        }

        return totalSuicides;
    }

    getPlayerNextDeath(playerId, timestamp){

        for(let i = 0; i < this.kills.length; i++){

            const k = this.kills[i];

            if(k.timestamp < timestamp) continue;

            if(k.type === "suicide" && k.killerId === playerId){
                return k;
            }

            if(k.type === "kill" && k.victimId === playerId){
                return k;
            }
        }

        return null;
    }
}


module.exports = KillManager;