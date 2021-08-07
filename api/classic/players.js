import mysql from './database';

class Players{

    constructor(){

    }

    async getPlayerName(playerId){

        const query = "SELECT name FROM uts_pinfo WHERE id=?";

        const result = await mysql.simpleQuery(query, [playerId]);

        if(result.length > 0){

            return result[0].name;
        }

        return "Not Found";
    }

    async getDmWinner(matchId){

        const query = "SELECT pid from uts_player WHERE matchid=? ORDER by frags DESC LIMIT 1";

        const result = await mysql.simpleQuery(query, [matchId]);

        if(result.length > 0){
            return await this.getPlayerName(result[0].pid);
        }

        return null;
    }

    async getNames(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,name FROM uts_pinfo WHERE id IN (?)";

        const result =  await mysql.simpleQuery(query, [ids]);

        const names = {};

        for(let i = 0; i < result.length; i++){

            names[result[i].id] = result[i].name;
        }

        return names;
    }

    async getMatchData(matchId, bBasic){

        let query = "SELECT * FROM uts_player WHERE matchid=? ORDER BY gamescore DESC";

        if(bBasic){
            query = "SELECT pid,team,country,id,matchid FROM uts_player WHERE matchid=? ORDER BY matchid DESC";
        }

        const players = await mysql.simpleQuery(query, [matchId]);

        const playerIds = [];

        for(let i = 0; i < players.length; i++){

            playerIds.push(players[i].pid);
        }

        const names = await this.getNames(playerIds);

        let p = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            if(names[p.pid] === undefined){
                p.name = "Not Found";
            }else{
                p.name = names[p.pid];
            }
        }

        return players;

    }

}


export default Players;