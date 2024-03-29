const Players = require("../../api/players");
const Player = require("../../api/player");
const CTF = require("../../api/ctf");
const Gametypes = require("../../api/gametypes");
const Telefrags = require("../../api/telefrags");
const Maps = require("../../api/maps");
const Winrate = require("../../api/winrate");
const Pings = require("../../api/pings");

export default async function handler(req, res){


    try{

        let mode = "";
        let playerId = -1;

        if(req.body.mode !== undefined){

            mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";
            playerId = (req.body.playerId !== undefined) ? parseInt(req.body.playerId) : -1;
        }

        if(req.query.mode !== undefined){

            mode = (req.query.mode !== undefined) ? req.query.mode.toLowerCase() : "";
            playerId = (req.query.playerId !== undefined) ? parseInt(req.query.playerId) : -1;
        }

        if(mode === "ctf"){

            const ctfManager = new CTF();
            const gametypeManager = new Gametypes();

            const gametypeIds = new Set();

            const totals = await ctfManager.getPlayerTotals(playerId);
            const best = await ctfManager.getPlayerBestValues(playerId);
            const bestLife = await ctfManager.getPlayerBestSingleLifeValues(playerId);

            for(let i = 0; i < totals.length; i++){
                gametypeIds.add(totals[i].gametype_id);
            }

            for(let i = 0; i < best.length; i++){
                gametypeIds.add(best[i].gametype_id);
            }

            for(let i = 0; i < bestLife.length; i++){
                gametypeIds.add(bestLife[i].gametype_id);
            }

            const gametypeNames = await gametypeManager.getNames([...gametypeIds]);

            res.status(200).json({"totals": totals, "best": best, "bestLife": bestLife, "gametypeNames": gametypeNames});
            return;

        }

        if(mode === "telefrags"){

            const teleFragManager = new Telefrags();

            const data = await teleFragManager.getPlayerTotals(playerId, true);

            const gametypeIds = [...new Set(data.map((d) =>{
                return d.gametype_id;
            }))];

            const mapIds = [...new Set(data.map((d) =>{
                return d.map_id;
            }))];


            const gametypeManager = new Gametypes();
            const gametypeNames = await gametypeManager.getNames(gametypeIds);

            const mapManager = new Maps();
            const mapNames = await mapManager.getNames(mapIds);
            
            res.status(200).json({"data": data, "gametypeNames": gametypeNames, "mapNames": mapNames});
            return;
        }

        if(mode === "map-stats"){

            const playerManager = new Players();
            const mapManager = new Maps();

            const data = await playerManager.getBasicMapStats(playerId);

            const mapIds = [...new Set(data.map((d) =>{
                return d.map;
            }))];

            const mapNames = await mapManager.getNamesByIds(mapIds, true);

            for(let i = 0; i < data.length; i++){

                const d = data[i];
                d.mapName = mapNames[d.map] ?? "Not Found";
            }

            res.status(200).json({"data": data});
            return;
        }


        if(mode === "winrates"){

            //const playerManager = new Players();
            const winrateManager = new Winrate();
            const gametypeManager = new Gametypes();
            const mapManager = new Maps();

            const data = await winrateManager.getAllPlayerCurrent(playerId);

            const uniqueMaps = new Set();
            const uniqueGametypes = new Set();

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                uniqueMaps.add(d.map);
                uniqueGametypes.add(d.gametype);
            }


            const gametypeNames = await gametypeManager.getNames([...uniqueGametypes]);
            const mapNames = await mapManager.getNamesByIds([...uniqueMaps], true);

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                d.mapName = mapNames[d.map] ?? "Not Found";
                d.gametypeName = gametypeNames[d.gametype] ?? "Not Found";
            }

            res.status(200).json({"data": data});
            return;
        }


        if(mode === "gametype-stats"){

            const gametypeManager = new Gametypes();
            const playerManager = new Player();

            const data = await playerManager.getProfileGametypeStats(playerId);

            const uniqueGametypes = new Set();

            for(let i = 0; i < data.length; i++){

                uniqueGametypes.add(data[i].gametype);
            }

            const gametypeNames = await gametypeManager.getNames([...uniqueGametypes], true);

            for(let i = 0; i < data.length; i++){

                const d = data[i];
                d.gametypeName = gametypeNames[d.gametype] ?? "Not Found";
            }

            res.status(200).json({"data": data});
            return;

        }


        if(mode === "ping"){

            const pingManager = new Pings();

            const {labels, data} = await pingManager.getPlayerHistoryGraphData(playerId, 100);

            res.status(200).json({"data": data, "labels": labels});
            return;
        }

        res.status(200).json({"error": "Unknown Command"});

    }catch(err){

        res.status(200).json({"error": err.toString()});
    }
}