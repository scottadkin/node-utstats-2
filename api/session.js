const mysql = require('./database');
const Promise = require('promise');
const User = require('./user');
const cookie = require('cookie');

class Session{

    constructor(cookies){

        this.user = new User();
        this.rawCookies = cookies;
        this.cookies = cookie.parse(cookies);

        this.settings = {};

        console.log("session.cookies");
        console.log(this.cookies);

        this.addCookies();

    }

    addCookies(){

        for(const [key, value] of Object.entries(this.cookies)){
            this.settings[key] = value;
        }
    }

    async load(){

        try{

            const bLoggedIn = await this.user.bLoggedIn(this.rawCookies);

            console.log(`session.load bLoggedIn ${bLoggedIn}`);

            this.settings.bLoggedIn = bLoggedIn;

       

        }catch(err){
            console.trace(err);

            this.settings.bLoggedIn = false;
        }
    }

    getUserId(hash){

        return new Promise((resolve, reject) =>{

            const query = "SELECT user FROM nstats_sessions WHERE hash=?";

            mysql.query(query, [hash], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result.length > 0){
                        resolve(result[0].user);
                    }
                }

                resolve(null);
            });
        });
    }

    async bUserAdmin(){

        try{


            console.log(this.settings);
            //const result = await this.user.bUserAdmin();

            if(this.settings.sid !== undefined){

                if(this.settings.sid !== ""){

                    const userId = await this.getUserId(this.settings.sid);
                    console.log(`userId = ${userId}`);
                    return await this.user.bAdmin(userId);
                }
            }

            return false;

        }catch(err){
            console.trace(err);

            return false;
        }
    }
}


export default Session;