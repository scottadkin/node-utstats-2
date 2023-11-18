const mysql = require('./database');
const Message = require('./message');
const fs = require('fs');
const Functions = require('./functions');

class Maps{
    
    constructor(settings){

        if(settings !== undefined){
            this.settings = settings;
        }

        this.validSearchOptions = [
            "name", "first", "last", "matches", "playtime"
        ];

        this.mergeDepth = 0;
        this.bMergeError = false;

        
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

    async insert(name, title, author, idealPlayerCount, levelEnterText, date, matchLength){

        const query = "INSERT INTO nstats_maps VALUES(NULL,?,?,?,?,?,?,?,1,?,0)";
        return await mysql.simpleQuery(query, [name, title, author, idealPlayerCount, levelEnterText, date, date, matchLength]);
    }

    async adminCreateMap(name, title, author, idealPlayerCount, levelEnterText, importAs){

        const query = "INSERT INTO nstats_maps VALUES(NULL,?,?,?,?,?,0,0,0,0,?)";
        return await mysql.simpleQuery(query, [name, title, author, idealPlayerCount, levelEnterText, importAs]);
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

    async getAutoMergeIdByName(name){

        const query = `SELECT import_as_id FROM nstats_maps WHERE name=?`;

        const result = await mysql.simpleQuery(query, [name]);

        if(result.length > 0) return result[0].import_as_id;

        return 0;
    }

    async updateStats(name, title, author, idealPlayerCount, levelEnterText, date, matchLength){

        try{

            if(!await this.bExists(name)){

                await this.insert(name, title, author, idealPlayerCount, levelEnterText, date, matchLength);

            }else{

                const autoMergeId = await this.getAutoMergeIdByName(name);

                if(autoMergeId !== 0){

                    const newName = await this.getName(autoMergeId);

                    new Message(`${name} has been set to import as ${newName}.unr`,"note");

                    this.mergeDepth++;
                    if(this.mergeDepth > 5){
                        this.bMergeError = true;
                        new Message(`Infinite loop detected, map merges back into itself.`, "error");
                        return
                    }

                    await this.updateStats(`${newName}.unr`, title, author, idealPlayerCount, levelEnterText, date, matchLength);

                    return;
                }


                await this.updatePlaytime(name, matchLength);
                await this.updateDates(name, date);
            }

        }catch(err){
            console.trace(err);
           // throw new Error(err.toString());
        }
    }



    async getId(name, bIncludeAutoMergeId){

        if(bIncludeAutoMergeId === undefined) bIncludeAutoMergeId = false;
        const query = "SELECT id,import_as_id FROM nstats_maps WHERE name=? LIMIT 1";

        const result = await mysql.simpleQuery(query, [name]);

        if(result.length === 0) return null;

        if(bIncludeAutoMergeId){

            return result[0];
        }

        //TODO need to add check to prevent infinite loop
        return (result[0].import_as_id === 0) ? result[0].id : result[0].import_as_id;

    }

    async getIdSafe(name){

        const maxDepth = 5;
        let currentDepth = 0;

        let lastId = -1;
        let currentName = name;

        while(currentDepth < maxDepth){

            const result = await this.getId(currentName, true);
            
            if(result === null) return lastId;
            if(result.import_as_id === 0) return result.id;

            currentName = `${await this.getName(result.import_as_id)}.unr`;


            lastId = result.import_as_id;
            
            currentDepth++;
        }

        return lastId;
    }

    async getName(id){

        const query = "SELECT name FROM nstats_maps WHERE id=?";
        const result = await mysql.simpleQuery(query, [id]);

        if(result.length === 0) return "Not Found";

        return this.removeUnr(result[0].name);

    }


    async getAll(){

        const query = "SELECT * FROM nstats_maps ORDER BY name ASC";

        return await mysql.simpleQuery(query);

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
     * @param {*} bSimpleObject return an object instead of an array
     */

    async getNamesByIds(ids, bSimpleObject){

        if(bSimpleObject === undefined) bSimpleObject = false;

        if(ids.length === 0) return {};

        const query = "SELECT id,name FROM nstats_maps WHERE id IN(?) ORDER BY name ASC";
        const result = await mysql.simpleFetch(query, [ids]);

        const data = (bSimpleObject) ? {} : [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(!bSimpleObject){
                data.push({"id": r.id, "name": this.removeUnr(r.name)});
            }else{

                data[r.id] = this.removeUnr(r.name);
            }
        }

        if(!bSimpleObject){
            data.push({"id": 0, "name": "Combined"});
        }else{

            data[0] = "Combined";
        }

        return data;

    }

    removePrefix(name){

        const reg = /^.+?-(.+)$/i;

        const result = reg.exec(name);

        if(result !== null){
            return result[1];
        }

        return name;
    }


    getSimilarImage(targetName, fileList){

        for(let i = 0; i < fileList.length; i++){

            const file = fileList[i];

            const cleanNameResult = /^(.+?)\.jpg$/i.exec(file);

            if(cleanNameResult === null) continue;

            const currentName = cleanNameResult[1].toLowerCase();
            if(targetName.includes(currentName)) return cleanNameResult[1];     
        }

        return null;
    }

    async getImage(name){

        name = Functions.cleanMapName(name);

        const justName = name.toLowerCase();
        name = justName+'.jpg';

        const files = fs.readdirSync('public/images/maps/');

        if(files.indexOf(name) !== -1){
            return `/images/maps/${name}`;
        }

        const similarImage = this.getSimilarImage(justName, files);

        if(similarImage !== null) return `/images/maps/${similarImage}.jpg`;

        return `/images/maps/default.jpg`;
    }

    async getImages(names){

        const files = fs.readdirSync('public/images/maps/');

        const exists = {};

        for(let i = 0; i < names.length; i++){
            
            const currentName = Functions.cleanMapName(names[i]).toLowerCase();

            if(files.indexOf(`${currentName}.jpg`) !== -1){

                exists[currentName] = currentName;
            }else{

                const similarImage = this.getSimilarImage(currentName, files);

                if(similarImage !== null){
                    //console.log(`Found similar image ${similarImage}`);
                    exists[currentName] = similarImage;
                }

            }
        }

        return exists;
    }

    async getNames(ids){

        if(ids.length === 0) return {};

        const data = {};
        const query = "SELECT id,name FROM nstats_maps WHERE id IN(?)";

        const result = await mysql.simpleQuery(query, [ids]);

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            data[r.id] = this.removeUnr(r.name);
        }

        return data;
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



    async defaultSearch(page, perPage, name, bAscending, sortBy){

    
        page = parseInt(page);
        if(page !== page) page = 1;
        page--;

        perPage = parseInt(perPage);
        if(perPage != perPage) perPage = 25;

        let start = perPage * page;
        if(start < 0) start = 0;

        const bAsc = (bAscending) ? "ASC" : "DESC";

        if(sortBy === undefined){
            sortBy = "name";
        }else{

            sortBy = sortBy.toLowerCase();

            if(this.validSearchOptions.indexOf(sortBy) === -1){
                sortBy = "name";
            }
        }

        const vars = [start, perPage];

        let nameSearch = "";

        if(name !== ""){

            nameSearch = "WHERE name LIKE (?)";
            vars.unshift(`%${name}%`);
        }

        const query = `SELECT * FROM nstats_maps ${nameSearch} ORDER BY ${sortBy} ${bAsc} LIMIT ?, ?`;

        
        return await mysql.simpleQuery(query, vars);

    
    }

    /*get(page, perPage, name){

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
    }*/


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


    async getLongestMatch(id){

        const query = `SELECT id,playtime FROM nstats_matches WHERE map=? AND playtime>=? AND players>=? ORDER BY playtime DESC LIMIT 1`;

        const settings = this.currentSettings();

        const result = await mysql.simpleFetch(query, [id, settings.minPlaytime, settings.minPlayers]);

        if(result.length > 0) return {"match": result[0].id, "playtime": result[0].playtime};

        return {"match": -1, "playtime": -1};
    }

    currentSettings(){

        const minPlaytime = this.settings["Minimum Playtime"] || 0;
        const minPlayers = this.settings["Minimum Players"] || 0;

        return {
            "minPlayers": minPlayers,
            "minPlaytime": minPlaytime
        };
    }


    async getRecent(id, page, perPage, playerManager){

        const query = "SELECT * FROM nstats_matches WHERE map=? AND playtime>=? AND players>=? ORDER BY date DESC, id DESC LIMIT ?, ?";

        const settings = this.currentSettings();

        page = parseInt(page);
        if(page !== page) page = 1;
        page--;

        perPage = parseInt(perPage);
        if(perPage !== perPage) perPage = 25;

        const start = page * perPage;

        const vars = [id, settings.minPlaytime, settings.minPlayers, start, perPage];
        
        const result = await mysql.simpleQuery(query, vars);

        const dmWinners = new Set(result.map(r => r.dm_winner));

        const playersInfo = await playerManager.getNamesByIds([...dmWinners], true);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.dm_winner !== 0){
                r.dmWinner = playersInfo[r.dm_winner];
            }
        }

        return result;

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


    async getSpawns(mapId){

        const query = "SELECT name,x,y,z,spawns,team FROM nstats_map_spawns WHERE map=?";

        return await mysql.simpleQuery(query, [mapId]);

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


    async getAllNames(){

        const query = "SELECT name FROM nstats_maps ORDER BY name ASC";
        return await mysql.simpleQuery(query);
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

        return await mysql.simpleQuery(query, [playerId]);
    }


    async deletePlayer(playerId){

        return await mysql.simpleQuery("DELETE FROM nstats_player_maps WHERE player=?", [playerId]);
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

            for(let i = 0; i < playtimeData.length; i++){

                const p = playtimeData[i];

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

                const current = totals[p.map_id];

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

            for(let i = 0; i < playerData.length; i++){

                const p = playerData[i];

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


    async getTotalMatches(id){

        const settings = this.currentSettings();

        const query = "SELECT COUNT(*) as total_matches FROM nstats_matches WHERE map=? AND playtime>=? AND players>=?";

        const vars = [id, settings.minPlaytime, settings.minPlayers];

        const result = await mysql.simpleFetch(query, vars);

        return result[0].total_matches;
    }


    getAllUploadedImages(){

        const fullSizeDir = "public/images/maps/";
        const thumbsDir = "public/images/maps/thumbs/";

        const fullSizeImages = fs.readdirSync(fullSizeDir);
        const thumbImages = fs.readdirSync(thumbsDir);

        return {"fullsize": fullSizeImages, "thumbs": thumbImages};
    }

    getMissingThumbnails(){

        const files = this.getAllUploadedImages();

        const missing = [];

        const ignore = "thumbs";

        for(let i = 0; i < files.fullsize.length; i++){

            const f = files.fullsize[i];

            if(f === ignore) continue;
            const index = files.thumbs.indexOf(f);

            if(index === -1){
                missing.push(f);
            }
        }

        return missing;
    }


    async getAllNameAndIds(){

        const query = "SELECT id,name FROM nstats_maps ORDER BY name ASC";

        const result = await mysql.simpleQuery(query);


        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = this.removeUnr(r.name);
        }

        return data;
    }

    async getAllDropDownOptions(){

        const data = await this.getAllNameAndIds();

        const options = [];

        for(const [mapId, mapName] of Object.entries(data)){

            options.push({"value": parseInt(mapId), "displayValue": mapName});
        }

        options.sort((a, b) =>{

            a = a.displayValue.toLowerCase();
            b = b.displayValue.toLowerCase();

            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });

        return options;
    }


    async getFlags(mapId){

        const query = `SELECT team,x,y,z FROM nstats_maps_flags WHERE map=?`;

        return await mysql.simpleQuery(query, [mapId]);
    }

    async getLastestMatchId(mapId){

        const query = `SELECT id FROM nstats_matches WHERE map=? ORDER BY date DESC LIMIT 1`;

        const result = await mysql.simpleQuery(query, [mapId]);

        if(result.length === 0) return -1;

        return result[0].id;
    }

    //if latest matchId is not specified then this method fetches it automatically 
    async getLastestMatchItems(mapId, optionalLatestMatchId){

        let latestMatchId = -1;

        if(optionalLatestMatchId === undefined){
            latestMatchId = await this.getLastestMatchId(mapId);
        }else{
            latestMatchId = optionalLatestMatchId;
        }

        if(latestMatchId === -1) return {"data": [], "uniqueItemIds": [], "itemsInfo": []};

        const query = `SELECT item_id,item_name,pos_x,pos_y,pos_z FROM nstats_map_items_locations WHERE match_id=?`;

        const data = await mysql.simpleQuery(query, [latestMatchId]);

        const uniqueItemIds = this.returnUniqueItems(data);

        const names = await this.getItemNames(uniqueItemIds);

        return {"data": data, "uniqueItemIds": uniqueItemIds, "itemsInfo": names};
    }

    returnUniqueItems(data){

        return [...new Set(data.map((d) =>{
            return d.item_id;
        }))];
    }

    async getItemNames(ids){

        if(ids.length === 0) return {};

        const query = `SELECT * FROM nstats_map_items WHERE id IN(?)`;

        const result = await mysql.simpleQuery(query, [ids]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = {
                "itemClass": r.item_class,
                "itemType": r.item_type
            };

        }

        return data;
    }


    async getHistoryBetween(id, start, end){

        const query = `SELECT date FROM nstats_matches WHERE map=? AND date>=? AND date<=? ORDER BY date DESC`;
        const result = await mysql.simpleQuery(query, [id, start, end]);

        return result.map((r) =>{
            return r.date;
        });
    }

    async getGraphHistoryData(id){

        const hour = 60 * 60;
        const day = hour * 24;
        const year = day * 365;
        const now = Math.floor(Date.now() * 0.001);
        const data = await this.getHistoryBetween(id, now - year, now);

        const dayData = [];
        const weekData = [];
        const monthData = [];
        const yearData = [];


        for(let i = 0; i < 365; i++){
            
            if(i < 24){
                dayData.push(0);
            }

            if(i < 7){
                weekData.push(0);
            }

            if(i < 28){
                monthData.push(0);
            }

            yearData.push(0);
        }

       

        for(let i = 0; i < data.length; i++){

            const d = data[i];
            const offset = now - d;
            
            const hourOffset = Math.floor(offset / hour);
            
            if(hourOffset < 24){
                dayData[hourOffset]++;
            }

            const dayOffset = Math.floor(offset / day);

            if(dayOffset < 7){
                weekData[dayOffset]++;
            }

            if(dayOffset < 28){
                monthData[dayOffset]++;
            }

            if(dayOffset < 365){
                yearData[dayOffset]++;
            }
        }

        return  [
            [{"name": "Matches Played", "values": dayData}],
            [{"name": "Matches Played", "values": weekData}],
            [{"name": "Matches Played", "values": monthData}],
            [{"name": "Matches Played", "values": yearData}]
        ];
    }


    async getCombinedTotals(map1, map2){

        const query = `SELECT * FROM nstats_maps WHERE id=? OR id=?`;

        return await mysql.simpleQuery(query, [map1, map2]);
    }

    async deleteMap(id){
        const query = `DELETE FROM nstats_maps WHERE id=?`;

        return await mysql.simpleQuery(query, [id]);
    }

    async updateTotalsFromMergeData(mapId, first, last, matches, playtime){

        const query = `UPDATE nstats_maps SET 
        first = IF(first > ?, ?, first),
        last = IF(last < ?, ?, last),
        matches=matches+?,
        playtime=playtime+?
        WHERE id=?`;

        const vars = [first, first, last, last, matches, playtime, mapId];

        return await mysql.simpleQuery(query, vars);
    }

    async deleteFlags(mapId){

        const query = `DELETE FROM nstats_maps_flags WHERE map=?`;

        return await mysql.simpleQuery(query, [mapId]);
    }

    async deleteItemSpawns(mapId){

        const query = `DELETE FROM nstats_map_items_locations WHERE map_id=?`;
        return await mysql.simpleQuery(query, [mapId]);
    }

    async deleteSpawnPoints(mapId){

        const query = `DELETE FROM nstats_map_spawns WHERE map=?`;

        return await mysql.simpleQuery(query, [mapId]);
    }

    async merge(oldId, newId, matchManager, assaultManager, ctfManager, domManager, combogibManager, weaponsManager, 
        playersManager, powerupsManager, teleFragsManager, winrateManager){

        //const totalData = await this.getCombinedTotals(oldId, newId);
        const oldMapTotals = await this.getDetails(oldId);


        if(oldMapTotals !== null){

            const t = oldMapTotals;

            await this.updateTotalsFromMergeData(newId, t.first, t.last, t.matches, t.playtime);
        }

        await this.deleteMap(oldId);
        await this.deleteFlags(oldId);
        await this.deleteItemSpawns(oldId);
        await this.deleteSpawnPoints(oldId);

        await matchManager.changeMapId(oldId, newId);
        await assaultManager.changeMapId(oldId, newId);
        await ctfManager.changeMapId(oldId, newId);
        await domManager.changeMapId(oldId, newId);
        await combogibManager.changeMapId(oldId, newId);
        await weaponsManager.changeMapId(oldId, newId);
        await playersManager.changeMapId(oldId, newId);
        await powerupsManager.changeMapId(oldId, newId);
        await teleFragsManager.changeMapId(oldId, newId);
        await winrateManager.changeMapId(oldId, newId);

    }


    async rename(mapId, newName){

        const query = `UPDATE nstats_maps SET name=? WHERE id=?`;

        return await mysql.simpleQuery(query, [newName, mapId]);
    }

    async getAllPlayedMatchIds(mapId){

        const query = `SELECT id FROM nstats_matches WHERE map=?`;

        const result = await mysql.simpleQuery(query, [mapId]);

        return result.map((r) =>{
            return r.id;
        });
    }


    async deleteAllMatches(matchManager, playerManager, mapId){


        const matchIds = await this.getAllPlayedMatchIds(mapId);

        for(let i = 0; i < matchIds.length; i++){

            const m = matchIds[i];
            await matchManager.deleteMatch(m, playerManager);
        }
    }
}



module.exports = Maps;