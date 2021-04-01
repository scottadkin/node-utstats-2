const config = require('../../config.json');
const FTPImporter =  require('./ftpimporter');
const fs =  require('fs');
const Message = require('../message');
const MatchManager = require('./matchmanager');

//add the new player score loggggggggggggggggging
class Importer{

    constructor(){

        this.ftpImporter = new FTPImporter();

        this.ftpImporter.events.on('finished', async () =>{


            let imported = 0;
            let failed = 0;
            let passed = 0;
            
            try{
                
                this.logsToImport = [];
                await this.checkLogsFolder();
                console.table(this.logsToImport);
                /*const testData = await this.openLog(`${config.importedLogsFolder}/${this.logsToImport[this.logsToImport.length - 1]}`)

                const test = new MatchManager(testData, `${this.logsToImport[this.logsToImport.length - 1]}`);

                test.import();*/

                let test = 0;
                let testData = 0;

                for(let i = 0; i < this.logsToImport.length; i++){

                    new Message(`Starting import of log number ${imported + 1} of ${this.logsToImport.length}`,'note');
                    testData = await this.openLog(`${config.importedLogsFolder}/${this.logsToImport[i]}`);
                    
                    test = new MatchManager(testData, this.logsToImport[i]);

                    await test.import();

                    imported++;

                }


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