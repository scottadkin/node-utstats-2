const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

class Rankings{

    constructor(){


    }


    setRankingSettings(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,value FROM nstats_ranking_values";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    this.settings = result;
                }

                resolve();
            });
        });
    }

    async update(players){

    
        try{

            //console.log(players);

            if(this.settings === undefined){
                new Message(`Rankings.update() Settings are not set, can't updated rankings!`,"error");
                return;
            }


            let p = 0;
            let s = 0;
            let currentScore = 0;
            let currentPlaytime = 0;

            for(let i = 0; i < players.length; i++){

                p = players[i];
                currentScore = 0;
                currentPlaytime = 0;

                if(p.bDuplicate === undefined){

                    for(let x = 0; x < this.settings.length; x++){

                        s = this.settings[x];

                        
                    }
                    console.log(`${p.name} ranking score is ${currentScore}`);
                }
            }

           

        }catch(err){
            console.trace(err);
        }
       
    }
}


module.exports = Rankings;