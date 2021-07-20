const Importer =  require('./api/importer/importer');
const Message =  require('./api/message');
const mysql = require('./api/database');
const fs = require('fs');
const config = require('./config.json');

new Message('Node UTStats 2 Importer module started.','note');

ftpServers = [];
bCurrentImportFinished = false;

async function setFTPSettings(){

    try{

        ftpServers = [];
        const query = "SELECT * FROM nstats_ftp ORDER BY id ASC";
        const result = await mysql.simpleFetch(query);

        for(let i = 0; i < result.length; i++){

            ftpServers.push(result[i]);
        }


    }catch(err){
        console.trace(err);
        new Message(err, "error");
    }
}


function startNewImport(ftpServer, logsToImport){

    

    return new Promise((resolve, reject) =>{

        const f = ftpServer;

        let I = 0;

        if(ftpServer !== null){
            I = new Importer(f.host, f.port, f.user, f.password, f.target_folder, f.delete_after_import, f.delete_tmp_files, f.ignore_bots, f.ignore_duplicates);
        }else{
            I = new Importer(null, null, null, null, null, null, null, null, null, true, logsToImport);
        }

        I.myEmitter.on("passed", () =>{

            resolve();
        });

        I.myEmitter.on("error", (err) =>{

            //console.log(`Oops...${err}`);
            reject(err);
        })

    });

       
}


async function main(){

    try{

        bCurrentImportFinished = false;

        await setFTPSettings();

        if(ftpServers.length > 0){

            let currentServerIndex = 0;

            while(currentServerIndex < ftpServers.length){

                await startNewImport(ftpServers[currentServerIndex]);

                currentServerIndex++;

            }

        }

        new Message(`Checking for logs in/Logs folder.`,'note');
        //console.log(fs.readdirSync("./Logs"));

        const foundFiles = fs.readdirSync("./Logs");

        const toImport = [];

        for(let i = 0; i < foundFiles.length; i++){

            if(foundFiles[i].toLocaleLowerCase().startsWith(config.logFilePrefix)){
                toImport.push(foundFiles[i]);
            }
        }

        if(toImport.length > 0){
            await startNewImport(null, toImport);
        }else{
            new Message(`There are no logs to import in /Logs folder`,'note');
        }

        
        new Message(`Import process completed.`,'pass');
        bCurrentImportFinished = true;

    }catch(err){
        console.trace(err);
        new Message(err, "error");
    }

}


main();

setInterval(() =>{

    if(bCurrentImportFinished){
        main();
    }else{
        new Message("Previous import has not finished, skipping until next check interval.", 'note');
    }

}, config.importInterval * 1000);