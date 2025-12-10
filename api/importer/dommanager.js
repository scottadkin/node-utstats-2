import Domination, { bulkInsertControlPointCapData, bulkInsertPlayerScoreHistory } from "../domination.js";
import { getMapControlPoints } from "../domination.js";
import Message from "../message.js";
import { scalePlaytime } from "../generic.mjs";


export default class DOMManager{

    constructor(){

        this.data = [];
        this.domPoints = {};
        this.teamScores = {
            "red": 0,
            "blue": 0,
            "green": 0,
            "yellow": 0
        };

        this.playerCaps = {};
        this.playerScores = [];
        this.capData = [];
        this.domination = new Domination();
        this.playerControlPoints = {};
    }

    parseData(matchEnd, bHardcore){

        const domPointReg = /^\d+\.\d+\tnstats\tdom_point\t(.+?)\t(.+?),(.+?),(.+)$/i;
        const capReg = /^(\d+\.\d+)\tcontrolpoint_capture\t(.+?)\t(.+)$/;
        const teamScoreReg = /^\d+\.\d+\tdom_score_update\t(.+?)\t(.+?)$/;
        const playerScoreReg = /^(\d+\.\d+)\tdom_playerscore_update\t(.+?)\t(.+)$/i;


        for(let i = 0; i < this.data.length; i++){

            let currentPlayer = 0;

            const d = this.data[i];

            if(domPointReg.test(d)){

                const result = domPointReg.exec(d);
                this.createDomPoint(result[1],result[2],result[3],result[4]);
                continue;
            }

            if(capReg.test(d)){

                const result = capReg.exec(d);
       
                currentPlayer = this.playerManager.getPlayerById(result[3]);

                if(currentPlayer === null){
                    currentPlayer = {"masterId": -1};
                }else{

                    if(this.playerManager.bIgnoreBots && currentPlayer.bBot) continue;
                }

                this.pointCaptured(result[2], result[3]);
                
                this.capData.push({
                    "timestamp": parseFloat(result[1]),
                    "point": result[2],
                    "player": currentPlayer.masterId,
                    "team": this.playerManager.getPlayerTeamAt(currentPlayer.masterId, result[1])

                });

                continue;
            }
            
            if(teamScoreReg.test(d)){

                const result = teamScoreReg.exec(d);
                this.setTeamScore(result[1], result[2]);
                continue;

            }
            
            if(playerScoreReg.test(d)){

                const result = playerScoreReg.exec(d);
                currentPlayer = this.playerManager.getPlayerById(result[2]);

                if(currentPlayer !== null){

                    if(this.playerManager.bIgnoreBots){
                        if(currentPlayer.bBot) continue;
                    }

                    this.playerScores.push({
                        "timestamp": parseFloat(result[1]),
                        "player": currentPlayer.masterId,
                        "score": parseInt(result[3])
                    });

                    continue;

                }else{
                    new Message(`DomManager.parseData() playerScoreReg currentPlayer is null`,'warning');
                }
            }
        }


        this.setDetailedCapData(matchEnd, bHardcore);

    }



    setDetailedCapData(matchEnd, bHardcore){

        //this doesn't work, stop being stupid and do something different

        /*for(let i = 0; i < this.capData.length; i++){

            const d = this.capData[i];

            const timestamp = d.timestamp;

            if(this.playerControlPoints[d.player] === undefined){
                this.playerControlPoints[d.player] = {};
            }

            const point = this.getPoint(d.point);
      
            
            if(this.playerControlPoints[d.player][d.point] === undefined){

                this.playerControlPoints[d.player][d.point] = {
                    "timeHeld": 0,
                    "takenTimestamp": timestamp,
                    "timesTaken": 1,
                    "longestTimeHeld": 0,
                    "shortestTimeHeld": null
                };


                point.takenBy = d.player;
                point.takenTimestamp = timestamp;

                continue;
            }

            const playerStats = this.playerControlPoints[point.takenBy][d.point];

            const currentTimeTaken = timestamp - point.takenTimestamp;

            playerStats.timeHeld += currentTimeTaken;
            playerStats.timesTaken++;

            if(playerStats.shortestTimeHeld === null || playerStats.shortestTimeHeld > currentTimeTaken) playerStats.shortestTimeHeld = currentTimeTaken;

            if(currentTimeTaken > playerStats.longestTimeHeld) playerStats.longestTimeHeld = currentTimeTaken;

            point.takenTimestamp = timestamp;
            point.takenBy = d.player;

        }

        //console.log(this.playerControlPoints);

        //need to loop through points and add matchEnd -  takenTimestamp to active players

        for(const point of Object.values(this.domPoints)){

            const diff = matchEnd - point.takenTimestamp;

            const playerStats = this.playerControlPoints[point.takenBy][point.name];

            playerStats.timeHeld += diff;

            if(diff > playerStats.longestTimeHeld){
                playerStats.longestTimeHeld = diff;
            }

            if(playerStats.shortestTimeHeld === null || playerStats.shortestTimeHeld > diff) playerStats.shortestTimeHeld = diff;
        }

        
        console.log(this.playerControlPoints);*/
    }

    createDomPoint(name, x, y, z){

        this.domPoints[name] = {
            "name": name,
            "position": {
                "x": parseFloat(x),
                "y": parseFloat(y),
                "z": parseFloat(z),
            },
            "captured": 0,
            "takenBy": null,
            "takenTimestamp": null   
        };
    }


    getPoint(name){

        if(this.domPoints[name] !== undefined) return this.domPoints[name];

        return null;
    }

    pointCaptured(name, playerId){

        playerId = parseInt(playerId);

        const player = this.playerManager.getPlayerById(playerId);

        if(player === null){
            new Message(`DomManager.pointCaptured(${name},${playerId}) player is null.`,"warning");
            return;
        }

        let point = this.getPoint(name);

        if(point === null){
            this.createDomPoint(name, 0, 0, 0);
            point = this.getPoint(name);
        }

        //this.playerCaps.push(playerId);

        if(this.playerCaps[player.masterId] === undefined){
            this.playerCaps[player.masterId] = 0;
        }

        this.playerCaps[player.masterId]++;

        point.captured++;

    }

    setTeamScore(team, score){

        team = parseInt(team);
        score = parseFloat(score);

        switch(team){
            case 0: {this.teamScores.red = score; } break;
            case 1: {this.teamScores.blue = score; } break;
            case 2: {this.teamScores.green = score; } break;
            case 3: {this.teamScores.yellow = score; } break;
        }
    }


    async updateControlPointStats(){

       

        for(const d of Object.values(this.domPoints)){

            await this.domination.updateMapControlPoint(this.mapId, d.name, d.captured, d.position);
        }

      
    }

    async insertMatchControlPointStats(){

       
        for(const d of Object.values(this.domPoints)){
            await this.domination.updateMatchControlPoint(this.matchId, this.mapId, d.name, d.captured, d.team);
        }


    }

    async updateMatchDomCaps(){

        try{

            let total = 0;

            for(const d of Object.values(this.domPoints)){

                total += d.captured;
            }

            await this.domination.updateMatchDomCaps(this.matchId, total);


        }catch(err){
            new Message(`updateMatchDomCaps ${err}`,'error');
        }
    }

    async setPlayerDomCaps(){

        try{

            for(const player in this.playerCaps){

                const currentPlayer = this.playerManager.getPlayerByMasterId(player);

                if(currentPlayer !== null){

                    if(this.playerManager.bIgnoreBots){
                        if(currentPlayer.bBot) continue;
                    }

                    await this.domination.updatePlayerCapTotals(
                        currentPlayer.masterId, 
                        currentPlayer.gametypeId, 
                        this.playerCaps[player]
                    );
                    currentPlayer.stats.dom.caps = this.playerCaps[player];

                }else{
                    new Message(`setPlayerDomCaps currentPlayer is null`,'warning');
                }
            }
        }catch(err){    
            new Message(`setPlayerDomCaps ${err}`,'warning');
        }    
    }

    async updatePlayersMatchStats(matchId){

        try{


            if(matchId === undefined) matchId = this.matchId;

            const players = this.playerManager.players;

            for(let i = 0; i < players.length; i++){

                const p = players[i];

                if(p.stats.dom.caps > 0){

                    if(this.playerManager.bIgnoreBots){
                        if(p.bBot) continue;
                    }

                    await this.domination.updatePlayerMatchStats(matchId, p.masterId, p.stats.dom.caps);

                }else{
                    new Message(`${p.name} did not have any control point caps, skipping stats update.`,'pass');
                }
                
            }

        }catch(err){
            new Message(`updatePlayersMatchStats ${err}`,'error');
        }
    }



    async insertMatchControlPointCaptures(matchId, mapId){

        try{

            const pointIds = await getMapControlPoints(mapId);

            for(let i = 0; i < this.capData.length; i++){

                const d = this.capData[i];

                let pointId = pointIds?.[d.point] ?? -1;

                d.pointId = pointId;

            }

            await bulkInsertControlPointCapData(matchId, this.capData);


        }catch(err){
            new Message(err,'error');
        }   
    }


    async insertMatchPlayerScores(matchId){
        await bulkInsertPlayerScoreHistory(matchId, this.playerScores); 
    }


    setLifeCaps(killManager){

        for(let i = 0; i < this.capData.length; i++){

            const c = this.capData[i];

            const currentPlayer = this.playerManager.getPlayerByMasterId(c.player);

            if(currentPlayer !== null){

                const currentDeaths = killManager.getDeathsBetween(currentPlayer.stats.dom.lastCapTime, c.timestamp, c.player);

                currentPlayer.stats.dom.lastCapTime = c.timestamp;

                if(currentDeaths > 0){

                    currentPlayer.stats.dom.currentCaps = 1;

                }else{    
                    currentPlayer.stats.dom.currentCaps++;

                    if(currentPlayer.stats.dom.currentCaps > currentPlayer.stats.dom.mostCapsLife){
                        currentPlayer.stats.dom.mostCapsLife = currentPlayer.stats.dom.currentCaps;
                    }
                }
            }
        }
    }

    async updatePlayerLifeCaps(matchId){

        try{

            for(let i = 0; i < this.playerManager.players.length; i++){

                const p = this.playerManager.players[i];

                await this.domination.updatePlayerBestLifeCaps(p.gametypeId, p.masterId, p.stats.dom.mostCapsLife);
                await this.domination.updateMatchBestLifeCaps(p.masterId, matchId, p.stats.dom.mostCapsLife);
                
            }
            
        }catch(err){
            console.trace(err);
        }
    }
}