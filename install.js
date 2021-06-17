const mysql = require('./api/database');
const Message = require('./api/message');
const fs = require('fs');
const Functions = require('./api/functions');

const queries = [
    "INSERT INTO nstats_ranking_values VALUES(NULL,'frags','Frag','Player Killed an enemy',300)",
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

    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_1','Double Kill','Player killed 2 people in a short amount of time without dying',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_2','Multi Kill','Player killed 3 people in a short amount of time without dying',650)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_3','Mega Kill','Player killed 4 people in a short amount of time without dying',700)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_4','Ultra Kill','Player killed 5 people in a short amount of time without dying',1000)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_5','Monster Kill','Player killed 6 people in a short amount of time without dying',1250)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_6','Ludicrous Kill','Player killed 7 people in a short amount of time without dying',1500)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_7','Holy Shit','Player killed 8 or more people in a short amount of time without dying',1750)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_1','Killing Spree','Player killed 5 to 9 players in one life',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_2','Rampage','Player killed 10 to 14 players in one life',750)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_3','Dominating','Player killed 15 to 19 players in one life',900)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_4','Unstoppable','Player killed 20 to 24 players in one life',1200)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_5','Godlike','Player killed 25 to 29 players in one life',1800)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_6','Too Easy','Player killed 30 to 34 players in one life',2400)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_7','Brutalizing the competition','Player killed 35 or more players in one life',3600)",


    `INSERT INTO nstats_ranking_values
     VALUES(
         NULL,
         'sub_half_hour_multiplier',
         'Sub 30 Minutes Playtime Penalty',
         'Multiply the player\\'s ranking score to penalize them for not playing enough. (Multiplying by 0.05 for example will reduce the player\\'s score by 95%)',
          0.05)`,
    
    
    "INSERT INTO nstats_ranking_values VALUES(NULL,'sub_hour_multiplier','Sub 1 Hour Playtime Penalty Multiplier','Multiply the player\\'s ranking score to penalize them for not playing enough. (Multiplying by 0.05 for example will reduce the player\\'s score by 95%)', 0.2)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'sub_2hour_multiplier','Sub 2 Hour Playtime Penalty Multiplier','Multiply the player\\'s ranking score to penalize them for not playing enough. (Multiplying by 0.05 for example will reduce the player\\'s score by 95%)', 0.5)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'sub_3hour_multiplier','Sub 3 Hour Playtime Penalty Multiplier','Multiply the player\\'s ranking score to penalize them for not playing enough. (Multiplying by 0.05 for example will reduce the player\\'s score by 95%)', 0.75)",
    `INSERT INTO nstats_items VALUES(NULL,"AntiGrav Boots","Jump Boots",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"Body Armor","Body Armor",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Chainsaw","Chainsaw",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Damage Amplifier","Damage Amplifier",0,0,0,0,4)`,
    `INSERT INTO nstats_items VALUES(NULL,"Double Enforcers","Double Enforcers",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Enforcer","Enforcer",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Enhanced Shock Rifle","Enhanced Shock Rifle",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Flak Cannon","Flak Cannon",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"GES Bio Rifle","GES Bio Rifle",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Health Pack","Health Pack",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Health Vial","Health Vial",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Invisibility","Invisibility",0,0,0,0,4)`,
    `INSERT INTO nstats_items VALUES(NULL,"Minigun","Minigun",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Pulse Gun","Pulse Gun",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Redeemer","Redeemer",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicDeathInventory","Relic Death",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicDefenseInventory","Relic Defense",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicRedemptionInventory","Relic Redemption",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicRegenInventory","Relic Regen",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicSpeedInventory","Relic Speed",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicStrengthInventory","Relic Strength",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"Ripper","Ripper",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Rocket Launcher","Rocket Launcher",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Shield Belt","Shield Belt",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Shock Rifle","Shock Rifle",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Sniper Rifle","Sniper Rifle",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Super Health Pack","Super Health Pack",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Thigh Pads","Thigh Pads",0,0,0,0,3)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Addicted Players","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Played Gametypes","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Played Maps","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Popular Countries","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Used Faces","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Recent Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Recent Matches & Player Stats","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Recent Players","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Recent Matches Display Type","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Recent Matches To Display","3")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Addicted Players","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Control Points (Domination)","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Games Played","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Longest Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Map Objectives (Assault)","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Recent Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Spawn Points","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Max Addicted Players","5")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Max Longest Matches","5")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Recent Matches Per Page","50")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Maps Page","Default Display Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Maps Page","Default Display Type","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Assault Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Caps","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Graphs","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Domination Graphs","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Domination Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Frag Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Frags Graphs","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Kills Match Up","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Match Report Title","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Pickup Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Player Ping Graph","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Players Connected to Server Graph","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Powerup Control","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Rankings","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Screenshot","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Server Settings","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Special Events","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Extended Sprees","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Team Changes","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Weapon Statistics","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Default Display Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Default Display Type","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Default Gametype","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Admin","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Home","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Login/Logout","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Maps","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Players","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Rankings","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Records","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Default Recent Matches Display","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Default Weapon Display","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Assault & Domination","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Capture The Flag Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Frag Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Gametype Stats","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Pickup History","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Ping History Graph","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Rankings","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Recent Activity Graph","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Recent Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Special Events","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Weapon Stats","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Recent Matches Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Display Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Display Type","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Order","ASC")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Sort Type","name")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Rankings","Rankings Per Gametype (Main)","10")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Rankings","Rankings Per Page (Individual)","100")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Default Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Default Record Type","0")`

];


(async () =>{

    try{
        
        for(let i = 0; i < queries.length; i++){

            
            await mysql.simpleInsert(queries[i]);
            new Message(`Performed query ${i+1} of ${queries.length}`,"pass");
        
        }

        const seed = Functions.generateRandomString(10000);


        const fileContents = `module.exports = () => {  return \`${seed}\`;}`;

        fs.writeFileSync("./salt.js", fileContents);

        process.exit();

    }catch(err){
        console.trace(err);
    }
})();

