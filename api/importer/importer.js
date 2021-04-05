const config = require('../../config.json');
const FTPImporter =  require('./ftpimporter');
const fs =  require('fs');
const Message = require('../message');
const MatchManager = require('./matchmanager');
const WinRate = require('../winrate');

//add the new player score loggggggggggggggggging
class Importer{

    constructor(){

        this.ftpImporter = new FTPImporter();
        this.updatedPlayers = [];
        this.updatedGametypes = [];

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

                //let currentUpdatedPlayers = [];

                let currentData = [];

                for(let i = 0; i < this.logsToImport.length; i++){

                    new Message(`Starting import of log number ${imported + 1} of ${this.logsToImport.length}`,'progress');
                    testData = await this.openLog(`${config.importedLogsFolder}/${this.logsToImport[i]}`);
                    
                    test = new MatchManager(testData, this.logsToImport[i]);

                    currentData = await test.import();


                    this.addUpdatedPlayers(currentData.updatedPlayers);
                    this.addUpdatedGametype(currentData.updatedGametype);

                    imported++;

                }


               /* new Message(`Players Updated`,'progress');
                console.log(this.updatedPlayers);
                new Message(`Gametypes Updated`,'progress');
                console.log(this.updatedGametypes);

                this.recalculateWinRates();*/


            }catch(err){
                console.trace(err);
            }   

        });
    }

    async recalculateWinRates(){

        try{

            const winRateManager = new WinRate();

            if(this.updatedGametypes.length > 0) this.updatedGametypes.unshift(0);

            for(let i = 0; i < this.updatedGametypes.length; i++){

                for(let x = 0; x < this.updatedPlayers.length; x++){

                    new Message(`Starting WinRate recalculation of player${this.updatedPlayers[x]} for gametype ${this.updatedGametypes[i]}`,'note');
                    await winRateManager.recalculateWinRates(this.updatedPlayers[x], this.updatedGametypes[i]);

                }
            }

        }catch(err){
            console.trace(err);
        }
    }


    addUpdatedPlayers(players){

        for(let i = 0; i < players.length; i++){

            if(this.updatedPlayers.indexOf(players[i]) === -1){
                this.updatedPlayers.push(players[i]);
            }
        }
    }


    addUpdatedGametype(gametype){

        if(this.updatedGametypes.indexOf(gametype) === -1) this.updatedGametypes.push(gametype);
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