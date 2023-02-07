import Kills from "../../api/kills";
import CTF from "../../api/ctf";
import Sprees from "../../api/sprees";
import Players from "../../api/players";
import Pings from "../../api/pings";
import Domination from "../../api/domination";
import Faces from "../../api/faces";
import Weapons from "../../api/weapons";
import Assault from "../../api/assault";
import Rankings from "../../api/rankings";
import Teams from "../../api/teams";
import Items from "../../api/items";

export default async function handler(req, res){

    try{

        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";
        const matchId = (req.body.matchId !== undefined) ? parseInt(req.body.matchId) : -1;
        const mapId = (req.body.mapId !== undefined) ? parseInt(req.body.mapId) : -1;
        const playerId = (req.body.playerId !== undefined) ? parseInt(req.body.playerId) : -1;
        const players = (req.body.players !== undefined) ? req.body.players : {};
        const playerIds = (req.body.playerIds !== undefined) ? req.body.playerIds : [];
        const gametypeId = (req.body.gametypeId !== undefined) ? parseInt(req.body.gametypeId) : -1;

        let killManager = null;

        if(mode === "kills" || mode === "kmu"){
            killManager = new Kills();
        }

        if(mode === "players"){

            const playerManager = new Players();
            const playerData = await playerManager.getAllInMatch(matchId);

            const uniqueFaces = playerManager.getUniqueFaces(playerData);

            const faceManager = new Faces();
            //console.log(data);
            const playerFaces = await faceManager.getFacesWithFileStatuses(uniqueFaces);

            res.status(200).json({"playerData": playerData, "playerFaces": playerFaces});
            return;
        }

        if(mode === "single-player"){

            const playerManager = new Players();
            const playerData = await playerManager.getSinglePlayerInMatch(matchId, playerId);

            const uniqueFaces = playerManager.getUniqueFaces(playerData);

            const faceManager = new Faces();
            //console.log(data);
            const playerFaces = await faceManager.getFacesWithFileStatuses(uniqueFaces);

            res.status(200).json({"playerData": playerData, "playerFaces": playerFaces});
            return;
        }

        if(mode === "teams"){

            const teamsManager = new Teams();

            let teamsData = await teamsManager.getMatchData(matchId);

            res.status(200).json({"data": teamsData});
            return;
        }

        if(mode === "ranking"){

            const rankingManager = new Rankings();

            const matchChanges = await rankingManager.getMatchRankingChanges(matchId);
            const currentRankings = await rankingManager.getCurrentPlayersRanking(playerIds, gametypeId);

            const currentPositions = {};

            for(let i = 0; i < currentRankings.length; i++){

                const c = currentRankings[i];
                currentPositions[c.player_id] = await rankingManager.getGametypePosition(c.ranking, gametypeId);
            }
      
            res.status(200).json({
                "matchChanges": matchChanges, 
                "currentRankings": currentRankings,
                "currentPositions": currentPositions
            });
            return;
        }

        if(mode === "assault"){

            const assaultManager = new Assault();

            const assaultData = await assaultManager.getMatchData(matchId, mapId);

            res.status(200).json(assaultData);
            return;
        }

        if(mode === "weapons"){

            const weaponManager = new Weapons();

            const data = await weaponManager.getMatchData(matchId);

            res.status(200).json({"names": data.names, "playerData": data.playerData});
            return;
        }

        if(mode === "player-weapons"){

            const weaponManager = new Weapons();

            const data = await weaponManager.getPlayerMatchData(playerId, matchId);

            const weaponIds = data.map((weapon) => weapon.weapon_id);

            const weaponNames = await weaponManager.getNamesByIds(weaponIds, true);

            res.status(200).json({"data": data, "names": weaponNames})
            return;
        }

        
        if(mode === "kills"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const teams = req.body.teams || 0;

            const data = await killManager.getGraphData(matchId, players, teams);

            res.status(200).json({"data": data});
            return;
        }
        
        if(mode === "ctfevents"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const ctfManager = new CTF();

            const teams = req.body.teams || 0;

            const data = await ctfManager.getEventGraphData(matchId, players, teams);

            res.status(200).json({"data": data});
            return;

        }
        
        if(mode === "ctfcaps"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const ctfManager = new CTF();

            const data = await ctfManager.getMatchCaps(matchId);

            res.status(200).json({"data": data});
            return;

        }
        
        if(mode === "sprees"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const spreeManager = new Sprees();

            let data = [];

            if(playerId === -1){
                data = await spreeManager.getMatchData(matchId);
            }else{
                data = await spreeManager.getPlayerMatchData(matchId, playerId);
            }

            res.status(200).json({"data": data});
            return;

        }

        if(mode === "scorehistory"){


            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const playerManager = new Players();
            const data = await playerManager.getScoreHistory(matchId, players);

            res.status(200).json({"data": data});
            return;

        }
        
        if(mode === "pings"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const pingManager = new Pings();

            const data = await pingManager.getMatchData(matchId, players);

            res.status(200).json({"data": data});
            return;

        }
        
        if(mode === "playerdomcaps"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const domManager = new Domination();

            const pointNames = await domManager.getControlPointNames(mapId);
            const playerPointTotals = await domManager.getMatchPlayerCapTotals(matchId);
            const pointsGraphData = await domManager.getPointsGraphData(matchId, pointNames);

            const playerCaps = await domManager.getPlayerCapsGraphData(matchId, pointNames);

            res.status(200).json({
                "pointsGraph": pointsGraphData, 
                "playerTotals": playerPointTotals, 
                "playerCaps": playerCaps,
                "pointNames": pointNames
            });
            return;

        }

        if(mode === "single-player-dom"){

            const domManager = new Domination();

            const pointNames = await domManager.getControlPointNames(mapId);
            const totalCaps = await domManager.getMatchSinglePlayerTotalCaps(matchId, playerId);

    
            res.status(200).json({"caps": totalCaps, "pointNames": pointNames});
            return;

        }
        
        if(mode === "fastestcaps"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const ctfManager = new CTF();
            const playerManager = new Players();

            const data = await ctfManager.getFastestMatchCaps(matchId);
            const recordCaps = await ctfManager.getFastestMapCaps(mapId, playerManager);

            res.status(200).json({"data": {
                "matchCaps": data,
                "recordCaps": recordCaps,
                "players": recordCaps.playerNames
            }});
            
            return;

        }
        
        if(mode === "kmu"){

            if(matchId !== matchId){
                res.status(200).json({"error": "Match id must be a valid integer"});
                return;
            }

            const data = await killManager.getKillsMatchUp(matchId);
            res.status(200).json({"data": data});
            return;
        }

        if(mode === "player-items"){

            const itemManager = new Items();

            const uses = await itemManager.getPlayerMatchData(matchId, playerId);
            const itemIds = Object.keys(uses);

            const itemNames = await itemManager.getNamesByIds(itemIds, true);

            res.status(200).json({"uses": uses, "itemNames": itemNames});
            return;
        }

        res.status(200).json({"error": "Unknown command"});

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": err.name});

    }
  
}