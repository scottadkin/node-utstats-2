import mysql from "../../../api/database.js";
import { getNamesByIds } from "./players";

export async function getPlayers(matchId){
    
    const query = `SELECT * FROM nstats_player_matches WHERE match_id=? ORDER BY score DESC`;

    const result = await mysql.simpleQuery(query, [matchId]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        delete r.hwid;
        delete r.ip;
    }
   
    return result;
}


async function getBasicInfo(matchId){

    const query = `SELECT * FROM nstats_matches WHERE id=? LIMIT 1`;

    const result = await mysql.simpleQuery(query, [matchId]);

    if(result.length > 0){
        return result[0];
    }

    return null;
}

export async function getData(matchId){

    try{

        if(matchId === undefined) throw new Error("No match id specified");
        
        matchId = parseInt(matchId);

        if(matchId !== matchId) throw new Error("Match id must be an integer");

        const basicInfo = await getBasicInfo(matchId);

        const playerData = await getPlayers(matchId);

        const playerIds = [...new Set(playerData.map((p) =>{
            return p.player_id;
        }))];

        const playerNames = await getNamesByIds(playerIds);
        return {"basic": basicInfo, "playerNames": playerNames, "playerData": playerData};

    }catch(err){
        
        console.trace(err);
        return {"error": err.toString()};
    }
}