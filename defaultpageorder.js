const mysql = require("./api/database");
const Message = require("./api/message");

new Message(`Setting Default Page orders`,"note");

const queries = [
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Recent Matches To Display","3","10")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Recent Matches Display Type","0","9")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Played Gametypes","true","8")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Used Faces","true","7")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Played Maps","true","6")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Popular Countries","true","5")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Recent Players","true","4")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Addicted Players","true","1")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Latest Match","true","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Recent Matches","true","2")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Recent Matches & Player Stats","true","3")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Addicted Players","true","11")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Control Points (Domination)","true","8")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Games Played","true","4")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Longest Matches","true","12")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Map Objectives (Assault)","true","7")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Recent Matches","true","5")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Spawn Points","true","13")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Summary","true","3")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Max Addicted Players","5","2")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Max Longest Matches","5","1")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Recent Matches Per Page","25","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display CTF Caps","true","6")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Combogib Player Records","true","10")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Combogib General Stats","true","9")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Maps Page","Default Display Per Page","25","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Maps Page","Default Display Type","0","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Match Report Title","true",0)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Summary","true",1)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Screenshot","true",2)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Domination Summary","true",3)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Domination Graphs","true",4)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Assault Summary","true",5)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Summary","true",6)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Graphs","true",7)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Times","true",8)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Caps","true",9)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Returns","true",10)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Carry Times","true",11)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display MonsterHunt Kills","true",12)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Frag Summary","true",13)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Frags Graphs","true",14)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Combogib Stats","true",15)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Special Events","true",16)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Extended Sprees","true",17)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Rankings","true",18)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Ammo Control","true",19)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Health/Armour Control","true",20)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Weapons Control","true",21)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Powerup Control","true",22)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Items Summary","true",23)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Pickup Summary","true",24)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Kills Match Up","true",25)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Weapon Statistics","true",26)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Player Ping Graph","true",27)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Players Connected to Server Graph","true",28)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Player Score Graph","true",29)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Team Changes","true",30)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Time Limit","true",31)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Server Settings","true",32)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Target Score","true",33)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Mutators","true",34)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Default Display Per Page","25","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Default Display Type","0","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Default Gametype","0","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Minimum Players","0","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Minimum Playtime","0","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Admin","true","7")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Home","true","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Login/Logout","true","8")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Maps","true","5")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Matches","true","1")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Players","true","2")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Rankings","true","3")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Records","true","4")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display ACE","true","6")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Default Recent Matches Display","0","21")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Default Weapon Display","0","20")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Recent Matches Per Page","25","18")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Aliases","true","15")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Pickup History","true","12")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Ping History Graph","true","16")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Recent Activity Graph","true","17")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Recent Matches","true","19")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Items Summary","true","14")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Weapon Stats","true","13")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Rankings","true","10")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Special Events","true","9")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Assault & Domination","true","6")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Capture The Flag Summary","true","5")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Frag Summary","true","2")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Gametype Stats","true","1")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Summary","true","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Capture The Flag Cap Records","true","7")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Monsterhunt Basic Stats","true","3")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Monsterhunt Monster Stats","true","4")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Combogib Stats","true","8")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Display Per Page","25","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Display Type","0","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Order","ASC","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Sort Type","name","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Rankings","Rankings Per Gametype (Main)","10","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Rankings","Rankings Per Page (Individual)","100","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Display Player Records","true","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Display Match Records","true","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Display CTF Cap Records","true","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Display Combogib Records","true","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Default Per Page","25",0)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Servers","true",0)`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Servers Page","Default Display Type",0,0)`,
];

(async () =>{

    try{
        new Message(`Reset to default page order settings.`,"note");

        await mysql.simpleQuery("DELETE FROM nstats_site_settings");

        for(let i = 0; i < queries.length; i++){

            const q = queries[i];

            await mysql.simpleQuery(q);
            new Message(`Query ${i+1} out of ${queries.length} completed.`,"pass");


        }

    }catch(err){
        console.trace(err);
    }

    process.exit(0);
})();