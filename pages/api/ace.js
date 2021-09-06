import Session from '../../api/session';
import ACE from '../../api/ace';

export default async(req, res) =>{

    try{

        const session = new Session(req);

        await session.load();

        console.log(req.body);

        if(await session.bUserAdmin()){

            const aceManager = new ACE();

            let mode = req.body.mode;

            if(mode === undefined){
                res.status(200).json({"error": "No mode specified."});
                return;
            }

            mode = mode.toLowerCase();

            if(mode === "player-search"){

                const name = req.body.name || "";
                const ip = req.body.ip || "";
                const hwid = req.body.hwid || "";
                const mac1 = req.body.mac1 || "";
                const mac2 = req.body.mac2 || "";

                if(name === "" && ip === "" && hwid === "" && mac1 === "" && mac2 === ""){
                    res.status(200).json({"error": "No search parameters specified"});
                    return;
                }

                const searchResult = await aceManager.playerSearch(name, ip, hwid, mac1, mac2);

                res.status(200).json({"message": "passed", "data": searchResult});
                return;

            }else if(mode === "player-report"){

                const name = req.body.name || "";

                if(name === ""){
                    res.status(200).json({"error": "No name specified"});
                    return;
                }

                const data = await aceManager.getPlayerReport(name);

                res.status(200).json({"playerData": data.playerData, "aliases": data.aliases, "uniqueVariables": data.uniqueVariables})

                return;

            }else if(mode === "player-joins"){

                const name = req.body.name || "";
                
                let page = 0;
                let perPage = 25;

                if(req.body.page !== undefined){

                    page = parseInt(req.body.page);
                    if(page !== page) page = 0;
                }

                if(req.body.perPage !== undefined){

                    perPage = parseInt(req.body.perPage);
                    if(perPage !== perPage) perPage = 10;
                }

                const data = await aceManager.getPlayerJoins(name, page, perPage);

                res.status(200).json({"data": data.data, "results": data.results});
                return;   

            }else if(mode === "player-kicks"){

                const name = req.body.name || "";
                let page = 0;
                let perPage = 10;

                if(req.body.perPage !== undefined){
                    perPage = parseInt(req.body.perPage);
                    if(perPage !== perPage) perPage = 10;
                }

                if(req.body.page !== undefined){
                    page = parseInt(req.body.page);
                    if(page !== page) page = 0;
                }

                const data = await aceManager.getPlayerKicks(name, page, perPage);
                const totalKicks = await aceManager.getTotalPlayerKicks(name);

                res.status(200).json({"data": data, "results": totalKicks});
                return;

            }else if(mode === "player-sshots"){

                const name = req.body.name || "";
                let page = 0;

                if(req.body.page !== undefined){
                    page = parseInt(req.body.page);
                    if(page !== page) page = 0;
                }

                const data = await aceManager.getPlayerScreenshotRequests(name, page);
                const totalSShots = await aceManager.getTotalPlayerScreenshotRequests(name);
                res.status(200).json({"data": data, "results": totalSShots});
                return;

            }else if(mode === "kick-logs"){

                let page = 0;
                let perPage = 25;

                if(req.body.page !== undefined){

                    page = parseInt(req.body.page);
                    if(page !== page) page = 1;
                }

                if(req.body.perPage !== undefined){

                    perPage = parseInt(req.body.perPage);
                    if(perPage !== perPage) perPage = 25;
                }

                const data = await aceManager.getLatestKickLogsBasic(page, perPage);
                const totalKickLogs = await aceManager.getTotalKicks();

                res.status(200).json({"data": data, "results": totalKickLogs});

                return;
            }

            res.status(200).json({"message": "passed"});

        }else{

            res.status(200).json({"error": "You have to be an admin to use this."});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": `Error: "${err.message}"`});
    }
    
}