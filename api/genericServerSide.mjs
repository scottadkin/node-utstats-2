//generic function that can only be called serverside mysql stuff basically

import { simpleQuery } from "./database.js";

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


export async function getSingleObjectName(type, id){

    const result = await getObjectName(type, [id]);

    if(result[id] !== undefined) return result[id];

    return "Not Found";
}

/**
 * Get all id,name pairs for servers, gametypes, maps
 * @param {*} type 
 * @returns 
 */
export async function getAllObjectNames(type){

    const validTypes = [
        "maps", 
        "gametypes",
        "servers"
    ];

    type = type.toLowerCase();

    const index = validTypes.indexOf(type);

    if(index === -1) throw new Error(`${type} is not a valid type for getAllObjectNames`);

    const query = `SELECT id,name FROM nstats_${validTypes[index]}`;

    const result = await simpleQuery(query);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const {id, name} = result[i];
        data[id] = name;
    }

    return data; 
}