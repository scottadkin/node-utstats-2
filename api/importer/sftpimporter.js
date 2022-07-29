const Client =  require("ssh2-sftp-client");
const config = require("../../config.json");
const Message = require("../message");
const fs = require("fs");

class SFTPImporter{


    constructor(host, port, user, password){

        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;

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

        }catch(err){
            console.trace(err);
        }
    }

    async import(){

        await this.getAllLogFileNames();
    }

    async getAllLogFileNames(){

        const fileNames = await this.client.list("./UnrealTournament/Logs");

        this.logsToDownload = [];

        for(let i = 0; i < fileNames.length; i++){

            const f = fileNames[i];

            if(f.name.toLowerCase().startsWith(config.logFilePrefix.toLowerCase())){
                this.logsToDownload.push(f);
            }
        }

        await this.downloadLogFiles();

    }

    downloadFile(dir, fileName){

        return new Promise(async (resolve, reject) =>{

            try{

                const destination = fs.createWriteStream(`./TestDownloadFolder/${fileName}`);
    
                const file = await this.client.get(`${dir}${fileName}`, destination);
    
                file.on("close", () =>{
    
                    new Message(`Downloaded file ${dir}${fileName}.`,"pass");
                    resolve(true);
                });
             
            }catch(err){
    
                new Message(`Failed to download ${dir}${fileName}. ${err}`,"error");
                resolve(false);
    
            }
        });
    }

    async downloadLogFiles(){

        new Message(`Attempting to download log files, found ${this.logsToDownload.length} log files.`,"note");

        let passed = 0;
        let failed = 0;

        for(let i = 0; i < this.logsToDownload.length; i++){

            const log = this.logsToDownload[i];

            if(await this.downloadFile("./UnrealTournament/Logs/", log.name)){
                passed++;
            }else{
                failed++;
            }
        }

        new Message(`Downloading of log files completed, ${passed} logs downloaded, ${failed} logs failed to download.`,"note");
    }
}

module.exports = SFTPImporter;