import Session from '../../api/session';
import Admin from '../../api/admin';

export default async (req, res) =>{

    try{
        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){   

            const body = JSON.parse(req.body);

            if(body.userId !== undefined){

                const a = new Admin();
                const result = await a.activateAccount(body.userId);

                if(result){
                    res.status(200).json({"message": "passed"});
                    return;
                }
            }

            res.status(200).json({"message": "failed"});

        }else{

            res.status(200).json({"message": "ACCESS DENIED!"});
        }

    }catch(err){

        console.trace(err);

        res.status(200).json({"message": `Error: ${err}`});
    }
}