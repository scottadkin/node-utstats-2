const mysql = require('./database');
const Promise = require('promise');
const User = require('./user');
const cookie = require('cookie');
const Message = require('./message');



class Session{

    constructor(ip, cookies){

        this.userIp = ip;

        

        this.user = new User();
        this.rawCookies = "";

        if(cookies !== undefined){
            this.rawCookies = cookies;
            this.cookies = cookie.parse(cookies);
        }else{
            this.cookies = {};
        }


        this.userIp = -1;



        this.settings = {
            "bUploadImages": false,
            "bAdmin": false,
            "bLoggedIn": false
        };


        this.addCookies();

    }

    addCookies(){

        for(const [key, value] of Object.entries(this.cookies)){

            if(key.toLowerCase() !== "badmin"){

                //piter ut99.org bug
                if(key === "connect.sid"){
                    
                    if(this.settings["sid"] === undefined){
                        this.settings["sid"] = value;
                    }

                }else{
                    this.settings[key] = value;
                }
            }
        }
    }

    async load(){

        try{

            const bLoggedIn = await this.user.bLoggedIn(this.rawCookies, this.userIp);

            //new Message(`Session.load() bLoggedIn = ${bLoggedIn}`, "note");

            this.settings.bLoggedIn = bLoggedIn;

            this.settings.bAdmin = await this.bUserAdmin();

            //new Message(`Session bAdmin = ${this.settings.bAdmin}`, "note");


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

            if(this.settings.sid !== undefined){

                if(this.settings.sid !== ""){

                    const userId = await this.getUserId(this.settings.sid);

                    const bAdmin = await this.user.bAdmin(userId);

                    if(!bAdmin){
                        this.settings.bUploadImages = await this.user.bUploadImages(userId);
                    }else{
                        this.settings.bUploadImages = true;
                    }
              
                    return bAdmin;
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