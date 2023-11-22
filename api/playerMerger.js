const mysql = require("./database");
const Message = require("./message");

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

        //only need one array, just ignore this missing ones in best life table as all others are in both
        const types = [
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
            "flag_solo_capture",
            "best_single_seal",
            "best_single_cover",
            "best_single_self_cover"
        ];

        const totals = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];
            const gametypeId = d.gametype_id;

            if(totals[gametypeId] === undefined){
                totals[gametypeId] = d;
                continue;
            }

            const t = totals[gametypeId];

            for(let x = 0; x < types.length; x++){

                const h = types[x];

                if(d[h] === undefined) continue;

                if(t[h] < d[h]) t[h] = d[h];
            }
        }
        
        return totals;
    }

    recalCTFPlayerTotals(data){

        const mergeTypes = [
            "total_matches",
            "playtime",
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
            "best_single_self_cover",
        ];

        const totals = {};
        
        for(let i = 0; i < data.length; i++){

            const d = data[i];
            const gametypeId = d.gametype_id;

            if(totals[gametypeId] === undefined){
                totals[gametypeId] = d;
                continue;
            }

            const t = totals[gametypeId];

            for(let x = 0; x < mergeTypes.length; x++){

                const m = mergeTypes[x];
                t[m] += d[m];
            }

            for(let x = 0; x < higherBetter.length; x++){

                const h = higherBetter[x];

                if(t[h] < d[h]) t[h] = d[h];
            }
        }

        return totals;  
    }

    async deleteOldCTFData(){

        const tables = [
            "player_ctf_best",
            "player_ctf_best_life",
            "player_ctf_totals"
        ];

        
        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            new Message(`Delete old data from table ${t}.`,"note");

            await mysql.simpleQuery(`DELETE FROM nstats_${t} WHERE player_id=?`, [this.newId]);
            new Message(`Deleted old data from table ${t}.`,"pass");
        }
    }

    async insertNewCTFData(totals, best, bestLife){


        const totalsQuery = `INSERT INTO nstats_player_ctf_totals (
            player_id, gametype_id, total_matches, playtime, flag_assist,
            flag_return, flag_return_base, flag_return_mid, flag_return_enemy_base, flag_return_save,
            flag_dropped, flag_kill, flag_suicide, flag_seal, flag_seal_pass, 
            flag_seal_fail, best_single_seal, flag_cover, flag_cover_pass, flag_cover_fail,
            flag_cover_multi, flag_cover_spree, best_single_cover, flag_capture, flag_carry_time,
            flag_taken, flag_pickup, flag_self_cover, flag_self_cover_pass, flag_self_cover_fail,
            best_single_self_cover, flag_solo_capture) VALUES ?`;

        const totalInsertVars = [];

        for(const t of Object.values(totals)){

            totalInsertVars.push([
                t.player_id, t.gametype_id, t.total_matches, t.playtime, t.flag_assist,
                t.flag_return, t.flag_return_base, t.flag_return_mid, t.flag_return_enemy_base, t.flag_return_save,
                t.flag_dropped, t.flag_kill, t.flag_suicide, t.flag_seal, t.flag_seal_pass, 
                t.flag_seal_fail, t.best_single_seal, t.flag_cover, t.flag_cover_pass, t.flag_cover_fail,
                t.flag_cover_multi, t.flag_cover_spree, t.best_single_cover, t.flag_capture, t.flag_carry_time,
                t.flag_taken, t.flag_pickup, t.flag_self_cover, t.flag_self_cover_pass, t.flag_self_cover_fail,
                t.best_single_self_cover, t.flag_solo_capture
            ]);
        }

        new Message(`Start inserting new player ctf totals(${totalInsertVars.length} rows).`,"note");
        await mysql.bulkInsert(totalsQuery, totalInsertVars);
        new Message(`Finished inserting new player ctf totals.`,"pass");

        const bestQuery = `INSERT INTO nstats_player_ctf_best (
            player_id, gametype_id, flag_assist, flag_return, flag_return_base,
            flag_return_mid, flag_return_enemy_base, flag_return_save, flag_dropped, flag_kill,
            flag_suicide, flag_seal, flag_seal_pass, flag_seal_fail, best_single_seal,
            flag_cover, flag_cover_pass, flag_cover_fail, flag_cover_multi, flag_cover_spree,
            best_single_cover, flag_capture, flag_carry_time, flag_taken, flag_pickup,
            flag_self_cover, flag_self_cover_pass, flag_self_cover_fail, best_single_self_cover, flag_solo_capture
        ) VALUES ?`;


        const bestInsertVars = [];

        for(const b of Object.values(best)){

            bestInsertVars.push([
                b.player_id, b.gametype_id, b.flag_assist, b.flag_return, b.flag_return_base,
                b.flag_return_mid, b.flag_return_enemy_base, b.flag_return_save, b.flag_dropped, b.flag_kill,
                b.flag_suicide, b.flag_seal, b.flag_seal_pass, b.flag_seal_fail, b.best_single_seal,
                b.flag_cover, b.flag_cover_pass, b.flag_cover_fail, b.flag_cover_multi, b.flag_cover_spree,
                b.best_single_cover, b.flag_capture, b.flag_carry_time, b.flag_taken, b.flag_pickup,
                b.flag_self_cover, b.flag_self_cover_pass, b.flag_self_cover_fail, b.best_single_self_cover, b.flag_solo_capture
            ]);
        }

        new Message(`Start inserting new player ctf best values(${bestInsertVars.length} rows).`,"note");
        await mysql.bulkInsert(bestQuery, bestInsertVars);
        new Message(`Finished inserting new player ctf best values.`,"pass");


        const bestLifeQuery = `INSERT INTO nstats_player_ctf_best_life (
            player_id, gametype_id, flag_assist, flag_return, flag_return_base,
            flag_return_mid, flag_return_enemy_base, flag_return_save, flag_dropped, flag_kill,
            flag_seal, flag_seal_pass, flag_seal_fail, best_single_seal,
            flag_cover, flag_cover_pass, flag_cover_fail, flag_cover_multi, flag_cover_spree,
            best_single_cover, flag_capture, flag_carry_time, flag_taken, flag_pickup,
            flag_self_cover, flag_self_cover_pass, flag_self_cover_fail, best_single_self_cover, flag_solo_capture
        ) VALUES ?`;


        const bestLifeInsertVars = [];

        for(const b of Object.values(bestLife)){

            bestLifeInsertVars.push([
                b.player_id, b.gametype_id, b.flag_assist, b.flag_return, b.flag_return_base,
                b.flag_return_mid, b.flag_return_enemy_base, b.flag_return_save, b.flag_dropped, b.flag_kill,
                b.flag_seal, b.flag_seal_pass, b.flag_seal_fail, b.best_single_seal,
                b.flag_cover, b.flag_cover_pass, b.flag_cover_fail, b.flag_cover_multi, b.flag_cover_spree,
                b.best_single_cover, b.flag_capture, b.flag_carry_time, b.flag_taken, b.flag_pickup,
                b.flag_self_cover, b.flag_self_cover_pass, b.flag_self_cover_fail, b.best_single_self_cover, b.flag_solo_capture
            ]);
        }

        new Message(`Start inserting new player ctf best life values(${bestLifeInsertVars.length} rows).`,"note");
        await mysql.bulkInsert(bestLifeQuery, bestLifeInsertVars);
        new Message(`Finished inserting new player ctf best life values.`,"pass");


    }

    async recalCTFTotals(){

        

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
        const bestLife = this.recalCTFBest(data["player_ctf_best_life"]);
        const totals = this.recalCTFPlayerTotals(data["player_ctf_totals"]);

        await this.deleteOldCTFData();

        await this.insertNewCTFData(totals, best, bestLife);

        //console.log(best);
        //console.log(bestLife);
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
                "vars": [newId, oldId]
            }, 
            "ctf_covers": {  
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, 
            "ctf_cr_kills": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [newId, oldId]
            }, 
            "ctf_events": {
                "query": "SET player=? WHERE player=?", 
                "vars": [newId, oldId]
            }, 
            "ctf_flag_deaths": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, 
            "ctf_flag_drops": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [newId, oldId]
            }, 
            "ctf_flag_pickups": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [newId, oldId]
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
                "vars": [newId, oldId]
            }, //(recalc totals, delete duplicate)
            "player_ctf_best_life": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [newId, oldId]
            }, //(recalc totals, delete duplicate)
            "player_ctf_match": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [newId, oldId]
            }, 
            "player_ctf_totals": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [newId, oldId]
            }, // (recalc totals, delete duplicate)
        };


        for(const [table, info] of Object.entries(initialQueries)){

            await mysql.simpleQuery(`UPDATE nstats_${table} ${info.query}`, info.vars);
        }
    
        await this.recalCTFTotals();
        
    }
}

module.exports = PlayerMerger;