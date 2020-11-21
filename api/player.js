const mysql = require('./database');
const Promise = require('promise');

class Player{

    constructor(){

    }



    getNameIdQuery(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id FROM nstats_player_names WHERE name=? LIMIT 1";

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

            const query = "INSERT INTO nstats_player_names VALUES(NULL,?)";

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

}

module.exports = Player;