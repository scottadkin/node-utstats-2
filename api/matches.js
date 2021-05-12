const mysql = require('./database');
const Match = require('./match');
const Players = require('./players');
const Assault = require('./assault');
const CountriesManager = require('./countriesmanager');
const CTF = require('./ctf');
const Domination = require('./domination');
const Faces = require('./faces');
const Gametypes = require('./gametypes');

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
            console.log("deleted MatchCapData");

            await ctf.deleteMatchEvents(id);
            console.log("deleted matchctfevents");

        }catch(err){
            console.trace(err);
        }
    }

    async deleteDominationData(id){

        try{

            const dom = new Domination();

            const capData = await dom.getMatchDomPoints(id);

            for(let i = 0; i < capData.length; i++){

                console.log(`reducing point caps for point ${capData[i].id} by ${capData[i].captured}`);
                await dom.reducePointCaps(capData[i].id, capData[i].captured);
            }

            await dom.deleteMatchControlPoints(id);

            await dom.deletePlayerMatchScore(id);

        }catch(err){
            console.trace(err);
        }
    }



    async deleteMatch(id){

        try{

            console.log(`attempting to delete data for match id ${id}`);

            const matchManager = new Matches();
            const match = new Match();

            const matchData = await match.get(id);

            console.log(matchData);

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
            

        }catch(err){
            console.trace(err);
        }    
    }


    
}
module.exports = Matches;