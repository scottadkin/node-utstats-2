const mysql = require('./database');
const Promise = require('promise');
const shajs = require('sha.js');

class User{

    constructor(){

    }


    bUserExists(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_users FROM nstats_users WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 0){

                        if(result[0].total_users > 0){
                            resolve(true);
                        }
                    }
                }

                resolve(false);
            });
        });
    }
}


module.exports = User;