const mysql = require("./api/database");
const Message = require("./api/message");

new Message(`Setting Default Page orders`,"note");

const queries = [
    `DELETE FROM nstats_site_settings WHERE id >= 0`,
    `INSERT INTO nstats_site_settings VALUES(104, 'Home', 'Recent Matches To Display', '3', 10);`,
    `INSERT INTO nstats_site_settings VALUES(105, 'Home', 'Recent Matches Display Type', '0', 9);`,
    `INSERT INTO nstats_site_settings VALUES(106, 'Home', 'Display Most Played Gametypes', 'true', 8);`,
    `INSERT INTO nstats_site_settings VALUES(107, 'Home', 'Display Most Used Faces', 'true', 7);`,
    `INSERT INTO nstats_site_settings VALUES(108, 'Home', 'Display Most Played Maps', 'true', 6);`,
    `INSERT INTO nstats_site_settings VALUES(109, 'Home', 'Display Most Popular Countries', 'true', 5);`,
    `INSERT INTO nstats_site_settings VALUES(110, 'Home', 'Display Recent Players', 'true', 4);`,
    `INSERT INTO nstats_site_settings VALUES(111, 'Home', 'Display Addicted Players', 'true', 1);`,
    `INSERT INTO nstats_site_settings VALUES(112, 'Home', 'Display Latest Match', 'true', 0);`,
    `INSERT INTO nstats_site_settings VALUES(113, 'Home', 'Display Recent Matches', 'true', 2);`,
    `INSERT INTO nstats_site_settings VALUES(114, 'Home', 'Display Recent Matches & Player Stats', 'true', 3);`,
    `INSERT INTO nstats_site_settings VALUES(115, 'Map Pages', 'Display Addicted Players', 'true', 9);`,
    `INSERT INTO nstats_site_settings VALUES(116, 'Map Pages', 'Display Control Points (Domination)', 'true', 8);`,
    `INSERT INTO nstats_site_settings VALUES(117, 'Map Pages', 'Display Games Played', 'true', 5);`,
    `INSERT INTO nstats_site_settings VALUES(118, 'Map Pages', 'Display Longest Matches', 'true', 10);`,
    `INSERT INTO nstats_site_settings VALUES(119, 'Map Pages', 'Display Map Objectives (Assault)', 'true', 7);`,
    `INSERT INTO nstats_site_settings VALUES(120, 'Map Pages', 'Display Recent Matches', 'true', 4);`,
    `INSERT INTO nstats_site_settings VALUES(121, 'Map Pages', 'Display Spawn Points', 'true', 11);`,
    `INSERT INTO nstats_site_settings VALUES(122, 'Map Pages', 'Display Summary', 'true', 3);`,
    `INSERT INTO nstats_site_settings VALUES(123, 'Map Pages', 'Max Addicted Players', '5', 2);`,
    `INSERT INTO nstats_site_settings VALUES(124, 'Map Pages', 'Max Longest Matches', '5', 1);`,
    `INSERT INTO nstats_site_settings VALUES(125, 'Map Pages', 'Recent Matches Per Page', '50', 0);`,
    `INSERT INTO nstats_site_settings VALUES(126, 'Map Pages', 'Display CTF Caps', 'true', 6);`,
    `INSERT INTO nstats_site_settings VALUES(127, 'Maps Page', 'Default Display Per Page', '25', 0);`,
    `INSERT INTO nstats_site_settings VALUES(128, 'Maps Page', 'Default Display Type', '0', 0);`,
    `INSERT INTO nstats_site_settings VALUES(129, 'Match Pages', 'Display Server Settings', 'true', 29);`,
    `INSERT INTO nstats_site_settings VALUES(130, 'Match Pages', 'Display Players Connected to Server Graph', 'true', 27);`,
    `INSERT INTO nstats_site_settings VALUES(131, 'Match Pages', 'Display Team Changes', 'true', 26);`,
    `INSERT INTO nstats_site_settings VALUES(132, 'Match Pages', 'Display Player Ping Graph', 'true', 24);`,
    `INSERT INTO nstats_site_settings VALUES(133, 'Match Pages', 'Display Ammo Control', 'true', 17);`,
    `INSERT INTO nstats_site_settings VALUES(134, 'Match Pages', 'Display Health/Armour Control', 'true', 18);`,
    `INSERT INTO nstats_site_settings VALUES(135, 'Match Pages', 'Display Weapons Control', 'true', 19);`,
    `INSERT INTO nstats_site_settings VALUES(136, 'Match Pages', 'Display Powerup Control', 'true', 20);`,
    `INSERT INTO nstats_site_settings VALUES(137, 'Match Pages', 'Display Pickup Summary', 'true', 21);`,
    `INSERT INTO nstats_site_settings VALUES(138, 'Match Pages', 'Display Kills Match Up', 'true', 22);`,
    `INSERT INTO nstats_site_settings VALUES(139, 'Match Pages', 'Display Rankings', 'true', 16);`,
    `INSERT INTO nstats_site_settings VALUES(140, 'Match Pages', 'Display Frags Graphs', 'true', 9);`,
    `INSERT INTO nstats_site_settings VALUES(141, 'Match Pages', 'Display Player Score Graph', 'true', 25);`,
    `INSERT INTO nstats_site_settings VALUES(142, 'Match Pages', 'Display Time Limit', 'true', 28);`,
    `INSERT INTO nstats_site_settings VALUES(143, 'Match Pages', 'Display Target Score', 'true', 30);`,
    `INSERT INTO nstats_site_settings VALUES(144, 'Match Pages', 'Display Mutators', 'true', 31);`,
    `INSERT INTO nstats_site_settings VALUES(145, 'Match Pages', 'Display Weapon Statistics', 'true', 23);`,
    `INSERT INTO nstats_site_settings VALUES(146, 'Match Pages', 'Display Extended Sprees', 'true', 15);`,
    `INSERT INTO nstats_site_settings VALUES(147, 'Match Pages', 'Display Special Events', 'true', 14);`,
    `INSERT INTO nstats_site_settings VALUES(148, 'Match Pages', 'Display Capture The Flag Graphs', 'true', 11);`,
    `INSERT INTO nstats_site_settings VALUES(149, 'Match Pages', 'Display Capture The Flag Times', 'true', 12);`,
    `INSERT INTO nstats_site_settings VALUES(150, 'Match Pages', 'Display Capture The Flag Caps', 'true', 13);`,
    `INSERT INTO nstats_site_settings VALUES(151, 'Match Pages', 'Display Domination Graphs', 'true', 4);`,
    `INSERT INTO nstats_site_settings VALUES(152, 'Match Pages', 'Display Capture The Flag Summary', 'true', 6);`,
    `INSERT INTO nstats_site_settings VALUES(153, 'Match Pages', 'Display MonsterHunt Kills', 'true', 7);`,
    `INSERT INTO nstats_site_settings VALUES(154, 'Match Pages', 'Display Domination Summary', 'true', 3);`,
    `INSERT INTO nstats_site_settings VALUES(155, 'Match Pages', 'Display Assault Summary', 'true', 5);`,
    `INSERT INTO nstats_site_settings VALUES(156, 'Match Pages', 'Display Frag Summary', 'true', 8);`,
    `INSERT INTO nstats_site_settings VALUES(157, 'Match Pages', 'Display Screenshot', 'true', 2);`,
    `INSERT INTO nstats_site_settings VALUES(158, 'Match Pages', 'Display Summary', 'true', 1);`,
    `INSERT INTO nstats_site_settings VALUES(159, 'Match Pages', 'Display Match Report Title', 'true', 0);`,
    `INSERT INTO nstats_site_settings VALUES(160, 'Matches Page', 'Default Display Per Page', '25', 0);`,
    `INSERT INTO nstats_site_settings VALUES(161, 'Matches Page', 'Default Display Type', '0', 0);`,
    `INSERT INTO nstats_site_settings VALUES(162, 'Matches Page', 'Default Gametype', '0', 0);`,
    `INSERT INTO nstats_site_settings VALUES(163, 'Matches Page', 'Minimum Players', '0', 0);`,
    `INSERT INTO nstats_site_settings VALUES(164, 'Matches Page', 'Minimum Playtime', '0', 0);`,
    `INSERT INTO nstats_site_settings VALUES(165, 'Navigation', 'Display Admin', 'true', 7);`,
    `INSERT INTO nstats_site_settings VALUES(166, 'Navigation', 'Display Home', 'true', 0);`,
    `INSERT INTO nstats_site_settings VALUES(167, 'Navigation', 'Display Login/Logout', 'true', 8);`,
    `INSERT INTO nstats_site_settings VALUES(168, 'Navigation', 'Display Maps', 'true', 5);`,
    `INSERT INTO nstats_site_settings VALUES(169, 'Navigation', 'Display Matches', 'true', 1);`,
    `INSERT INTO nstats_site_settings VALUES(170, 'Navigation', 'Display Players', 'true', 2);`,
    `INSERT INTO nstats_site_settings VALUES(171, 'Navigation', 'Display Rankings', 'true', 3);`,
    `INSERT INTO nstats_site_settings VALUES(172, 'Navigation', 'Display Records', 'true', 4);`,
    `INSERT INTO nstats_site_settings VALUES(173, 'Navigation', 'Display ACE', 'true', 6);`,
    `INSERT INTO nstats_site_settings VALUES(174, 'Player Pages', 'Default Recent Matches Display', '0', 18);`,
    `INSERT INTO nstats_site_settings VALUES(175, 'Player Pages', 'Default Weapon Display', '0', 17);`,
    `INSERT INTO nstats_site_settings VALUES(176, 'Player Pages', 'Recent Matches Per Page', '25', 15);`,
    `INSERT INTO nstats_site_settings VALUES(177, 'Player Pages', 'Display Aliases', 'true', 12);`,
    `INSERT INTO nstats_site_settings VALUES(178, 'Player Pages', 'Display Pickup History', 'true', 9);`,
    `INSERT INTO nstats_site_settings VALUES(179, 'Player Pages', 'Display Ping History Graph', 'true', 13);`,
    `INSERT INTO nstats_site_settings VALUES(180, 'Player Pages', 'Display Recent Activity Graph', 'true', 14);`,
    `INSERT INTO nstats_site_settings VALUES(181, 'Player Pages', 'Display Recent Matches', 'true', 16);`,
    `INSERT INTO nstats_site_settings VALUES(182, 'Player Pages', 'Display Items Summary', 'true', 11);`,
    `INSERT INTO nstats_site_settings VALUES(183, 'Player Pages', 'Display Weapon Stats', 'true', 10);`,
    `INSERT INTO nstats_site_settings VALUES(184, 'Player Pages', 'Display Rankings', 'true', 8);`,
    `INSERT INTO nstats_site_settings VALUES(185, 'Player Pages', 'Display Special Events', 'true', 7);`,
    `INSERT INTO nstats_site_settings VALUES(186, 'Player Pages', 'Display Assault & Domination', 'true', 6);`,
    `INSERT INTO nstats_site_settings VALUES(187, 'Player Pages', 'Display Capture The Flag Cap Records', 'true', 8);`,
    `INSERT INTO nstats_site_settings VALUES(188, 'Player Pages', 'Display Capture The Flag Summary', 'true', 5);`,
    `INSERT INTO nstats_site_settings VALUES(189, 'Player Pages', 'Display Frag Summary', 'true', 2);`,
    `INSERT INTO nstats_site_settings VALUES(190, 'Player Pages', 'Display Gametype Stats', 'true', 1);`,
    `INSERT INTO nstats_site_settings VALUES(191, 'Player Pages', 'Display Summary', 'true', 0);`,
    `INSERT INTO nstats_site_settings VALUES(192, 'Player Pages', 'Display Capture The Flag Cap Records', 'true', 7);`,
    `INSERT INTO nstats_site_settings VALUES(193, 'Player Pages', 'Display Monsterhunt Basic Stats', 'true', 3);`,
    `INSERT INTO nstats_site_settings VALUES(194, 'Player Pages', 'Display Monsterhunt Monster Stats', 'true', 4);`,
    `INSERT INTO nstats_site_settings VALUES(195, 'Players Page', 'Default Display Per Page', '25', 0);`,
    `INSERT INTO nstats_site_settings VALUES(196, 'Players Page', 'Default Display Type', '0', 0);`,
    `INSERT INTO nstats_site_settings VALUES(197, 'Players Page', 'Default Order', 'ASC', 0);`,
    `INSERT INTO nstats_site_settings VALUES(198, 'Players Page', 'Default Sort Type', 'name', 0);`,
    `INSERT INTO nstats_site_settings VALUES(199, 'Rankings', 'Rankings Per Gametype (Main)', '10', 0);`,
    `INSERT INTO nstats_site_settings VALUES(200, 'Rankings', 'Rankings Per Page (Individual)', '100', 0);`,
    `INSERT INTO nstats_site_settings VALUES(201, 'Records Page', 'Default Per Page', '25', 0);`,
    `INSERT INTO nstats_site_settings VALUES(202, 'Records Page', 'Default Record Type', '0', 0);`,
    `INSERT INTO nstats_site_settings VALUES(203, 'Records Page', 'Minimum Solo Caps Before Displayed', '1', 0);`,
    `INSERT INTO nstats_site_settings VALUES(204, 'Records Page', 'Minimum Assisted Caps Before Displayed', '1', 0);`,
    `INSERT INTO nstats_site_settings VALUES(205, 'Records Page', 'Maximum Solo Caps To Display', '50', 0);`,
    `INSERT INTO nstats_site_settings VALUES(206, 'Records Page', 'Maximum Assisted Caps To Display', '50', 0);`,
    `INSERT INTO nstats_site_settings VALUES(207, 'Match Pages', 'Display Combogib Stats', 'true', 10);`,

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