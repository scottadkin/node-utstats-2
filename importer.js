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


function startNewImport(ftpServer){

    return new Promise((resolve, reject) =>{

        const f = ftpServer;

        let I = 0;

        if(ftpServer !== null){

            I = new Importer(
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
                f.delete_ace_screenshots
            );

        }else{
            I = new Importer(null, null, null, null, null, null, null, null, null, 0, 0, false, false, false , false , true);
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

        const start = process.uptime();
        bCurrentImportFinished = false;

        await setFTPSettings();

        if(ftpServers.length > 0){

            let currentServerIndex = 0;

            while(currentServerIndex < ftpServers.length){

                await startNewImport(ftpServers[currentServerIndex]);

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
        new Message(err, "error");
    }

}

(async () =>{



    await main();

    if(config.importInterval > 0){

        setInterval(() =>{
    
            if(bCurrentImportFinished){
                main();
            }else{
                new Message("Previous import has not finished, skipping until next check interval.", "note");
            }
    
        }, config.importInterval * 1000);
    
    }else{
        new Message("Import Interval is set to 0, this means the importer will only run once.", "note");
        process.exit(0);
    }

})();


