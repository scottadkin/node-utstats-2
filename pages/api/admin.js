import Session from '../../api/session';
import SiteSettings from '../../api/sitesettings';
import NexgenStatsViewer from '../../api/nexgenstatsviewer';
import Servers from "../../api/servers";
import Backup from '../../api/backup';
import Admin from '../../api/admin';

export default async function handler(req, res){


    const session = new Session(req);
    await session.load();

    try{

        if(await session.bUserAdmin()){

            //const adminManager = new Admin();
            const siteSettingsManager = new SiteSettings();

            const mode = req.body.mode ?? "";
            
            const nexgenTypes = [
                "nexgensettings",
                "nexgensave",
                "nexgencreate",
                "nexgendelete"
            ];

            if(mode === "clear-tables"){

                const adminManager = new Admin();

                await adminManager.clearTables();

                res.status(200).json({"message": "passed"});
                return;
            }

            if(mode === "create-backup"){

                const backupManager = new Backup();

                await backupManager.dumpAllTablesToJSON();

                res.status(200).json({"message": "passed", "fileName": backupManager.fileName})
                return;
            }


            if(mode === "server-list"){

                const serverManager = new Servers();

                const serverList = await serverManager.adminGetServerList();

                res.status(200).json({"servers": serverList});
                return;
            }

            if(mode === "delete-server"){

                const serverId = req.body.serverId ?? -1;

                const serverManager = new Servers();

                await serverManager.adminDeleteServerById(serverId);

                res.status(200).json({"message": "passed"});
                return;
            }

            if(mode === "save-server-change"){

                const serverId = req.body.serverId ?? -1;
                const serverName = req.body.serverName ?? "";
                const serverIP = req.body.serverIP ?? "";
                const serverPort = req.body.serverPort ?? 0;
                const serverPassword = req.body.serverPassword ?? "";
                const serverManager = new Servers();
                const updateResult = await serverManager.adminUpdateServer(serverId, serverName, serverIP, serverPort, serverPassword);

                if(!updateResult){
                    res.status(200).json({"error": "No entries have been updated."});
                    return;
                }

                res.status(200).json({"message": "passed"});
    
                return;
            }

            if(mode === "get-current-settings"){

                const data = await siteSettingsManager.getAllSettings();

                res.status(200).json({"settings": data});
                return;
            }

            if(mode === "save-setting-changes"){

                const changes = req.body.changes ?? null;

                if(changes === null) throw new Error(`There was no changes to apply.`);

                await siteSettingsManager.updateSettings(changes);

                res.status(200).json({"message": "passed"});
                return;
            }
            
            if(nexgenTypes.indexOf(mode) !== -1){

                const nexgen = new NexgenStatsViewer();

                if(mode === "nexgensettings"){
        
                    const data = await nexgen.getCurrentSettings(false);
                    const types = nexgen.getAllTypes();
        
                    res.status(200).json({"data": data, "validTypes": types});
                    return;
        
                }else if(mode === "nexgensave"){
        
                    const data = req.body.settings;

                    const result = await nexgen.updateSettings(data);
        
                    if(result === true){
        
                        res.status(200).json({"message": "Passed"});
                        return;
                    }
        
                    res.status(200).json({"error": result});
                    return;
        
                }else if(mode === "nexgencreate"){
        
                    const data = req.body.settings;
        
                    await nexgen.createList(data);
        
                    res.status(200).json({"message": "passed"});
                    return;
        
                }else if(mode === "nexgendelete"){
        
                    const id = req.body.id;

                    const result = await nexgen.deleteList(id);

                    if(result){

                        res.status(200).json({"message": "passed"});
                        return;
                    }else{

                        res.status(200).json({"error": "Failed to delete nexgen list"});
                        return;
                    }
                }
            }
            


        
        }else{
            console.log("NOTE AN ADMIN");
            res.status(200).json({"error": "Only admins can perform that action."});
            return;
        }

        res.status(200).json({"error": "Unknown action."});

    }catch(err){
        res.status(200).json({"error": err.toString()})
        console.trace(err);
    }
}