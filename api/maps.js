const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const fs = require('fs');
const Functions = require('./functions');

class Maps{
    
    constructor(){



    }

    bExists(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_maps FROM nstats_maps WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result[0].total_maps > 0){
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });
    }

    insert(name, title, author, idealPlayerCount, levelEnterText, date, matchLength){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_maps VALUES(NULL,?,?,?,?,?,?,?,1,?)";

            mysql.query(query, [name, title, author, idealPlayerCount, levelEnterText, date, date, matchLength], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlaytime(name, matchLength){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_maps SET playtime=playtime+?, matches=matches+1 WHERE name=?";

            mysql.query(query, [matchLength, name], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    getCurrentDates(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT last,first FROM nstats_maps WHERE name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 0){

                        resolve(result[0]);
                    }
                }

                resolve(null);
            });
        });
    }


    updateDate(name, type, date){

        return new Promise((resolve, reject) =>{

            type = type.toLowerCase();

            if(type !== 'first'){
                type = 'last';
            }
        
            const query = `UPDATE nstats_maps SET ${type}=? WHERE name=?`;

            mysql.query(query, [date, name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    async updateDates(name, date){

        try{

            const currentDates = await this.getCurrentDates(name);

            if(currentDates !== null){


                if(date < currentDates.first){
                    await this.updateDate(name, 'first', date);
                }

                if(date > currentDates.last){
                    await this.updateDate(name, 'last', date);
                }

            }else{
                new Message(`There are no current dates for map ${name}`,'warning');
            }

        }catch(err){
            console.trace(err);
        }
    }

    async updateStats(name, title, author, idealPlayerCount, levelEnterText, date, matchLength){

        try{

            if(!await this.bExists(name)){

                await this.insert(name, title, author, idealPlayerCount, levelEnterText, date, matchLength);

            }else{

                await this.updatePlaytime(name, matchLength);
                await this.updateDates(name, date);
            }

        }catch(err){
            console.trace(err);
        }
    }



    getId(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id FROM nstats_maps WHERE name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result !== []) resolve(result[0].id);
                }

                resolve(null);
            });
        });
    }

    getName(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name FROM nstats_maps WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(this.removeUnr(result[0].name));
                }

                resolve('Not Found');
            });
        });

    }


    getAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_maps ORDER BY name ASC";

            const data = [];

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                   
                    resolve(result);
                }

                resolve(data);
            });
        });
    }


     removeUnr(name){

        const reg = /^(.+)\.unr$/i;
    
        const result = reg.exec(name);
    
        if(result !== null){
            return result[1];
        }
        
        return name;
    }

    /**
     *  old get names by id function, use getNames instead
     * @param {*} ids 
     */

    getNamesByIds(ids){

        return new Promise((resolve, reject) =>{

            if(ids === undefined) resolve([]);
            if(ids.length === 0) resolve([]);
            
            const query = "SELECT id,name FROM nstats_maps WHERE id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                const data = [];

                if(result !== undefined){
                    
                    for(let i = 0; i < result.length; i++){             
                        data.push({"id": result[i].id, "name": this.removeUnr(result[i].name)});
                    }
                }

                resolve(data);
            });
        });
    }

    

    removePrefix(name){

        const reg = /^.+?-(.+)$/i;

        const result = reg.exec(name);

        if(result !== null){
            return result[1];
        }

        return name;
    }

    async getImage(name){

        //name = this.removePrefix(name);
        name = Functions.cleanMapName(name);
        name = name.toLowerCase()+'.jpg';

        const files = fs.readdirSync('public/images/maps/');

        if(files.indexOf(name) !== -1){
            return `/images/maps/${name}`;
        }

        return `/images/temp.jpg`;
    }

    async getImages(names){

        const files = fs.readdirSync('public/images/maps/');

        const exists = [];

        let currentName = "";

        for(let i = 0; i < names.length; i++){
            
            currentName = Functions.cleanMapName(names[i]).toLowerCase();

            if(files.indexOf(`${currentName}.jpg`) !== -1){
                exists.push(currentName);
            }
        }


        return exists;
    }

    getNames(ids){

        return new Promise((resolve, reject) =>{

            if(ids.length === 0) resolve({});
            const data = {};

            const query = "SELECT id,name FROM nstats_maps WHERE id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    for(let i = 0; i < result.length; i++){

                        data[result[i].id] = this.removeUnr(result[i].name);
                    }
                }

                resolve(data);
            });
        });
    }

    getTotalResults(name){

        return new Promise((resolve, reject) =>{

            if(name === undefined) name = "";

            let query = "SELECT COUNT(*) as total_results FROM nstats_maps";
            let vars = [];

            if(name !== ""){
                query = "SELECT COUNT(*) as total_results FROM nstats_maps WHERE name LIKE(?)";
                vars = [`%${name}%`];
            }

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result[0].total_results);
                }
                resolve(0);
            });
        });
    }


    get(page, perPage, name){

        return new Promise((resolve, reject) =>{

            page = parseInt(page);
            perPage = parseInt(perPage);

            if(page !== page || perPage !== perPage){
                return [];
            }

            page--;

            const start = page * perPage;

            let query = "SELECT * FROM nstats_maps ORDER BY name ASC, id DESC LIMIT ?, ?";
            let vars = [start, perPage];
            

            if(name !== ""){
                query = "SELECT * FROM nstats_maps WHERE name LIKE(?) ORDER BY name ASC, id DESC LIMIT ?, ?";
                vars = [`%${name}%`, start, perPage]
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


    getSingle(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_maps WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined) resolve(result);
                resolve([]);
            });
        });
    }


    getLongestMatch(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,playtime FROM nstats_matches WHERE map=? ORDER BY playtime DESC LIMIT 1";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){
                        resolve({"match": result[0].id, "playtime": result[0].playtime});
                    }
                }

                resolve({"match": -1, "playtime": -1});
            });
        });
    }


    getRecent(id, page, perPage){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_matches WHERE map=? ORDER BY date DESC LIMIT ?, ?";

            page = page - 1;

            let start = perPage * page;

            mysql.query(query, [id, start, perPage], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });
        });
    }

    getMatchDates(map, limit){

        return new Promise((resolve, reject) =>{

            const query = "SELECT date FROM nstats_matches WHERE map=? ORDER BY date DESC";

            mysql.query(query, [map], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push(result[i].date);
                    }

                    resolve(data);
                }

                resolve([]);
            });

        });
    }


    bPlayerExist(player, map){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_players FROM nstats_player_maps WHERE map=? AND player=?";

            mysql.query(query, [map, player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result[0].total_players > 0){
                        resolve(true);
                    }
                }
                resolve(false);
            });
        });
    }

    insertNewPlayerHistory(player, map, matchId, date){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_player_maps VALUES(NULL,?,?,?,?,?,?,1,?,?,?)";

            let playtime = 0;

            if(player.stats.time_on_server !== undefined){
                playtime = player.stats.time_on_server.toFixed(4);
            }else{
                new Message(`Maps.InsertNewPlayerHistory() playtime is undefined`,'warning');
            }

            const vars = [
                map, 
                player.masterId,
                date,
                matchId,
                date,
                matchId,
                playtime,
                playtime,
                matchId
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlayerHistoryQuery(player, map, matchId, date){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_maps SET
            first = IF(first > ?, ?, first),
            last = IF(last <= ?, ?, last),
            last_id = IF(last <= ?, ?, last_id),
            matches=matches+1,
            playtime=playtime+?,
            longest_id = IF(longest <= ?, ?, longest_id),
            longest = IF(longest < ?, ?, longest)
            WHERE player=? AND map=?
            `;

            let playtime = 0;

            if(player.stats.time_on_server !== undefined){
                playtime = player.stats.time_on_server.toFixed(4);
            }else{
                new Message(`Maps.updatePlayerHistoryQuery() playtime is undefined`,'warning');
            }

            const vars = [
                date, 
                date,
                date,
                date,
                date, 
                matchId,
                playtime,
                playtime,
                matchId,
                playtime,
                playtime,
                player.masterId,
                map
            ];

            mysql.query(query, vars, (err) =>{

                if(err){

                    console.trace(err);
                    reject(err);
                }

                resolve();
            });
        });
    }

    async updatePlayerHistory(player, map, matchId, date){

        try{

            const exists = await this.bPlayerExist(player.masterId, map);

            if(!exists){
                await this.insertNewPlayerHistory(player, map, matchId, date);
            }else{
                await this.updatePlayerHistoryQuery(player, map, matchId, date);
            }

        }catch(err){
            new Message(`Maps.updatePlayerHistory() ${err}`,'error');
        }
    }


    async updateAllPlayersHistory(players, mapId, matchId, date){

        try{

            let p = 0;

            for(let i = 0; i < players.length; i++){

                p = players[i];

                if(p.bDuplicate === undefined){
                    await this.updatePlayerHistory(p, mapId, matchId, date);
                }
            }

        }catch(err){
            new Message(`Maps.updateAllPlayersHistory() ${err}`,'error');
        }
    }


    getTopPlayersPlaytime(mapId, limit){

        return new Promise((resolve, reject) =>{

            const query = "SELECT player,playtime,matches,longest,longest_id,first,last FROM nstats_player_maps WHERE map=? ORDER BY playtime DESC LIMIT ?";

            mysql.query(query, [mapId, limit], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getLongestMatches(mapId, limit){

        return new Promise((resolve, reject) =>{

            const query = `SELECT 
            id,date,server,gametype,map,playtime,insta,total_teams,players,dm_winner,dm_score,team_score_0,team_score_1,team_score_2,team_score_3
            FROM nstats_matches WHERE map=? ORDER BY playtime DESC LIMIT ?
            `;

            mysql.query(query, [mapId, limit], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getSpawns(mapId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,x,y,z,spawns,team FROM nstats_map_spawns WHERE map=?";

            mysql.query(query, [mapId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    getMostPlayed(limit){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,first,last,matches,playtime FROM nstats_maps ORDER BY matches DESC LIMIT ?";

            mysql.query(query, [limit], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    getAllNames(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name FROM nstats_maps ORDER BY name ASC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    reduceMapTotals(id, playtime){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_maps SET matches=matches-1, playtime=playtime-? WHERE id=?";

            mysql.query(query, [playtime, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async getPlayerMapsHistory(ids){

        if(ids.length === 0) return [];

        return await mysql.simpleFetch("SELECT * FROM nstats_player_maps WHERE player IN (?)",[ids]);
    }

    async deletePlayerHistoryRows(rowIds){

        if(rowIds.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_player_maps WHERE id IN(?)", [rowIds]);
    }


    async getAllPlayerMatchesPlaytime(playerId){

        const query = "SELECT id,match_date,map_id,playtime FROM nstats_player_matches WHERE player_id=?";

        return await mysql.simpleFetch(query, [playerId]);
    }


    async deletePlayer(playerId){

        return await mysql.simpleDelete("DELETE FROM nstats_player_maps WHERE player=?", [playerId]);
    }


    async insertPlayerTotals(playerId, mapId, data){

        const query = `INSERT INTO nstats_player_maps VALUES(NULL,?,?,?,?,?,?,?,?,?,?)`;

        const vars = [
            mapId,
            playerId,
            data.first,
            data.first_id,
            data.last,
            data.last_id,
            data.matches,
            data.playtime,
            data.longest,
            data.longest_id
        ];

        await mysql.simpleUpdate(query, vars);
    }

    async recalculatePlayerTotalsAfterMerge(playerId){

        try{

            const playtimeData = await this.getAllPlayerMatchesPlaytime(playerId);
            
            const totals = {};

            let p = 0;
            let current = 0;

            for(let i = 0; i < playtimeData.length; i++){

                p = playtimeData[i];

                if(totals[p.map_id] === undefined){

                    totals[p.map_id] = {
                        "matches": 0,
                        "first": p.match_date,
                        "last": p.match_date,
                        "playtime": 0,
                        "first_id": p.id,
                        "last_id": p.id,
                        "longest": p.playtime,
                        "longest_id": p.id
                    };
                }

                current = totals[p.map_id];

                current.matches++;

                if(p.match_date < current.first){
                    current.first = p.match_date;
                    current.first_id = p.id;
                }

                if(p.match_date > current.last){
                    current.last = p.match_date;
                    current.last_id = p.id;
                }

                if(p.playtime > current.longest){
                    current.longest = p.playtime;
                    current.longest_id = p.id;
                }

                current.playtime += p.playtime;
            }


            for(const [key, value] of Object.entries(totals)){

                await this.insertPlayerTotals(playerId, key, value);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async reduceTotal(mapId, playtime, matches){

        const query = "UPDATE nstats_maps SET playtime=playtime-?, matches=matches-? WHERE id=?";
        const vars = [playtime, matches, mapId];

        await mysql.simpleUpdate(query, vars);
    }

    async reduceTotals(mapStats){

        try{

            for(const [map, data] of Object.entries(mapStats)){

                await this.reduceTotal(parseInt(map), data.playtime, data.matches);
            }

        }catch(err){
            console.trace(err);
        }
    }


    async reducePlayerTotals(playerId, mapId, matches, playtime){

        const query = "UPDATE nstats_player_maps SET matches=matches-?, playtime=playtime-? WHERE map=? AND player=?";
        const vars = [matches, playtime, mapId, playerId];

        await mysql.simpleUpdate(query, vars);
    }

    async reducePlayersTotals(playerData){

        try{

            const stats = {};

            let p = 0;

            for(let i = 0; i < playerData.length; i++){

                p = playerData[i];

                if(stats[p.player_id] === undefined){
                    stats[p.player_id] = {};
                }

                if(stats[p.player_id][p.map_id] === undefined){

                    stats[p.player_id][p.map_id] = {
                        "matches": 0,
                        "playtime": 0
                    };
                }

                stats[p.player_id][p.map_id].matches++;
                stats[p.player_id][p.map_id].playtime += p.playtime;
            }

            for(const [player, maps] of Object.entries(stats)){

                for(const [mapId, values] of Object.entries(maps)){

                    await this.reducePlayerTotals(parseInt(player), parseInt(mapId), values.matches, values.playtime);
                }
            }

        }catch(err){
            console.trace(err);
        }
    }


    async getDetails(id){

        const result = await mysql.simpleFetch("SELECT * FROM nstats_maps WHERE id=?", [id]);

        if(result.length === 0){
            return null;
        }

        return result[0];
    }
}


module.exports = Maps;