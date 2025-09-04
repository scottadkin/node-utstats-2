import { simpleQuery } from "./database.js";

export default class Spawns{

    constructor(){}

    async getMapSpawns(id){

        id = parseInt(id);
        const query = "SELECT * FROM nstats_map_spawns WHERE map=?";
        return await simpleQuery(query, [id]);
    }

    async getTotalMapSpawns(id){

        id = parseInt(id);

        const query = "SELECT COUNT(*) as spawns FROM nstats_map_spawns WHERE map=?";

        const result = await simpleQuery(query, [id]);

        return result[0].spawns;     
        
    }

    async insert(name, map, x, y, z, spawns, team){

        name = name.toLowerCase();

        const query = "INSERT INTO nstats_map_spawns VALUES(NULL,?,?,?,?,?,?,?)";

        return await simpleQuery(query, [name, map, x, y, z, spawns, team]);
    }

    async update(name, map, spawns){

        name = name.toLowerCase();

        const query = "UPDATE nstats_map_spawns SET spawns=spawns+? WHERE name=? AND map=?";

        return await simpleQuery(query, [spawns, name, map]);
    }
}
