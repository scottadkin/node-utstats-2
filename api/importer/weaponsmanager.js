import Weapons, { getWeaponIdsByNames, bulkInsertPlayerMatchStats, 
    calculatePlayerTotalsFromMatchRows, deletePlayerAllTimeTotals, 
    bulkInsertPlayerTotals, deletePlayerTypeTotals, calculatePlayersBest,
    bulkDeletePlayersBest, bulkInsertPlayerBest, updateWeaponTotals
} from "../weapons.js";
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


    async update(playerManager){

        const namesToIds = await getWeaponIdsByNames(this.names);

        const weaponIds = Object.values(namesToIds);

        const playerMatchInsertVars = [];

        const currentTotals = {};

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

                    if(currentTotals[currentWeaponId] === undefined){

                        currentTotals[currentWeaponId] = {
                            "kills": 0,
                            "deaths": 0,
                            "shots": 0,
                            "hits": 0,
                            "damage": 0,
                            "teamKills": 0,
                            "suicides": 0,
                        };
                    }

                    const t = currentTotals[currentWeaponId];

                    t.kills += value.kills;
                    t.deaths += value.deaths;
                    t.shots += value.shots;
                    t.hits += value.hits;
                    t.damage += Math.abs(value.damage);
                    t.teamKills += value.teamKills;
                    t.suicides += value.suicides;

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
        await deletePlayerTypeTotals("gametype", this.gametypeId, [...playerIds], weaponIds)
        await deletePlayerTypeTotals("map", this.mapId, [...playerIds], weaponIds)


        await bulkInsertPlayerTotals(allTimeTotals, 0, 0);
        await bulkInsertPlayerTotals(gametypeTotals, this.gametypeId, 0);
        await bulkInsertPlayerTotals(mapTotals, 0, this.mapId);

        const allTimeBest = await calculatePlayersBest([...playerIds], "all");
        const gametypeBest = await calculatePlayersBest([...playerIds], "gametypes", this.gametypeId);
        const mapBest = await calculatePlayersBest([...playerIds], "maps", this.mapId);

        await bulkDeletePlayersBest([...playerIds], weaponIds, "all");
        await bulkDeletePlayersBest([...playerIds], weaponIds, "gametypes", this.gametypeId);
        await bulkDeletePlayersBest([...playerIds], weaponIds, "maps", this.mapId);


        await bulkInsertPlayerBest(allTimeBest, 0, 0);
        await bulkInsertPlayerBest(gametypeBest, this.gametypeId, 0);
        await bulkInsertPlayerBest(mapBest, 0, this.mapId);


        await updateWeaponTotals(weaponIds);

       /* for(const [key, value] of Object.entries(currentTotals)){

            await this.weapons.update(key, value.kills, value.deaths, value.shots, value.hits, value.damage);
        }*/
    }

}
