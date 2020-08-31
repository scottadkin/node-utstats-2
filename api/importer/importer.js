const config = require('../config.json');
const Client = require('ftp');
const fs = require('fs');
const Promise = require('promise');

class Importer{

    constructor(){


        this.logsFound = [];

        this.createClient();
    }

    createClient(){

        this.client = new Client();

        this.client.on('ready', () =>{

            this.checkForFiles();
            console.log('connected');
        });

        this.client.connect({

            "host": config.ftp.host,
            "port": config.ftp.port,
            "user": config.ftp.user,
            "password": config.ftp.password

        });
    }

    checkForFiles(){

        this.client.list('Logs', (err, files) =>{

            if(err){
                console.log(err);
            }else{
                console.table(files);

                this.sortFiles(files);

                this.downloadLogFiles();

            }
        });

        /*

        this.client.get('Logs/Unreal.ngLog.2020.08.31.07.42.19.7777.log', (err, stream) =>{

            if(err){
                console.log(err);
            }else{

                stream.once('close', (() =>{
                    this.client.end();
                }));
  
                stream.pipe(fs.createWriteStream(`${config.ftp.logsFolder}/foo.local-copy.txt`));
            }
        });*/
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

            }else{

                console.log(`${f.name} is not a log file.`);

            }   
        }
    }

    downloadFile(target, destination){

        console.log(`Target = ${target}`);
        console.log(`Destination = ${destination}`);

        return new Promise((resolve, reject) =>{

            this.client.get(target, (err, stream) =>{

                if(err) reject(err);

                stream.once('close', () =>{
                    resolve();
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

        }catch(err){
            console.trace(err);
        }

    }

}

module.exports = Importer;