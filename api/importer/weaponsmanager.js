import Weapons from "../weapons.js";
import Message from "../message.js";

export default class WeaponsManager{

    constructor(){

        this.weapons = new Weapons();
        this.data = [];
        this.names = [];

        this.currentWeapons = new Map();

    }

    parseData(){

        //console.log(this.data);

        const nameReg = /^\d+\.\d+\tweap_.+?\t(.+?)\t.+$/i;


        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            if(nameReg.test(d)){

                const result = nameReg.exec(d);

                if(this.names.indexOf(result[1]) === -1){
                    this.names.push(result[1]);
                }
            }
        }
    }

    addKillNames(names){

        for(let i = 0; i < names.length; i++){

            if(this.names.indexOf(names[i]) === -1){
                this.names.push(names[i]);
            }
        }
    }

    updatePlayerCurrentStats(stats, value, playtime){

        if(stats === undefined){
            new Message(`WeaponsManager.update() stats is undefined`,"error");
            process.exit();
        }


        stats.playtime += playtime;
        stats.kills += value.kills;
        stats.team_kills += value.teamKills;
        stats.deaths += value.deaths;
        stats.suicides += value.suicides;
        stats.shots += value.shots;
        stats.hits += value.hits;

        stats.efficiency = 0;

        if(stats.kills > 0){

            if(stats.deaths === 0){
                stats.efficiency = 100;
            }else{
                stats.efficiency = (stats.kills / (stats.kills + stats.deaths)) * 100
            }
        }

        stats.accuracy = 0;

        if(stats.hits > 0 && stats.shots > 0){

            stats.accuracy = (stats.hits / stats.shots) * 100;
        }

        stats.damage += Math.abs(value.damage);
        stats.matches += 1;
    }

    async update(playerManager){

        try{

            const playerMatchInsertVars = [];
            const updateTotalVars = [];

            const playerUsedWeapons = {};

            await this.weapons.getIdsByName(this.names);

            const weaponIds = this.weapons.weaponNames.map((w) =>{
                return w.id;
            });

            const playerIds = playerManager.players.map((p) =>{
                return p.masterId;
            });

      
            const missingPlayerTotalData = await this.weapons.getMissingPlayerWeaponTotals(0, 0, weaponIds, playerIds);
           // const missingPlayerGamtypeTotalData = await this.weapons.getMissingPlayerWeaponTotals(0, this.gametypeId, weaponIds, playerIds);
            //const missingPlayerMapTotalData = await this.weapons.getMissingPlayerWeaponTotals(this.mapId, 0, weaponIds, playerIds);
            //console.log(query);

            await this.weapons.createMissingPlayerTotalData(missingPlayerTotalData, 0, 0);
           // await this.weapons.createMissingPlayerTotalData(missingPlayerGamtypeTotalData, 0, this.gametypeId);
           // await this.weapons.createMissingPlayerTotalData(missingPlayerMapTotalData, this.mapId, 0);
            //process.exit();

            const currentTotals = await this.weapons.getCurrentPlayerTotals(0,0, playerIds, weaponIds);
           // const currentGametypeTotals = await this.weapons.getCurrentPlayerTotals(0, this.gametypeId, playerIds, weaponIds);
           // const currentMapTotals = await this.weapons.getCurrentPlayerTotals(this.mapId, 0, playerIds, weaponIds);

            for(let i = 0; i < playerManager.players.length; i++){

                const p = playerManager.players[i];
        
                const playtime = p.getTotalPlaytime(playerManager.totalTeams);

                for(const [key, value] of p.weaponStats.entries()){
   
                    const currentWeaponId = this.weapons.getSavedWeaponByName(key);

                    //playerUsedWeapons[p.masterId].push(currentWeaponId);
                    
                    if(currentWeaponId !== null){      

                        //if(playtime === 0) continue;

                        playerMatchInsertVars.push([
                            this.matchId, this.mapId, this.gametypeId, p.masterId, 
                            currentWeaponId, value.kills, value.bestKills, value.deaths, value.suicides,
                            value.teamKills, value.bestTeamKills,
                            value.accuracy, value.shots, value.hits, Math.abs(value.damage), value.efficiency
                        ]);

                        //const stats = currentTotals[currentWeaponId][p.masterId];

                        this.updatePlayerCurrentStats(currentTotals[currentWeaponId][p.masterId], value, playtime);
                      //  this.updatePlayerCurrentStats(currentGametypeTotals[currentWeaponId][p.masterId], value, playtime);
                     //   this.updatePlayerCurrentStats(currentMapTotals[currentWeaponId][p.masterId], value, playtime);

                       // await this.weapons.updatePlayerBest(p.masterId, this.mapId, this.gametypeId, currentWeaponId, value);
                     

                        if(this.currentWeapons.has(currentWeaponId)){

                            const currentWeapon = this.currentWeapons.get(currentWeaponId);
    
                            currentWeapon.kills += value.kills;
                            currentWeapon.deaths += value.deaths;
                            currentWeapon.shots += value.shots;
                            currentWeapon.hits += value.hits;
                            currentWeapon.damage += Math.abs(value.damage);
                            currentWeapon.teamKills += value.teamKills;
                            currentWeapon.suicides += value.suicides;

                            this.currentWeapons.set(currentWeaponId, currentWeapon);
    
                        }else{
                            this.currentWeapons.set(currentWeaponId, value);
                        }
                    

                    }else{
                        new Message(`currentWeaponId is null for ${key}`,'warning');
                    }
                }
            }


            //console.log(playerUsedWeapons);

           // process.exit();

            //console.log(await this.weapons.deleteTotalPlayerDataRowsById(rowsToDelete));

            //const start = performance.now();
            await this.weapons.deleteOldTotalData(0, 0, playerIds, weaponIds);
           // await this.weapons.deleteOldTotalData(0, this.mapId, playerIds, weaponIds);
          //  await this.weapons.deleteOldTotalData(this.gametypeId, 0, playerIds, weaponIds);

            await this.weapons.insertNewPlayerTotalStats(currentTotals);
          //  await this.weapons.insertNewPlayerTotalStats(currentGametypeTotals);
         //   await this.weapons.insertNewPlayerTotalStats(currentMapTotals);

            //const end = performance.now();

            //console.log(`Weapon stats took ${(end - start) * 0.001} seconds`);
            //process.exit();
            //console.log(currentTotals);
            //process.exit();

            await this.weapons.bulkInsertPlayerMatchStats(playerMatchInsertVars);
            
            for(const [key, value] of this.currentWeapons){

                await this.weapons.update(key, value.kills, value.deaths, value.shots, value.hits, value.damage);
            }

        }catch(err){
            console.trace(err);
            new Message(`weaponsmanager update ${err}`,'error');
        }
    }
}
