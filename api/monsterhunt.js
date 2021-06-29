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

}

module.exports = MonsterHunt;