const mysql = require("./database");

class Records{

    constructor(){

        this.validPlayerTotalTypes = [
            { value: "first", displayValue: "First Match" },
            { value: "last", displayValue: "Last Match" },
            { value: "matches", displayValue: "Matches Played" },
            { value: "wins", displayValue: "Wins" },
            { value: "losses", displayValue: "Losses" },
            { value: "draws", displayValue: "Draws" },
            { value: "winrate", displayValue: "Winrate" },
            { value: "playtime", displayValue: "Playtime" },
            { value: "team_0_playtime", displayValue: "Red Team Playtime" },
            { value: "team_1_playtime", displayValue: "Blue Team Playtime" },
            { value: "team_2_playtime", displayValue: "Green Team Playtime" },
            { value: "team_3_playtime", displayValue: "Yellow Team Playtime" },
            { value: "spec_playtime", displayValue: "Spectator Time" },
            { value: "first_bloods", displayValue: "First Bloods" },
            { value: "frags", displayValue: "Frags" },
            { value: "score", displayValue: "Score" },
            { value: "kills", displayValue: "Kills" },
            { value: "deaths", displayValue: "Deaths" },
            { value: "suicides", displayValue: "Suicides" },
            { value: "team_kills", displayValue: "Team Kills" },
            { value: "spawn_kills", displayValue: "Spawn Kills" },
            { value: "efficiency", displayValue: "Efficiency" },
            { value: "multi_1", displayValue: "Double Kills" },
            { value: "multi_2", displayValue: "Multi Kills" },
            { value: "multi_3", displayValue: "Mega Kills" },
            { value: "multi_4", displayValue: "Ultra Kills" },
            { value: "multi_5", displayValue: "Monster Kills" },
            { value: "multi_6", displayValue: "Ludicrous Kills" },
            { value: "multi_7", displayValue: "Holy Shits" },
            { value: "multi_best", displayValue: "Best Multi Kill" },
            { value: "spree_1", displayValue: "Killing Spree" },
            { value: "spree_2", displayValue: "Rampage" },
            { value: "spree_3", displayValue: "Dominating" },
            { value: "spree_4", displayValue: "Unstoppable" },
            { value: "spree_5", displayValue: "Godlike" },
            { value: "spree_6", displayValue: "Too Easy" },
            { value: "spree_7", displayValue: "Brutalizing The Competition" },
            { value: "spree_best", displayValue: "Best Killing Spree" },
            { value: "fastest_kill", displayValue: "Fastest Time Between Kills" },
            { value: "slowest_kill", displayValue: "Longest Time Between Kills" },
            { value: "best_spawn_kill_spree", displayValue: "Best Spawn Kill Spree" },
            { value: "assault_objectives", displayValue: "Assault Objectives" },
            { value: "dom_caps", displayValue: "Domination Caps" },
            { value: "dom_caps_best", displayValue: "Domination Caps Best" },
            { value: "dom_caps_best_life", displayValue: "Domination Caps Best Life" },
            { value: "accuracy", displayValue: "Accuracy" },
            { value: "k_distance_normal", displayValue: "Close Range Kills" },
            { value: "k_distance_long", displayValue: "Long Range Kills" },
            { value: "k_distance_uber", displayValue: "Uber Long Range Kills" },
            { value: "headshots", displayValue: "Headshots" },
            { value: "shield_belt", displayValue: "Shield Belts" },
            { value: "amp", displayValue: "Damage Amplifier" },
            { value: "amp_time", displayValue: "Damage Amplifier Time" },
            { value: "invisibility", displayValue: "Invisibility" },
            { value: "invisibility_time", displayValue: "Invisibility Time" },
            { value: "pads", displayValue: "Thigh Pads" },
            { value: "armor", displayValue: "Body Armour" },
            { value: "boots", displayValue: "Jump Boots" },
            { value: "super_health", displayValue: "Super Health" },
            { value: "mh_kills", displayValue: "Monsterhunt Kills" },
            { value: "mh_kills_best_life", displayValue: "Monsterhunt Kills Best Life" },
            { value: "mh_kills_best", displayValue: "Monsterhunt Kills Best" },
            { value: "mh_deaths", displayValue: "Monsterhunt Deaths" },
            { value: "mh_deaths_worst", displayValue: "Monsterhunt Deaths Worst" }
          ]
    }


    createValidSettingsObject(){

        console.log(this.validPlayerTotalTypes.map((name) => {
            return {"value": name, "displayValue": ""};
        }));
    }

    async debugGetColumnNames(){

        const query = `Show columns from nstats_player_totals`;

        const result = await mysql.simpleQuery(query);

        return result.map((r) =>{
            return r.Field;
        });

    }
}

module.exports = Records;