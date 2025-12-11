import { simpleQuery, bulkInsert, mysqlGetColumns } from "./database.js";
import { setValueIfUndefined, calculateKillEfficiency, removeIps, removeUnr, getPlayer, DEFAULT_DATE, DEFAULT_MIN_DATE } from "./generic.mjs";
import { getSettings } from "./sitesettings.js";
import { getObjectName } from "./genericServerSide.mjs";
import { getGametypePosition } from "./rankings.js";
import { getBasicPlayersByIds } from "./players.js";
import { getValidMatches } from "./matches.js";

export default class Player{

    constructor(){}

    async createMasterId(playerName, hwid){

        if(hwid === undefined) hwid = "";

        const query = `INSERT INTO nstats_player VALUES(
            NULL,?,?,"0.0.0.0","xx",0,0)`;

        const result = await simpleQuery(query, [playerName, hwid]);

        return result.insertId;
    }


    async getMasterId(playerName){

        const query = "SELECT id FROM nstats_player WHERE name=?";

        const result = await simpleQuery(query, [playerName]);

        if(result.length === 0){
            return await this.createMasterId(playerName);
        }

        return result[0].id;
    }

    async createGametypeId(playerMasterId, gametypeId, mapId, hwid){

        if(hwid === undefined) hwid = "";

        const query = `INSERT INTO nstats_player_totals VALUES(
            NULL,?,?,?,?,?,
            0,0,0,0,0,
            0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0
            )`;

        const result = await simpleQuery(query, [playerMasterId, DEFAULT_MIN_DATE, DEFAULT_DATE, gametypeId, mapId]);

        return result.insertId;
    }
    
   
    async getMasterIds(playerName){

        return await this.getMasterId(playerName);

    }

    async updatePlayerNameHWID(hwid, playerName){

        const query = "UPDATE nstats_player_totals SET name=? WHERE hwid=?";
        return await simpleQuery(query, [playerName, hwid]);
    }


    async getHWIDMasterId(hwid, playerName){

        const query = `SELECT id FROM nstats_player_totals WHERE hwid=? AND gametype=0`;

        const result = await simpleQuery(query, [hwid]);

        if(result.length === 0) return null;

        await this.updatePlayerNameHWID(hwid, playerName);

        return result[0].id;
    }

    async getHWIDGametypeId(hwid, gametypeId, mapId){

        const query = `SELECT id FROM nstats_player_totals WHERE hwid=? AND gametype=? AND map=?`;

        const result = await simpleQuery(query, [hwid, gametypeId, mapId]);

        if(result.length === 0) return null;

        return result[0].id;
    }

    async getMasterIdsByHWID(hwid, playerName, gametypeId, mapId){

        gametypeId = parseInt(gametypeId);

        // all time totals
        return await this.getHWIDMasterId(hwid, playerName);

    }

    /**
     * 
     * @param {*} playerId The player's masterId or GametypeId
     */
    async incrementMatchesPlayed(playerId){

        const query = `UPDATE nstats_player_totals SET matches=matches+1 WHERE id=?`;

        return await simpleQuery(query, [playerId]);
    }


    async updateWinStats(id, matchResult, gametype, mapId){

        //we dont want to update player totals for spectator matches
        if(matchResult === "s") return;


        if(gametype === undefined) gametype = 0;
        if(mapId === undefined) mapId = 0;

        const winRateString = `winrate = IF(wins > 0 && matches > 0, (wins/matches) * 100, 0)`;

        let query = `UPDATE nstats_player_totals SET wins=wins+1, ${winRateString} WHERE id=? AND gametype=? AND map=?`;

        if(matchResult === "d"){
            query = `UPDATE nstats_player_totals SET draws=draws+1, ${winRateString} WHERE id=? AND gametype=? AND map=?`;
        }else if(matchResult === "l"){
            query = `UPDATE nstats_player_totals SET losses=losses+1, ${winRateString} WHERE id=? AND gametype=? AND map=?`;
        }

        return await simpleQuery(query, [id, gametype, mapId]);

    }


    async getPlayerGametypeWinStats(name){

        const query = "SELECT gametype,map,matches,wins,losses,draws,playtime,accuracy,last FROM nstats_player_totals WHERE gametype!=0 AND map=0 AND name=?";

        const result = await simpleQuery(query, [name]);

        return result;
    }


    async getPlayedMatchIds(id){

        return await getPlayedMatchIds(id);
    }


    async getNames(ids){

        if(ids.length === 0){ resolve(new Map())}

        const query = "SELECT id,name FROM nstats_player_totals WHERE id IN(?)";

        const data = new Map();

        const result = await simpleQuery(query, [ids]);

        for(let i = 0; i < result.length; i++){
            data.set(result[i].id, result[i].name)
        }
        
        return data;     
    }


    async getMaxValue(type){

        type = type.toLowerCase();
        //add winrate
        const validTypes = ["playtime","score","frags","deaths","kills","matches","efficiency","winrate","accuracy","wins"];
        
        let data = 0;

        const index = validTypes.indexOf(type);

        if(index === -1){
            resolve(0);
        }

        const query = `SELECT ${validTypes[index]} as type_result FROM nstats_player_totals WHERE gametype=0 ORDER BY ${validTypes[index]} DESC LIMIT 1`;

        const result = await simpleQuery(query);
    
        if(result.length > 0){
            data = result[0].type_result;
        }
    
        return data;
    }

    async insertScoreHistory(matchId, timestamp, player, score){

        const query = "INSERT INTO nstats_match_player_score VALUES(NULL,?,?,?,?)";

        return await simpleQuery(query, [matchId, timestamp, player, score]);  
    }

    async bulkInsertScoreHistory(vars){

        const query = "INSERT INTO nstats_match_player_score (match_id,timestamp,player,score) VALUES ?";

        return await bulkInsert(query, vars);
    }

    async getMatchDatesAfter(timestamp, player){

        const query = "SELECT match_date,gametype FROM nstats_player_matches WHERE match_date>=? AND player_id=? ORDER BY match_date DESC";

        const result = await simpleQuery(query, [timestamp, player]);

        const data = [];

        for(let i = 0; i < result.length; i++){
            data.push({"date": result[i].match_date, "gametype": result[i].gametype});
        }

        return data;       
    }

    async getAllIps(id){

        const query = "SELECT DISTINCT ip FROM nstats_player_matches WHERE player_id=?";

        const result = await simpleQuery(query, [id]);
                
        const data = [];

        for(let i = 0; i < result.length; i++){

            data.push(result[i].ip);
        }

        return data;
            
    }

    async getIdsWithTheseIps(ips){

        if(ips.length === 0) return [];

        const query = "SELECT DISTINCT player_id FROM nstats_player_matches WHERE ip IN(?)";

        const result = await simpleQuery(query, [ips]);

        return result.map((r) =>{
            return r.player_id;
        });
    }
    


    async getPlayerNames(ids, bIgnorePlayer){

        if(ids === undefined) return [];

        if(ids.length === 0) return [];

        if(bIgnorePlayer === undefined) bIgnorePlayer = false;

        const query = `SELECT id,name,country,face,first,last,playtime,spec_playtime FROM nstats_player_totals WHERE id IN(?)`;
        //SELECT * FROM `nstats_player_totals` WHERE `name` NOT REGEXP '^player[0-9]{1,2}$';
        const altQuery = `SELECT id,name,country,face,first,last,playtime,spec_playtime FROM nstats_player_totals WHERE id IN(?) AND name NOT REGEXP '^player[0-9]{1,2}$'`;
        const vars = [ids];

        return await simpleQuery((bIgnorePlayer) ? altQuery : query, vars);

    }

    async getPossibleAliases(id){

        try{

            const ips = await this.getAllIps(id);

            if(ips.length > 0){

                const ids = await this.getIdsWithTheseIps(ips);
                return await this.getPlayerNames(ids, true);
            }

            return [];

        }catch(err){
            console.trace(err);
        }
    }



    async getGametypeTotals(player, gametype){

        const query = `SELECT frags,deaths,suicides,team_kills,assault_objectives,multi_1,multi_2,multi_3,multi_4,
            multi_5,multi_6,multi_7,spree_1,spree_2,spree_3,spree_4,spree_5,spree_6,spree_7,assault_objectives,playtime,
            matches,mh_kills
            FROM nstats_player_totals WHERE gametype=? AND player_id=?
            `;

        const result = await simpleQuery(query, [gametype, player]);

        if(result.length > 0){
            return result[0];
        }

        return null;
    }

    async getCTFMatchData(playerId, matchId){

        const query = "SELECT * FROM nstats_player_ctf_match WHERE player_id=? AND match_id=?";

        const result = await simpleQuery(query, [playerId, matchId]);

        if(result.length > 0) return result[0];

        return null;
    }

    async getMatchData(playerId, matchId){


        const query = "SELECT * FROM nstats_player_matches WHERE player_id=? AND match_id=? LIMIT 1";

        const result = await simpleQuery(query, [playerId, matchId]);

        if(result.length > 0){

            const ctfData = await this.getCTFMatchData(playerId, matchId);

            if(ctfData !== null){
                result[0].ctfData = ctfData;          
            }
            
            return result[0];
        }

        return null;
    }


    async getPlayerGametypeData(playerName, gametypeId){

        return await simpleQuery("SELECT * FROM nstats_player_totals WHERE name=? AND gametype=?", 
            [playerName, gametypeId]
        );
    }
    


    async bPlayerInMatch(playerId, matchId){

        const query = "SELECT COUNT(*) as total_rows FROM nstats_player_matches WHERE player_id=? AND match_id=?";

        const result = await simpleQuery(query, [playerId, matchId]);

        return result[0].total_rows > 0;
    }
    

    async getPlayerGametypeTotals(playerId, gametypeId){

        const query = "SELECT * FROM nstats_player_totals WHERE player_id=? AND gametype=? LIMIT 1";

        const result = await simpleQuery(query, [playerId, gametypeId]);

        if(result.length > 0){
            return result[0];
        }
        
        return null;
    }


    async getAllGametypeMatchData(playerId, gametypeId){

        const query = "SELECT * FROM nstats_player_matches WHERE player_id=? AND gametype=? ORDER BY match_date ASC";

        return await simpleQuery(query, [playerId, gametypeId]);
    }


    async getBasicInfo(playerId){

        const query = `SELECT name,country FROM nstats_player_totals WHERE id=? AND gametype=0`;

        const result = await simpleQuery(query, [playerId]);

        if(result.length > 0){
            return result[0];
        }

        return null;
    }


    async setLatestHWIDInfo(playerId, hwid){

        const query = "UPDATE nstats_player SET hwid=? WHERE id=?";

        return await simpleQuery(query, [hwid, playerId]);
    }
}

export async function getHWIDNameOverride(hwid){

    const query = `SELECT player_name FROM nstats_hwid_to_name WHERE hwid=?`;

    const result = await simpleQuery(query, [hwid]);

    if(result.length === 0) return null;

    return result[0].player_name;

}

export async function getPlayerById(id){

    id = parseInt(id);

    const query = `SELECT nstats_player.id,
    nstats_player.name,
    nstats_player.country,
    nstats_player.face,
    nstats_player_totals.first, nstats_player_totals.last,
    nstats_player_totals.matches,               nstats_player_totals.wins,               nstats_player_totals.losses,
    nstats_player_totals.draws,                 nstats_player_totals.winrate,            nstats_player_totals.playtime,
    nstats_player_totals.team_0_playtime,       nstats_player_totals.team_1_playtime,    nstats_player_totals.team_2_playtime,
    nstats_player_totals.team_3_playtime,       nstats_player_totals.spec_playtime,      nstats_player_totals.first_bloods,
    nstats_player_totals.frags,                 nstats_player_totals.score,              nstats_player_totals.kills,
    nstats_player_totals.deaths,                nstats_player_totals.suicides,           nstats_player_totals.team_kills,
    nstats_player_totals.spawn_kills,           nstats_player_totals.efficiency,         nstats_player_totals.multi_1,
    nstats_player_totals.multi_2 ,              nstats_player_totals.multi_3,            nstats_player_totals.multi_4,
    nstats_player_totals.multi_5,               nstats_player_totals.multi_6,            nstats_player_totals.multi_7,
    nstats_player_totals.multi_best,            nstats_player_totals.spree_1,            nstats_player_totals.spree_2,
    nstats_player_totals.spree_3,               nstats_player_totals.spree_4,            nstats_player_totals.spree_5,
    nstats_player_totals.spree_6,               nstats_player_totals.spree_7,            nstats_player_totals.spree_best,
    nstats_player_totals.best_spawn_kill_spree, nstats_player_totals.assault_objectives,  nstats_player_totals.accuracy,
    nstats_player_totals.k_distance_normal,     nstats_player_totals.k_distance_long,    nstats_player_totals.k_distance_uber,
    nstats_player_totals.headshots,             nstats_player_totals.shield_belt,        nstats_player_totals.amp,
    nstats_player_totals.amp_time,              nstats_player_totals.invisibility,       nstats_player_totals.invisibility_time,
    nstats_player_totals.pads,                  nstats_player_totals.armor,              nstats_player_totals.boots,
    nstats_player_totals.super_health,          nstats_player_totals.mh_kills,           nstats_player_totals.mh_kills_best_life,
    nstats_player_totals.mh_kills_best,         nstats_player_totals.mh_deaths,
    nstats_player_totals.mh_deaths_worst 
    FROM nstats_player 
    INNER JOIN nstats_player_totals ON nstats_player_totals.player_id = nstats_player.id AND nstats_player_totals.gametype=0 AND nstats_player_totals.map=0
    WHERE nstats_player.id=?`;

    const result = await simpleQuery(query, [id]);

    if(result.length === 0) return null;

    return result[0];

}

export async function getProfileGametypeStats(playerId){

    const query = `SELECT gametype,last,matches,wins,playtime,spec_playtime,score,
    kills,deaths,suicides,team_kills,spawn_kills,efficiency,accuracy
    FROM nstats_player_totals WHERE gametype!=0 AND map=0 AND player_id=?`;

    const result = await simpleQuery(query, [playerId]);

    const gametypeIds = new Set(result.map((r) =>{
        return r.gametype;
    }));

    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        r.gametypeName = (gametypeNames[r.gametype] !== undefined) ? gametypeNames[r.gametype] : "Not Found";
    }

    return result;
}


/**
 * get all frag data for every gametype and map except all time total 0,0
 */
export async function getProfileFragStats(playerId){

    const query = `SELECT gametype,map,frags,suicides,team_kills,kills,deaths,efficiency,
    headshots,spawn_kills,best_spawn_kill_spree,k_distance_normal,k_distance_long,
    k_distance_uber FROM nstats_player_totals WHERE player_id=?`;

    const result = await simpleQuery(query, [playerId]);

    const mapIds = new Set();
    const gametypeIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        gametypeIds.add(r.gametype);
        mapIds.add(r.map);
    }

    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    const mapNames = await getObjectName("maps", [...mapIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.gametype === 0){
            r.gametypeName = "All";
        }else{
            r.gametypeName = gametypeNames[r.gametype] ?? "Not Found";
        }

        if(r.map === 0){
            r.mapName = "All";
        }else{
            r.mapName = (mapNames[r.map] !== undefined) ? mapNames[r.map] : "Not Found";
        }

    }

    return {"data": result, "gametypes": gametypeNames, "maps": mapNames};
}


export async function getAllRankings(playerId){

    const query = `SELECT gametype,matches,playtime,ranking,ranking_change,last_active
    FROM nstats_ranking_player_current WHERE player_id=?`;

    const result = await simpleQuery(query, [playerId]);

    const gametypeIds = [...new Set(result.map((r) =>{
        return r.gametype;
    }))];

    const gametypeNames = await getObjectName("gametypes", gametypeIds);

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        r.gametypeName = gametypeNames[r.gametype] ?? "Not Found";
        r.position = await getGametypePosition(r.ranking, r.gametype);
    }

    return result;
}


export async function getSpecialEvents(playerId){

    const query = `SELECT gametype,map,matches,playtime,spree_1,spree_2,spree_3,spree_4,spree_5,spree_6,spree_7,spree_best,
    multi_1,multi_2,multi_3,multi_4,multi_5,multi_6,multi_7,multi_best
    FROM nstats_player_totals WHERE (player_id=? || id=?)`;

    const result = await simpleQuery(query, [playerId, playerId]);

    const gametypeIds = new Set();
    const mapIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.gametype !== 0) gametypeIds.add(r.gametype);
        if(r.map !== 0) mapIds.add(r.map);
    }

    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    const mapNames = await getObjectName("maps", [...mapIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.gametype !== 0){
            r.gametypeName = gametypeNames[r.gametype] ?? "Not Found";
        }else{
            r.gametypeName = "All";
        }

        if(r.map !== 0){
            r.mapName = mapNames[r.map] ?? "Not Found";
        }else{
            r.mapName = "All";
        }
    }

    return result;
}

async function getUniqueHWIDsFromMatches(playerId){

    const query = `SELECT hwid FROM nstats_player_matches WHERE player_id=? AND hwid!="" GROUP BY hwid`;

    const result = await simpleQuery(query, [playerId]);

    return result.map((r) =>{
        return r.hwid;
    });
}

export async function getPossibleAliasesByHWID(playerId){

    const hwids = await getUniqueHWIDsFromMatches(playerId);

    if(hwids.length === 0) return [];

    const query = `SELECT player_id,SUM(playtime) as playtime,SUM(spec_playtime) as spec_playtime,
    COUNT(*) as total_matches,MIN(match_date) as first_match,MAX(match_date) as last_match
    FROM nstats_player_matches WHERE hwid IN (?) AND player_id!=? GROUP BY player_id`;

    const result = await simpleQuery(query, [hwids, playerId]);

    const playerIds = new Set(result.map((r) =>{
        return r.player_id;
    }));


    const players = await getBasicPlayersByIds([...playerIds]);
    
    for(let i = 0; i < result.length; i++){

        const r = result[i];
        r.player = getPlayer(players, r.player_id, true);
    }

    return result;
}


async function getPlayedMatchIds(id){

    const query = "SELECT match_id FROM nstats_player_matches WHERE player_id=?";

    const result = await simpleQuery(query, [id]);

    const ids = [];

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        ids.push(r.match_id);
    }

    return ids;

}

/**
* Only get player match ids if they have the min playtime and player count
*/
async function getOnlyValidPlayerMatchIds(playerId, minPlayers, minPlaytime){

    const ids = await getPlayedMatchIds(playerId);

    if(ids.length === 0) return [];

    const validIds = await getValidMatches(ids, minPlayers, minPlaytime);

    return validIds;
}

export async function getRecentMatches(id, page, forcePerPage){

    if(page === undefined){
        page = 1;
    }else{
        page = parseInt(page);
        if(page !== page) page = 1;
    }

    page--;

    const settings = await getSettings("Matches Page");

  
    let perPage = 25;

    if(forcePerPage !== undefined){
        perPage = forcePerPage;
    }else{
        perPage = settings["Recent Matches Per Page"] ?? 25;
    }

    perPage = parseInt(perPage);
    if(perPage !== perPage) perPage = 25;

    const validMatchIds = await getOnlyValidPlayerMatchIds(id, settings["Minimum Players"], settings["Minimum Playtime"]);

    if(validMatchIds.length === 0) return [];
    
    //const ignoreMatchIds = await this.getValidPlayedMatchIds(id, settings["Minimum Players"]);

    const query = `SELECT nstats_player_matches.match_id,
    nstats_player_matches.match_date,
    nstats_player_matches.map_id,
    nstats_player_matches.gametype as gametype_id, 
    nstats_player_matches.spectator, 
    nstats_player_matches.match_result,
    nstats_player_matches.playtime, 
    nstats_player_matches.team,
    nstats_matches.server,
    nstats_matches.total_teams,
    nstats_matches.players,
    nstats_matches.dm_winner,
    nstats_matches.dm_score,
    nstats_matches.team_score_0,
    nstats_matches.team_score_1,
    nstats_matches.team_score_2,
    nstats_matches.team_score_3,
    nstats_matches.mh,
    nstats_matches.end_type,
    if(nstats_matches.dm_winner != 0, nstats_player.name, "") as dmWinnerName,
    nstats_servers.name as serverName,
    nstats_gametypes.name as gametypeName,
    nstats_maps.name as mapName
    FROM nstats_player_matches
    INNER JOIN nstats_matches ON nstats_player_matches.match_id = nstats_matches.id
    LEFT JOIN nstats_player ON nstats_player.id = nstats_matches.dm_winner
    LEFT JOIN nstats_servers ON nstats_servers.id = nstats_matches.server
    LEFT JOIN nstats_gametypes ON nstats_gametypes.id = nstats_matches.gametype
    LEFT JOIN nstats_maps ON nstats_maps.id = nstats_matches.map

    WHERE nstats_player_matches.player_id=? AND nstats_player_matches.match_id IN (?) AND nstats_player_matches.playtime > 0 AND nstats_player_matches.playtime >=? 
    ORDER BY nstats_player_matches.match_date DESC, nstats_player_matches.match_id DESC LIMIT ?,?`;
    const start = perPage * page;
    const vars = [id, validMatchIds, settings["Minimum Playtime"], start, perPage];


    const result = await simpleQuery(query, vars);

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        r.mapName = removeUnr(r.mapName);
    }

    return result;

}


export async function getTotalMatches(id){

    const settings = await getSettings("Matches Page");

    const validIds = await getOnlyValidPlayerMatchIds(id, settings["Minimum Players"], settings["Minimum Playtime"]);

    if(validIds.length === 0) return 0;

    const query = "SELECT COUNT(*) as total_matches FROM nstats_player_matches WHERE player_id=? AND match_id IN(?) AND playtime > 0 AND playtime >=?";
    const vars = [id, validIds, settings["Minimum Playtime"]];

    const result = await simpleQuery(query, vars);

    return result[0].total_matches;

}

export async function getProfileMapStats(playerId){

    const query = `SELECT first,last,map,gametype,matches,wins,draws,losses,winrate,playtime,spec_playtime 
    FROM nstats_player_totals WHERE map!=0 AND player_id=?`;

    const result = await simpleQuery(query, [playerId]);
    
    const mapIds = new Set();
    const gametypeIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.gametype !== 0){
            gametypeIds.add(r.gametype);
        }

        mapIds.add(r.map);
    }


    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    const mapNames = await getObjectName("maps", [...mapIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        r.mapName = mapNames[r.map] ?? "Not Found";
    }

    return {"gametypeNames": gametypeNames, "data": result}
}


export async function deletePlayerScoreData(playerId){

    const query = `DELETE FROM nstats_match_player_score WHERE player=?`;

    return await simpleQuery(query, [playerId]);
}

