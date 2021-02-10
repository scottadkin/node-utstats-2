const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');


class Match{

    constructor(){};

    exists(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_matches FROM nstats_matches WHERE id=?";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result[0].total_matches > 0){
                    resolve(true);
                }

                resolve(false);
            });
        });
    }

    setDMMatchWinnerQuery(matchId, winner, winnerScore){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_matches SET dm_winner=?,dm_score=? WHERE id=?";

            mysql.query(query, [winner, winnerScore, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    //for non team games
    async setDMWinner(matchId, winner, winnerScore){

        try{

            if(await this.exists(matchId)){

                await this.setDMMatchWinnerQuery(matchId, winner, winnerScore);

            }else{
                new Message(`There is no match with the id ${matchId}`,'warning');
            }

        }catch(err){
            new Message(`There was a problem setting match winner.`,'error');
        }
    }

    get(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            if(id !== id) reject('Match id must be a number');

            const query = "SELECT * FROM nstats_matches WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result[0]);
                }
                resolve({});
            });

        });
    }


    debugGetAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_matches ORDER BY date DESC LIMIT 500";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);
                
                if(result !== undefined){
                    resolve(result);
                }
                
                resolve([]);
            });
        });
    }

}

module.exports = Match;