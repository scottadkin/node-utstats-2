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

    async getMatchData(id){

        const query = "SELECT pid,weapon,kills,shots,hits,damage,acc FROM uts_weaponstats WHERE matchid=?";

        const data = await mysql.simpleQuery(query, [id]);

        const weaponIds = [];

        for(let i = 0; i < data.length; i++){

            if(weaponIds.indexOf(data[i].weapon) === -1){
                weaponIds.push(data[i].weapon);
            }
        }

        const weaponNames = await this.getNames(weaponIds);

        return {"stats": data, "names": weaponNames}
    }
}


export default Weapons;