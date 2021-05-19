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
                    resolve({"match": result[0].id, "playtime": result[0].playtime});
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


    async insertMergedPlayerHistory(mapId, data){

        try{

            const query = "INSERT INTO nstats_player_maps VALUES(NULL,?,?,?,?,?,?,?,?,?,?)";

            const vars = [
                mapId,
                data.player,
                data.first,
                data.first_id,
                data.last,
                data.last_id,
                data.matches,
                data.playtime,
                data.longest,
                data.longest_id
            ];

            await mysql.simpleInsert(query, vars);

        }catch(err){
            console.trace(err);
        }
    }

    async mergePlayerHistory(oldId, newId){

        try{

            const history = await this.getPlayerMapsHistory([oldId, newId]);

            const newData = {};

            const rowsToDelete = [];

            let h = 0;

            for(let i = 0; i < history.length; i++){

                h = history[i];

                rowsToDelete.push(h.id);

                if(newData[h.map] === undefined){

                    newData[h.map] = {
                        "player": newId,
                        "first": h.first,
                        "first_id": h.first_id,
                        "last": h.last,
                        "last_id": h.last_id,
                        "matches": h.matches,
                        "playtime": h.playtime,
                        "longest": h.longest,
                        "longest_id": h.longest_id,
                    }
                }else{

                    newData[h.map].matches += h.matches;
                    newData[h.map].playtime += h.playtime;

                    if(h.first < newData[h.map].first){

                        newData[h.map].first = h.first;
                        newData[h.map].first_id = h.first_id;
                    }

                    if(h.last > newData[h.map].last){
                        newData[h.map].last = h.last;
                        newData[h.map].last_id = h.last_id;
                    }

                    if(h.playtime > newData[h.map].longest){

                        newData[h.map].longest = h.playtime;
                        newData[h.map].longest_id = h.longest_id;
                    }
                }
            }

            await this.deletePlayerHistoryRows(rowsToDelete);

       
            for(const [key, value] of Object.entries(newData)){

                await this.insertMergedPlayerHistory(key, value);
            }

        }catch(err){
            console.table(err);
        }
    }
}


module.exports = Maps;