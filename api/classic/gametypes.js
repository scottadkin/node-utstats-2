import mysql from './database';

class Gametypes{

    constructor(){

    }

    async getNames(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,name from uts_games WHERE id IN (?)";

        const result = await mysql.simpleQuery(query, [ids]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            data[result[i].id] = result[i].name;
        }

        return data;
    }

    async getAllNames(){

        const query = "SELECT id,name FROM uts_games ORDER BY name ASC";

        return await mysql.simpleQuery(query);
    }

}


export default Gametypes;