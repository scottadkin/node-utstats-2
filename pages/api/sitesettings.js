import Session from '../../api/session';
import SiteSettings from '../../api/sitesettings';

export default async (req, res) =>{

    const s = new Session(req.headers.cookie);

    await s.load();

    console.log("req.headers.cookie");
    console.log(req.headers.cookie);

    const bUserAdmin = await s.bUserAdmin();

    console.log(bUserAdmin);

    if(bUserAdmin){

        const ss = new SiteSettings();

        await ss.updateSettings(req.body.data, req.body.category);

        res.status(200).json({"passed": "I dont know"});
    }else{

        res.status(200).json({"passed": "false", "reason": "Need admin to make these changes"});
    }

    console.log(req.body);
    
}