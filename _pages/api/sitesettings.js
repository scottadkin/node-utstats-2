import Session from '../../api/session';
import SiteSettings from '../../api/sitesettings';

export default async function handler(req, res){

    const s = new Session(req);

    await s.load();


    const bUserAdmin = await s.bUserAdmin();

    console.log(bUserAdmin);

    if(bUserAdmin){

        const ss = new SiteSettings();

        const bPassed = await ss.updateSettings(req.body.data, req.body.category);

        res.status(200).json({"bPassed": bPassed});

    }else{

        res.status(200).json({"bPassed": "false", "reason": "Need admin to make these changes"});
    }

    console.log(req.body);
    
}