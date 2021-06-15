const mysql = require("./database");
const fs = require('fs');
const Maps = require('./maps');
const User = require('./user');
const Matches = require('./matches');

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

            const data = await u.adminGetAll();

            return data;

        }catch(err){
            console.trace(err);
        }   
    }

    async activateAccount(id){

        try{

            const u = new User();

            await u.activateAccount(id);

            return true;

        }catch(err){
            console.trace(err);
            return false;
        }
    }




    async getDuplicateMatches(){

        try{

            const m = new Matches();

            return await m.getDuplicates();
 

        }catch(err){
            console.trace(err);
        }
    }

    async deleteDuplicateMatches(logNames){

        try{

            const matchManager = new Matches();

            const matches = await matchManager.getLogMatches(logNames);

            const toDelete = [];
            const alreadyFound = [];


            let m = 0;

            for(let i = 0; i < matches.length; i++){

                m = matches[i];

                if(alreadyFound.indexOf(m.name) !== -1){
                    toDelete.push(m.match_id);
                }else{
                    alreadyFound.push(m.name);
                }

            }

            //await matchManager.deleteMatch(toDelete[1]);

            for(let i = 0; i < toDelete.length; i++){

                await matchManager.deleteMatch(toDelete[i]);
            }




        }catch(err){
            console.trace(err);
        }
    }

    async getAllFTPServers(){

        const query = "SELECT * FROM nstats_ftp ORDER BY id ASC";

        return await mysql.simpleFetch(query);
    }

    async updateFTPServer(id, name, host, port, user, password, folder, deleteAfterImport){

        const query = `UPDATE nstats_ftp SET
            name=?,
            host=?,
            port=?,
            user=?,
            password=?,
            target_folder=?,
            delete_after_import=?
            WHERE id=?`;

        const vars = [
            name,
            host, 
            port,
            user,
            password,
            folder,
            deleteAfterImport,
            id
        ];

        await mysql.simpleUpdate(query, vars);
    }


    async addFTPServer(name, host, port, user, password, folder, deleteAfterImport){

        const query = "INSERT INTO nstats_ftp VALUES(NULL,?,?,?,?,?,?,?,0,0,0)";

        const vars = [name, host, port, user, password, folder, deleteAfterImport];

        return await mysql.insertReturnInsertId(query, vars);
    }

}


module.exports = Admin;