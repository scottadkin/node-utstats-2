const Client =  require("ssh2-sftp-client");
const config = require("../../config.json");
const Message = require("../message");
const fs = require("fs");
const EventEmitter = require('events');

class MyEventEmitter extends EventEmitter {}

const DELETELOGFILES = false;
const DELETEACESCREENSHOTS = false;
const DELETEACELOGS = false;

class SFTPImporter{

    constructor(host, port, user, password, entryPoint){

        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.entryPoint = entryPoint;

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

        await this.downloadAceLogs();
        await this.downloadAceScreenshots();
    }

    async getAllLogFileNames(){

        const fileNames = await this.client.list(`${this.entryPoint}/Logs`);

        this.logsToDownload = [];

        for(let i = 0; i < fileNames.length; i++){

            const f = fileNames[i];

            const name = f.name.toLowerCase();

            if(name.startsWith(config.logFilePrefix)){

                if(name.endsWith(".log")){
                    this.logsToDownload.push(f);
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

        for(let i = 0; i < this.logsToDownload.length; i++){

            const log = this.logsToDownload[i];

            if(await this.downloadFile(`${this.entryPoint}/Logs/`, log.name, config.importedLogsFolder)){
                passed++;
            }else{
                failed++;
            }
        }

        new Message(`Downloading of stats log files completed, ${passed} logs downloaded, ${failed} logs failed to download.`,"note");

        if(DELETELOGFILES){
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

        for(let i = 0; i < files.length; i++){

            const f = files[i];

            const name = f.name.toLowerCase();

            if(name.startsWith(prefix)){

                if(name.endsWith(extension)){

                    if(await this.downloadFile(`${this.entryPoint}/${dir}/`, f.name, dir)){
                        passed++;
                    }
                }
            }
        }

        new Message(`Downloaded ${passed} out of ${files.length} ACE screenshots.`,"note");

        if(DELETEACESCREENSHOTS){
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

        for(let i = 0; i < files.length; i++){

            const f = files[i];

            const name = f.name.toLowerCase();

            const bPrefix1 = name.startsWith(prefix);
            const bPrefix2 = name.startsWith(prefix2);

            if((bPrefix1 || bPrefix2) && name.endsWith(extension)){

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

        new Message(`Downloaded ${kickPasses} ACE kick logs, and ${joinPasses} ACE player join logs.`,"note");

        if(DELETEACELOGS){
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
}

module.exports = SFTPImporter;