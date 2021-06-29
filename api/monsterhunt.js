const mysql = require('./database');

class MonsterHunt{

    constructor(){

    }

    async updatePlayerMatchData(matchId, playerId, kills, bestKillsInLife){

        const query = "UPDATE nstats_player_matches SET mh_kills=?,mh_kills_best_life=? WHERE match_id=? AND player_id=?";

        await mysql.simpleUpdate(query, [kills, bestKillsInLife, matchId, playerId]);
    }

    async updatePlayerTotals(gametypeId, playerId, kills, bestKillsInLife){

        const query = `UPDATE nstats_player_totals SET
            mh_kills=mh_kills+?,
            mh_kills_best_life = IF(mh_kills_best_life < ?, ?, mh_kills_best_life),
            mh_kills_best = IF(mh_kills_best < ?, ?, mh_kills_best)
            WHERE player_id=? AND gametype IN (0,?)`;
        
        const vars = [
            kills,
            bestKillsInLife,
            bestKillsInLife,
            kills,
            kills,
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
        

        const query = "INSERT INTO nstats_monsters VALUES(NULL,?,?,0,0)";

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

    async updateMonsterTotals(id, deaths){

        const query = "UPDATE nstats_monsters SET deaths=deaths+?,matches=matches+1 WHERE id=?";

        await mysql.simpleUpdate(query, [deaths, id]);
    }

    async insertMonsterMatchTotals(matchId, monsterId, deaths){

        const query = "INSERT INTO nstats_monsters_match VALUES(NULL,?,?,?)";

        await mysql.simpleInsert(query, [matchId, monsterId, deaths]);
    }

    async insertKill(matchId, timestamp, monsterId, killer){

        const query = "INSERT INTO nstats_monster_kills VALUES(NULL,?,?,?,?)";

        await mysql.simpleInsert(query, [matchId, timestamp, monsterId, killer]);
    }

    async insertPlayerMatchTotals(matchId, player, monster, kills){

        const query = "INSERT INTO nstats_monsters_player_match VALUES(NULL,?,?,?,?)";

        await mysql.simpleInsert(query, [matchId, player, monster, kills]);
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


    async insertMergedMonsterMatchTotals(matchId, playerId, monsterId, kills){

        const query = "INSERT INTO nstats_monsters_player_match VALUES(NULL,?,?,?,?)";

        await mysql.simpleInsert(query, [matchId, playerId, monsterId, kills]);
    }


    async deletePlayerMatchTotals(player){

        const query = "DELETE FROM nstats_monsters_player_match WHERE player=?";

        await mysql.simpleDelete(query, [player]);
    }


    async mergePlayersMatchTotals(matchTotals, newId){

        const newTotals = {};

        let m = 0;

        for(let i = 0; i < matchTotals.length; i++){

            m = matchTotals[i];

            if(newTotals[m.match_id] === undefined){

                newTotals[m.match_id] = {
                    "player": newId,
                    "monsters": {},
                }
            }

            if(newTotals[m.match_id].monsters[m.monster] === undefined){

                newTotals[m.match_id].monsters[m.monster] = {"kills": 0};
            }

            newTotals[m.match_id].monsters[m.monster].kills += m.kills;
        }

        await this.deletePlayerMatchTotals(newId);

        for(const [match, data] of Object.entries(newTotals)){

            for(const [monsterList, monster] of Object.entries(data)){

                for(const [monsterId, kills] of Object.entries(monster)){

                    await this.insertMergedMonsterMatchTotals(match, newId, monsterId, kills.kills);
                }
            }
        }
    }

    async getPlayerMonsterTotals(id){

        const query = "SELECT monster,matches,kills FROM nstats_monsters_player_totals WHERE player=?";

        return await mysql.simpleFetch(query, [id]);
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
                    "matches": 0
                };
            }

            newData[d.monster].kills += d.kills;
            newData[d.monster].matches += d.matches;

        }


        await this.deletePlayerMonsterTotals(newId);


        for(const [monster, stats] of Object.entries(newData)){

            await this.insertNewPlayerMonsterTotals(newId, monster, stats.matches, stats.kills);
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


    async insertNewPlayerMonsterTotals(player, monster, kills, matches){

        if(matches === undefined) matches = 1;

        const query = "INSERT INTO nstats_monsters_player_totals VALUES(NULL,?,?,?,?)";

        await mysql.simpleInsert(query, [player, monster, matches, kills]);
    }

    async updatePlayerMonsterTotals(player, monster, kills){

        const query = "UPDATE nstats_monsters_player_totals SET kills=kills+?,matches=matches+1 WHERE player=? AND monster=?";

        const result = await mysql.updateReturnAffectedRows(query, [kills, player, monster]);

        if(result === 0){

            await this.insertNewPlayerMonsterTotals(player, monster, kills);
        }
    }

}

module.exports = MonsterHunt;