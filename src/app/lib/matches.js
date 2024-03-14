import mysql from "../../../api/database";
import Servers from "../../../api/servers";
import Gametypes from "../../../api/gametypes";
import Maps from "../../../api/maps";
import { cleanMapName } from "../../../api/generic.mjs";

async function getDMWinner(playerId){

    const query = `SELECT name,country FROM nstats_player_totals WHERE id=?`;

    const result = await mysql.simpleQuery(query, [playerId]);

    if(result.length > 0){
        return {"name": result[0].name, "country": result[0].country};
    }

    return null;
}

async function setMatchDetails(data){

    const serverManager = new Servers();
    const gametypeManager = new Gametypes();
    const mapManager = new Maps();

    const serverIds = [...new Set(data.map((d) =>{
        return d.server;
    }))];

    const gametypeIds = [...new Set(data.map((d) =>{
        return d.gametype;
    }))];

    const mapIds = [...new Set(data.map((d) =>{
        return d.map;
    }))];

    const serverNames= await serverManager.getNames(serverIds);
    const gametypeNames = await gametypeManager.getNames(gametypeIds);
    const mapNames = await mapManager.getNames(mapIds);
    const mapImages = await mapManager.getImages(Object.values(mapNames));

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        d.mapName = mapNames[d.map] ?? "Not Found";
        d.gametypeName = gametypeNames[d.gametype] ?? "Not Found";
        d.serverName = serverNames[d.server] ?? "Not Found";

        const cleanName = cleanMapName(d.mapName).toLowerCase();
        d.mapImage = mapImages[cleanName] ?? "default";

        if(d.dm_winner !== 0){
            d.dmWinner = await getDMWinner(d.dm_winner);
        }
    }  
}

export async function searchMatches(page, perPage, gametype, map, sortBy, order){

    if(page === undefined) throw new Error("Page is undefined");
    if(perPage === undefined) throw new Error("perPage is undefined");

    page = parseInt(page);
    perPage = parseInt(perPage);

    if(page !== page) throw new Error("Page must be a valid integer");
    if(perPage !== perPage) throw new Error("perPage must be a valid integer");

    if(page < 1) page = 1;
    if(perPage < 5) perPage = 5;

    const query = `SELECT * FROM nstats_matches ORDER BY date DESC LIMIT ?, ?`;
    const totalQuery = `SELECT COUNT(*) as total_matches FROM nstats_matches`;

    let start = perPage * (page - 1);

    const result = await mysql.simpleQuery(query, [start, perPage]);
    //total possible matches that meet the search
    const totalResult = await mysql.simpleQuery(totalQuery);


    await setMatchDetails(result);

    return {"matches": result, "total": totalResult[0].total_matches};
}