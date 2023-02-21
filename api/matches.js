const mysql = require('./database');
const Match = require('./match');
const Assault = require('./assault');
const CountriesManager = require('./countriesmanager');
const CTF = require('./ctf');
const Domination = require('./domination');
const Faces = require('./faces');
const Gametypes = require('./gametypes');
const Headshots = require('./headshots');
const Items = require('./items');
const Kills = require('./kills');
const Maps = require('./maps');
const Connections = require('./connections');
const Weapons = require('./weapons');
const Rankings = require('./rankings');
const Servers = require('./servers');
const Voices = require('./voices');
const WinRates = require('./winrate');
const Functions = require('./functions');
const Logs = require('./logs');
const MonsterHunt = require('./monsterhunt');
const SiteSettings = require('./sitesettings');

class Matches{

    constructor(){}

    insertMatch(date, server, gametype, map, version, minVersion, admin, email, region, motd, mutators, playtime, endType, start, end, insta,
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

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_matches VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0,0,?,0,0,0,0,0,0,0,0,0)";

            const vars = [
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

            mysql.query(query, vars, (err, result) =>{

                if(err){
                    reject(err);
                    return;
                }
                
                
                resolve(result.insertId);
            });
        });
    }

    getWinners(matchIds){

        return new Promise((resolve, reject) =>{

            if(matchIds === undefined) resolve([]);
            if(matchIds.length === 0) resolve([]);

            const query = "SELECT id,team_game,dm_winner,dm_score,team_score_0,team_score_1,team_score_2,team_score_3,total_teams,gametype,end_type,mh FROM nstats_matches WHERE id IN(?)";

            mysql.query(query, [matchIds], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    debugGetAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_matches ORDER BY date DESC, id DESC LIMIT 25";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    async getRecent(page, perPage, gametype){

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

        const settings = await SiteSettings.getSettings("Matches Page");

        const vars = [settings["Minimum Playtime"], settings["Minimum Players"], start, perPage];
        let query = "";

        if(gametype === 0){
            
            query = defaultQuery;

        }else{

            vars.unshift(gametype);
            query = gametypeQuery;
        }

        return await mysql.simpleFetch(query, vars);

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

        const settings = await SiteSettings.getSettings("Matches Page");
        const vars = [settings["Minimum Players"], settings["Minimum Playtime"]];

        let query = "";

        if(gametype !== 0){
            query = gametypeQuery;
            vars.unshift(gametype);
        }else{
            query = defaultQuery;
        }

        const result = await mysql.simpleFetch(query, vars);

        return result[0].total_matches;
    }

    async getServerNames(ids){

        if(ids.length === 0) return {};

        const query = "SELECT id,server FROM nstats_matches WHERE id IN(?)";

        const result = await mysql.simpleQuery(query, [ids]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            
            data[r.id] = r.server;
        }

        return data;
    }


    getPlayerCount(ids){

        return new Promise((resolve, reject) =>{


            if(ids.length === 0) resolve([]);
            

            const query = "SELECT id,players FROM nstats_matches WHERE id IN(?)";

            const data = {};

            //if(data.length === 0) return data;

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    for(let i = 0; i < result.length; i++){

                        data[result[i].id] = result[i].players;
                    }
                }
                resolve(data);
            });
        });
    }


    async getFirst(){

        const query = "SELECT MIN(date) as first_match FROM nstats_matches WHERE players>=? AND playtime>=?";

        const settings = await SiteSettings.getSettings("Matches Page");

        const result = await mysql.simpleFetch(query, [settings["Minimum Players"], settings["Minimum Playtime"]]);

        if(result.length > 0){
            return result[0].first_match;
        }

        return 0;

    }

    async getLast(){

        const query = "SELECT MAX(date) as last_match FROM nstats_matches WHERE players>=? AND playtime>=?";

        const settings = await SiteSettings.getSettings("Matches Page");
        const result = await mysql.simpleFetch(query, [settings["Minimum Players"], settings["Minimum Playtime"]]);

        if(result.length > 0){
            return result[0].last_match;
        }

        return 0;
    }

    async getDuplicates(){


        const query = `SELECT name, COUNT(*) as total_found, MAX(imported) as last_import, MIN(imported) as first_import,
        MIN(match_id) as first_id, MAX(match_id) as last_id
         FROM nstats_logs GROUP BY name`;

        const result = await mysql.simpleQuery(query);

        const found = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.total_found > 1){
                found.push(r);
            }
        }

        return found;
    }

    getMatchLogFileNames(matchIds){

        return new Promise((resolve, reject) =>{

            if(matchIds.length === 0) resolve([]);

            const query = "SELECT name,match_id FROM nstats_logs WHERE match_id IN (?)";

            mysql.query(query, [matchIds], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    resolve(result);
                }

                resolve([]);
            });
        });
        
    }


    async getPreviousDuplicates(logFileName, latestId){

        const query = "SELECT match_id FROM nstats_logs WHERE name=? AND match_id != ?";

        const vars = [logFileName, latestId];

        const result = await mysql.simpleQuery(query, vars);

        const found = [];
        
        for(let i = 0; i < result.length; i++){

            found.push(result[i].match_id);
        }

        return found;
    }


    getLogIds(logNames){

        return new Promise((resolve, reject) =>{

            if(logNames.length === 0) resolve([]);

            const query = "SELECT name,match_id,imported FROM nstats_logs WHERE name IN (?) ORDER BY match_id DESC";

            mysql.query(query, [logNames], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
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


    getLogMatches(logNames){

        return new Promise((resolve, reject) =>{


            if(logNames.length === 0) resolve([]);

            const query = "SELECT id,name,match_id FROM nstats_logs WHERE name IN (?) ORDER BY match_id DESC";

            mysql.query(query, [logNames], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });
        });
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

    async deleteDominationData(id){

        try{

            const dom = new Domination();

            const capData = await dom.getMatchDomPoints(id);

            for(let i = 0; i < capData.length; i++){

               // console.log(`reducing point caps for point ${capData[i].id} by ${capData[i].captured}`);
                await dom.reducePointCaps(capData[i].id, capData[i].captured);
            }

            await dom.deleteMatchControlPoints(id);

            await dom.deletePlayerMatchScore(id);

        }catch(err){
            console.trace(err);
        }
    }

    deletePingData(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_match_pings WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    deletePlayerScoreData(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_match_player_score WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });

    }

    deleteTeamChangesData(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_match_team_changes WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });

    }

    reducePlayerMapTotals(mapId, playerId, playtime){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_player_maps SET matches=matches-1, playtime=playtime-? WHERE map=? AND player=?";

            mysql.query(query, [playtime, mapId, playerId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
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


    deleteMatchQuery(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_matches WHERE id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async deleteMatch(id, players){

        try{

            console.log(`attempting to delete data for match id ${id}`);

            const match = new Match();

            const matchData = await match.get(id);
            
            if(matchData === undefined) return;

            const playersData = await players.player.getAllInMatch(id);

            //console.log(playersData);
     

            const assault = new Assault();
            await assault.deleteMatch(id);


            const monsterHuntManager = new MonsterHunt();

            await monsterHuntManager.deleteMatch(id);

            await this.deleteMatchCountryData(playersData);

            await this.deleteCtfData(id);

            await this.deleteDominationData(id);

            
            const faceManager = new Faces();

            await faceManager.reduceMatchUses(playersData);

            const gametypeManager = new Gametypes();

            await gametypeManager.reduceMatchStats(matchData.gametype, matchData.playtime);

            
            const headshotsManager = new Headshots();

            await headshotsManager.deleteMatchData(id);

            const itemsManager = new Items();

            await itemsManager.deleteMatchData(id);

            const killsManager = new Kills();

            await killsManager.deleteMatchData(id);
            
            const mapManager = new Maps();

            await mapManager.reduceMapTotals(matchData.map, matchData.playtime);

            const connectionsManager = new Connections();

            await connectionsManager.deleteMatchData(id);

            await this.deletePingData(id);

            await this.deletePlayerScoreData(id);

            await this.deleteTeamChangesData(id);

            await this.removeMatchFromPlayerMapTotals(matchData.map, playersData);
   
            const weaponsManager = new Weapons();

            await weaponsManager.deleteMatchData(id);

            const rankingManager = new Rankings();

            await rankingManager.deleteMatchRankings(id);

            const serverManager = new Servers();

            await serverManager.reduceServerTotals(matchData.server, matchData.playtime);

            await this.removeVoiceData(playersData);

            const winrateManager = new WinRates();

            await winrateManager.deleteMatchData(id);

            //await players.deleteMatchData(id);
            const playerIds = [];

            for(let i = 0; i < playersData.length; i++){

                playerIds.push(playersData[i].player_id);
            }

            const playerNames = await players.getJustNamesByIds(playerIds);

            Functions.setIdNames(playersData, playerNames, "player_id", "name");

            await players.reduceTotals(playersData, matchData.gametype);
            await players.deleteMatchData(id);

            await this.deleteMatchQuery(matchData.id);

            await Logs.deleteFromDatabase(matchData.id);

           // for(let i = 0; i < playersData.length; i++){
               // await winrateManager.deletePlayerFromMatch(playersData[i].player_id, id, matchData.gametype);
            //}

           // return matchData.gametype;
           return true;

        }catch(err){
            console.trace(err);
            return false;
        }    
    }


    async reducePlayerCount(matchId, amount){

        return await mysql.simpleUpdate("UPDATE nstats_matches SET players=players-? WHERE id=?", [
            amount, matchId
        ]);
    }


    async renameDmWinner(oldName, newName){

        return await mysql.simpleUpdate("UPDATE nstats_matches SET dm_winner=? WHERE dm_winner=?", [newName, oldName]);
    }

    async renameMatchDmWinner(matchId, name, score){

        return await mysql.simpleUpdate("UPDATE nstats_matches SET dm_winner=?,dm_score=? WHERE id=?", [name, score, matchId]);
    }

    async getDmWinner(matchId){

        const query = "SELECT dm_winner FROM nstats_matches WHERE id=?";

        const result = await mysql.simpleFetch(query, [matchId]);

        if(result.length > 0){
            return result[0].dm_winner;
        }

        return "";
    }

    async getPlayerMatchTopScore(matchId){

        return await mysql.simpleFetch("SELECT player_id,score FROM nstats_player_matches WHERE match_id=? ORDER BY score DESC LIMIT 1",[matchId]);
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

            const result = await mysql.simpleFetch("SELECT match_id FROM nstats_player_matches WHERE player_id=?",[playerId]);

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

        return await mysql.simpleFetch("SELECT * FROM nstats_player_matches WHERE player_id IN (?)", [playerIds]);
    }

    async deletePlayerMatchesData(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_player_matches WHERE id IN (?)", [ids]);
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

        await mysql.simpleQuery(query, vars);
    }

    async changePlayerIds(oldId, newId){

        const query = `UPDATE nstats_player_matches SET player_id=? WHERE player_id=?`;
        return await mysql.simpleQuery(query, [newId, oldId]);
    }

    async getDuplicatePlayerEntries(targetPlayer){

        const query = `SELECT COUNT(*) as total_entries, match_id FROM nstats_player_matches WHERE player_id=? GROUP BY match_id ORDER BY total_entries DESC`;

        const result = await mysql.simpleQuery(query, [targetPlayer]);

        const matchIds = [];

        for(let i = 0; i < result.length; i++){
            matchIds.push(result[i].match_id);
        }

        return matchIds;
    }

    async mergePlayerMatchData(matchId, playerId){

        const query = `SELECT * FROM nstats_player_matches WHERE match_id=? AND player_id=?`;

        const result = await mysql.simpleQuery(query, [matchId, playerId]);

        const totals = Object.assign({}, result[0]);

        const higherBetter = [
            "multi_best", 
            "spree_best", 
            "best_spawn_kill_spree", 
            "dom_caps_best_life", 
            "longest_kill_distance", 
            "mh_kills_best_life"
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
            "team_0_playtime",
            "team_1_playtime",
            "team_2_playtime",
            "team_3_playtime",
            "spec_playtime",
        ];

        let totalAccuracy = 0;
        let totalAverageKillDistance = 0;


        const rowsToDelete = [];

        for(let i = 1; i < result.length; i++){

            const r = result[i];

            rowsToDelete.push(r.id);

            if(r.bot) totals.bot = 1;
            if(r.spectator) totals.spectator = 1;
            if(r.winner) totals.winner = 1;
            if(r.draw) totals.draw = 1;
            totals.team = r.team;
            if(r.first_blood) totals.first_blood = 1;

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

        await this.updatePlayerMatchDataFromMerge(totals);
        //delete other ids

        return rowsToDelete;

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

        return await mysql.simpleQuery(query, vars);
    }

    async deletePlayerMatchRows(rowIds){

        if(rowIds.length === 0) return;

        const query = `DELETE FROM nstats_player_matches WHERE id IN(?)`;

        return await mysql.simpleQuery(query, [rowIds]);
    }

    async mergePlayerMatches(oldId, newId){

        await this.changePlayerIds(oldId, newId);
        const duplicateMatchData = await this.getDuplicatePlayerEntries(newId);

        console.log(duplicateMatchData);

        for(let i = 0; i < duplicateMatchData.length; i++){

            const matchId = duplicateMatchData[i];

            const rowsToDelete = await this.mergePlayerMatchData(matchId, newId);
            await this.deletePlayerMatchRows(rowsToDelete);
        }
    }


    async getAllPlayerMatches(player){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_matches WHERE player_id=? ORDER BY id ASC", [player]);
    }

    async getAllPlayerMatchIds(playerId){
        const data = await mysql.simpleFetch("SELECT match_id FROM nstats_player_matches WHERE player_id=? ORDER BY id ASC", [playerId]);

        const ids = [];

        for(let i = 0; i < data.length; i++){

            ids.push(data[i].match_id);
        }

        return ids;
    }

    async getMatchGametypes(ids){

        if(ids.length === 0) return {};

        const data = await mysql.simpleFetch("SELECT id,gametype FROM nstats_matches WHERE id IN (?)", [ids]);
        
        const obj = {};

        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

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
            return await mysql.simpleFetch("SELECT * FROM nstats_matches WHERE gametype=?",[gametypeId]);
        }else{
            return await mysql.simpleFetch("SELECT * FROM nstats_matches");
        }
    }

    async deletePlayerScores(matchIds){

        if(matchIds.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_match_player_score WHERE match_id IN (?)", [matchIds]);
    }

    async deleteTeamChanges(matchIds){

        if(matchIds.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_match_team_changes WHERE match_id IN (?)", [matchIds]);
    }

    async deleteMultiple(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_matches WHERE id IN (?)", [ids]);
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

        const data = await mysql.simpleFetch(query, [start, end]);

        if(data.length > 0) return data[0].total_matches;

        return 0;
    }

    /**
     * 
     * @param {*} units How many days/minutes/years
     * @param {*} timeUnit How many seconds a unit is 60 * 60 is one hour, ect
     * @returns Array of times frames starting with most recent to latest
     */

    async getMatchesInRecentUnits(units, timeUnit){

        const now = Math.floor(Date.now() * 0.001);

        const data = [];

        for(let i = 0; i < units; i++){

            const min = now - (timeUnit * (i + 1));
            const max = now - (timeUnit * i);

            data.push(await this.getMatchesBetween(min, max));

        }

        return data;
    }


    async getValidMatches(ids, minPlayers, minPlaytime){

        if(ids.length === 0) return [];

        const query = "SELECT id FROM nstats_matches WHERE id IN (?) AND players>=? AND playtime>=?";
        const vars = [ids, minPlayers, minPlaytime];

        const result = await mysql.simpleFetch(query, vars);

        const newIds = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            newIds.push(r.id);
        }

        return newIds;
    }


    async getInvalidMatches(minPlayers, minPlaytime){

        const query = "SELECT id,date,server,gametype,map,players,playtime FROM nstats_matches WHERE players<? OR playtime<? ORDER BY date DESC, id DESC";
        const vars = [minPlayers, minPlaytime];
        return await mysql.simpleFetch(query, vars);
    }

    async getTeamMateMatchesBasic(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,date,server,gametype,map,playtime,total_teams,players,team_game,team_score_0,team_score_1,team_score_2,team_score_3 FROM nstats_matches WHERE id IN(?) AND team_game=1 ORDER BY date DESC";

        return mysql.simpleQuery(query, [ids]);
    }

    async returnOnlyTeamGames(matchIds){


        if(matchIds.length === 0) return [];

        const query = "SELECT id FROM nstats_matches WHERE id IN (?) AND team_game=1";

        const result = await mysql.simpleQuery(query, [matchIds]);

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

        const result = await mysql.simpleFetch(query, [matchId, playerIds]);

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

        const result = await mysql.simpleQuery(query, [matchIds]);

        const obj = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            obj[r.id] = r.date;
        }

        return obj;
    }

    async getAllIds(){

        const query = "SELECT id FROM nstats_matches ORDER BY id ASC";

        const result = await mysql.simpleQuery(query);

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

        const result =  await mysql.simpleQuery(query, [ids]);

        const uniqueServers = Functions.getUniqueValues(result, "server");
        const uniqueGametypes = Functions.getUniqueValues(result, "gametype");
        const uniqueMaps = Functions.getUniqueValues(result, "map");

        const serverManager = new Servers();
        const serverNames = await serverManager.getNames(uniqueServers);

        const gametypeManager = new Gametypes();
        const gametypeNames = await gametypeManager.getNames(uniqueGametypes);

        const mapManager = new Maps();
        const mapNames = await mapManager.getNames(uniqueMaps);

        Functions.setIdNames(result, serverNames, "server", "serverName");
        Functions.setIdNames(result, gametypeNames, "gametype", "gametypeName");
        Functions.setIdNames(result, mapNames, "map", "mapName");

        return result;
    }


    createSearchQuery(bTotalCount, serverId, gametypeId, mapId, perPage, page){

        
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


        let start = "SELECT * FROM nstats_matches";

        if(bTotalCount){
            start = "SELECT COUNT(*) as total_matches FROM nstats_matches";
        }

        let query = start;
        const vars = [];

        if(serverId !== 0){
            query += " WHERE server=? "
            vars.push(serverId);
        }

        if(gametypeId !== 0){

            if(query === start){
                query += " WHERE gametype=? ";
            }else{
                query += " AND gametype=? ";
            }
     
            vars.push(gametypeId);
        }

        if(mapId !== 0){

            if(query === start){
                query += " WHERE map=? ";
            }else{
                query += " AND map=? ";
            }

            vars.push(mapId);
        }

        if(!bTotalCount){

            if(perPage <= 0 || perPage > 100){
                perPage = 25;
            }

            let startIndex = page * perPage;

            if(startIndex < 0) startIndex = 0;

            query += " ORDER BY date DESC, id DESC LIMIT ?, ?";
            vars.push(startIndex, perPage);
        }

        return {"query": query, "vars": vars};
    }

    async getSearchTotalResults(serverId, gametypeId, mapId){

        
        const {query, vars} = this.createSearchQuery(true, serverId, gametypeId, mapId, 0, 0);

        const result = await mysql.simpleQuery(query, vars); 

        return result[0].total_matches;

    }

    async searchMatches(serverId, gametypeId, mapId, page, perPage){

        const {query, vars} = this.createSearchQuery(false, serverId, gametypeId, mapId, perPage, page);

        return await mysql.simpleQuery(query, vars); 
    }

}
module.exports = Matches;