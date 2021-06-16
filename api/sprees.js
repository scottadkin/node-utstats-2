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
                s.start,
                s.end,
                s.totalTime,
                s.killedBy
            ];

            await mysql.simpleInsert(query, vars);
        }
    }
}


module.exports = Sprees;