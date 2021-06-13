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



(async () =>{

    try{

        await setFTPSettings();

        console.log(ftpServers);

        let f = ftpServers[0];

        const I = new Importer(f.host, f.port, f.user, f.password, f.target_folder, f.delete_after_imports);

        I.myEmitter.on("passed", () =>{

            console.log("DID IT WORK?");
        });

        I.myEmitter.on("error", () =>{

            console.log("Oops...");
        });

    }catch(err){
        console.trace(err);
        new Message(err, "error");
    }


})();

