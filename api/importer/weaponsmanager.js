const Weapons = require('../weapons');
const Message = require('../message');

class WeaponsManager{

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

            //const query = `SELECT player_id,weapon_id FROM nstats_player_weapon_totals WHERE map_id=${this.mapId} AND gametype=${this.gametypeId} AND weapon IN (${[...weaponIds]})`;

            //const missingPlayerTotalData = await this.weapons.getMissingPlayerWeaponTotals(this.mapId, this.gametypeId, weaponIds, playerIds);
            const missingPlayerTotalData = await this.weapons.getMissingPlayerWeaponTotals(0, 0, weaponIds, playerIds);
            const missingPlayerGamtypeTotalData = await this.weapons.getMissingPlayerWeaponTotals(0, this.gametypeId, weaponIds, playerIds);
            const missingPlayerMapTotalData = await this.weapons.getMissingPlayerWeaponTotals(this.mapId, 0, weaponIds, playerIds);
            //console.log(query);

            await this.weapons.createMissingPlayerTotalData(missingPlayerTotalData, 0, 0);
            await this.weapons.createMissingPlayerTotalData(missingPlayerGamtypeTotalData, 0, this.gametypeId);
            await this.weapons.createMissingPlayerTotalData(missingPlayerMapTotalData, this.mapId, 0);
            //process.exit();

            for(let i = 0; i < playerManager.players.length; i++){

                const p = playerManager.players[i];

                //playerUsedWeapons[p.masterId] = [];
                
                const playtime = p.getTotalPlaytime(playerManager.totalTeams);

               // console.log(p.weaponStats.keys());

                for(const [key, value] of p.weaponStats.entries()){
   
                    const currentWeaponId = this.weapons.getSavedWeaponByName(key);

                    //playerUsedWeapons[p.masterId].push(currentWeaponId);
                    
                    if(currentWeaponId !== null){      

                        if(playtime === 0) continue;

                        playerMatchInsertVars.push([
                            this.matchId, this.mapId, this.gametypeId, p.masterId, 
                            currentWeaponId, value.kills, value.bestKills, value.deaths, value.suicides,
                            value.teamKills, value.bestTeamKills,
                            value.accuracy, value.shots, value.hits, Math.abs(value.damage), value.efficiency
                        ]);


                       /* updateTotalVars.push(
                            [
                                playtime, 
                                value.kills, value.teamKills, value.deaths, value.suicides, 
                                value.shots, value.hits,value.damage,1, p.masterId, currentWeaponId, this.gametypeId, this.mapId
                            ]
                            // /currentWeaponId, p.masterId, this.mapId, this.gametypeId
                        );*/

                        updateTotalVars.push(
                            {
                                "playtime": parseFloat(playtime), 
                                "kills": parseInt(value.kills), 
                                "teamKills": parseInt(value.teamKills), 
                                "deaths": parseInt(value.deaths), 
                                "suicides": parseInt(value.suicides), 
                                "shots": parseInt(value.shots), 
                                "hits": parseInt(value.hits),
                                "damage": parseInt(Math.abs(value.damage)),
                                "matches": 1, 
                                "playerId": parseInt(p.masterId), 
                                "weaponId": parseInt(currentWeaponId), 
                                "gametypeId": parseInt(/*this.gametypeId*/0), 
                                "mapId": parseInt(/*this.mapId*/0)
                            }
                        );

                        updateTotalVars.push(
                            {
                                "playtime": parseFloat(playtime), 
                                "kills": parseInt(value.kills), 
                                "teamKills": parseInt(value.teamKills), 
                                "deaths": parseInt(value.deaths), 
                                "suicides": parseInt(value.suicides), 
                                "shots": parseInt(value.shots), 
                                "hits": parseInt(value.hits),
                                "damage": parseInt(Math.abs(value.damage)),
                                "matches": 1, 
                                "playerId": parseInt(p.masterId), 
                                "weaponId": parseInt(currentWeaponId), 
                                "gametypeId": parseInt(this.gametypeId), 
                                "mapId": parseInt(/*this.mapId*/0)
                            }
                        );

                        updateTotalVars.push(
                            {
                                "playtime": parseFloat(playtime), 
                                "kills": parseInt(value.kills), 
                                "teamKills": parseInt(value.teamKills), 
                                "deaths": parseInt(value.deaths), 
                                "suicides": parseInt(value.suicides), 
                                "shots": parseInt(value.shots), 
                                "hits": parseInt(value.hits),
                                "damage": parseInt(Math.abs(value.damage)),
                                "matches": 1, 
                                "playerId": parseInt(p.masterId), 
                                "weaponId": parseInt(currentWeaponId), 
                                "gametypeId": parseInt(0), 
                                "mapId": parseInt(this.mapId)
                            }
                        );

                        //await this.weapons.updatePlayerTotalStats(this.mapId, this.gametypeId, p.masterId, playtime, currentWeaponId, value); 

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


            const start = performance.now();
            console.log(`${updateTotalVars.length} rows to change`);
            await this.weapons.bulkUpdatePlayerTotals(updateTotalVars);
            const end = performance.now();
            console.log(`took ${(end - start) * 0.001} seconds`);
            //console.log(playerUsedWeapons);

           // process.exit();

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

module.exports = WeaponsManager;