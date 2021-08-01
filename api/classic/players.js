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

        const query = "SELECT playerid from uts_player WHERE matchid=? ORDER by frags DESC LIMIT 1";

        const result = await mysql.simpleQuery(query, [matchId]);

        if(result.length > 0){
            return await this.getPlayerName(result[0].playerid);
        }

        return null;
    }

}


export default Players;