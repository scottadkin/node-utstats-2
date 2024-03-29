import Session from "../../api/session";
import Players from "../../api/players";
import Matches from "../../api/matches";
import Combogib from "../../api/combogib";
import WinRate from "../../api/winrate";
import PlayerMerger from "../../api/playerMerger";


export default async function handler (req, res){

    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

           // console.log('ok');

            const mode = req.body.mode ?? "";

            if(mode === ""){

                res.status(200).json({"error": "No mode specified"});
                return;
            }

            const playerManager = new Players();


            //console.log(mode);

            if(mode === "assign-hwid"){

                const selectedPlayerIds = req.body.playerIds;
                const selectedHWID = req.body.hwid;

                const matchManager = new Matches();
                const combogibManager = new Combogib();

                const removedPlayerIds = await playerManager.adminAssignPlayerHWID(selectedPlayerIds, selectedHWID, matchManager, combogibManager);

                res.status(200).json({"message": "passed", "removedPlayerIds": removedPlayerIds})
                return;
            }

            if(mode === "force-hwid-to-name-list"){

                const data = await playerManager.getAllHWIDtoNames();

                const usage = await playerManager.adminGetHWIDUsageFromMatchData();

                /* const playerIds = [...new Set(usage.map((d) =>{
                    return d.player_id;
                }))];

                const playerNames = await playerManager.getNamesByIds(playerIds, true);*/

                const playerNames = await playerManager.getAllNames(false, true);
             
                res.status(200).json({"forceList": data, "usage": usage, "playerNames": playerNames});
                return;
            }

            if(mode === "set-force-hwid-to-name"){


                const hwid = (req.body.hwid !== undefined) ? req.body.hwid : "";
                const name = (req.body.name !== undefined) ? req.body.name : "";

                if(hwid === "") throw new Error("HWID can't be an empty string");
                if(name === "") throw new Error("Name can't be an empty string");

                await playerManager.adminAssignHWIDToName(hwid, name);

                res.status(200).json({"message": "passed"});
                return;
            }

            if(mode === "remove-force-hwid-to-name"){


                const hwid = (req.body.hwid !== undefined) ? req.body.hwid : "";

                if(hwid === "") throw new Error("HWID can't be an empty string");

                await playerManager.adminDeleteHWIDToName(hwid);


                res.status(200).json({"message": "passed"});
                return;
            }

            if(mode === "players-hwid-list"){

                const playersHWIDList = await playerManager.adminGetPlayersWithHWIDS();
                const playersList = await playerManager.adminGetPlayersBasic();

                res.status(200).json({"players": playersList, "hwidList": playersHWIDList});
                return;
            }

            if(mode === "recalculate-winrates"){

                const winrateManager = new WinRate();

                const playerIds = await playerManager.getAllPlayerIds();

                for(let i = 0; i < playerIds.length; i++){

                    await winrateManager.recalculatePlayerHistoryAfterMerge(playerIds[i]);
                }

                res.status(200).json({"message": "passed"});
                return;
            }

            if(mode === "namesearch"){

                const name = req.body.name ?? null;

                if(name === null || name === ""){

                    res.status(200).json({"error": "Name for user search was null or blank."});
                    return;
                }

                const result = await playerManager.adminTotalsSearchFor("name", name);

                res.status(200).json({"names": result});
                return;
            }

            if(mode === "general"){

                const totalPlayers = await playerManager.getTotalPlayers();
                const totalUniqueIps = await playerManager.getTotalUniqueIps();

                const now = Math.floor(Date.now() * 0.001);
                const day = (60 * 60) * 24;
                const week = day * 7;
                const month = day * 28;

                const playersLast24Hours = await playerManager.getUniquePlayersBetween(now - day, now);
                const playersLastWeek = await playerManager.getUniquePlayersBetween(now - week, now);
                const playersLastMonth = await playerManager.getUniquePlayersBetween(now - month, now);

                res.status(200).json({
                    "totalPlayers": {"allTime": totalPlayers,"past24Hours": playersLast24Hours, "pastWeek": playersLastWeek, "pastMonth": playersLastMonth},
                    "uniqueIps": totalUniqueIps
                });
                return;

            }else if(mode === "allnames"){

                const names = await playerManager.getNameIdPairs();

                res.status(200).json({"names": names});
                return;

            }else if(mode === "rename"){

                const oldName = req.body.oldName ?? null;
                const newName = req.body.newName ?? null;

                if(oldName === null){
                    res.status(200).json({"error": `oldName is null.`});
                    return;
                }

                if(newName === null){
                    res.status(200).json({"error": `newName is null.`});
                    return;
                }

                if(newName.length < 1){
                    res.status(200).json({"error": `newName's length can not be 0.`});
                    return;
                }

                if(newName.length >= 30){
                    res.status(200).json({"error": `newName's length must be less than 30 characters long.`});
                    return;
                }

                if(await playerManager.renamePlayer(oldName, newName)){

                    res.status(200).json({"message": `Renamed ${oldName} to ${newName} successfully`});
                    return;

                }else{

                    res.status(200).json({"error": `There was a problem renaming the player.`});
                    return;
                }

            }else if(mode === "delete"){

                const matchManager = new Matches();

                const playerId = req.body.playerId ?? null;

                if(playerId === null){
                    res.status(200).json({"error": `PlayerId was null.`});
                    return;
                }

                if(await playerManager.deletePlayer(playerId, matchManager)){

                    res.status(200).json({"message": `Player was deleted successfully`});
                    return;

                }else{

                    res.status(200).json({"error": `There was a problem deleting the player.`});
                    return;
                }

            }else if(mode === "merge-hwid-usage"){
                
                const profile = (req.body.profile === undefined) ? -1 : parseInt(req.body.profile);
                const hwid = (req.body.hwid === undefined) ? "" : req.body.hwid;
                

                
                if(profile < 1) throw new Error(`Player profile id can not be 0 or lower.`);
                if(hwid.length === 0) throw new Error(`HWID can't be a blank string.`);

                const pm = new PlayerMerger(null,profile, hwid);
                await pm.mergeHWID();

                res.status(200).json({"message": "Merge Complete."});

                return;

            }else if(mode === "merge"){

                const matchManager = new Matches();
                const combogibManager = new Combogib();

                const player1 = req.body.player1 ?? null;
                const player2 = req.body.player2 ?? null;

                const pm = new PlayerMerger(player1, player2);
                await pm.merge();

                res.status(200).json({"message": "passed"});
                return;

                /*if(await playerManager.mergePlayersById(player1, player2, matchManager, combogibManager)){

                    res.status(200).json({"message": "Merged players successfully"});
                    return;

                }else{

                    res.status(200).json({"error": "There was a problem merging the players."});
                    return;
                }*/
                //mergePlayers(first, second, matchManager)

            }/*else if(mode === "namesearch"){

                //old method don't use
                const name = req.body.name ?? null;

                if(name === null || name === ""){

                    res.status(200).json({"error": "Name for user search was null or blank."});
                    return;
                }

                const result = await playerManager.adminTotalsSearchFor("name", name);

                res.status(200).json({"names": result});
                return;

            }*/else if(mode === "ipsearch"){

                const ip = req.body.ip ?? null;

                if(ip === null || ip === ""){

                    res.status(200).json({"error": "ip for user search was null or blank."});
                    return;
                }

                const result = await playerManager.bulkIpSearch([ip]);


                res.status(200).json({"ips": result});
                return;

            }else if(mode === "nameip"){

                const ip = req.body.ip ?? null;
                const name = req.body.name ?? null;

                let ipResult = [];

                if(ip !== null && ip !== ""){
                    ipResult = await playerManager.adminTotalsSearchFor("ip", ip);
                }

                let nameResult = [];

                if(name !== null && name !== ""){
                    nameResult = await playerManager.adminTotalsSearchFor("name", name);
                }

                res.status(200).json({"ips": ipResult, "names": nameResult});
                return;

            }else if(mode === "ipSearch"){

                const ip = req.body.ip ?? null;

                if(ip === null){
                    res.status(200).json({"error": "You have not entered an IP address."});
                    return;
                }

                console.log(`search for ${ip}`);

                const result = await playerManager.getFullIPHistory(ip);
                
                res.status(200).json({"matchData": result.matchData, "playerNames": result.playerNames});
                return;

            }else if(mode === "hwidSearch"){

                const hwid = req.body.hwid ?? null;

                console.log(`search for ${hwid}`);
                
                const result = await playerManager.adminHWIDSearch(hwid);

                res.status(200).json(result);
                return;
                
            }else if(mode === "playerhistory"){

                const playerId = req.body.playerId ?? -1;

                if(playerId === -1){
                    res.status(200).json({"error": "You have not selected a player."});
                    return;
                }

                const result = await playerManager.getFullHistory(playerId);

                res.status(200).json(result);
                return;

            }else if(mode === "connections"){

                const playerId = req.body.playerId ?? -1;
                const perPage = req.body.perPage ?? -1;
                const page = req.body.page ?? -1;

                if(playerId === -1){

                    res.status(200).json({"error": "No player selected."});
                    return;
                }

                const result = await playerManager.getConnectionsById(playerId, page, perPage);
                const totalConnections = await playerManager.getTotalConnectionsById(playerId);

                res.status(200).json({"data": result, "totalConnections": totalConnections});
                return;

            }else if(mode === "player-list"){

                const result = await playerManager.getAllNames(false, false);
            
                res.status(200).json({"players": result});
                return;
            }

            res.status(200).json({"error": "Unknown mode"});
            return;

        }else{
            res.status(200).json({"error": "Only admins can perform that action."});
            return;
        }

    }catch(err){

        console.trace(err);
        res.status(200).json({"error": err.toString()});
    }
}