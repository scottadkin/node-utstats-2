import { simpleQuery, insertReturnInsertId, updateReturnAffectedRows, bulkInsert } from "./database.js";
import fs from "fs";
import { getObjectName } from "./genericServerSide.mjs";

export default class MonsterHunt{

    constructor(){

    }

    async updatePlayerMatchData(matchId, playerId, kills, bestKillsInLife, monsterDeaths){

        const query = "UPDATE nstats_player_matches SET mh_kills=?,mh_kills_best_life=?,mh_deaths=? WHERE match_id=? AND player_id=?";

        await simpleQuery(query, [kills, bestKillsInLife, monsterDeaths, matchId, playerId]);
    }

    async updatePlayerTotals(gametypeId, playerId, kills, bestKillsInLife, monsterDeaths){

        const query = `UPDATE nstats_player_totals SET
            mh_kills=mh_kills+?,
            mh_kills_best_life = IF(mh_kills_best_life < ?, ?, mh_kills_best_life),
            mh_kills_best = IF(mh_kills_best < ?, ?, mh_kills_best),
            mh_deaths = mh_deaths + ?,
            mh_deaths_worst = IF(mh_deaths_worst < ?, ?, mh_deaths_worst)
            WHERE (player_id=? OR id=?) AND gametype IN (0,?) AND map=0`;

        const vars = [
            kills,
            bestKillsInLife,
            bestKillsInLife,
            kills,
            kills,
            monsterDeaths,
            monsterDeaths,
            monsterDeaths,
            playerId,
            playerId,
            gametypeId
        ];

        await simpleQuery(query, vars);
    
    }

    async createNewMonsterTotals(className){

        let displayName = className;

        const classReg = /^.+\.(.+)$/i

        const result = classReg.exec(className);

        if(result !== null){
            displayName = result[1];
        }
        

        const query = "INSERT INTO nstats_monsters VALUES(NULL,?,?,0,0,0)";

        return await insertReturnInsertId(query, [className, displayName]);
    }


    async getMonsterIds(classNames){

        try{

            if(classNames.length === 0) return [];

            const returnData = {};

            for(let i = 0; i < classNames.length; i++){

                returnData[classNames[i]] = {"id": -1};
            }

            const query = "SELECT id,class_name from nstats_monsters WHERE class_name IN(?)";

            const result = await simpleQuery(query, [classNames]);

            const getId = (className) =>{

                for(let i = 0; i < result.length; i++){

                    if(result[i].class_name === className){
                        return result[i].id;
                    }
                }

                return null;
            }


            let currentId = 0;
            let createdId = 0;

            for(const [key, value] of Object.entries(returnData)){

                currentId = getId(key);

                if(currentId === null){

                    createdId = await this.createNewMonsterTotals(key);

                    returnData[key].id = createdId;

                }else{

                    returnData[key].id = currentId;
                }

            }

            
            return returnData;
           

        }catch(err){

            console.trace(err);
        }


    }

    async updateMonsterTotals(id, deaths, kills){

        const query = "UPDATE nstats_monsters SET deaths=deaths+?,matches=matches+1,kills=kills+? WHERE id=?";

        await simpleQuery(query, [deaths, kills, id]);
    }

    async insertMonsterMatchTotals(matchId, monsterId, deaths, kills){

        const query = "INSERT INTO nstats_monsters_match VALUES(NULL,?,?,?,?)";

        await simpleQuery(query, [matchId, monsterId, deaths, kills]);
    }

    async insertKill(matchId, timestamp, monsterId, killer){

        const query = "INSERT INTO nstats_monster_kills VALUES(NULL,?,?,?,?)";

        await simpleQuery(query, [matchId, timestamp, monsterId, killer]);
    }

    async insertPlayerMatchTotals(matchId, player, monster, kills, deaths){

        const query = "INSERT INTO nstats_monsters_player_match VALUES(NULL,?,?,?,?,?)";

        await simpleQuery(query, [matchId, player, monster, kills, deaths]);
    }

    async changeKillsPlayerIds(oldId, newId){

        const query = "UPDATE nstats_monster_kills SET player=? WHERE player=?";

        await simpleQuery(query, [newId, oldId]);
    }

    async changePlayerMonsterTotalsIds(oldId, newId){

        const query = "UPDATE nstats_monsters_player_totals SET player=? WHERE player=?";

        await simpleQuery(query, [newId, oldId]);
    }

    async changePlayerIds(oldId, newId){

       await this.changeKillsPlayerIds(oldId, newId);
       await this.mergePlayerMatchTotalKills(oldId, newId);
       await this.changePlayerMonsterTotalsIds(oldId, newId);
    }

    async getAllPlayerMatchTotals(id){

        const query = "SELECT * FROM nstats_monsters_player_match WHERE player=?";

        return await simpleQuery(query, [id]);
    }

    async mergePlayerMatchTotalKills(oldId, newId){

        const query = "UPDATE nstats_monsters_player_match SET player=? WHERE player=?";

        await simpleQuery(query, [newId, oldId]);

    }


    async insertMergedMonsterMatchTotals(matchId, playerId, monsterId, kills, deaths){

        const query = "INSERT INTO nstats_monsters_player_match VALUES(NULL,?,?,?,?,?)";

        await simpleQuery(query, [matchId, playerId, monsterId, kills, deaths]);
    }


    async deletePlayerMatchTotals(player){

        const query = "DELETE FROM nstats_monsters_player_match WHERE player=?";

        await simpleQuery(query, [player]);
    }


    async mergePlayersMatchTotals(matchTotals, newId){

        const newTotals = {};


        for(let i = 0; i < matchTotals.length; i++){

            const m = matchTotals[i];

            if(newTotals[m.match_id] === undefined){

                newTotals[m.match_id] = {
                    "player": newId,
                    "monsters": {},
                }
            }

            if(newTotals[m.match_id].monsters[m.monster] === undefined){

                newTotals[m.match_id].monsters[m.monster] = {"kills": 0, "deaths": 0};
            }

            newTotals[m.match_id].monsters[m.monster].kills += m.kills;
            newTotals[m.match_id].monsters[m.monster].deaths += m.deaths;
        }

        await this.deletePlayerMatchTotals(newId);

        for(const [match, data] of Object.entries(newTotals)){

            for(const [monsterList, monster] of Object.entries(data)){

                for(const [monsterId, kills] of Object.entries(monster)){

                    await this.insertMergedMonsterMatchTotals(match, newId, monsterId, kills.kills, kills.deaths);
                }
            }
        }
    }

    async deletePlayerMonsterTotals(id){

        const query = "DELETE FROM nstats_monsters_player_totals WHERE player=?";

        return await simpleQuery(query, [id]);
    }

    async mergeTotals(data, newId){

        const newData = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(newData[d.monster] === undefined){

                newData[d.monster] = {
                    "kills": 0,
                    "matches": 0,
                    "deaths": 0
                };
            }

            newData[d.monster].kills += d.kills;
            newData[d.monster].deaths += d.deaths;
            newData[d.monster].matches += d.matches;

        }


        await this.deletePlayerMonsterTotals(newId);


        for(const [monster, stats] of Object.entries(newData)){

            await this.insertNewPlayerMonsterTotals(newId, monster, stats.matches, stats.kills, stats.deaths);
        }

    }

    async mergePlayers(oldId, newId){

        try{

            await this.changePlayerIds(oldId, newId);

    
            const matchTotals = await this.getAllPlayerMatchTotals(newId);

            await this.mergePlayersMatchTotals(matchTotals, newId);

            const playerTotals = await this.getPlayerMonsterTotals(newId);


            await this.mergeTotals(playerTotals, newId);

        }catch(err){
            console.trace(err);
        }
    }

    //newId, monster, stats.matches, stats.kills, stats.deaths

    async insertNewPlayerMonsterTotals(player, monster, matches, kills, deaths){

        if(matches === undefined) matches = 1;

        const query = "INSERT INTO nstats_monsters_player_totals VALUES(NULL,?,?,?,?,?)";

        await simpleQuery(query, [player, monster, matches, kills, deaths]);
    }

    async updatePlayerMonsterTotals(player, monster, kills, deaths){

        const query = "UPDATE nstats_monsters_player_totals SET kills=kills+?,deaths=deaths+?,matches=matches+1 WHERE player=? AND monster=?";

        const result = await updateReturnAffectedRows(query, [kills, deaths, player, monster]);

        if(result === 0){

            await this.insertNewPlayerMonsterTotals(player, monster, 1, kills, deaths);
        }
    }


    async deletePlayerMonsterTotals(id){

        const query = "DELETE FROM nstats_monsters_player_totals WHERE player=?";

        await simpleQuery(query, [id]);
    }

    async deletePlayerMonsterMatchTotals(id){

        const query = "DELETE FROM nstats_monsters_player_match WHERE player=?";

        await simpleQuery(query, [id]);
    }

    async deletePlayerMonsterKills(id){

        const query = "DELETE FROM nstats_monster_kills WHERE player=?";

        await simpleQuery(query, [id]);
    }

    async getPlayerMonsterTotals(id){

        return await getPlayerMonsterTotals(id);
    }



    async deletePlayer(id){

        try{

            const monsterKillTotals = await this.getPlayerMonsterTotals(id);

            let m = 0;

            for(let i = 0; i < monsterKillTotals.length; i++){

                m = monsterKillTotals[i];

                await this.reduceMonsterDeaths(m.monster, m.kills);
                
            }

            await this.deletePlayerMonsterTotals(id);
            await this.deletePlayerMonsterMatchTotals(id);
            await this.deletePlayerMonsterKills(id);

            return true;

        }catch(err){
            console.trace(err);
            return false;
        }
    }


    async getPlayerMatchTotals(playerId, matchId){

        const query = "SELECT * FROM nstats_monsters_player_match WHERE match_id=? AND player=?";

        return await simpleQuery(query, [matchId, playerId]);
    }

    async deletePlayerMatchKills(playerId, matchId){

        const query = "DELETE FROM nstats_monster_kills WHERE player=? AND match_id=?";

        await simpleQuery(query, [playerId, matchId]);
    }

    async deletePlayerSingleMatchTotals(playerId, matchId){

        const query = "DELETE FROM nstats_monsters_player_match WHERE match_id=? AND player=?";

        await simpleQuery(query, [matchId, playerId]);
    }

    async reduceMonsterTotals(monsterId, deaths, matches){

        const query = "UPDATE nstats_monsters SET deaths=deaths-?,matches=matches-? WHERE id=?";

        await simpleQuery(query, [deaths, matches, monsterId]);
    }


    async reduceMonsterTotalsMatch(matchId, monsterId, deaths){

        const query = "UPDATE nstats_monsters_match SET deaths=deaths-? WHERE monster=? AND match_id=?";

        await simpleQuery(query, [deaths, monsterId, matchId]);
    }

    async removePlayerFromMatch(playerId, matchId){
        throw new Error(`rewrite mh.removePlayerFromMatch`);
        try{


            const playerMatchData = await this.getPlayerMatchTotals(playerId, matchId);

            await this.deletePlayerMatchKills(playerId, matchId);
            await this.deletePlayerSingleMatchTotals(playerId, matchId);

            let p = 0;

            for(let i = 0; i < playerMatchData.length; i++){

                p = playerMatchData[i];

                await this.reduceMonsterTotals(p.monster, p.kills, 1);
                await this.reduceMonsterTotalsMatch(matchId, p.monster, p.kills);
                await this.reducePlayerMonsterTotals(playerId, p.monster, p.kills);
            }

        }catch(err){
            console.trace(err);
        }
    }


    async getMatchMonsterTotals(id){

        const query = "SELECT monster,deaths,kills FROM nstats_monsters_match WHERE match_id=?";

        return await simpleQuery(query, [id]);
    }

    async getMatchPlayerTotals(id){

        const query = "SELECT player,monster,kills FROM nstats_monsters_player_match WHERE match_id=?";

        return await simpleQuery(query, [id]);
    }

    async getAllMonsters(){

        const query = "SELECT * FROM nstats_monsters ORDER BY class_name ASC";

        return await simpleQuery(query);
    }

    async getAllMonsterImages(){

        return fs.readdirSync("./public/images/monsters/");
    }

    async renameMonster(id, name){

        const query = "UPDATE nstats_monsters SET display_name=? WHERE id=?";

        await simpleQuery(query, [name, id]);
    }


    async setMatchMonsterKills(matchId, kills){

        const query = "UPDATE nstats_matches SET mh_kills=? WHERE id=?";

        await simpleQuery(query, [kills, matchId]);
    }


    async getPlayerMatchKillTotals(matchId){

        return simpleQuery("SELECT player,monster,kills,deaths FROM nstats_monsters_player_match WHERE match_id=?",[matchId]);
    }

    async getSinglePlayerMatchKillTotals(matchId, playerId){

        return simpleQuery("SELECT monster,kills FROM nstats_monsters_player_match WHERE match_id=? AND player=?", [matchId, playerId]);
    }


    async getMonsterNames(ids){

        if(ids.length === 0) return [];

        const result =  await simpleQuery("SELECT id,class_name,display_name FROM nstats_monsters WHERE id IN(?)",[ids]);

        const objData = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            objData[r.id] = {"className": r.class_name, "displayName": r.display_name};
        }

        return objData;
    }

    getSimilarImage(monsterNames, className){

        return getSimilarImage(monsterNames, className);
    }

    getImages(classNames){


        return getImages(classNames);
    }
}


export function getSimilarImage(monsterNames, className){

    const reg = /^.+\.(.+)$/i;
    const result = reg.exec(className);

    if(result !== null){
        
        const name = result[1].toLowerCase();

        for(let i = 0; i < monsterNames.length; i++){

            if(name.includes(monsterNames[i])){
                return i;
            }
        }
    }

    return null;
    
}

export function getImages(targetMonsters){


    if(targetMonsters.length === 0) return {};

    const currentFiles = fs.readdirSync("./public/images/monsters");

    const justMonsterNames = [];

    const reg = /^.+?\.(.+)\.png$/i;
    let result = 0;

    for(let i = 0; i < currentFiles.length; i++){

        result = reg.exec(currentFiles[i]);

        if(result === null){
            justMonsterNames.push("default");
        }else{
            justMonsterNames.push(result[1]);
        }
        // cleanedImageNames.push(result[1]);
    }


    const found = {};

    let altImageIndex = 0;

    for(const monster of Object.values(targetMonsters)){

         if(currentFiles.indexOf(`${monster.class_name}.png`) !== -1){
            found[monster.class_name] = `${monster.class_name}.png`;
        }else{

            altImageIndex = getSimilarImage(justMonsterNames, monster);

            if(altImageIndex !== null){
                found[monster.class_name] = currentFiles[altImageIndex];
            }else{
                found[monster.class_name] = "default.png";
            }
        }
    }

    return found;
}


export async function getPlayerMonsterTotals(id){

    const query = "SELECT monster,kills,matches,deaths FROM nstats_monsters_player_totals WHERE player=?";

    return await simpleQuery(query, [id]);
}

export async function getMonstersByIds(ids){

    if(ids.length === 0) return {};

    const query = `SELECT * FROM nstats_monsters WHERE id IN(?)`;

    const result = await simpleQuery(query, [ids]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        data[r.id] = r;
    }

    return data;
}

export async function getPlayerProfileMonsters(playerId){

    const playerMonsterTotals = await getPlayerMonsterTotals(playerId);

    const monsterIds = new Set(playerMonsterTotals.map((p) =>{
        return p.monster;
    }));

    const monsters = await getMonstersByIds([...monsterIds]);

    const images = getImages(monsters);


    for(let i = 0; i < playerMonsterTotals.length; i++){

        const p = playerMonsterTotals[i];

        p.name = monsters?.[p.monster]?.display_name ?? "NOT FOUND";

        if(monsters[p.monster] !== undefined){
            p.image = images[monsters[p.monster].class_name];
        }   
    }

    return playerMonsterTotals;

}


async function deleteMatchMonsters(matchId){

    const query = `DELETE FROM nstats_monsters_match WHERE match_id=?`;
    return await simpleQuery(query, [matchId]);
}

async function deleteMatchPlayerMonsters(matchId){

    const query = `DELETE FROM nstats_monsters_player_match WHERE match_id=?`;
    return await simpleQuery(query, [matchId]);
}

async function deleteMatchMonsterKills(matchId){
    
    const query = `DELETE FROM nstats_monster_kills WHERE match_id=?`;
    return await simpleQuery(query, [matchId]);
}

async function getMonsterIdsFromMatch(matchId){

    const query = `SELECT DISTINCT monster FROM nstats_monsters_match WHERE match_id=? AND monster>0`;

    const result = await simpleQuery(query, [matchId]);

    return result.map((r) =>{
        return r.monster;
    });
}

async function deleteSelectedMonsterTotals(monsterIds){

    const query = `DELETE FROM nstats_monsters WHERE id IN (?)`;
    return await simpleQuery(query, [monsterIds]);
}

async function setMonsterTotals(monsterId, kills, deaths){

    const query = `UPDATE nstats_monsters SET kills=?,deaths=? WHERE id=?`;

    return await simpleQuery(query, [kills, deaths, monsterId]);
}

//get totals from players table because i didnt save deaths by monster anywhere else...
//deaths = times a monster killed a player
//kills = times a player killed a monster
async function recalculateSelectedMonsterTotals(monsterIds){

    if(monsterIds.length === 0) return;

    //await deleteSelectedMonsterTotals(monsterIds);

    const query = `SELECT 
    CAST(SUM(kills) AS UNSIGNED) as kills, 
    CAST(SUM(deaths) AS UNSIGNED) as deaths,
    monster 
    FROM nstats_monsters_player_match WHERE monster IN (?) GROUP BY monster`;

    const result = await simpleQuery(query, [monsterIds]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        //kills and deaths are not the WRONG way around
        //r.deaths is player deaths to monster not monster deaths
        await setMonsterTotals(r.monster, r.deaths, r.kills);
    }
}

async function deletePlayerMonsterTotals(playerIds, monsterIds){

    const query = `DELETE FROM nstats_monsters_player_totals WHERE player IN(?) AND monster IN(?)`;

    return await simpleQuery(query, [playerIds, monsterIds]);
}

async function bulkInsertPlayerMonsterTotals(data){

    const query = `INSERT INTO nstats_monsters_player_totals (player,monster,matches,kills,deaths) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        insertVars.push([
            d.player, d.monster, d.total_matches,d.kills,d.deaths
        ]);
    }

    return await bulkInsert(query, insertVars);
}

async function recalculatePlayerMonsterTotals(monsterIds, playerIds){

    if(monsterIds.length === 0 || playerIds.length === 0) return;

    const query = `SELECT player,monster,
    COUNT(*) as total_matches,
    CAST(SUM(kills) AS UNSIGNED) as kills, 
    CAST(SUM(deaths) AS UNSIGNED) as deaths
    FROM nstats_monsters_player_match WHERE player IN(?) AND monster IN(?) GROUP BY player,monster`;

    const result = await simpleQuery(query, [playerIds, monsterIds]);

    await deletePlayerMonsterTotals(playerIds, monsterIds);


    await bulkInsertPlayerMonsterTotals(result);
}

export async function deleteMatchData(matchId, playerIds){

    const affectedMonsters = await getMonsterIdsFromMatch(matchId);
    await deleteMatchMonsters(matchId);
    await deleteMatchPlayerMonsters(matchId);
    await deleteMatchMonsterKills(matchId);

    await recalculatePlayerMonsterTotals(affectedMonsters, playerIds);
    await recalculateSelectedMonsterTotals(affectedMonsters);
    //TODO create nstats_monsters_deaths table and save each time a player dies to a monster
}


export async function deletePlayerData(playerId){

    //nstats_monsters_player_match player
    //nstats_monsters_player_totals player recalc totals
    //nstats_monster_kills player

    const tables = ["monsters_player_match", "monsters_player_totals", "monster_kills"];

    for(let i = 0; i < tables.length; i++){

        const t = tables[i];

        const query = `DELETE FROM nstats_${t} WHERE player=?`;
        await simpleQuery(query, [playerId]);
    }
}


async function getPlayerMatchInteractedMonsters(playerId, matchId){

    const query = `SELECT DISTINCT monster FROM nstats_monsters_player_match WHERE match_id=? AND player=?`;

    const result = await simpleQuery(query, [matchId, playerId]);

    return result.map((r) =>{
        return r.monster;
    });
}

export async function deletePlayerFromMatch(playerId, matchId){

    const monsterIds = await getPlayerMatchInteractedMonsters(playerId, matchId);

    const tables = [`nstats_monster_kills`, `nstats_monsters_player_match`];

    for(let i = 0; i < tables.length; i++){

        const t = tables[i];

        await simpleQuery(`DELETE FROM ${t} WHERE player=? AND match_id=?`, [playerId, matchId]);
    }

    await recalculatePlayerMonsterTotals(monsterIds, [playerId]);
    await recalculateSelectedMonsterTotals(monsterIds);
    
}