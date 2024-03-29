import Session from "../../api/session";
import Matches from "../../api/matches";
import SiteSettings from "../../api/sitesettings";
import Maps from "../../api/maps";
import Servers from "../../api/servers";
import Gametypes from "../../api/gametypes";
import Logs from "../../api/logs";
import Players from "../../api/players";
import Message from "../../api/message";

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


function getFailedIds(logIds, matchIds){


    function isInBoth(num){

        if(logIds.indexOf(num) === -1){
            return num;
        }
        return false;
    }

    return matchIds.filter(isInBoth);

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

            let perPage = req.body.perPage ?? 25;
            let page = req.body.page ?? 1;

            page = parseInt(page);
            if(page !== page) page = 1;
            if(page < 1) page = 1;
            page--;

            const defaultPerPage = 25;
            perPage = parseInt(perPage);
            if(perPage !== perPage) perPage = defaultPerPage;
            if(perPage < 5 || perPage > 500) perPage = defaultPerPage;

            let serverId = req.body.serverId ?? 0;
            let gametypeId = req.body.gametypeId ?? 0;
            let mapId = req.body.mapId ?? 0;

            serverId = parseInt(serverId);
            gametypeId = parseInt(gametypeId);
            mapId = parseInt(mapId);

            if(serverId !== serverId) serverId = 0;
            if(gametypeId !== gametypeId) gametypeId = 0;
            if(mapId !== mapId) mapId = 0;

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

                        const players = new Players();

                        if(await matches.deleteMatch(id, players)){
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

                    console.log(req.body);
                    

                    let latestId = (req.body.latest) ? parseInt(req.body.latest) : -1;
                    if(latestId !== latestId) latestId = -1;

                    const fileName = (req.body.file) ? req.body.file : -1;

                    console.log(`fileName = ${fileName}`);

                    if(fileName === -1){
                        new Message(`Delete Duplicate match, fileName is -1`,"error");
                    }

                    if(latestId !== -1 && fileName !== -1){

                        const matchesToDelete = await matches.getPreviousDuplicates(fileName, latestId);

                        console.log(`matchesToDelete`);
                        console.log(matchesToDelete);
                     
                        for(let i = 0; i < matchesToDelete.length; i++){

                            const m = matchesToDelete[i];
                            const players = new Players();

                            if(await matches.deleteMatch(m, players)){

                                console.log(`Match with id ${m} deleted successfully`);

                            }else{

                                console.log(`Match with id ${m} delete FAILED`);
                            }
                        }

                        await Logs.deleteAllZeroLogIds();

                        res.status(200).json({"message": "passed"});
                        return;

                    }else{

                        res.status(200).json({"error": "FileName and or latestId are invalid."});
                        return;
                    }
                    
                }else if(mode === "orphanedids"){

                    const logIds = await Logs.getAllMatchIds();
                    const matchIds = await matches.getAllIds();

                    const failedIds = getFailedIds(logIds, matchIds);

                    const basicData = await matches.getBasicByIds(failedIds);

                    
                    res.status(200).json({"data": basicData});
                    return;

                }
                if(mode === "admin-search"){


                    const data = await matches.adminGet(page, perPage, serverId, gametypeId, mapId);
                    const totalMatches = await matches.adminGetTotalMatches(serverId, gametypeId, mapId);
                    data.totalMatches = totalMatches;

                    res.status(200).json(data);
                    return;
                }
                
                if(mode === "admin-get-total-matches"){

                    const totalMatches = await matches.adminGetTotalMatches(serverId, gametypeId, mapId);

                    res.status(200).json({"totalMatches": totalMatches});
                    return;
                }

                if(mode === "get-all-names"){

                    const serverNames = await serverManager.getAllNames();
                    const gametypeNames = await gametypeManager.getAllNames();
                    const mapNames = await mapManager.getAllNameAndIds();

                    res.status(200).json({
                        "serverNames": serverNames,
                        "gametypeNames": gametypeNames, 
                        "mapNames": mapNames
                    });

                    return;
                }
            }

            res.status(200).json({"error": "Unknown command"});
            return;

        }else{

            res.status(200).json({"error": "Only admins can perform this action."});
            return;
        }

    }catch(err){

        console.trace(err);
        res.status(200).json({"error": err.toString()});
    }

}