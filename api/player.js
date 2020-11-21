const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

class Player{

    constructor(){

    }



    getNameIdQuery(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id FROM nstats_player_totals WHERE name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result[0] === undefined){
                    resolve(-1);
                }else{
                    resolve(result[0].id);
                }
            });
        });
    }

    createNameIdQuery(name){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_player_totals VALUES(NULL,?,0,0,0,0,0,0,0,0,0,0)";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                resolve(result.insertId);
            });
        });
    }

    /**
     * 
     * @param name 
     * @param bCreate Create name id if it doesnt exist
     */
    async getNameId(name, bCreate){

        const id = await this.getNameIdQuery(name);

        if(bCreate === undefined || id !== -1){
            return id;
        }
        
        return await this.createNameIdQuery(name);
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

    updateFrags(id, playtime, frags, score, kills, deaths, suicides, teamKills){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET matches=matches+1, playtime=playtime+?, 
            frags=frags+?, score=score+?, kills=kills+?, deaths=deaths+?, suicides=suicides+?, team_kills=team_kills+? WHERE id=?`;

            const vars = [playtime, frags, score, kills, deaths, suicides, teamKills, id];


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