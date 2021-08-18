import mysql from './database';

class Players{

    constructor(){

    }

    async getPlayerName(playerId){

        const query = "SELECT name FROM uts_pinfo WHERE id=?";

        const result = await mysql.simpleQuery(query, [playerId]);

        if(result.length > 0){

            return result[0].name;
        }

        return "Not Found";
    }

    async getDmWinner(matchId){

        const query = "SELECT pid from uts_player WHERE matchid=? ORDER by frags DESC LIMIT 1";

        const result = await mysql.simpleQuery(query, [matchId]);

        if(result.length > 0){
            return await this.getPlayerName(result[0].pid);
        }

        return null;
    }

    async getNames(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,name FROM uts_pinfo WHERE id IN (?)";

        const result =  await mysql.simpleQuery(query, [ids]);

        const names = {};

        for(let i = 0; i < result.length; i++){

            names[result[i].id] = result[i].name;
        }

        return names;
    }

    async getSingleNameAndCountry(id){

        const query = "SELECT name,country FROM uts_pinfo WHERE id=?";

        const result = await mysql.simpleQuery(query, [id]);

        if(result.length > 0){
            return result[0];
        }

        return null;
    }

    async getNamesAndCountry(ids){

        if(ids.length === 0) return [];

        const query = "SELECT id,name,country FROM uts_pinfo WHERE id IN (?)";

        const result = await mysql.simpleQuery(query, [ids]);

        const names = {};

        for(let i = 0; i < result.length; i++){

            names[result[i].id] = {"name": result[i].name, "country": result[i].country};
        }

        return names;
    }

    async getMatchData(matchId, bBasic){

        let query = "SELECT * FROM uts_player WHERE matchid=? ORDER BY gamescore DESC";

        if(bBasic){
            query = "SELECT pid,team,country,id,matchid FROM uts_player WHERE matchid=? ORDER BY matchid DESC";
        }

        const players = await mysql.simpleQuery(query, [matchId]);

        const playerIds = [];

        for(let i = 0; i < players.length; i++){

            playerIds.push(players[i].pid);
        }

        const names = await this.getNames(playerIds);

        let p = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            if(names[p.pid] === undefined){
                p.name = "Not Found";
            }else{
                p.name = names[p.pid];
            }
        }

        return players;

    }

    //temp fix to order names correctly in player lists like mysql does
    orderElementsByName(correctOrder, currentData){

        const data = [];

        const currentDataObj = {};

        for(let i = 0; i < currentData.length; i++){

            currentDataObj[currentData[i].pid] = currentData[i];
        }

        for(let i = 0; i < correctOrder.length; i++){

            const index = correctOrder[i];

            data.push(currentDataObj[index]);
        }

        return data;

    }

    async getDefaultPlayers(page, perPage, desc){

        const order = (desc) ? "DESC" : "ASC";

        const query = `SELECT id,name,country FROM uts_pinfo ORDER by name ${order} LIMIT ?, ?`;
        page--;

        const start = page * perPage;

        const result = await mysql.simpleQuery(query, [start, perPage]);

        if(result.length === 0) return [];

        const names = {};

        const playerIds = [];

        for(let i = 0; i < result.length; i++){

            playerIds.push(result[i].id);

            names[result[i].id] = {"name": result[i].name, "country": result[i].country};
        }

        
        const statsQuery = `SELECT COUNT(*) as total_matches,pid,SUM(gamescore) as gamescore,
        SUM(frags) as frags, SUM(kills) as kills, SUM(deaths) as deaths,
        eff,SUM(gametime) as gametime FROM uts_player WHERE pid IN(?) GROUP BY(pid)`;

        const stats = await mysql.simpleQuery(statsQuery, [playerIds]);

        for(let i = 0; i < stats.length; i++){

            stats[i].name = names[stats[i].pid].name;
            stats[i].country = names[stats[i].pid].country;
        }

        
        return this.orderElementsByName(playerIds, stats);
       
    }


    async getTotalPlayers(){

        const query = "SELECT COUNT(*) as players FROM uts_pinfo";

        const result = await mysql.simpleQuery(query);

        if(result.length > 0){
            return result[0].players;
        }

        return 0;
    }

    async getPlayersInOrderOf(type, order, page, perPage){

        type = type.toLowerCase();
        order = order.toLowerCase();

        if(type === "matches") type = "total_matches";
        if(type === "score") type = "gamescore";
        if(type === "hours") type = "gametime";

        const validTypes = ["total_matches","gamescore","frags","kills","deaths","eff","gametime"];

        const index = validTypes.indexOf(type);

        if(index !== -1){

            const safeType = validTypes[index];

            if(order === "a"){
                order = "ASC";
            }else{
                order = "DESC";
            }

            const query = `SELECT COUNT(*) as total_matches,pid,SUM(gamescore) as gamescore,
            SUM(frags) as frags, SUM(kills) as kills, SUM(deaths) as deaths,
            IF(SUM(kills) > 0, IF(SUM(deaths) > 0, (SUM(kills) / (SUM(deaths) + SUM(kills))) * 100, 100), 0) as eff,
            SUM(gametime) as gametime FROM uts_player GROUP BY(pid) ORDER by ${safeType} ${order} LIMIT ?, ?`;
            
            page--;
            const start = page * perPage;

            const result = await mysql.simpleQuery(query, [start, perPage]);

            const playerIds = [];

            for(let i = 0; i < result.length; i++){

                playerIds.push(result[i].pid);
            }

            const names = await this.getNamesAndCountry(playerIds);

            for(let i = 0; i < result.length; i++){

                result[i].name = names[result[i].pid].name;
                result[i].country = names[result[i].pid].country;
            }

            return result;
        }

        return [];
    }


    async getPlayerProfileData(id){

        const query = `SELECT 
        COUNT(*) as total_matches,
        SUM(gametime) as gametime,
        SUM(gamescore) as gamescore,
        MIN(lowping) as lowping,
        MAX(highping) as highping,
        AVG(avgping) as avgping,
        SUM(frags) as frags,
        SUM(deaths) as deaths,
        SUM(kills) as kills,
        SUM(suicides) as suicides,
        SUM(teamkills) as teamkills,
        AVG(accuracy) as accuracy,
        AVG(ttl) as ttl,
        SUM(flag_taken) as flag_taken,
        SUM(flag_dropped) as flag_dropped,
        SUM(flag_return) as flag_return,
        SUM(flag_capture) as flag_capture,
        SUM(flag_cover) as flag_cover,
        SUM(flag_seal) as flag_seal,
        SUM(flag_assist) as flag_assist,
        SUM(flag_kill) as flag_kill,
        SUM(flag_pickedup) as flag_pickedup,
        SUM(dom_cp) as dom_cp,
        SUM(ass_obj) as ass_obj,
        SUM(spree_double) as spree_double,
        SUM(spree_multi) as spree_multi,
        SUM(spree_ultra) as spree_ultra,
        SUM(spree_monster) as spree_monster,
        SUM(spree_kill) as spree_kill,
        SUM(spree_rampage) as spree_rampage,
        SUM(spree_dom) as spree_dom,
        SUM(spree_uns) as spree_uns,
        SUM(spree_god) as spree_god,
        SUM(pu_pads) as pu_pads,
        SUM(pu_armour) as pu_armour,
        SUM(pu_keg) as pu_keg,
        SUM(pu_invis) as pu_invis,
        SUM(pu_belt) as pu_belt,
        SUM(pu_amp) as pu_amp,

        MAX(gametime) as max_gametime,
        MAX(gamescore) as max_gamescore,
        MAX(lowping) as max_lowping,
        MAX(avgping) as max_avgping,
        MAX(highping) as max_highping,
        MAX(frags) as max_frags,
        MAX(deaths) as max_deaths,
        MAX(kills) as max_kills,
        MAX(suicides) as max_suicides,
        MAX(teamkills) as max_teamkills,
        MAX(eff) as max_eff,
        MAX(accuracy) as max_accuracy,
        MAX(ttl) as max_ttl,
        MAX(flag_taken) as max_flag_taken,
        MAX(flag_dropped) as max_flag_dropped,
        MAX(flag_return) as max_flag_return,
        MAX(flag_capture) as max_flag_capture,
        MAX(flag_cover) as max_flag_cover,
        MAX(flag_seal) as max_flag_seal,
        MAX(flag_assist) as max_flag_assist,
        MAX(flag_kill) as max_flag_kill,
        MAX(flag_pickedup) as max_flag_pickedup,
        MAX(dom_cp) as max_dom_cp,
        MAX(ass_obj) as max_ass_obj,
        MAX(spree_double) as max_spree_double,
        MAX(spree_multi) as max_spree_multi,
        MAX(spree_ultra) as max_spree_ultra,
        MAX(spree_monster) as max_spree_monster,
        MAX(spree_kill) as max_spree_kill,
        MAX(spree_rampage) as max_spree_rampage,
        MAX(spree_dom) as max_spree_dom,
        MAX(spree_uns) as max_spree_uns,
        MAX(spree_god) as max_spree_god,
        MAX(pu_pads) as max_pu_pads,
        MAX(pu_armour) as max_pu_armour,
        MAX(pu_keg) as max_pu_keg,
        MAX(pu_invis) as max_pu_invis,
        MAX(pu_belt) as max_pu_belt,
        MAX(pu_amp) as max_pu_amp

        FROM uts_player WHERE pid=?`;

        const result = await mysql.simpleQuery(query,[id]);

        if(result.length > 0){

            const r = result[0];

            return {
                "totals": {
                    "matches": r.total_matches,
                    "playtime": (r.gametime > 0) ? (r.gametime / (60 * 60)).toFixed(2) : 0,
                    "score": r.gamescore,
                    "ping": {
                        "low": r.lowping,
                        "average": r.avgping,
                        "max": r.highping
                    },
                    "frags": r.frags,
                    "deaths": r.deaths,
                    "kills": r.kills,
                    "suicides": r.suicides,
                    "teamKills": r.teamkills,
                    "accuracy": r.accuracy.toFixed(2),
                    "ttl": r.ttl.toFixed(2),
                    "ctf": {
                        "taken": r.flag_taken,
                        "dropped": r.flag_dropped,
                        "return": r.flag_return,
                        "capture": r.flag_capture,
                        "cover": r.flag_cover,
                        "seal": r.flag_seal,
                        "assist": r.flag_assist,
                        "kill": r.flag_kill,
                        "pickup": r.flag_pickedup
                    },
                    "dom": { "caps": r.dom_cp},
                    "assualt": {"caps": r.ass_obj},
                    "multis": {
                        "double": r.spree_double,
                        "multi": r.spree_multi,
                        "ultra": r.spree_ultra,
                        "monster": r.spree_monster
                    },
                    "sprees": {
                        "spree": r.spree_kill,
                        "rampage": r.spree_rampage,
                        "dominating": r.spree_dom,
                        "unstoppable": r.spree_uns,
                        "godlike": r.spree_god
                    },
                    "pickups": {
                        "pads": r.pu_pads,
                        "armour": r.pu_armour,
                        "keg": r.pu_keg,
                        "invisibility": r.pu_invis,
                        "belt": r.pu_belt,
                        "amp": r.pu_amp
                    }


                },"max": {
                    "playtime": (r.max_gametime > 0) ? (r.max_gametime / (60 * 60)).toFixed(2) : 0,
                    "score": r.max_gamescore,
                    "ping": {
                        "low": r.max_lowping,
                        "average": r.max_avgping,
                        "max": r.max_highping
                    },
                    "frags": r.max_frags,
                    "deaths": r.max_deaths,
                    "kills": r.max_kills,
                    "suicides": r.max_suicides,
                    "teamKills": r.max_teamkills,
                    "accuracy": r.max_accuracy.toFixed(2),
                    "ttl": r.max_ttl.toFixed(2),
                    "ctf": {
                        "taken": r.max_flag_taken,
                        "dropped": r.max_flag_dropped,
                        "return": r.max_flag_return,
                        "capture": r.max_flag_capture,
                        "cover": r.max_flag_cover,
                        "seal": r.max_flag_seal,
                        "assist": r.max_flag_assist,
                        "kill": r.max_flag_kill,
                        "pickup": r.max_flag_pickedup
                    },
                    "dom": { "caps": r.max_dom_cp},
                    "assualt": {"caps": r.max_ass_obj},
                    "multis": {
                        "double": r.max_spree_double,
                        "multi": r.max_spree_multi,
                        "ultra": r.max_spree_ultra,
                        "monster": r.max_spree_monster
                    },
                    "sprees": {
                        "spree": r.max_spree_kill,
                        "rampage": r.max_spree_rampage,
                        "dominating": r.max_spree_dom,
                        "unstoppable": r.max_spree_uns,
                        "godlike": r.max_spree_god
                    },
                    "pickups": {
                        "pads": r.max_pu_pads,
                        "armour": r.max_pu_armour,
                        "keg": r.max_pu_keg,
                        "invisibility": r.max_pu_invis,
                        "belt": r.max_pu_belt,
                        "amp": r.max_pu_amp
                    }
                }
            };

        }

        return null;
    }

    async getPlayerGametypes(id){

        const query = `SELECT gid,COUNT(*) as total_matches,SUM(gametime) as playtime,
        SUM(gamescore) as gamescore, SUM(frags) as frags, SUM(kills) as kills, SUM(deaths) as deaths,
        SUM(suicides) as suicides, SUM(teamkills) as teamKills, AVG(ttl) as ttl
        FROM uts_player WHERE pid=? GROUP BY(gid) ORDER BY total_matches DESC`;

        return await mysql.simpleQuery(query, [id]);

    }

    async getTotalFirstBloods(id){

        const query = "SELECT COUNT(*) as first_bloods FROM uts_match WHERE firstblood=?";

        const result = await mysql.simpleQuery(query, [id]);
        return result[0].first_bloods;    
    }

}


export default Players;