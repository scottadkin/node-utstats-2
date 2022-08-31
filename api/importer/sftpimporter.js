const Client =  require("ssh2-sftp-client");
const config = require("../../config.json");
const Message = require("../message");
const fs = require("fs");
const EventEmitter = require('events');
const Logs = require("../logs");
const Ace = require("../ace");

class MyEventEmitter extends EventEmitter {}

class SFTPImporter{

    constructor(host, port, user, password, entryPoint, bDeleteAfter, bDeleteTmpFiles, bIgnoreDuplicates, bImportAce, bDeleteAceLogs, bDeleteAceScreenshots){

        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.entryPoint = entryPoint;
        this.bDeleteAfter = bDeleteAfter;
        this.bDeleteTmpFiles = bDeleteTmpFiles;
        this.bIgnoreDuplicates = bIgnoreDuplicates;
        this.bImportAce = bImportAce;
        this.bDeleteAceLogs = bDeleteAceLogs;
        this.bDeleteAceScreenshots = bDeleteAceScreenshots;

        this.ace = new Ace();

        this.events = new MyEventEmitter();

        new Message(`Attempting to connect to sftp server sftp://${host}:${port}.`,"note");

        this.client = new Client();

        this.connect();
    }

    async connect(){

        try{

            await this.client.connect({
                "host": this.host,
                "port": this.port,
                "username": this.user,
                "password": this.password,
            });


            new Message(`Connected to sftp server sftp://${this.host}:${this.port} successfully.`,"pass");

            await this.import();

            this.client.end();
            new Message(`Disconnected from sftp server sftp://${this.host}:${this.port} successfully.`,"pass");
            this.events.emit("finished");

        }catch(err){
            console.trace(err);
        }
    }

    async import(){

        await this.downloadLogFiles();
        await this.deleteTMPFiles();

        if(this.bImportAce){
            await this.downloadAceLogs();
            await this.downloadAceScreenshots();
        }else{
            new Message(`ACE importing is disabled, skipping.`, "note");
        }
    }

    async getAllLogFileNames(){

        const fileNames = await this.client.list(`${this.entryPoint}/Logs`);

        this.logsToDownload = [];
        this.tmpFiles = [];

        for(let i = 0; i < fileNames.length; i++){

            const f = fileNames[i];

            const name = f.name.toLowerCase();

            if(name.startsWith(config.logFilePrefix)){

                if(name.endsWith(".log")){
                    this.logsToDownload.push(f);
                }else if(name.endsWith(".tmp")){
                    this.tmpFiles.push(f);
                }
            }
        }
    }

    downloadFile(fileDirectory, fileName, destinationFolder){

        return new Promise(async (resolve, reject) =>{

            try{

                const destination = fs.createWriteStream(`${destinationFolder}/${fileName}`);
    
                const file = await this.client.get(`${fileDirectory}${fileName}`, destination);
    
                file.on("close", () =>{
    
                    new Message(`Downloaded file ${fileDirectory}${fileName}.`,"pass");
                    resolve(true);
                });
             
            }catch(err){
    
                new Message(`Failed to download ${fileDirectory}${fileName}. ${err}`,"error");
                resolve(false);
    
            }
        });
    }

    async downloadLogFiles(){

        await this.getAllLogFileNames();

        new Message(`Attempting to download stats log files, found ${this.logsToDownload.length} log files.`,"note");

        let passed = 0;
        let failed = 0;
        let duplicates = 0;

        for(let i = 0; i < this.logsToDownload.length; i++){

            const log = this.logsToDownload[i];

            if(await Logs.bExists(log.name) && this.bIgnoreDuplicates){

                new Message(`${log.name} has already been imported, skipping.`,"warning");
                duplicates++;
                continue;
            }

            if(await this.downloadFile(`${this.entryPoint}/Logs/`, log.name, config.importedLogsFolder)){
                passed++;
            }else{
                failed++;
            }
        }

        new Message(`Downloading of stats log files completed, ${passed} logs downloaded, ${duplicates} duplicate log files skipped, ${failed} logs failed to download.`,"note");

        if(this.bDeleteAfter){
            await this.deleteDownloadedLogsFromSFTP();
        }
    }

    async deleteFile(fileName){

        try{

            await this.client.delete(fileName);
            new Message(`Deleted file ${fileName} from sftp server successfully.`,"pass");
            return true;

        }catch(err){
            //console.trace(err);
            new Message(`Failed to delete file ${fileName} from sftp server. ${err}`,"error");
            return false;
        }
    }

    async deleteDownloadedLogsFromSFTP(){

        new Message(`Attempting to delete ${this.logsToDownload.length} log files from sftp server.`, "note");

        let passed = 0;

        for(let i = 0; i < this.logsToDownload.length; i++){

            const file = this.logsToDownload[i];

            if(await this.deleteFile(`${this.entryPoint}/Logs/${file.name}`)){
                passed++;
            }
        }

        new Message(`Deleted ${passed} out of ${this.logsToDownload.length} log files from sftp server.`,"Note");
    }

    async downloadAceScreenshots(){

        new Message(`Starting download of ACE screenshots.`,"note");

        const files = await this.client.list(`${this.entryPoint}/${config.ace.screenshotsDir}`);

        this.aceScreenshots = files;

        const prefix = config.ace.screenshotPrefix.toLowerCase();
        const extension = config.ace.screenshotExtensionType.toLowerCase();
        const dir = config.ace.screenshotsDir;

        let passed = 0;
        let duplicates = 0;

        for(let i = 0; i < files.length; i++){

            const f = files[i];

            const name = f.name.toLowerCase();

            if(name.startsWith(prefix)){

                if(name.endsWith(extension)){

                    if(this.bIgnoreDuplicates){

                        if(await this.ace.bScreenshotImported(f.name)){
                            duplicates++;
                            continue;
                        }
                    }

                    if(await this.downloadFile(`${this.entryPoint}/${dir}/`, f.name, dir)){

                        await this.ace.updateScreenshotTable(f.name);
                        await this.ace.updateTypeTotals("screenshot", this.host, this.port);
                        passed++;
                    }
                }
            }
        }

        new Message(`Downloaded ${passed} out of ${files.length} ACE screenshots, ${duplicates} duplicates ignored.`,"note");

        if(this.bDeleteAceScreenshots){
            await this.deleteACEScreenshotsFromSFTP();
        }
    }

    async deleteACEScreenshotsFromSFTP(){

        if(this.aceScreenshots.length === 0) return;

        new Message(`Starting deletion of ACE screenshots for sftp server.`, "note");
        
        let passed = 0;

        for(let i = 0; i < this.aceScreenshots.length; i++){

            const shot = this.aceScreenshots[i];

            if(await this.deleteFile(`${this.entryPoint}/${config.ace.screenshotsDir}/${shot.name}`)){
                passed++;
            }
        }

        new Message(`Deleted ${passed} out of ${this.aceScreenshots.length} ACE screenshots.`,"note");
    }

    async downloadAceLogs(){

        new Message(`Attempting to download ACE join, and kick logs.`,"note");

        const dir = `${this.entryPoint}/${config.ace.logDir}`;

        const files = await this.client.list(dir);

        const prefix = config.ace.kickLogPrefix.toLowerCase();
        const prefix2 = config.ace.playerJoinLogPrefix.toLowerCase();
        const extension = ".log";

        this.aceLogsToDelete = [];

        let kickPasses = 0;
        let joinPasses = 0;
        let duplicateKicks = 0;
        let duplicateJoins = 0;

        for(let i = 0; i < files.length; i++){

            const f = files[i];

            const name = f.name.toLowerCase();

            const bPrefix1 = name.startsWith(prefix);
            const bPrefix2 = name.startsWith(prefix2);

            if((bPrefix1 || bPrefix2) && name.endsWith(extension)){

                if(prefix){

                    if(this.bIgnoreDuplicates){

                        if(await this.ace.bKickLogImported(name)){
                            duplicateKicks++;
                            this.aceLogsToDelete.push(f.name);
                            continue;
                        }
                    }
                }

                if(prefix2){

                    if(this.bIgnoreDuplicates){

                        if(await this.ace.bJoinLogImported(name)){
                            duplicateJoins++;
                            this.aceLogsToDelete.push(f.name);
                            continue;
                        }
                    }

                }

                if(await this.downloadFile(`${dir}/`, f.name, config.importedLogsFolder)){

                    this.aceLogsToDelete.push(f.name);

                    if(bPrefix1){
                        kickPasses++;
                    }else if(bPrefix2){
                        joinPasses++;
                    }
                }
            }
        }

        new Message(`Downloaded ${kickPasses} ACE kick logs, ${duplicateKicks} duplicate logs ignored.`,"note");
        new Message(`Downloaded ${joinPasses} ACE player join logs, ${duplicateJoins} duplicate logs ignored.`,"note");

        if(this.bDeleteAceLogs){
            await this.deleteAceLogsFromSFTP();
        }
    }

    async deleteAceLogsFromSFTP(){

        if(this.aceLogsToDelete.length === 0) return;

        new Message(`Starting to delete ACE logs from sftp server.`, "note");

        let passed = 0;

        for(let i = 0; i < this.aceLogsToDelete.length; i++){

            const log = this.aceLogsToDelete[i];

            if(await this.deleteFile(`${this.entryPoint}/Logs/${log}`)){
                passed++;
            }
        }

        new Message(`Deleted ${passed} ACE logs out of ${this.aceLogsToDelete.length}.`, "note");
    }


    async deleteTMPFiles(){

        new Message(`Found ${this.tmpFiles.length} tmp files in logs folder.`, "note");

        if(this.bDeleteTmpFiles){

            for(let i = 0; i < this.tmpFiles.length; i++){

                const f = this.tmpFiles[i];
                await this.deleteFile(`${this.entryPoint}/Logs/${f.name}`);
            }
        }
    }
}

module.exports = SFTPImporter;