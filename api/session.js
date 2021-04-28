const mysql = require('./database');
const Promise = require('promise');
const User = require('./user');
const cookie = require('cookie');

class Session{

    constructor(cookies){

        this.user = new User();
        this.rawCookies = cookies;
        this.cookies = cookie.parse(cookies);

        console.log("session.cookies");
        console.log(this.cookies);

        this.settings = {};

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
}


export default Session;