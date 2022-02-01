import Session from "../../api/session";
import Players from "../../api/players";
import Matches from "../../api/matches";


export default async function handler (req, res){

    try{

        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            console.log('ok');

            const mode = req.body.mode ?? "";

            if(mode === ""){

                res.status(200).json({"error": "No mode specified"});
                return;
            }

            const playerManager = new Players();


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

                if(await playerManager.deletePlayer(playerId ,matchManager)){

                    res.status(200).json({"message": `Player was deleted successfully`});
                    return;

                }else{

                    res.status(200).json({"error": `There was a problem deleting the player.`});
                    return;
                }

            }else if(mode === "merge"){

                const matchManager = new Matches();

                const player1 = req.body.player1 ?? null;
                const player2 = req.body.player2 ?? null;

                if(await playerManager.mergePlayers(player1, player2, matchManager)){

                    res.status(200).json({"message": "Merged players successfully"});
                    return;

                }else{

                    res.status(200).json({"error": "There was a problem merging the players."});
                    return;
                }
                //mergePlayers(first, second, matchManager)

            }else if(mode === "namesearch"){

                const name = req.body.name ?? null;

                if(name === null || name === ""){

                    res.status(200).json({"error": "Name for user search was null or blank."});
                    return;
                }

                const totalsResult = await playerManager.adminSearch(name, null);

                console.log(totalsResult);


            }

            res.status(200).json({"error": "Unknown mode"});
            return;

        }else{
            res.status(200).json({"error": "Only admins can perform that action."});
            return;
        }

    }catch(err){

        res.status(200).json({"error": err});
    }
}