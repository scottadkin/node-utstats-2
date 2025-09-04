import { simpleQuery } from "./api/database.js";
import Message from "./api/message.js";


(async () =>{

    const queries = [
        `DELETE FROM nstats_items`,
        `INSERT INTO nstats_items VALUES(NULL,"AntiGrav Boots","Jump Boots",0,0,0,0,4)`,
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
        `INSERT INTO nstats_items VALUES(NULL,"ShieldBelt","Shield Belt",0,0,0,0,3)`,
        `INSERT INTO nstats_items VALUES(NULL,"Shock Rifle","Shock Rifle",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Sniper Rifle","Sniper Rifle",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Super Health Pack","Super Health Pack",0,0,0,0,4)`,
        `INSERT INTO nstats_items VALUES(NULL,"Thigh Pads","Thigh Pads",0,0,0,0,3)`,
        `INSERT INTO nstats_items VALUES(NULL,"Ammor Percing Slugs Pads","Armor Percing Slugs",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"AP CAS12","AP CAS12s",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Armor Shard","Armor Shard",0,0,0,0,3)`,
        `INSERT INTO nstats_items VALUES(NULL,"Arrows","Arrows",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"Blade Hopper","Ripper Ammo",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"Box of Rifle Rounds","Sniper Ammo",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"Box of RPB Rounds","RPB Sniper Ammo",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"CAS12","CAS12",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Chaos Sniper Rifle","Chaos Sniper Rifle",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Claw","Claw",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Crossbow","Crossbow",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Explosive Arrows","Crossbow",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"Explosive CAS12","Explosive CAS12",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Explosive Crossbow","Explosive Crossbow",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Explosive SG Shells","Explosive SG Shells",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"Flak Shells","Flak Shells",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"Gravity Belt","Gravity Belt",0,0,0,0,5)`,
        `INSERT INTO nstats_items VALUES(NULL,"Poison Crossbow","Poison Crossbow",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Proxy Mines","Proxy Mines",0,0,0,0,1)`,
        `INSERT INTO nstats_items VALUES(NULL,"Rocket Pack","Rocket Pack",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"SG Shells","SG Shell",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"Shock Core","Shock Core",0,0,0,0,2)`,
        `INSERT INTO nstats_items VALUES(NULL,"Sword","Sword",0,0,0,0,1)`,
    ];

    new Message("Setting items to default values.", "note");

    for(let i = 0; i < queries.length; i++){

        try{

            const q = queries[i];
            new Message(`Performed query #${i+1}: ${q}`,"pass");

            await simpleQuery(q);

        }catch(err){
            new Message(err,"error");
        }
    }

    process.exit();

})();