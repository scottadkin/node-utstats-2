import Session from '../../api/session';
import User from '../../api/user';

export default async (req, res) =>{

    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const u = new User();

            await u.changeBanValue(req.body.id, req.body.value);

            res.status(200).json({"message": "passed"});

        }else{

            res.status(200).json({"message": "Only admins can do this."});
        }
        

    }catch(err){
        console.trace(err);
        res.status(200).json({"message": `Error: ${err}`});
    }   
}