const mysql = require('./api/database');
const Promise = require('promise');


const queries = [];


const runQuery = (query) =>{

    return new Promise((resolve, reject) =>{

        mysql.query(query, (err) =>{

            if(err) reject(err);
    
            resolve();
        });

    });
    
}

const rankingRows = [
    "INSERT INTO nstats_ranking_values VALUES(NULL,'frags',300)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'deaths',-150)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'suicides',-150)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'team_kills',-1200)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_taken',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_pickup',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_return',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_capture',6000)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_cover',1800)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_seal',1200)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_assist',3000)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_kill',1200)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'dom_caps',6000)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'assault_objectives',6000)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_1',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_2',650)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_3',700)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_4',1000)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_5',1250)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_6',1500)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_7',1750)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_1',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_2',750)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_3',900)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_4',1200)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_5',1800)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_6',2400)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_7',3600)",

];


(async () =>{

    try{
        for(let i = 0; i < rankingRows.length; i++){


            await runQuery(rankingRows[i]);
        
        }

    }catch(err){
        console.trace(err);
    }
})();

