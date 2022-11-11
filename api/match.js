const mysql = require("./database");
const Message = require("./message");


class Match{

    constructor(){};

    async exists(matchId){

        const query = "SELECT COUNT(*) as total_rows FROM nstats_matches WHERE id=?";

        const result = await mysql.simpleQuery(query, [matchId]);
        return result[0].total_rows > 0;
    }

    async setDMMatchWinnerQuery(matchId, winner, winnerScore){

        const query = "UPDATE nstats_matches SET dm_winner=?,dm_score=? WHERE id=?";

        await mysql.simpleQuery(query, [winner, winnerScore, matchId]);

    }

    //for non team games
    async setDMWinner(matchId, winner, winnerScore){

        try{

            if(await this.exists(matchId)){

                await this.setDMMatchWinnerQuery(matchId, winner, winnerScore);

            }else{
                new Message(`There is no match with the id ${matchId}`,"warning");
            }

        }catch(err){
            new Message(`There was a problem setting match winner.`,"error");
        }
    }

    async get(id){

        id = parseInt(id);
        if(id !== id) throw new Error("Match id must be a number");

        const query = "SELECT * FROM nstats_matches WHERE id=?";

        const result = await mysql.simpleQuery(query, [id]);

        if(result.length > 0) return result[0];

        return {};
    }


    

}

module.exports = Match;