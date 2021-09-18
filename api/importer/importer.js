const config = require('../../config.json');
const FTPImporter =  require('./ftpimporter');
const fs =  require('fs');
const Message = require('../message');
const MatchManager = require('./matchmanager');
const EventEmitter = require('events');
const AceManager = require('./acemanager');


class MyEventEmitter extends EventEmitter{};

class Importer{

    constructor(host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles, bIgnoreBots, bIgnoreDuplicates, bSkipFTP){

        if(bSkipFTP === undefined){
            this.ftpImporter = new FTPImporter(host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles, bIgnoreBots, bIgnoreDuplicates);
        }

        this.aceManager = new AceManager();
        
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
        this.logsToImport = [];
        this.aceLogsToImport = [];

        this.myEmitter = new MyEventEmitter();

        if(this.ftpImporter !== undefined){
            this.standardImport();
        }else{
            this.nonFtpImport();        
        }

    }



    updateCurrentUpdatedStats(currentData){

        if(currentData !== null){
            this.addUpdatedPlayers(currentData.updatedPlayers);
            this.addUpdatedGametype(currentData.updatedGametype);
        }
    }

    async importLogs(){

        try{

            await this.checkLogsFolder();

            const totalLogs = this.logsToImport.length;

            for(let i = 0; i < totalLogs; i++){

                const f = this.logsToImport[i];

                new Message(`Starting import of log number ${i + 1} of ${totalLogs}`,'progress');
                
                const logData = await this.openLog(`${config.importedLogsFolder}/${f}`);
                
                const log = new MatchManager(logData, f, this.bIgnoreBots);

                const currentData = await log.import();

                fs.renameSync(`${config.importedLogsFolder}/${f}`,`Logs/imported/${f}`);
                
                this.updateCurrentUpdatedStats(currentData);

            }

            for(let i = 0; i < this.aceLogsToImport.length; i++){

                const f = this.aceLogsToImport[i];

                let data = "";
                let mode = "";

                if(f.startsWith(config.ace.playerJoinLogPrefix)){

                    data = await this.openLog(`${config.importedLogsFolder}/${f}`);
                    mode = "join";

                }else if(f.startsWith(config.ace.kickLogPrefix)){

                    data = await this.openLog(`${config.importedLogsFolder}/${f}`, true);
                    mode = "kick";
                }

                await this.aceManager.importLog(f, mode, data);
            }

            this.myEmitter.emit("passed");


        }catch(err){

            console.trace(err);
        }

    }

    async standardImport(){

        this.ftpImporter.events.on('finished', async () =>{
                          
            try{
                
                await this.importLogs();

            }catch(err){
                console.trace(err);
                this.myEmitter.emit("error");
            }   

        });

    }

    async nonFtpImport(){

        try{

            new Message(`Import running without FTP.`,'note');

            await this.importLogs();
            
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

            const logPrefix = config.logFilePrefix.toLowerCase();

            for(let i = 0; i < files.length; i++){

                const f = files[i];

                const fileName = f.toLowerCase();
                
                if(fileExtReg.test(fileName)){

                    if(fileName.startsWith(logPrefix)){

                        this.logsToImport.push(f);

                        new Message(`${f} is a log file.`,'pass');

                    }else{

                        const bKickLog = fileName.startsWith(config.ace.kickLogPrefix.toLowerCase());
                        const bJoinLog = fileName.startsWith(config.ace.playerJoinLogPrefix.toLowerCase());

                        if(!bKickLog && !bJoinLog){

                            new Message(`${f} does not have the prefix ${config.logFilePrefix}.`, 'pass');

                        }else{

                            if(config.ace.importLogs){
                                this.aceLogsToImport.push(f);
                            }else{
                                new Message(`ACE log found but importing is disabled`, "note");
                            }
                        }
                    }
                }
            }

            new Message(`Found ${this.logsToImport.length} log files to import.`, 'pass');
        }catch(err){
            console.trace(err);
        }   
    }
    

    async openLog(file, bAceLog){

        try{

            if(bAceLog === undefined) bAceLog = false;

            const encoding = (bAceLog) ? "utf8" : "utf16le";

            let data = fs.readFileSync(file, encoding);

            data = data.toString().replace(/\u0000/ig, '');
            

            return data;
            
        }catch(err){
            console.trace(err);
        }
        
    }


}

module.exports = Importer;