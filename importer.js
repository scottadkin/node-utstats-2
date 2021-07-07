const Importer =  require('./api/importer/importer');
const Message =  require('./api/message');
const mysql = require('./api/database');

new Message('Node UTStats 2 Importer module started.','note');

const ftpServers = [];

async function setFTPSettings(){

    try{

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

        const I = new Importer(f.host, f.port, f.user, f.password, f.target_folder, f.delete_after_import, f.delete_tmp_files, f.ignore_bots, f.ignore_duplicates);

        I.myEmitter.on("passed", () =>{

            resolve();
        });

        I.myEmitter.on("error", (err) =>{

            //console.log(`Oops...${err}`);
            reject(err);
        })

    });

       
}



(async () =>{

    try{

        await setFTPSettings();

        let currentServerIndex = 0;

        while(currentServerIndex < ftpServers.length){

            await startNewImport(ftpServers[currentServerIndex]);

            currentServerIndex++;

        }

        new Message(`Import process completed.`,'pass');
        process.exit(0);

    }catch(err){
        console.trace(err);
        new Message(err, "error");
    }


})();


