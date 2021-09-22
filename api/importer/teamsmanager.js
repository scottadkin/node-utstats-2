const mysql = require('../database');
const Message = require('../message');
const Promise = require('promise');
const Teams = require('../teams');

class TeamsManager{

    constructor(){

        this.teams = new Teams();
        this.lines = [];
        this.data = [];
    }

    parseTeamChanges(playerManager){

        const reg = /^(\d+?\.\d+?)\tplayer\tteamchange\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.lines.length; i++){

            const d = this.lines[i];

            const result = reg.exec(d);

            if(result !== null){

                const currentPlayer = playerManager.getOriginalConnectionById(parseInt(result[2]));

                if(currentPlayer !== null){

                    if(playerManager.bIgnoreBots){
                        if(currentPlayer.bBot) continue;
                    }

                    this.data.push({
                        "timestamp": parseFloat(result[1]),
                        "player": currentPlayer.masterId,
                        "team": parseInt(result[3])
                    });
                }else{
                    new Message(`PlayerManager.parseTeamChanges Can't find original connection for player with id ${result[2]}`,'warning');
                }
            }
        }
    }

    

    async insertTeamChanges(matchId){

        try{

            let t = 0;

            new Message(`Starting to insert player team changes.`,'note');

            for(let i = 0; i < this.data.length; i++){

                t = this.data[i];

                await this.teams.insertTeamChange(matchId, t.timestamp, t.player, t.team);
            }

            new Message(`Inserted all player team changes.`,'pass');

        }catch(err){
            new Message(`PlayerManager.insertTeamChanges() ${err}`,'error');
        }
    }
}

module.exports = TeamsManager;