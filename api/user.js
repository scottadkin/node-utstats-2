const mysql = require('./database');
const Promise = require('promise');
const shajs = require('sha.js');

class User{

    constructor(){

        this.minPasswordLength = 6;
        this.minUsernameLength = 2;
        this.maxUsernameLength = 20;
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

    /**
     * For registering users
     */
    bPasswordsMatch(pass1, pass2){

        if(pass1 === pass2) return true;

        return false;
    }

    bValidPassword(pass){


        if(pass.length >= this.minPasswordLength) return true;
        
        return false;
    }

    bValidUsername(username){

        if(username.length >= this.minUsernameLength) return true;

        return false;
    }

    bUserActivated(username){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_results FROM nstats_users WHERE name=? AND activated=1";

            mysql.query(query, [username], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 1){

                        if(result[0].total_results > 0){

                            resolve(true);

                        }
                    }
                }   
                resolve(false);
            });
        });
    }


    createUser(username, password){

        return new Promise((resolve, reject) =>{

            const now = Math.floor(Date.now() * 0.001);

            const passwordHash = shajs('sha256').update(password).digest('hex');

            const query = "INSERT INTO nstats_users VALUES(NULL,?,?,?,0,0)";

            mysql.query(query, [username, passwordHash, now], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async register(username, password, password2){

        try{

            let bPassed = false;

            const errors = [];

            if(!this.bValidUsername(username)) errors.push(`Username length must be between ${this.minUsernameLength} and ${this.maxUsernameLength} characters long.`);

            if(!this.bValidPassword(password)) errors.push(`Password must be at least ${this.minPasswordLength} characters long.`);
            
            if(!this.bPasswordsMatch(password, password2)) errors.push(`The password you have entered don't match.`);
            
            if(await this.bUserExists(username)){
                
                if(await this.bUserActivated(username)){
                    errors.unshift(`The username ${username} is already taken.`);
                }else{
                    errors.unshift(`The account "${username}" has already been created but needs to be activated by an admin.`);
                }
            }

            if(errors.length === 0){

                await this.createUser(username, password);

                bPassed = true;
            }


            return {"bPassed": bPassed, "errors": errors};
        }catch(err){
            console.trace(err);
        }

    }
}


module.exports = User;