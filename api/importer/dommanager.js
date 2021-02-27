const Domination = require('../domination');
const Message = require('../message');

class DOMManager{

    constructor(){

        this.data = [];
        this.domPoints = [];
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
    }

    parseData(){

        const domPointReg = /^\d+\.\d+\tnstats\tdom_point\t(.+?)\t(.+?),(.+?),(.+)$/i;
        const capReg = /^(\d+\.\d+)\tcontrolpoint_capture\t(.+?)\t(.+)$/;
        const teamScoreReg = /^\d+\.\d+\tdom_score_update\t(.+?)\t(.+?)$/;
        const playerScoreReg = /^(\d+\.\d+)\tdom_playerscore_update\t(.+?)\t(.+)$/i;

        let d = 0;
        let result = 0;
        let currentPlayer = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(domPointReg.test(d)){

                result = domPointReg.exec(d);

                this.createDomPoint(result[1],result[2],result[3],result[4]);
              

            }else if(capReg.test(d)){

                result = capReg.exec(d);

                this.pointCaptured(result[2], result[3]);

                currentPlayer = this.playerManager.getOriginalConnectionById(result[3]);

                if(currentPlayer === null){
                    currentPlayer = {"masterId": -1};
                }

                this.capData.push({
                    "timestamp": parseFloat(result[1]),
                    "point": result[2],
                    "player": currentPlayer.masterId,
                    "team": this.playerManager.getPlayerTeamAt(result[3], result[1])

                });

            }else if(teamScoreReg.test(d)){

                result = teamScoreReg.exec(d);
                this.setTeamScore(result[1], result[2]);

            }else if(playerScoreReg.test(d)){

                result = playerScoreReg.exec(d);

                currentPlayer = this.playerManager.getOriginalConnectionById(result[2]);

                if(currentPlayer !== null){

                    this.playerScores.push({
                        "timestamp": parseFloat(result[1]),
                        "player": currentPlayer.masterId,
                        "score": parseInt(result[3])
                    });

                }else{
                    new Message(`DomManager.parseData() playerScoreReg currentPlayer is null`,'warning');
                }
            }
        }

    }


    createDomPoint(name, x, y, z){

        this.domPoints.push({
            "name": name,
            "position": {
                "x": parseFloat(x),
                "y": parseFloat(y),
                "z": parseFloat(z),
            },
            "captured": 0      
        });
    }


    getPoint(name){

        let d = 0;

        for(let i = 0; i < this.domPoints.length; i++){

            d = this.domPoints[i];

            if(d.name === name){
                return d;
            }

        }

        return null;
    }

    pointCaptured(name, playerId){

        playerId = parseInt(playerId);

        let point = this.getPoint(name);

        if(point === null){
            this.createDomPoint(name, 0, 0, 0);
            point = this.getPoint(name);
        }

        //this.playerCaps.push(playerId);

        if(this.playerCaps[playerId] === undefined){
            this.playerCaps[playerId] = 0;
        }

        this.playerCaps[playerId]++;

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

    async updateTeamScores(){

        try{

            const s = this.teamScores;

            await this.domination.updateTeamScores(this.matchId, s.red, s.blue, s.green, s.yellow);

        }catch(err){
            new Message(`updateTeamScores ${err}`,'error');
        }   
    }

    async updateControlPointStats(){

        try{

            let d = 0;

            for(let i = 0; i < this.domPoints.length; i++){

                d = this.domPoints[i];

                await this.domination.updateMapControlPoint(this.mapId, d.name, d.captured);
            }

        }catch(err){
            new Message(`updateControlPointStats ${err}`, 'error');
        }
    }

    async insertMatchControlPointStats(){

        try{

            let d = 0;

            for(let i = 0; i < this.domPoints.length; i++){

                d = this.domPoints[i];

                await this.domination.updateMatchControlPoint(this.matchId, this.mapId, d.name, d.captured, d.team);
            }


        }catch(err){    

            new Message(`insertMatchControlPointStats ${err}`,'error');
        }
    }

    async updateMatchDomCaps(){

        try{

            let total = 0;

            for(let i = 0; i < this.domPoints.length; i++){

                total += this.domPoints[i].captured;
            }

            await this.domination.updateMatchDomCaps(this.matchId, total);


        }catch(err){
            new Message(`updateMatchDomCaps ${err}`,'error');
        }
    }

    async setPlayerDomCaps(){

        try{
            let p = 0;

            let currentPlayer = 0;

            for(const player in this.playerCaps){

                currentPlayer = this.playerManager.getOriginalConnectionById(player);

                if(currentPlayer !== null){

                    await this.domination.updatePlayerCapTotals(currentPlayer.masterId, currentPlayer.gametypeId, this.playerCaps[player]);
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
            
            let p = 0;

            const players = this.playerManager.players;

            for(let i = 0; i < players.length; i++){

                p = players[i];

                if(p.bDuplicate === undefined){
                    if(p.stats.dom.caps > 0){
                        await this.domination.updatePlayerMatchStats(p.matchId, p.stats.dom.caps);
                    }else{
                        new Message(`${p.name} did not have any control point caps, skipping stats update.`,'pass');
                    }
                }
            }

        }catch(err){
            new Message(`updatePlayersMatchStats ${err}`,'error');
        }
    }



    async insertMatchControlPointCaptures(matchId, mapId){

        try{


            const pointIds = await this.domination.getMapControlPoints(mapId);

            let d = 0;

            let pointId = 0;

            for(let i = 0; i < this.capData.length; i++){

                d = this.capData[i];

                pointId = pointIds.get(d.point);

                if(pointId === undefined){
                    pointId = -1;
                }

                await this.domination.insertPointCap(matchId, d.timestamp, d.player, pointId, d.team);
            }

        }catch(err){
            new Message(err,'error');
        }   
    }


    async insertMatchPlayerScores(matchId){

        try{

            let p = 0;

            for(let i = 0; i < this.playerScores.length; i++){

                p = this.playerScores[i];
                await this.domination.insertMatchPlayerScore(matchId, p.timestamp, p.player, p.score);
            }

        }catch(err){
            console.trace(err);
        }
    }
}


module.exports = DOMManager;