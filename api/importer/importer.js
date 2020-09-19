import config from '../../config.js';
import Database from '../database.js';
import Promise from 'promise';
import FTPImporter from './ftpimporter.js';
import fs from 'fs';
import Message from '../message.js';
import LogParser from './logparser.js';


class Importer{

    constructor(){

        this.ftpImporter = new FTPImporter();

        this.ftpImporter.events.on('finished', async () =>{

            
            try{
                this.logsToImport = [];
                await this.checkLogsFolder();
                const testData = await this.openLog(`${config.importedLogsFolder}/${this.logsToImport[4]}`)
               // console.log(await this.openLog(`${config.importedLogsFolder}/${this.logsToImport[0]}`));

                const test = new LogParser(testData);

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

export default Importer;