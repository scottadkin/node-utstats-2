const mysql = require("./database");

/**
 * Maybe this time I get it right...
 */
class PlayerMerger{

    constructor(oldId, newId){

        this.oldId = oldId;
        this.newId = newId;
    }

    async merge(oldId, newId){

        try{


            await this.mergeAssaultTables();
            await this.mergeCTFTables();


        }catch(err){
            console.trace(err);
        }
    }

    async mergeAssaultTables(){

        const query = `UPDATE nstats_assault_match_objectives SET player=? WHERE player=?`;

        return await mysql.simpleQuery(query, [this.newId, this.oldId]);
    }


    recalCTFBest(data){

        const totals = {};

        const mergeTypes = [
            "flag_assist",
            "flag_return",
            "flag_return_base",
            "flag_return_mid",
            "flag_return_enemy_base",
            "flag_return_save",
            "flag_dropped",
            "flag_kill",
            "flag_suicide",
            "flag_seal",
            "flag_seal_pass",
            "flag_seal_fail",
            "flag_cover",
            "flag_cover_pass",
            "flag_cover_fail",
            "flag_cover_multi",
            "flag_cover_spree",
            "flag_capture",
            "flag_carry_time",
            "flag_taken",
            "flag_pickup",
            "flag_self_cover",
            "flag_self_cover_pass",
            "flag_self_cover_fail",
            "flag_solo_capture"
        ];

        const higherBetter = [
            "best_single_seal",
            "best_single_cover",
            "best_single_self_cover"
        ];

        for(const [gametypeId, gametypeData] of Object.entries(data)){


            if(totals[gametypeId] === undefined){
                totals[gametypeId] = gametypeData;
                continue;
            }

            const t = totals[gametypeId];

            for(let i = 0; i < mergeTypes.length; i++){

                const m = mergeTypes[i];

                t[m] += gametypeData[m];

            }

            for(let i = 0; i < higherBetter.length; i++){

                const h = higherBetter[i];

                if(t[h] < gametypeData[h]) t[h] = gametypeData[h];
            }

            console.log(gametypeId);
            console.log(`FOUND DUPLICATE DATA`);
        }

        return totals;
    }

    async recalcCTFTotals(){

        const tables = [
            "player_ctf_best",
            "player_ctf_best_life",
            "player_ctf_totals"
        ];

        const data = {};

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const query = `SELECT * FROM nstats_${t} WHERE player_id=?`;
            data[t] = await mysql.simpleQuery(query, [this.newId]);
        }
        

        const best = this.recalCTFBest(data["player_ctf_best"]);

        console.log(best);
    }

    //This does not include nstats_player_match and totals table
    async mergeCTFTables(){

        //ctf_assists

        const oldId = this.oldId;
        const newId = this.newId;

        //tables where we just change the player_ids, 
        //after we have done this we recalculate the players new totals and delete the oldId totals
        //if there is totals that is
        const initialQueries = {
            "ctf_assists": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [newId, oldId]
            }, 
            "ctf_caps": {
                "query": "SET grab_player = IF(grab_player=?,?,grab_player), cap_player = IF(cap_player=?,?,cap_player)", 
                "vars": [oldId, newId, oldId, newId]
            }, 
            "ctf_carry_times": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, 
            "ctf_covers": {  
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, 
            "ctf_cr_kills": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, 
            "ctf_events": {
                "query": "SET player=? WHERE player=?", 
                "vars": [oldId, newId]
            }, 
            "ctf_flag_deaths": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, 
            "ctf_flag_drops": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, 
            "ctf_flag_pickups": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, 
            "ctf_returns": {
                "query": "SET grab_player = IF(grab_player=?,?,grab_player), return_player = IF(return_player=?,?,return_player)", 
                "vars": [oldId, newId, oldId, newId]
            }, 
            "ctf_seals": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, 
            "ctf_self_covers": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, 
            "player_ctf_best": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //(recalc totals, delete duplicate)
            "player_ctf_best_life": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //(recalc totals, delete duplicate)
            "player_ctf_match": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, 
            "player_ctf_totals": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, // (recalc totals, delete duplicate)
        };


        for(const [table, info] of Object.entries(initialQueries)){

            await mysql.simpleQuery(`UPDATE nstats_${table} ${info.query}`, info.vars);
        }
    
        await this.recalcCTFTotals();
        
    }
}

module.exports = PlayerMerger;