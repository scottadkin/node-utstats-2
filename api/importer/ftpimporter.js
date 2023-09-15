const config = require('../../config.json');
const Client = require('ftp');
const fs = require('fs');
const Message = require('../message');
const Logs = require('../logs');
const Ace = require("../ace");

//class MyEmitter extends EventEmitter {}

class FTPImporter{

    constructor(host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles, bIgnoreDuplicates, bImportAce, bDeleteAceLogs, bDeleteAceScreenshots){

        //this.events = new MyEmitter();

        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.targetDir = targetDir;
        
        this.bDeleteAfter = bDeleteAfter;
        this.bDeleteTmpFiles = bDeleteTmpFiles;

        this.bIgnoreDuplicates = bIgnoreDuplicates;

        this.bImportAce = bImportAce;
        this.bDeleteAceLogs = bDeleteAceLogs;
        this.bDeleteAceScreenshots = bDeleteAceScreenshots;

        this.logsFound = [];

        this.aceLogsFound = [];
        this.acePlayerLogsFound = [];
        this.aceScreenshotsFound = [];

        this.ace = new Ace();

        //this.createClient();
    }

    async import(){

        return await this.createClient();
    }

    createClient(){

        return new Promise(async (resolve, reject) =>{

            this.client = new Client();

            new Message(`Attempting to connect to ftp://${this.host}:${this.port}`,'note');

            this.client.on("ready", async () =>{

                try{
                    new Message(`Connected to ftp://${this.host}:${this.port}.`, 'pass');
                    
                    await this.checkForLogFiles();

                    if(this.bImportAce){
                        await this.checkForAceScreenshots();
                        await this.checkForACELogs();
                        await this.downloadACEFiles();
                    }else{
                        new Message(`ACE importing is disabled, skipping.`, "note");
                    }
                    

                }catch(err){
            
                    new Message(err.toString(), "error");
          
                }finally{
                    this.client.end();
                }
            });

            this.client.on("error", (err) =>{

                new Message(`FTP ERROR: Server = ${this.host}:${this.port}`,"error");
                new Message(err.toString(), 'error');
                console.trace(err);
                new Message(`Closing connection to ftp://${this.host}:${this.port} due to an error.`, "error");
                this.client.destroy();
                resolve();
            });

            this.client.on("close", () =>{
                new Message(`Connection to ${this.host}:${this.port} has closed.`, 'pass');
                //this.events.emit('finished');
                resolve();
            });

            this.client.on("end", () =>{
                //console.log("FTP: END");
                resolve();
            });

            this.client.connect({
                "host": this.host,
                "port": this.port,
                "user": this.user,
                "password": this.password

            });

        });  
    }

    checkForLogFiles(){

        return new Promise((resolve, reject) =>{

            this.client.list(`${this.targetDir}Logs/`,async (err, files) =>{

                try{

                    if(err){
                        reject(err);
                        return;
                    }

                    new Message(`Found ${files.length} files in "${this.targetDir}Logs/" (ftp://${this.host}:${this.port})`,`note`);
                    await this.sortFiles(files);
                    await this.downloadLogFiles();
                

                    resolve();
    
                }catch(err){
                    reject(err);
                }
            });
        });
    }

    deleteFile(url){
        
        return new Promise((resolve, reject) =>{

            this.client.delete(url, (err) =>{

                if(err){
                    new Message(`Failed to delete ${url}, ${err}`,'error');
                }else{
                    new Message(`Deleted ${url} successfully.`,'pass');
                }

                resolve();
            });
        });
    }

    async sortFiles(files){

        const extReg = /^.+\.log$/i;
        const tmpReg = /^.+\.tmp$/i;

        const now = Math.floor(Date.now() * 0.001);

        let bAlreadyImported = false;

        const minTmpFileAge = ((60 * 60) * 24) * config.minTMPFileAgeInDays;

        const logFilePrefix = config.logFilePrefix.toLowerCase();

        for(let i = 0; i < files.length; i++){

            const f = files[i];
            const name = f.name.toLowerCase();

            if(extReg.test(name)){

                if(name.startsWith(logFilePrefix)){

                    if(this.bIgnoreDuplicates){
                        bAlreadyImported = await Logs.bExists(f.name);
                    }

                    if(!bAlreadyImported){
                        this.logsFound.push(f);
                    }else{
                        
                        if(this.bDeleteAfter){
                            await this.deleteFile(`${this.targetDir}Logs/${f.name}`);
                        }

                        new Message(`${f.name} has already been imported, skipping.`,'note');
                    }

                }

            }else if(tmpReg.test(f.name)){

                if(f.name.toLowerCase().startsWith(logFilePrefix)){

                    if(this.bDeleteTmpFiles){

                        const fileDate = Math.floor(Date.parse(f.date) * 0.001);

                        const age = now - fileDate;

                        if(age > minTmpFileAge){
                            await this.deleteFile(`${this.targetDir}Logs/${f.name}`);
                        }
                        
                    }else{
                        new Message(`Delete TMP files is disabled on this server, skipping delete ${this.targetDir}Logs/${f.name}.`,'note');
                    }
                }         
            }
        }

    }

    downloadFile(target, destination){

        return new Promise((resolve, reject) =>{

            this.client.get(target, (err, stream) =>{

                if(err){
                    reject(err);
                    return;
                }

                stream.pipe(fs.createWriteStream(destination));
                // why did i not add this here before?
                
                stream.on('end', () =>{

                    new Message(`Downloaded ${this.host}:${this.port}${target}`, "pass");

                    resolve();

                });               
            });
        });
    }

    async downloadLogFiles(){

        try{

            for(let i = 0; i < this.logsFound.length; i++){

                const log = this.logsFound[i];

                const originalFile = `${this.targetDir}Logs/${log.name}`;
                const downloadedFile = `${config.importedLogsFolder}/${log.name}`;

                await this.downloadFile(originalFile, downloadedFile);

                if(this.bDeleteAfter){
                    await this.deleteFile(originalFile);
                }
         
            }

            new Message(`Downloaded ${this.logsFound.length} log files.`, 'pass');

        }catch(err){
            console.trace(err);
        }
    }


    async downloadACEFiles(){

        try{

            await this.downloadACELogs();
            await this.downloadACEJoinLogs();    
            await this.downloadAceScreenshots();

        }catch(err){
            new Message(err, "error");
            console.trace(err);
        }
    }

    async downloadACELogs(){

        new Message("Starting download of ACE logs.","note");

        let passed = 0;
        let duplicates = 0;

        for(let i = 0; i < this.aceLogsFound.length; i++){

            const f = this.aceLogsFound[i];

            if(this.bIgnoreDuplicates){

                if(await this.ace.bKickLogImported(f)){

                    duplicates++;

                    if(this.bDeleteAceLogs){
                        await this.deleteFile(`${this.targetDir}${config.ace.logDir}/${f}`);
                    }
                    continue;
                }
            }

            await this.downloadFile(`${this.targetDir}${config.ace.logDir}/${f}`, `${config.importedLogsFolder}/${f}`);
            passed++;

            if(this.bDeleteAceLogs){
                await this.deleteFile(`${this.targetDir}${config.ace.logDir}/${f}`);
            }

        }
   
        new Message(`Finished downloading ACE logs, ${passed} downloaded, ${duplicates} duplicates ignored.`,"pass");
    }

    async downloadACEJoinLogs(){

        new Message("Starting download of ACE player join logs.","note");

        let passed = 0;
        let duplicates = 0;

        for(let i = 0; i < this.acePlayerLogsFound.length; i++){

            const f = this.acePlayerLogsFound[i];

            if(this.bIgnoreDuplicates){

                if(await this.ace.bJoinLogImported(f)){

                    duplicates++;

                    if(this.bDeleteAceLogs){
                        await this.deleteFile(`${this.targetDir}${config.ace.logDir}/${f}`);
                    }

                    continue;
                }
            }

            await this.downloadFile(`${this.targetDir}${config.ace.logDir}/${f}`, `${config.importedLogsFolder}/${f}`);

            passed++;

            if(this.bDeleteAceLogs){
                await this.deleteFile(`${this.targetDir}${config.ace.logDir}/${f}`);
            }
        }

        new Message(`Finished downloading ACE join logs, ${passed} downloaded, ${duplicates} duplicates ignored.`,"pass");
    }

    async downloadAceScreenshots(){

        new Message("Starting download of ACE screenshots.","note");

        let duplicates = 0;
        let downloaded = 0;

        for(let i = 0; i < this.aceScreenshotsFound.length; i++){

            const f = this.aceScreenshotsFound[i];

            if(this.bIgnoreDuplicates){

                if(await this.ace.bScreenshotImported(f)){

                    duplicates++;

                    if(this.bDeleteAceScreenshots){
                        await this.deleteFile(`${this.targetDir}${config.ace.screenshotsDir}/${f}`);
                    }

                    continue;
                }
            }

            await this.downloadFile(`${this.targetDir}${config.ace.screenshotsDir}/${f}`, `${config.ace.importedScreenshotsDir}/${f}`);
            await this.ace.updateScreenshotTable(f);
            await this.ace.updateTypeTotals("screenshot", this.host, this.port);

            downloaded++;

            if(this.bDeleteAceScreenshots){
                await this.deleteFile(`${this.targetDir}${config.ace.screenshotsDir}/${f}`);
            }

        }

        new Message(`Downloaded ${downloaded} ACE screenshots, ${duplicates} duplicates ignored.`,"pass");
    }

    checkForAceScreenshots(){

        return new Promise((resolve, reject) =>{

            this.client.list(`${this.targetDir}${config.ace.screenshotsDir}/`, async (err, files) =>{

                if(err){
                    reject(err);
                    return;
                }

                const prefix = config.ace.screenshotPrefix.toLowerCase();
                const extensionType = config.ace.screenshotExtensionType.toLowerCase();

                for(let i = 0; i < files.length; i++){

                    const f = files[i].name;
                    const name = f.toLowerCase();
                    
                    if(name.startsWith(prefix) && name.endsWith(extensionType)){

                        this.aceScreenshotsFound.push(f);            
                    }   
                }

                resolve();
            });
        });
    }

    checkForACELogs(){
        
        return new Promise((resolve, reject) =>{

            this.client.list(`${this.targetDir}${config.ace.logDir}/`, async (err, files) =>{

                if(err){
                    reject(err);
                    return;
                }

                const joinPrefix = config.ace.playerJoinLogPrefix.toLowerCase();
                const kickPrefix = config.ace.kickLogPrefix.toLowerCase();

                for(let i = 0; i < files.length; i++){

                    const f = files[i];

                    const name = f.name.toLowerCase();

                    if(name.endsWith(".log")){

                        if(name.startsWith(joinPrefix)){

                            this.acePlayerLogsFound.push(f.name);
                                  
                        }else if(name.startsWith(kickPrefix)){
    
                            this.aceLogsFound.push(f.name);
                          
                        }
                    }
                }
                resolve();
            });
        });

    }

}
module.exports = FTPImporter;