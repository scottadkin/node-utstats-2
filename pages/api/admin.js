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
        const catName = req.body.cat ?? "";

        console.log(`mode = ${mode}`);

        if(mode === "settingCategories"){

            const data = await siteSettingsManager.getCategoryNames();

            res.status(200).json({"data": data});
            return;

        }else if(mode === "loadSettingsCategory"){

            const data = await siteSettingsManager.getCategory(catName);

            res.status(200).json({"data": data});
            return;

        }

     
    }else{
        console.log("NOTE AN ADMIN");
        res.status(200).json({"error": "Only admins can perform that action."});
        return;
    }

    res.status(200).json({"error": "Unknown action."});

}