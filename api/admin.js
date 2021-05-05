const mysql = require("./database");
const fs = require('fs');
const Maps = require('./maps');
const User = require('./user');

class Admin{

    constructor(){

    }

    async getMapsFolder(){

        try{

            const m = new Maps();
            const databaseNames = await m.getAllNames();
            const files = fs.readdirSync("./public/images/maps/");
            return {"files": files, "databaseNames": databaseNames};

        }catch(err){
            console.trace(err);
        }
    }


    async getAllUsers(){

        try{

            const u = new User();

            const data = await u.getAll();

            return data;

        }catch(err){
            console.trace(err);
        }   
    }

}


module.exports = Admin;