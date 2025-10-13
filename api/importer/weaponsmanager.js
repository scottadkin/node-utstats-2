import Weapons, { getWeaponIdsByNames, bulkInsertPlayerMatchStats, 
    calculatePlayerTotalsFromMatchRows, deletePlayerAllTimeTotals, 
    bulkInsertPlayerTotals, deletePlayerTypeTotals } from "../weapons.js";
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

        const namesToIds = await getWeaponIdsByNames(this.names);
        console.log(namesToIds);

        const weaponIds = Object.values(namesToIds);
        console.log(weaponIds);

        const playerMatchInsertVars = [];

        const playerIds = new Set();

        for(let i = 0; i < playerManager.players.length; i++){

            const p = playerManager.players[i];
    
            //const playtime = p.getTotalPlaytime(playerManager.totalTeams);

            for(const [key, value] of p.weaponStats.entries()){

                const currentWeaponId = namesToIds[key] ?? null;
                
                if(currentWeaponId !== null){     

                    playerIds.add(p.masterId);

                    playerMatchInsertVars.push([
                        this.matchId, this.mapId, this.gametypeId, p.masterId, 
                        currentWeaponId, value.kills, value.bestKills, value.deaths, value.suicides,
                        value.teamKills, value.bestTeamKills,
                        value.accuracy, value.shots, value.hits, Math.abs(value.damage), value.efficiency
                    ]);

                    //await this.weapons.updatePlayerBest(p.masterId, this.mapId, this.gametypeId, currentWeaponId, value);
                

                }else{
                    new Message(`currentWeaponId is null for ${key}`,'warning');
                }
            }
        }

        await bulkInsertPlayerMatchStats(playerMatchInsertVars);

        new Message(`Calculate player weapon totals.`,"note");
        const allTimeTotals = await calculatePlayerTotalsFromMatchRows([...playerIds], "all");
        const gametypeTotals = await calculatePlayerTotalsFromMatchRows([...playerIds], "gametypes", this.gametypeId);
        const mapTotals = await calculatePlayerTotalsFromMatchRows([...playerIds], "maps", this.mapId);

        await deletePlayerAllTimeTotals([...playerIds], weaponIds);
        await deletePlayerTypeTotals("gametypes", this.gametypeId, [...playerIds], weaponIds)
        await deletePlayerTypeTotals("maps", this.mapId, [...playerIds], weaponIds)


        await bulkInsertPlayerTotals(allTimeTotals, 0, 0);
        await bulkInsertPlayerTotals(gametypeTotals, this.gametypeId, 0);
        await bulkInsertPlayerTotals(mapTotals, 0, this.mapId);

    }

    /*async update(playerManager){

        try{

            const playerMatchInsertVars = [];

            await this.weapons.getIdsByName(this.names);

            const weaponIds = this.weapons.weaponNames.map((w) =>{
                return w.id;
            });

            const playerIds = playerManager.players.map((p) =>{
                return p.masterId;
            });
      
            const missingPlayerTotalData = await this.weapons.getMissingPlayerWeaponTotals(0, 0, weaponIds, playerIds);
            await this.weapons.createMissingPlayerTotalData(missingPlayerTotalData, 0, 0);
            const currentTotals = await this.weapons.getCurrentPlayerTotals(0,0, playerIds, weaponIds);

            for(let i = 0; i < playerManager.players.length; i++){

                const p = playerManager.players[i];
        
                const playtime = p.getTotalPlaytime(playerManager.totalTeams);

                for(const [key, value] of p.weaponStats.entries()){
   
                    const currentWeaponId = this.weapons.getSavedWeaponByName(key);
                    
                    if(currentWeaponId !== null){      


                        playerMatchInsertVars.push([
                            this.matchId, this.mapId, this.gametypeId, p.masterId, 
                            currentWeaponId, value.kills, value.bestKills, value.deaths, value.suicides,
                            value.teamKills, value.bestTeamKills,
                            value.accuracy, value.shots, value.hits, Math.abs(value.damage), value.efficiency
                        ]);


                        this.updatePlayerCurrentStats(currentTotals[currentWeaponId][p.masterId], value, playtime);
                      //  this.updatePlayerCurrentStats(currentGametypeTotals[currentWeaponId][p.masterId], value, playtime);
                     //   this.updatePlayerCurrentStats(currentMapTotals[currentWeaponId][p.masterId], value, playtime);

                        //console.log(i);
                        await this.weapons.updatePlayerBest(p.masterId, this.mapId, this.gametypeId, currentWeaponId, value);
                     

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


            await this.weapons.deleteOldTotalData(0, 0, playerIds, weaponIds);
           // await this.weapons.deleteOldTotalData(0, this.mapId, playerIds, weaponIds);
          //  await this.weapons.deleteOldTotalData(this.gametypeId, 0, playerIds, weaponIds);

            await this.weapons.insertNewPlayerTotalStats(currentTotals);
          //  await this.weapons.insertNewPlayerTotalStats(currentGametypeTotals);
         //   await this.weapons.insertNewPlayerTotalStats(currentMapTotals);

            await this.weapons.bulkInsertPlayerMatchStats(playerMatchInsertVars);
            
            for(const [key, value] of this.currentWeapons){

                await this.weapons.update(key, value.kills, value.deaths, value.shots, value.hits, value.damage);
            }

        }catch(err){
            console.trace(err);
            new Message(`weaponsmanager update ${err}`,'error');
        }
    }*/
}
