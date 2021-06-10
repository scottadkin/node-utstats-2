import Session from '../../api/session';
import Items from '../../api/items';

export default async (req, res) =>{


    const session = new Session(req);

    await session.load();

    if(await session.bUserAdmin()){

       // console.log(req.body);

        if(req.body.data !== undefined){

            const data = req.body.data;

            const itemManager = new Items();

            await itemManager.adminUpdateEntries(data);

            res.status(200).json({"message": "passed"});
        }else{
            res.status(200).json({"message": "Data is undefined"});
        }

    }else{
        res.status(200).json({"message": "You need to be an admin to do this."});
    }
}