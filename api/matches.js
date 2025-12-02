import { mysqlGetColumns, simpleQuery } from "./database.js";
import CTF from "./ctf.js";
import Gametypes from "./gametypes.js";
import Maps, { getImages as getMapImages } from "./maps.js";
import Servers from "./servers.js";
import { getUniqueValues, setIdNames, removeUnr, getPlayer, cleanMapName, sanatizePage, sanatizePerPage } from "./generic.mjs";
import { getObjectName } from "./genericServerSide.mjs";
import { deleteFromDatabase as logsDeleteFromDatabase } from "./logs.js";
import {getSettings} from "./sitesettings.js";
import { getAllInMatch, getBasicPlayersByIds, deletePlayersMatchData, recalculateTotals as recalculatePlayerTotals } from "./players.js";
import { deleteMatch as assaultDeleteMatch } from "./assault.js";
import { recalculateSelectedTotals as recaclFaceTotals } from "./faces.js";
import { deleteMatchData as deleteMatchHeadshots } from "./headshots.js";
import { deleteMatchData as deleteMatchSprees } from "./sprees.js";
import { deleteMatchData as deleteMatchTeleFrags, recalculateTelefragPlayersTotals } from "./telefrags.js";
import { deleteMatches as deleteMatchCTFData, recalculatePlayers as recalcultePlayersCTF, recalculateCapRecordsAfterMatchDelete } from "./ctf.js";
import { recalculateMapControlPointTotals, deleteMatchData as deleteMatchDomData } from "./domination.js";
import { deleteMatchData as deleteMatchPings } from "./pings.js";
import { deleteMatchTeamChanges } from "./teams.js";
import { deleteMatchData as deleteMatchConnections } from "./connections.js";
import { deleteMatchData as deleteMatchItems } from "./items.js";
import { deleteMatchData as deleteMatchCombogibData } from "./combogib.js";
import { deleteMatchData as deleteMatchMonsterHuntData} from "./monsterhunt.js";
import { deleteMatchData as deleteMatchWeaponData } from "./weapons.js";
import { deleteMatchData as deleteMatchPowerupData } from "./powerups.js";
import { deleteMatchData as deleteMatchRankingData } from "./rankings.js";
import { deleteMatchData as deleteMatchWinRateData } from "./winrate.js";
import { recalculateTotals as recalculateMapTotals } from "./maps.js";
import { recalculateGametypeTotals } from "./gametypes.js";
import { recalculateTotals as recalculateServerTotals } from "./servers.js";
import { deleteMatchData as deleteMatchKills } from "./kills.js";
import { recalculateTotals as recalculateVoiceTotals } from "./voices.js";
import { recalculateTotals as recalculateCountryTotals } from "./countriesmanager.js";
import { deleteLogImportInfo } from "./logs.js";


const VALID_SEARCH_SORT_BY = [
    "date",
    "gametype",
    "map",
    "server",
    "players",
    "playtime"
];

export default class Matches{

    constructor(){}

    async insertMatch(date, server, matchString, gametype, map, version, minVersion, admin, email, region, motd, mutators, playtime, endType, start, end, insta,
        teamGame, gameSpeed, hardcore, tournament, airControl, useTranslocator, friendlyFireScale, netMode, maxSpectators, 
        maxPlayers, totalTeams, totalPlayers, timeLimit, targetScore, dmWinner, dmScore, redScore, blueScore, greenScore, yellowScore, bMonsterHunt){

        mutators = mutators.toString();

        if(hardcore === undefined) hardcore = 0;
        if(tournament === undefined) tournament = 0;
        if(airControl === undefined) airControl = 0;
        if(useTranslocator === undefined) useTranslocator = 0;
        if(friendlyFireScale === undefined) friendlyFireScale = 0;
        if(netMode === undefined) netMode = 0;
        if(timeLimit === undefined) timeLimit = 0;
        if(targetScore === undefined) targetScore = 0;


        const query = "INSERT INTO nstats_matches VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0,0,?,0,0,0,0,0,0,0,0,0)";

        const vars = [
            matchString,
            date, 
            server, 
            gametype,
            map, 
            version, 
            minVersion, 
            admin, 
            email, 
            region, 
            motd, 
            mutators,
            playtime, 
            endType, 
            start, 
            end, 
            insta || 0, 
            teamGame, 
            gameSpeed, 
            hardcore, 
            tournament,
            airControl, 
            useTranslocator, 
            friendlyFireScale, 
            netMode,
            maxSpectators,
            maxPlayers,
            totalTeams,
            totalPlayers,
            timeLimit,
            targetScore,
            dmWinner, 
            dmScore, 
            redScore,
            blueScore, 
            greenScore, 
            yellowScore,
            bMonsterHunt

        ];

        const result = await simpleQuery(query, vars);

        return result.insertId;

    }

    async getWinners(matchIds){

        if(matchIds === undefined) return [];
        if(matchIds.length === 0) return [];

        const query = "SELECT id,team_game,dm_winner,dm_score,team_score_0,team_score_1,team_score_2,team_score_3,total_teams,gametype,end_type,mh FROM nstats_matches WHERE id IN(?)";

        return await simpleQuery(query, [matchIds]);
    }


    async debugGetAll(){

        const query = "SELECT * FROM nstats_matches ORDER BY date DESC, id DESC LIMIT 25";

        return await simpleQuery(query);
    }


    async getTotal(gametype){

        if(gametype === undefined){
            gametype = 0;
        }else{
            gametype = parseInt(gametype);
            if(gametype !== gametype) gametype = 0;
        }
        
        const defaultQuery = `SELECT COUNT(*) as total_matches FROM nstats_matches WHERE players>=? AND playtime>=?`;
        const gametypeQuery = `SELECT COUNT(*) as total_matches FROM nstats_matches WHERE gametype=? AND players>=? AND playtime>=?`;

        const settings = await getSettings("Matches Page");
        const vars = [settings["Minimum Players"], settings["Minimum Playtime"]];

        let query = "";

        if(gametype !== 0){
            query = gametypeQuery;
            vars.unshift(gametype);
        }else{
            query = defaultQuery;
        }

        const result = await simpleQuery(query, vars);

        return result[0].total_matches;
    }

    async getServerNames(ids){

        if(ids.length === 0) return {};

        const query = "SELECT id,server FROM nstats_matches WHERE id IN(?)";

        const result = await simpleQuery(query, [ids]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            
            data[r.id] = r.server;
        }

        return data;
    }


    async getPlayerCount(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,players FROM nstats_matches WHERE id IN(?)";

        const data = {};

        const result = await simpleQuery(query, [ids]);

        for(let i = 0; i < result.length; i++){

            data[result[i].id] = result[i].players;
        }

        return data;
        
    }


    async getFirst(){

        const query = "SELECT MIN(date) as first_match FROM nstats_matches WHERE players>=? AND playtime>=?";

        const settings = await getSettings("Matches Page");

        const result = await simpleQuery(query, [settings["Minimum Players"], settings["Minimum Playtime"]]);

        if(result.length > 0){
            return result[0].first_match;
        }

        return 0;

    }

    async getLast(){

        const query = "SELECT MAX(date) as last_match FROM nstats_matches WHERE players>=? AND playtime>=?";

        const settings = await getSettings("Matches Page");
        const result = await simpleQuery(query, [settings["Minimum Players"], settings["Minimum Playtime"]]);

        if(result.length > 0){
            return result[0].last_match;
        }

        return 0;
    }


    async getMatchLogFileNames(matchIds){

        if(matchIds.length === 0) return [];

        const query = "SELECT name,match_id FROM nstats_logs WHERE match_id IN (?)";

        return await simpleQuery(query, [matchIds]);    
    }


    async getLogIds(logNames){

        if(logNames.length === 0) return [];

        const query = "SELECT name,match_id,imported FROM nstats_logs WHERE name IN (?) ORDER BY match_id DESC";

        return await simpleQuery(query, [logNames]);
    }


    async getLogMatches(logNames){

        if(logNames.length === 0) return [];

        const query = "SELECT id,name,match_id FROM nstats_logs WHERE name IN (?) ORDER BY match_id DESC";

        return await simpleQuery(query, [logNames]);
    }



    async deleteMatchQuery(id){

        const query = "DELETE FROM nstats_matches WHERE id=?";

        return await simpleQuery(query, [id]);
    }


    async changeDMWinner(oldPlayerId, newPlayerId){

        const query = `UPDATE nstats_matches SET dm_winner=? WHERE dm_winner=?`;
        return await simpleQuery(query, [newPlayerId, oldPlayerId]);
    }

    async renameMatchDmWinner(matchId, name, score){

        return await simpleQuery("UPDATE nstats_matches SET dm_winner=?,dm_score=? WHERE id=?", [name, score, matchId]);
    }

    async getValidDMMatches(matchIds){

        if(matchIds.length) return [];


        const query = `SELECT id FROM nstats_matches WHERE dm_winner!=0 AND id IN(?)`;

        const result = await simpleQuery(query, [matchIds]);

        return result.map((r) => r.id);

    }

    async getDmWinner(matchId){

        const query = "SELECT dm_winner FROM nstats_matches WHERE id=?";
        const result = await simpleQuery(query, [matchId]);

        if(result.length > 0){
            return result[0].dm_winner;
        }

        return "";
    }


    async getDmWinners(matchIds, playerManager){

        if(matchIds.length === 0) return {};

        const query = `SELECT id,dm_winner FROM nstats_matches WHERE dm_winner!=0 AND id IN(?)`;

        const result = await simpleQuery(query, [matchIds]);

        const uniquePlayers = new Set();

        for(let i = 0; i < result.length; i++){

            uniquePlayers.add(result[i].dm_winner);
        }

        const playersInfo = await playerManager.getNamesByIds([...uniquePlayers], true);

        const matches = {};


        for(let i = 0; i < result.length; i++){
            const r = result[i];
            matches[r.id] = r.dm_winner;
        }

        return {"matchWinners": matches, "players": playersInfo};

    }

    async getPlayerMatchTopScore(matchId){

        return await simpleQuery("SELECT player_id,score FROM nstats_player_matches WHERE match_id=? ORDER BY score DESC LIMIT 1",[matchId]);
    }


    async recalculateDmWinner(matchId, playerManager){

        try{

            const score = await this.getPlayerMatchTopScore(matchId);

            if(score.length > 0){

                const playerName = await playerManager.getNames([score[0].player_id]);

                if(playerName.size > 0){

                    await this.renameMatchDmWinner(matchId, playerName.get(score[0].player_id), score[0].score);
                }

            }else{
                console.log("Can't update dm winner, there is no player data found for that match.");
            }

        }catch(err){
            console.trace(err);
        }
    }


    async getAllPlayerMatchIds(playerId){

        try{

            const result = await simpleQuery("SELECT match_id FROM nstats_player_matches WHERE player_id=?",[playerId]);

            const data = [];

            for(let i = 0; i < result.length; i++){

                data.push(result[i].match_id);
            }
            
            return data;

        }catch(err){
            console.trace(err);
            return [];
        }
    }

    async getPlayerMatches(playerIds){

        if(playerIds.length === 0) return;

        return await simpleQuery("SELECT * FROM nstats_player_matches WHERE player_id IN (?)", [playerIds]);
    }

    async deletePlayerMatchesData(ids){

        if(ids.length === 0) return;

        await simpleQuery("DELETE FROM nstats_player_matches WHERE id IN (?)", [ids]);
    }


    async changePlayerIds(oldId, newId){

        const query = `UPDATE nstats_player_matches SET player_id=? WHERE player_id=?`;
        return await simpleQuery(query, [newId, oldId]);
    }

    async deletePlayerMatchRows(rowIds){

        if(rowIds.length === 0) return;

        const query = `DELETE FROM nstats_player_matches WHERE id IN(?)`;

        return await simpleQuery(query, [rowIds]);
    }

    async mergePlayerMatches(oldId, newId){

        await this.changePlayerIds(oldId, newId);

        const duplicateMatchData = await this.getDuplicatePlayerEntries(newId);


        for(let i = 0; i < duplicateMatchData.length; i++){

            const matchId = duplicateMatchData[i];

            const rowsToDelete = await this.mergePlayerMatchData(matchId, newId);
            await this.deletePlayerMatchRows(rowsToDelete);
        }
    }


    async getAllPlayerMatches(player){

        return await simpleQuery("SELECT * FROM nstats_player_matches WHERE player_id=? ORDER BY id ASC", [player]);
    }

    async getAllPlayerMatchIds(playerId){
        const data = await simpleQuery("SELECT match_id FROM nstats_player_matches WHERE player_id=? ORDER BY id ASC", [playerId]);

        const ids = [];

        for(let i = 0; i < data.length; i++){

            ids.push(data[i].match_id);
        }

        return ids;
    }

    async getMatchGametypes(ids){

        if(ids.length === 0) return {};

        const data = await simpleQuery("SELECT id,gametype FROM nstats_matches WHERE id IN (?)", [ids]);
        
        const obj = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];
            obj[d.id] = d.gametype;
        }

        return obj;
    }
    

    /**
     * 
     * @param {*} gametypeId if 0 get every single match else only get with gametypeID
     * @returns 
     */
    async getAll(gametypeId){

        if(gametypeId !== 0){
            return await simpleQuery("SELECT * FROM nstats_matches WHERE gametype=?",[gametypeId]);
        }else{
            return await simpleQuery("SELECT * FROM nstats_matches");
        }
    }


    async deleteMultiple(ids){

        if(ids.length === 0) return;

        await simpleQuery("DELETE FROM nstats_matches WHERE id IN (?)", [ids]);
    }

    async deleteMatches(ids){

        try{

            if(ids.length === 0) return;

            await this.deletePlayerScores(ids);
            await this.deleteTeamChanges(ids);
            await this.deleteMultiple(ids);

        }catch(err){
            console.trace(err);
        }
    }


    async getMatchesBetween(start, end){

        const query = "SELECT COUNT(*) as total_matches FROM nstats_matches WHERE date>? AND date<=?";

        const data = await simpleQuery(query, [start, end]);

        if(data.length > 0) return data[0].total_matches;

        return 0;
    }

    async getValidMatches(ids, minPlayers, minPlaytime){

        return await getValidMatches(ids, minPlayers, minPlaytime);
    }


    async getInvalidMatches(minPlayers, minPlaytime){

        const query = "SELECT id,date,server,gametype,map,players,playtime FROM nstats_matches WHERE players<? OR playtime<? ORDER BY date DESC, id DESC";
        const vars = [minPlayers, minPlaytime];
        return await simpleQuery(query, vars);
    }

    async getTeamMateMatchesBasic(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,date,server,gametype,map,playtime,total_teams,players,team_game,team_score_0,team_score_1,team_score_2,team_score_3 FROM nstats_matches WHERE id IN(?) AND team_game=1 ORDER BY date DESC";

        return simpleQuery(query, [ids]);
    }

    async returnOnlyTeamGames(matchIds){


        if(matchIds.length === 0) return [];

        const query = "SELECT id FROM nstats_matches WHERE id IN (?) AND team_game=1";

        const result = await simpleQuery(query, [matchIds]);

        const data = [];

        for(let i = 0; i < result.length; i++){

            const id = result[i].id;

            data.push(id);
        }

        return data;

    }


    async bAllPlayedOnSameTeam(matchId, playerIds){

        if(playerIds.length === 0) return false;

        const query = "SELECT DISTINCT team FROM nstats_player_matches WHERE match_id=? AND player_id IN (?) AND playtime>0";

        const result = await simpleQuery(query, [matchId, playerIds]);

        let bPlayedOnSameTeam = false;

        if(result.length === 1) bPlayedOnSameTeam = true;
        
        if(result.length === 0){
            return {"team": 255, "sameTeam": false};
        }else{
            return {"team": result[0].team, "sameTeam": bPlayedOnSameTeam};
        }
    }

    async getDates(matchIds){

        if(matchIds.length === 0) return {};

        const query = "SELECT id,date FROM nstats_matches WHERE id IN (?)";

        const result = await simpleQuery(query, [matchIds]);

        const obj = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            obj[r.id] = r.date;
        }

        return obj;
    }

    async getAllIds(){

        const query = "SELECT id FROM nstats_matches ORDER BY id ASC";

        const result = await simpleQuery(query);

        const ids = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i].id;

            ids.push(r);
        }

        return ids;
    }


    async getBasicByIds(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,date,server,gametype,map,playtime,total_teams,players FROM nstats_matches WHERE id IN(?) ORDER BY date ASC";

        const result =  await simpleQuery(query, [ids]);

        const uniqueServers = getUniqueValues(result, "server");
        const uniqueGametypes = getUniqueValues(result, "gametype");
        const uniqueMaps = getUniqueValues(result, "map");

        const serverManager = new Servers();
        const serverNames = await serverManager.getNames(uniqueServers);

        const gametypeManager = new Gametypes();
        const gametypeNames = await gametypeManager.getNames(uniqueGametypes);

        const mapManager = new Maps();
        const mapNames = await mapManager.getNames(uniqueMaps);

        setIdNames(result, serverNames, "server", "serverName");
        setIdNames(result, gametypeNames, "gametype", "gametypeName");
        setIdNames(result, mapNames, "map", "mapName");

        return result;
    }


    /**
     * 
     * @param {*} matchIds 
     * @returns serverId, mapId, gametypeId, date
     */
    async getMatchBasicInfo(matchIds){

        if(matchIds.length === 0) return {};

        const query = `SELECT id,server,map,gametype,date FROM nstats_matches WHERE id IN(?)`;

        const result = await simpleQuery(query, [matchIds]);

        const obj = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            obj[r.id] = r;
        }

        return obj;
    }

    async getMatchCountPerDay(startTimestamp, endTimestamp){

        const day = (60 * 60) * 24;

        const query = `SELECT date FROM nstats_matches WHERE date>=? AND date<=?`;

        const result = await simpleQuery(query, [startTimestamp, endTimestamp]);

        const data = {};

        let timestamp = startTimestamp;
        let dayIndex = 0;

        while(timestamp < endTimestamp){

            data[dayIndex] = 0;

            timestamp += day;
            dayIndex++;
        }

        for(let i = 0; i < result.length; i++){

            const d = result[i].date;

            const diff = d - startTimestamp;

            let currentDay = 0;

            if(diff !== 0) currentDay = Math.floor(diff / day);

            data[currentDay]++;
        }

        return data;
    }


    async changeMapId(oldId, newId){

        const query = `UPDATE nstats_matches SET map=? WHERE map=?`;

        return await simpleQuery(query, [newId, oldId]);
    }
}

/**
 * Get all unique map ids, gametype ids, server ids from an array of match results
 */
export function getUniqueMGS(matches){

    const serverIds = new Set();
    const gametypeIds = new Set();
    const mapIds = new Set();

    for(let i = 0; i < matches.length; i++){

        const {server, gametype, map} = matches[i];

        serverIds.add(server);
        gametypeIds.add(gametype);
        mapIds.add(map);
    }
    
    return {
        "servers": [...serverIds],
        "gametypes": [...gametypeIds],
        "maps": [...mapIds]
    };
}


export async function getMatchIdFromHash(hash){

    const query = `SELECT id FROM nstats_matches WHERE match_hash=?`;

    const result = await simpleQuery(query, [hash]);

    if(result.length === 0) return 0;

    return result[0].id;
}


export async function getMatch(id){

    const query = `SELECT 
        nstats_matches.id,                   nstats_matches.match_hash,       nstats_matches.date,
        nstats_matches.server,               nstats_matches.gametype,         nstats_matches.map,
        nstats_matches.version,              nstats_matches.min_version,      nstats_matches.admin,
        nstats_matches.email,                nstats_matches.region,           nstats_matches.motd,
        nstats_matches.mutators,             nstats_matches.playtime,         nstats_matches.end_type,
        nstats_matches.start,                nstats_matches.end,              nstats_matches.insta,
        nstats_matches.team_game,            nstats_matches.game_speed,       nstats_matches.hardcore,
        nstats_matches.tournament,           nstats_matches.air_control,      nstats_matches.use_translocator,
        nstats_matches.friendly_fire_scale,  nstats_matches.net_mode,         nstats_matches.max_spectators,
        nstats_matches.max_players,          nstats_matches.total_teams,      nstats_matches.players,
        nstats_matches.time_limit,           nstats_matches.target_score,     nstats_matches.dm_winner,
        nstats_matches.dm_score,             nstats_matches.team_score_0,     nstats_matches.team_score_1,
        nstats_matches.team_score_2,         nstats_matches.team_score_3,     nstats_matches.attacking_team,
        nstats_matches.assault_caps,         nstats_matches.dom_caps,         nstats_matches.mh_kills,
        nstats_matches.mh,                   nstats_matches.views,            nstats_matches.ping_min_average,
        nstats_matches.ping_average_average, nstats_matches.ping_max_average, nstats_matches.amp_kills,
        nstats_matches.amp_kills_team_0,     nstats_matches.amp_kills_team_1, nstats_matches.amp_kills_team_2,
        nstats_matches.amp_kills_team_3,
        IF(nstats_servers.display_name = "", nstats_servers.name, nstats_servers.display_name) as serverName,
        nstats_gametypes.name as gametypeName,
        nstats_maps.name as mapName,
        IF(nstats_matches.dm_winner !=0 , nstats_player.name, "") as dmWinnerName,
        IF(nstats_matches.dm_winner !=0 , nstats_player.country, "") as dmWinnerCountry
        FROM nstats_matches 
        LEFT JOIN nstats_servers ON nstats_servers.id = nstats_matches.server
        LEFT JOIN nstats_gametypes ON nstats_gametypes.id = nstats_matches.gametype
        LEFT JOIN nstats_maps ON nstats_maps.id = nstats_matches.map
        LEFT JOIN nstats_player ON nstats_player.id = nstats_matches.dm_winner
        WHERE nstats_matches.id=?`;

    const result = await simpleQuery(query, [id]);


    if(result.length === 0) return null;

    const r = result[0];

    r.mapName = removeUnr(r.mapName);

    const images = getMapImages([r.mapName]);

    const imageKeys = Object.keys(images);
    
    if(imageKeys.length > 0){
        r.image = images[imageKeys[0]];
    }else{
        r.image = "default";
    }

    return r;
}


export async function getValidMatches(ids, minPlayers, minPlaytime){

    if(ids.length === 0) return [];

    const query = "SELECT id FROM nstats_matches WHERE id IN (?) AND players>=? AND playtime>=?";
    const vars = [ids, minPlayers, minPlaytime];

    const result = await simpleQuery(query, vars);

    const newIds = [];

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        newIds.push(r.id);
    }

    return newIds;
}


export async function getSearchTotalMatches(serverId, gametypeId, mapId){

    serverId = parseInt(serverId);
    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);

    if(serverId !== serverId) throw new Error(`ServerId must be an integer`);
    if(gametypeId !== gametypeId) throw new Error(`GametypeId must be an integer`);
    if(mapId !== mapId) throw new Error(`MapId must be an integer`);

    let query = `SELECT COUNT(*) as total_rows FROM nstats_matches`;

    const vars = [];

    if(serverId !== 0){
        query += ` WHERE server=?`;
        vars.push(serverId);
    }

    if(gametypeId !== 0){
        
        if(vars.length === 0){
            query += ` WHERE gametype=?`;
        }else{
            query += ` AND gametype=?`;
        }

        vars.push(gametypeId);
    }

    if(mapId !== 0){

        if(vars.length === 0){
            query += ` WHERE map=?`;
        }else{
            query += ` AND map=?`;
        }

        vars.push(mapId);
    }

    const result = await simpleQuery(query, vars);

    return result[0].total_rows;
}


/**
 * 
 * @param {const query = `SELECT nstats_player_matches.match_id,
    nstats_player_matches.match_date,
    nstats_player_matches.map_id,
    nstats_player_matches.gametype as gametype_id, 
    nstats_player_matches.spectator, 
    nstats_player_matches.played, 
    nstats_player_matches.winner, 
    nstats_player_matches.draw,
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
    nstats_matches.end_type
    FROM nstats_player_matches
    INNER JOIN nstats_matches ON nstats_player_matches.match_id = nstats_matches.id
    WHERE nstats_player_matches.player_id=? AND nstats_player_matches.match_id IN (?) AND nstats_player_matches.playtime > 0 AND nstats_player_matches.playtime >=? 
    ORDER BY nstats_player_matches.match_date DESC, nstats_player_matches.match_id DESC LIMIT ?,?`;} sortBy 

 */

function createAdminSearchQuery(sortBy, order, selectedServer, selectedGametype, selectedMap, page, perPage, validSortBys){

    if(validSortBys.indexOf(sortBy) === -1) throw new Error(`Not a valid sort by`);

    if(order !== "ASC" && order !== "DESC") order = "DESC";

    const index = validSortBys.indexOf(sortBy);

    const vars = [];

    let query = `SELECT 
    nstats_matches.id,
    nstats_matches.match_hash,
    nstats_matches.date,
    nstats_matches.server,
    nstats_matches.gametype,
    nstats_matches.map,
    nstats_matches.players,
    nstats_matches.playtime`;

    if(sortBy === "gametype"){

        query += `,nstats_gametypes.name as gametypeName`;

    }else if(sortBy === "map"){
        query += `,nstats_maps.name as mapName`;
    }else if(sortBy === "server"){
        query += `,nstats_servers.name as serverName`;
    }


    let finalSortBy = validSortBys[index];

    query += ` FROM nstats_matches`;


    if(selectedServer !== 0){
        query += ` WHERE server=?`;
        vars.push(selectedServer);
    }

    if(selectedGametype !== 0){

        if(vars.length === 0){
            query += ` WHERE gametype=?`;      
        }else{
            query += ` AND gametype=?`;
        }
        vars.push(selectedGametype);
    }

    if(selectedMap !== 0){

        if(vars.length === 0){
            query += ` WHERE map=?`;      
        }else{
            query += ` AND map=?`;
        }
        vars.push(selectedMap);
    }

    if(sortBy === "gametype"){

        query += `  INNER JOIN nstats_gametypes ON nstats_matches.gametype = nstats_gametypes.id`;
       // query += `  INNER JOIN nstats_gametypes ON nstats_matches.gametype = nstats_gametypes.id WHERE nstats_gametypes.name LIKE '%dom%'`;
        finalSortBy = `gametypeName`;

    }else if(sortBy === "map"){

        query += ` INNER JOIN nstats_maps ON nstats_matches.map = nstats_maps.id`;
        finalSortBy = `mapName`;

    }else if(sortBy === "server"){

        query += ` INNER JOIN nstats_servers ON nstats_matches.server = nstats_servers.id`;
        finalSortBy = `serverName`;
    }



    const orderString = ` ORDER BY ${finalSortBy} ${order}, id DESC LIMIT ?, ?`;
 
    return {"query": `${query} ${orderString}`, vars};
}


async function adminGetTotalPossibleMatches(selectedServer, selectedGametype, selectedMap){

    let query = `SELECT COUNT(*) as total_rows FROM nstats_matches`;
    const vars = [];

    if(selectedServer !== 0){
        query += ` WHERE server=?`;
        vars.push(selectedServer);
    }

    if(selectedGametype !== 0){

        if(vars.length === 0){
            query += ` WHERE gametype=?`;
        }else{
            query += ` AND gametype=?`;
        }

        vars.push(selectedGametype);
    }

    if(selectedMap !== 0){

        if(vars.length === 0){
            query += ` WHERE map=?`;
        }else{
            query += ` AND map=?`;
        }

        vars.push(selectedGametype);
    }

    const result = await simpleQuery(query, vars);

    return result[0].total_rows;
}

export async function adminMatchesSearch(sortBy, order, selectedServer, selectedGametype, selectedMap, page, perPage){


    page = sanatizePage(page);
    page--;

    perPage = sanatizePerPage(perPage, 100);
    
    sortBy = sortBy.toLowerCase();
    order = order.toUpperCase();

    const validSortBys = ["date", "server", "gametype", "map", "players", "playtime"];

    const {query, vars} = createAdminSearchQuery(sortBy, order, selectedServer, selectedGametype, selectedMap, page, perPage, validSortBys);



    let start = page * perPage;
    if(start < 0) start = 0;


    const result = await simpleQuery(query, [...vars, start, perPage]);

    const gametypeIds = new Set();
    const mapIds = new Set();
    const serverIds = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        serverIds.add(r.server);
        gametypeIds.add(r.gametype);
        mapIds.add(r.map);
    }

    //check if type is server, gametype, map and skip required step below
    const serverNames = await getObjectName("servers", [...serverIds]);
    const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
    const mapNames = await getObjectName("maps", [...mapIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        r.serverName = serverNames[r.server] ?? "Not Found";
        r.gametypeName = gametypeNames[r.gametype] ?? "Not Found";
        r.mapName = mapNames[r.map] ?? "Not Found";
    }

    const totalRows = await adminGetTotalPossibleMatches(selectedServer, selectedGametype, selectedMap);

    return {"totalMatches": totalRows, "data": result};
}


async function deletePlayerScoreData(id){

    const query = "DELETE FROM nstats_match_player_score WHERE match_id=?";

    return await simpleQuery(query, [id]);
}


async function deleteMatch(id){

    return await simpleQuery(`DELETE FROM nstats_matches WHERE id=?`, [id]);
}


export async function adminDeleteMatch(id){

    const basic = await getMatch(id);

    if(basic === null) throw new Error(`Match does not exist`);

    const gametypeId = basic.gametype;
    const mapId = basic.map;
    const serverId = basic.server;

    const players = await getAllInMatch(id);

    const playerIds = new Set();
    const faceIds = new Set();
    const voiceIds = new Set();

    for(let i = 0; i < players.length; i++){
        const p = players[i];
        playerIds.add(p.player_id);
        faceIds.add(p.face);
        voiceIds.add(p.voice);
    }


    
    await deleteMatch(id);
    await deletePlayersMatchData(id);

    await assaultDeleteMatch(id);
    await deleteMatchHeadshots(id);
    await deleteMatchSprees(id);
    await deleteMatchTeleFrags(id);

    await deleteMatchCTFData([id]);
    await deleteMatchDomData(id);
    await deleteMatchPings(id);
    await deleteMatchTeamChanges(id);

    
    await deleteMatchConnections(id);
    await deleteMatchItems(id, [...playerIds]);
    await deleteMatchCombogibData(id, [...playerIds], gametypeId, mapId);
    await deleteMatchMonsterHuntData(id, [...playerIds]);
    await deleteMatchWeaponData(id, [...playerIds], gametypeId, mapId);
    await deleteMatchPowerupData(id, [...playerIds], gametypeId, mapId);
    await deleteMatchRankingData(id, [...playerIds], gametypeId, mapId);

    await deleteMatchKills(id);



    //make sure to delete all player match data before recalculating totals
    await recaclFaceTotals([...faceIds]);
    await recalculateVoiceTotals([...voiceIds]);
    await recalculateTelefragPlayersTotals([...playerIds]);
    await recalcultePlayersCTF([...playerIds], gametypeId, mapId);
    await recalculateCapRecordsAfterMatchDelete(id, gametypeId, mapId);
    await recalculateMapControlPointTotals(mapId);


    await deleteMatchWinRateData([...playerIds], gametypeId, mapId);
    
    await recalculateMapTotals(gametypeId, mapId);
    await recalculateMapTotals(0, mapId);

    await recalculateGametypeTotals(gametypeId);


    await recalculateCountryTotals();


    await recalculatePlayerTotals([...playerIds], gametypeId, mapId);
    await recalculatePlayerTotals([...playerIds], gametypeId, 0);
    await recalculatePlayerTotals([...playerIds], 0, mapId);
    await recalculatePlayerTotals([...playerIds], 0, 0);
    
    await recalculateServerTotals(serverId);


    await deleteLogImportInfo(id);
}

export async function getDuplicateMatches(bSkipNames){

    if(bSkipNames === undefined) bSkipNames = false;

    //only get the latest server,gametype,map ids for each match as they are the most recent
    const query = `SELECT match_hash,MAX(date) as date, MAX(server) as server,MAX(gametype) as gametype,MAX(map) as map,
    COUNT(*) as total_logs FROM nstats_matches GROUP BY match_hash`;

    const result = await simpleQuery(query);

    const data = [];

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        if(r.total_logs <= 1) continue;
        //matchHashes.add(r.match_hash);
        data.push(r);
    }


    const serverIds = new Set();
    const gametypeIds = new Set();
    const mapIds = new Set();


    if(!bSkipNames){
        for(let i = 0; i < data.length; i++){

            const {server, gametype, map} = data[i];

            serverIds.add(server);
            gametypeIds.add(gametype);
            mapIds.add(map);
        }

        const serverNames = await getObjectName("servers", [...serverIds]);
        const gametypeNames = await getObjectName("gametypes", [...gametypeIds]);
        const mapNames = await getObjectName("maps", [...mapIds]);

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            d.serverName = serverNames[d.server] ?? "Not Found";
            d.gametypeName = gametypeNames[d.gametype] ?? "Not Found";
            d.mapName = mapNames[d.map] ?? "Not Found";
        }


        data.sort((a, b) =>{

            a = a.date;
            b = b.date;

            if(a > b) return -1;
            if(a < b) return 1;

            return 0;
        });
    }

    return data;
}


async function getLatestHashMatchId(hash){

    const query = `SELECT MAX(id) as latest_id FROM nstats_matches WHERE match_hash=?`;
    const result = await simpleQuery(query, [hash]);

    if(result.length === 0) return null;

    return result[0].latest_id;
}


async function getNonLatestHashIds(targetHash, ignoreId){

    const query = `SELECT id FROM nstats_matches WHERE match_hash=? AND id!=?`;

    const result = await simpleQuery(query, [targetHash, ignoreId]);

    console.log(result);

    return result.map((r) =>{
        return r.id;
    });
}

/**
 * Delete all but the latest match import for this log hash
 * @param {*} targetHash 
 */
export async function deleteHashDuplicates(targetHash){


    const latestMatchId = await getLatestHashMatchId(targetHash);

    if(latestMatchId === null) throw new Error(`LatestMatchId is null`);

    //delete all but latest match id

    const matchIdsToDelete = await getNonLatestHashIds(targetHash, latestMatchId);

    if(matchIdsToDelete.length === 0) return [];

    for(let i = 0; i < matchIdsToDelete.length; i++){

        const id = matchIdsToDelete[i];
        await adminDeleteMatch(id);
    }
}

async function getLatestDuplicateIds(){

    const query = `SELECT COUNT(*) as total_matches,MAX(id) as latest_match_id,match_hash FROM nstats_matches GROUP BY match_hash ORDER BY total_matches DESC`;

    const result = await simpleQuery(query);


    const toDelete = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.total_matches <= 1) break;
        toDelete[r.match_hash] = r.latest_match_id;
    }


    return toDelete;
}

export async function deleteAllDuplicates(){

    const toDelete = await getLatestDuplicateIds();

    if(Object.keys(toDelete).length === 0) return;

    const query = `SELECT id FROM nstats_matches WHERE match_hash IN (?) AND id NOT IN(?)`;

    const result = await simpleQuery(query, [Object.keys(toDelete), Object.values(toDelete)]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        await adminDeleteMatch(r.id);
    }
}

export async function changeGametype(oldId, newId){

    const query = `UPDATE nstats_matches SET gametype=? WHERE gametype=?`;

    return await simpleQuery(query, [newId, oldId]);
}


export async function deleteGametype(id){

    const query = `DELETE FROM nstats_matches WHERE gametype=?`;

    return await simpleQuery(query, [id]);
}

function setWhereStringAndVars(serverId, gametypeId, mapId){

    let where = ``;
    const vars = [];

    if(serverId !== 0){
        
        if(where === ""){
            where = ` WHERE server=?`;
        }else{
            where += ` AND WHERE server=?`;
        }

        vars.push(serverId);
    }

    if(gametypeId !== 0){

        if(where === ""){
            where = ` WHERE gametype=?`;
        }else{
            where += ` AND WHERE gametype=?`;
        }

        vars.push(gametypeId);
    }

    if(mapId !== 0){

        if(where === ""){
            where = ` WHERE map=?`;
        }else{
            where += ` AND map=?`;
        }

        vars.push(mapId);
    }

    return {vars, where};
}

async function searchGetTotalMatches(serverId, gametypeId, mapId){

    serverId = parseInt(serverId);
    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);

    const {vars, where} = setWhereStringAndVars(serverId, gametypeId, mapId);

    const query = `SELECT COUNT(*) as total_matches FROM nstats_matches`;

    const result = await simpleQuery(`${query}${where}`, vars);

    return result[0].total_matches;

}

export async function searchMatches(serverId, gametypeId, mapId, page, perPage, sortBy, order){

    serverId = parseInt(serverId);
    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);
    page = sanatizePage(page);
    perPage = sanatizePerPage(perPage, 25);

    if(serverId !== serverId) throw new Error(`ServerId must be a valid integer`);
    if(gametypeId !== gametypeId) throw new Error(`gametypeId must be a valid integer`);
    if(mapId !== mapId) throw new Error(`mapId must be a valid integer`);

    sortBy = sortBy.toLowerCase();
    order = order.toLowerCase();

    if(VALID_SEARCH_SORT_BY.indexOf(sortBy) === -1){
        throw new Error(`Not a valid match sort by`);
    }

    if(order !== "asc" && order !== "desc") order = "desc";
    order = order.toUpperCase();


    const query = `SELECT nstats_matches.id as id,
        nstats_matches.match_hash as match_hash,
        nstats_matches.date as date,
        nstats_matches.server as server,
        nstats_matches.gametype as gametype,
        nstats_matches.map as map,
        nstats_matches.playtime as playtime,
        nstats_matches.end_type as end_type,
        nstats_matches.team_game as team_game,
        nstats_matches.total_teams as total_teams,
        nstats_matches.players as players,
        nstats_matches.dm_winner as dm_winner,
        nstats_matches.dm_score as dm_score,
        nstats_matches.team_score_0 as team_score_0,
        nstats_matches.team_score_1 as team_score_1,
        nstats_matches.team_score_2 as team_score_2,
        nstats_matches.team_score_3 as team_score_3,
        nstats_matches.mh as mh,
        nstats_gametypes.name as gametypeName,
        nstats_maps.name as mapName,
        IF(nstats_servers.display_name = "", nstats_servers.name, nstats_servers.display_name) as serverName,
        IF(nstats_matches.dm_winner > 0, nstats_player.name, "") as dmWinnerName,
        IF(nstats_matches.dm_winner > 0, nstats_player.country, "") as dmWinnerCountry
        FROM nstats_matches 
        LEFT JOIN nstats_gametypes on nstats_gametypes.id = nstats_matches.gametype
        LEFT JOIN nstats_maps on nstats_maps.id = nstats_matches.map
        LEFT JOIN nstats_servers on nstats_servers.id = nstats_matches.server
        LEFT JOIN nstats_player on nstats_player.id = nstats_matches.dm_winner`;


    const {vars, where} = setWhereStringAndVars(serverId, gametypeId, mapId);

    let orderBy = ` ORDER BY ${sortBy} ${order}, id DESC`;
    let limit = ` LIMIT ?, ?`;

    let start = page * perPage;
    vars.push(start, perPage);

    const result = await simpleQuery(`${query}${where}${orderBy}${limit}`, vars);

    const mapNames = new Set();

    for(let i = 0; i < result.length; i++){

        result[i].mapName = removeUnr(result[i].mapName);
        mapNames.add(result[i].mapName);
    }

    const mapImages = getMapImages([...mapNames]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        const mapImageName = cleanMapName(r.mapName).toLowerCase();
        r.mapImage = mapImages[mapImageName] ?? "default";
    }

    const totalMatches = await searchGetTotalMatches(serverId, gametypeId, mapId);

    return {"matches": result, "totalMatches": totalMatches}

}


export async function getGametypeAndMapIds(matchId){

    const query = `SELECT gametype,map FROM nstats_matches WHERE id=?`;

    const result = await simpleQuery(query, [matchId]);

    if(result.length === 0){
        return null;
    }

    return result[0];
}


export async function deletePlayerFromMatch(playerId, matchId, gametypeId, mapId){

    await simpleQuery(`DELETE FROM nstats_match_player_score WHERE player=? AND match_id=?`, [playerId, matchId]);
    await simpleQuery(`DELETE FROM nstats_player_matches WHERE player_id=? AND match_id=?`, [playerId, matchId]);

    await recalculatePlayerTotals([playerId], gametypeId, mapId);
    await recalculatePlayerTotals([playerId], gametypeId, 0);
    await recalculatePlayerTotals([playerId], 0, mapId);
    await recalculatePlayerTotals([playerId], 0, 0);
}
