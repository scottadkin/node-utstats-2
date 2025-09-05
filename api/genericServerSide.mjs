//generic function that can only be called serverside mysql stuff basically

import { simpleQuery } from "./database";

/**
 * 
 * @param {*} type map, server, gametype
 * @param {*} ids array of 1 or more ids to get the names
 */
export async function getObjectName(type, ids){

    if(ids.length === 0) return {};
 
    const validTypes = [
        "maps", 
        "gametypes",
        "servers"
    ];

    type = type.toLowerCase();

    const index = validTypes.indexOf(type);

    if(index === -1) throw new Error(`${type} is not a valid type for getObjectName`);

    const query = `SELECT id,name FROM nstats_${validTypes[index]} WHERE id IN (?)`;

    const result = await simpleQuery(query, [ids]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const {id, name} = result[i];

        data[id] = name;
    }

    return data;
    
}