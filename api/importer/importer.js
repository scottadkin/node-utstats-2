const config = require('../../config.json');
const FTPImporter =  require('./ftpimporter');
const fs =  require('fs');
const Message = require('../message');
const MatchManager = require('./matchmanager');
const EventEmitter = require('events');
const AceManager = require('./acemanager');


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
        this.bIgnoreBots = bIgnoreBots;

        this.myEmitter = new MyEventEmitter();

        if(this.ftpImporter !== undefined){

            this.standardImport();

        }else{

            this.nonFtpImport();
            
        }
    }

    async standardImport(){

        this.ftpImporter.events.on('finished', async () =>{
                          
            try{

                let imported = 0;
                
                this.logsToImport = [];
                await this.checkLogsFolder();

                for(let i = 0; i < this.logsToImport.length; i++){

                    new Message(`Starting import of log number ${imported + 1} of ${this.logsToImport.length}`,'progress');
                    
                    const logData = await this.openLog(`${config.importedLogsFolder}/${this.logsToImport[i]}`);
                    
                    const log = new MatchManager(logData, this.logsToImport[i], this.bIgnoreBots);

                    const currentData = await log.import();

                    fs.renameSync(`${config.importedLogsFolder}/${this.logsToImport[i]}`,`Logs/imported/${this.logsToImport[i]}`);
                    
                    if(currentData !== null){
                        this.addUpdatedPlayers(currentData.updatedPlayers);
                        this.addUpdatedGametype(currentData.updatedGametype);
                    }

                    imported++;

                }

                this.myEmitter.emit("passed");

            }catch(err){
                console.trace(err);
                this.myEmitter.emit("error");
            }   

        });

    }

    async nonFtpImport(){

        try{

            new Message(`Import running without FTP.`,'note');

                for(let i = 0; i < logsToImport.length; i++){

                    new Message(`Starting import of log number ${imported + 1} of ${logsToImport.length}`,'progress');
                    const logData = await this.openLog(`${config.importedLogsFolder}/${logsToImport[i]}`);
                        
                    const log = new MatchManager(logData, logsToImport[i], this.bIgnoreBots);

                    const currentData = await log.import();

                    fs.renameSync(`${config.importedLogsFolder}/${logsToImport[i]}`,`Logs/imported/${logsToImport[i]}`);

                    if(currentData !== null){
                        this.addUpdatedPlayers(currentData.updatedPlayers);
                        this.addUpdatedGametype(currentData.updatedGametype);
                    }
                    imported++;
                }

                this.myEmitter.emit("passed");

            }catch(err){
                console.trace(err);
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

                const f = files[i];

                if(fileExtReg.test(f)){

                    if(f.toLowerCase().startsWith(config.logFilePrefix)){

                        this.logsToImport.push(f);

                        new Message(`${f} is a log file.`,'pass');

                    }else{

                        const bKickLog = f.startsWith(config.ace.kickLogPrefix);
                        const bJoinLog = f.startsWith(config.ace.playerJoinLogPrefix);

                        if(!bKickLog && !bJoinLog){
                            new Message(`${f} does not have the prefix ${config.logFilePrefix}.`, 'pass');
                        }else if(bKickLog){
                            new Message(`${f} is an ACE kick log`);
                        }else if(bJoinLog){
                            new Message(`${f} is an ACE player join log`);
                        }
                    }
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