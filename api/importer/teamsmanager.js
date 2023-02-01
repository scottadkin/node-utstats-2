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

    async setTeamsPlaytime(playerManager, totalTeams, matchTimings, bHardcore){

        console.log(`SET TEAMS PLAYTIME ${totalTeams}`);
        
        if(totalTeams < 2) return;

        this.setTimestampsToMatchStart(matchTimings);

        const teamJoins = {};

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            if(teamJoins[d.player] === undefined){
                teamJoins[d.player] = null;
            }

            if(teamJoins[d.player] !== null){

                const player = playerManager.getPlayerByMasterId(d.player);

                if(player === null){
                    new Message(`TeamsManager.setTeamsPlaytime() player is null`, "warning");
                    continue;
                }

                let diff = d.timestamp - teamJoins[d.player].timestamp;

                if(bHardcore){
                    if(diff !== 0){
                        diff = diff / 1.1;
                    }
                }

                const team = teamJoins[d.player].team;
                
                //if(team < 0 || team > 3) continue;

                player.stats.teamPlaytime[team] += diff;

                teamJoins[d.player] = {"timestamp": d.timestamp, "team": d.team};

            }else{
                teamJoins[d.player] = {"timestamp": d.timestamp, "team": d.team};
            }
        }

        for(const [playerId, data] of Object.entries(teamJoins)){

            //if(data.team >= 0 && data.team <= 3){

                let diff = matchTimings.end - data.timestamp;

                if(bHardcore){

                    if(diff !== 0){
                        diff = diff / 1.1;
                    }
                }

                const player = playerManager.getPlayerByMasterId(playerId);

                if(player === null){
                    new Message(`TeamsManager.setTeamsPlaytime() player is null(match end).`, "warning");
                    continue;
                }

                player.stats.teamPlaytime[data.team] += diff;
            //}
        }
    }
}

module.exports = TeamsManager;