const mysql = require("./api/database");
const Message = require("./api/message");

new Message(`Setting Default Page orders`,"note");

const queries = [
    `UPDATE nstats_site_settings SET page_order=9 WHERE category="Home" AND name="Recent Matches To Display"`,
    `UPDATE nstats_site_settings SET page_order=9 WHERE category="Home" AND name="Recent Matches Display Type"`,
    `UPDATE nstats_site_settings SET page_order=8 WHERE category="Home" AND name="Display Most Played Gametypes"`,
    `UPDATE nstats_site_settings SET page_order=7 WHERE category="Home" AND name="Display Most Used Faces"`,
    `UPDATE nstats_site_settings SET page_order=6 WHERE category="Home" AND name="Display Most Played Maps"`,
    `UPDATE nstats_site_settings SET page_order=5 WHERE category="Home" AND name="Display Most Popular Countries"`,
    `UPDATE nstats_site_settings SET page_order=4 WHERE category="Home" AND name="Display Recent Players"`,
    `UPDATE nstats_site_settings SET page_order=3 WHERE category="Home" AND name="Display Addicted Players"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Home" AND name="Display Latest Match"`,
    `UPDATE nstats_site_settings SET page_order=1 WHERE category="Home" AND name="Display Recent Matches"`,
    `UPDATE nstats_site_settings SET page_order=2 WHERE category="Home" AND name="Display Recent Matches & Player Stats"`,
    `UPDATE nstats_site_settings SET page_order=6 WHERE category="Map Pages" AND name="Display Addicted Players"`,
    `UPDATE nstats_site_settings SET page_order=5 WHERE category="Map Pages" AND name="Display Control Points (Domination)"`,
    `UPDATE nstats_site_settings SET page_order=2 WHERE category="Map Pages" AND name="Display Games Played"`,
    `UPDATE nstats_site_settings SET page_order=7 WHERE category="Map Pages" AND name="Display Longest Matches"`,
    `UPDATE nstats_site_settings SET page_order=4 WHERE category="Map Pages" AND name="Display Map Objectives (Assault)"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Map Pages" AND name="Display Recent Matches"`,
    `UPDATE nstats_site_settings SET page_order=1 WHERE category="Map Pages" AND name="Display Spawn Points"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Map Pages" AND name="Display Summary"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Map Pages" AND name="Max Addicted Players"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Map Pages" AND name="Max Longest Matches"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Map Pages" AND name="Recent Matches Per Page"`,
    `UPDATE nstats_site_settings SET page_order=3 WHERE category="Map Pages" AND name="Display CTF Caps"`,
    `UPDATE nstats_site_settings SET page_order=1 WHERE category="Match Pages" AND name="Display Server Settings"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Match Pages" AND name="Display Players Connected to Server Graph"`,
    `UPDATE nstats_site_settings SET page_order=9 WHERE category="Match Pages" AND name="Display Team Changes"`,
    `UPDATE nstats_site_settings SET page_order=8 WHERE category="Match Pages" AND name="Display Player Ping Graph"`,
    `UPDATE nstats_site_settings SET page_order=7 WHERE category="Match Pages" AND name="Display Ammo Control"`,
    `UPDATE nstats_site_settings SET page_order=6 WHERE category="Match Pages" AND name="Display Health/Armour Control"`,
    `UPDATE nstats_site_settings SET page_order=5 WHERE category="Match Pages" AND name="Display Weapons Control"`,
    `UPDATE nstats_site_settings SET page_order=4 WHERE category="Match Pages" AND name="Display Powerup Control"`,
    `UPDATE nstats_site_settings SET page_order=3 WHERE category="Match Pages" AND name="Display Power Up Control"`,
    `UPDATE nstats_site_settings SET page_order=2 WHERE category="Match Pages" AND name="Display Pickup Summary"`,
    `UPDATE nstats_site_settings SET page_order=1 WHERE category="Match Pages" AND name="Display Kills Match Up"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Match Pages" AND name="Display Rankings"`,
    `UPDATE nstats_site_settings SET page_order=9 WHERE category="Match Pages" AND name="Display Frags Graphs"`,
    `UPDATE nstats_site_settings SET page_order=8 WHERE category="Match Pages" AND name="Display Player Score Graph"`,
    `UPDATE nstats_site_settings SET page_order=7 WHERE category="Match Pages" AND name="Display Time Limit"`,
    `UPDATE nstats_site_settings SET page_order=6 WHERE category="Match Pages" AND name="Display Target Score"`,
    `UPDATE nstats_site_settings SET page_order=5 WHERE category="Match Pages" AND name="Display Mutators"`,
    `UPDATE nstats_site_settings SET page_order=4 WHERE category="Match Pages" AND name="Display Weapon Statistics"`,
    `UPDATE nstats_site_settings SET page_order=3 WHERE category="Match Pages" AND name="Display Extended Sprees"`,
    `UPDATE nstats_site_settings SET page_order=2 WHERE category="Match Pages" AND name="Display Special Events"`,
    `UPDATE nstats_site_settings SET page_order=1 WHERE category="Match Pages" AND name="Display Capture The Flag Graphs"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Match Pages" AND name="Display Capture The Flag Times"`,
    `UPDATE nstats_site_settings SET page_order=9 WHERE category="Match Pages" AND name="Display Capture The Flag Caps"`,
    `UPDATE nstats_site_settings SET page_order=8 WHERE category="Match Pages" AND name="Display Domination Graphs"`,
    `UPDATE nstats_site_settings SET page_order=7 WHERE category="Match Pages" AND name="Display Capture The Flag Summary"`,
    `UPDATE nstats_site_settings SET page_order=6 WHERE category="Match Pages" AND name="Display MonsterHunt Kills"`,
    `UPDATE nstats_site_settings SET page_order=5 WHERE category="Match Pages" AND name="Display Domination Summary"`,
    `UPDATE nstats_site_settings SET page_order=4 WHERE category="Match Pages" AND name="Display Assault Summary"`,
    `UPDATE nstats_site_settings SET page_order=3 WHERE category="Match Pages" AND name="Display Frag Summary"`,
    `UPDATE nstats_site_settings SET page_order=2 WHERE category="Match Pages" AND name="Display Screenshot"`,
    `UPDATE nstats_site_settings SET page_order=1 WHERE category="Match Pages" AND name="Display Summary"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Match Pages" AND name="Display Match Report Title"`,
    `UPDATE nstats_site_settings SET page_order=9 WHERE category="Player Pages" AND name="Default Recent Matches Display"`,
    `UPDATE nstats_site_settings SET page_order=9 WHERE category="Player Pages" AND name="Default Weapon Display"`,
    `UPDATE nstats_site_settings SET page_order=9 WHERE category="Player Pages" AND name="Recent Matches Per Page"`,
    `UPDATE nstats_site_settings SET page_order=4 WHERE category="Player Pages" AND name="Display Aliases"`,
    `UPDATE nstats_site_settings SET page_order=3 WHERE category="Player Pages" AND name="Display Pickup History"`,
    `UPDATE nstats_site_settings SET page_order=2 WHERE category="Player Pages" AND name="Display Ping History Graph"`,
    `UPDATE nstats_site_settings SET page_order=1 WHERE category="Player Pages" AND name="Display Recent Activity Graph"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Player Pages" AND name="Display Recent Matches"`,
    `UPDATE nstats_site_settings SET page_order=9 WHERE category="Player Pages" AND name="Display Items Summary"`,
    `UPDATE nstats_site_settings SET page_order=8 WHERE category="Player Pages" AND name="Display Weapon Stats"`,
    `UPDATE nstats_site_settings SET page_order=7 WHERE category="Player Pages" AND name="Display Rankings"`,
    `UPDATE nstats_site_settings SET page_order=6 WHERE category="Player Pages" AND name="Display Special Events"`,
    `UPDATE nstats_site_settings SET page_order=5 WHERE category="Player Pages" AND name="Display Assault & Domination"`,
    `UPDATE nstats_site_settings SET page_order=4 WHERE category="Player Pages" AND name="Display Capture The Flag Cap Records"`,
    `UPDATE nstats_site_settings SET page_order=3 WHERE category="Player Pages" AND name="Display Capture The Flag Summary"`,
    `UPDATE nstats_site_settings SET page_order=2 WHERE category="Player Pages" AND name="Display Frag Summary"`,
    `UPDATE nstats_site_settings SET page_order=1 WHERE category="Player Pages" AND name="Display Gametype Stats"`,
    `UPDATE nstats_site_settings SET page_order=0 WHERE category="Player Pages" AND name="Display Summary"`
];

(async () =>{

    try{
        new Message(`Reset to default page order settings.`,"note");

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