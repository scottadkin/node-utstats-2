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

            if(mode === "settingCategories"){

                const data = await siteSettingsManager.getCategoryNames();

                res.status(200).json({"data": data});
                return;

            }else if(mode === "loadSettingsCategory"){

                const catName = req.body.cat ?? "";
                const data = await siteSettingsManager.getCategory(catName);
                
                const validSettings = await siteSettingsManager.getValidSettings(catName);

                res.status(200).json({"data": data, "valid": validSettings});
                return;

            }else if(mode === "changeSetting"){

                const settingType = req.body.settingType ?? "";

                if(settingType === ""){

                    res.status(200).json({"error": "Setting supplied was blank"});
                    return;
                }

                const settingValue = req.body.value ?? "";

                if(settingValue === ""){

                    res.status(200).json({"error": "Setting Value supplied was blank"});
                    return;
                }

                const settingCategory = req.body.settingCategory ?? "";

                if(settingCategory === ""){

                    res.status(200).json({"error": "Setting Category supplied was blank"});
                    return;
                }

                
                
                if(await siteSettingsManager.updateSetting(settingCategory, settingType, settingValue)){

                    res.status(200).json({"message": "passed"});
                    return;
                }else{
                    res.status(200).json({"error": "No rows in the database where changed."});
                    return;
                }


            }else if(mode === "settingsUpdateOrder"){

                const newIds = req.body.data ?? [];

                if(newIds.length !== 0){

                    const result = await siteSettingsManager.updateSettingsOrder(newIds);

                    if(result.length === 0){

                        res.status(200).json({"message": "Site settings category order updated successfully."});
                        return;

                    }else{

                        let resultString = "";

                        for(let i = 0; i < result.length; i++){

                            resultString += ` ${result[i]}`;

                            if(i < result.length - 1) resultString += `,`;

                        }

                        res.status(200).json({"error": `Some rows did not update. Rows with Ids ${resultString} failed to update.`});
                        return;
                    }
                    
                }else{
                    
                    res.status(200).json({"error": "There where no rows to update."});
                    return;
                }

            }else if(nexgenTypes.indexOf(mode) !== -1){

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