const config = require('../../config.json');
const Database = require('../database');
const Promise = require('promise');
const FTPImporter =  require('./ftpimporter');
const fs =  require('fs');
const Message = require('../message');
const MatchManager = require('./matchmanager');


class Importer{

    constructor(){

        this.ftpImporter = new FTPImporter();

        this.ftpImporter.events.on('finished', async () =>{

            
            try{
                this.logsToImport = [];
                await this.checkLogsFolder();
                const testData = await this.openLog(`${config.importedLogsFolder}/${this.logsToImport[2]}`)
               // console.log(await this.openLog(`${config.importedLogsFolder}/${this.logsToImport[0]}`));

                const test = new MatchManager(testData, `${this.logsToImport[2]}`);

            }catch(err){
                console.trace(err);
            }   

        });
    }


    async checkLogsFolder(){

        try{
            const files = await fs.readdirSync(config.importedLogsFolder);

            console.table(files);

            const fileExtReg = /^.+\.log$/i;

            for(let i = 0; i < files.length; i++){

                if(fileExtReg.test(files[i])){

                    if(files[i].toLowerCase().startsWith(config.logFilePrefix)){

                        this.logsToImport.push(files[i]);

                        new Message(`${files[i]} is a log file.`,'pass');

                    }else{
                        new Message(`${files[i]} does not have the prefix ${config.logFilePrefix}.`, 'pass');
                    }

                }else{
                    new Message(`${files[i]} is not a log file.`,'error');
                }
            }

            new Message(`Found ${this.logsToImport.length} log files to import.`, 'pass');
        }catch(err){
            console.trace(err);
        }   
    }
    

    async openLog(file){

        try{
            let data = fs.readFileSync(file);
            data = data.toString();

            data = data.replace(/\u0000/ig, '');

            return data;
        }catch(err){
            console.trace(err);
        }
        
    }


}

module.exports = Importer;