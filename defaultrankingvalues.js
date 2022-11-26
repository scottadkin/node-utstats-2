const mysql = require("./api/database");
const Message = require("./api/message");

(async () =>{

    const queries = [
        "DELETE FROM nstats_ranking_values",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'frags','Kill','Player Killed an enemy',300)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'deaths','Death','Player died',-150)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'suicides','Suicide','Player killed themself',-150)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'team_kills','Team Kill','Player killed a team mate',-1200)",

        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_taken','Flag Grab','Player grabbed the flag from the enemy flag stand',600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_pickup','Flag Pickup','Player picked up a dropped enemy flag',600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_return','Flag Return','Player returned the players flag to their base',600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_capture','Flag Capture','Player capped the enemy flag',6000)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_seal','Flag Seal','Player sealed off the base while a team mate was carrying the flag',1200)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_assist','Flag Assist','Player had carry time of the enemy flag that was capped',3000)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_kill','Flag Kill','Player killed the enemy flag carrier.',1200)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_dropped','Flag Dropped','Player dropped the enemy flag',-300)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_cover','Flag Cover','Player killed an enemy close to a team mate carrying the flag',1800)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_cover_pass','Flag Successful Cover','Player covered the flag carrier that was later capped',1000)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_cover_fail','Flag Failed Cover','Player covered the flag carrier but the flag was returned',-600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_self_cover','Flag Self Cover','Player killed an enemy while carrying the flag',600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_self_cover_pass','Successful Flag Self Cover','Player killed an enemy while carrying the flag that was later capped',1000)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_self_cover_fail','Failed Flag Self Cover','Player killed an enemy while carrying the flag, but the flag was returned',-600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_multi_cover','Flag Multi Cover','Player covered the flag carrier 3 times while the enemy flag was taken one time',3600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_spree_cover','Flag Cover Spree','Player covered the flag carrier 4 or more times while the enemy flag was taken one time',4200)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_save','Flag Close Save','Player returned their flag that was close to being capped by the enemy team',4000)",


        "INSERT INTO nstats_ranking_values VALUES(NULL,'dom_caps','Domination Control Point Caps','Player captured a contol point.',6000)",

        "INSERT INTO nstats_ranking_values VALUES(NULL,'assault_objectives','Assault Objectives','Player captured an assault objective.',6000)",

        "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_1','Double Kill','Player killed 2 people in a short amount of time without dying',100)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_2','Multi Kill','Player killed 3 people in a short amount of time without dying',150)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_3','Mega Kill','Player killed 4 people in a short amount of time without dying',200)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_4','Ultra Kill','Player killed 5 people in a short amount of time without dying',300)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_5','Monster Kill','Player killed 6 people in a short amount of time without dying',450)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_6','Ludicrous Kill','Player killed 7 people in a short amount of time without dying',600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_7','Holy Shit','Player killed 8 or more people in a short amount of time without dying',750)",

        "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_1','Killing Spree','Player killed 5 to 9 players in one life',600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_2','Rampage','Player killed 10 to 14 players in one life',750)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_3','Dominating','Player killed 15 to 19 players in one life',900)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_4','Unstoppable','Player killed 20 to 24 players in one life',1200)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_5','Godlike','Player killed 25 to 29 players in one life',1800)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_6','Too Easy','Player killed 30 to 34 players in one life',2400)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_7','Brutalizing the competition','Player killed 35 or more players in one life',3600)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'mh_kills','Monster Kills(MonsterHunt)','Player killed a monster',360)",


        `INSERT INTO nstats_ranking_values
        VALUES(
            NULL,
            'sub_half_hour_multiplier',
            'Sub 30 Minutes Playtime Penalty',
            'Reduce the player\\'s score to a percentage of it\\'s original value',
            0.05)`,

            `CREATE TABLE IF NOT EXISTS nstats_ctf_cap_records(
                id int(11) NOT NULL AUTO_INCREMENT,
                match_id INT(11) NOT NULL,
                match_date INT(11) NOT NULL,
                map_id INT(11) NOT NULL,
                team INT(1) NOT NULL,
                grab INT(11) NOT NULL,
                assists VARCHAR(500) NOT NULL,
                cap INT(11) NOT NULL,
                travel_time DECIMAL(10,2) NOT NULL,
                type INT(1) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


        `INSERT INTO nstats_logs_folder VALUES(NULL, 'Logs Folder',0,0,0,0,0,0,0,0,0,0,0,0)`,
        
        
        "INSERT INTO nstats_ranking_values VALUES(NULL,'sub_hour_multiplier','Sub 1 Hour Playtime Penalty Multiplier','Reduce the player\\'s score to a percentage of it\\'s original value', 0.2)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'sub_2hour_multiplier','Sub 2 Hour Playtime Penalty Multiplier','Reduce the player\\'s score to a percentage of it\\'s original value', 0.5)",
        "INSERT INTO nstats_ranking_values VALUES(NULL,'sub_3hour_multiplier','Sub 3 Hour Playtime Penalty Multiplier','Reduce the player\\'s score to a percentage of it\\'s original value', 0.75)",
        
    ];

    for(let i = 0; i < queries.length; i++){

        await mysql.simpleQuery(queries[i]);
        new Message(`Query ${i + 1} completed.`,"pass");
    }
    process.exit();

})();