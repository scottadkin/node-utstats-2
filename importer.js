const Importer =  require('./api/importer/importer');
const Message =  require('./api/message');
const mysql = require('./api/database');
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


async function getLogsFolderSettings(){

    const query = "SELECT ignore_duplicates,ignore_bots,min_players,min_playtime,import_ace,use_ace_player_hwid FROM nstats_logs_folder ORDER BY id DESC LIMIT 1";

    const result = await mysql.simpleQuery(query);

    if(result.length === 0){
        throw new Error("Logs folder settings have not been found, you have most likely missed an upgrade step from a previous version of node utstats 2.");    
    }
    
    return result[0];

}


async function startNewImport(ftpServer){

    if(ftpServer !== null){

        const f = ftpServer;

        if(f.enabled == 0){
            new Message(`${f.host}:${f.port} has been disabled, skipping import.`,"note");
            return true;
        }

        const importer = new Importer(
            f.id,
            f.host, 
            f.port, 
            f.user, 
            f.password, 
            f.target_folder, 
            f.delete_after_import, 
            f.delete_tmp_files, 
            f.ignore_bots, 
            f.ignore_duplicates, 
            f.min_players, 
            f.min_playtime, 
            f.sftp,
            f.import_ace,
            f.delete_ace_logs,
            f.delete_ace_screenshots,
            false//f.use_ace_player_hwid
        );

        return await importer.import();

    }else{

        const logsSettings = await getLogsFolderSettings();

        const importer = new Importer(
            -1,
            null, 
            null, 
            null, 
            null, 
            null, 
            null, 
            null, 
            logsSettings.ignore_bots, 
            logsSettings.ignore_duplicates, 
            logsSettings.min_players, 
            logsSettings.min_playtime, 
            false, 
            false, 
            false, 
            false, 
            false,//logsSettings.use_ace_player_hwid,
            true
        );

        return await importer.import();
    }
    
}


async function main(){

    try{

        const start = process.uptime();
        bCurrentImportFinished = false;

        await setFTPSettings();

        if(ftpServers.length > 0){

            let currentServerIndex = 0;

            while(currentServerIndex < ftpServers.length){

                try{

                    await startNewImport(ftpServers[currentServerIndex]);

                }catch(err){
                    new Message(err.toString(),"error");
                }

                currentServerIndex++;

            }
        }

        new Message(`Checking for leftover logs in/Logs folder.`,'note');
        //console.log(fs.readdirSync("./Logs"));

 
        await startNewImport(null);
        
        
        new Message(`Import process completed.`,'pass');
        bCurrentImportFinished = true;
        const end = process.uptime();

        new Message(`----------------------------------------------`, "note");
        new Message(`Import completed in ${(end - start).toFixed(4)} seconds`,"note");
        new Message(`----------------------------------------------`, "note");

    }catch(err){
        console.trace(err);
        new Message(`There was a problem connecting to the mysql server.`,"error");
        new Message(err, "error");
        bCurrentImportFinished = true;
    }

}

(async () =>{



    await main();

    if(config.importInterval > 0){

        setInterval(async () =>{
    
            if(bCurrentImportFinished){
                await main();
            }else{
                new Message("Previous import has not finished, skipping until next check interval.", "note");
            }
    
        }, config.importInterval * 1000);
    
    }else{
        new Message("Import Interval is set to 0, this means the importer will only run once.", "note");
        process.exit(0);
    }

})();


