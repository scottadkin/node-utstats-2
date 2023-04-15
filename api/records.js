const mysql = require("./database");
const Players = require("./players");

class Records{

    constructor(){

        this.validPlayerTotalTypes = [
            {"value": "first","displayValue": "First Match" },
            {"value": "last","displayValue": "Last Match" },
            {"value": "matches","displayValue": "Matches Played" },
            {"value": "wins","displayValue": "Wins" },
            {"value": "losses","displayValue": "Losses" },
            {"value": "draws","displayValue": "Draws" },
            {"value": "winrate","displayValue": "Winrate" },
            {"value": "playtime","displayValue": "Playtime" },
            {"value": "team_0_playtime","displayValue": "Red Team Playtime" },
            {"value": "team_1_playtime","displayValue": "Blue Team Playtime" },
            {"value": "team_2_playtime","displayValue": "Green Team Playtime" },
            {"value": "team_3_playtime","displayValue": "Yellow Team Playtime" },
            {"value": "spec_playtime","displayValue": "Spectator Time" },
            {"value": "first_bloods","displayValue": "First Bloods" },
            {"value": "frags","displayValue": "Frags" },
            {"value": "score","displayValue": "Score" },
            {"value": "kills","displayValue": "Kills" },
            {"value": "deaths","displayValue": "Deaths" },
            {"value": "suicides","displayValue": "Suicides" },
            {"value": "team_kills","displayValue": "Team Kills" },
            {"value": "spawn_kills","displayValue": "Spawn Kills" },
            {"value": "efficiency","displayValue": "Efficiency" },
            {"value": "multi_1","displayValue": "Double Kills" },
            {"value": "multi_2","displayValue": "Multi Kills" },
            {"value": "multi_3","displayValue": "Mega Kills" },
            {"value": "multi_4","displayValue": "Ultra Kills" },
            {"value": "multi_5","displayValue": "Monster Kills" },
            {"value": "multi_6","displayValue": "Ludicrous Kills" },
            {"value": "multi_7","displayValue": "Holy Shits" },
            {"value": "multi_best","displayValue": "Best Multi Kill" },
            {"value": "spree_1","displayValue": "Killing Spree" },
            {"value": "spree_2","displayValue": "Rampage" },
            {"value": "spree_3","displayValue": "Dominating" },
            {"value": "spree_4","displayValue": "Unstoppable" },
            {"value": "spree_5","displayValue": "Godlike" },
            {"value": "spree_6","displayValue": "Too Easy" },
            {"value": "spree_7","displayValue": "Brutalizing The Competition" },
            {"value": "spree_best","displayValue": "Best Killing Spree" },
            {"value": "fastest_kill","displayValue": "Fastest Time Between Kills" },
            {"value": "slowest_kill","displayValue": "Longest Time Between Kills" },
            {"value": "best_spawn_kill_spree","displayValue": "Best Spawn Kill Spree" },
            {"value": "assault_objectives","displayValue": "Assault Objectives" },
            {"value": "dom_caps","displayValue": "Domination Caps" },
            {"value": "dom_caps_best","displayValue": "Domination Caps Best" },
            {"value": "dom_caps_best_life","displayValue": "Domination Caps Best Life" },
            {"value": "accuracy","displayValue": "Accuracy" },
            {"value": "k_distance_normal","displayValue": "Close Range Kills" },
            {"value": "k_distance_long","displayValue": "Long Range Kills" },
            {"value": "k_distance_uber","displayValue": "Uber Long Range Kills" },
            {"value": "headshots","displayValue": "Headshots" },
            {"value": "shield_belt","displayValue": "Shield Belts" },
            {"value": "amp","displayValue": "Damage Amplifier" },
            {"value": "amp_time","displayValue": "Damage Amplifier Time" },
            {"value": "invisibility","displayValue": "Invisibility" },
            {"value": "invisibility_time","displayValue": "Invisibility Time" },
            {"value": "pads","displayValue": "Thigh Pads" },
            {"value": "armor","displayValue": "Body Armour" },
            {"value": "boots","displayValue": "Jump Boots" },
            {"value": "super_health","displayValue": "Super Health" },
            {"value": "mh_kills","displayValue": "Monsterhunt Kills" },
            {"value": "mh_kills_best_life","displayValue": "Monsterhunt Kills Best Life" },
            {"value": "mh_kills_best","displayValue": "Monsterhunt Kills Best" },
            {"value": "mh_deaths","displayValue": "Monsterhunt Deaths" },
            {"value": "mh_deaths_worst","displayValue": "Monsterhunt Deaths Worst" }
          ];


        this.totalPerPageOptions = [  
            {"value": 5, "displayValue": "5"},
            {"value": 10, "displayValue": "10"},
            {"value": 15, "displayValue": "15"},
            {"value": 25, "displayValue": "25"},
            {"value": 50, "displayValue": "50"},
            {"value": 100, "displayValue": "100"}     
        ];
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


    bValidTotalType(value){

        for(const option of Object.values(this.validPlayerTotalTypes)){

            if(option.value === value) return true;
        }

        return false;
    }

    cleanPerPage(perPage){

        perPage = parseInt(perPage);

        if(perPage !== perPage) return this.totalPerPageOptions[3];

        if(perPage < 5) return this.totalPerPageOptions[0];
        if(perPage > 100) return this.totalPerPageOptions[5];

        return perPage;
    }

    async getTotalCount(gametype){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_totals WHERE gametype=?`;

        const result = await mysql.simpleQuery(query, [gametype]);

        return result[0].total_matches;
    }

    async getPlayerTotalAllGametypes(type, start, perPage){

        const query = `SELECT id as player_id,name,country,matches,last,playtime,${type} as tvalue FROM nstats_player_totals WHERE gametype=0 ORDER BY ${type} DESC LIMIT ?, ?`;

        const vars = [start, perPage];

        return await mysql.simpleQuery(query, vars);

    }

    async getPlayerTotalSingleGametypes(gametype, type, start, perPage){

        const query = `SELECT player_id,name,matches,last,playtime,${type} as tvalue FROM nstats_player_totals WHERE gametype=? ORDER BY ${type} DESC LIMIT ?, ?`;

        const vars = [gametype, start, perPage];

        const result = await mysql.simpleQuery(query, vars);

        const playerIds = [...new Set(result.map((r) =>{
            return r.player_id;
        }))];

        const pm = new Players();

        const countries = await pm.getCountries(playerIds);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            r.country = countries[r.player_id] ?? "xx";
        }

        return result;
    }

    async getPlayerTotalRecords(type, gametype, page, perPage){

        page = page - 1;

        type = type.toLowerCase();

        if(!this.bValidTotalType(type)) return null;
        perPage = this.cleanPerPage(perPage);

        page = parseInt(page);

        if(page !== page) page = 0;
        if(page < 0) page = 0;

        let start = perPage * page;
        if(start < 0) start = 0;

        let result = [];
        
        if(gametype === 0){
            result = await this.getPlayerTotalAllGametypes(type, start, perPage)
            
        }else{
           result =  await this.getPlayerTotalSingleGametypes(gametype, type, start, perPage);
        }

        const totalResults = await this.getTotalCount(gametype);

        return {
            "totalResults": totalResults,
            "data": result
        };
    }
}

module.exports = Records;