const mysql = require("./database");
const fs = require('fs');
const Maps = require('./maps');
const User = require('./user');
const Matches = require('./matches');
const Winrates = require('./winrate');

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

            const affectedGametypes = [];

            let currentGametype = 0;

            for(let i = 0; i < toDelete.length; i++){

                currentGametype = await matchManager.deleteMatch(toDelete[i]);

                if(currentGametype !== undefined){

                    if(affectedGametypes.indexOf(currentGametype) === -1){
                        affectedGametypes.push(currentGametype);
                    }
                }
            }


            const winrateManager = new Winrates();

            for(let i = 0; i < affectedGametypes.length; i++){

                await winrateManager.recalculateGametype(affectedGametypes[i]);
            }



        }catch(err){
            console.trace(err);
        }
    }

    async getAllFTPServers(){

        const query = "SELECT * FROM nstats_ftp ORDER BY id ASC";

        return await mysql.simpleFetch(query);
    }

    async updateFTPServer(id, name, host, port, user, password, folder, deleteAfterImport, deleteTmpFiles, ignoreBots, ignoreDuplicates,
        minPlayers, minPlaytime, bSecureFTP){

        const query = `UPDATE nstats_ftp SET
            name=?,
            host=?,
            port=?,
            user=?,
            password=?,
            target_folder=?,
            delete_after_import=?,
            delete_tmp_files=?,
            ignore_bots=?,
            ignore_duplicates=?,
            min_players=?,
            min_playtime=?,
            sftp=?
            WHERE id=?`;
        
        bSecureFTP = bSecureFTP ?? 0;

        const vars = [
            name,
            host, 
            port,
            user,
            password,
            folder,
            deleteAfterImport,
            deleteTmpFiles,
            ignoreBots,
            ignoreDuplicates,
            minPlayers,
            minPlaytime,
            bSecureFTP,
            id
        ];

        return await mysql.updateReturnAffectedRows(query, vars);
    }


    async addFTPServer(name, host, port, user, password, folder, deleteAfterImport, deleteTmpFiles, 
        ignoreBots, ignoreDuplicates, minPlayers, minPlaytime, bSecureFTP){

        
        bSecureFTP = bSecureFTP ?? 0;

        deleteAfterImport = (deleteAfterImport === "true") ? 1 : 0 ;
        deleteTmpFiles = (deleteTmpFiles === "true") ? 1 : 0 ;
        ignoreBots = (ignoreBots === "true") ? 1 : 0 ;
        ignoreDuplicates = (ignoreDuplicates === "true") ? 1 : 0 ;
        bSecureFTP = (bSecureFTP === "true") ? 1 : 0 ;
      
        const query = "INSERT INTO nstats_ftp VALUES(NULL,?,?,?,?,?,?,?,0,0,0,?,0,?,?,?,?,?)";

        const vars = [
            name, 
            host, 
            port, 
            user, 
            password, 
            folder, 
            deleteAfterImport, 
            deleteTmpFiles, 
            ignoreBots, 
            ignoreDuplicates, 
            minPlayers, 
            minPlaytime, 
            bSecureFTP
        ];

        return await mysql.insertReturnInsertId(query, vars);
    }

    async deleteFTPServer(id){

        const query = "DELETE FROM nstats_ftp WHERE id=?";

        return await mysql.updateReturnAffectedRows(query, [id]);
    }

}


module.exports = Admin;