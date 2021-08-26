const config = require('../../config.json');
const Client = require('ftp');
const fs = require('fs');
const EventEmitter = require('events');
const Message = require('../message');
const Logs = require('../logs');

class MyEmitter extends EventEmitter {}

class FTPImporter{

    constructor(host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles, bIgnoreBots, bIgnoreDuplicates){

        this.events = new MyEmitter();

        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.targetDir = targetDir;
        
        this.bDeleteAfter = bDeleteAfter;
        this.bDeleteTmpFiles = bDeleteTmpFiles;

        this.bIgnoreBots = bIgnoreBots;
        this.bIgnoreDuplicates = bIgnoreDuplicates;

        this.logsFound = [];

        this.aceLogsFound = [];
        this.acePlayerLogsFound = [];
        this.aceScreenshotsFound = [];

        this.createClient();
    }


    createClient(){
        
        this.client = new Client();

        new Message(`Attempting to connect to ftp://${this.host}:${this.port}`,'note');

        this.client.on('ready', async () =>{

            new Message(`Connected to ftp://${this.host}:${this.port}.`, 'pass');

            await this.checkForLogFiles();

            if(config.ace.importLogs){
                await this.checkForAceScreenshots();
                await this.checkForACELogs();
                await this.downloadACEFiles();
            }

            this.client.end();
        });

        this.client.on('error', (err) =>{
            new Message(err, 'error');
            console.trace(err);
        });

        this.client.on('close', () =>{
            new Message(`Connection to ${this.host}:${this.port} has closed.`, 'pass');
            this.events.emit('finished');
        });

        this.client.connect({

            "host": this.host,
            "port": this.port,
            "user": this.user,
            "password": this.password

        });
    }

    checkForLogFiles(){

        return new Promise((resolve, reject) =>{

            this.client.list(`${this.targetDir}Logs/`,async (err, files) =>{

                try{
    
                    if(err){
                        reject(err);
                    }else{
                        await this.sortFiles(files);
                        await this.downloadLogFiles();
                    }

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
        let f = 0;

        let bAlreadyImported = false;

        for(let i = 0; i < files.length; i++){

            f = files[i];

            if(extReg.test(f.name)){

                if(f.name.toLowerCase().startsWith(config.logFilePrefix)){

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

                }/*else{
                    new Message(`${f.name} does not have the required prefix of ${config.logFilePrefix}`, 'error');
                }*/

            }else if(tmpReg.test(f.name)){

                if(f.name.toLowerCase().startsWith(config.logFilePrefix)){

                    if(this.bDeleteTmpFiles){
                        await this.deleteFile(`${this.targetDir}Logs/${f.name}`);
                    }else{
                        new Message(`Delete TMP files is disabled on this server, skipping delete ${this.targetDir}Logs/${f.name}.`,'note');
                    }

                }
                
            }
        }

    }

    downloadFile(target, destination, bSkipDelete){

        return new Promise((resolve, reject) =>{

            if(bSkipDelete === undefined) bSkipDelete = false;

            this.client.get(target, (err, stream) =>{

                if(err) reject(err);


                stream.pipe(fs.createWriteStream(destination));
                // why did i not add this here before?
                
                stream.on('end', () =>{

                    new Message(`Downloaded ${this.host}:${this.port}${target}`, "pass");

                    if(bSkipDelete){
                        resolve();
                        return;
                    }

                    if(this.bDeleteAfter){

                        this.client.delete(target, (err) =>{

                            if(err) reject(err);

                            new Message(`Deleted ${target} from ftp server.`, 'pass');

                            resolve();
                        });

                    }else{
                        resolve();
                    }

                });               
            });
        });
    }

    async downloadLogFiles(){

        try{

            for(let i = 0; i < this.logsFound.length; i++){

                const log = this.logsFound[i];
                await this.downloadFile(`${this.targetDir}Logs/${log.name}`, `${config.importedLogsFolder}/${log.name}`);
         
            }

            new Message(`Downloaded ${this.logsFound.length} log files.`, 'pass');

        }catch(err){
            console.trace(err);
        }
    }


    async downloadACEFiles(){

        try{

            new Message("Starting download of ACE player join logs.","note");

            for(let i = 0; i < this.acePlayerLogsFound.length; i++){

                const f = this.acePlayerLogsFound[i];
                await this.downloadFile(`${this.targetDir}${config.ace.logDir}/${f}`, `${config.importedLogsFolder}/${f}`, true);

                if(config.ace.deleteLogsAfterImport){
                    await this.deleteFile(`${this.targetDir}${config.ace.logDir}/${f}`);
                }
            }

            new Message("Finished downloading of ACE player join logs.","pass");
            new Message("Starting download of ACE logs.","note");

            for(let i = 0; i < this.aceLogsFound.length; i++){

                const f = this.aceLogsFound[i];
                await this.downloadFile(`${this.targetDir}${config.ace.logDir}/${f}`, `${config.importedLogsFolder}/${f}`, true);

                if(config.ace.deleteLogsAfterImport){
                    await this.deleteFile(`${this.targetDir}${config.ace.logDir}/${f}`);
                }

            }

            new Message("Finished downloading of ACE logs.","pass");
            new Message("Starting download of ACE screenshots.","note");

            for(let i = 0; i < this.aceScreenshotsFound.length; i++){

                const f = this.aceScreenshotsFound[i];
                await this.downloadFile(`${this.targetDir}${config.ace.screenshotsDir}/${f}`, `${config.ace.importedScreenshotsDir}/${f}`);

                if(config.ace.deleteScreenshotsAfterImport){
                    await this.deleteFile(`${this.targetDir}${config.ace.screenshotsDir}/${f}`);
                }

            }

            new Message("Finished downloading of ACE screenshots.","pass");


        }catch(err){
            new Message(err, "error");
            console.trace(err);
        }
    }

    checkForAceScreenshots(){

        return new Promise((resolve, reject) =>{

            this.client.list(`${this.targetDir}${config.ace.screenshotsDir}/`, async (err, files) =>{

                if(err) reject(err);

                for(let i = 0; i < files.length; i++){

                    const f = files[i].name;
                    
                    if(f.startsWith(config.ace.screenshotPrefix)){

                        if(f.endsWith(config.ace.screenshotExtensionType)){
        
                            this.aceScreenshotsFound.push(f);
                        }
                    }   
                }

                resolve();
            });
        });
    }

    checkForACELogs(){
        
        return new Promise((resolve, reject) =>{

            this.client.list(`${this.targetDir}${config.ace.logDir}/`, async (err, files) =>{

                if(err) reject(err);

                for(let i = 0; i < files.length; i++){

                    const f = files[i];

                    if(f.name.startsWith(config.ace.playerJoinLogPrefix)){

                        if(f.name.endsWith(".log")){
                            this.acePlayerLogsFound.push(f.name);
                        }
                        
                    }else if(f.name.startsWith(config.ace.kickLogPrefix)){

                        if(f.name.endsWith(".log")){
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