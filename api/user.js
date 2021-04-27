const mysql = require('./database');
const Promise = require('promise');
const shajs = require('sha.js');
const cookie = require('cookie');

class User{

    constructor(){

        this.minPasswordLength = 6;
        this.minUsernameLength = 2;
        this.maxUsernameLength = 20;

        this.maxLoginTime = (60 * 60) * 24;
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

                    if(result.length > 0){

                        if(result[0].total_results > 0){

                            resolve(true);
                        }
                    }
                }   
                resolve(false);
            });
        });
    }


    bCorrectPassword(username, password){

        return new Promise((resolve, reject) =>{

            password = shajs("sha256").update(password).digest("hex");

            const query = "SELECT COUNT(*) as total_users FROM nstats_users WHERE name=? AND password=?";

            mysql.query(query, [username, password], (err, result) =>{

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

    getUserId(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id FROM nstats_users WHERE name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){
                        resolve(result[0].id);
                    }
                }

                resolve(null)
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
                    errors.unshift(`The username ${username} has already taken.`);
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
            return {"bPassed": false, "errors": [`Fatal: ${err}`]};
        }
    }


    async login(username, password){

        try{

            const errors = [];

            let bPassed = false;

            let hash = "";

            if(!await this.bUserExists(username)){

                errors.push(`There is no member with the username ${username}.`);

            }else{

                if(await this.bUserActivated(username)){

                    bPassed = true;

                    hash = this.createSessionHash(username);

                    const now = Math.floor(Date.now() * 0.001);
                    const expires = this.maxLoginTime;

                    if(await this.bCorrectPassword(username, password)){

                        const userId = await this.getUserId(username);

                        if(userId !== null){
                            await this.saveUserLogin(userId, hash, now, now + expires);
                        }

                    }else{
                        errors.push(`Incorrect password.`);
                    }

                }else{
                    errors.push(`The account "${username}" has been created but needs to be activated by an admin.`);
                }

            }

            return {"bPassed": bPassed, "errors": errors, "hash": hash};

        }catch(err){
            console.trace(err);
            return {"bPassed": false, "errors": [`Fatal: ${err}`]};
        }
    }


    createSessionHash(){

        let hash = "";

        const now = Date.now();

        let current = `${now * Math.random()}-${now}`;

        let r = 0;

        for(let i = 0; i < 100; i++){

            r = Math.random();

            current += `${r}`;

        }

        hash = shajs('sha256').update(current).digest("hex");

        return hash;
    }


    saveUserLogin(name, hash, date, expires){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_sessions VALUES(NULL,?,?,?,?)";

            mysql.query(query, [date, name, hash, expires], (err, result) =>{

                if(err) reject(err);


                resolve();
            });
        });
    }

    getSessionData(hash){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_sessions WHERE hash=?";

            mysql.query(query, [hash], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 0) resolve(result[0]);
                }

                resolve(null);
            });
        });
    }

    updateSessionExpire(hash){

        return new Promise((resolve, reject) =>{

            const expires = Math.floor(Date.now() * 0.001) + this.maxLoginTime;

            const query = "UPDATE nstats_sessions SET expires=? WHERE hash=?";

            mysql.query(query, [expires, hash], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deleteSession(hash){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_sessions WHERE hash=?";

            mysql.query(query, [hash], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async bLoggedIn(cookies){

        try{

            cookies = cookie.parse(cookies);

            console.log(cookies);

            if(cookies.sid !== undefined){

                const session = await this.getSessionData(cookies.sid);

                if(session !== null){

                    console.log(session);
                    //check if it has expired

                    const now = Math.floor(Date.now() * 0.001);

                    if(now > session.expires){
                        console.log("session expired");
                        await this.deleteSession(cookies.sid);
                    }else{

                        await this.updateSessionExpire(cookies.sid);

                        return true;
                    }
                }
            }

            return false;

        }catch(err){
            console.trace(err);
        }
    }
}


module.exports = User;