const mysql = require('./database.js');
const fs = require('fs');

class MonsterHunt{

    constructor(){

    }

    async updatePlayerMatchData(matchId, playerId, kills, bestKillsInLife, monsterDeaths){

        const query = "UPDATE nstats_player_matches SET mh_kills=?,mh_kills_best_life=?,mh_deaths=? WHERE match_id=? AND player_id=?";

        await mysql.simpleUpdate(query, [kills, bestKillsInLife, monsterDeaths, matchId, playerId]);
    }

    async updatePlayerTotals(gametypeId, playerId, kills, bestKillsInLife, monsterDeaths){

        const query = `UPDATE nstats_player_totals SET
            mh_kills=mh_kills+?,
            mh_kills_best_life = IF(mh_kills_best_life < ?, ?, mh_kills_best_life),
            mh_kills_best = IF(mh_kills_best < ?, ?, mh_kills_best),
            mh_deaths = mh_deaths + ?,
            mh_deaths_worst = IF(mh_deaths_worst < ?, ?, mh_deaths_worst)
            WHERE player_id=? AND gametype IN (0,?)`;

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
            gametypeId
        ];

        await mysql.simpleUpdate(query, vars);
    
    }

    async createNewMonsterTotals(className){

        let displayName = className;

        const classReg = /^.+\.(.+)$/i

        const result = classReg.exec(className);

        if(result !== null){
            displayName = result[1];
        }
        

        const query = "INSERT INTO nstats_monsters VALUES(NULL,?,?,0,0,0)";

        return await mysql.insertReturnInsertId(query, [className, displayName]);
    }


    async getMonsterIds(classNames){

        try{

            if(classNames.length === 0) return [];

            const returnData = {};

            for(let i = 0; i < classNames.length; i++){

                returnData[classNames[i]] = {"id": -1};
            }

            const query = "SELECT id,class_name from nstats_monsters WHERE class_name IN(?)";

            const result = await mysql.simpleFetch(query, [classNames]);

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

        await mysql.simpleUpdate(query, [deaths, kills, id]);
    }

    async insertMonsterMatchTotals(matchId, monsterId, deaths, kills){

        const query = "INSERT INTO nstats_monsters_match VALUES(NULL,?,?,?,?)";

        await mysql.simpleInsert(query, [matchId, monsterId, deaths, kills]);
    }

    async insertKill(matchId, timestamp, monsterId, killer){

        const query = "INSERT INTO nstats_monster_kills VALUES(NULL,?,?,?,?)";

        await mysql.simpleInsert(query, [matchId, timestamp, monsterId, killer]);
    }

    async insertPlayerMatchTotals(matchId, player, monster, kills, deaths){

        const query = "INSERT INTO nstats_monsters_player_match VALUES(NULL,?,?,?,?,?)";

        await mysql.simpleInsert(query, [matchId, player, monster, kills, deaths]);
    }

    async changeKillsPlayerIds(oldId, newId){

        const query = "UPDATE nstats_monster_kills SET player=? WHERE player=?";

        await mysql.simpleUpdate(query, [newId, oldId]);
    }

    async changePlayerMonsterTotalsIds(oldId, newId){

        const query = "UPDATE nstats_monsters_player_totals SET player=? WHERE player=?";

        await mysql.simpleUpdate(query, [newId, oldId]);
    }

    async changePlayerIds(oldId, newId){

       await this.changeKillsPlayerIds(oldId, newId);
       await this.mergePlayerMatchTotalKills(oldId, newId);
       await this.changePlayerMonsterTotalsIds(oldId, newId);
    }

    async getAllPlayerMatchTotals(id){

        const query = "SELECT * FROM nstats_monsters_player_match WHERE player=?";

        return await mysql.simpleFetch(query, [id]);
    }

    async mergePlayerMatchTotalKills(oldId, newId){

        const query = "UPDATE nstats_monsters_player_match SET player=? WHERE player=?";

        await mysql.simpleUpdate(query, [newId, oldId]);

    }


    async insertMergedMonsterMatchTotals(matchId, playerId, monsterId, kills, deaths){

        const query = "INSERT INTO nstats_monsters_player_match VALUES(NULL,?,?,?,?,?)";

        await mysql.simpleInsert(query, [matchId, playerId, monsterId, kills, deaths]);
    }


    async deletePlayerMatchTotals(player){

        const query = "DELETE FROM nstats_monsters_player_match WHERE player=?";

        await mysql.simpleDelete(query, [player]);
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

        return await mysql.simpleDelete(query, [id]);
    }

    async mergeTotals(data, newId){

        const newData = {};

        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

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

        await mysql.simpleInsert(query, [player, monster, matches, kills, deaths]);
    }

    async updatePlayerMonsterTotals(player, monster, kills, deaths){

        const query = "UPDATE nstats_monsters_player_totals SET kills=kills+?,deaths=deaths+?,matches=matches+1 WHERE player=? AND monster=?";

        const result = await mysql.updateReturnAffectedRows(query, [kills, deaths, player, monster]);

        if(result === 0){

            await this.insertNewPlayerMonsterTotals(player, monster, 1, kills, deaths);
        }
    }


    async deletePlayerMonsterTotals(id){

        const query = "DELETE FROM nstats_monsters_player_totals WHERE player=?";

        await mysql.simpleDelete(query, [id]);
    }

    async deletePlayerMonsterMatchTotals(id){

        const query = "DELETE FROM nstats_monsters_player_match WHERE player=?";

        await mysql.simpleDelete(query, [id]);
    }

    async deletePlayerMonsterKills(id){

        const query = "DELETE FROM nstats_monster_kills WHERE player=?";

        await mysql.simpleDelete(query, [id]);
    }

    async getPlayerMonsterTotals(id){

        const query = "SELECT monster,kills,matches,deaths FROM nstats_monsters_player_totals WHERE player=?";

        return await mysql.simpleFetch(query, [id]);
    }

    async reducePlayerMonsterTotals(player, monster, kills){

        const query = "UPDATE nstats_monsters_player_totals SET kills=kills-?,matches=matches-1 WHERE player=? AND monster=?";

        await mysql.simpleUpdate(query, [kills, player, monster]);
    }


    async reduceMonsterDeaths(monsterId, kills){

        const query = "UPDATE nstats_monsters SET deaths=deaths-? WHERE id=?";

        await mysql.simpleUpdate(query, [kills, monsterId]);
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

        return await mysql.simpleFetch(query, [matchId, playerId]);
    }

    async deletePlayerMatchKills(playerId, matchId){

        const query = "DELETE FROM nstats_monster_kills WHERE player=? AND match_id=?";

        await mysql.simpleDelete(query, [playerId, matchId]);
    }

    async deletePlayerSingleMatchTotals(playerId, matchId){

        const query = "DELETE FROM nstats_monsters_player_match WHERE match_id=? AND player=?";

        await mysql.simpleDelete(query, [matchId, playerId]);
    }

    async reduceMonsterTotals(monsterId, deaths, matches){

        const query = "UPDATE nstats_monsters SET deaths=deaths-?,matches=matches-? WHERE id=?";

        await mysql.simpleUpdate(query, [deaths, matches, monsterId]);
    }


    async reduceMonsterTotalsMatch(matchId, monsterId, deaths){

        const query = "UPDATE nstats_monsters_match SET deaths=deaths-? WHERE monster=? AND match_id=?";

        await mysql.simpleUpdate(query, [deaths, monsterId, matchId]);
    }

    async removePlayerFromMatch(playerId, matchId){

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

        return await mysql.simpleFetch(query, [id]);
    }

    async getMatchPlayerTotals(id){

        const query = "SELECT player,monster,kills FROM nstats_monsters_player_match WHERE match_id=?";

        return await mysql.simpleFetch(query, [id]);
    }

    async deleteMatchPlayerTotals(id){

        const query = "DELETE FROM nstats_monsters_player_match WHERE match_id=?";

        await mysql.simpleDelete(query, [id]);
    }

    async deleteMatchKills(id){

        const query = "DELETE FROM nstats_monster_kills WHERE match_id=?";

        await mysql.simpleDelete(query, [id]);
    }

    async deleteMatch(id){

        try{

            const monsterTotals = await this.getMatchMonsterTotals(id);

            let m = 0;

            for(let i = 0; i < monsterTotals.length; i++){

                m = monsterTotals[i];

                await this.reduceMonsterTotals(m.monster, m.deaths, 1);
            }

            const playerTotals = await this.getMatchPlayerTotals(id);

            for(let i = 0; i < playerTotals.length; i++){

                m = playerTotals[i];

                await this.reducePlayerMonsterTotals(m.player, m.monster, m.kills);
            }

            await this.deleteMatchPlayerTotals(id);
            await this.deleteMatchKills(id);

        }catch(err){
            console.trace(err);
        }
    }

    async getAllMonsters(){

        const query = "SELECT * FROM nstats_monsters ORDER BY class_name ASC";

        return await mysql.simpleFetch(query);
    }

    async getAllMonsterImages(){

        return fs.readdirSync("./public/images/monsters/");
    }

    async renameMonster(id, name){

        const query = "UPDATE nstats_monsters SET display_name=? WHERE id=?";

        await mysql.simpleUpdate(query, [name, id]);
    }


    async setMatchMonsterKills(matchId, kills){

        const query = "UPDATE nstats_matches SET mh_kills=? WHERE id=?";

        await mysql.simpleUpdate(query, [kills, matchId]);
    }


    async getPlayerMatchKillTotals(matchId){

        return mysql.simpleFetch("SELECT player,monster,kills,deaths FROM nstats_monsters_player_match WHERE match_id=?",[matchId]);
    }

    async getSinglePlayerMatchKillTotals(matchId, playerId){

        return mysql.simpleFetch("SELECT monster,kills FROM nstats_monsters_player_match WHERE match_id=? AND player=?", [matchId, playerId]);
    }


    async getMonsterNames(ids){

        if(ids.length === 0) return [];

        const result =  await mysql.simpleFetch("SELECT id,class_name,display_name FROM nstats_monsters WHERE id IN(?)",[ids]);

        const objData = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            objData[r.id] = {"className": r.class_name, "displayName": r.display_name};
        }

        return objData;
    }

    getSimilarImage(monsterNames, className){

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

    getImages(classNames){


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

        for(let i = 0; i < classNames.length; i++){

            if(currentFiles.indexOf(`${classNames[i]}.png`) !== -1){
                found[classNames[i]] = `${classNames[i]}.png`;
            }else{

                altImageIndex = this.getSimilarImage(justMonsterNames, classNames[i]);

                if(altImageIndex !== null){
                    found[classNames[i]] = currentFiles[altImageIndex];
                }else{
                    found[classNames[i]] = "default.png";
                }
            }
        }

        return found;
    }
}

module.exports = MonsterHunt;