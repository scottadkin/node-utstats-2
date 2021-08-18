import mysql from './database';


class Weapons{

    constructor(){

    }

    async getNames(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,name FROM uts_weapons WHERE id IN (?) ORDER BY sequence ";

        const result = await mysql.simpleQuery(query, [ids]);

        const weaponNames = {};

        for(let i = 0; i < result.length; i++){
            weaponNames[result[i].id] = result[i].name;
        }

        return weaponNames;
    }

    async getMatchData(id, playerIds){

        let query = "SELECT pid,weapon,kills,shots,hits,damage,acc FROM uts_weaponstats WHERE matchid=?";
        let vars = [id];

        if(playerIds !== undefined){

            query = "SELECT pid,weapon,kills,shots,hits,damage,acc FROM uts_weaponstats WHERE matchid=? AND pid IN (?)";
            vars.push(playerIds);
        }

        const data = await mysql.simpleQuery(query, vars);

        const weaponIds = [];

        for(let i = 0; i < data.length; i++){

            if(weaponIds.indexOf(data[i].weapon) === -1){
                weaponIds.push(data[i].weapon);
            }
        }

        const weaponNames = await this.getNames(weaponIds);

        return {"stats": data, "names": weaponNames}
    }

    async getPlayerTotals(id){

        const query = `SELECT weapon, SUM(kills) as kills, SUM(shots) as shots, SUM(hits) as hits, 
        SUM(damage) as damage
        FROM uts_weaponstats WHERE pid=? GROUP BY(weapon) ORDER BY weapon ASC`;
        
        const result = await mysql.simpleQuery(query, [id]);

        const weaponIds = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i].weapon;
            weaponIds.push(r);

        }

        const weaponNames = await this.getNames(weaponIds);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            r.name = (weaponNames[r.weapon] !== undefined) ? weaponNames[r.weapon] : "Not Found";
        }

        return result;
    }
}


export default Weapons;