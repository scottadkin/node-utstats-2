import Session from '../../api/session';

export default async (req, res) =>{

    try{
  

        const session = new Session(req);

        await session.load();

        console.log(session.settings);

        if(session.settings.bAdmin){
            res.status(200).json({"message": "passed"});
        }else{
            res.status(200).json({"message": "Only admins can perform this action."});
        }

    }catch(err){
        console.trace(err);
    }

    
}