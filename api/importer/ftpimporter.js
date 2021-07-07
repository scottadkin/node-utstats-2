const config = require('../../config.json');
const Client = require('ftp');
const fs = require('fs');
const Promise = require('promise');
const EventEmitter = require('events');
const Message = require('../message');
const mysql = require('../database');
const Logs = require('../logs');

class MyEmitter extends EventEmitter {}

class FTPImporter{

    constructor(host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles){

        this.events = new MyEmitter();

        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.targetDir = targetDir;
        
        this.bDeleteAfter = bDeleteAfter;
        this.bDeleteTmpFiles = bDeleteTmpFiles;

        this.logsFound = [];

        this.createClient();
    }


    createClient(){


        
        this.client = new Client();

        new Message(`Attempting to connect to ftp://${this.host}:${this.port}`,'note');

        this.client.on('ready', () =>{

            new Message(`Connected to ftp://${this.host}:${this.port}.`, 'pass');

            this.checkForLogFiles();
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

    deleteTmpFile(url){

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

                    bAlreadyImported = await Logs.bExists(f.name);

                    if(!bAlreadyImported){
                        this.logsFound.push(f);
                    }else{
                        new Message(`${f.name} has already been imported, skipping.`,'note');
                    }

                }else{
                    new Message(`${f.name} does not have the required prefix of ${config.logFilePrefix}`, 'error');
                }

            }else if(tmpReg.test(f.name)){

                if(f.name.toLowerCase().startsWith(config.logFilePrefix)){

                    if(this.bDeleteTmpFiles){
                        await this.deleteTmpFile(`${this.targetDir}Logs/${f.name}`);
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

                if(err) reject(err);


                stream.pipe(fs.createWriteStream(destination));
                // why did i not add this here before?
                
                stream.on('end', () =>{

                    new Message(`Downloaded ${this.host}:${this.port}${target}`, "pass");

                    if(this.bDeleteAfter){

                        this.client.delete(target, (err) =>{

                            if(err) reject(err);

                            new Message(`Deleted ${target} from ftp server.`, 'pass');

                            resolve();
                        });

                    }else{
                        console.log("DONT DELETE AFTER IMPORT");
                        resolve();
                    }

                });

                
                
            });
        });
    }

    async downloadLogFiles(){

        try{

            let log = 0;

            for(let i = 0; i < this.logsFound.length; i++){


                log = this.logsFound[i];

                await this.downloadFile(`${this.targetDir}Logs/${log.name}`, `${config.importedLogsFolder}/${log.name}`);
         
            }

            new Message(`Downloaded ${this.logsFound.length} log files.`, 'pass');

            this.client.end();

        }catch(err){
            console.trace(err);
        }
    }

}
module.exports = FTPImporter;