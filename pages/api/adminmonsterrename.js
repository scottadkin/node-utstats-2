import Session from '../../api/session';
import MonsterHunt from '../../api/monsterhunt';

export default async (req, res) =>{

    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const mhManager = new MonsterHunt();

            if(req.body.monsterId !== undefined && req.body.name !== undefined){
                
                const id = parseInt(req.body.monsterId);
                const name = req.body.name;

                if(id === id){

                    if(name.length > 0){
                        
                        await mhManager.renameMonster(id, name);

                        res.status(200).json({"message": "passed"});

                    }else{
                        res.status(200).json({"message": "Monster name can not be an empty string."});
                    }

                }else{
                    res.status(200).json({"message": "Id must be a valid integer."});
                }

            }else{
                res.status(200).json({"message": "MonsterID and/or name are undefined."});
            }

        }else{

            res.status(200).json({"message": "Only admins can perform this action."});
        }

    }catch(err){
        console.trace(err);

        res.status(200).json({"message": err});
    }
}