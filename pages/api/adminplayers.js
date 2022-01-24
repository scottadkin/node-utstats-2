import Session from "../../api/session";
import Players from "../../api/players";

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

                const names = await playerManager.getAllNames();

                res.status(200).json({"names": names});
                return;

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