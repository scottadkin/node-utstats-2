const mysql = require("./database");
const Message = require("./message");
const Players = require("./players");


class Match{

    constructor(){};

    async exists(matchId){

        let query = "";

        if(matchId.length === 32){
            query = "SELECT COUNT(*) as total_rows FROM nstats_matches WHERE match_hash=?";
            
        }else{
            query = "SELECT COUNT(*) as total_rows FROM nstats_matches WHERE id=?";
        }

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

    async getMatchIdFromHash(hash){

        const query = `SELECT id FROM nstats_matches WHERE match_hash=?`;

        const result = await mysql.simpleQuery(query, [hash]);

        if(result.length > 0){
            return result[0].id;
        }

        return -1;
    }

    async get(id){

        id = parseInt(id);
        if(id !== id) throw new Error("Match id must be a number");

        const query = "SELECT * FROM nstats_matches WHERE id=?";

        const result = await mysql.simpleQuery(query, [id]);

        if(result.length > 0){

            if(result[0].dm_winner !== 0){
                const playerManager = new Players();
                const dmWinnerInfo = await playerManager.getNamesByIds([result[0].dm_winner], false);

                result[0].dmWinner = dmWinnerInfo[0];
            }

            return result[0];
        }

        return {};
    }


    async setMatchPingData(matchId, min, average, max){

        const query = `UPDATE nstats_matches SET ping_min_average=?, ping_average_average=?, ping_max_average=?
        WHERE id=?`;

        return await mysql.simpleQuery(query, [min, average, max, matchId]);

    }

}

module.exports = Match;