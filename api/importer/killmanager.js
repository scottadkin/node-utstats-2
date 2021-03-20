const Kill =  require('./kill');
const Message = require('../message');
const KillsManager = require('../kills');
const Headshots = require('../headshots');

class KillManager{

    constructor(data, playerManager){

        this.data = data;
        this.kills = [];
        this.headshots = [];

        this.playerManager = playerManager;

        this.killsManager = new KillsManager();
        this.headshotsManager = new Headshots();

        this.killNames = [];
        this.parseData();
       // console.table(this.kills);

    }   


    parseData(){
        
        const killReg = /^(\d+\.\d+)\t(kill|teamkill)\t(\d+?)\t(.+?)\t(\d+?)\t(.+?)\t(.+)$/i;
        const suicideReg = /^(\d+\.\d+)\tsuicide\t(.+?)\t(.+?)\t(.+?)\t(.+)$/i;
        const distanceReg = /^(\d+\.\d+)\tnstats\tkill_distance\t(.+?)\t(\d+?)\t(\d+)$/i;
        const locationReg = /^(\d+\.\d+)\tnstats\tkill_location\t(\d+?)\t(.+?),(.+?),(.+?)\t(\d+?)\t(.+?),(.+?),(.+)$/i;
        const headshotReg = /^(\d+\.\d+)\theadshot\t(.+?)\t(.+)$/i;

        let result = '';
        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(killReg.test(d)){

                result = killReg.exec(d);

                if(this.killNames.indexOf(result[4]) === -1){
                    this.killNames.push(result[4]);
                }

                this.kills.push(new Kill(result[1], result[2], result[3], result[4], result[5], result[6], result[7]));              

            }else if(distanceReg.test(d)){

                result = distanceReg.exec(d);

                this.setDistance(result[1], result[2], result[3], result[4]);

            }else if(locationReg.test(d)){

                result = locationReg.exec(d);

                this.setLocations(
                    result[1],
                    result[2],
                    {
                        "x": result[3],
                        "y": result[4],
                        "z": result[5],
                    },
                    result[6],
                    {
                        "x": result[7],
                        "y": result[8],
                        "z": result[9]
                    }
                );

            }else if(suicideReg.test(d)){

                result = suicideReg.exec(d);
                this.kills.push(new Kill(result[1], 'suicide', result[2], result[3], -1, null, result[4]));

            }else if(headshotReg.test(d)){
                
                result = headshotReg.exec(d);

                this.headshots.push({
                    "timestamp": parseFloat(result[1]),
                    "killer": parseInt(result[2]),
                    "victim": parseInt(result[3])
                });
            }else{
                console.log(d);
            }
        }

    }


    getMatchingKill(timestamp, killer, victim){


        timestamp = parseFloat(timestamp);
        killer = parseInt(killer);
        victim = parseInt(victim);

        let k = 0;

        for(let i = 0; i < this.kills.length; i++){

            k = this.kills[i];

            if(k.timestamp === timestamp && k.killerId === killer && k.victimId === victim){

                return k;
            }
        }

        return null;
    }


    setDistance(timestamp, distance, killer, victim){

        const kill = this.getMatchingKill(timestamp, killer, victim);

        if(kill !== null){
            kill.setDistance(distance);
        }else{
            if(killer !== victim){
                new Message(`There is no matching kill for ${killer} -> ${victim} @ ${timestamp}(setDistance).`,'warning');
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

            //console.log(weaponsManager.weapons);
            let k = 0;

            let currentKiller = 0;
            let currentVictim = 0;
            let currentKillerTeam = 0;
            let currentVictimTeam = 0;
            let currentKillerWeapon = 0;
            let currentVictimWeapon = 0;

            for(let i = 0; i < this.kills.length; i++){

                k = this.kills[i];
                //make a cache of playerIds 
                currentKiller = this.playerManager.getOriginalConnectionById(k.killerId);
                currentVictim = this.playerManager.getOriginalConnectionById(k.victimId);

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

                let h = 0;
                let currentKillInformation = 0;
                let currentKiller = 0;
                let currentVictim = 0;
                let killerTeam = 0;
                let victimTeam = 0;


                for(let i = 0; i < this.headshots.length; i++){

                    h = this.headshots[i];

                    currentKillInformation = this.getMatchingKill(h.timestamp, h.killer, h.victim);

                    currentKiller = this.playerManager.getOriginalConnectionById(h.killer);
                    currentVictim = this.playerManager.getOriginalConnectionById(h.victim);

                    killerTeam = this.playerManager.getPlayerTeamAt(h.killer,h.timestamp);
                    victimTeam = this.playerManager.getPlayerTeamAt(h.victim,h.timestamp);

                    await this.headshotsManager.insert(
                        matchId, h.timestamp, currentKiller.masterId, currentVictim.masterId, 
                        currentKillInformation.killDistance, killerTeam, victimTeam);
                }

                new Message(`Imported ${this.headshots.length} headshot data.`, 'pass');

            }else{
                new Message(`Skipping headshots import, no data.`,'note');
            }

        }catch(err){
            new Message(`killManager.insertHeadshots() ${err}`,'error');
        }
    }


    getKillsBetween(start, end, killer){

        const found = [];

        let k = 0;

        for(let i = 0; i < this.kills.length; i++){

            k = this.kills[i];

            if(k.timestamp >= start && k.timestamp <= end){
                found.push(k);
            }else if(k.timestamp > end){

                break;
            }
        }

        return found;
    }
}


module.exports = KillManager;