const Message = require('../message');
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

            for(let i = 0; i < this.data.length; i++){

                const d = this.data[i];

                await this.teams.insertTeamChange(matchId, d.timestamp, d.player, d.team);
            }

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

    scalePlaytime(playtime, bHardcore){

        if(bHardcore && playtime !== 0){
            return playtime / 1.1;      
        }

        return playtime;
    }

    setTeamsPlaytime(playerManager, totalTeams, matchTimings, bHardcore){

        if(totalTeams < 2) return;

        this.setTimestampsToMatchStart(matchTimings);


        for(let i = 0; i < playerManager.players.length; i++){

            const p = playerManager.players[i];

            const events = [...p.teamChangeEvents];

            events.sort((a, b) =>{

                a = a.timestamp;
                b = b.timestamp;

                if(a < b) return -1;
                if(a > b) return 1;
                return 0;
            });

            let previousTimestamp = 0;
            let bLastDisconnect = false;
            let previousTeam = 255;

            for(let x = 0; x < events.length; x++){

                const currentEvent = events[x];

                if(x === 0){
                    previousTimestamp = currentEvent.timestamp;
                    continue
                }

                const diff = this.scalePlaytime(currentEvent.timestamp - previousTimestamp, bHardcore);
 

                if(currentEvent.type === "disconnect"){
                    bLastDisconnect = true;
                    p.stats.teamPlaytime[previousTeam] += diff;
                }else{
                    bLastDisconnect = false;
                    p.stats.teamPlaytime[previousTeam] += diff;
                    previousTeam = currentEvent.newTeam;             
                }

                previousTimestamp = currentEvent.timestamp;
                
            }

            if(!bLastDisconnect){
                const finalDiff = this.scalePlaytime(matchTimings.end - previousTimestamp, bHardcore);
                p.stats.teamPlaytime[previousTeam] += finalDiff;
            }
        }
    }

}

module.exports = TeamsManager;