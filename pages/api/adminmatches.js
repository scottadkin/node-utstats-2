import Session from '../../api/session';
import Matches from '../../api/matches';
import SiteSettings from '../../api/sitesettings';
import Maps from '../../api/maps';
import Servers from '../../api/servers';
import Gametypes from '../../api/gametypes';

async function setMatchValues(matches, mapManager, serverManager, gametypeManager){

    const uniqueMaps = [];
    const uniqueServers = [];
    const uniqueGametypes = [];

    for(let i = 0; i < matches.length; i++){

        const m = matches[i];

        if(uniqueMaps.indexOf(m.map) === -1) uniqueMaps.push(m.map);
        if(uniqueServers.indexOf(m.server) === -1) uniqueServers.push(m.server);
        if(uniqueGametypes.indexOf(m.gametype) === -1) uniqueGametypes.push(m.gametype);

    }

    const mapNames = await mapManager.getNamesByIds(uniqueMaps, true);
    const serverNames = await serverManager.getNames(uniqueServers);
    const gametypeNames = await gametypeManager.getNames(uniqueGametypes);


    for(let i = 0; i < matches.length; i++){

        const m = matches[i];

        m.map = (mapNames[m.map] !== undefined) ? mapNames[m.map] : "Not Found";
        m.server = (serverNames[m.server] !== undefined) ? serverNames[m.server] : "Not Found";
        m.gametype = (gametypeNames[m.gametype] !== undefined) ? gametypeNames[m.gametype] : "Not Found";
    }
    
}

export default async function handler(req, res){

    try{

        const session = new Session(req);
        await session.load();

        if(await session.bUserAdmin()){

            const matches = new Matches();
            const settings = await SiteSettings.getSettings("Matches Page");
            const mapManager = new Maps();
            const serverManager = new Servers();
            const gametypeManager = new Gametypes();

            if(req.body.mode === undefined){

                res.status(200).json({"error": "No mode specified"});
                return;

            }else{

                const mode = req.body.mode.toLowerCase();

                if(mode === "invalidmatches"){
                    
                    const data = await matches.getInvalidMatches(settings["Minimum Players"], settings["Minimum Playtime"]);

                    await setMatchValues(data, mapManager, serverManager, gametypeManager);

                    res.status(200).json({"data": data});
                    return;

                }else if(mode === "settings"){

                    res.status(200).json({"data": settings});
                    return;

                }else if(mode === "delete"){

                    if(req.body.id !== undefined){

                        const id = parseInt(req.body.id);

                        if(id !== id){
                            res.status(200).json({"error": "Match id must be a valid integer."});
                            return;
                        }

                        if(await matches.deleteMatch(id)){
                            res.status(200).json({"message": "passed"});
                        }else{
                            res.status(200).json({"error": "There was a problem deleting the match"})
                        }

                        return;           

                    }else{

                        res.status(200).json({"error": "You have not specified a match to delete."});
                        return;
                    }

                }else if(mode === "duplicates"){

                    const dups = await matches.getDuplicates();
                    
                    res.status(200).json({"data": dups});
                    return;

                }else if(mode === "deleteduplicate"){

                    let latestId = (req.body.latest) ? parseInt(req.body.latest) : -1;
                    if(latestId !== latestId) latestId = -1;

                    let fileName = (req.body.file) ? req.body.file : -1;

                    if(latestId !== -1 && fileName !== -1){

                        const matchesToDelete = await matches.getPreviousDuplicates(fileName, latestId);

                        for(let i = 0; i < matchesToDelete.length; i++){

                            const m = matchesToDelete[i];

                            await matches.deleteMatch(m);
                        }

                        res.status(200).json({"message": "passed"});
                        return;

                    }else{

                        res.status(200).json({"error": "FileName and or latestId are invalid."});
                        return;
                    }
                    
                }

            }

        }else{

            res.status(200).json({"error": "Only admins can perform this action."});
            return;
        }

    }catch(err){

        console.trace(err);
        res.status(200).json({"error": err});
    }

}