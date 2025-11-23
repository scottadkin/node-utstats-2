//generic function that can only be called serverside mysql stuff basically

import { simpleQuery } from "./database.js";
import { removeUnr } from "./generic.mjs";
import { getServerNames, getAllNames as getAllServerNames } from "./servers.js";



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
        "servers",
        "weapons",
        "items",
        "powerups",
        "dom_control_points",
        "monsters"
    ];

    type = type.toLowerCase();

    const index = validTypes.indexOf(type);

    if(index === -1) throw new Error(`${type} is not a valid type for getObjectName`);


    if(type === "servers") return getServerNames(ids);

    let nameKey = "name";

    if(type === "items" || type === "monsters"){
        nameKey = "display_name as name";
    }

    const query = `SELECT id,${nameKey} FROM nstats_${validTypes[index]} WHERE id IN (?)`;

    const result = await simpleQuery(query, [ids]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        let {id, name} = result[i];

        if(type === "maps") name = removeUnr(name);
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
export async function getAllObjectNames(type, bReturnArray){

    const validTypes = [
        "maps", 
        "gametypes",
        "servers"
    ];

    type = type.toLowerCase();

    const index = validTypes.indexOf(type);

    if(index === -1) throw new Error(`${type} is not a valid type for getAllObjectNames`);

    if(bReturnArray === undefined) bReturnArray = false;

    if(type === "servers") return await getAllServerNames(bReturnArray);

    

    const query = `SELECT id,name FROM nstats_${validTypes[index]}`;

    const result = await simpleQuery(query);

    if(bReturnArray){

        result.sort((a, b) =>{
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            if(a < b) return -1;
            if(a > b) return 1;
            return 0
        });
        return result;
    }

    const data = {};

    for(let i = 0; i < result.length; i++){

        const {id, name} = result[i];
        data[id] = name;

        if(type === "maps") data[id] = removeUnr(data[id]);
    }

    return data; 
}