import { simpleQuery } from "./database.js";
import Match from "./match.js";
import CountriesManager from "./countriesmanager.js";
import CTF from "./ctf.js";
import Domination from "./domination.js";
import Faces from "./faces.js";
import Gametypes from "./gametypes.js";
import Headshots from "./headshots.js";
import Items from "./items.js";
import Kills from "./kills.js";
import Maps, { getImages } from "./maps.js";
import Connections from "./connections.js";
import Weapons from "./weapons.js";
import Rankings from "./rankings.js";
import Servers from "./servers.js";
import Voices from "./voices.js";
import { getUniqueValues, setIdNames, removeUnr, getPlayer, cleanMapName, sanatizePage, sanatizePerPage } from "./generic.mjs";
import { getObjectName } from "./genericServerSide.mjs";
import { deleteFromDatabase as logsDeleteFromDatabase } from "./logs.js";
import MonsterHunt from "./monsterhunt.js";
import {getSettings} from "./sitesettings.js";
import { getAllInMatch, getBasicPlayersByIds, deletePlayersMatchData } from "./players.js";
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


    async getRecent(page, perPage, gametype, playerManager){

        page = parseInt(page);
        perPage = parseInt(perPage);
        gametype = parseInt(gametype);

        if(page !== page) page = 0;
        if(perPage !== perPage) perPage = 25;
        if(gametype !== gametype) gametype = 0;

        const start = page * perPage;

        const defaultQuery = `SELECT * FROM nstats_matches WHERE playtime >= ? AND players >=? 
        ORDER BY date DESC, id DESC LIMIT ?, ?`;
        const gametypeQuery = `SELECT * FROM nstats_matches WHERE gametype=? AND playtime >=? AND players >=? 
        ORDER BY date DESC, id DESC LIMIT ?, ?`;

        const settings = await getSettings("Matches Page");

        const vars = [settings["Minimum Playtime"], settings["Minimum Players"], start, perPage];


        const query = (gametype === 0) ? defaultQuery : gametypeQuery

        if(gametype !== 0) vars.unshift(gametype);

        const result = await simpleQuery(query, vars);

        const mgsIds = getUniqueMGS(result);
   

        const serverNames = await getObjectName("servers", mgsIds.servers);
        const gametypeNames = await getObjectName("gametypes", mgsIds.gametypes);
        const mapNames = await getObjectName("maps", mgsIds.maps);

        const mNames = Object.values(mapNames);
        const mapImages = getImages(mNames);

        setIdNames(result, serverNames, "server", "serverName");
        setIdNames(result, gametypeNames, "gametype", "gametypeName");
        setIdNames(result, mapNames, "map", "mapName");
        
        const dmWinners = new Set(result.map(r => r.dm_winner));

        const players = await playerManager.getNamesByIds([...dmWinners], true);

        for(let i = 0; i < result.length; i++){
            const r = result[i];

            if(r.dm_winner !== 0){
                r.dmWinner = players[r.dm_winner];
            }

            const cleanName = cleanMapName(r.mapName).toLowerCase();

            if(mapImages[cleanName] !== undefined){
                r.mapImage = mapImages[cleanName];
            }else{
                r.mapImage = "default";
            }
        }

        return result;
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

    async getDuplicates(){


        const query = `SELECT name, COUNT(*) as total_found, MAX(imported) as last_import, MIN(imported) as first_import,
        MIN(match_id) as first_id, MAX(match_id) as last_id
         FROM nstats_logs GROUP BY name`;

        const result = await simpleQuery(query);

        const found = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.total_found > 1){
                found.push(r);
            }
        }

        return found;
    }

    async getMatchLogFileNames(matchIds){

        if(matchIds.length === 0) return [];

        const query = "SELECT name,match_id FROM nstats_logs WHERE match_id IN (?)";

        return await simpleQuery(query, [matchIds]);    
    }


    async getPreviousDuplicates(logFileName, latestId){

        const query = "SELECT match_id FROM nstats_logs WHERE name=? AND match_id != ?";

        const vars = [logFileName, latestId];

        const result = await simpleQuery(query, vars);

        const found = [];
        
        for(let i = 0; i < result.length; i++){

            found.push(result[i].match_id);
        }

        return found;
    }


    async getLogIds(logNames){

        if(logNames.length === 0) return [];

        const query = "SELECT name,match_id,imported FROM nstats_logs WHERE name IN (?) ORDER BY match_id DESC";

        return await simpleQuery(query, [logNames]);
    }

    async getMatchesToDelete(latestIds){

        try{

            const logFileNames = await this.getMatchLogFileNames(latestIds);
            //get older ids
            //the delete them one by one

            //console.log(logFileNames);


            const names = [];

            for(let i = 0; i < logFileNames.length; i++){

                names.push(logFileNames[i].name);
            }

            //console.log(names);

            const matchIds = await this.getLogIds(names);

            //console.log("matchIds");
            //console.log(matchIds);
           // return await this.getPreviousDuplicates(latestIds, names);

            

        }catch(err){
            console.trace(err);
            return [];
        }
    }


    async getLogMatches(logNames){

        if(logNames.length === 0) return [];

        const query = "SELECT id,name,match_id FROM nstats_logs WHERE name IN (?) ORDER BY match_id DESC";

        return await simpleQuery(query, [logNames]);
    }

    async deleteMatchCountryData(playersData){

        try{

            const countryData = {};

            for(let i = 0; i < playersData.length; i++){

                if(countryData[playersData[i].country] !== undefined){
                    countryData[playersData[i].country]++;
                }else{
                    countryData[playersData[i].country] = 1;
                }
            }

            const countriesManager = new CountriesManager();

            for(const [key, value] of Object.entries(countryData)){

                await countriesManager.reduceUses(key, value);

            }

        }catch(err){
            console.trace(err);
        }
    }

    async deleteCtfData(id){

        try{

            const ctf = new CTF();

            await ctf.deleteMatchCapData(id);

            await ctf.deleteMatchEvents(id);

        }catch(err){
            console.trace(err);
        }
    }


    async reducePlayerMapTotals(mapId, playerId, playtime){

        const query = "UPDATE nstats_player_maps SET matches=matches-1, playtime=playtime-? WHERE map=? AND player=?";

        return await simpleQuery(query, [playtime, mapId, playerId]);
    }


    async removeMatchFromPlayerMapTotals(mapId, playersData){

        try{

            let p = 0;

            for(let i = 0; i < playersData.length; i++){

                p = playersData[i];

                await this.reducePlayerMapTotals(mapId, p.player_id, p.playtime);

            }

        }catch(err){
            console.trace(err);
        }
    }


    async removeVoiceData(playerData){

        try{

            const uses = {};

            let p = 0;

            for(let i = 0; i < playerData.length; i++){

                p = playerData[i];

                if(uses[p.vouce] !== undefined){
                    uses[p.voice]++;
                }else{
                    uses[p.voice] = 1;
                }
            }

            const voiceManager = new Voices();

            for(const [key, value] of Object.entries(uses)){
                await voiceManager.reduceTotals(key, value);
            }

        }catch(err){
            console.trace(err);
        }
    }


    async deleteMatchQuery(id){

        const query = "DELETE FROM nstats_matches WHERE id=?";

        return await simpleQuery(query, [id]);
    }

    async reducePlayerCount(matchId, amount){

        return await simpleQuery("UPDATE nstats_matches SET players=players-? WHERE id=?", [
            amount, matchId
        ]);
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

        console.log(result);

        return result.map((r) => r.id);

    }

    async recalculateDmWinners(matchIds){

        console.log("recalculateDmWinners");
        console.log(matchIds);

        const dmMatches = await this.getValidDMMatches(matchIds);

        console.log(dmMatches);
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

    async insertMergedPlayerData(data){

        const query = `INSERT INTO nstats_player_matches VALUES(NULL,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,?)`;//62

//77
        const vars = [
            data.match_id,
            data.match_date,
            data.map_id,
            data.player_id,
            data.bot,
            data.spectator,
            data.played,
            data.ip,
            data.country,
            data.face,
            data.voice,
            data.gametype,
            data.winner,
            data.draw,
            data.playtime,
            data.team_0_playtime,
            data.team_1_playtime,
            data.team_2_playtime,
            data.team_3_playtime,
            data.spec_playtime,
            data.team,
            data.first_blood,
            data.frags,
            data.score,
            data.kills,
            data.deaths,
            data.suicides,
            data.team_kills,
            data.spawn_kills,
            data.efficiency,
            data.multi_1,
            data.multi_2,
            data.multi_3,
            data.multi_4,
            data.multi_5,
            data.multi_6,
            data.multi_7,
            data.multi_best,
            data.spree_1,   
            data.spree_2,
            data.spree_3,
            data.spree_4,
            data.spree_5,
            data.spree_6,
            data.spree_7,
            data.spree_best,
            data.best_spawn_kill_spree,
            data.assault_objectives,
            data.dom_caps,
            data.dom_caps_best_life,
            data.ping_min,
            data.ping_average,
            data.ping_max,
            data.accuracy,
            data.shortest_kill_distance,
            data.average_kill_distance,
            data.longest_kill_distance,
            data.k_distance_normal,
            data.k_distance_long,
            data.k_distance_uber,
            data.headshots,
            data.shield_belt,
            data.amp,
            data.amp_time,
            data.amp_kills,
            data.amp_kills_single_life,
            data.invisibility,
            data.invisibility_time,
            data.invisibility_kills,
            data.invisibility_single_life,
            data.pads,
            data.armor,
            data.boots,
            data.super_health,
            data.mh_kills,
            data.mh_kills_best_life,
            data.views,
            data.mh_deaths
        ];

        await simpleQuery(query, vars);
    }

    async changePlayerIds(oldId, newId){

        const query = `UPDATE nstats_player_matches SET player_id=? WHERE player_id=?`;
        return await simpleQuery(query, [newId, oldId]);
    }

    async getDuplicatePlayerEntries(targetPlayer){

        const query = `SELECT COUNT(*) as total_entries, match_id FROM nstats_player_matches WHERE player_id=? GROUP BY match_id ORDER BY total_entries DESC`;

        const result = await simpleQuery(query, [targetPlayer]);

        const matchIds = [];

        for(let i = 0; i < result.length; i++){
            matchIds.push(result[i].match_id);
        }

        return matchIds;
    }

    async mergePlayerMatchData(matchId, playerId){

        const query = `SELECT * FROM nstats_player_matches WHERE match_id=? AND player_id=?`;

        const result = await simpleQuery(query, [matchId, playerId]);

        const totals = Object.assign({}, result[0]);

        const higherBetter = [
            "multi_best", 
            "spree_best", 
            "best_spawn_kill_spree", 
            "dom_caps_best_life", 
            "longest_kill_distance", 
            "mh_kills_best_life",
            "telefrag_best_spree",
            "telefrag_best_multi",
            "tele_disc_best_spree",
            "tele_disc_best_multi"
        ];

        const mergeTypes = [
            "frags",
            "score",
            "kills",
            "deaths",
            "suicides",
            "team_kills",
            "spawn_kills",
            "assault_objectives",
            "dom_caps", 
            "k_distance_normal",
            "k_distance_long", 
            "k_distance_uber",
            "headshots",
            "shield_belt",
            "amp",
            "amp_time",
            "invisibility",
            "invisibility_time",
            "pads",
            "armor",
            "boots",
            "super_health",
            "mh_kills",
            "mh_deaths",
            "playtime", // || You complete twat, how did you forget playtime!
            "team_0_playtime",
            "team_1_playtime",
            "team_2_playtime",
            "team_3_playtime",
            "spec_playtime",
            "telefrag_kills",
            "telefrag_deaths",
            "tele_disc_kills",
            "tele_disc_deaths"
        ];

        let totalAccuracy = 0;
        let totalAverageKillDistance = 0;


        const rowsToDelete = [];

        if(result.length > 0){
            rowsToDelete.push(result[0].id);
        }

        for(let i = 1; i < result.length; i++){

            const r = result[i];

            rowsToDelete.push(r.id);

            if(r.bot) totals.bot = 1;

            if(totals.spectator === undefined) totals.spectator = r.spectator;
            if(r.spectator !== 1) totals.spectator = 0;

            if(totals.played === undefined) totals.played = r.played;

            if(r.played !== 0) totals.played = 1;

            //if(r.spectator) totals.spectator = 1;
            if(r.winner) totals.winner = 1;
            if(r.draw) totals.draw = 1;
            //totals.team = r.team;
            if(r.first_blood) totals.first_blood = 1;

            
            if(totals.team === undefined) totals.team = r.team;

            if(r.team !== 255) totals.team = r.team;

            for(let x = 1; x < 8; x++){
                totals[`spree_${x}`] += r[`spree_${x}`] ;
                totals[`multi_${x}`] += r[`multi_${x}`] ;
            }

            for(let x = 0; x < mergeTypes.length; x++){
                totals[mergeTypes[x]] += r[mergeTypes[x]];
            }


            for(let x = 0; x < higherBetter.length; x++){

                if(r[higherBetter[x]] > totals[higherBetter[x]]){
                    totals[higherBetter[x]] = r[higherBetter[x]];
                }
            }



            totalAccuracy += r.accuracy;
            totalAverageKillDistance += r.average_kill_distance;

        }

        totals.efficiency = 0;

        if(totals.kills > 0){

            if(totals.deaths > 0){

                totals.efficiency = (totals.kills / (totals.kills + totals.deaths)) * 100;
            }else{
                totals.efficiency = 100;
            }
        }


        if(totalAccuracy > 0){
            totals.accuracy = totalAccuracy / result.length;
        }

        if(totalAverageKillDistance > 0){
            totals.average_kill_distance = totalAverageKillDistance / result.length;
        }


        //test fix
        if(totals.playtime > 0){
            totals.spectator = 0;
            totals.played = 1;
        }

   
        await this.insertMergedPlayerMatchData(totals, matchId, playerId);
        //await this.updatePlayerMatchDataFromMerge(totals);
        //delete other ids

       return rowsToDelete;

    }


    async insertMergedPlayerMatchData(data, matchId, playerId){

        const query = `INSERT INTO nstats_player_matches VALUES(
            NULL,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?
        )`;

        const d = data;

        const vars = [
            matchId, d.match_date, d.map_id, playerId,
            d.hwid, d.bot, d.spectator, d.played, d.ip,//x
            d.country, d.face, d.voice, d.gametype, d.winner,//x
            d.draw, d.playtime, d.team_0_playtime, d.team_1_playtime, d.team_2_playtime,//x
            d.team_3_playtime, d.spec_playtime, d.team, d.first_blood, d.frags,//x
            d.score, d.kills, d.deaths, d.suicides, d.team_kills,//x
            d.spawn_kills, d.efficiency, d.multi_1, d.multi_2, d.multi_3,//x
            d.multi_4, d.multi_5, d.multi_6, d.multi_7, d.multi_best,//x
            d.spree_1, d.spree_2, d.spree_3, d.spree_4, d.spree_5,//x
            d.spree_6, d.spree_7, d.spree_best, d.best_spawn_kill_spree, d.assault_objectives,//x
            d.dom_caps, d.dom_caps_best_life, d.ping_min, d.ping_average, d.ping_max,//x
            d.accuracy, d.shortest_kill_distance, d.average_kill_distance, d.longest_kill_distance, d.k_distance_normal,//
            d.k_distance_long, d.k_distance_uber, d.headshots, d.shield_belt,//
            d.amp, d.amp_time, d.invisibility, d.invisibility_time, d.pads, //
            d.armor, d.boots, d.super_health, d.mh_kills, d.mh_kills_best_life,//
            d.views, d.mh_deaths, d.telefrag_kills, d.telefrag_deaths, d.telefrag_best_spree,//
            d.telefrag_best_multi, d.tele_disc_kills, d.tele_disc_deaths, d.tele_disc_best_spree, d.tele_disc_best_multi
        ];

        return await simpleQuery(query, vars);
    }

    async updatePlayerMatchDataFromMerge(data){

        const query = `UPDATE nstats_player_matches SET
        bot=?,
        spectator=?,
        played=?,
        winner=?,
        draw=?,
        playtime=?,
        team_0_playtime=?,
        team_1_playtime=?,
        team_2_playtime=?,
        team_3_playtime=?,
        spec_playtime=?,
        team=?,
        first_blood=?,
        frags=?,
        score=?,
        kills=?,
        deaths=?,
        suicides=?,
        team_kills=?,
        spawn_kills=?,
        efficiency=?,
        multi_1=?,
        multi_2=?,
        multi_3=?,
        multi_4=?,
        multi_5=?,
        multi_6=?,
        multi_7=?,
        multi_best=?,
        spree_1=?,
        spree_2=?,
        spree_3=?,
        spree_4=?,
        spree_5=?,
        spree_6=?,
        spree_7=?,
        spree_best=?,
        best_spawn_kill_spree=?,
        assault_objectives=?,
        dom_caps=?,
        dom_caps_best_life=?,
        accuracy=?,
        shortest_kill_distance=?,
        average_kill_distance=?,
        longest_kill_distance=?,
        k_distance_normal=?,
        k_distance_long=?,
        k_distance_uber=?,
        headshots=?,
        shield_belt=?,
        amp=?,
        amp_time=?,
        invisibility=?,
        invisibility_time=?,
        pads=?,
        armor=?,
        boots=?,
        super_health=?,
        mh_kills=?,
        mh_kills_best_life=?,
        mh_deaths=?
        WHERE id=?`;

       

        const d = data;
        const vars = [
            d.bot,
            d.spectator,
            d.played,
            d.winner,
            d.draw,
            d.playtime,
            d.team_0_playtime,
            d.team_1_playtime,
            d.team_2_playtime,
            d.team_3_playtime,
            d.spec_playtime,
            d.team,
            d.first_blood,
            d.frags,
            d.score,
            d.kills,
            d.deaths,
            d.suicides,
            d.team_kills,
            d.spawn_kills,
            d.efficiency,
            d.multi_1,
            d.multi_2,
            d.multi_3,
            d.multi_4,
            d.multi_5,
            d.multi_6,
            d.multi_7,
            d.multi_best,
            d.spree_1,
            d.spree_2,
            d.spree_3,
            d.spree_4,
            d.spree_5,
            d.spree_6,
            d.spree_7,
            d.spree_best,

            d.best_spawn_kill_spree,
            d.assault_objectives,
            d.dom_caps,
            d.dom_caps_best_life,
            d.accuracy,

            d.shortest_kill_distance,
            d.average_kill_distance,
            d.longest_kill_distance,
            d.k_distance_normal,
            d.k_distance_long,
            d.k_distance_uber,
            d.headshots,
            d.shield_belt,
            d.amp,
            d.amp_time,
            d.invisibility,
            d.invisibility_time,
            d.pads,
            d.armor,
            d.boots,
            d.super_health,
            d.mh_kills,
            d.mh_kills_best_life,
            d.mh_deaths,
            d.id
        ];

        return await simpleQuery(query, vars);
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

    async deletePlayerScores(matchIds){

        if(matchIds.length === 0) return;

        await simpleQuery("DELETE FROM nstats_match_player_score WHERE match_id IN (?)", [matchIds]);
    }

    async deleteTeamChanges(matchIds){

        if(matchIds.length === 0) return;

        await simpleQuery("DELETE FROM nstats_match_team_changes WHERE match_id IN (?)", [matchIds]);
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


    createSearchQuery(serverId, gametypeId, mapId, perPage, page, sortBy, order){

        
        serverId = parseInt(serverId);
        gametypeId = parseInt(gametypeId);
        mapId = parseInt(mapId);
        page = parseInt(page);
        perPage = parseInt(perPage);

        if(serverId !== serverId) throw new Error("ServerId must be a valid integer");
        if(gametypeId !== gametypeId) throw new Error("gametypeId must be a valid integer");
        if(mapId !== mapId) throw new Error("mapId must be a valid integer");
        if(page !== page) throw new Error("page must be a valid integer");
        if(perPage !== perPage) throw new Error("perPage must be a valid integer");

        let start = `SELECT nstats_matches.id as id,
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
        nstats_matches.mh as mh `;



        if(sortBy === "gametype"){

            start += `,nstats_gametypes.name as gametype_name `;

        }else if(sortBy === "map"){

            start += `,nstats_maps.name as map_name `;

        }else if(sortBy === "server"){
            start += `,nstats_servers.name as server_name `;
        }
    

    start += ` FROM nstats_matches `;

    let query = start;
    const vars = [];

    let where = "";

    if(serverId !== 0){
        where = " WHERE nstats_matches.server=? "
        vars.push(serverId);
    }

    if(gametypeId !== 0){

        if(where === ""){
            where += " WHERE nstats_matches.gametype=? ";
        }else{
            where += " AND nstats_matches.gametype=? ";
        }
    
        vars.push(gametypeId);
    }

    if(mapId !== 0){

        if(where === ""){
            where += " WHERE nstats_matches.map=? ";
        }else{
            where += " AND nstats_matches.map=? ";
        }

        vars.push(mapId);
    }


        if(perPage <= 0 || perPage > 100){
            perPage = 25;
        }

        let startIndex = page * perPage;

        if(startIndex < 0) startIndex = 0;

        if(sortBy === undefined && order === undefined){
            query += " ORDER BY date DESC, id DESC LIMIT ?, ?";
        }else{
            

            let firstOrder = `nstats_matches.${sortBy}`;

            if(sortBy === "server"){
                
                query += ` INNER JOIN nstats_servers ON nstats_matches.server = nstats_servers.id`;
                firstOrder = `server_name`;

            }else if(sortBy === "gametype"){

                query += ` INNER JOIN nstats_gametypes ON nstats_matches.gametype = nstats_gametypes.id`;
                firstOrder = `gametype_name`;

            }else if(sortBy === "map"){

                query += ` INNER JOIN nstats_maps ON nstats_matches.map = nstats_maps.id`;
                firstOrder = `map_name`;

            }

            query += `${where} ORDER BY ${firstOrder} ${order.toUpperCase()}, nstats_matches.id DESC LIMIT ?, ?`;
            
        }
        
        vars.push(startIndex, perPage);
        


        return {"query": query, "vars": vars};
    }


    async searchMatches(serverId, gametypeId, mapId, page, perPage, sortBy, order){

        sortBy = sortBy.toLowerCase();
        order = order.toLowerCase();

        const validSortBys = [
            "date",
            "gametype",
            "map",
            "server",
            "players",
            "playtime"
        ];

        if(validSortBys.indexOf(sortBy) === -1){
            throw new Error(`Not a valid match sort by`);
        }

        if(order !== "asc" && order !== "desc") order = "desc";

        const {query, vars} = this.createSearchQuery(serverId, gametypeId, mapId, perPage, page, sortBy, order);

        return await simpleQuery(query, vars); 
    }


    async changePlayerScoreHistoryIds(oldPlayerId, newPlayerId){

        const query = `UPDATE nstats_match_player_score SET player=? WHERE player=?`;

        return await simpleQuery(query, [newPlayerId, oldPlayerId]);
    }

    async changeTeamChangesPlayerIds(oldPlayerId, newPlayerId){

        const query = `UPDATE nstats_match_team_changes SET player=? WHERE player=?`;

        return await simpleQuery(query, [newPlayerId, oldPlayerId]);
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

    const query = `SELECT * FROM nstats_matches WHERE id=?`;
    const result = await simpleQuery(query, [id]);

    if(result.length === 0) return null;

    const r = result[0];

    const serverNames = await getObjectName("servers", r.server);
    const gametypeNames = await getObjectName("gametypes", r.gametype);
    const mapNames = await getObjectName("maps", r.map);

    r.serverName = serverNames[r.server] ?? "Not Found";
    r.gametypeName = gametypeNames[r.gametype] ?? "Not Found";
    r.mapName = (mapNames[r.map] !== undefined) ? removeUnr(mapNames[r.map]) : "Not Found";
   // r.image = getImages([r.mapName]);

    const images = getImages([r.mapName]);

    const imageKeys = Object.keys(images);
    
    if(imageKeys.length > 0){
        r.image = images[imageKeys[0]];
    }else{
        r.image = "default";
    }
   

    if(r.dm_winner !== 0){

        const pInfo = await getBasicPlayersByIds(r.dm_winner);
        r.dmWinner = getPlayer(pInfo, r.dm_winner, true);
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

    const players = await getAllInMatch(id);

    const playerIds = new Set();
    const faceIds = new Set();

    for(let i = 0; i < players.length; i++){
        const p = players[i];
        playerIds.add(p.player_id);
        faceIds.add(p.face);
    }


    
    //await deleteMatch(id);

    await assaultDeleteMatch(id);
    await deleteMatchHeadshots(id);
    await deleteMatchSprees(id);
    await deleteMatchTeleFrags(id);

    await deleteMatchCTFData([id]);
    await deleteMatchDomData(id);
    await deleteMatchPings(id);
    await deleteMatchTeamChanges(id);

    //re enable once everything else is added
   // await deletePlayersMatchData(id);
    await deleteMatchConnections(id);
    await deleteMatchItems(id, [...playerIds]);
    await deleteMatchCombogibData(id, [...playerIds], gametypeId, mapId);
    await deleteMatchMonsterHuntData(id, [...playerIds]);
    await deleteMatchWeaponData(id, [...playerIds], gametypeId, mapId);
    await deleteMatchPowerupData(id, [...playerIds], gametypeId, mapId);
    await deleteMatchRankingData(id, [...playerIds], gametypeId, mapId);



    //make sure to delete all player match data before recalculating totals
    await recaclFaceTotals([...faceIds]);
    await recalculateTelefragPlayersTotals([...playerIds]);
    await recalcultePlayersCTF([...playerIds], gametypeId, mapId);
    await recalculateCapRecordsAfterMatchDelete(id, gametypeId, mapId);
    await recalculateMapControlPointTotals(mapId);


    await deleteMatchWinRateData([...playerIds], gametypeId, mapId);
    
    await recalculateMapTotals(gametypeId, mapId);
    await recalculateMapTotals(0, mapId);

    //nstats_gametypes recaclc gametype totals
    
    //nstats_player_totals recalc

 

}
