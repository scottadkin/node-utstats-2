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

        const result = await mysql.simpleQuery(query);

        const returnData = {};

        for(let i = 0; i < result.length; i++){

            returnData[result[i].id] = result[i].name;
        }

        return returnData;
    }

    async getMostPlayed(max){

        if(max === undefined) max = 5;

        const query = `SELECT gid, COUNT(*) as total_matches, SUM(gametime) as gametime,
        MIN(time) as first_match, MAX(time) as last_match
        FROM uts_match GROUP BY(gid) ORDER BY total_matches DESC LIMIT ?`;

        const result = await mysql.simpleQuery(query, [max]);

        const ids = [];

        for(let i = 0; i < result.length; i++){

            ids.push(result[i].gid);

        }

        const names = await this.getNames(ids);

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            r.name = (names[r.gid] !== undefined) ? names[r.gid] : "Not Found";
        }

        return result;

    }

}


export default Gametypes;