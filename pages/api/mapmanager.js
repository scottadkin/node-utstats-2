import Session from '../../api/session';
import Maps from '../../api/maps';
import Matches from '../../api/matches';
import Assault from '../../api/assault';
import CTF from '../../api/ctf';
import Domination from '../../api/domination';
import Combogib from '../../api/combogib';
import Weapons from '../../api/weapons';
import Players from '../../api/players';
import PowerUps from '../../api/powerups';
import Telefrags from '../../api/telefrags';
import WinRate from '../../api/winrate';


export default async function handler(req, res){

    try{

        const session = new Session(req);

        if(await session.bUserAdmin()){

            const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : null;

            const mapManager = new Maps();

            if(mode !== null){

                if(mode === "allimages"){

                    const data = mapManager.getAllUploadedImages();

                    res.status(200).json({"data": data});
                    return;

                }
                
                if(mode === "allnames"){

                    const data = await mapManager.getAllNames();

                    res.status(200).json({"data": data});
                    return;
                }

                if(mode === "alldetails"){

                    const data = await mapManager.getAll();

                    const names = data.map((d) =>{
                        return d.name;
                    });

                    names.sort();

                    res.status(200).json({"names": names, "data": data});
                    return;
                }

                if(mode === "rename"){

                    const id = (req.body.id !== undefined) ? parseInt(req.body.id) : NaN;
                    const newName = req.body.newName ?? "";

                    if(id !== id){
                        res.status(200).json({"error": "Target map must be a valid integer ID"});
                        return;
                    }

                    if(newName === ""){
                        res.status(200).json({"error": "New name can not be an empty string."});
                        return;
                    }

                    console.log(`rename map ${id} to ${newName}`);

                    await mapManager.rename(id, newName);
                    res.status(200).json({"message": "passed"});
                    return;
                }

                if(mode === "create"){

                    const name = req.body.name;
                    const title = req.body.title;
                    const author = req.body.author;
                    const idealPlayerCount = req.body.playerCount;
                    const levelEnterText = req.body.levelEnter;

                    let importAs = parseInt(req.body.importAs);
                    if(importAs !== importAs) importAs = 0;

                    const result = await mapManager.adminCreateMap(name, title, author, idealPlayerCount, levelEnterText, importAs);

                 
                    res.status(200).json({"insertId": result.insertId});
                    return;
                }


                if(mode === "merge"){


                    const matchManager = new Matches();
                    const assaultManager = new Assault();
                    const ctfManager = new CTF();
                    const domManager = new Domination();
                    const combogibManager = new Combogib();
                    const weaponsManager = new Weapons();
                    const playersManager = new Players();
                    const powerupsManager = new PowerUps();
                    const teleFragsManager = new Telefrags();
                    const winrateManager = new WinRate();

                    await mapManager.merge(req.body.map1, req.body.map2, matchManager, assaultManager, ctfManager, domManager, combogibManager, weaponsManager, 
                        playersManager, powerupsManager, teleFragsManager, winrateManager);


                    res.status(200).json({});
                    return;
                }

                res.status(200).json({"error": "Unknown mode"});
                return;
                

            }else{

                res.status(200).json({"error": "No action specified"});
                return;
            }

        }else{

            res.status(200).json({"error": "Only admins can perform this action"});
            return;
        }

    }catch(err){
        console.trace(err);

        res.status(200).json({"error": err.toString()});
    }
}