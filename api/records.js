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

        this.validPlayerMatchOptions = [
            {"value": "playtime", "displayValue": "Playtime"},
            {"value": "team_0_playtime", "displayValue": "Red Team Playtime"},
            {"value": "team_1_playtime", "displayValue": "Blue Team Playtime"},
            {"value": "team_2_playtime", "displayValue": "Green Team Playtime"},
            {"value": "team_3_playtime", "displayValue": "Yellow Team Playtime"},
            {"value": "spec_playtime", "displayValue": "Spectator Playtime"},
            {"value": "frags", "displayValue": "Frags"},
            {"value": "score", "displayValue": "Score"},
            {"value": "kills", "displayValue": "Kills"},
            {"value": "deaths", "displayValue": "Deaths"},
            {"value": "suicides", "displayValue": "Suicides"},
            {"value": "team_kills", "displayValue": "Team Kills"},
            {"value": "spawn_kills", "displayValue": "Spawn Kills"},
            {"value": "efficiency", "displayValue": "Efficiency"},
            {"value": "multi_1", "displayValue": "Double Kills"},
            {"value": "multi_2", "displayValue": "Multi Kills"},
            {"value": "multi_3", "displayValue": "Mega Kills"},
            {"value": "multi_4", "displayValue": "Ultra Kills"},
            {"value": "multi_5", "displayValue": "Monster Kills"},
            {"value": "multi_6", "displayValue": "Ludicrous Kills"},
            {"value": "multi_7", "displayValue": "Holy Shits"},
            {"value": "multi_best", "displayValue": "Best Multi Kill"},
            {"value": "spree_1", "displayValue": "Killing Sprees"},
            {"value": "spree_2", "displayValue": "Rampage"},
            {"value": "spree_3", "displayValue": "Dominating"},
            {"value": "spree_4", "displayValue": "Unstoppable"},
            {"value": "spree_5", "displayValue": "Godlike"},
            {"value": "spree_6", "displayValue": "Too Easy(30 Kill Spree)"},
            {"value": "spree_7", "displayValue": "Brutalizing(35+ Kill Spree)"},
            {"value": "spree_best", "displayValue": "Best Spree"},
            {"value": "best_spawn_kill_spree", "displayValue": "Best Spawn Kill Spree"},
            {"value": "assault_objectives", "displayValue": "Assault Objectives"},
            {"value": "dom_caps", "displayValue": "Domination Point Caps"},
            {"value": "dom_caps_best_life", "displayValue": "Best Domination Point Caps Single Life"},
            {"value": "ping_min", "displayValue": "Minimum Ping"},
            {"value": "ping_average", "displayValue": "Average Ping"},
            {"value": "ping_max", "displayValue": "Maximum Ping"},
            {"value": "accuracy", "displayValue": "Weapon Accuracy"},
            {"value": "shortest_kill_distance", "displayValue": "Shortest Kill Distance"},
            {"value": "average_kill_distance", "displayValue": "Average kill Distance"},
            {"value": "longest_kill_distance", "displayValue": "Longest Kill Distance"},
            {"value": "k_distance_normal", "displayValue": "Close Range Kills"},
            {"value": "k_distance_long", "displayValue": "Long Range Kills"},
            {"value": "k_distance_uber", "displayValue": "Uber Long Range Kills"},
            {"value": "headshots", "displayValue": "Headshots"},
            {"value": "shield_belt", "displayValue": "Shield Belts"},
            {"value": "amp", "displayValue": "UDamage"},
            {"value": "amp_time", "displayValue": "UDamage Time"},
            {"value": "invisibility", "displayValue": "Invisibility"},
            {"value": "invisibility_time", "displayValue": "Invisibility Time"},
            {"value": "pads", "displayValue": "Armour Pads"},
            {"value": "armor", "displayValue": "Body Armour"},
            {"value": "boots", "displayValue": "Jump Boots"},
            {"value": "super_health", "displayValue": "Super Health"},
            {"value": "mh_kills", "displayValue": "Monsterhunt Kills"},
            {"value": "mh_kills_best_life", "displayValue": "Monsterhunt Kills Best Life"},
            {"value": "mh_deaths", "displayValue": "Monsterhunt Deaths"},
            {"value": "telefrag_kills", "displayValue": "Telefrag Kills"},
            {"value": "telefrag_deaths", "displayValue": "Telefrag Deaths"},
            {"value": "telefrag_best_spree", "displayValue": "Telefrags Best Spree"},
            {"value": "telefrag_best_multi", "displayValue": "Telefrags Best Multi Kill"},
            {"value": "tele_disc_kills", "displayValue": "Translocator Disc Kills"},
            {"value": "tele_disc_deaths", "displayValue": "Translocator Disc Deaths"},
            {"value": "tele_disc_best_spree", "displayValue": "Translocator Discs Best Spree"},
            {"value": "tele_disc_best_multi", "displayValue": "Translocator Discs Best Multi"},
        ];
    }


    createValidSettingsObject(){

        console.log(this.validPlayerTotalTypes.map((name) => {
            return {"value": name, "displayValue": ""};
        }));
    }

    async debugGetColumnNames(){

        const query = `Show columns from nstats_player_matches`;

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

    bValidPlayerType(value){

        for(const option of Object.values(this.validPlayerMatchOptions)){

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

    async getTotalCount(gametype, map){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_player_totals WHERE gametype=? AND map=?`;

        const result = await mysql.simpleQuery(query, [gametype, map]);

        return result[0].total_matches;
    }

    async getPlayerTotalAllGametypes(map, type, start, perPage){

        const idBit = (map === 0) ? "id as player_id,country" : "player_id";

        const query = `SELECT name,${idBit},matches,last,playtime,${type} as tvalue FROM nstats_player_totals WHERE gametype=0 AND map=? ORDER BY ${type} DESC LIMIT ?, ?`;

        const vars = [map, start, perPage];

        const result = await mysql.simpleQuery(query, vars);


        if(map !== 0){

            const playerIds = [...new Set(result.map((p) =>{
                return p.player_id;
            }))];

            const pm = new Players();
            const countries = await pm.getCountries(playerIds);


            for(let i = 0; i < result.length; i++){

                const r = result[i];
                r.country = countries[r.player_id] ?? "xx";
            }

        }

        return result;

    }

    async getPlayerTotalSingleGametypes(gametype, map, type, start, perPage){

 
        const query = `SELECT player_id,name,matches,last,playtime,${type} as tvalue FROM nstats_player_totals WHERE gametype=? AND map=? ORDER BY ${type} DESC LIMIT ?, ?`;

        const vars = [gametype, map, start, perPage];

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

    async getPlayerTotalRecords(type, gametype, map, page, perPage){

        page = page - 1;

        type = type.toLowerCase();

        if(!this.bValidTotalType(type)) throw new Error(`${type} is not a valid player total record type.`);
        perPage = this.cleanPerPage(perPage);

        page = parseInt(page);

        if(page !== page) page = 0;
        if(page < 0) page = 0;

        let start = perPage * page;
        if(start < 0) start = 0;

        let result = [];

        //need to get total maps played for gametmemgmemgemge
        
        if(gametype === 0){
            result = await this.getPlayerTotalAllGametypes(map, type, start, perPage);
            
        }else{
           result =  await this.getPlayerTotalSingleGametypes(gametype, map, type, start, perPage);
        }

        const totalResults = await this.getTotalCount(gametype, map);

        return {
            "totalResults": totalResults,
            "data": result
        };
    }


    async getPlayerMatchRecordsAny(cat, start, perPage){

        const where = (cat !== "spec_playtime") ? " AND playtime>0" : "";

        const normalSelect = `SELECT player_id,map_id,gametype,playtime,match_id,match_date,${cat} as tvalue`;
        const totalSelect = `SELECT COUNT(*) as total_results`;

        const query = ` FROM nstats_player_matches WHERE ${cat}!=0 ${where}`;

        const orderBy = ` ORDER BY tvalue DESC LIMIT ?,?`;

        const vars = [start, perPage];

        const totalResults = await mysql.simpleQuery(`${totalSelect}${query}`, vars);
        const result = await mysql.simpleQuery(`${normalSelect}${query}${orderBy}`, vars);

        const playerIds = [...new Set(result.map((r) =>{
            return r.player_id;
        }))];

        return {"data": result, "playerIds": playerIds, "totalResults": totalResults[0].total_results};
    }

    async getPlayerMatchRecordsCustom(gametypeId, mapId, cat, start, perPage){

        const normalSelect = `SELECT player_id,map_id,gametype,playtime,match_id,match_date,${cat} as tvalue`;
        const totalSelect = `SELECT COUNT(*) as total_results`;

        let query = ` FROM nstats_player_matches WHERE ${cat}!=0`;

        const vars = [];

        let whereString = "";

        if(gametypeId !== 0){
            
            whereString = " AND gametype=?";
            vars.push(gametypeId);
        }

        if(mapId !== 0){

            whereString = " AND map_id=?";
            vars.push(mapId);
        }

        if(cat !== "spec_playtime"){

            if(whereString === ""){
                whereString = " AND playtime>0";
            }else{
                whereString = `${whereString} AND playtime>0`;
            }
        }

        const orderByString = " ORDER BY tvalue DESC LIMIT ?,?";

        query = `${query}${whereString}`;

        const totalResults = await mysql.simpleQuery(`${totalSelect}${query}`, [...vars, start, perPage]);

        const result = await mysql.simpleQuery(`${normalSelect}${query}${orderByString}`, [...vars, start, perPage]);

        const playerIds = [...new Set(result.map((r) =>{
            return r.player_id;
        }))];

        return {"data": result, "playerIds": playerIds, "totalResults": totalResults[0].total_results};
    }

    setPlayerInfo(data, playerInfo){

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const player = playerInfo[d.player_id] ?? {"name": "Not Found", "country": "xx"};

            d.name = player.name;
            d.country = player.country;

        }
      
    }

    async getPlayerMatchRecords(gametypeId, mapId, cat, page, perPage){

        if(!this.bValidPlayerType(cat)) throw new Error(`${cat} is not a valid player record type.`);

        page = page - 1;
        if(page < 0) page = 0;

        const start = page * perPage;
        
        let result = null;

        if(gametypeId === 0 && mapId === 0){
            result = await this.getPlayerMatchRecordsAny(cat, start, perPage);
        }else{
            result = await this.getPlayerMatchRecordsCustom(gametypeId, mapId, cat, start, perPage);
        }

        if(result === null) return null;

        const pm = new Players();

        const playersInfo = await pm.getBasicInfo(result.playerIds, true);
        this.setPlayerInfo(result.data, playersInfo);

        
        result.mapIds = [...new Set(result.data.map((r) =>{
            return r.map_id;
        }))];


        result.gametypeIds = [...new Set(result.data.map((r) =>{
            return r.gametype;
        }))];

        return {"data": result, "totalResults": result.totalResults };
        
    }
}

module.exports = Records;