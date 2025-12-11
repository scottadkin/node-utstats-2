import Player from "./player.js";
import { simpleQuery, bulkInsert, updateReturnAffectedRows, getAllTablesContainingColumns } from "./database.js";
import { removeIps, setIdNames, getUniqueValues, getPlayer, DEFAULT_DATE, DEFAULT_MIN_DATE, removeUnr, calculateKillEfficiency } from "./generic.mjs";
import { getPlayerMatchCTFData ,  deletePlayerData as deletePlayerCTFData, deletePlayerFromMatch as deletePlayerMatchCTF} from "./ctf.js";
import { getPlayersBasic as getBasicWinrateStats, recalculatePlayers as recalculatePlayersWinrates } from "./winrate.js";
import { deletePlayer as deletePlayerAssaultData, deletePlayerFromMatch as deletePlayerMatchAssault } from "./assault.js";
import { recalculateTotals as reclaculateCountryTotals } from "./countriesmanager.js";
import { deletePlayerData as deletePlayerHeadshots } from "./headshots.js";
import { deletePlayerData as deletePlayerKills, deletePlayerFromMatch as deletePlayerMatchKills} from "./kills.js";
import { deletePlayerScoreData } from "./player.js";
import { deletePlayerData as deletePlayerPingData, deletePlayerFromMatch as deletePlayerMatchPings} from "./pings.js";
import { deletePlayerData as deletePlayerSprees, deletePlayerFromMatch as deletePlayerMatchSprees } from "./sprees.js";
import { deletePlayerData as deletePlayerTeamChanges, deletePlayerFromMatch as deletePlayerMatchTeamChanges} from "./teams.js";
import { deletePlayerData as deletePlayerTeleFrags, deletePlayerFromMatch as deletePlayerMatchTelefrags } from "./telefrags.js";
import { deletePlayerData as deletePlayerDomData, deletePlayerFromMatch as deletePlayerMatchDomination} from "./domination.js";
import { deletePlayerData as deletePlayerConnections, deletePlayerFromMatch as deletePlayerMatchConnections} from "./connections.js";
import { deletePlayerData as deletePlayerMonsterhuntData, deletePlayerFromMatch as deletePlayerMatchMonsterhunt} from "./monsterhunt.js";
import { deletePlayerData as deletePlayerWeaponData, deletePlayerFromMatch as deletePlayerMatchWeapons} from "./weapons.js";
import { deletePlayerData as deletePlayerWinRateData, getGametypeMatchResults } from "./winrate.js";
import { deletePlayerData as deletePlayerItemData, deletePlayerFromMatch as deletePlayerMatchItems } from "./items.js";
import { deletePlayerData as deletePlayerPowerUpData, deletePlayerFromMatch as deletePlayerMatchPowerupData } from "./powerups.js";
import { deletePlayerData as deletePlayerRankingData, deletePlayerFromMatch as deletePlayerMatchRankings } from "./rankings.js";
import { deletePlayerData as deletePlayerCombogibData, deletePlayerFromMatch as deletePlayerMatchCombogib } from "./combogib.js";
import { recalculateTotals as recalculateMapTotals } from "./maps.js";
import { getGametypeAndMapIds, deletePlayerFromMatch as deletePlayerFromAMatch } from "./matches.js";


const PLAYER_TOTALS_FROM_MATCHES_COLUMNS = `player_id,
    COUNT(*) as total_matches,
    SUM(playtime) as playtime,
    MIN(match_date) as first_match,
    MAX(match_date) as last_match,
    SUM(team_0_playtime) as team_0_playtime,
    SUM(team_1_playtime) as team_1_playtime,
    SUM(team_2_playtime) as team_2_playtime,
    SUM(team_3_playtime) as team_3_playtime,
    SUM(spec_playtime) as spec_playtime,
    SUM(first_blood) as first_bloods,
    SUM(frags) as frags,
    SUM(score) as score,
    SUM(kills) as kills,
    SUM(deaths) as deaths,
    SUM(suicides) as suicides,
    SUM(team_kills) as team_kills,
    SUM(spawn_kills) as spawn_kills,
    SUM(multi_1) as multi_1,
    SUM(multi_2) as multi_2,
    SUM(multi_3) as multi_3,
    SUM(multi_4) as multi_4,
    SUM(multi_5) as multi_5,
    SUM(multi_6) as multi_6,
    SUM(multi_7) as multi_7,
    MAX(multi_best) as multi_best,
    SUM(spree_1) as spree_1,
    SUM(spree_2) as spree_2,
    SUM(spree_3) as spree_3,
    SUM(spree_4) as spree_4,
    SUM(spree_5) as spree_5,
    SUM(spree_6) as spree_6,
    SUM(spree_7) as spree_7,
    MAX(spree_best) as spree_best,
    MAX(best_spawn_kill_spree) as best_spawn_kill_spree,
    SUM(assault_objectives) as assault_objectives,
    AVG(accuracy) as accuracy,
    SUM(k_distance_normal) as k_distance_normal,
    SUM(k_distance_long) as k_distance_long,
    SUM(k_distance_uber) as k_distance_uber,
    SUM(headshots) as headshots,
    SUM(shield_belt) as shield_belt,
    SUM(amp) as amp,
    SUM(amp_time) as amp_time,
    SUM(invisibility) as invisibility,
    SUM(invisibility_time) as invisibility_time,
    SUM(pads) as pads,
    SUM(armor) as armor,
    SUM(boots) as boots,
    SUM(super_health) as super_health,
    SUM(mh_kills) as mh_kills,
    MAX(mh_kills) as mh_kills_best,
    MAX(mh_kills_best_life) as mh_kills_best_life,
    SUM(mh_deaths) as mh_deaths,
    MAX(mh_deaths) as mh_deaths_worst,
    SUM(telefrag_kills) as telefrag_kills,
    SUM(telefrag_deaths) as telefrag_deaths,
    MAX(telefrag_best_spree) as telefrag_best_spree,
    MAX(telefrag_best_multi) as telefrag_best_multi,
    SUM(tele_disc_kills) as tele_disc_kills,
    SUM(tele_disc_deaths) as tele_disc_deaths,
    MAX(tele_disc_best_spree) as tele_disc_best_spree,
    MAX(tele_disc_best_multi) as tele_disc_best_multi`;

export default class Players{

    constructor(){
        this.player = new Player();
    }


    //get all player all time total ids
    async getAllPlayerIds(){

        const query = `SELECT id FROM nstats_player_totals WHERE player_id=0`;

        const result = await simpleQuery(query);

        return result.map((r) =>{
            return r.id;
        });
    }


    async getTotalPlayers(name){

        let query = "SELECT COUNT(*) as total_players FROM nstats_player";
        let vars = [];

        if(name !== undefined){

            query = "SELECT COUNT(*) as total_players FROM nstats_player WHERE name LIKE(?) ";
            vars = [`%${name}%`];
        }

        let result = 0;

        if(name === undefined){
            result = await simpleQuery(query);
        }else{
            result = await simpleQuery(query, vars);
        }

        return result[0].total_players;

    }


    async getTotalUniqueIps(name){

        let query = "SELECT COUNT(DISTINCT ip) as unique_ips FROM nstats_player_totals WHERE gametype=0";
        let vars = [];

        if(name !== undefined){

            query = "SELECT COUNT(DISTINCT ip) as unique_ips FROM nstats_player_totals WHERE gametype=0 AND name=?";
            vars = [name];
        }

        let result = 0;

        if(name === undefined){
            result = await simpleQuery(query);
        }else{
            result = await simpleQuery(query, vars);
        }

        return result[0].unique_ips;


    }

    async getMaxValues(types){

        try{

            const data = {};

            for(let i = 0; i < types.length; i++){

                data[types[i]] = await this.player.getMaxValue(types[i]);
            }

            return data;

        }catch(err){
            console.trace(err);
        }
    }


    async getPlayers(page, perPage, sort, order, name){

        page = page - 1;

        const start = page * perPage;

        const validTypes = [
            "name",
            "country",
            "score",
            "frags",
            "kills",
            "playtime",
            "winrate",
            "wins",
            "loses",
            "draws",
            "matches",
            "first",
            "last",
            "deaths",
            "efficiency",
            "accuracy"
        ];

        sort = sort.toLowerCase();

        let index = validTypes.indexOf(sort);

        if(index === -1){
            index = 0;
        }

        if(order !== "ASC" && order !== "DESC"){
            order = "ASC";
        }

        let query = `SELECT * FROM nstats_player_totals WHERE gametype=0 AND map=0 AND playtime>0 ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;
        let vars = [start, perPage];

        if(name !== ""){
            query = `SELECT * FROM nstats_player_totals WHERE gametype=0 AND map=0 AND playtime>0 AND name LIKE(?) ORDER BY ${validTypes[index]} ${order} LIMIT ?, ?`;
            vars = [`%${name}%`, start, perPage];
        }

        const result = await simpleQuery(query, vars);
        return removeIps(result);   
    }


    createNotFoundPlayers(foundStatus, bObject){

        const players = (bObject) ? {} : [];

        for(const [playerId, status] of Object.entries(foundStatus)){

            if(status) continue;

            const current = {"id": parseInt(playerId), "name": "Not Found", "country": "xx"};

            if(bObject){
                players[playerId] = current;
            }else{
                players.push(current);
            }
        }


        return players;
    }

    async getNamesByIds(ids, bReturnObject){

        if(ids === undefined) return [];
        if(ids.length === 0) return [];
        if(bReturnObject === undefined) bReturnObject = false;

        const query = "SELECT id,name,country,face FROM nstats_player WHERE id IN (?)";

        const data = await simpleQuery(query, [ids]);

        const foundStatus = {};

        for(let i = 0; i < ids.length; i++){
            foundStatus[ids[i]] = false;
        }

        for(let i = 0; i < data.length; i++){

            const d = data[i];
            foundStatus[d.id] = true;
        }

        const missingPlayers = this.createNotFoundPlayers(foundStatus, bReturnObject);

        if(bReturnObject){

            const obj = {};

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                obj[d.id] = {
                    "name": d.name,
                    "country": d.country,
                    "face": d.face,
                    "id": d.id
                }
            }

            return {...obj, ...missingPlayers};
        }else{
            return [...data, ...missingPlayers];
        }
    }


    async getAddictedPlayers(max, gametype){

        if(gametype === undefined) gametype = 0;

        const query = `SELECT 
        nstats_player.id,
        nstats_player.name,
        nstats_player.country,
        nstats_player_totals.matches,
        nstats_player.face,
        nstats_player_totals.playtime,
        nstats_player_totals.first,
        nstats_player_totals.last FROM nstats_player
        INNER JOIN nstats_player_totals ON nstats_player_totals.player_id = nstats_player.id
        WHERE nstats_player_totals.gametype=? AND nstats_player_totals.map=0 ORDER BY nstats_player_totals.playtime DESC LIMIT ?`;

        return await simpleQuery(query, [gametype, max]);
    }


    async getRecentPlayers(max){

        const query = `SELECT nstats_player.id,nstats_player.name,nstats_player.country,nstats_player.face,
        nstats_player_totals.matches,nstats_player_totals.playtime,nstats_player_totals.first,
        nstats_player_totals.last 
        FROM nstats_player 
        INNER JOIN nstats_player_totals ON nstats_player_totals.player_id = nstats_player.id AND nstats_player_totals.gametype=0 AND nstats_player_totals.map=0
        WHERE nstats_player_totals.playtime>0 ORDER BY last DESC LIMIT ?`;

        return await simpleQuery(query, [max]);

    }

    async getBestOfTypeTotal(validTypes, type, gametype, limit, page){

        if(gametype === undefined) gametype = 0;
        if(limit === undefined) limit = 25;
        if(page === undefined) page = 0;

        const start = page * limit;

        const typeIndex = validTypes.indexOf(type.toLowerCase());

        if(typeIndex === -1) return [];

        const query = `SELECT id as player_id,name,country,matches,last,playtime,${validTypes[typeIndex]} as value 
        FROM nstats_player_totals WHERE gametype=? ORDER BY ${validTypes[typeIndex]} DESC LIMIT ?, ?`;

        return await simpleQuery(query, [gametype, start, limit]);

    }


    async getTotalResults(gametype){

        const query = `SELECT COUNT(*) as total_results FROM nstats_player_totals WHERE gametype=?`;

        const result = await simpleQuery(query, [gametype]);

        if(result.length > 0){
            return result[0].total_results;
        }

        return 0;
    }

    async getBestMatchValueDetails(valid, type, playerId, value){

        type = type.toLowerCase();

        let index = valid.indexOf(type);

        if(index === -1) index = 0;

        const query = `SELECT player_id,match_id,map_id,match_date,country,playtime,${valid[index]} as value FROM 
        nstats_player_matches WHERE ${valid[index]}=? AND player_id=? LIMIT 1`;

        return await simpleQuery(query, [value, playerId]);

    }


    async getBestMatchValues(valid, type, page, perPage){


        type = type.toLowerCase();

        let index = valid.indexOf(type);

        if(index === -1) index = 0;

        if(page < 0) page = 0;

        perPage = parseInt(perPage);
        if(perPage !== perPage) perPage = 25;

        const start = perPage * page;

        const query = `SELECT MAX(${valid[index]}) as value, player_id
        FROM nstats_player_matches GROUP BY player_id ORDER BY value DESC LIMIT ?, ?`;

        const result = await simpleQuery(query, [start, perPage]);

        for(let i = 0; i < result.length; i++){

            const data = await this.getBestMatchValueDetails(valid, type, result[i].player_id, result[i].value);

            if(data.length > 0){
                result[i] = data[0];
            }
        }

        return result;
      
    }

    async getTotalBestMatchValues(valid, type){

        type = type.toLowerCase();

        let index = valid.indexOf(type);

        if(index === -1) index = 0;

        const query = `SELECT COUNT(DISTINCT player_id) as total_results FROM nstats_player_matches WHERE played=1`;
        const result = await simpleQuery(query);

        return result[0].total_results;
    }

    async getTotalMatchResults(gametype){
        
        let vars = [];
        let query = "SELECT COUNT(*) as total_matches FROM nstats_player_matches";

        if(gametype !== undefined){
            
            query = "SELECT COUNT(*) as total_matches FROM nstats_player_matches WHERE gametype=?"; 
            vars.push(gametype);
        }

        const result = await simpleQuery(query, vars);

        return result[0].total_matches;
    }


    async getBestMatchRecord(valid, type){
        
        type = type.toLowerCase();

        let index = valid.indexOf(type);

        if(index === -1) index = 0;

        const query = `SELECT ${valid[index]} as value FROM nstats_player_matches ORDER BY ${valid[index]} DESC`;

        const result = await simpleQuery(query);

        if(result.length > 0){
            return result;
        }

        return [{"value": 0}];      
       
    }



    async getJustNamesByIds(ids){

        if(ids === undefined || ids.length === 0) return {}

        const query = "SELECT id,name FROM nstats_player_totals WHERE gametype=0 AND id IN(?)";

        const result = await simpleQuery(query, [ids]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            data[r.id] = r.name;
        }

        return data;
    }

    async resetPlayerTotals(playerId, gametypeId, mapId){

        const query = `UPDATE nstats_player_totals SET
        first=0,
        last=0,
        matches=0,
        wins=0,
        losses=0,
        draws=0,
        winrate=0,
        playtime=0,
        team_0_playtime=0,
        team_1_playtime=0,
        team_2_playtime=0,
        team_3_playtime=0,
        spec_playtime=0,
        first_bloods=0,
        frags=0,
        score=0,
        kills=0,
        deaths=0,
        suicides=0,
        team_kills=0,
        spawn_kills=0,
        efficiency=0,
        multi_1=0,
        multi_2=0,
        multi_3=0,
        multi_4=0,
        multi_5=0,
        multi_6=0,
        multi_7=0,
        multi_best=0,
        spree_1=0,
        spree_2=0,
        spree_3=0,
        spree_4=0,
        spree_5=0,
        spree_6=0,
        spree_7=0,
        spree_best=0,
        best_spawn_kill_spree=0,
        assault_objectives=0,
        accuracy=0,
        k_distance_normal=0,
        k_distance_long=0,
        k_distance_uber=0,
        headshots=0,
        shield_belt=0,
        amp=0,
        amp_time=0,
        invisibility=0,
        invisibility_time=0,
        pads=0,
        armor=0,
        boots=0,
        super_health=0,
        mh_kills=0,
        mh_kills_best_life=0,
        mh_kills_best=0,
        mh_deaths=0,
        mh_deaths_worst=0
        WHERE ${(gametypeId !== 0 && mapId !== 0) ? "player_id" : "id"}=? AND gametype=? AND map=?`;

        return await simpleQuery(query, [playerId, gametypeId, mapId]);
    }

    


    async getNameIdPairs(){

        const query = "SELECT id,name FROM nstats_player_totals WHERE gametype=0 AND map=0 ORDER BY name ASC";

        return await simpleQuery(query);
    }
    

    async bNameInUse(name){

        try{

            const result = await simpleQuery("SELECT COUNT(*) as total_found FROM nstats_player_totals WHERE name=? AND gametype=0", 
            [name]);


            if(result.length > 0){
                if(result[0].total_found > 0) return true;
            }

            return false;

        }catch(err){
            console.trace(err);
            return true;
        }
    }

    async getPlayerTotals(name){

        return await simpleQuery("SELECT * FROM nstats_player_totals WHERE name=?",[name]);
    }



    async bPlayerGametypeTotalExists(playerId, gametypeId){

        const query = "SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE player_id=? AND gametype=?";
        const result = await simpleQuery(query, [playerId, gametypeId]);

        if(result[0].total_players === 0) return false;
        return true;
    }
    


    async getPlayerTotalsFromMatchData(playerId, type){

        type = type.toLowerCase();

        let part1 = "";
        let part2 = "";

        // /${(bAllTotals) ? "" : "gametype,map_id,"}
        if(type === "gametypes"){
            part1 = "gametype,";
            part2 = " GROUP BY gametype";
        }

        if(type === "maps"){
            part1 = "map_id,";
            part2 = " GROUP BY map_id";
        }

        if(type === "all"){
            part1 = "gametype, map_id,";
            part2 = " GROUP BY gametype,map_id";
        }


        let query = `SELECT ${part1}
        COUNT(*) as total_matches,
        SUM(winner) as wins,
        SUM(draw) as draws,
        SUM(playtime) as playtime,
        MIN(match_date) as first,
        MAX(match_date) as last,
        SUM(team_0_playtime) team_0_playtime,
        SUM(team_1_playtime) as team_1_playtime,
        SUM(team_2_playtime) as team_2_playtime,
        SUM(team_3_playtime) as team_3_playtime,
        SUM(spec_playtime) as spec_playtime,
        SUM(first_blood) as first_bloods,
        SUM(frags) as frags,
        SUM(score) as score,
        SUM(kills) as kills,
        SUM(deaths) as deaths,
        SUM(suicides) as suicides,
        SUM(team_kills) as team_kills,
        SUM(spawn_kills) as spawn_kills,
        SUM(multi_1) as multi_1,
        SUM(multi_2) as multi_2,
        SUM(multi_3) as multi_3,
        SUM(multi_4) as multi_4,
        SUM(multi_5) as multi_5,
        SUM(multi_6) as multi_6,
        SUM(multi_7) as multi_7,
        MAX(multi_best) as multi_best,
        SUM(spree_1) as spree_1,
        SUM(spree_2) as spree_2,
        SUM(spree_3) as spree_3,
        SUM(spree_4) as spree_4,
        SUM(spree_5) as spree_5,
        SUM(spree_6) as spree_6,
        SUM(spree_7) as spree_7,
        MAX(spree_best) as spree_best,
        MAX(best_spawn_kill_spree) as best_spawn_kill_spree,
        SUM(assault_objectives) as assault_objectives,
        AVG(accuracy) as accuracy,
        MIN(ping_min) as ping_min,
        AVG(ping_average) as ping_average,
        MAX(ping_max) as ping_max,
        MIN(shortest_kill_distance) as shortest_kill_distance,
        AVG(average_kill_distance) as average_kill_distance,
        MAX(longest_kill_distance) as longest_kill_distance,
        SUM(k_distance_normal) as k_distance_normal,
        SUM(k_distance_long) as k_distance_long,
        SUM(k_distance_uber) as k_distance_uber,
        SUM(headshots) as headshots,
        SUM(shield_belt) as shield_belt,
        SUM(amp) as amp,
        SUM(amp_time) as amp_time,
        SUM(invisibility) as invisibility,
        SUM(invisibility_time) as invisibility_time,
        SUM(pads) as pads,
        SUM(armor) as armor,
        SUM(boots) as boots,
        SUM(super_health) as super_health,
        SUM(mh_kills) as mh_kills,
        MAX(mh_kills) as mh_kills_best,
        MAX(mh_kills_best_life) as mh_kills_best_life,
        SUM(mh_deaths) as mh_deaths,
        MAX(mh_deaths) as mh_deaths_worst,
        SUM(telefrag_kills) as telefrag_kills,
        SUM(telefrag_deaths) as telefrag_deaths,
        MAX(telefrag_best_spree) as telefrag_best_spree,
        MAX(telefrag_best_multi) as telefrag_best_multi,
        SUM(tele_disc_kills) as tele_disc_kills,
        SUM(tele_disc_deaths) as tele_disc_deaths,
        MAX(tele_disc_best_spree) as tele_disc_best_spree,
        MAX(tele_disc_best_multi) as tele_disc_best_multi
        FROM nstats_player_matches
        WHERE player_id=?`;

        //part2
        //if(!bAllTotals) query += ` GROUP BY gametype, map_id`;

        query += part2;

        const result = await simpleQuery(query, [playerId]);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            let efficiency = 0;

            if(r.kills > 0){

                if(r.deaths === 0){
                    efficiency = 100;
                }else{

                    efficiency = (r.kills / (r.kills + r.deaths)) * 100;
                }
            }

            r.efficiency = efficiency;


            let winRate = 0;

            if(r.total_matches > 0 && r.wins > 0){          

                winRate = (r.wins / r.total_matches) * 100;        
            }

            r.winRate = winRate;
            r.losses = r.total_matches - r.wins - r.draws;
        }

        return result;
    }

    async updatePlayerTotal(playerId, gametypeId, mapId, data){

        return await updatePlayerTotal(playerId, gametypeId, mapId, data);
    }


    async getPlayerName(player){

        try{

            const result = await simpleQuery("SELECT name FROM nstats_player_totals WHERE id=?", [player]);

            if(result.length > 0){

                return result[0].name;

            }else{

                return "Not Found";
            }

        }catch(err){
            console.trace(err);
        }
    }

  
    async getAllPlayersGametypeMatchData(gametypeId, playerId){

        return getAllPlayersGametypeMatchData(gametypeId, playerId);
    }


    async setPlayerMatchNames(players){

        const ids = players.map((player) =>{
            return player.player_id;
        });


        const names = await this.getJustNamesByIds(ids);

        for(let i = 0; i < players.length; i++){

            const p = players[i];

            if(names[`${p.player_id}`] !== undefined){
                p.name = names[`${p.player_id}`];
            }else{
                p.name = "Not Found";
            }
        }

    }



    async getUniquePlayersBetween(start, end){

        const query = "SELECT COUNT(DISTINCT player_id) as players FROM nstats_player_matches WHERE match_date>? AND match_date<=?";

        const data = await simpleQuery(query, [start, end]);

        if(data.length > 0) return data[0].players;

        return 0;
    }


    async getTeamMatePlayedMatchIds(players){

        if(players.length < 2) return [];

        const query = "SELECT match_id, player_id, team FROM nstats_player_matches WHERE player_id IN (?) AND playtime>0";

        const result = await simpleQuery(query, [players]);

        const matchIds = {};


        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(matchIds[r.match_id] === undefined){
                matchIds[r.match_id] = {"players": 1, "teams": [r.team]};
            }else{

                matchIds[r.match_id].players++;

                if(matchIds[r.match_id].teams.indexOf(r.team) === -1){
                    matchIds[r.match_id].teams.push(r.team);
                }
            }
        }

        const bothPlayed = [];
        const bothPlayedTeams = {};

        for(const [key, value] of Object.entries(matchIds)){

            if(value.players === players.length){

                if(value.teams.length === 1){

                    const matchId = parseInt(key);

                    bothPlayed.push(matchId);
                    bothPlayedTeams[matchId] = value.teams[0];
                }
            }
        }

        return {"matches": bothPlayed, "teams": bothPlayedTeams};
    }


    async getMuliplePlayersPlayedMatches(playerIds){

        if(playerIds.length === 0) return [];

        const query = "SELECT match_id FROM nstats_player_matches WHERE player_id IN (?)";

        const result = await simpleQuery(query, [playerIds]);

        const data = [];

        for(let i = 0; i < result.length; i++){

            const id = result[i].match_id;

            if(data.indexOf(id) === -1){
                data.push(id);
            }
        }

        return data;
    }

    createTeamsDataObject(){

        return {
            "matches": 0,
            "playtime": 0,
            "kills": 0,
            "score": 0,
            "frags": 0,
            "deaths": 0,
            "suicides": 0,
            "teamKills": 0,
            "spawnKills": 0,
            "spreeBest": 0,
            "multiBest": 0,
            "firstBloods": 0,
            "flagAssist": 0,
            "flagReturn": 0,
            "flagTaken": 0,
            "flagDropped": 0,
            "flagCapture": 0,
            "flagPickup": 0,
            "flagSeal": 0,
            "flagCover": 0,
            "flagCoverPass": 0,
            "flagCoverFail": 0,
            "flagSelfCover": 0,
            "flagSelfCoverPass": 0,
            "flagSelfCoverFail": 0,
            "flagMultiCover": 0,
            "flagSpreeCover": 0,
            "flagCoverBest": 0,
            "flagSelfCoverBest": 0,
            "flagKill": 0,
            "flagSave": 0,
            "flagCarryTime": 0,
            "flagCarryTimeBest": 0
        };
    }

    updateTeamsDataObject(obj, data){

        obj.flagAssist += data.flag_assist;
        obj.flagReturn += data.flag_return;
        obj.flagTaken += data.flag_taken;
        obj.flagDropped += data.flag_dropped;
        obj.flagCapture += data.flag_capture;
        obj.flagPickup += data.flag_pickup;
        obj.flagSeal += data.flag_seal;
        obj.flagCover += data.flag_cover;
        obj.flagCoverPass += data.flag_cover_pass;
        obj.flagCoverFail += data.flag_cover_fail;
        obj.flagSelfCover += data.flag_self_cover;
        obj.flagSelfCoverPass += data.flag_self_cover_pass;
        obj.flagSelfCoverFail += data.flag_self_cover_fail;
        obj.flagMultiCover += data.flag_multi_cover;
        obj.flagSpreeCover += data.flag_spree_cover;
        obj.flagCarryTime += data.flag_carry_time;
      
        if(data.flag_carry_time > obj.flagCarryTimeBest) obj.flagCarryTimeBest = data.flag_carry_time;

        if(obj.flagCoverBest < data.flag_cover_best) obj.flagCoverBest = data.flag_cover_best;
        if(obj.flagSelfCoverBest < data.flag_self_cover_best) obj.flagSelfCoverBest = data.flag_self_cover_best;

        obj.flagKill += data.flag_kill;
        obj.flagSave += data.flag_save;

        obj.matches++;
        obj.playtime += data.playtime;
        obj.kills += data.kills;
        obj.score += data.score;
        obj.frags += data.frags;
        obj.deaths += data.deaths;
        obj.suicides += data.suicides;
        obj.teamKills += data.team_kills;
        obj.spawnKills += data.spawn_kills;
        obj.firstBloods += data.first_blood;
        
        if(data.multi_best > obj.multiBest){
            obj.multiBest = data.multi_best;
        }

        if(data.spree_best > obj.spreeBest){
            obj.spreeBest = data.spree_best;
        }
    }

    async getTeamsMatchesTotals(playerIds, matchIds){

        if(playerIds.length === 0 || matchIds.length === 0) return [];

        const query = `SELECT match_id,map_id,player_id,gametype,playtime,first_blood,
        frags,score,kills,team_kills,deaths,suicides,spawn_kills,spree_best,multi_best,
        ping_average,
        flag_assist,flag_return,flag_taken,flag_dropped,flag_capture,flag_pickup,
        flag_seal,flag_cover,flag_cover_pass,flag_cover_fail,flag_self_cover,flag_self_cover_pass,
        flag_self_cover_fail,flag_multi_cover,flag_spree_cover,flag_cover_best,flag_self_cover_best,
        flag_kill,flag_save,flag_carry_time
        FROM nstats_player_matches WHERE match_id IN (?) AND player_id IN (?)`;

        const result = await simpleQuery(query, [matchIds, playerIds]);

        const maps = {};
        const gametypes = {};
        const totals = this.createTeamsDataObject();
        const players = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(maps[r.map_id] === undefined){
                maps[r.map_id] = this.createTeamsDataObject();
            }

            if(gametypes[r.gametype] === undefined){
                gametypes[r.gametype] = this.createTeamsDataObject();
            }

            if(players[r.player_id] === undefined){
                players[r.player_id] = this.createTeamsDataObject();
            }

            const currentMap = maps[r.map_id];
            const currentGametype = gametypes[r.gametype];
            const currentPlayer = players[r.player_id];

            this.updateTeamsDataObject(currentMap, r);
            this.updateTeamsDataObject(currentGametype, r);
            this.updateTeamsDataObject(totals, r);
            this.updateTeamsDataObject(currentPlayer, r);
            
        }

        return {"totals": totals, "gametypes": gametypes, "maps": maps, "players": players};       
    }

    async getPlayersAfter(start, maxPlayers, bAdmin){

        if(bAdmin === undefined) bAdmin = false;

        const query = `SELECT name,player_id,first,last,country${(bAdmin) ? ",ip" : ""} 
        FROM nstats_player_totals WHERE gametype=0 AND last>=? ORDER BY last DESC LIMIT ?`;

        const vars = [start, maxPlayers];

        return await simpleQuery(query, vars);
    }


    async adminTotalsSearchFor(columnName, value){

        columnName = columnName.toLowerCase();

        const valid = ["name", "ip"];

        if(valid.indexOf(columnName) === -1) return [];

        const query = `SELECT id,player_id,hwid,name,ip,country,first,last,playtime,matches as total_matches
        FROM nstats_player_totals WHERE player_id=0 AND ${columnName} LIKE ? AND gametype=0 ORDER BY ${columnName} ASC`;

        const result = await simpleQuery(query, [`%${value}%`]);

        return result;
    }

    async ipSearch(ip){

        const query = `SELECT player_id, MIN(match_date) as first_match, MAX(match_date) as last_match, 
            SUM(playtime) as playtime, country,
            COUNT(*) as total_matches, ip
            FROM nstats_player_matches
            WHERE ip LIKE ? GROUP BY player_id, ip`;

        return await simpleQuery(query, [`%${ip}%`]);

   
    }

    async bulkIpSearch(ips){

        const data = [];
        const playerIds = [];

        for(let i = 0; i < ips.length; i++){

            const ip = ips[i];

            const result = await this.ipSearch(ip)

            /*if(result === null) continue;

            if(playerIds.indexOf(result.player_id) === -1){
                playerIds.push(result.player_id);
            }*/

            if(result.length === 0) continue;

            for(let x = 0; x < result.length; x++){

                const r = result[x];

                if(playerIds.indexOf(r.player_id) === -1){
                    playerIds.push(r.player_id);
                }
            }
            

            data.push(...result);
        }

        const playerNames = await this.getJustNamesByIds(playerIds);


        setIdNames(data, playerNames, "player_id", "name");

        data.sort((a, b) =>{

            a = a.total_matches;
            b = b.total_matches;

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }
            return 0;
        });

        return data;
    }

    async adminSearch(name, ip){

        let nameTotalsResult = [];
        let ipTotalsResult = [];

        const totalsResult = [];
        const usedIps = [];
        const playerIds = [];
        const playerNames = [];

        if(name !== null && name !== ""){

            nameTotalsResult = await this.adminTotalsSearchFor("name", name);

            totalsResult.push(...nameTotalsResult);

            for(let i = 0; i < nameTotalsResult.length; i++){

                const n = nameTotalsResult[i];

                if(usedIps.indexOf(n.ip) === -1) usedIps.push(n.ip);
                if(playerIds.indexOf(n.player_id) === -1) playerIds.push(n.player_id);
                if(playerNames.indexOf(n.name) === -1) playerNames.push(n.name);
            }

        }

        if(ip !== null && ip !== ""){

            ipTotalsResult = await this.adminTotalsSearchFor("ip", ip);
            totalsResult.push(...ipTotalsResult);

            for(let i = 0; i < ipTotalsResult.length; i++){

                const n = ipTotalsResult[i];

                if(usedIps.indexOf(n.ip) === -1) usedIps.push(n.ip);
                if(playerIds.indexOf(n.player_id) === -1) playerIds.push(n.player_id);
                if(playerNames.indexOf(n.name) === -1) playerNames.push(n.name);
            }
        }

     
        const ipStats = await this.bulkIpSearch(usedIps);


        //return
        return {
            "nameResult": nameTotalsResult,
           // "ipResult": ipTotalsResult,
            "ipDetails": ipStats 
        };

    }

    async getFullIPHistory(ip){

        const query = "SELECT match_id,player_id,country,match_date FROM nstats_player_matches WHERE ip=? ORDER BY match_date DESC";

        const result = await simpleQuery(query, [ip]);

        const uniquePlayerIds = getUniqueValues(result, "player_id");

        const playerNames = await this.getJustNamesByIds(uniquePlayerIds);

        return {"matchData": result, "playerNames": playerNames};
    }

    async getUsedIps(playerId){

        const query = `SELECT ip, MIN(match_date) as first_match, MAX(match_date) as last_match, COUNT(*) as total_matches,
        SUM(playtime) as total_playtime
        FROM nstats_player_matches WHERE player_id=? GROUP BY(ip)`;

        const result = await simpleQuery(query, [playerId]);

        const ips = [];

        for(let i = 0; i < result.length; i++){

            ips.push(result[i].ip);

        }

        return {"ips": ips, "data": result}

    }

    async getAliasesByIPs(ips){

        if(ips.length === 0) return [];

        const query = `SELECT player_id,ip, MIN(match_date) as first_match, MAX(match_date) as last_match, 
        COUNT(*) as total_matches, SUM(playtime) as total_playtime
        FROM nstats_player_matches WHERE ip IN(?) GROUP BY(player_id)`;

        const result = await simpleQuery(query, [ips]);

        const playerIds = [];

        for(let i = 0; i < result.length; i++){

            playerIds.push(result[i].player_id);
        }

        const playerDetails = await this.getNamesByIds(playerIds, true);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(playerDetails[r.player_id] !== undefined){

                r.name = playerDetails[r.player_id].name;
                r.country = playerDetails[r.player_id].country;

            }else{
                r.name = "Not Found";
                r.country = "xx";
            }
        }

        result.sort((a, b) =>{

            a = a.name.toLowerCase();
            b = b.name.toLowerCase();

            if(a < b){
                return -1;
            }else if(a > b){
                return 1;
            }
            return 0;
        });
        
        return result;
    }

    async getConnectionsById(playerId, page, perPage){

        const query = "SELECT match_id,ip,country,playtime,match_date FROM nstats_player_matches WHERE player_id=? ORDER BY match_date DESC LIMIT ?, ?";

        if(page < 0) page = 0;
        if(perPage <= 0) perPage = 25;

        const start = perPage * page;

        return await simpleQuery(query, [playerId, start, perPage]);

    }


    async getTotalConnectionsById(playerId){

        const query = "SELECT COUNT(*) as total_connections FROM nstats_player_matches WHERE player_id=?";

        const result = await simpleQuery(query, [playerId]);

        return result[0].total_connections;
    }


    getValidRecordTypes(bJustTypes){

        if(bJustTypes === undefined) bJustTypes = false;


        const both = [
            {"type": "playtime", "display": "Playtime"},
            {"type": "kills", "display": "Kills"},
            {"type": "deaths", "display": "Deaths"},
            {"type": "suicides", "display": "Suicides"},
            {"type": "team_kills", "display": "Team Kills"},
            {"type": "spawn_kills", "display": "Spawn Kills"},
            {"type": "frags", "display": "Frags"},
            {"type": "score", "display": "Score"},
            {"type": "spree_best", "display": "Best Killing Spree"},
            {"type": "multi_best", "display": "Best Multi Kill"},
            {"type": "efficiency", "display": "Efficiency"},
        
            /*{"type": "flag_assist", "display": "CTF Flag Assists"},
            {"type": "flag_return", "display": "CTF Flag Returns"},
            {"type": "flag_taken", "display": "CTF Flag Grabs"},
            {"type": "flag_dropped", "display": "CTF Flag Drops"},
            {"type": "flag_capture", "display": "CTF Flag Captures"},
            {"type": "flag_pickup", "display": "CTF Flag Pickups"},
            {"type": "flag_seal", "display": "CTF Flag Seals"},
            {"type": "flag_cover", "display": "CTF Flag Covers"},
            {"type": "flag_kill", "display": "CTF Flag Kills"},
            {"type": "flag_save", "display": "CTF Flag Close Returns"},
            {"type": "flag_carry_time", "display": "CTF Flag Carry Time"},
            {"type": "flag_self_cover", "display": "CTF Kills Carrying Flag"},
            {"type": "flag_multi_cover", "display": "CTF Multi Covers"},
            {"type": "flag_spree_cover", "display": "CTF Cover Sprees"},
        
            {"type": "flag_cover_best", "display": "CTF Most Cover Kills"},
            {"type": "flag_self_cover_best", "display": "CTF Most Kills With Flag"}*/
        ];
    
        const totalTypes =  [
            ...both,
            {"type": "matches", "display": "Matches"},
            {"type": "wins", "display": "Match Wins"},
            {"type": "losses", "display": "Match Losses"},
            {"type": "draws", "display": "Match Draws"},
            {"type": "first_bloods", "display": "First Bloods"}
        ];

        const matchTypes = [
            ...both
        ];
    
    
        if(!bJustTypes){
            return {"totals": totalTypes, "matches": matchTypes};
        }
    
        let totalKeys = [];
    
        for(let i = 0; i < totalTypes.length; i++){
    
            const {type} = totalTypes[i];
            totalKeys.push(type);
        }

        let matchKeys = [];

        for(let i = 0; i < matchTypes.length; i++){
    
            const {type} = matchTypes[i];
            matchKeys.push(type);
        }
    
        return {"totals": totalKeys, "matches": matchKeys};
        
    }


    async getPlayedGametypes(playerId){

        const query = "SELECT DISTINCT gametype FROM nstats_player_matches WHERE player_id=?";

        const result = await simpleQuery(query, [playerId]);

        const gametypes = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            gametypes.push(r.gametype);
        }

        return gametypes;
    }

    getUniqueFaces(data){

        const found = new Set();

        for(let i = 0; i < data.length; i++){

            found.add(data[i].face);
        }

        return [...found];
    }


    async getBasicInfo(playerIds, bIgnoreIdsInObject){

        if(bIgnoreIdsInObject === undefined) bIgnoreIdsInObject = false;
        if(playerIds.length === 0) return {};

        const query = `SELECT name,id,country FROM nstats_player_totals WHERE id IN(?)`;
        const result = await simpleQuery(query, [playerIds]);
        const found = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            const current = {"name": r.name, "country": r.country};

            if(!bIgnoreIdsInObject) current.id = r.id;
            
            found[r.id] = current;
        }

        return found;
    }


    async getUniquePlayersByDay(start, end){

        //getUniquePlayersBetween(start, end)
        const day = (60 * 60) * 24;

        let current = start;

        const data = {};

        let dayIndex = 0;

        while(current < end){

            data[dayIndex] = await this.getUniquePlayersBetween(current, current + day);
            current += day;
            dayIndex++;
        }

        return data;
    }


    async getCountries(playerIds){

        return await getPlayersCountries(playerIds);
    }
    

    async getPlayerMapGametypeRecords(){

        const query = `SELECT 
        player_id,
        map_id,
        gametype,
        COUNT(*) as total_matches,
        MIN(match_date) as first_match,
        MAX(match_date) as last_match,
        SUM(winner) as wins,
        SUM(draw) as draws,
        SUM(playtime) as playtime,
        SUM(team_0_playtime) as team_0_playtime,
        SUM(team_1_playtime) as team_1_playtime,
        SUM(team_2_playtime) as team_2_playtime,
        SUM(team_3_playtime) as team_3_playtime,
        SUM(spec_playtime) as spec_playtime,
        SUM(first_blood) as first_bloods,
        SUM(frags) as frags,
        SUM(score) as score,
        SUM(kills) as kills,
        SUM(deaths) as deaths,
        SUM(suicides) as suicides,
        SUM(team_kills) as team_kills,
        SUM(spawn_kills) as spawn_kills,
        SUM(multi_1) as multi_1,
        SUM(multi_2) as multi_2,
        SUM(multi_3) as multi_3,
        SUM(multi_4) as multi_4,
        SUM(multi_5) as multi_5,
        SUM(multi_6) as multi_6,
        SUM(multi_7) as multi_7,
        MAX(multi_best) as multi_best,
        SUM(spree_1) as spree_1,
        SUM(spree_2) as spree_2,
        SUM(spree_3) as spree_3,
        SUM(spree_4) as spree_4,
        SUM(spree_5) as spree_5,
        SUM(spree_6) as spree_6,
        SUM(spree_7) as spree_7,
        MAX(spree_best) as spree_best,
        MAX(best_spawn_kill_spree) as best_spawn_kill_spree,
        SUM(assault_objectives) as assault_objectives,
        AVG(accuracy) as accuracy,
        SUM(k_distance_normal) as k_distance_normal,
        SUM(k_distance_long) as k_distance_long,
        SUM(k_distance_uber) as k_distance_uber,
        SUM(headshots) as headshots,
        SUM(shield_belt) as shield_belt,
        SUM(amp) as amp,
        SUM(amp_time) as amp_time,
        SUM(invisibility) as invisibility,
        SUM(invisibility_time) as invisibility_time,
        SUM(pads) as pads,
        SUM(armor) as armor,
        SUM(boots) as boots,
        SUM(super_health) as super_health,
        SUM(mh_kills) as mh_kills,
        MAX(mh_kills_best_life) as mh_kills_best_life,
        MAX(mh_kills) as mh_kills_best,
        SUM(mh_deaths) as mh_deaths,
        MAX(mh_deaths) as mh_deaths_worst,
        SUM(telefrag_kills) as telefrag_kills,
        MAX(telefrag_kills) as telefrag_kills_best,
        SUM(telefrag_deaths) as telefrag_deaths,
        MAX(telefrag_deaths) as telefrag_deaths_worst,
        MAX(telefrag_best_spree) as telefrag_best_spree,
        MAX(telefrag_best_multi) as telefrag_best_multi,
        SUM(tele_disc_kills) as tele_disc_kills,
        MAX(tele_disc_kills) as tele_disc_kills_best,
        SUM(tele_disc_deaths) as tele_disc_deaths,
        MAX(tele_disc_deaths) as tele_disc_deaths_worst,
        MAX(tele_disc_best_spree) as tele_disc_best_spree,
        MAX(tele_disc_best_multi) as tele_disc_best_multi

        FROM nstats_player_matches GROUP BY player_id,map_id,gametype`;

        return await simpleQuery(query);
    }

    /**
     * Delete all player totals apart from gametype=0 and map=0(all time totals)
    */   
    async deleteAllPlayerGametypeMapTotals(){

        const query = `DELETE FROM nstats_player_totals WHERE player_id!=0`;

        return await simpleQuery(query);
    }





    
    async bGametypeMapStatsExist(playerId, gametypeId, mapId){

        const query = `SELECT COUNT(*) as total_players FROM nstats_player_totals WHERE player_id=? AND gametype=? AND map=?`;

        const result = await simpleQuery(query, [playerId, gametypeId, mapId]);

        if(result[0].total_players > 0) return true;

        return false;
    }

    
    updateRecalulatePlayerCurrent(totals, playerId, gametypeId, mapId, data){

        if(totals[playerId] === undefined){
            totals[playerId] = {};
        }

        if(totals[playerId][mapId] === undefined){
            totals[playerId][mapId] = {};
        }

        if(totals[playerId][mapId][gametypeId] === undefined){
            totals[playerId][mapId][gametypeId] = data;
            return;
        }
    }



    async deletePlayerTotalsByRowIds(rowIds){

        if(rowIds.length === 0) return;

        const query = `DELETE FROM nstats_player_totals WHERE id IN(?)`;

        return await simpleQuery(query, [rowIds]);
    }



    async changeMapId(oldId, newId){

        const tables = [
            //"player_maps", //map
            "player_matches", //map_id
            "player_telefrags", //map_id
            "player_totals", //map need to merge dupliactes

        ];

        //merge maps dupliactes

        const columns = [
            "map", "map_id", "map_id", "map"
        ];

        //map not map_id
        for(let i = 0; i < tables.length; i++){

            const t = tables[i];
            const c = columns[i];

            const query = `UPDATE nstats_${t} SET ${c}=? WHERE ${c}=?`;

            await simpleQuery(query, [newId, oldId]);
        }


       // await this.fixDuplucateMapsData(newId);
        await this.fixDuplicateMapTotals(newId);
    }
}


/**
 * get every id,name,country
 */
export async function getAllPlayerBasic(){

    const query = `SELECT id,name,country FROM nstats_player ORDER BY name ASC`;

    return await simpleQuery(query);
}


export async function getBasicPlayersByIds(playerIds){

    if(playerIds.length === 0) return {};

    const query = `SELECT id,name,country FROM nstats_player WHERE id IN (?)`;

    const result = await simpleQuery(query, [playerIds]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const {id, name, country} = result[i];
        data[id] = {name, country};
    }

    return data;
}

export async function getPlayersCountries(playerIds){

    if(playerIds.length === 0) return {};

    const query = `SELECT id,country FROM nstats_player WHERE id IN(?)`;

    const result = await simpleQuery(query, [playerIds]);

    const obj = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        obj[r.id] = r.country;
    }

    return obj;
}


export async function getAllInMatch(id){

    const query = "SELECT * FROM nstats_player_matches WHERE match_id=?";

    const players = await simpleQuery(query, [id]);

    let mapId = -1;

    if(players.length > 0){
        mapId = parseInt(players[0].map_id);
    }

    for(let i = 0; i < players.length; i++){
        delete players[i].ip;
        delete players[i].hwid;
    }

    const faceIds = new Set();
    const playerIds = new Set();


    for(let i = 0; i < players.length; i++){

        const p = players[i];
        faceIds.add(p.face);
        playerIds.add(p.player_id);
    }


    const ctfData = await getPlayerMatchCTFData(id, [...playerIds], mapId);
    //const ctf = new CTF();
    //await ctf.setMatchCTFData(id, players);
    //console.log(players);

    //console.log(playerIds);
    const playerNames = await getBasicPlayersByIds([...playerIds]);

    //const faces = await getFacesById([...faceIds]);


    for(let i = 0; i < players.length; i++){

        const p = players[i];
        const pInfo = getPlayer(playerNames, p.player_id, true);
        p.name = pInfo.name;

        if(ctfData[p.player_id] === undefined) continue;

        p.ctfData = ctfData[p.player_id];
        //p.faceImage = (faces[p.face] !== undefined) ? faces[p.face] : "faceless";

    }

    return players;
}

function updateOtherScoresGraphData(players, ignoredPlayers){

    for(const [playerId, playerData] of Object.entries(players)){

        const index = ignoredPlayers.indexOf(parseInt(playerId));

        if(index === -1){
            playerData.values.push(playerData.lastScore);
        }
    }

}

function createPlayerScoreHistory(data, players){

    const playerScores = {};

    /*for(const [playerId, playerName] of Object.entries(players)){

        playerScores[parseInt(playerId)] = {
            "name": playerName, 
            "values": [0], 
            "lastScore": 0
        };
    }*/

        for(let i = 0; i < players.length; i++){

            const p = players[i];
            playerScores[p.player_id] = {
                "name": p.name,
                "values": [0],
                "lastScore": 0
            };
        }

    //console.log(playerScores);

    if(Object.keys(playerScores).length === 0) return [];

    let previousTimestamp = -1;
    let currentIgnoreList = [];

    for(let i = 0; i < data.length; i++){

        const {timestamp, player, score} = data[i];

        if(timestamp !== previousTimestamp){
            updateOtherScoresGraphData(playerScores, currentIgnoreList);
            currentIgnoreList = [];
        }

        if(playerScores[player] === undefined){
            //console.log(`Players.createPlayerScoreHistory(${player}) player is null`);
            continue;
        }


        const currentPlayer = playerScores[player];

        //reconnected players scores can have duplicated data
        if(currentIgnoreList.indexOf(player) !== -1){
            currentPlayer.values[currentPlayer.values.length - 1] = score;
            continue;
        }

        currentPlayer.values.push(score);
        currentPlayer.lastScore = score;

        currentIgnoreList.push(player);

        previousTimestamp = timestamp;
    }

    updateOtherScoresGraphData(playerScores, currentIgnoreList);

    return Object.values(playerScores);
}

export async function getScoreHistory(matchId, players){    

    
    const query = "SELECT timestamp,player,score FROM nstats_match_player_score WHERE match_id=? ORDER BY timestamp ASC";

    const data = await simpleQuery(query, [matchId]);

    const timestamps = [...new Set(data.map((d) =>{
        return d.timestamp;
    }))];

    const graphData = createPlayerScoreHistory(data, players);

    graphData.sort((a, b) =>{

        a = a.lastValue;
        b = b.lastValue;

        return b-a;
    });

    return {"data": graphData, "labels": timestamps};
}

async function deleteMatchScoreHistory(matchId){
    
    const query = `DELETE FROM nstats_match_player_score WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}

export async function deleteMatchesScoreHistory(matchIds){

    if(matchIds.length === 0) return;

    const query = `DELETE FROM nstats_match_player_score WHERE match_id IN (?)`;

    return await simpleQuery(query, [matchIds]);
}

export async function deletePlayersMatchData(matchId){

    const query = "DELETE FROM nstats_player_matches WHERE match_id=?";
    await simpleQuery(query, [matchId]);

    await deleteMatchScoreHistory(matchId);
}


export async function getAllPlayersGametypeMatchData(gametypeId, playerId){

    const query = "SELECT * FROM nstats_player_matches WHERE gametype=? AND player_id=?";

    return await simpleQuery(query, [gametypeId, playerId]);
}


async function deletePlayerTotal(playerId, gametypeId, mapId){

    let query = `DELETE FROM nstats_player_totals WHERE player_id=? AND gametype=? AND map=?`;
    let vars = [playerId, gametypeId, mapId];

    return await simpleQuery(query, vars);

}

async function getTotalsFromMatchTable(playerIds, gametypeId, mapId){

    if(playerIds.length === 0) return {};

    let query = `SELECT
    ${PLAYER_TOTALS_FROM_MATCHES_COLUMNS}
    FROM nstats_player_matches WHERE player_id IN(?) AND match_result!='s'`;


    const vars = [playerIds];

    if(gametypeId !== 0){
        vars.push(gametypeId);
        query += ` AND gametype=?`;
    }

    if(mapId !== 0){
        vars.push(mapId);
        query += ` AND map_id=?`;
    }

    const result = await simpleQuery(`${query} GROUP BY player_id`, vars);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        data[r.player_id] = r;
    }

    return data;
}

async function deleteTotals(playerIds, gametypeId, mapId){

    if(playerIds.length === 0) return;

    const query = `DELETE FROM nstats_player_totals WHERE player_id IN(?) AND gametype=? AND map=?`;


    return await simpleQuery(query, [playerIds, gametypeId, mapId]);

}

export async function recalculateTotals(playerIds, gametypeId, mapId){


    if(playerIds.length === 0) return;

    const totals = await getTotalsFromMatchTable(playerIds, gametypeId, mapId);

    for(let i = 0; i < playerIds.length; i++){

        const id = playerIds[i];

        if(totals[id] === undefined){
            await deletePlayerTotal(id, gametypeId, mapId);
        }
    }


    const winrateData = await getBasicWinrateStats(playerIds, gametypeId, mapId);


    const data = [];

    for(const [playerId, playerData] of Object.entries(totals)){

        const r = playerData;

        r.wins = 0;
        r.draws = 0;
        r.losses = 0;
        r.winrate = 0;
        r.efficiency = 0;

        if(winrateData[r.player_id] !== undefined){

            const w = winrateData[r.player_id];

            r.wins = w.wins; 
            r.draws = w.draws; 
            r.losses = w.losses;
            r.winrate = w.winrate; 
        }

        const kills = parseInt(r.kills);
        const deaths = parseInt(r.deaths);

        if(kills > 0){

            if(deaths === 0){
                r.efficiency = 100;
            }else{
                r.efficiency = kills / (kills + deaths) * 100;
            }
        }


        data.push(r);
    }

    await deleteTotals(playerIds, gametypeId, mapId);
    await bulkInsertTotals(gametypeId, mapId, data);
}




async function bulkInsertTotals(gametypeId, mapId, data){

    const query = `INSERT INTO nstats_player_totals (
        player_id,          first,              last,
        gametype,           map,
        matches,            wins,               losses,
        draws,              winrate,            playtime,
        team_0_playtime,    team_1_playtime,    team_2_playtime,
        team_3_playtime,    spec_playtime,      first_bloods,
        frags,              score,              kills,
        deaths,             suicides,           team_kills,
        spawn_kills,        efficiency,         multi_1,
        multi_2,            multi_3,            multi_4,
        multi_5,            multi_6,            multi_7,
        multi_best,         spree_1,            spree_2,
        spree_3,            spree_4,            spree_5,
        spree_6,            spree_7,            spree_best,
       best_spawn_kill_spree,
        assault_objectives, accuracy,           k_distance_normal,
        k_distance_long,    k_distance_uber,    headshots,
        shield_belt,        amp,                amp_time,
        invisibility,       invisibility_time,  pads,
        armor,              boots,              super_health,
        mh_kills,           mh_kills_best_life, mh_kills_best,
        views,              mh_deaths,          mh_deaths_worst
    ) VALUES ?`;

    const insertVars = [];


    for(let i = 0; i < data.length; i++){

        const d = data[i];

        insertVars.push([
        d.player_id, d.first_match, d.last_match,
        gametypeId,           mapId,
        d.total_matches,      d.wins,               d.losses,
        d.draws,              d.winrate,            d.playtime,
        d.team_0_playtime,    d.team_1_playtime,    d.team_2_playtime,
        d.team_3_playtime,    d.spec_playtime,      d.first_bloods,
        d.frags,              d.score,              d.kills,
        d.deaths,             d.suicides,           d.team_kills,
        d.spawn_kills,        d.efficiency,         d.multi_1,
        d.multi_2,            d.multi_3,            d.multi_4,
        d.multi_5,            d.multi_6,            d.multi_7,
        d.multi_best,         d.spree_1,            d.spree_2,
        d.spree_3,            d.spree_4,            d.spree_5,
        d.spree_6,            d.spree_7,            d.spree_best,
        d.best_spawn_kill_spree,
        d.assault_objectives, d.accuracy,           d.k_distance_normal,
        d.k_distance_long,    d.k_distance_uber,    d.headshots,
        d.shield_belt,        d.amp,                d.amp_time,
        d.invisibility,       d.invisibility_time,  d.pads,
        d.armor,              d.boots,              d.super_health,
        d.mh_kills,           d.mh_kills_best_life, d.mh_kills_best,
        0,              d.mh_deaths,          d.mh_deaths_worst
        ]);
    }

    await bulkInsert(query, insertVars);
}



export async function renamePlayer(playerId, newName){

    await simpleQuery("UPDATE nstats_player_totals SET name=? WHERE id=? OR player_id=?", [newName, playerId, playerId]);
}



async function deletePlayerTotals(id){

    await simpleQuery("DELETE FROM nstats_player_totals WHERE player_id=?", [id]);
    await simpleQuery("DELETE FROM nstats_player_totals WHERE id=?", [id]);
}


async function deletePlayerMatchData(playerId){

    return await simpleQuery(`DELETE FROM nstats_player_matches WHERE player_id=?`, [playerId]);
}


async function getUniquePlayedGametypeMaps(playerId){

    const query = `SELECT DISTINCT gametype,map_id FROM nstats_player_matches WHERE player_id=?`;

    const result = await simpleQuery(query, [playerId]);

    const played = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(played[r.map_id] === undefined) played[r.map_id] = new Set();

        //map all time totals
        played[r.map_id].add(0);
        //map gametype totals
        played[r.map_id].add(r.gametype);
    }

    return played;
}


export async function deletePlayer(playerId){

    const uniquePlayed = await getUniquePlayedGametypeMaps(playerId);

    await deletePlayerAssaultData(playerId);
    await deletePlayerHeadshots(playerId);
    await deletePlayerKills(playerId);
    await deletePlayerScoreData(playerId);
    await deletePlayerPingData(playerId);
    await deletePlayerSprees(playerId);
    await deletePlayerTeamChanges(playerId);
    await deletePlayerTeleFrags(playerId);
    await deletePlayerDomData(playerId);
    await deletePlayerConnections(playerId);
    await deletePlayerMonsterhuntData(playerId);
    await deletePlayerWeaponData(playerId);

    await deletePlayerCTFData(playerId);
    await deletePlayerWinRateData(playerId);
    await deletePlayerItemData(playerId);
    await deletePlayerPowerUpData(playerId);
    await deletePlayerRankingData(playerId);
    await deletePlayerCombogibData(playerId);

    await deletePlayerMatchData(playerId);

    //only do these after match_date is deleted
    await reclaculateCountryTotals();


    for(const [mapId, gametypes] of Object.entries(uniquePlayed)){

        const gametypeIds = [...gametypes];

        for(let i = 0; i < gametypeIds.length; i++){
            await recalculateMapTotals(gametypeIds[i], mapId);
        }
        
    }

    await deletePlayerTotals(playerId);

    const query = `DELETE FROM nstats_player WHERE id=?`;

    await simpleQuery(query, [playerId]);
}

export async function changeMatchDataGametypeId(oldGametypeId, newGametypeId){

    const query = `UPDATE nstats_player_matches SET gametype=? WHERE gametype=?`;

    return await simpleQuery(query, [newGametypeId, oldGametypeId]);
}



async function bulkInsertGametypeTotals(gametypeId, data){

    const winRates = await getGametypeMatchResults(gametypeId);

    const query = `INSERT INTO nstats_player_totals ( 
        player_id,          first,              last,
        gametype,           map,
        matches,            wins,               losses,
        draws,              winrate,            playtime,
        team_0_playtime,    team_1_playtime,    team_2_playtime,
        team_3_playtime,    spec_playtime,      first_bloods,
        frags,              score,              kills,
        deaths,             suicides,           team_kills,
        spawn_kills,        efficiency,         multi_1,
        multi_2,            multi_3,            multi_4,
        multi_5,            multi_6,            multi_7,
        multi_best,         spree_1,            spree_2,
        spree_3,            spree_4,            spree_5,
        spree_6,            spree_7,            spree_best,
       best_spawn_kill_spree,
        assault_objectives, accuracy,           k_distance_normal,
        k_distance_long,    k_distance_uber,    headshots,
        shield_belt,        amp,                amp_time,
        invisibility,       invisibility_time,  pads,
        armor,              boots,              super_health,
        mh_kills,           mh_kills_best_life, mh_kills_best,
        views,              mh_deaths,          mh_deaths_worst
    ) VALUES ?`;

    const insertVars = [];


    for(let i = 0; i < data.length; i++){

        const d = data[i];


        let wins = winRates[d.player_id]?.[d.map_id]?.wins ?? 0;
        let losses = winRates[d.player_id]?.[d.map_id]?.losses ?? 0;;
        let draws = winRates[d.player_id]?.[d.map_id]?.draws ?? 0;;
        let winrate = winRates[d.player_id]?.[d.map_id]?.winRate ?? 0;;

        insertVars.push([
        d.player_id, d.first_match, d.last_match,
        gametypeId,           d.map_id,
        d.total_matches,      wins,               losses,
        draws,              winrate,            d.playtime,
        d.team_0_playtime,    d.team_1_playtime,    d.team_2_playtime,
        d.team_3_playtime,    d.spec_playtime,      d.first_bloods,
        d.frags,              d.score,              d.kills,
        d.deaths,             d.suicides,           d.team_kills,
        d.spawn_kills,        d.efficiency,         d.multi_1,
        d.multi_2,            d.multi_3,            d.multi_4,
        d.multi_5,            d.multi_6,            d.multi_7,
        d.multi_best,         d.spree_1,            d.spree_2,
        d.spree_3,            d.spree_4,            d.spree_5,
        d.spree_6,            d.spree_7,            d.spree_best,
        d.best_spawn_kill_spree,
        d.assault_objectives, d.accuracy,           d.k_distance_normal,
        d.k_distance_long,    d.k_distance_uber,    d.headshots,
        d.shield_belt,        d.amp,                d.amp_time,
        d.invisibility,       d.invisibility_time,  d.pads,
        d.armor,              d.boots,              d.super_health,
        d.mh_kills,           d.mh_kills_best_life, d.mh_kills_best,
        0,              d.mh_deaths,          d.mh_deaths_worst
        ]);
    }

    await bulkInsert(query, insertVars);
}

async function recalculateGametypeTotals(gametypeId){

    const query = `SELECT
    ${PLAYER_TOTALS_FROM_MATCHES_COLUMNS},map_id
    FROM nstats_player_matches WHERE gametype=? GROUP BY player_id,map_id`;

    const result = await simpleQuery(query, [gametypeId]);

    const allMapTotals = {};

    const addKeys = [
        "total_matches",         "playtime",
        "team_0_playtime",
        "team_1_playtime",     "team_2_playtime",       "team_3_playtime",
        "spec_playtime",       "first_bloods",          "frags",
        "score",               "kills",                 "deaths",
        "suicides",            "team_kills",            "spawn_kills",
        "multi_1",             "multi_2",               "multi_3",
        "multi_4",             "multi_5",               "multi_6",
        "multi_7",             "spree_1",
        "spree_2",             "spree_3",               "spree_4",
        "spree_5",             "spree_6",               "spree_7",
        "assault_objectives",         
        "k_distance_normal",     "k_distance_long",
        "k_distance_uber",     "headshots",             "shield_belt",
        "amp",                 "amp_time",              "invisibility",
        "invisibility_time",   "pads",                  "armor",
        "boots",               "super_health",          "mh_kills",
        "mh_deaths",
        "telefrag_kills",        "telefrag_deaths",
        "tele_disc_kills",
        "tele_disc_deaths",    
    ];

    const higherBetterKeys = [
        "multi_best", "spree_best", "best_spawn_kill_spree",
        "mh_kills_best", "mh_kills_best_life", "mh_deaths_worst", "telefrag_best_spree", "telefrag_best_multi",  
        "tele_disc_best_spree",  "tele_disc_best_multi"
    ];

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        r.efficiency = 0;

        const kills = parseFloat(r.kills);
        const deaths = parseFloat(r.deaths);
        
        if(kills > 0){

            if(deaths === 0){
                r.efficiency = 100;
            }else{
                r.efficiency = kills / (kills + deaths) * 100;
            }
        }

        if(allMapTotals[r.player_id] === undefined){

            const current = {
                "map_id": 0
            };

            const keys = Object.keys(r);

            for(let i = 0; i < keys.length; i++){

                const k = keys[i];

                if(k === "player_id"){
                    current.player_id = r.player_id;
                    continue;
                }

                if(k === "first_match"){
                    current.first_match = new Date(DEFAULT_MIN_DATE);
                    continue;
                }

                if(k === "last_match"){
                    current.last_match = new Date(DEFAULT_DATE);
                    continue;
                }

                current[k] = 0;
            }

            current.totalAccuracy = 0;
            current.efficiency = 0;
            //how many maps have been merged into all totals so we can use it for accuracy
            current.merges = 0;
            allMapTotals[r.player_id] = current;
        }

        const all = allMapTotals[r.player_id];
        all.merges++;
        all.totalAccuracy += r.accuracy;

        if(all.first_match > r.first_match){

            all.first_match = r.first_match;
        }

        if(all.last_match < r.last_match){
            all.last_match = r.last_match;
        }

        for(let x = 0; x < addKeys.length; x++){

            const k = addKeys[x];

            if(addKeys.indexOf(k) !== -1){
                all[k] += parseFloat(r[k]);
                continue;
            }

            if(higherBetterKeys.indexOf(k) !== -1){
                
                if(all[k] < r[k]) all[k] = parseFloat(r[k]);
                continue;
            }
        }

        all.accuracy = (all.totalAccuracy > 0 && all.merges > 0) ? all.totalAccuracy / all.merges : 0;

        all.efficiency = 0;

        if(all.kills > 0){

            if(all.deaths === 0){
                all.efficiency = 100;
            }else{
                all.efficiency = all.kills / (all.kills + all.deaths) * 100;
            }
        }
    }


    for(const totals of Object.values(allMapTotals)){
        result.push(totals);
    }

    await deleteGametypeTotals(gametypeId);
    await bulkInsertGametypeTotals(gametypeId, result);

}


async function deleteGametypeTotals(gametypeId){

    const query = `DELETE FROM nstats_player_totals WHERE gametype=?`;
    return await simpleQuery(query, [gametypeId]);
}

/**
 * 
 * @param {*} oldGametypeId 
 * @param {*} newGametypeId 
 */
export async function mergeGametypes(oldGametypeId, newGametypeId){

    //we have already changed the player_match_data gametype ids at the start of gametypes.mergeGametypes

    await deleteGametypeTotals(oldGametypeId);

    await recalculateGametypeTotals(newGametypeId);
}


async function getUniquePlayedMaps(gametypeId){

    let query = `SELECT DISTINCT map FROM nstats_player_matches`;
    const vars = [];

    if(gametypeId !== 0){
        query += ` WHERE gametype=?`;
        vars.push(gametypeId);
    }

    const result = await simpleQuery(query, vars);
    
    const ids = [];

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        ids.push(r.map);
    }

    return ids;

}

export async function deleteGametype(id){


    const tables = [
        "nstats_player_totals",
        "nstats_player_matches"
    ];

    for(let i = 0; i < tables.length; i++){

        const t = tables[i];

        await simpleQuery(`DELETE FROM ${t} WHERE gametype=?`, [id]);
    }
    
}


async function getAllHWIDToNames(){

    const query = `SELECT * FROM nstats_hwid_to_name ORDER BY player_name ASC`;

    const result = await simpleQuery(query);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        data[r.hwid] = r.player_name;

    }

    return data;
}

export async function getAllHWIDS(){

    const query = `SELECT id,name,hwid,country FROM nstats_player WHERE hwid!="" ORDER BY name ASC`;

    const latest = await simpleQuery(query);

    const hwidsToName = await getAllHWIDToNames();

    return {latest, hwidsToName};

}

async function bHWIDAlreadyAssignedToName(hwid){

    if(hwid === "") return false;

    const query = `SELECT COUNT(*) as total_rows FROM nstats_hwid_to_name WHERE hwid=?`;

    const result = await simpleQuery(query, [hwid]);

    return result[0].total_rows > 0;
}

export async function assignNameToHWID(name, hwid){

    if(name === "") throw new Error(`Name can not be an empty string.`);
    if(hwid === "") throw new Error(`HWID can not be an empty string.`);

    if(await bHWIDAlreadyAssignedToName(hwid)) throw new Error(`HWID is already assigned to a name`);


    const query = `INSERT INTO nstats_hwid_to_name VALUES(NULL,?,?)`;

    return await simpleQuery(query, [hwid, name]);
}

export async function deleteAssignedNameToHWID(hwid){

    const query = `DELETE FROM nstats_hwid_to_name WHERE hwid=?`;

    return await simpleQuery(query, [hwid]);
}


export async function addHWIDToDatabase(hwid){

    if(hwid === "") throw new Error(`HWID can not be an empty string`);

    if(await bHWIDAlreadyAssignedToName(hwid)) throw new Error(`That HWID is already in the database`);

    const query = `INSERT INTO nstats_hwid_to_name VALUES(NULL,?,"")`;


    return await simpleQuery(query, [hwid]);
}


async function getMatchHWIDHistory(hwid){

    const query = `SELECT
    nstats_player_matches.match_date,
    nstats_player_matches.match_id, nstats_player_matches.player_id,
    nstats_player_matches.map_id, nstats_player_matches.gametype,
    nstats_player_matches.playtime,
    nstats_player_matches.ip, 
    nstats_player_matches.country,
    nstats_maps.name as mapName,
    nstats_gametypes.name as gametypeName,
    nstats_player.name as playerName
    FROM nstats_player_matches 
    LEFT JOIN nstats_maps ON nstats_maps.id = nstats_player_matches.map_id
    LEFT JOIN nstats_gametypes ON nstats_gametypes.id = nstats_player_matches.gametype
    LEFT JOIN nstats_player ON nstats_player.id = nstats_player_matches.player_id
    WHERE nstats_player_matches.hwid=?
    ORDER BY nstats_player_matches.match_date DESC`;

    const result = await simpleQuery(query, [hwid]);

    return result.map((r) =>{

        r.mapName = removeUnr(r.mapName);

        return r;
    });
}

export async function getHWIDHistory(hwid){

    if(hwid === "") return null;

    const matchHistory = await getMatchHWIDHistory(hwid);


    return {matchHistory};
}

export async function adminGetPlayersInMatch(matchId){

    const query = `SELECT nstats_player_matches.player_id,
    nstats_player_matches.hwid,
    nstats_player_matches.ip,
    nstats_player_matches.country,
    nstats_player_matches.spectator,
    nstats_player_matches.bot,
    nstats_player.name as playerName
    FROM nstats_player_matches
    LEFT JOIN nstats_player ON nstats_player.id = nstats_player_matches.player_id
    WHERE nstats_player_matches.match_id=?
    ORDER BY nstats_player.name ASC
    `;

    return await simpleQuery(query, [matchId]);
}

export async function deletePlayerFromMatch(playerId, matchId){

    const ids = await getGametypeAndMapIds(matchId);

    if(ids === null) throw new Error(`Failed to get match gametype and map id`);


    await deletePlayerMatchCTF(playerId, ids.gametype, ids.map, matchId);
    await deletePlayerMatchDomination(playerId, matchId);
    await deletePlayerMatchItems(playerId, matchId);
    await deletePlayerMatchAssault(playerId, matchId);
    await deletePlayerMatchMonsterhunt(playerId, matchId);
    await deletePlayerMatchConnections(playerId, matchId);
    await deletePlayerMatchPings(playerId, matchId);
    await deletePlayerMatchSprees(playerId, matchId);
    await deletePlayerMatchTelefrags(playerId, matchId);
    await deletePlayerMatchTeamChanges(playerId, matchId);
    await deletePlayerMatchKills(playerId, matchId);

    await deletePlayerMatchCombogib(playerId, matchId, ids.gametype, ids.map);

    await deletePlayerFromAMatch(playerId, matchId, ids.gametype, ids.map);

    await deletePlayerMatchPowerupData(playerId, matchId, ids.gametype, ids.map);

    await deletePlayerMatchWeapons(playerId, matchId, ids.gametype, ids.map);

    await deletePlayerMatchRankings(playerId, matchId, ids.gametype, ids.map);

    await recalculatePlayersWinrates([playerId]);

}

export async function getPlayerLatestMatchDate(playerId, gametypeId){

    const query = `SELECT match_date FROM nstats_player_matches WHERE player_id=? AND gametype=? ORDER BY match_date DESC`;

    const result = await simpleQuery(query, [playerId, gametypeId]);

    if(result.length === 0) return null;

    return result[0].match_date;
}


export async function bulkInsertMatchData(players, matchId, gametypeId, mapId, matchDate, totalTeams){

    const query = `INSERT INTO nstats_player_matches (match_id, match_date, 
        map_id, player_id, hwid, 
        bot, spectator, ip, 
        country, face, voice, 
        gametype, match_result, playtime, 
        team_0_playtime, team_1_playtime, team_2_playtime, 
        team_3_playtime, spec_playtime, team, 
        first_blood, frags, score, 
        kills, deaths, suicides, 
        team_kills, spawn_kills, efficiency, 
        multi_1, multi_2, multi_3, 
        multi_4, multi_5, multi_6, 
        multi_7, multi_best, spree_1, 
        spree_2, spree_3, spree_4, 
        spree_5, spree_6, spree_7, 
        spree_best, best_spawn_kill_spree, assault_objectives, 
        ping_min, 
        ping_average, ping_max, accuracy, 
        shortest_kill_distance, average_kill_distance, longest_kill_distance, 
        k_distance_normal, k_distance_long, k_distance_uber, 
        headshots, shield_belt, amp, 
        amp_time, invisibility, invisibility_time, 
        pads, armor, boots, 
        super_health, mh_kills, mh_kills_best_life, 
        views, mh_deaths, telefrag_kills, 
        telefrag_deaths, telefrag_best_spree, telefrag_best_multi, 
        tele_disc_kills, tele_disc_deaths, tele_disc_best_spree, 
        tele_disc_best_multi) VALUES ?`;

        /*NULL,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,0,0,0,
        ?,?,?,?,?,?,?,?,?,?,
        ?,0,0,0,0,0,0,0,0,0,
        0,0,0,0,?,?,?,?,?,?,?,?)*/
    
    const insertVars = [];

    for(let i = 0; i < players.length; i++){

        const player = players[i];
        if(!player.bInsertMatchData) continue;

        const lastTeam = player.getLastPlayedTeam();
    
        const playtime = player.getTotalPlaytime(totalTeams);

        insertVars.push([
            matchId,
            matchDate,
            mapId,
            player.masterId,
            player.HWID,
            player.bBot,
            (player.stats.time_on_server === 0) ? 1 : 0,//player.bSpectator,
            player.ip ?? "", //setValueIfUndefined(player.ip,""),
            player.country ?? "xx", //setValueIfUndefined(player.country,"xx"),
            player.faceId ?? 0,//setValueIfUndefined(player.faceId),
            player.voiceId ?? 0,//setValueIfUndefined(player.voiceId),
            gametypeId,
            (player.stats.time_on_server === 0) ? "s" : player.matchResult,
            playtime,//Functions.setValueIfUndefined(player.stats.time_on_server),
            player.stats.teamPlaytime[0],
            player.stats.teamPlaytime[1],
            player.stats.teamPlaytime[2],
            player.stats.teamPlaytime[3],
            player.stats.teamPlaytime[255],
            lastTeam,
            player.stats.firstBlood,
            player.stats.frags,
            player.stats.score,
            player.stats.kills,
            player.stats.deaths + player.stats.suicides,
            player.stats.suicides,
            player.stats.teamkills,
            player.stats.spawnKills,
            calculateKillEfficiency(player.stats.kills, player.stats.deaths),
            player.stats.multis.double,
            player.stats.multis.multi,
            player.stats.multis.mega,
            player.stats.multis.ultra,
            player.stats.multis.monster,
            player.stats.multis.ludicrous,
            player.stats.multis.holyshit,
            player.stats.bestMulti,
            player.stats.sprees.spree,
            player.stats.sprees.rampage,
            player.stats.sprees.dominating,
            player.stats.sprees.unstoppable,
            player.stats.sprees.godlike,
            player.stats.sprees.massacre,
            player.stats.sprees.brutalizing,
            player.stats.bestSpree,
            player.stats.bestspawnkillspree,
            0,
            player.pingMatchData.min,
            parseInt(player.pingMatchData.average),
            player.pingMatchData.max,
            player.stats.accuracy.toFixed(2),
            (player.stats.killMinDistance !== player.stats.killMinDistance || player.stats.killMinDistance === null) ? 0 : player.stats.killMinDistance,// (isNaN(player.stats.killMinDistance)) ? 0 : setValueIfUndefined(player.stats.killMinDistance),
            (player.stats.killAverageDistance !== player.stats.killAverageDistance) ? 0 : player.stats.killAverageDistance,//)) ? 0 : setValueIfUndefined(player.stats.killAverageDistance),
            (player.stats.killMaxDistance !== player.stats.killMaxDistance) ? 0 : player.stats.killMaxDistance,//)) ? 0 : setValueIfUndefined(player.stats.killAverageDistance),
            player.stats.killsNormalRange,
            player.stats.killsLongRange,
            player.stats.killsUberRange,
            player.stats.headshots,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,
            player.stats.teleFrags.total,
            player.stats.teleFrags.deaths,
            player.stats.teleFrags.bestSpree,
            player.stats.teleFrags.bestMulti,
            player.stats.teleFrags.discKills,
            player.stats.teleFrags.discDeaths,
            player.stats.teleFrags.discKillsBestSpree,
            player.stats.teleFrags.discKillsBestMulti,
        ]);
    }

    await bulkInsert(query, insertVars);
}

export async function insertMatchData(player, matchId, gametypeId, mapId, matchDate, ping, totalTeams){

    const query = `INSERT INTO nstats_player_matches VALUES(
        NULL,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,0,0,0,
        ?,?,?,?,?,?,?,?,?,?,
        ?,0,0,0,0,0,0,0,0,0,
        0,0,0,0,?,?,?,?,?,?,?,?)`;

        //53
    // const lastTeam = (player.teams.length === 0) ? 255 : player.teams[player.teams.length - 1].id;

    const lastTeam = player.getLastPlayedTeam();
    
    const playtime = player.getTotalPlaytime(totalTeams);

    const vars = [
        matchId,
        matchDate,
        mapId,
        player.masterId,
        player.HWID,
        player.bBot,
        (player.stats.time_on_server === 0) ? 1 : 0,//player.bSpectator,
        player.ip ?? "", //setValueIfUndefined(player.ip,""),
        player.country ?? "xx", //setValueIfUndefined(player.country,"xx"),
        player.faceId ?? 0,//setValueIfUndefined(player.faceId),
        player.voiceId ?? 0,//setValueIfUndefined(player.voiceId),
        gametypeId,
        (player.stats.time_on_server === 0) ? "s" : player.matchResult,
        playtime,//Functions.setValueIfUndefined(player.stats.time_on_server),
        player.stats.teamPlaytime[0],
        player.stats.teamPlaytime[1],
        player.stats.teamPlaytime[2],
        player.stats.teamPlaytime[3],
        player.stats.teamPlaytime[255],
        lastTeam,
        player.stats.firstBlood,
        player.stats.frags,
        player.stats.score,
        player.stats.kills,
        player.stats.deaths + player.stats.suicides,
        player.stats.suicides,
        player.stats.teamkills,
        player.stats.spawnKills,
        calculateKillEfficiency(player.stats.kills, player.stats.deaths),
        player.stats.multis.double,
        player.stats.multis.multi,
        player.stats.multis.mega,
        player.stats.multis.ultra,
        player.stats.multis.monster,
        player.stats.multis.ludicrous,
        player.stats.multis.holyshit,
        player.stats.bestMulti,
        player.stats.sprees.spree,
        player.stats.sprees.rampage,
        player.stats.sprees.dominating,
        player.stats.sprees.unstoppable,
        player.stats.sprees.godlike,
        player.stats.sprees.massacre,
        player.stats.sprees.brutalizing,
        player.stats.bestSpree,
        player.stats.bestspawnkillspree,
        ping.min,
        parseInt(ping.average),
        ping.max,
        player.stats.accuracy.toFixed(2),
        (player.stats.killMinDistance !== player.stats.killMinDistance || player.stats.killMinDistance === null) ? 0 : player.stats.killMinDistance,// (isNaN(player.stats.killMinDistance)) ? 0 : setValueIfUndefined(player.stats.killMinDistance),
        (player.stats.killAverageDistance !== player.stats.killAverageDistance) ? 0 : player.stats.killAverageDistance,//)) ? 0 : setValueIfUndefined(player.stats.killAverageDistance),
        (player.stats.killMaxDistance !== player.stats.killMaxDistance) ? 0 : player.stats.killMaxDistance,//)) ? 0 : setValueIfUndefined(player.stats.killAverageDistance),
        player.stats.killsNormalRange,
        player.stats.killsLongRange,
        player.stats.killsUberRange,
        player.stats.headshots,
        player.stats.teleFrags.total,
        player.stats.teleFrags.deaths,
        player.stats.teleFrags.bestSpree,
        player.stats.teleFrags.bestMulti,
        player.stats.teleFrags.discKills,
        player.stats.teleFrags.discDeaths,
        player.stats.teleFrags.discKillsBestSpree,
        player.stats.teleFrags.discKillsBestMulti,
    ];

    const result = await simpleQuery(query, vars);

    return result.insertId;
}


export async function setPlayersFaces(players){


    const query = `UPDATE nstats_player SET face=? WHERE id=?`;

    for(let i = 0; i < players.length; i++){

        const p = players[i];
        await simpleQuery(query, [p.faceId, p.masterId]);
    }
}


export async function getPlaytimesInMatch(matchId, playerIds){

    if(playerIds.length === 0) return {};

    const query = `SELECT player_id,playtime FROM nstats_player_matches WHERE match_id=? AND player_id IN(?)`;

    const result = await simpleQuery(query, [matchId, playerIds]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        data[r.player_id] = r.playtime;
    }

    return data;
}