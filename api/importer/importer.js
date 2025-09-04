import config from "../../config.json" with {"type": "json"};
import FTPImporter from "./ftpimporter.js";
import fs from "fs";
import Message from "../message.js";
import MatchManager from "./matchmanager.js";
import AceManager from "./acemanager.js";
import { simpleQuery } from "../database.js";
import SFTPImporter from "./sftpimporter.js";
import {bExists as logsBExists} from "../logs.js";
import ACE from "../ace.js";
import Encoding from "encoding-japanese";
//const jschardet = require("jschardet")

export default class Importer{

    constructor(serverId, host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles, 
        bIgnoreBots, bIgnoreDuplicates, minPlayers, minPlaytime, bSFTP, bImportAce,
        bDeleteAceLogs, bDeleteAceScreenshots, bUseACEPlayerHWID, bSkipFTP){

        bSkipFTP = bSkipFTP ?? false;


        if(!bSkipFTP){

            if(!bSFTP){
                this.ftpImporter = new FTPImporter(host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles, bIgnoreDuplicates, bImportAce,
                    bDeleteAceLogs, bDeleteAceScreenshots);
            }else{
                this.ftpImporter = new SFTPImporter(host, port, user, password, targetDir, bDeleteAfter, bDeleteTmpFiles, bIgnoreDuplicates, bImportAce,
                    bDeleteAceLogs, bDeleteAceScreenshots);
            }
        }

        this.aceManager = new AceManager();
        
        this.updatedPlayers = [];
        this.updatedGametypes = [];
        this.serverId = serverId;
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.targetDir = targetDir;
        this.bDeleteAfter = bDeleteAfter;
        this.bIgnoreDuplicates = bIgnoreDuplicates;
        this.bIgnoreBots = bIgnoreBots;
        this.logsToImport = [];
        this.aceLogsToImport = [];
        this.minPlayers = minPlayers;
        this.minPlaytime = minPlaytime;
        this.bSFTP = bSFTP;
        this.bSkipFTP = bSkipFTP;
        this.bLogsFolderImport = bSkipFTP;
        this.bUseACEPlayerHWID = bUseACEPlayerHWID;

        if(this.bLogsFolderImport){
            this.ace = new ACE();
        }
    }


    async import(){


        if(!this.bSkipFTP){
            await this.ftpImporter.import();
            await this.standardImport();
        }else{
            await this.nonFtpImport();        
        }

    }


    updateCurrentUpdatedStats(currentData){

        if(currentData === undefined){
            new Message(`Importer.updateCurrentUpdatedStats() currentData is undefined`,"warning");
            return;
        }

        if(currentData !== null){
            this.addUpdatedPlayers(currentData.updatedPlayers);
            this.addUpdatedGametype(currentData.updatedGametype);
        }
    }

    async importACENonFTPScreenshots(){

        new Message("Checking ./Logs for ACE screenshots.", "note");

        const files = fs.readdirSync("./Logs");

        const prefix = config.ace.screenshotPrefix.toLowerCase();
        const extension = config.ace.screenshotExtensionType.toLowerCase();

        for(let i = 0; i < files.length; i++){

            const originalName = files[i];
            const f = files[i].toLowerCase();

            if(f.endsWith(extension) && f.startsWith(prefix)){

                new Message(`Found ACE screenshot ${originalName} to import.`,"pass");

                const bAlreadyImported = await this.ace.bScreenshotImported(f);

                if(this.bIgnoreDuplicates){

                    if(bAlreadyImported){

                        new Message(`ACE screenshot ${originalName} has already been imported skipping.`, "note");
                        fs.renameSync(`./Logs/${originalName}`, `./public/images/ace/${originalName}`);
                        continue;
                    }
                }

                await this.ace.updateScreenshotTable(originalName);
                await this.ace.updateTypeTotals("screenshot", null, null);

                fs.renameSync(`./Logs/${originalName}`, `./public/images/ace/${originalName}`);
            }
        }
    }

    async importLogs(){

        try{

            this.checkLogsFolder();
            await this.updateTotalImports();


            const totalLogs = this.logsToImport.length;

            for(let i = 0; i < totalLogs; i++){

                const f = this.logsToImport[i];

                if(this.bLogsFolderImport){
                    
                    if(this.bIgnoreDuplicates){

                        if(await logsBExists(f)){

                            new Message(`The file ${f} has already been imported, skipping.`,"note");
                            fs.renameSync(`${config.importedLogsFolder}/${f}`,`Logs/imported/${f}`);
                            continue;
                        }
                    }
                    
                }

                new Message(`Starting import of log number ${i + 1} of ${totalLogs}`,'progress');
                
                const logData = await this.openLog(`${config.importedLogsFolder}/${f}`);

                const log = new MatchManager(logData, f, this.bIgnoreBots, this.minPlayers, this.minPlaytime, this.bUseACEPlayerHWID);

                
                if(!log.bLinesNull){

                    
                    const currentData = await log.import();

                    if(!log.bFoundRealMatchStart){

                        fs.renameSync(`${config.importedLogsFolder}/${f}`,`Logs/rejected/missing-start/${f}`);
    
                    }else if(log.mapInfo.maps.bMergeError){

                        fs.renameSync(`${config.importedLogsFolder}/${f}`,`Logs/rejected/map-merge-error/${f}`);

                    }else if(log.bUnderMinPlaytime){
                        
                        fs.renameSync(`${config.importedLogsFolder}/${f}`,`Logs/rejected/under-playtime/${f}`);
                        
                    }else if(log.bUnderMinPlayerLimit){

                        fs.renameSync(`${config.importedLogsFolder}/${f}`,`Logs/rejected/under-player-limit/${f}`);
                        
                    }else{

                        fs.renameSync(`${config.importedLogsFolder}/${f}`,`Logs/imported/${f}`);
                    }
                    
                    this.updateCurrentUpdatedStats(currentData);

                    await this.updateImportStats();
                    
                
                }else{
                    fs.renameSync(`${config.importedLogsFolder}/${f}`,`Logs/rejected/null-lines/${f}`);
                    new Message("log.bLinesNull = true, skipping log import. File moved to Log/imported/","error");
                }
            }

            for(let i = 0; i < this.aceLogsToImport.length; i++){

                const f = this.aceLogsToImport[i];

                let data = "";
                let mode = "";

                if(f.startsWith(config.ace.playerJoinLogPrefix)){

                    data = await this.openLog(`${config.importedLogsFolder}/${f}`);
                    mode = "join";

                }else if(f.startsWith(config.ace.kickLogPrefix)){

                    data = await this.openLog(`${config.importedLogsFolder}/${f}`, true);
                    mode = "kick";
                }

                await this.aceManager.importLog(f, mode, data);

                await this.aceManager.updateTypeTotals(mode, this.host, this.port);
            }

            //this.myEmitter.emit("passed");


        }catch(err){

            console.trace(err);
        }

    }

    async standardImport(){

        try{

            await this.importLogs();

        }catch(err){
            console.trace(err);
        }
       /* this.ftpImporter.events.on('finished', async () =>{
                          
            try{
                
                await this.importLogs();

            }catch(err){
                console.trace(err);
                //this.myEmitter.emit("error");
            }   
        });*/
    }

    async nonFtpImport(){

        try{

            new Message(`Import running without FTP.`,'note');

            await this.importACENonFTPScreenshots();
            await this.importLogs();
            
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

    checkLogsFolder(){

        try{


            const files = fs.readdirSync(`Logs/`);

            const fileExtReg = /^.+\.log$/i;

            const logPrefix = config.logFilePrefix.toLowerCase();

            for(let i = 0; i < files.length; i++){

                const f = files[i];

                const fileName = f.toLowerCase();
                
                if(fileExtReg.test(fileName)){

                    if(fileName.startsWith(logPrefix)){

                        this.logsToImport.push(f);

                    }else{
                       
                        this.aceLogsToImport.push(f);
                        
                    }
                }
            }

            new Message(`Found ${this.logsToImport.length} log files to import.`, 'pass');

        }catch(err){
            console.trace(err);
        }   
    }
    

    async openLog(file, bAceLog){

        try{

            let data = fs.readFileSync(file, /*"utf16le"/*, encoding*/);

            const currentFileEncoding = Encoding.detect(data);

            
            if(currentFileEncoding !== "UTF16"){

                data = Encoding.codeToString(Encoding.convert(data, {
                    "to": "UTF16",
                    "from": currentFileEncoding
                }));
            }

            data = data.toString().replace(/\u0000/ig, '');
            
            return data;
            
        }catch(err){
            console.trace(err);
        }
     
    }

    async updateImportStats(){

        const now = Math.floor(Date.now() / 1000);

        const ending = (this.bLogsFolderImport) ? "WHERE id > -1" : "WHERE id=?";

        const query = `UPDATE ${(this.bLogsFolderImport) ? "nstats_logs_folder" : "nstats_ftp"} 
        SET total_logs_imported = total_logs_imported + 1,
        first = IF (first > ?, ?, IF(first=0, ?, first)),
        last = IF (last < ?, ?, last)
        ${ending}`;

        const vars = [now, now, now, now, now, this.serverId];

        await simpleQuery(query, vars);
    }

    async updateTotalImports(){

        let query = "";

        if(!this.bLogsFolderImport){
            query = `UPDATE nstats_ftp SET total_imports=total_imports+1 WHERE id=?`;
        }else{
            query = `UPDATE nstats_logs_folder SET total_imports=total_imports+1 WHERE id > -1`;
        }

        await simpleQuery(query, [this.serverId]);
    }
}
