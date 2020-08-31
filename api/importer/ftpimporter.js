const config = require('../config.json');
const Client = require('ftp');
const fs = require('fs');
const Promise = require('promise');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

class FTPImporter{

    constructor(){

        this.events = new MyEmitter();
        this.logsFound = [];
        this.createClient();
    }

    createClient(){

        this.client = new Client();

        this.client.on('ready', () =>{

            console.log(`Connected to ftp://${config.ftp.host}:${config.ftp.port}.`);

            this.checkForFiles();
        });

        this.client.on('error', (err) =>{
            console.trace(err);
        });

        this.client.on('close', () =>{
            console.log(`Connection to has closed ${config.ftp.host}:${config.ftp.port}.`);
            this.events.emit('finished');
        });

        this.client.connect({

            "host": config.ftp.host,
            "port": config.ftp.port,
            "user": config.ftp.user,
            "password": config.ftp.password

        });
    }

    checkForFiles(){

        return new Promise((resolve, reject) =>{

            this.client.list('Logs',async (err, files) =>{

                try{
    
                    if(err){
                        console.log(err);
                    }else{
                        this.sortFiles(files);
                        await this.downloadLogFiles();
                    }

                    resolve();
    
                }catch(err){
                    reject(err);
                }
            });
        });
    }

    sortFiles(files){

        const extReg = /^.+\.log$/i;
        let f = 0;

        for(let i = 0; i < files.length; i++){

            f = files[i];

            if(extReg.test(f.name)){

                if(f.name.toLowerCase().startsWith(config.ftp.logFilePrefix)){

                    this.logsFound.push(f);

                }else{
                    console.log(`${f.name} does not have the required prefix of ${config.ftp.logFilePrefix}`);
                }
            }
        }
    }

    downloadFile(target, destination){

        return new Promise((resolve, reject) =>{

            this.client.get(target, (err, stream) =>{

                if(err) reject(err);

                stream.once('close', () =>{

                    if(config.ftp.bDeleteLogsFromServer){

                        this.client.delete(target, (err) =>{

                            if(err) reject(err);

                            console.log(`Deleted ${target} from ftp server.`);

                            resolve();
                        });

                    }else{
                        resolve();
                    }
                });

                stream.pipe(fs.createWriteStream(destination));
            });
        });
    }

    async downloadLogFiles(){

        try{

            let log = 0;

            for(let i = 0; i < this.logsFound.length; i++){

                log = this.logsFound[i];
                await this.downloadFile(`${config.ftp.logsFolder}/${log.name}`, `${config.importedLogsFolder}/${log.name}`);
            }

            console.log(`Downloaded ${this.logsFound.length} log files.`);

            this.client.end();

        }catch(err){
            console.trace(err);
        }
    }

}

module.exports = FTPImporter;