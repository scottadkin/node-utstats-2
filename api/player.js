const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

class Player{

    constructor(){

    }



    getNameIdQuery(name, gametypeId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,gametype FROM nstats_player_totals WHERE name=? AND gametype=?";

            if(gametypeId === undefined){
                gametypeId = 0;
            }
            mysql.query(query, [name, gametypeId], (err, result) =>{

                if(err) reject(err);

                if(result[0] === undefined){
                    resolve(null);
                }else{

                   // console.log(`---------`);
                   // console.log(result);
                  //  console.log(`|||||||||`);
                    resolve(result);

                }
            });
        });
    }

    createNameIdQuery(name, gametype){

        return new Promise((resolve, reject) =>{

            if(gametype === undefined){
                gametype = 0;
            }

            const query = "INSERT INTO nstats_player_totals VALUES(NULL,?,'','','',?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)";

            mysql.query(query, [name, gametype], (err, result) =>{

                if(err) reject(err);

                resolve([{"id": result.insertId, "gametype": gametype}]);
            });
        });
    }

 
    async getNameId(name, gametype, bCreate){

        let id = await this.getNameIdQuery(name, 0);
        let idGametype = await this.getNameIdQuery(name, gametype);

        if(bCreate === undefined){
            return {"totalId": id[0].gametype, "gametypeId": idGametype[0].gametype};
        }

     
        if(id === null){
            id = await this.createNameIdQuery(name);
        }

        if(idGametype === null){
            idGametype = await this.createNameIdQuery(name, gametype);
        }


        return {"totalId": id[0].id, "gametypeId": idGametype[0].id};
    }

    updateEfficiency(id){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET efficiency = (kills / (deaths + kills)) * 100 WHERE id=?`;

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateFrags(id, playtime, frags, score, kills, deaths, suicides, teamKills, spawnKills,
        multis, bestMulti, sprees, bestSpree,
        gametype){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET matches=matches+1, playtime=playtime+?, 
            frags=frags+?, score=score+?, kills=kills+?, deaths=deaths+?, suicides=suicides+?, 
            team_kills=team_kills+?, spawn_Kills=spawn_kills+?,
            multi_1 = multi_1+?, multi_2 = multi_2+?, multi_3 = multi_3+?, multi_4 = multi_4+?,
            multi_5 = multi_5+?, multi_6 = multi_6+?, multi_7 = multi_7+?,
            multi_best = IF(multi_best < ?, ?, multi_best),
            spree_1 = spree_1+?, spree_2 = spree_2+?, spree_3 = spree_3+?, spree_4 = spree_4+?,
            spree_5 = spree_5+?, spree_6 = spree_6+?, spree_7 = spree_7+?,
            spree_best = IF(spree_best < ?, ?, spree_best)
            WHERE id=? AND gametype=?`;

            const vars = [
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
                id,
                gametype
            ];


            mysql.query(query, vars, async (err) =>{

                if(err) reject(err);

                try{
                    await this.updateEfficiency(id);
                }catch(err){
                    new Message(err, 'warning');
                }

                resolve();
            });
        });
    }

}

module.exports = Player;