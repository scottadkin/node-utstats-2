const mysql = require('./database');
const Promise = require('promise');
const shajs = require('sha.js');
const cookie = require('cookie');
const Functions  = require('./functions');
const salt = require('../salt');
const Message = require('./message');

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

            password = shajs("sha256").update(`${salt()}${password}`).digest("hex");

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

    async getTotalUsers(){

        try{
            const result = await mysql.simpleFetch("SELECT COUNT(*) as total_users FROM nstats_users");

            return result[0].total_users;

        }catch(err){
            console.trace(err);

            return 9999;
        }
        
    }

    async createUser(username, password, ip){

        try{

            const totalUsers = await this.getTotalUsers();
          

            const now = Math.floor(Date.now() * 0.001);

            const passwordHash = shajs('sha256').update(`${salt()}${password}`).digest('hex');

            let query = "INSERT INTO nstats_users VALUES(NULL,?,?,?,0,0,0,0,0,?,0,0)";

            //if there are no uses already set account as admin and auto activate it
            if(totalUsers === 0){
                query = "INSERT INTO nstats_users VALUES(NULL,?,?,?,1,0,1,0,0,?,0,0)";
            }

            const vars = [username, passwordHash, now, ip];

            await mysql.simpleInsert(query, vars);

            return totalUsers;

        }catch(err){
            console.trace(err);
        }
    }

    async register(username, password, password2, ip){

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

                const totalUsers = await this.createUser(username, password, ip);

                if(totalUsers === 0){

                    const loginResult = await this.login(username, password, ip);

                    if(loginResult.bPassed){
                        return {"bPassed": true, "errors": [], "bAutoLogin": true};
                    }

                }

                bPassed = true;
                return {"bPassed": bPassed, "errors": errors};
            }

            return {"bPassed": false, "errors": errors};
            
        }catch(err){
            console.trace(err);
            return {"bPassed": false, "errors": [`Fatal: ${err}`]};
        }
    }


    async login(username, password, ip){


        try{

            new Message("New login attempt", "note");

            const errors = [];

            let bPassed = false;

            let hash = "";
            if(!await this.bUserExists(username)){

                errors.push(`There is no member with the username ${username}.`);

            }else{

                if(await this.bUserActivated(username)){

                    bPassed = true;

                    const now = Math.floor(Date.now() * 0.001);
                    const expires = this.maxLoginTime;

                    if(await this.bCorrectPassword(username, password)){

                        const userId = await this.getUserId(username);

                        const bBanned = await this.bBanned(userId);

                        if(!bBanned){

                            if(userId !== null){
                                hash = this.createSessionHash(username);
                                await this.saveUserLogin(userId, hash, now, now + expires, ip);
                                await this.updateLastLogin(userId);
                            }

                        }else{
                            errors.push(`This account has been banned.`);
                        }

                    }else{
                        errors.push(`Incorrect password.`);
                    }

                }else{
                    errors.push(`The account "${username}" has been created but needs to be activated by an admin.`);
                }

            }

            console.table(errors);

            return {"bPassed": bPassed, "errors": errors, "hash": hash};

        }catch(err){
            console.trace(err);
            return {"bPassed": false, "errors": [`Fatal: ${err}`], "hash": ""};
        }
    }


    createSessionHash(){

        let hash = "";

        const now = Date.now();

        
        const string = Functions.generateRandomString(100);

        hash = shajs('sha256').update(string).digest("hex");

        return hash;
    }


    saveUserLogin(name, hash, date, expires, ip){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_sessions VALUES(NULL,?,?,?,?,?,?)";

            const now = Math.floor(Date.now() * 0.001);
            mysql.query(query, [date, name, hash, now, expires, ip], (err) =>{

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

    updateLastActive(user, ip){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_users SET last_active=?,last_ip=? WHERE id=?";

            const now = Math.floor(Date.now() * 0.001);

            mysql.query(query, [now, ip, user], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateLastLogin(user){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_users SET last_login=?,logins=logins+1 WHERE id=?";

            const now = Math.floor(Date.now() * 0.001);

            mysql.query(query, [now, user], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    bUserActivatedById(userId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as activated_accounts FROM nstats_users WHERE id=? AND activated=1";
            mysql.query(query, [userId], (err, result) =>{

                if(err) reject(err);
                
                if(result !== undefined){

                    if(result.length > 0){

                        if(result[0].activated_accounts > 0){
                            resolve(true);
                        }
                    }
                }

                resolve(false);
            });

        });
    }

    async bLoggedIn(cookies, ip){

        try{

            if(cookies === undefined) return false;
            
            cookies = cookie.parse(cookies);

            let sid = -1;

            //[connect.sid] for bug (piter ut99.org)
            if(cookies.sid !== undefined) sid = cookies.sid;
            if(cookies['connect.sid'] !== undefined) sid = cookies['connect.sid'];

            if(sid !== -1){
     
                const session = await this.getSessionData(sid);

                if(session !== null){

                    const now = Math.floor(Date.now() * 0.001);

                    const bActivated = await this.bUserActivatedById(session.user);

                    const bBanned = await this.bBanned(session.user);

                    if(!bActivated){
                        await this.deleteSession(sid);
                        return false;
                    }

                    if(bBanned){
                        await this.deleteSession(sid);
                        return false;
                    }

                    await this.deleteExpiredSessions();

                    if(now > session.expires){
                        console.log("session expired");
                        //await this.deleteSession(cookies.sid);
                    }else{

                        await this.updateSessionExpire(sid);
                        //await this.updateLastActive();

                        await this.updateLastActive(session.user, ip);

                        return true;
                    }
                }else{
                    new Message(`bLoggedIn() session is null`,"warning");
                }
            }

            return false;

        }catch(err){
            console.trace(err);
            return false;
        }
    }

    bAdmin(user){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_users FROM nstats_users WHERE id=? AND admin=1";

            mysql.query(query, [user], (err, result) =>{

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


    adminGetAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,joined,activated,logins,admin,last_login,last_active,last_ip,banned,upload_images FROM nstats_users ORDER BY name ASC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    activateAccount(id){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_users SET activated=1 WHERE id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
    

    bBanned(userId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_users FROM nstats_users WHERE id=? AND banned=0";

            mysql.query(query, [userId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){

                        if(result[0].total_users > 0) resolve(false);
                    }
                }

                resolve(true);
            });
        });
    }

    changeAdminPermission(id, value){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_users SET admin=? WHERE id=?";

            mysql.query(query, [value, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    changeImagesPermission(id, value){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_users SET upload_images=? WHERE id=?";

            mysql.query(query, [value, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    bUploadImages(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_users FROM nstats_users WHERE id=? AND upload_images=1";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 0){

                        if(result[0].total_users > 0) resolve(true);
                    }
                }

                resolve(false);
            });
        });
    }

    changeBanValue(id, value){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_users SET banned=? WHERE id=?";

            mysql.query(query, [value, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    async deleteExpiredSessions(){

        const now = Math.floor(Date.now() * 0.001) + 1;
        return await mysql.simpleDelete("DELETE FROM nstats_sessions WHERE expires < ?", [now]);
    }
}


module.exports = User;