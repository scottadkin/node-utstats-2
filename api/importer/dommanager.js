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

        this.domination = new Domination();
    }

    parseData(){

        const domPointReg = /^\d+\.\d+\tnstats\tdom_point\t(.+?)\t(.+?),(.+?),(.+)$/i;
        const capReg = /^(\d+\.\d+)\tcontrolpoint_capture\t(.+?)\t(.+)$/;
        const teamScoreReg = /^\d+\.\d+\tdom_score_update\t(.+?)\t(.+?)$/;

        let d = 0;
        let result = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(domPointReg.test(d)){

                result = domPointReg.exec(d);

                this.createDomPoint(result[1],result[2],result[3],result[4]);
              

            }else if(capReg.test(d)){

                result = capReg.exec(d);

                this.pointCaptured(result[2], result[3]);

                

            }else if(teamScoreReg.test(d)){

                result = teamScoreReg.exec(d);

                this.setTeamScore(result[1], result[2]);
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

                await this.domination.updateMatchControlPoint(this.matchId, this.mapId, d.name, d.captured);
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
}


module.exports = DOMManager;