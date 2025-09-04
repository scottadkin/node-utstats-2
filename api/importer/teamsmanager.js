import Message from "../message.js";
import Teams from "../teams.js";

export default class TeamsManager{

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

                const currentPlayer = playerManager.getPlayerById(result[2]);

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

            new Message(`Starting to insert player team changes.`,'note');

            await this.teams.bulkInsertTeamChanges(matchId, this.data);
            
            new Message(`Inserted all player team changes.`,'pass');

        }catch(err){
            new Message(`PlayerManager.insertTeamChanges() ${err}`,'error');
        }
    }

    //set team joins to match the start time of the game if they are below match start time
    setTimestampsToMatchStart(matchTimings){

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            if(d.timestamp < matchTimings.start){
                d.timestamp = matchTimings.start;
            }else{
                return;
            }
        }
    }
}
