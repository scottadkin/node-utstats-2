import {simpleQuery} from "./database.js";
import Message from "./message.js";
import fs from "fs";
import {cleanMapName, removeUnr, sanatizePage, sanatizePerPage, cleanInt, getPlayer, setIdNames, toMysqlDate} from "./generic.mjs";
import { getObjectName } from "./genericServerSide.mjs";
import { getUniqueMGS } from "./matches.js";
import { getBasicPlayersByIds } from "./players.js";


export default class Maps{
    
    constructor(settings){

        if(settings !== undefined){
            this.settings = settings;
        }



        this.mergeDepth = 0;
        this.bMergeError = false;

        
    }

    async bExists(name){

        const query = "SELECT COUNT(*) as total_maps FROM nstats_maps WHERE name=?";
        const result = await simpleQuery(query, [name]);

        return result[0].total_maps > 0;

    }

    async insert(name, title, author, idealPlayerCount, levelEnterText, date, matchLength){

        const query = "INSERT INTO nstats_maps VALUES(NULL,?,?,?,?,?,?,?,1,?,0)";
        return await simpleQuery(query, [name, title, author, idealPlayerCount, levelEnterText, date, date, matchLength]);
    }

    async adminCreateMap(name, title, author, idealPlayerCount, levelEnterText, importAs){

        const query = "INSERT INTO nstats_maps VALUES(NULL,?,?,?,?,?,0,0,0,0,?)";
        return await simpleQuery(query, [name, title, author, idealPlayerCount, levelEnterText, importAs]);
    }

    async updatePlaytime(name, matchLength){

        const query = "UPDATE nstats_maps SET playtime=playtime+?, matches=matches+1 WHERE name=?";

        return await simpleQuery(query, [matchLength, name]);
    }

    async getCurrentDates(name){

        const query = "SELECT last,first FROM nstats_maps WHERE name=? LIMIT 1";
        const result = await simpleQuery(query, [name]);

        if(result.length === 0) return null;
        return result[0];
    }


    async updateDate(name, type, date){

        type = type.toLowerCase();

        if(type !== 'first'){
            type = 'last';
        }
    
        const query = `UPDATE nstats_maps SET ${type}=? WHERE name=?`;

        return await simpleQuery(query, [date, name]);
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

        const result = await simpleQuery(query, [name]);

        if(result.length > 0) return result[0].import_as_id;

        return 0;
    }

    async updateStats(name, title, author, idealPlayerCount, levelEnterText, date, matchLength){

        try{

           // date = toMysqlDate(date * 1000);
            if(!await this.bExists(name)){

                await this.insert(name, title, author, idealPlayerCount, levelEnterText, date, matchLength);

            }else{

                const autoMergeId = await this.getAutoMergeIdByName(name);

                if(autoMergeId !== 0){

                    const newName = await getMapName(autoMergeId);

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

        const result = await simpleQuery(query, [name]);

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

            currentName = `${await getMapName(result.import_as_id)}.unr`;


            lastId = result.import_as_id;
            
            currentDepth++;
        }

        return lastId;
    }

    async getName(id){

        return await getObjectName("maps", id);

    }


    async getAll(){

        const query = "SELECT * FROM nstats_maps ORDER BY name ASC";

        return await simpleQuery(query);

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
        const result = await simpleQuery(query, [ids]);

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


    async getNames(ids){

        return await getObjectName("maps", ids);
    }

    /*async getSingle(id){

        const query = "SELECT * FROM nstats_maps WHERE id=?";

        return await simpleQuery(query, [id]);
    }*/


    async getLongestMatch(id){

        const query = `SELECT id,playtime FROM nstats_matches WHERE map=? AND playtime>=? AND players>=? ORDER BY playtime DESC LIMIT 1`;

        const settings = this.currentSettings();

        const result = await simpleQuery(query, [id, settings.minPlaytime, settings.minPlayers]);

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

    async getMatchDates(map, limit){

        const query = "SELECT date FROM nstats_matches WHERE map=? ORDER BY date DESC";

        const result = await simpleQuery(query, [map]);

        const data = [];

        for(let i = 0; i < result.length; i++){

            data.push(result[i].date);
        }

        return data;
    }

    async getAllNames(){

        const query = "SELECT name FROM nstats_maps ORDER BY name ASC";
        return await simpleQuery(query);
    }

    async reduceMapTotals(id, playtime){

        throw new Error(`Use mysql instead...`);
        const query = "UPDATE nstats_maps SET matches=matches-1, playtime=playtime-? WHERE id=?";
        return await simpleQuery(query, [playtime, id]);

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

        throw new Error(`use mysql instead`);
        const query = "UPDATE nstats_maps SET playtime=playtime-?, matches=matches-? WHERE id=?";
        const vars = [playtime, matches, mapId];

        await simpleQuery(query, vars);
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

        const result = await simpleQuery("SELECT * FROM nstats_maps WHERE id=?", [id]);

        if(result.length === 0){
            return null;
        }

        return result[0];
    }


    async getTotalMatches(id){

        const settings = this.currentSettings();

        const query = "SELECT COUNT(*) as total_matches FROM nstats_matches WHERE map=? AND playtime>=? AND players>=?";

        const vars = [id, settings.minPlaytime, settings.minPlayers];

        const result = await simpleQuery(query, vars);

        return result[0].total_matches;
    }

    /*getMissingThumbnails(){

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
    }*/


    async getAllNameAndIds(bIncludeAutoMergeMaps){

        if(bIncludeAutoMergeMaps === undefined) bIncludeAutoMergeMaps = false;

        let query = "SELECT id,name FROM nstats_maps ORDER BY name ASC";

        if(!bIncludeAutoMergeMaps){
            query = "SELECT id,name FROM nstats_maps WHERE import_as_id=0 ORDER BY name ASC";
        }

        const result = await simpleQuery(query);


        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.id] = this.removeUnr(r.name);
        }

        return data;
    }

    async getAllDropDownOptions(bIncludeAutoMergeMaps){

        if(bIncludeAutoMergeMaps === undefined) bIncludeAutoMergeMaps = false;

        const data = await this.getAllNameAndIds(bIncludeAutoMergeMaps);

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

        return await simpleQuery(query, [mapId]);
    }

    async getLastestMatchId(mapId){

        const query = `SELECT id FROM nstats_matches WHERE map=? ORDER BY date DESC LIMIT 1`;

        const result = await simpleQuery(query, [mapId]);

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

        const data = await simpleQuery(query, [latestMatchId]);

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

        const result = await simpleQuery(query, [ids]);

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


    async getCombinedTotals(map1, map2){

        const query = `SELECT * FROM nstats_maps WHERE id=? OR id=?`;

        return await simpleQuery(query, [map1, map2]);
    }

    async deleteMap(id){
        return await deleteMap(id);
    }

    /*async updateTotalsFromMergeData(mapId, first, last, matches, playtime){

        const query = `UPDATE nstats_maps SET 
        first = IF(first > ?, ?, first),
        last = IF(last < ?, ?, last),
        matches=matches+?,
        playtime=playtime+?
        WHERE id=?`;

        const vars = [first, first, last, last, matches, playtime, mapId];

        return await simpleQuery(query, vars);
    }*/

    async deleteFlags(mapId){

        const query = `DELETE FROM nstats_maps_flags WHERE map=?`;

        return await simpleQuery(query, [mapId]);
    }

    async deleteItemSpawns(mapId){

        const query = `DELETE FROM nstats_map_items_locations WHERE map_id=?`;
        return await simpleQuery(query, [mapId]);
    }

    async deleteSpawnPoints(mapId){

        const query = `DELETE FROM nstats_map_spawns WHERE map=?`;

        return await simpleQuery(query, [mapId]);
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

        return await simpleQuery(query, [newName, mapId]);
    }

    async getAllPlayedMatchIds(mapId){

        const query = `SELECT id FROM nstats_matches WHERE map=?`;

        const result = await simpleQuery(query, [mapId]);

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

    async setAutoMergeId(mapId, targetId){

        if(mapId === targetId) throw new Error("You can't merge a map into itself.");
        if(mapId === 0) throw new Error("You can't merge a with id of 0.");

        const query = `UPDATE nstats_maps SET import_as_id=? WHERE id=?`;

        await simpleQuery(query, [targetId, mapId]);

    
    }
}

export const validSearchOptions = [
    "name", "first", "last", "matches", "playtime"
];

function getSimilarImage(targetName, fileList){

    for(let i = 0; i < fileList.length; i++){

        const file = fileList[i];

        const cleanNameResult = /^(.+?)\.jpg$/i.exec(file);

        if(cleanNameResult === null) continue;

        const currentName = cleanNameResult[1].toLowerCase();
        if(targetName.includes(currentName)) return cleanNameResult[1];     
    }

    return null;
}

async function getImage(name){

    name = cleanMapName(name);

    const justName = name.toLowerCase();
    name = justName+'.jpg';

    const files = fs.readdirSync('public/images/maps/');

    if(files.indexOf(name) !== -1){
        return `/images/maps/${name}`;
    }

    const similarImage = getSimilarImage(justName, files);

    if(similarImage !== null) return `/images/maps/${similarImage}.jpg`;

    return `/images/maps/default.jpg`;
}

export function getImages(names){

    if(names.length === 0) return {};

    const files = fs.readdirSync('public/images/maps/');

    const exists = {};

    for(let i = 0; i < names.length; i++){
        
        const currentName = cleanMapName(names[i]).toLowerCase();

        if(files.indexOf(`${currentName}.jpg`) !== -1){

            exists[currentName] = currentName;
        }else{

            const similarImage = getSimilarImage(currentName, files);

            if(similarImage !== null){
                //console.log(`Found similar image ${similarImage}`);
                exists[currentName] = similarImage;
            }
        }
    }

    return exists;
}

async function deleteMap(id){

    const query = `DELETE FROM nstats_maps WHERE id=?`;

    return await simpleQuery(query, [id]);
}

async function getTotalResults(name){

    if(name === undefined) name = "";

    let query = "SELECT COUNT(*) as total_results FROM nstats_maps";
    let vars = [];

    if(name !== ""){
        query = "SELECT COUNT(*) as total_results FROM nstats_maps WHERE name LIKE(?)";
        vars = [`%${name}%`];
    }

    const result = await simpleQuery(query, vars);

    return result[0].total_results;
}


export async function mapSearch(page, perPage, name, bAscending, sortBy){

    page = sanatizePage(page);

    if(page < 1) page = 1;
    page--;
    
    perPage = sanatizePerPage(perPage,25);

    let start = perPage * page;
    if(start < 0) start = 0;

    const bAsc = (bAscending) ? "ASC" : "DESC";

    if(sortBy === undefined){
        sortBy = "name";
    }else{

        sortBy = sortBy.toLowerCase();

        if(validSearchOptions.indexOf(sortBy) === -1){
            sortBy = "name";
        }
    }

    const vars = [start, perPage];

    let nameSearch = "";

    if(name !== ""){

        nameSearch = "AND name LIKE (?)";
        vars.unshift(`%${name}%`);
    }

    const query = `SELECT * FROM nstats_maps WHERE import_as_id=0 ${nameSearch} ORDER BY ${sortBy} ${bAsc} LIMIT ?, ?`;

    const result = await simpleQuery(query, vars);

    const names = new Set();

    for(let i = 0; i < result.length; i++){
        names.add(result[i].name);
    }

    const images = getImages([...names]);

    for(let i = 0; i < result.length; i++){
        
        const cleanName = cleanMapName(result[i].name).toLowerCase();

        if(images[cleanName] !== undefined){
            result[i].image = images[cleanName];
        }else{
            result[i].image = "default";
        }
    }

    const totalResults = await getTotalResults(name);

    return {"data": result, "totalResults": totalResults};
}

export async function getMostPlayed(limit){

    const query = "SELECT id,name,first,last,matches,playtime FROM nstats_maps ORDER BY matches DESC LIMIT ?";
    return await simpleQuery(query, [limit]);
}


/**
 * Totals generated from nstats_matches
 * @param {*} gametypeId 
 * @param {*} mapId 
 * @returns 
 */
async function calcBasicTotals(gametypeId, mapId){

    const query = `SELECT COUNT(*) as total_matches, MIN(date) as first_match, MAX(date) as last_match,
    SUM(playtime) as total_playtime, MAX(playtime) as longest_match, SUM(team_score_0) as team_score_0,
    SUM(team_score_1) as team_score_1,SUM(team_score_2) as team_score_2,SUM(team_score_3) as team_score_3,
    SUM(assault_caps) as assault_caps, SUM(dom_caps) as dom_caps, SUM(amp_kills) as amp_kills, 
    SUM(amp_kills_team_0) as amp_kills_team_0, SUM(amp_kills_team_1) as amp_kills_team_1,SUM(amp_kills_team_2) as amp_kills_team_2,
    SUM(amp_kills_team_3) as amp_kills_team_3 FROM nstats_matches`;

    let where = ``;
    const vars = [];

    if(gametypeId !== 0){
        where = `WHERE gametype=? AND map=?`;
        vars.push(gametypeId, mapId);
    }else{
        where = `WHERE map=?`;
        vars.push(mapId);
    }

    const result = await simpleQuery(`${query} ${where}`, vars);

    if(result[0].total_matches === 0) return null;
    return result[0];
}


/**
 * kills, multis, sprees, headshots, pickups
 */
async function calcGeneralTotals(gametypeId, mapId){

    const query = `SELECT COUNT(*) as total_rows, SUM(frags) as frags,SUM(score) as score,SUM(kills) as kills,SUM(deaths) as deaths,
    SUM(suicides) as suicides, SUM(team_kills) as team_kills, SUM(spawn_kills) as spawn_kills,
    SUM(multi_1) as multi_1,SUM(multi_2) as multi_2,SUM(multi_3) as multi_3,SUM(multi_4) as multi_4,
    SUM(multi_5) as multi_5,SUM(multi_6) as multi_6,SUM(multi_7) as multi_7,MAX(multi_best) as multi_best,
    SUM(spree_1) as spree_1,SUM(spree_2) as spree_2,SUM(spree_3) as spree_3,SUM(spree_4) as spree_4,
    SUM(spree_5) as spree_5,SUM(spree_6) as spree_6,SUM(spree_7) as spree_7,MAX(spree_best) as spree_best,
    MAX(best_spawn_kill_spree) as best_spawn_kill_spree,SUM(assault_objectives) as assault_objectives,
    SUM(dom_caps) as dom_caps,MAX(dom_caps) as dom_caps_best, MAX(dom_caps_best_life) as dom_caps_best_life,
    SUM(k_distance_normal) as k_distance_normal, SUM(k_distance_long) as k_distance_long, SUM(k_distance_uber) as k_distance_uber,
    SUM(headshots) as headshots, SUM(shield_belt) as shield_belt, SUM(amp) as amp,
    SUM(amp_time) as amp_time, SUM(invisibility) as invisibility, SUM(invisibility_time) as invisibility_time,
    SUM(pads) as pads, SUM(armor) as armor, SUM(boots) as boots, SUM(super_health) as super_health,SUM(mh_kills) as mh_kills,
    MAX(mh_kills) as mh_kills_best, MAX(mh_kills_best_life) as mh_kills_best_life,
    SUM(mh_deaths) as mh_deaths, MAX(mh_deaths) as mh_deaths_worst,
    SUM(telefrag_kills) as telefrag_kills, MAX(telefrag_kills) as telefrag_kills_best,SUM(telefrag_deaths) as telefrag_deaths, 
    MAX(telefrag_best_spree) as telefrag_best_spree,
    SUM(tele_disc_kills) as tele_disc_kills, MAX(tele_disc_kills) as tele_disc_kills_best,
    SUM(tele_disc_deaths) as tele_disc_deaths, MAX(tele_disc_best_spree) as tele_disc_best_spree FROM nstats_player_matches`;

     let where = ``;
    const vars = [];

    if(gametypeId !== 0){
        where = `WHERE gametype=? AND map_id=?`;
        vars.push(gametypeId, mapId);
    }else{
        where = `WHERE map_id=?`;
        vars.push(mapId);
    }

    const result = await simpleQuery(`${query} ${where}`, vars);

    if(result[0].total_rows === 0) return null;
    return result[0];
}

async function deleteMapTotals(gametypeId, mapId){

    const query = `DELETE FROM nstats_map_totals`;

    let where = ``;
    const vars = [];

    if(gametypeId !== 0){
        where = `WHERE gametype_id=? AND map_id=?`;
        vars.push(gametypeId, mapId);
    }else{
        where = `WHERE map_id=? AND gametype_id=0`;
        vars.push(mapId);
    }

    return await simpleQuery(`${query} ${where}`, vars);

}

export async function calculateMapTotals(gametypeId, mapId){

    gametypeId = parseInt(gametypeId);
    mapId = parseInt(mapId);

    const basicTotals = await calcBasicTotals(gametypeId, mapId);

    if(basicTotals === null){
        new Message(`calculateMapTotals basicTotals is null`,"warning");
        return;
    }

    const generalTotals = await calcGeneralTotals(gametypeId, mapId);

    if(generalTotals === null){
        new Message(`calculateMapTotals generalTotals is null`,"warning");
        return;
    }

    await deleteMapTotals(gametypeId, mapId);

    const query = `INSERT INTO nstats_map_totals VALUES(
    NULL,?,?,?,?,
    ?,?,?,?,?,?,
    ?,?,?,
    ?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?)`;

    const b = basicTotals;
    const g = generalTotals;

    const vars = [
        gametypeId, mapId, b.first_match, b.last_match,
        b.total_matches, b.total_playtime, g.frags, g.score, g.kills, g.deaths,
        g.suicides, g.team_kills, g.spawn_kills,
        g.multi_1, g.multi_2, g.multi_3, g.multi_4, g.multi_5, g.multi_6, g.multi_7, g.multi_best,
        g.spree_1, g.spree_2, g.spree_3, g.spree_4, g.spree_5, g.spree_6, g.spree_7, g.spree_best,
        g.best_spawn_kill_spree, g.assault_objectives, g.dom_caps, g.dom_caps_best, g.dom_caps_best_life,
        g.k_distance_normal, g.k_distance_long, g.k_distance_uber, g.headshots, g.shield_belt,
        g.amp, g.amp_time, g.invisibility, g.invisibility_time, g.pads, 
        g.armor, g.boots, g.super_health, g.mh_kills, g.mh_kills_best_life,
        g.mh_kills_best, g.mh_deaths, g.mh_deaths_worst, g.telefrag_kills, g.telefrag_kills_best,
        g.telefrag_deaths, g.telefrag_best_spree, g.tele_disc_kills, g.tele_disc_kills_best, g.tele_disc_deaths,
        g.tele_disc_best_spree
    ];

    return await simpleQuery(query, vars);
}


export async function getBasic(mapId){

    const query = `SELECT * FROM nstats_maps WHERE id=?`;

    const result = await simpleQuery(query, [mapId]);

    if(result.length === 0) return null;

    const image = getImages([result[0].name]);

    const keys = Object.keys(image);
    if(keys.length > 0){
        result[0].image = image[keys[0]];
    }else{
        result[0].image = "default";
    }

    return result[0];
}


export async function getSpawns(mapId){

    const query = "SELECT name,x,y,z,spawns,team FROM nstats_map_spawns WHERE map=?";
    return await simpleQuery(query, [mapId]);
}

export async function getHistoryBetween(id, start, end){

    const query = `SELECT date FROM nstats_matches WHERE map=? AND date>=? AND date<=? ORDER BY date DESC`;
    const result = await simpleQuery(query, [id, start, end]);

    return result.map((r) =>{
        return r.date;
    });
}

export async function getGraphHistoryData(id){

    const hour = 60 * 60 * 1000;
    const day = hour * 24;
    const year = day * 365;
    const now = Date.now();
    const data = await getHistoryBetween(id, toMysqlDate(new Date(now - year)), toMysqlDate(now));

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

export async function getTopPlayersPlaytime(mapId, limit){

    limit = parseInt(limit);
    if(limit !== limit) limit = 5;
    const query = `SELECT id,name,country,first,last,matches,playtime,winrate FROM nstats_player_totals WHERE map=? ORDER BY playtime DESC LIMIT ?`;

    return await simpleQuery(query, [mapId, limit]);
}

export async function getLongestMatches(mapId, limit, mapName){

    limit = cleanInt(limit, 5, 100, 5, 100);

    const query = `SELECT id,date,server,gametype,map,playtime,insta,total_teams,
    players,dm_winner,dm_score,team_score_0,team_score_1,team_score_2,team_score_3
    FROM nstats_matches WHERE map=? ORDER BY playtime DESC LIMIT ?`;

    const result = await simpleQuery(query, [mapId, limit]);

    const {servers, gametypes, maps} = getUniqueMGS(result);
    const players = new Set();

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        if(r.dm_winner === 0) continue;
        players.add(r.dm_winner);
    }


    const serverNames = await getObjectName("servers", servers);
    const gametypeNames = await getObjectName("gametypes", gametypes);
    const playerInfo = await getBasicPlayersByIds([...players]);
    const mapNames = {};
    mapNames[mapId] = mapName;

    setIdNames(result, serverNames, "server", "serverName");
    setIdNames(result, gametypeNames, "gametype", "gametypeName");
    setIdNames(result, mapNames, "map", "mapName");

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        if(r.dm_winner === 0) continue;
        r.dmWinner = getPlayer(playerInfo, r.dm_winner, true);
    }

    return result;
}


export async function getRecent(id, page, perPage, settings, mapName){

    const query = "SELECT * FROM nstats_matches WHERE map=? AND playtime>=? AND players>=? ORDER BY date DESC, id DESC LIMIT ?, ?";

    const minPlaytime = parseInt(settings["Minimum Playtime"]);
    const minPlayers = parseInt(settings["Minimum Players"]);

    page = parseInt(page);
    if(page !== page) page = 1;
    page--;

    perPage = parseInt(perPage);
    if(perPage !== perPage) perPage = 25;

    const start = page * perPage;

    const vars = [id, minPlaytime, minPlayers, start, perPage];
    
    const result = await simpleQuery(query, vars);

    const {servers, gametypes, maps} = getUniqueMGS(result);

    const dmWinners = new Set(result.map(r => r.dm_winner));

    const playersInfo = await getBasicPlayersByIds([...dmWinners]);
    const gametypeNames = await getObjectName("gametypes", gametypes);
    const serverNames = await getObjectName("servers", servers);

    setIdNames(result, serverNames, "server", "serverName");
    setIdNames(result, gametypeNames, "gametype", "gametypeName");

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        r.mapName = mapName;

        if(r.dm_winner !== 0){
            r.dmWinner = playersInfo[r.dm_winner];
        }
    }

    return result;
}

export async function getAllUploadedImages(){

    const fullSizeDir = "public/images/maps/";
    // const thumbsDir = "public/images/maps/thumbs/";

    const fullSizeImages = fs.readdirSync(fullSizeDir);
    //const thumbImages = fs.readdirSync(thumbsDir);

    return fullSizeImages;
}


/**
 * Gets total playtime from nstats_matches table and not maps table
 * @param {*} mapId 
 * @param {*} gametypeId 
 * @returns 
 */
export async function getTotalPlaytime(mapId, gametypeId){

    let query = `SELECT SUM(playtime) as playtime FROM nstats_matches WHERE map=?`;

    const vars = [mapId];

    if(gametypeId !== 0){
        vars.push(gametypeId);
        query += ` AND gametype=?`;
    }

    const result = await simpleQuery(query, vars);

    if(result.length === 0) return 0;

    return result[0].playtime;

}


async function setBasicTotals(mapId, first, last, matches, playtime){

    if(matches === 0){
        await deleteMap(mapId);
        return;
    }

    const query = `UPDATE nstats_maps SET 
    first = IF(first > ?, ?, first),
    last = IF(last < ?, ?, last),
    matches=matches+?,
    playtime=playtime+?
    WHERE id=?`;

    const vars = [first, first, last, last, matches, playtime, mapId];

    return await simpleQuery(query, vars);
}


async function insertMapTotals(gametypeId, mapId, data){


    await deleteMapTotals(gametypeId, mapId);

    const d = data;

    if(d.total_matches === 0) return;

    const query = `INSERT INTO nstats_map_totals VALUES(NULL,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,?,
    ?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,?,?,
    ?)`;

    const playtime = await getTotalPlaytime(mapId, gametypeId);

    await setBasicTotals(mapId, d.first_match, d.last_match, d.total_matches, playtime);

    const vars = [
        gametypeId, mapId,
        d.first_match, d.last_match, d.total_matches, playtime, d.frags,
        d.score, d.kills, d.deaths, d.suicides, d.team_kills, d.spawn_kills, 
        d.multi_1, d.multi_2, d.multi_3, d.multi_4, d.multi_5, d.multi_6, d.multi_7, d.multi_best,
        d.spree_1, d.spree_2, d.spree_3, d.spree_4, d.spree_5, d.spree_6, d.spree_7, d.spree_best,
        d.best_spawn_kill_spree, d.assault_objectives, d.dom_caps, d.dom_caps_best, d.dom_caps_best_life,
        d.k_distance_normal, d.k_distance_long, d.k_distance_uber, d.headshots, d.shield_belt,
        d.amp, d.amp_time, d.invisibility, d.invisibility_time, d.pads,
        d.armor, d.boots, d.super_health, d.mh_kills, d.mh_kills_best_life,
        d.mh_kills_best, d.mh_deaths, d.mh_deaths_worst, d.telefrag_kills, d.telefrag_kills_best,
        d.telefrag_deaths, d.telefrag_best_spree, d.tele_disc_kills, d.tele_disc_kills_best, d.tele_disc_deaths,
        d.tele_disc_best_spree
    ];

    return await simpleQuery(query, vars);
}

async function getTotalPlayedMatches(mapId, gametypeId){

    const query = `SELECT COUNT(*) as total_matches FROM nstats_matches WHERE map=? AND gametype=?`;

    const result = await simpleQuery(query, [mapId, gametypeId]);

    return result[0].total_matches;
}

export async function recalculateTotals(gametypeId, mapId){

    let query = `SELECT MIN(match_date) as first_match, MAX(match_date) as last_match,
    SUM(frags) as frags, SUM(score) as score, SUM(kills) as kills, SUM(deaths) as deaths,
    SUM(suicides) as suicides, SUM(team_kills) as team_kills, SUM(spawn_kills) as spawn_kills,
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
    SUM(dom_caps) as dom_caps,
    MAX(dom_caps) as dom_caps_best,
    MAX(dom_caps_best_life) as dom_caps_best_life,
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
    MAX(telefrag_kills) as telefrag_kills_best,
    SUM(telefrag_deaths) as telefrag_deaths,
    MAX(telefrag_best_spree) as telefrag_best_spree,
    SUM(tele_disc_kills) as tele_disc_kills,
    MAX(tele_disc_kills) as tele_disc_kills_best,
    SUM(tele_disc_deaths) as tele_disc_deaths,
    MAX(tele_disc_best_spree) as tele_disc_best_spree
    FROM nstats_player_matches WHERE map_id=?
    `;

    const vars = [mapId];

    if(gametypeId !== 0){
        query += ` AND gametype=? GROUP BY gametype,map_id`;
        vars.push(gametypeId);
    }
    
    const result = await simpleQuery(query, vars);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        const totalMatches = await getTotalPlayedMatches(mapId, gametypeId);

        if(totalMatches === 0){

            await deleteMapTotals(gametypeId, mapId);

            if(gametypeId === 0) await deleteMap(mapId);
            continue;
      
        }else{
            r.total_matches = totalMatches;
            await insertMapTotals(gametypeId, mapId, r);
        }
    }

    
}

async function deleteGametypeTotals(gametypeId){

    const query = `DELETE FROM nstats_map_totals WHERE gametype_id=?`;

    return await simpleQuery(query, [gametypeId]);
}

async function getMapsPlayedWithGametype(gametypeId){

    const query = `SELECT DISTINCT map FROM nstats_matches WHERE gametype=?`;

    const result = await simpleQuery(query, [gametypeId]);

    return result.map((r) =>{
        return r.map;
    });
}

export async function mergeGametypes(oldId, newId){

    await deleteGametypeTotals(oldId);

    const playedMaps = await getMapsPlayedWithGametype(newId);


    for(let i = 0; i < playedMaps.length; i++){

        const p = playedMaps[i];
        await recalculateTotals(newId, p);
    }
}