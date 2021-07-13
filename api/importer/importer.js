const config = require('../../config.json');
const FTPImporter =  require('./ftpimporter');
const fs =  require('fs');
const Message = require('../message');
const MatchManager = require('./matchmanager');
const EventEmitter = require('events');


class MyEventEmitter extends EventEmitter{};

class Importer{

    constructor(host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles, bIgnoreBots, bIgnoreDuplicates, bSkipFTP, logsToImport){

        if(bSkipFTP === undefined){
            this.ftpImporter = new FTPImporter(host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles, bIgnoreBots, bIgnoreDuplicates);
        }
        
        this.updatedPlayers = [];
        this.updatedGametypes = [];

        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.targetDir = targetDir;
        this.bDeleteAfter = bDeleteAfter;
        this.bIgnoreDuplicates = bIgnoreDuplicates;


        this.myEmitter = new MyEventEmitter();

        let imported = 0;
        let failed = 0;
        let passed = 0;
        let currentData = [];

        let log = 0;
        let logData = 0;

        if(this.ftpImporter !== undefined){

            this.ftpImporter.events.on('finished', async () =>{
                   
                
                try{
                    
                    this.logsToImport = [];
                    await this.checkLogsFolder();

                    

                    for(let i = 0; i < this.logsToImport.length; i++){

                        new Message(`Starting import of log number ${imported + 1} of ${this.logsToImport.length}`,'progress');
                        
                        logData = await this.openLog(`${config.importedLogsFolder}/${this.logsToImport[i]}`);
                        
                        log = new MatchManager(logData, this.logsToImport[i], bIgnoreBots);

                        currentData = await log.import();

                        fs.renameSync(`${config.importedLogsFolder}/${this.logsToImport[i]}`,`Logs/imported/${this.logsToImport[i]}`);

                        this.addUpdatedPlayers(currentData.updatedPlayers);
                        this.addUpdatedGametype(currentData.updatedGametype);

                        imported++;

                    }

                    this.myEmitter.emit("passed");



                }catch(err){
                    console.trace(err);
                    this.myEmitter.emit("error");
                }   

            });

        }else{

            (async () =>{

                new Message(`Import running without FTP.`,'note');

                for(let i = 0; i < logsToImport.length; i++){
                    new Message(`Starting import of log number ${imported + 1} of ${logsToImport.length}`,'progress');
                    logData = await this.openLog(`${config.importedLogsFolder}/${logsToImport[i]}`);
                        
                    log = new MatchManager(logData, logsToImport[i], bIgnoreBots);

                    currentData = await log.import();

                    fs.renameSync(`${config.importedLogsFolder}/${logsToImport[i]}`,`Logs/imported/${logsToImport[i]}`);

                    this.addUpdatedPlayers(currentData.updatedPlayers);
                    this.addUpdatedGametype(currentData.updatedGametype);
                    imported++;
                }

                this.myEmitter.emit("passed");

            })();
            
        }
    }


    addUpdatedPlayers(players){

        for(let i = 0; i < players.length; i++){

            if(this.updatedPlayers.indexOf(players[i]) === -1){
                this.updatedPlayers.push(players[i]);
            }
        }
    }


    addUpdatedGametype(gametype){

        if(this.updatedGametypes.indexOf(gametype) === -1) this.updatedGametypes.push(gametype);
    }

    async checkLogsFolder(){

        try{


            const files = fs.readdirSync(`Logs/`);

            const fileExtReg = /^.+\.log$/i;

            for(let i = 0; i < files.length; i++){

                if(fileExtReg.test(files[i])){

                    if(files[i].toLowerCase().startsWith(config.logFilePrefix)){

                        this.logsToImport.push(files[i]);

                        new Message(`${files[i]} is a log file.`,'pass');

                    }else{
                        new Message(`${files[i]} does not have the prefix ${config.logFilePrefix}.`, 'pass');
                    }

                }else{
                    //new Message(`${files[i]} is not a log file.`,'error');
                }
            }

            new Message(`Found ${this.logsToImport.length} log files to import.`, 'pass');
        }catch(err){
            console.trace(err);
        }   
    }
    

    async openLog(file){

        try{

            let data = fs.readFileSync(file, "utf16le");
            data = data.toString();

            data = data.replace(/\u0000/ig, '');

            return data;
            
        }catch(err){
            console.trace(err);
        }
        
    }


}

module.exports = Importer;