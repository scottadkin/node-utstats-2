const mysql = require("./database");
const Message = require("./message");
const Functions = require("./functions");
const CountriesManager = require("./countriesmanager");
const Assault = require("./assault");
const CTF = require("./ctf");
const Domination = require("./domination");
const Faces = require("./faces");
const Headshots = require("./headshots");
const Items = require("./items");
const Kills = require("./kills");
const Connections = require("./connections");
const Pings = require("./pings");
const Weapons = require("./weapons");
const Voices = require("./voices");
const WinRate = require("./winrate");
const Sprees = require("./sprees");
const MonsterHunt = require("./monsterhunt");
const SiteSettings = require("./sitesettings");
const Combogib = require("./combogib");

class Player{

    constructor(){}

    async createMasterId(playerName){

        const query = `INSERT INTO nstats_player_totals VALUES(
            NULL,?,0,0,0,0,"",0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0)`;

        const result = await mysql.simpleQuery(query, [playerName]);

            //55
        return result.insertId;
    }


    async getMasterId(playerName){

        const query = "SELECT id FROM nstats_player_totals WHERE name=? AND gametype=0";

        const result = await mysql.simpleQuery(query, [playerName]);

        if(result.length === 0){
            return await this.createMasterId(playerName);
        }

        return result[0].id;
    }

    async createGametypeId(playerName, playerMasterId, gametypeId){

        const query = `INSERT INTO nstats_player_totals VALUES(
            NULL,?,?,0,0,0,"",0,0,?,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0)`;

        const result = await mysql.simpleQuery(query, [playerName, playerMasterId, gametypeId]);

        return result.insertId;
    }
    
    async getGametypeId(playerName, playerMasterId, gametypeId){

        const query = "SELECT id FROM nstats_player_totals WHERE player_id=? AND gametype=?";

        const result = await mysql.simpleQuery(query, [playerMasterId, gametypeId]);

        if(result.length === 0){
            return await this.createGametypeId(playerName, playerMasterId, gametypeId);
        }

        return result[0].id;
    }

    async getMasterIds(playerName, gametypeId){

        const masterId = await this.getMasterId(playerName, 0);
        const gametypeMasterId = await this.getGametypeId(playerName, masterId, gametypeId);

        return {"masterId": masterId, "gametypeId": gametypeMasterId};
    }
 
  

    updateEfficiency(id){

        return new Promise((resolve, reject) =>{
    
            const query = `UPDATE nstats_player_totals SET 
            efficiency = IF(kills > 0, IF(deaths > 0, (kills / (deaths + kills) * 100), 100), 0)
            WHERE id=?`;

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateFrags(id, date, playtime, frags, score, kills, deaths, suicides, teamKills, spawnKills,
        multis, bestMulti, sprees, bestSpree, fastestKill, slowestKill, bestSpawnKillSpree,
        firstBlood, accuracy, normalRangeKills, longRangeKills, uberRangeKills, headshots, gametype){
            
        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET matches=matches+1, 
            first = IF(first = 0 OR first > ?, ?, first), 
            last = IF(last < ?,?,last), 
            playtime=playtime+?, 
            frags=frags+?, score=score+?, kills=kills+?, deaths=deaths+?, suicides=suicides+?, 
            team_kills=team_kills+?, spawn_kills=spawn_kills+?,
            multi_1 = multi_1+?, multi_2 = multi_2+?, multi_3 = multi_3+?, multi_4 = multi_4+?,
            multi_5 = multi_5+?, multi_6 = multi_6+?, multi_7 = multi_7+?,
            multi_best = IF(multi_best < ?, ?, multi_best),
            spree_1 = spree_1+?, spree_2 = spree_2+?, spree_3 = spree_3+?, spree_4 = spree_4+?,
            spree_5 = spree_5+?, spree_6 = spree_6+?, spree_7 = spree_7+?,
            spree_best = IF(spree_best < ?, ?, spree_best),
            fastest_kill = IF(fastest_kill > ? OR fastest_kill = 0 AND ? != 0, ?, fastest_kill),
            slowest_kill = IF(slowest_kill < ? OR slowest_kill = 0 AND ? != 0, ?, slowest_kill),
            best_spawn_kill_spree = IF(best_spawn_kill_spree < ?, ?, best_spawn_kill_spree),
            first_bloods=first_bloods+?,
            accuracy=?, k_distance_normal=k_distance_normal+?, k_distance_long=k_distance_long+?, k_distance_uber=k_distance_uber+?,
            headshots=headshots+?
            WHERE id=? AND gametype=?`;

            const vars = [
                date,
                date,
                date,
                date,
                playtime, 
                frags, 
                score, 
                kills, 
                deaths, 
                suicides, 
                teamKills, 
                spawnKills, 
                multis.double,
                multis.multi,
                multis.mega,
                multis.ultra,
                multis.monster,
                multis.ludicrous,
                multis.holyshit,
                bestMulti,
                bestMulti,
                sprees.spree,
                sprees.rampage,
                sprees.dominating,
                sprees.unstoppable,
                sprees.godlike,
                sprees.massacre,
                sprees.brutalizing,
                bestSpree,
                bestSpree,
                fastestKill,
                fastestKill,
                fastestKill,
                slowestKill,
                slowestKill,
                slowestKill,
                bestSpawnKillSpree,
                bestSpawnKillSpree,
                firstBlood,
                accuracy,
                normalRangeKills,
                longRangeKills,
                uberRangeKills,
                headshots,
                id,
                gametype
            ];

            mysql.query(query, vars, async (err) =>{

                if(err) reject(err);

                try{

                    await this.updateEfficiency(id);

                }catch(err){
                    console.trace(err);
                    new Message(err, "warning");
                }

                resolve();
            });
        });
    }


    updateWinStats(id, win, drew, gametype){

        return new Promise((resolve, reject) =>{

            if(gametype === undefined) gametype = 0;

            const winRateString = `winrate = IF(wins > 0 && matches > 0, (wins/matches) * 100, 0)`;

            let query = `UPDATE nstats_player_totals SET 
                wins=wins+1, 
                ${winRateString}
                 WHERE id=? AND gametype=?`;

            if(!win){
                if(!drew){
                    query = `UPDATE nstats_player_totals SET losses=losses+1, ${winRateString} WHERE id=? AND gametype=?`;
                }else{
                    query = `UPDATE nstats_player_totals SET draws=draws+1, ${winRateString} WHERE id=? AND gametype=?`;
                }
            }

            mysql.query(query, [id, gametype], (err) =>{

                if(err){
                    console.trace(err);
                    reject(err);
                }

                resolve();
            });
        });
    }


    async insertMatchData(player, matchId, gametypeId, mapId, matchDate, ping, totalTeams){

        const query = `INSERT INTO nstats_player_matches VALUES(
            NULL,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,?,?,?,?,0,0,0,
            ?,?,?,?,?,?,?,?,?,?,
            ?,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0)`;

            //53
        const lastTeam = (player.teams.length === 0) ? 255 : player.teams[player.teams.length - 1].id;
        
        const playtime = player.getTotalPlaytime(totalTeams);

        const vars = [
            matchId,
            matchDate,
            mapId,
            player.masterId,
            player.bBot,
            (player.stats.time_on_server === 0) ? 1 : 0,//player.bSpectator,
            (player.stats.time_on_server === 0) ? 0 : 1,//player.bPlayedInMatch,
            Functions.setValueIfUndefined(player.ip,""),
            Functions.setValueIfUndefined(player.country,"xx"),
            Functions.setValueIfUndefined(player.faceId),
            Functions.setValueIfUndefined(player.voiceId),
            gametypeId,
            player.bWinner,
            player.bDrew,
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
            Functions.calculateKillEfficiency(player.stats.kills, player.stats.deaths),
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
            (isNaN(player.stats.killMinDistance)) ? 0 : Functions.setValueIfUndefined(player.stats.killMinDistance),
            (isNaN(player.stats.killAverageDistance)) ? 0 : Functions.setValueIfUndefined(player.stats.killAverageDistance),
            player.stats.killMaxDistance,
            player.stats.killsNormalRange,
            player.stats.killsLongRange,
            player.stats.killsUberRange,
            player.stats.headshots
        ];

        const result = await mysql.simpleQuery(query, vars);

        return result.insertId;

    }
    

    getPlayerById(id){

        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            const query = "SELECT * FROM nstats_player_totals WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    Functions.removeIps(result);
                    resolve(result[0]);
                }
                
                resolve(null);
            });
        });
    }


    getPlayerGametypeWinStats(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT gametype,matches,wins,losses,draws,playtime,accuracy,last FROM nstats_player_totals WHERE gametype!=0 AND name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve(null);
            });
        });
    }


    async getPlayedMatchIds(id){

        const query = "SELECT match_id FROM nstats_player_matches WHERE player_id=?";

        const result = await mysql.simpleFetch(query, [id]);

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
    async getOnlyValidPlayerMatchIds(playerId, minPlayers, minPlaytime, matchManager){

        const ids = await this.getPlayedMatchIds(playerId);

        if(ids.length === 0) return [];

        const validIds = await matchManager.getValidMatches(ids, minPlayers, minPlaytime);

        return validIds;
    }

    async getRecentMatches(id, amount, page, matchManager){

        amount = parseInt(amount);

        if(amount !== amount) amount = 25;

        if(page === undefined){
            page = 1;
        }else{
            page = parseInt(page);
            if(page !== page) page = 1;
        }

        page--;

        const settings = await SiteSettings.getSettings("Matches Page");

        const validMatchIds = await this.getOnlyValidPlayerMatchIds(id, settings["Minimum Players"], settings["Minimum Playtime"], matchManager);

        if(validMatchIds.length === 0) return [];
        
        //const ignoreMatchIds = await this.getValidPlayedMatchIds(id, settings["Minimum Players"]);

        const query = "SELECT * FROM nstats_player_matches WHERE player_id=? AND match_id IN (?) AND playtime > 0 AND playtime >=? ORDER BY match_date DESC, id DESC LIMIT ?,?";
        const start = amount * page;
        const vars = [id, validMatchIds, settings["Minimum Playtime"], start, amount];
        const result = await mysql.simpleFetch(query, vars);

        Functions.removeIps(result);

        return result;

    }


    async getTotalMatches(id, matchManager){

        const settings = await SiteSettings.getSettings("Matches Page");

        const validIds = await this.getOnlyValidPlayerMatchIds(id, settings["Minimum Players"], settings["Minimum Playtime"], matchManager);

        if(validIds.length === 0) return 0;

        const query = "SELECT COUNT(*) as total_matches FROM nstats_player_matches WHERE player_id=? AND match_id IN(?) AND playtime > 0 AND playtime >=?";
        const vars = [id, validIds, settings["Minimum Playtime"]];

        const result = await mysql.simpleFetch(query, vars);

        return result[0].total_matches;

    }



    getNames(ids){

        return new Promise((resolve, reject) =>{

            if(ids.length === 0){ resolve(new Map())}

            const query = "SELECT id,name FROM nstats_player_totals WHERE id IN(?)";

            const data = new Map();

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                   // resolve(result);

                    for(let i = 0; i < result.length; i++){
                        data.set(result[i].id, result[i].name)
                    }
                }
                resolve(data);
            });
        });
    }


    getMaxValue(type){

        return new Promise((resolve, reject) =>{

            type = type.toLowerCase();
            //add winrate
            const validTypes = ["playtime","score","frags","deaths","kills","matches","efficiency","winrate","accuracy","wins"];
            
            let data = 0;

            const index = validTypes.indexOf(type);

            if(index === -1){
                resolve(0);
            }

            const query = `SELECT ${validTypes[index]} as type_result FROM nstats_player_totals WHERE gametype=0 ORDER BY ${validTypes[index]} DESC LIMIT 1`;

            mysql.query(query, (err, result) =>{

                
                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){
                        data = result[0].type_result;
                    }
                }

                resolve(data);
            });

        });
    }

    insertScoreHistory(matchId, timestamp, player, score){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_match_player_score VALUES(NULL,?,?,?,?)";

            mysql.query(query, [matchId, timestamp, player, score], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getMatchDatesAfter(timestamp, player){

        return new Promise((resolve, reject) =>{

            const query = "SELECT match_date,gametype FROM nstats_player_matches WHERE match_date>=? AND player_id=? ORDER BY match_date DESC";

            mysql.query(query, [timestamp, player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push({"date": result[i].match_date, "gametype": result[i].gametype});
                    }

                    resolve(data);
                }

                resolve([]);
            });
        });
    }

    getAllIps(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT DISTINCT ip FROM nstats_player_matches WHERE player_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    
                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push(result[i].ip);
                    }

                    resolve(data);
                }

                resolve([]);
            });
        });
    }

    getIdsWithThisIp(ips){

        return new Promise((resolve, reject) =>{

            if(ips.length === 0) resolve([]);

            const query = "SELECT DISTINCT player_id FROM nstats_player_matches WHERE ip IN(?)";

            mysql.query(query, [ips], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push(result[i].player_id);
                    }
                    resolve(data);
                }

                resolve([]);
            });
        

        });
    }
    


    getPlayerNames(ids){

        return new Promise((resolve, reject) =>{

            if(ids === undefined) resolve([]);

            if(ids.length === 0) resolve([]);

            const query = "SELECT id,name,country,face FROM nstats_player_totals WHERE id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    async getPossibleAliases(id){

        try{

            const ips = await this.getAllIps(id);

            if(ips.length > 0){

                const ids = await this.getIdsWithThisIp(ips);
                return await this.getPlayerNames(ids);
            }

            return [];

        }catch(err){
            console.trace(err);
        }
    }



    async getGametypeTotals(player, gametype){

        const query = `SELECT frags,deaths,suicides,team_kills,dom_caps,assault_objectives,multi_1,multi_2,multi_3,multi_4,
            multi_5,multi_6,multi_7,spree_1,spree_2,spree_3,spree_4,spree_5,spree_6,spree_7,dom_caps,assault_objectives,playtime,
            matches,mh_kills
            FROM nstats_player_totals WHERE gametype=? AND player_id=?
            `;

        const result = await mysql.simpleQuery(query, [gametype, player]);

        if(result.length > 0){
            return result[0];
        }

        return null;
    }

    async getCTFMatchData(playerId, matchId){

        const query = "SELECT * FROM nstats_player_ctf_match WHERE player_id=? AND match_id=?";

        const result = await mysql.simpleQuery(query, [playerId, matchId]);

        if(result.length > 0) return result[0];

        return null;
    }

    async getMatchData(playerId, matchId){


        const query = "SELECT * FROM nstats_player_matches WHERE player_id=? AND match_id=? LIMIT 1";

        const result = await mysql.simpleQuery(query, [playerId, matchId]);

        if(result.length > 0){

            const ctfData = await this.getCTFMatchData(playerId, matchId);

            if(ctfData !== null){
                result[0].ctfData = ctfData;          
            }
            
            return result[0];
        }

        return null;
    }


    async deletePlayerMatch(playerId, matchId){

        return await mysql.simpleDelete("DELETE FROM nstats_player_matches WHERE player_id=? AND match_id=?", [
            playerId, matchId
        ]);
    }

    async deletePlayerScoreData(playerId, matchId){

        return await mysql.simpleDelete("DELETE FROM nstats_match_player_score WHERE player=? AND match_id=?",
        [playerId, matchId]);
    }


    async deletePlayerTeamChanges(playerId, matchId){

        return await mysql.simpleDelete("DELETE FROM nstats_match_team_changes WHERE player=? AND match_id=?",[
            playerId, matchId
        ]);
    }

    async reduceMapTotals(playerId, mapId, playtime){

        return await mysql.simpleUpdate(`UPDATE nstats_player_maps SET matches=matches-1,playtime=playtime-? WHERE player=?
        AND map=?
        `, [playtime, playerId, mapId]);
    }


    async reduceTotals(player, gametypeId){

        const query = `UPDATE nstats_player_totals SET 
            matches=matches-1,
            wins = IF(? = 1, wins-1, wins),
            losses = IF(? = 0, losses-1, losses),
            draws = IF(? = 1, draws-1, draws),
            winrate = IF(matches > 0, IF(wins > 0, (wins / matches) * 100 ,0) , 0),
            playtime = playtime-?,
            first_bloods = IF(? = 1, first_bloods-1, first_bloods),
            frags = frags-?,
            score = score-?,
            kills = kills-?,
            deaths = deaths-?,
            suicides = suicides-?,
            team_kills = team_kills-?,
            spawn_kills = spawn_kills-?,
            efficiency = IF(kills > 0,IF(deaths > 0, (kills / (deaths + kills)) * 100 ,100), 0),
            multi_1 = multi_1 - ?,
            multi_2 = multi_2 - ?,
            multi_3 = multi_3 - ?,
            multi_4 = multi_4 - ?,
            multi_5 = multi_5 - ?,
            multi_6 = multi_6 - ?,
            multi_7 = multi_7 - ?,
            spree_1 = spree_1 - ?,
            spree_2 = spree_2 - ?,
            spree_3 = spree_3 - ?,
            spree_4 = spree_4 - ?,
            spree_5 = spree_5 - ?,
            spree_6 = spree_6 - ?,
            spree_7 = spree_7 - ?,
            assault_objectives = assault_objectives - ?,
            dom_caps = dom_caps - ?,
            k_distance_normal = k_distance_normal - ?,
            k_distance_long = k_distance_long - ?,
            k_distance_uber = k_distance_uber - ?,

            headshots = headshots - ?,
            shield_belt = shield_belt - ?,
            amp = amp - ?,
            amp_time = amp_time - ?,
            invisibility = invisibility - ?,
            invisibility_time = invisibility_time - ?,
            pads = pads - ?,
            armor = armor - ?,
            boots = boots - ?,
            super_health = super_health - ?,
            mh_kills = mh_kills - ?,
            mh_deaths = mh_deaths - ?


            WHERE name=? AND gametype IN(?)
            `;

            const gametypes = [0, gametypeId];

            const vars = [
                player.winner,
                player.winner,
                player.draw,
                player.playtime,
                player.first_blood,
                player.frags,
                player.score,
                player.kills,
                player.deaths,
                player.suicides,
                player.team_kills,
                player.spawn_kills,
                player.multi_1,
                player.multi_2,
                player.multi_3,
                player.multi_4,
                player.multi_5,
                player.multi_6,
                player.multi_7,
                player.spree_1,
                player.spree_2,
                player.spree_3,
                player.spree_4,
                player.spree_5,
                player.spree_6,
                player.spree_7,

                /*player.flag_assist,
                player.flag_return,
                player.flag_taken,
                player.flag_dropped,
                player.flag_capture,
                player.flag_pickup,
                player.flag_seal,
                player.flag_cover,
                player.flag_cover_pass,
                player.flag_cover_fail,
                player.flag_self_cover,
                player.flag_self_cover_pass,
                player.flag_self_cover_fail,
                player.flag_multi_cover,
                player.flag_spree_cover,
                player.flag_kill,
                player.flag_save,
                player.flag_carry_time,*/
                player.assault_objectives,
                player.dom_caps,
                player.headshots,
                player.k_distance_normal,
                player.k_distance_long,
                player.k_distance_uber,

                player.shield_belt,
                player.amp,
                player.amp_time,
                player.invisibility,
                player.invisibility_time,
                player.pads,
                player.armor,
                player.boots,
                player.super_health,
                player.mh_kills,
                player.mh_deaths,

                player.name,
                gametypes
            ];

        return await mysql.simpleUpdate(query, vars);
    }


    async getPlayerGametypeData(playerName, gametypeId){

        return await mysql.simpleFetch("SELECT * FROM nstats_player_totals WHERE name=? AND gametype=?", 
            [playerName, gametypeId]
        );
    }
    

    async removeFromMatch(playerId, matchId, mapId, matchManager){

        try{

            const matchData = await this.getMatchData(playerId, matchId);

            let playerNames = await this.getNames([playerId]);

            const mapIterator = playerNames.values();

            matchData.name = mapIterator.next().value;

            let currentDMWinner = "";

            if(matchData !== null){

                const gametypeId = matchData.gametype;


                const countriesManager = new CountriesManager();

                await countriesManager.reduceUses(matchData.country, 1);

                const assaultManager = new Assault();

                await assaultManager.deletePlayerFromMatch(playerId, matchId);

                const ctfManager = new CTF();

                await ctfManager.deletePlayerFromMatch(playerId, matchId);

                const domManager = new Domination();

                await domManager.deletePlayerFromMatch(playerId, matchId);

                const monsterHuntManager = new MonsterHunt();

                await monsterHuntManager.removePlayerFromMatch(playerId, matchId);

                const faceManager = new Faces();

                await faceManager.reduceUsage(matchData.face, 1);

                const headshotsManager = new Headshots();

                await headshotsManager.deletePlayerFromMatch(playerId, matchId);

                const itemsManager = new Items();

                await itemsManager.deletePlayerFromMatch(playerId, matchId);

                const killsManager = new Kills();

                await killsManager.deletePlayerMatchData(playerId, matchId);

                const connectionsManager = new Connections();

                await connectionsManager.deletePlayerFromMatch(playerId, matchId);

                const pingManager = new Pings();

                await pingManager.deletePlayerMatchData(playerId, matchId);

                await this.deletePlayerScoreData(playerId, matchId);

                await this.deletePlayerTeamChanges(playerId, matchId);

                await this.reduceMapTotals(playerId, mapId, matchData.playtime);

                await this.reduceTotals(matchData, matchData.gametype);

                const weaponManager = new Weapons();

                await weaponManager.deletePlayerFromMatch(playerId, matchId);

                const voiceManager = new Voices();

                await voiceManager.reduceTotals(matchData.voice, 1);

                const winRateManager = new WinRate();

                await winRateManager.deletePlayerFromMatch(playerId, matchId, matchData.gametype);


                const spreeManager = new Sprees();
                await spreeManager.deletePlayerMatchData(playerId, matchId);

                await this.deletePlayerMatch(playerId, matchId);

                await matchManager.reducePlayerCount(matchId, 1);

                
                currentDMWinner = await matchManager.getDmWinner(matchId);

                
                if(currentDMWinner === matchData.name){
                    await matchManager.recalculateDmWinner(matchId, this);
                }

                const comboManager = new Combogib();

                await comboManager.deletePlayerFromMatch(playerId, mapId, matchData.gametype, matchId);
               // await matchManager.renameSingleDMMatchWinner(matchId, oldName, matchData.name);


            }

        }catch(err){
            console.trace(err);
        }
    }


    async getPlayerCapRecords(playerId){

        const query = "SELECT match_id,match_date,map_id FROM nstats_ctf_cap_records WHERE cap=?";

        const result = await mysql.simpleQuery(query, [playerId]);

    }

    async bPlayerInMatch(playerId, matchId){

        const query = "SELECT COUNT(*) as total_rows FROM nstats_player_matches WHERE player_id=? AND match_id=?";

        const result = await mysql.simpleQuery(query, [playerId, matchId]);

        return result[0].total_rows > 0;
    }
    

    async getPlayerGametypeTotals(playerId, gametypeId){

        const query = "SELECT * FROM nstats_player_totals WHERE player_id=? AND gametype=? LIMIT 1";

        const result = await mysql.simpleQuery(query, [playerId, gametypeId]);

        if(result.length > 0){
            return result[0];
        }
        
        return null;
    }


    async getAllGametypeMatchData(playerId, gametypeId){

        const query = "SELECT * FROM nstats_player_matches WHERE player_id=? AND gametype=? ORDER BY match_date ASC";

        return await mysql.simpleQuery(query, [playerId, gametypeId]);
    }


    async getBasicInfo(playerId){

        const query = `SELECT name,country FROM nstats_player_totals WHERE id=? AND gametype=0`;

        const result = await mysql.simpleQuery(query, [playerId]);

        if(result.length > 0){
            return result[0];
        }

        return null;
    }
}

module.exports = Player;