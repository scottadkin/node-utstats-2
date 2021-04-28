const mysql = require('./database');
const Promise = require('promise');
const User = require('./user');
const cookie = require('cookie');

class Session{

    constructor(cookies){

        this.user = new User();
        this.cookies = cookies;

    }

    async load(){

        try{

            const bLoggedIn = await this.user.bLoggedIn(this.cookies);

            console.log(`session.load bLoggedIn ${bLoggedIn}`);

            return {"bLoggedIn": bLoggedIn};

        }catch(err){
            console.trace(err);

            return {"bLoggedIn": false};
        }
    }
}


export default Session;