import mysql from "../../../api/database.js";

export async function getNamesByIds(targetIds){

    if(targetIds === undefined) return {};

    const query = `SELECT id,name FROM nstats_player_totals WHERE id IN (?)`;
    const result = await mysql.simpleQuery(query, [targetIds]);

    const idsToNames = {};

    for(let i = 0; i < result.length; i++){

        const {id, name} = result[i];

        idsToNames[id] = name;
    }

    return idsToNames;
}