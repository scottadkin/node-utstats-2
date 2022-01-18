import Session from '../../api/session';
import Admin from '../../api/admin';
import SiteSettings from '../../api/sitesettings';

export default async function handler(req, res){


    const session = new Session(req);
    await session.load();

    if(await session.bUserAdmin()){

        //const adminManager = new Admin();
        const siteSettingsManager = new SiteSettings();

        const mode = req.body.mode ?? "";
        

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


        }

     
    }else{
        console.log("NOTE AN ADMIN");
        res.status(200).json({"error": "Only admins can perform that action."});
        return;
    }

    res.status(200).json({"error": "Unknown action."});

}