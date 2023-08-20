import Session from "../../api/session";
import Gametypes from "../../api/gametypes";
import Rankings from "../../api/rankings";
import Winrate from "../../api/winrate";
import Matches from "../../api/matches";
import Players from "../../api/players";
import CountriesManager from "../../api/countriesmanager";
import CTF from "../../api/ctf";
import Weapons from "../../api/weapons";

export default async function handler(req, res){

    try{
  

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const gametypeManager = new Gametypes();

            console.log(req.body);

            const mode = req.body.mode ?? "";

            if(mode === "all-details"){

                const data = await gametypeManager.getAll();

                res.status(200).json(data);
                return;
            }

            if(mode === "create"){


                const name = req.body.name ?? "";

                if(name === "") throw new Error("Gametype name can not be a blank string."); 

                const id = await gametypeManager.create(name);

               
                res.status(200).json({"message": "passed", "id": id});
                return;
            }

            if(mode === "rename"){

                const newName = req.body.newName;
                const gametypeId = parseInt(req.body.id);


                if(newName.length < 1){
                    res.status(200).json({"error": "Gametype name must be at least 1 characters long."});
                    return;
                }

                if(gametypeId !== gametypeId){
                    res.status(200).json({"error": "Gametype Id must be an integer."});
                    return;
                }

                if(gametypeId < 1){
                    res.status(200).json({"error": "GamtypeId must be a positve integer."});
                    return;
                }


                await gametypeManager.rename(gametypeId, newName);

                res.status(200).json({"message": "passed"});
                return;

            }else if(mode === "merge"){

                const oldId = req.body.oldGametypeId;
                const newId = req.body.newGametypeId;

                console.log(`oldgametypeId = ${oldId}`);
                console.log(`newGametypeId = ${newId}`);

                if(oldId === -1){

                    res.status(200).json({"message": "You have not selected a gametype to be merged."});
                    return;
                }

                if(newId === -1){
                    res.status(200).json({"message": "You have not selected a target gametype."});
                    return;
                }

                if(newId < 1 || oldId < 1){
                    res.status(200).json({"message": "Selected gametype ids must be a positive integer."});
                    return;
                }
         

                const rankingManager = new Rankings();
                await rankingManager.init();
                const winrateManager = new Winrate();

                const ctfManager = new CTF();

                const weaponsManager = new Weapons();
                const playersManager = new Players();

                await gametypeManager.merge(oldId, newId, rankingManager, winrateManager, ctfManager, weaponsManager, playersManager);

                
            }else if(mode === "delete"){

                console.log(`delete gametype`);

                const gametypeId = parseInt(req.body.gametypeId);

                if(gametypeId !== gametypeId){
                    res.status(200).json({"error": "Gametype id must be a valid integer."});
                    return;
                }

                if(gametypeId < 1){
                    res.status(200).json({"error": "Gametype id must be a positive integer."});
                    return;
                }

                const matchManager = new Matches();
                const playerManager = new Players();
                const countriesManager = new CountriesManager();

                await gametypeManager.deleteAllData(gametypeId, matchManager, playerManager, countriesManager);
                res.status(200).json({"message": "passed"});
                return;
            }

        }else{
            res.status(200).json({"error": "Only admins can perform this action."});
        }

        res.status(200).json({"error": "Unknown Command"});
        return;

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": err.toString()});
    }

    
}