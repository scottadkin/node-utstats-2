import { simpleQuery } from "./database.js";
import {getBasicPlayersByIds, getPlayersCountries} from "./players.js";
import {getPlayer, sanatizePage, sanatizePerPage} from "./generic.mjs";
import { getObjectName } from "./genericServerSide.mjs";

export const validPlayerTotalTypes = [
    //{"value": "first","displayValue": "First Match" },
    //{"value": "last","displayValue": "Last Match" },
    {"value": "matches","displayValue": "Matches Played" },
    {"value": "wins","displayValue": "Wins" },
    {"value": "losses","displayValue": "Losses" },
    {"value": "draws","displayValue": "Draws" },
    {"value": "winrate","displayValue": "Winrate" },
    {"value": "playtime","displayValue": "Playtime" },
    {"value": "team_0_playtime","displayValue": "Red Team Playtime" },
    {"value": "team_1_playtime","displayValue": "Blue Team Playtime" },
    {"value": "team_2_playtime","displayValue": "Green Team Playtime" },
    {"value": "team_3_playtime","displayValue": "Yellow Team Playtime" },
    {"value": "spec_playtime","displayValue": "Spectator Time" },
    {"value": "first_bloods","displayValue": "First Bloods" },
    {"value": "frags","displayValue": "Frags" },
    {"value": "score","displayValue": "Score" },
    {"value": "kills","displayValue": "Kills" },
    {"value": "deaths","displayValue": "Deaths" },
    {"value": "suicides","displayValue": "Suicides" },
    {"value": "team_kills","displayValue": "Team Kills" },
    {"value": "spawn_kills","displayValue": "Spawn Kills" },
    {"value": "efficiency","displayValue": "Efficiency" },
    {"value": "multi_1","displayValue": "Double Kills" },
    {"value": "multi_2","displayValue": "Multi Kills" },
    {"value": "multi_3","displayValue": "Mega Kills" },
    {"value": "multi_4","displayValue": "Ultra Kills" },
    {"value": "multi_5","displayValue": "Monster Kills" },
    {"value": "multi_6","displayValue": "Ludicrous Kills" },
    {"value": "multi_7","displayValue": "Holy Shits" },
    {"value": "multi_best","displayValue": "Best Multi Kill" },
    {"value": "spree_1","displayValue": "Killing Spree" },
    {"value": "spree_2","displayValue": "Rampage" },
    {"value": "spree_3","displayValue": "Dominating" },
    {"value": "spree_4","displayValue": "Unstoppable" },
    {"value": "spree_5","displayValue": "Godlike" },
    {"value": "spree_6","displayValue": "Too Easy" },
    {"value": "spree_7","displayValue": "Brutalizing The Competition" },
    {"value": "spree_best","displayValue": "Best Killing Spree" },
    {"value": "fastest_kill","displayValue": "Fastest Time Between Kills" },
    {"value": "slowest_kill","displayValue": "Longest Time Between Kills" },
    {"value": "best_spawn_kill_spree","displayValue": "Best Spawn Kill Spree" },
    {"value": "assault_objectives","displayValue": "Assault Objectives" },
   // {"value": "dom_caps","displayValue": "Domination Caps" },
   // {"value": "dom_caps_best","displayValue": "Domination Caps Best" },
   // {"value": "dom_caps_best_life","displayValue": "Domination Caps Best Life" },
    {"value": "accuracy","displayValue": "Accuracy" },
    {"value": "k_distance_normal","displayValue": "Close Range Kills" },
    {"value": "k_distance_long","displayValue": "Long Range Kills" },
    {"value": "k_distance_uber","displayValue": "Uber Long Range Kills" },
    {"value": "headshots","displayValue": "Headshots" },
    {"value": "shield_belt","displayValue": "Shield Belts" },
    {"value": "amp","displayValue": "Damage Amplifier" },
    {"value": "amp_time","displayValue": "Damage Amplifier Time" },
    {"value": "invisibility","displayValue": "Invisibility" },
    {"value": "invisibility_time","displayValue": "Invisibility Time" },
    {"value": "pads","displayValue": "Thigh Pads" },
    {"value": "armor","displayValue": "Body Armour" },
    {"value": "boots","displayValue": "Jump Boots" },
    {"value": "super_health","displayValue": "Super Health" },
    {"value": "mh_kills","displayValue": "Monsterhunt Kills" },
    {"value": "mh_kills_best_life","displayValue": "Monsterhunt Kills Best Life" },
    {"value": "mh_kills_best","displayValue": "Monsterhunt Kills Best" },
    {"value": "mh_deaths","displayValue": "Monsterhunt Deaths" },
    {"value": "mh_deaths_worst","displayValue": "Monsterhunt Deaths Worst" }
];


export const totalPerPageOptions = [  
    {"value": 5, "displayValue": "5"},
    {"value": 10, "displayValue": "10"},
    {"value": 15, "displayValue": "15"},
    {"value": 25, "displayValue": "25"},
    {"value": 50, "displayValue": "50"},
    {"value": 100, "displayValue": "100"}     
];

export const validPlayerMatchTypes = [
    {"value": "playtime", "displayValue": "Playtime"},
    {"value": "team_0_playtime", "displayValue": "Red Team Playtime"},
    {"value": "team_1_playtime", "displayValue": "Blue Team Playtime"},
    {"value": "team_2_playtime", "displayValue": "Green Team Playtime"},
    {"value": "team_3_playtime", "displayValue": "Yellow Team Playtime"},
    {"value": "spec_playtime", "displayValue": "Spectator Playtime"},
    {"value": "frags", "displayValue": "Frags"},
    {"value": "score", "displayValue": "Score"},
    {"value": "kills", "displayValue": "Kills"},
    {"value": "deaths", "displayValue": "Deaths"},
    {"value": "suicides", "displayValue": "Suicides"},
    {"value": "team_kills", "displayValue": "Team Kills"},
    {"value": "spawn_kills", "displayValue": "Spawn Kills"},
    {"value": "efficiency", "displayValue": "Efficiency"},
    {"value": "multi_1", "displayValue": "Double Kills"},
    {"value": "multi_2", "displayValue": "Multi Kills"},
    {"value": "multi_3", "displayValue": "Mega Kills"},
    {"value": "multi_4", "displayValue": "Ultra Kills"},
    {"value": "multi_5", "displayValue": "Monster Kills"},
    {"value": "multi_6", "displayValue": "Ludicrous Kills"},
    {"value": "multi_7", "displayValue": "Holy Shits"},
    {"value": "multi_best", "displayValue": "Best Multi Kill"},
    {"value": "spree_1", "displayValue": "Killing Sprees"},
    {"value": "spree_2", "displayValue": "Rampage"},
    {"value": "spree_3", "displayValue": "Dominating"},
    {"value": "spree_4", "displayValue": "Unstoppable"},
    {"value": "spree_5", "displayValue": "Godlike"},
    {"value": "spree_6", "displayValue": "Too Easy(30 Kill Spree)"},
    {"value": "spree_7", "displayValue": "Brutalizing(35+ Kill Spree)"},
    {"value": "spree_best", "displayValue": "Best Spree"},
    {"value": "best_spawn_kill_spree", "displayValue": "Best Spawn Kill Spree"},
    {"value": "assault_objectives", "displayValue": "Assault Objectives"},
    //{"value": "dom_caps", "displayValue": "Domination Point Caps"},
    //{"value": "dom_caps_best_life", "displayValue": "Best Domination Point Caps Single Life"},
    {"value": "ping_min", "displayValue": "Minimum Ping"},
    {"value": "ping_average", "displayValue": "Average Ping"},
    {"value": "ping_max", "displayValue": "Maximum Ping"},
    {"value": "accuracy", "displayValue": "Weapon Accuracy"},
    {"value": "shortest_kill_distance", "displayValue": "Shortest Kill Distance"},
    {"value": "average_kill_distance", "displayValue": "Average kill Distance"},
    {"value": "longest_kill_distance", "displayValue": "Longest Kill Distance"},
    {"value": "k_distance_normal", "displayValue": "Close Range Kills"},
    {"value": "k_distance_long", "displayValue": "Long Range Kills"},
    {"value": "k_distance_uber", "displayValue": "Uber Long Range Kills"},
    {"value": "headshots", "displayValue": "Headshots"},
    {"value": "shield_belt", "displayValue": "Shield Belts"},
    {"value": "amp", "displayValue": "UDamage"},
    {"value": "amp_time", "displayValue": "UDamage Time"},
    {"value": "invisibility", "displayValue": "Invisibility"},
    {"value": "invisibility_time", "displayValue": "Invisibility Time"},
    {"value": "pads", "displayValue": "Armour Pads"},
    {"value": "armor", "displayValue": "Body Armour"},
    {"value": "boots", "displayValue": "Jump Boots"},
    {"value": "super_health", "displayValue": "Super Health"},
    {"value": "mh_kills", "displayValue": "Monsterhunt Kills"},
    {"value": "mh_kills_best_life", "displayValue": "Monsterhunt Kills Best Life"},
    {"value": "mh_deaths", "displayValue": "Monsterhunt Deaths"},
    {"value": "telefrag_kills", "displayValue": "Telefrag Kills"},
    {"value": "telefrag_deaths", "displayValue": "Telefrag Deaths"},
    {"value": "telefrag_best_spree", "displayValue": "Telefrags Best Spree"},
    {"value": "telefrag_best_multi", "displayValue": "Telefrags Best Multi Kill"},
    {"value": "tele_disc_kills", "displayValue": "Translocator Disc Kills"},
    {"value": "tele_disc_deaths", "displayValue": "Translocator Disc Deaths"},
    {"value": "tele_disc_best_spree", "displayValue": "Translocator Discs Best Spree"},
    {"value": "tele_disc_best_multi", "displayValue": "Translocator Discs Best Multi"}
];

export const validPlayerCTFTotalTypes = [
    {"value": "flag_capture", "displayValue": "Flag Capture"},
    {"value": "flag_solo_capture", "displayValue": "Flag Solo Capture"},
    {"value": "flag_assist", "displayValue": "Flag Assist"},
    {"value": "flag_return", "displayValue": "Flag Return"},
    {"value": "flag_return_base", "displayValue": "Flag Return Base"},
    {"value": "flag_return_mid", "displayValue": "Flag Return Mid"},
    {"value": "flag_return_enemy_base", "displayValue": "Flag Return Enemy Base"},
    {"value": "flag_return_save", "displayValue": "Flag Return Close Save"},
    {"value": "flag_dropped", "displayValue": "Flag Dropped"},
    {"value": "flag_kill", "displayValue": "Flag Kill"},
    {"value": "flag_suicide", "displayValue": "Flag Suicide"},
    {"value": "flag_seal", "displayValue": "Flag Seal"},
    {"value": "flag_seal_pass", "displayValue": "Flag Seal Pass"},
    {"value": "best_single_seal", "displayValue": "Best Flag Seal"},
    {"value": "flag_cover", "displayValue": "Flag Cover"},
    {"value": "flag_cover_pass", "displayValue": "Flag Cover Pass"},
    {"value": "flag_cover_fail", "displayValue": "Flag Cover Failed"},
    {"value": "flag_cover_multi", "displayValue": "Flag Multi Cover"},
    {"value": "flag_cover_spree", "displayValue": "Flag Cover Spree"},
    {"value": "best_single_cover", "displayValue": "Best Single Cover"},
    {"value": "flag_carry_time", "displayValue": "Flag Carry Time"},
    {"value": "flag_taken", "displayValue": "Flag Taken"},
    {"value": "flag_pickup", "displayValue": "Flag Pickup"},
    {"value": "flag_self_cover", "displayValue": "Flag Self Cover"},
    {"value": "flag_self_cover_pass", "displayValue": "Flag Self Cover Pass"},
    {"value": "flag_self_cover_fail", "displayValue": "Flag Self Cover Fail"},
    {"value": "best_single_self_cover", "displayValue": "Best Single Self Cover"}, 
];

export const validPlayerCTFMatchTypes = [
    {"value": "flag_capture", "displayValue": "Flag Capture"},
    {"value": "flag_solo_capture", "displayValue": "Flag Solo Capture"},
    {"value": "flag_assist", "displayValue": "Flag Assist"},
    {"value": "flag_return", "displayValue": "Flag Return"},
    {"value": "flag_return_base", "displayValue": "Flag Return Base"},
    {"value": "flag_return_mid", "displayValue": "Flag Return Mid"},
    {"value": "flag_return_enemy_base", "displayValue": "Flag Return Enemy Base"},
    {"value": "flag_return_save", "displayValue": "Flag Return Close Save"},
    {"value": "flag_dropped", "displayValue": "Flag Dropped"},
    {"value": "flag_kill", "displayValue": "Flag Kill"},
    {"value": "flag_suicide", "displayValue": "Flag Suicide"},
    {"value": "flag_seal", "displayValue": "Flag Seal"},
    {"value": "flag_seal_pass", "displayValue": "Flag Seal Pass"},
    {"value": "flag_seal_fail", "displayValue": "Flag Seal Fail"},
    {"value": "best_single_seal", "displayValue": "Best Flag Seal"},
    {"value": "flag_cover", "displayValue": "Flag Cover"},
    {"value": "flag_cover_pass", "displayValue": "Flag Cover Pass"},
    {"value": "flag_cover_fail", "displayValue": "Flag Cover Failed"},
    {"value": "flag_cover_multi", "displayValue": "Flag Multi Cover"},
    {"value": "flag_cover_spree", "displayValue": "Flag Cover Spree"},
    {"value": "best_single_cover", "displayValue": "Best Single Cover"},
    {"value": "flag_carry_time", "displayValue": "Flag Carry Time"},
    {"value": "flag_taken", "displayValue": "Flag Taken"},
    {"value": "flag_pickup", "displayValue": "Flag Pickup"},
    {"value": "flag_self_cover", "displayValue": "Flag Self Cover"},
    {"value": "flag_self_cover_pass", "displayValue": "Flag Self Cover Pass"},
    {"value": "flag_self_cover_fail", "displayValue": "Flag Self Cover Fail"},
    {"value": "best_single_self_cover", "displayValue": "Best Single Self Cover"}, 
];


export const validPlayerCTFSingleLifeTypes = [
    {"value": "flag_capture_best", "displayValue": "Flag Capture"},
    {"value": "flag_solo_capture_best", "displayValue": "Flag Solo Capture"},
    {"value": "flag_assist_best", "displayValue": "Flag Assist"},
    {"value": "flag_return_best", "displayValue": "Flag Return"},
    {"value": "flag_return_base_best", "displayValue": "Flag Return Base"},
    {"value": "flag_return_mid_best", "displayValue": "Flag Return Mid"},
    {"value": "flag_return_enemy_base_best", "displayValue": "Flag Return Enemy Base"},
    {"value": "flag_return_save_best", "displayValue": "Flag Return Close Save"},
    {"value": "flag_dropped_best", "displayValue": "Flag Dropped"},
    {"value": "flag_kill_best", "displayValue": "Flag Kill"},
    {"value": "flag_seal_best", "displayValue": "Flag Seal"},
    {"value": "flag_seal_pass_best", "displayValue": "Flag Seal Pass"},
    {"value": "flag_seal_fail_best", "displayValue": "Flag Seal Fail"},
    {"value": "best_single_seal", "displayValue": "Best Flag Seal"},
    {"value": "flag_cover_best", "displayValue": "Flag Cover"},
    {"value": "flag_cover_pass_best", "displayValue": "Flag Cover Pass"},
    {"value": "flag_cover_fail_best", "displayValue": "Flag Cover Failed"},
    {"value": "flag_cover_multi_best", "displayValue": "Flag Multi Cover"},
    {"value": "flag_cover_spree_best", "displayValue": "Flag Cover Spree"},
    {"value": "best_single_cover", "displayValue": "Best Single Cover"},
    {"value": "flag_carry_time_best", "displayValue": "Flag Carry Time"},
    {"value": "flag_taken_best", "displayValue": "Flag Taken"},
    {"value": "flag_pickup_best", "displayValue": "Flag Pickup"},
    {"value": "flag_self_cover_best", "displayValue": "Flag Self Cover"},
    {"value": "flag_self_cover_pass_best", "displayValue": "Flag Self Cover Pass"},
    {"value": "flag_self_cover_fail_best", "displayValue": "Flag Self Cover Fail"},
    {"value": "best_single_self_cover", "displayValue": "Best Single Self Cover"}, 
];


function bValidType(cat, value){
    
    let values = [];

    switch(cat){
        case "player-totals": { values = validPlayerTotalTypes; } break;
        case "player-match": { values = validPlayerMatchTypes; } break;
        case "player-ctf-totals": { values = validPlayerCTFTotalTypes; } break;
        case "player-ctf-match": { values = validPlayerCTFMatchTypes; } break;
        case "player-ctf-single-life": { values = validPlayerCTFSingleLifeTypes; } break;
    }

    for(let i = 0; i < values.length; i++){

        const v = values[i];
        if(v.value === value) return true;
    }

    return false;
}

export function bValidTotalType(value){

    return bValidType("player-totals", value);
}

export function bValidPlayerType(value){

    return bValidType("player-match", value);
}

export function bValidPlayerCTFTotalType(value){

    return bValidType("player-ctf-totals", value);
}

export function bValidPlayerCTFMatchType(value){

    return bValidType("player-ctf-match", value);
}

export function bValidPlayerCTFSingleLifeType(value){
    return bValidType("player-ctf-single-life", value);
}

export function cleanPerPage(perPage){

    perPage = parseInt(perPage);

    if(perPage !== perPage) return totalPerPageOptions[3].value;

    if(perPage < 5) return totalPerPageOptions[0].value;
    if(perPage > 100) return totalPerPageOptions[5].value;

    return perPage;
}


export async function getTotalGametypeMapEntries(gametype, map){

    const query = `SELECT COUNT(*) as total_matches FROM nstats_player_totals WHERE gametype=? AND map=?`;

    const result = await simpleQuery(query, [gametype, map]);

    return result[0].total_matches;
}

async function getPlayerTotalAllGametypes(map, type, start, perPage){


    const normalSelect = `SELECT nstats_player.name,
    nstats_player.id as player_id,
    nstats_player.country,
    nstats_player_totals.matches,
    nstats_player_totals.last,
    nstats_player_totals.playtime,nstats_player_totals.${type} as tvalue`;
    const totalSelect = `SELECT COUNT(*) as total_results`;

    const query = ` FROM nstats_player INNER JOIN nstats_player_totals ON nstats_player_totals.player_id = nstats_player.id 
    WHERE nstats_player_totals.gametype=0 AND nstats_player_totals.map=? ${(type !== "spec_playtime") ? "AND nstats_player_totals.playtime>0" : ""}`;

    const orderBy = ` ORDER BY nstats_player_totals.${type} DESC LIMIT ?, ?`;

    const vars = [map, start, perPage];

    const result = await simpleQuery(`${normalSelect}${query}${orderBy}`, vars);

    const totalResults = await simpleQuery(`${totalSelect}${query}`, vars);

    if(map !== 0){

        const playerIds = [...new Set(result.map((p) =>{
            return p.player_id;
        }))];

        const countries = await getPlayersCountries(playerIds);


        for(let i = 0; i < result.length; i++){

            const r = result[i];
            r.country = countries[r.player_id] ?? "xx";
        }
    }

    return {"result": result, "totalResults": totalResults[0].total_results};

}


async function getPlayerTotalSingleGametype(gametype, map, type, start, perPage){

    const normalSelect = `SELECT nstats_player_totals.player_id,
    nstats_player.name,
    nstats_player_totals.matches,
    nstats_player_totals.last,
    nstats_player_totals.playtime,nstats_player_totals.${type} as tvalue`;
    const totalSelect = `SELECT COUNT(*) as total_matches`;

    const query = ` FROM nstats_player_totals 
    INNER JOIN nstats_player ON nstats_player.id = nstats_player_totals.player_id
    WHERE nstats_player_totals.gametype=? AND nstats_player_totals.map=? ${(type !== "spec_playtime") ? " AND nstats_player_totals.playtime > 0" : ""}`;

    const orderBy = ` ORDER BY nstats_player_totals.${type} DESC LIMIT ?, ?`;

    const vars = [gametype, map, start, perPage];

    const result = await simpleQuery(`${normalSelect}${query}${orderBy}`, vars);
    const totalResults = await simpleQuery(`${totalSelect}${query}`, vars);

    const playerIds = [...new Set(result.map((r) =>{
        return r.player_id;
    }))];

    const countries = await getPlayersCountries(playerIds);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        r.country = countries[r.player_id] ?? "xx";
    }

    return {"result": result, "totalResults": totalResults[0].total_matches};
}

export async function getPlayerTotalRecords(type, gametype, map, page, perPage){

    page = page - 1;

    gametype = parseInt(gametype);

    type = type.toLowerCase();

    if(!bValidTotalType(type)) throw new Error(`${type} is not a valid player total record type.`);
    perPage = cleanPerPage(perPage);

    page = sanatizePage(page);

    let start = perPage * page;
    if(start < 0) start = 0;

    let result = [];

    //need to get total maps played for gametmemgmemgemge

    
    if(gametype === 0){
        result = await getPlayerTotalAllGametypes(map, type, start, perPage);
    }else{
        result = await getPlayerTotalSingleGametype(gametype, map, type, start, perPage);
    }

    return {
        "totalResults": result.totalResults,
        "data": result.result
    };
}

export async function getPlayerMatchRecordsAny(cat, start, perPage){

    const where = (cat !== "spec_playtime") ? " AND playtime>0" : "";

    const normalSelect = `SELECT player_id,map_id,gametype,playtime,match_id,match_date,${cat} as tvalue`;
    const totalSelect = `SELECT COUNT(*) as total_results`;

    const query = ` FROM nstats_player_matches WHERE ${cat}!=0 ${where}`;

    const orderBy = ` ORDER BY tvalue DESC LIMIT ?,?`;

    const vars = [start, perPage];

    const totalResults = await simpleQuery(`${totalSelect}${query}`, vars);
    const result = await simpleQuery(`${normalSelect}${query}${orderBy}`, vars);

    const playerIds = [...new Set(result.map((r) =>{
        return r.player_id;
    }))];

    return {"data": result, "playerIds": playerIds, "totalResults": totalResults[0].total_results};
}

export async function getPlayerMatchRecordsCustom(gametypeId, mapId, cat, start, perPage){

    const normalSelect = `SELECT player_id,map_id,gametype,playtime,match_id,match_date,${cat} as tvalue`;
    const totalSelect = `SELECT COUNT(*) as total_results`;

    let query = ` FROM nstats_player_matches WHERE ${cat}!=0`;

    const vars = [];

    let whereString = "";

    if(gametypeId !== 0){
        
        whereString += " AND gametype=?";
        vars.push(gametypeId);
    }

    if(mapId !== 0){

        whereString += " AND map_id=?";
        vars.push(mapId);
    }

    if(cat !== "spec_playtime"){

        if(whereString === ""){
            whereString += " AND playtime>0";
        }else{
            whereString = `${whereString} AND playtime>0`;
        }
    }

    const orderByString = " ORDER BY tvalue DESC LIMIT ?,?";

    query = `${query}${whereString}`;

    const totalResults = await simpleQuery(`${totalSelect}${query}`, [...vars, start, perPage]);

    const result = await simpleQuery(`${normalSelect}${query}${orderByString}`, [...vars, start, perPage]);

    const playerIds = [...new Set(result.map((r) =>{
        return r.player_id;
    }))];

    return {"data": result, "playerIds": playerIds, "totalResults": totalResults[0].total_results};
}

export async function getPlayerMatchRecords(gametypeId, mapId, cat, page, perPage){

    if(!bValidPlayerType(cat)) throw new Error(`${cat} is not a valid player record type.`);

    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);

    page = page - 1;
    page = sanatizePage(page);

    const DEFAULT_PER_PAGE = 25;

    perPage = parseInt(perPage);
    if(perPage !== perPage) perPage = DEFAULT_PER_PAGE;
    if(perPage < 5 || perPage > 100) perPage = DEFAULT_PER_PAGE;

    const start = page * perPage;
    
    let result = null;

    if(gametypeId === 0 && mapId === 0){
        result = await getPlayerMatchRecordsAny(cat, start, perPage);
    }else{
        result = await getPlayerMatchRecordsCustom(gametypeId, mapId, cat, start, perPage);
    }

    if(result === null) return null;

    const playersInfo = await getBasicPlayersByIds(result.playerIds);
  
    const mapIds = [...new Set(result.data.map((r) =>{
        return r.map_id;
    }))];


    const gametypeIds = [...new Set(result.data.map((r) =>{
        return r.gametype;
    }))];

    const gametypeNames = await getObjectName("gametypes", gametypeIds);
    const mapNames = await getObjectName("maps", mapIds);


    for(let i = 0; i < result.data.length; i++){

        const d = result.data[i];
        const p = getPlayer(playersInfo, d.player_id, true);
        d.playerName = p.name;
        d.country = p.country;
        d.gametypeName = gametypeNames[d.gametype] ?? "Not Found";
        d.mapName = mapNames[d.map_id] ?? "Not Found";
    }

    return {"data": result.data, "totalResults": result.totalResults };  
}


//gametypeId === 0 && mapId === 0
async function getPlayerCTFTotalAny(cat, start, perPage){

    const query = `SELECT player_id,total_matches,playtime,${cat} as tvalue FROM nstats_player_ctf_totals 
    WHERE gametype_id=0 AND map_id=0 AND playtime>0 ORDER BY tvalue DESC LIMIT ?, ?`;
 
    const data =  await simpleQuery(query, [start, perPage]);

    const countQuery = `SELECT COUNT(*) as total_rows FROM nstats_player_ctf_totals 
    WHERE gametype_id=0 AND map_id=0 AND playtime>0`;

    const totals = await simpleQuery(countQuery);

    return {data, "totalResults": totals[0].total_rows};
}

//gametypeId !== 0 && mapId !== 0
async function getPlayerCTFTotalGametypeMap(gametypeId, mapId, cat, start, perPage){

    const query = `SELECT player_id,gametype_id,total_matches,map_id,playtime,${cat} as tvalue FROM nstats_player_ctf_totals 
    WHERE gametype_id=? AND map_id=? AND playtime>0 ORDER BY tvalue DESC LIMIT ?, ?`;
 
    const data = await simpleQuery(query, [gametypeId, mapId, start, perPage]);

    const countQuery = `SELECT COUNT(*) as total_rows FROM nstats_player_ctf_totals 
    WHERE gametype_id=? AND map_id=? AND playtime>0`;

    const totals = await simpleQuery(countQuery, [gametypeId, mapId]);

    return {data, "totalResults": totals[0].total_rows};
}

//gametypeId !== 0 && mapId === 0
async function getPlayerCTFTotalGametype(gametypeId, cat, start, perPage){

    const query = `SELECT player_id,gametype_id,map_id,total_matches,playtime,${cat} as tvalue FROM nstats_player_ctf_totals 
    WHERE gametype_id=? AND map_id=0 AND playtime>0 ORDER BY tvalue DESC LIMIT ?, ?`;

    const data = await simpleQuery(query, [gametypeId, start, perPage]);

    const countQuery = `SELECT COUNT(*) as total_rows FROM nstats_player_ctf_totals 
    WHERE gametype_id=? AND map_id=0 AND playtime>0`;

    const totals = await simpleQuery(countQuery, [gametypeId]);

    return {data, "totalResults": totals[0].total_rows};
}

//gametypeId === 0 && mapId !== 0
async function getPlayerCTFTotalMap(mapId, cat, start, perPage){

    const query = `SELECT player_id,gametype_id,map_id,total_matches,playtime,${cat} as tvalue FROM nstats_player_ctf_totals 
    WHERE map_id=? AND gametype_id=0 AND playtime>0 ORDER BY tvalue DESC LIMIT ?, ?`;
 
    const data = await simpleQuery(query, [mapId, start, perPage]);

    const countQuery = `SELECT COUNT(*) as total_rows FROM nstats_player_ctf_totals 
    WHERE gametype_id=0 AND map_id=? AND playtime>0`;

    const totals = await simpleQuery(countQuery, [mapId]);

    return {data, "totalResults": totals[0].total_rows};
}

/**
 * get unique players, gametypes, maps from player_totals_ctf table results
 * @param {*} data 
 * @returns 
 */
function getUniqueCTFValues(data){

    const uniqueGametypes = new Set();
    const uniqueMaps = new Set();
    const uniquePlayers = new Set();

    for(let i = 0; i < data.length; i++){

        const r = data[i];

        uniqueGametypes.add(r.gametype_id);
        uniqueMaps.add(r.map_id);
        uniquePlayers.add(r.player_id);
    }

    return {uniqueGametypes, uniqueMaps, uniquePlayers};
}

export async function getPlayerCTFTotalRecords(gametypeId, mapId, cat, page, perPage){

    if(!bValidPlayerCTFTotalType(cat)) throw new Error(`Not a valid Player CTF Total Record`);

    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);

    if(gametypeId !== gametypeId) gametypeId = 0;
    if(mapId !== mapId) mapId = 0;

    page--;
    page = sanatizePage(page);
    perPage = sanatizePerPage(perPage);

    let start = page * perPage; 

    let result = {"data": [], "totalResults": 0};

    if(gametypeId !== 0 && mapId !== 0){
        result = await getPlayerCTFTotalGametypeMap(gametypeId, mapId, cat, start, perPage);
    }else if(gametypeId === 0 && mapId === 0){
        result = await getPlayerCTFTotalAny(cat, start, perPage);
    }else if(gametypeId !== 0 && mapId === 0){
        result = await getPlayerCTFTotalGametype(gametypeId, cat, start, perPage);
    }else if(gametypeId === 0 && mapId !== 0){
        result = await getPlayerCTFTotalMap(mapId, cat, start, perPage);
    }

    const {uniqueGametypes, uniqueMaps, uniquePlayers} = getUniqueCTFValues(result.data);

    const playersInfo = await getBasicPlayersByIds([...uniquePlayers]);
    const gametypeNames = await getObjectName("gametypes", [...uniqueGametypes]);
    const mapNames = await getObjectName("maps", [...uniqueMaps]);

    for(let i = 0; i < result.data.length; i++){

        const r = result.data[i];
        const p = getPlayer(playersInfo, r.player_id, true);
        r.name = p.name;
        r.country = p.country;
        r.gametypeName = gametypeNames[r.gametype_id] ?? "Not Found";
        r.mapName = mapNames[r.map_id] ?? "Not Found";
    }

    return result;
}

async function getPlayerCTFMatchData(gametypeId, mapId, cat, start, perPage){

    let query = `SELECT player_id,match_id,match_date,gametype_id,map_id,playtime,${cat} as tvalue FROM nstats_player_ctf_match`;

    let where = `WHERE ${cat}>0 AND playtime>0`;
    const vars = [];

    if(gametypeId !== 0){
        where += " AND gametype_id=?";
        vars.push(gametypeId);
    }

    if(mapId !== 0){
        where += " AND map_id=?";
        vars.push(mapId);
    }

    query = `${query} ${where} ORDER BY tvalue DESC LIMIT ?, ?`;
    vars.push(start, perPage);

    return await simpleQuery(query, vars);  
}

async function getPlayerCTFMatchDataTotalResults(gametypeId, mapId, cat){

    let query = `SELECT COUNT(*) as total_rows FROM nstats_player_ctf_match`;

    let where = `WHERE ${cat}>0 AND playtime>0`;
    const vars = [];

    if(gametypeId !== 0){
        where += " AND gametype_id=?";
        vars.push(gametypeId);
    }

    if(mapId !== 0){
        where += " AND map_id=?";
        vars.push(mapId);
    }

    query = `${query} ${where}`;


    const result = await simpleQuery(query, vars);  
    return result[0].total_rows;
}

export async function getPlayerCTFMatchRecords(gametypeId, mapId, cat, page, perPage){

    if(!bValidPlayerCTFMatchType(cat)) throw new Error(`Not a valid playerCTFMatchRecordType`);

    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);

    if(gametypeId !== gametypeId) gametypeId = 0;
    if(mapId !== mapId) mapId = 0;

    page--;
    page = sanatizePage(page);
    perPage = sanatizePerPage(perPage);

    let start = page * perPage;

    const data = await getPlayerCTFMatchData(gametypeId, mapId, cat, start, perPage);

    const {uniqueGametypes, uniqueMaps, uniquePlayers} = getUniqueCTFValues(data);

    const playersInfo = await getBasicPlayersByIds([...uniquePlayers]);
    const gametypeNames = await getObjectName("gametypes", [...uniqueGametypes]);
    const mapNames = await getObjectName("maps", [...uniqueMaps]);


    for(let i = 0; i < data.length; i++){

        const d = data[i];
        d.gametypeName = gametypeNames[d.gametype_id] ?? "Not Found";
        d.mapName = mapNames[d.map_id] ?? "Not Found";
        const player = getPlayer(playersInfo, d.player_id ,true);
        d.playerName = player.name;
        d.country = player.country
    }

    const totalResults = await getPlayerCTFMatchDataTotalResults(gametypeId, mapId, cat);

    return {data, totalResults};
}

async function getPlayerSingleLifeData(gametypeId, mapId, cat, start, perPage){

    let query = `SELECT player_id,match_id,match_date,playtime,gametype_id,map_id,${cat} as tvalue FROM nstats_player_ctf_match`;

    let where = `WHERE ${cat}> 0 AND playtime>0`;
    const vars = [];

    if(gametypeId !== 0){
        where += ` AND gametype_id=?`;
        vars.push(gametypeId);
    }

    if(mapId !== 0){
        where += ` AND map_id=?`;
        vars.push(mapId);
    }

    query = `${query} ${where} ORDER BY tvalue DESC LIMIT ?, ?`
    vars.push(start, perPage);

    return await simpleQuery(query, vars);
}

async function getPlayerSingleLifeTotalPossible(gametypeId, mapId, cat){

    let query = `SELECT COUNT(*) as total_rows FROM nstats_player_ctf_match`;

    let where = `WHERE ${cat}> 0 AND playtime>0`;
    const vars = [];

    if(gametypeId !== 0){
        where += ` AND gametype_id=?`;
        vars.push(gametypeId);
    }

    if(mapId !== 0){
        where += ` AND map_id=?`;
        vars.push(mapId);
    }

    query = `${query} ${where}`;
 
    const result = await simpleQuery(query, vars);
    
    return result[0].total_rows;
}

export async function getPlayerCTFSingleLifeRecords(gametypeId, mapId, cat, page, perPage){

    if(!bValidPlayerCTFSingleLifeType(cat)) throw new Error(`Not a valid playerCTFSingleLifeRecordType`);

    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);

    if(gametypeId !== gametypeId) gametypeId = 0;
    if(mapId !== mapId) mapId = 0;

    page--;
    page = sanatizePage(page);
    perPage = sanatizePerPage(perPage);

    let start = page * perPage;

    const result = await getPlayerSingleLifeData(gametypeId, mapId, cat, start, perPage);
    const totalResults = await getPlayerSingleLifeTotalPossible(gametypeId, mapId, cat);

    const {uniqueGametypes, uniqueMaps, uniquePlayers} = getUniqueCTFValues(result);

    const playersInfo = await getBasicPlayersByIds([...uniquePlayers]);
    const gametypeNames = await getObjectName("gametypes", [...uniqueGametypes]);
    const mapNames = await getObjectName("maps", [...uniqueMaps]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        r.gametypeName = gametypeNames[r.gametype_id] ?? "Not Found";
        r.mapName = mapNames[r.map_id] ?? "Not Found";
        const player = getPlayer(playersInfo, r.player_id ,true);
        r.playerName = player.name;
        r.country = player.country
    }

    return {"data": result, totalResults};
}

/**
 * 
 * @param {*} cat player-totals,player-matches,player_ctf_totals...
 * @param {*} name column name
 * @returns 
 */
export function getTypeName(cat, name){

    let entries = [];

    switch(cat){
        case "player-totals": { entries = validPlayerTotalTypes; } break;
        case "player-match": { entries = validPlayerMatchTypes; } break;
        case "player-ctf-totals": { entries = validPlayerCTFTotalTypes; } break;
        case "player-ctf-match": { entries = validPlayerCTFMatchTypes; } break;
        case "player-ctf-single-life": { entries = validPlayerCTFSingleLifeTypes; } break;
    }

    for(let i = 0; i < entries.length; i++){

        const {value, displayValue} = entries[i];
        if(value === name) return displayValue;
    }

    return "Not Found";
}