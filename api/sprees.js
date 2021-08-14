const mysql = require('./database');


class Sprees{

    constructor(){
    
    }

    // if killedBy is -1 it means match ending ended the spree
    addToList(player, kills, killedBy, start, end){

        if(this.currentSprees === undefined){

            this.currentSprees = [];
        }

        this.currentSprees.push({

            "player": player,
            "kills": kills,
            "killedBy": killedBy,
            "start": start,
            "end": end,
            "totalTime": end - start
        });
    }

    async insertCurrentSprees(matchId){

        let s = 0;

        const query = "INSERT INTO nstats_sprees VALUES(NULL,?,?,?,?,?,?,?)";
        let vars = [];

        for(let i = 0; i < this.currentSprees.length; i++){

            s = this.currentSprees[i];

            vars = [
                matchId,
                s.player,
                s.kills,
                (s.start === null) ? 0 : s.start,
                (s.end === null) ? 0 : s.end,
                s.totalTime,
                s.killedBy
            ];

            await mysql.simpleInsert(query, vars);
        }
    }

    async getMatchData(id){

        const query = "SELECT player,kills,killer,start_timestamp,end_timestamp,total_time FROM nstats_sprees WHERE match_id=?";
        const vars = [id];
        return await mysql.simpleFetch(query, vars);

    }

    async getPlayerMatchData(matchId, playerId){

        const query = "SELECT player,kills,killer,start_timestamp,end_timestamp,total_time FROM nstats_sprees WHERE match_id=? AND (player=? || killer=?)";
        const vars = [matchId, playerId, playerId];
        return await mysql.simpleFetch(query, vars);

    }

    async deletePlayerMatchData(playerId, matchId){

        const query = "DELETE FROM nstats_sprees WHERE match_id=? AND player=?";

        await mysql.simpleDelete(query, [matchId, playerId]);
    }

    async deletePlayer(playerId){

        const query = "DELETE FROM nstats_sprees WHERE player=?";

        await mysql.simpleDelete(query, [playerId]);
    }

    async changePlayerIds(oldId, newId){

        const query = `UPDATE nstats_sprees SET player=? WHERE player=?`;
        const query2 = `UPDATE nstats_sprees SET killer=? WHERE killer=?`;

        await mysql.simpleUpdate(query, [newId, oldId]);
        await mysql.simpleUpdate(query2, [newId, oldId]);
        
    }
}


module.exports = Sprees;