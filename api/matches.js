const mysql = require('./database');
const Match = require('./match');
const Players = require('./players');
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

class Matches{

    constructor(){

    }

    insertMatch(date, server, gametype, map, version, minVersion, admin, email, region, motd, mutators, playtime, endType, start, end, insta,
        teamGame, gameSpeed, hardcore, tournament, airControl, useTranslocator, friendlyFireScale, netMode, maxSpectators, 
        maxPlayers, totalTeams, totalPlayers, timeLimit, targetScore, dmWinner, dmScore, redScore, blueScore, greenScore, yellowScore){

        

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

            const query = "INSERT INTO nstats_matches VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0)";


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
                insta, 
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
                yellowScore

            ];

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);
                
                
                resolve(result.insertId);
            });
        });
    }

    getWinners(matchIds){

        return new Promise((resolve, reject) =>{

            if(matchIds === undefined) resolve([]);
            if(matchIds.length === 0) resolve([]);

            const query = "SELECT id,team_game,dm_winner,dm_score,team_score_0,team_score_1,team_score_2,team_score_3,total_teams,gametype FROM nstats_matches WHERE id IN(?)";

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


    getRecent(page, perPage, gametype){

        return new Promise((resolve, reject) =>{

            page = parseInt(page);
            perPage = parseInt(perPage);
            gametype = parseInt(gametype);

            if(gametype !== gametype){
                gametype = 0;
            }

            if(page !== page){
                page = 0;
            }

            if(perPage !== perPage){
                perPage = 10;
            }

            const start = page * perPage;

            let query = `SELECT * FROM nstats_matches WHERE gametype=? ORDER BY date DESC, id DESC LIMIT ?, ?`;
            let vars = [gametype, start, perPage];

            if(gametype === 0){
                query = `SELECT * FROM nstats_matches ORDER BY date DESC, id DESC LIMIT ?, ?`;
                vars = [ start, perPage];
            }

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getTotal(gametype){

        return new Promise((resolve, reject) =>{

            if(gametype === undefined){
                gametype = 0;
            }else{
                gametype = parseInt(gametype);

                if(gametype !== gametype){
                    gametype = 0;
                }

            }

            let query = "SELECT COUNT(*) as total_matches FROM nstats_matches";
            let vars = [];

            if(gametype !== 0){
                query = "SELECT COUNT(*) as total_matches FROM nstats_matches WHERE gametype=?";
                vars = [gametype];
            }

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result[0].total_matches);
                }
                resolve(0);
            });
        });
    }

    getServerNames(ids){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,server FROM nstats_matches WHERE id IN(?)";

            const data = {};

            if(ids.length === 0) resolve(data);

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);
                
                if(result !== undefined){

                    for(let i = 0; i < result.length; i++){
                        data[result[i].id] = result[i].server; 
                    }
                }

                resolve(data);
            });
        });
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


    getFirst(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT date FROM nstats_matches ORDER BY date ASC LIMIT 1";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){
                        resolve(result[0].date);
                    }
                }   
                resolve(0);
            });
        });
    }

    getLast(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT date FROM nstats_matches ORDER BY date DESC LIMIT 1";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){
                        resolve(result[0].date);
                    }
                }   
                resolve(0);
            });
        });
    }


    getDatesPlayersInTimeframe(timeframe){

        return new Promise((resolve, reject) =>{

            const now = Math.floor(Date.now() * 0.001);

            const min = now - timeframe;


            const query = "SELECT date,players FROM nstats_matches WHERE date>=? ORDER BY date DESC";

            mysql.query(query, [min], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });
        });
    }



    getDuplicates(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,COUNT(name) as found FROM nstats_logs GROUP BY name ORDER BY match_id DESC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const found = [];

                    for(let i = 0; i < result.length; i++){

                        if(result[i].found > 1) found.push(result[i]);
                    }

                    resolve(found);
                }

                resolve([]);
            });
        });     
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


    getPreviousDuplicates(latestIds, logFileNames){

        return new Promise((resolve, reject) =>{

            const query = "SELECT match_id,name FROM nstats_logs WHERE name IN (?) AND match_id NOT IN(?)";

            mysql.query(query, [logFileNames, latestIds], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    resolve(result);
                }

                resolve([]);
            });
        });
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

            console.log(logFileNames);


            const names = [];

            for(let i = 0; i < logFileNames.length; i++){

                names.push(logFileNames[i].name);
            }

            console.log(names);

            const matchIds = await this.getLogIds(names);

            console.log("matchIds");
            console.log(matchIds);
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

    async deleteMatch(id){

        try{

            console.log(`attempting to delete data for match id ${id}`);

            const matchManager = new Matches();
            const match = new Match();

            const matchData = await match.get(id);
            
            if(matchData === undefined) return;

            const players = new Players();

            const playersData = await players.player.getAllInMatch(id);

            //console.log(playersData);
     

            const assault = new Assault();
            await assault.deleteMatch(id);

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

            await this.deleteMatchQuery(matchData.id);

            await Logs.deleteFromDatabase(matchData.id);

            for(let i = 0; i < playersData.length; i++){
                await winrateManager.deletePlayerFromMatch(playersData[i].player_id, id, matchData.gametype);
            }

        }catch(err){
            console.trace(err);
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

    async changePlayerScoreHistoryIds(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_match_player_score SET player=? WHERE player=?", [newId, oldId]);
    }

    async changeTeamChangesPlayerIds(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_match_team_changes SET player=? WHERE player=?", [newId, oldId]);
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
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?,?,?,
            ?,?,?,?

        )`;



        

        //82

        const vars = [
            data.match_id,
            data.match_date,
            data.map_id,
            data.player_id,
            data.ip,
            data.country,

            data.face,
            data.voice,
            data.gametype,
            data.winner,
            data.draw,
            data.playtime,

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
            data.flag_assist,
            data.flag_return,
            data.flag_taken,

            data.flag_dropped,
            data.flag_capture,
            data.flag_pickup,
            data.flag_seal,
            data.flag_cover,
            data.flag_cover_pass,

            data.flag_cover_fail,
            data.flag_self_cover,
            data.flag_self_cover_pass,
            data.flag_self_cover_fail,
            data.flag_multi_cover,
            data.flag_spree_cover,

            data.flag_cover_best,
            data.flag_self_cover_best,
            data.flag_kill,
            data.flag_save,
            data.flag_carry_time,
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
            data.invisibility,
            data.invisibility_time,

            data.pads,
            data.armor,
            data.boots,
            data.super_health

        ];

        await mysql.simpleInsert(query, vars);
    }

    async changePlayerMatchesCount(playerName, gametype, amount, playtime){

        await mysql.simpleUpdate("UPDATE nstats_player_totals SET matches=matches+?, playtime=playtime+? WHERE name=? AND gametype=?", 
            [amount, playtime, playerName, gametype]);
    }

    async mergePlayerMatches(oldId, newId, newName){

        try{

            const matches = await this.getPlayerMatches([oldId, newId]);

            const newData = {};

            const mergeTypes = [
                'playtime',                                
                'frags',                 'score',                  'kills',
                'deaths',                'suicides',               'team_kills',
                'spawn_kills',                                     'multi_1',
                'multi_2',               'multi_3',                'multi_4',
                'multi_5',               'multi_6',                'multi_7',
                'multi_best',            'spree_1',                'spree_2',
                'spree_3',               'spree_4',                'spree_5',
                'spree_6',               'spree_7',                'spree_best',
                                         'flag_assist',            'flag_return',
                'flag_taken',            'flag_dropped',           'flag_capture',
                'flag_pickup',           'flag_seal',              'flag_cover',
                'flag_cover_pass',       'flag_cover_fail',        'flag_self_cover',
                'flag_self_cover_pass',  'flag_self_cover_fail',   'flag_multi_cover',
                'flag_spree_cover',      
                'flag_kill',             'flag_save',              'flag_carry_time',
                'assault_objectives',    'dom_caps',               
                
                                         /*'shortest_kill_distance',*/ /*'average_kill_distance'*/
                /*'longest_kill_distance',*/ 'k_distance_normal',      'k_distance_long',
                'k_distance_uber',       'headshots',              'shield_belt',
                'amp',                   'amp_time',               'invisibility',
                'invisibility_time',     'pads',                   'armor',
                'boots',                 'super_health'

            ];

            const higherTypes = [
                "best_spawn_kill_spree",
                "flag_cover_best",
                "flag_self_cover_best",
                "dom_caps_best_life",
                "ping_min",
                "ping_average",
                "ping_max"
            ];


            //merged played gametypes
            const playedGametypes = {
                "0": 0
            };

            const gametypesPlaytime = {
                "0": 0
            }

            //ids for player match data not the actual match_id
            const matchIds = [];
            const matchIdsWithMerge = [];

            let m = 0;

            let combinedAverageDistance = 0;
            let addedPlaytime = 0;

            for(let i = 0; i < matches.length; i++){

                m = matches[i];

                matchIds.push(m.id);

                if(newData[m.match_id] === undefined){

                    newData[m.match_id] = m;

                    newData[m.match_id].player_id = newId;

                }else{

                    gametypesPlaytime["0"] += m.playtime;

                    playedGametypes["0"]++;

                    if(playedGametypes[m.gametype] === undefined){
                        playedGametypes[m.gametype] = 1;
                        gametypesPlaytime[m.gametype] = m.playtime;
                    }else{
                        playedGametypes[m.gametype]++;
                        gametypesPlaytime[m.gametype] += m.playtime;
                    }

                    matchIdsWithMerge.push(m.match_id);

                    newData[m.match_id].playtime += m.playtime;
                    newData[m.match_id].winner = m.winner;
                    newData[m.match_id].draw = m.draw;
                    newData[m.match_id].team = m.team;

                    if(newData[m.match_id].shortest_kill_distance > m.shortest_kill_distance){
                        newData[m.match_id].shortest_kill_distance = m.shortest_kill_distance;
                    }

                    if(newData[m.match_id].longest_kill_distance < m.longest_kill_distance){
                        newData[m.match_id].longest_kill_distance = m.longest_kill_distance;
                    }


                    combinedAverageDistance = newData[m.match_id].average_kill_distance + m.average_kill_distance;

                    if(combinedAverageDistance !== 0){
                        newData[m.match_id].average_kill_distance = combinedAverageDistance * 0.5;
                    }

                    for(let x = 0; x < higherTypes.length; x++){

                        if(m[higherTypes[x]] > newData[m.match_id][higherTypes[x]]){
                            newData[m.match_id][higherTypes[x]] = m[higherTypes[x]];
                        }
                    }
                    

                    if(newData[m.match_id].first_blood || m.first_blood) newData[m.match_id].first_blood = 1;

                    for(let x = 0; x < mergeTypes.length; x++){
                        newData[m.match_id][mergeTypes[x]] += m[mergeTypes[x]];
                    }

                    newData[m.match_id].efficiency = 0;

                    if(newData[m.match_id].kills > 0){

                        if(newData[m.match_id].deaths === 0){
                            newData[m.match_id].efficiency = 100;
                        }else{
                            newData[m.match_id].efficiency = (newData[m.match_id].kills / (newData[m.match_id].kills + newData[m.match_id].deaths)) * 100;
                        }
                    }
                }
            }


            await this.deletePlayerMatchesData(matchIds);

            for(let i = 0; i < matchIdsWithMerge.length; i++){
                await this.reducePlayerCount(matchIdsWithMerge[i], 1);
            }

            for(const [key, value] of Object.entries(newData)){

                await this.insertMergedPlayerData(value);
            }

            //update player match totals, reduce for removed add for new master account

            console.log(`totalMatches = ${matches.length}`);
            console.log(`matchesWithMerge = ${matchIdsWithMerge.length}`);

            console.table(playedGametypes);

            for(const [key, value] of Object.entries(playedGametypes)){

                //await this.changePlayerMatchesCount(oldName, key, -value);
                await this.changePlayerMatchesCount(newName, key, value, gametypesPlaytime[key]);

            }

            

        }catch(err){
            console.trace(err);
        }
    }

    
}
module.exports = Matches;