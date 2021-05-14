import Session from '../../api/session';
import Admin from '../../api/admin';

export default async (req, res) =>{

    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const a = new Admin();
    
            
            const duplicates = await a.getDuplicateMatches();

            const logNames = [];

            for(let i = 0; i < duplicates.length; i++){

                logNames.push(duplicates[i].name);
            }

            await a.deleteDuplicateMatches(logNames);

            console.log("ok");
        }

        res.status(200).json({"message": "meow"})

    }catch(err){
        res.status(200).json({"message": `Error: ${err}`});
    }
}