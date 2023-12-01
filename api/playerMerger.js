const mysql = require("./database");
const Message = require("./message");
const Players = require("./players");
const Rankings = require("./rankings");
const WinRate = require("./winrate");

/**
 * Maybe this time I get it right...
 */
class PlayerMerger{

    constructor(oldId, newId){

        this.oldId = oldId;
        this.newId = newId;
    }

    async merge(){

        try{

            await this.mergeAssaultTables();
            await this.mergeCTFTables();
            await this.mergeDomTables();
            await this.mergeHeadshots();
            await this.mergeItems();
            await this.mergeKills();
            await this.mergeCombogib();
            await this.mergeMiscPlayerMatch();
            await this.mergeMonsterTables();
            await this.mergePlayerMaps();
            await this.mergePlayerMatchData();
            await this.mergePlayerTotalsData();
            await this.mergeWeapons();
            await this.mergePowerups();
            await this.mergeRankings();


            await this.mergeTeleFrags();
            await this.mergeSprees();

            await this.mergeWinRates();

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


    async fixDuplicatePlayerCTFData(){

        const query = `SELECT * FROM nstats_player_ctf_match WHERE player_id=?`;

        const result = await mysql.simpleQuery(query, this.newId);

        const mergeTypes = [
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
            "flag_solo_capture",
        ];

        const higherBetter = [
            "flag_assist_best",
            "flag_return_best",
            "flag_return_base_best",
            "flag_return_mid_best",
            "flag_return_enemy_base_best",
            "flag_return_save_best",
            "flag_dropped_best",
            "flag_kill_best",
            "flag_seal_best",
            "flag_seal_pass_best",
            "flag_seal_fail_best",
            "best_single_seal",
            "flag_cover_best",
            "flag_cover_pass_best",
            "flag_cover_fail_best",
            "flag_cover_multi_best",
            "flag_cover_spree_best",
            "best_single_cover",
            "flag_capture_best",
            "flag_carry_time_best",
            "flag_taken_best",
            "flag_pickup_best",
            "flag_self_cover_best",
            "flag_self_cover_pass_best",
            "flag_self_cover_fail_best",
            "best_single_self_cover",
            "flag_solo_capture_best"
        ];


        const totals = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(totals[r.match_id] === undefined){
                totals[r.match_id] = r;
                totals[r.match_id].dataPoints = 1;
                continue;
            }

            const t = totals[r.match_id];

            t.dataPoints++;

            for(let x = 0; x < mergeTypes.length; x++){

                const m = mergeTypes[x];

                t[m] += r[m];
            }

            for(let x = 0; x < higherBetter.length; x++){

                const h = higherBetter[x];

                if(r[h] > t[h]) t[h] = r[h];
            }
        }

        const deleteQuery = `DELETE FROM nstats_player_ctf_match WHERE player_id=?`;
        await mysql.simpleQuery(deleteQuery, [this.newId]);

        const insertQuery = `INSERT INTO nstats_player_ctf_match (
            player_id,
            match_id,
            gametype_id,
            server_id,
            map_id,
            match_date,
            playtime,
            flag_assist,
            flag_assist_best,
            flag_return,
            flag_return_best,
            flag_return_base,
            flag_return_base_best,
            flag_return_mid,
            flag_return_mid_best,
            flag_return_enemy_base,
            flag_return_enemy_base_best,
            flag_return_save,
            flag_return_save_best,
            flag_dropped,
            flag_dropped_best,
            flag_kill,
            flag_kill_best,
            flag_suicide,
            flag_seal,
            flag_seal_best,
            flag_seal_pass,
            flag_seal_pass_best,
            flag_seal_fail,
            flag_seal_fail_best,
            best_single_seal,
            flag_cover,
            flag_cover_best,
            flag_cover_pass,
            flag_cover_pass_best,
            flag_cover_fail,
            flag_cover_fail_best,
            flag_cover_multi,
            flag_cover_multi_best,
            flag_cover_spree,
            flag_cover_spree_best,
            best_single_cover,
            flag_capture,
            flag_capture_best,
            flag_carry_time,
            flag_carry_time_best,
            flag_taken,
            flag_taken_best,
            flag_pickup,
            flag_pickup_best,
            flag_self_cover,
            flag_self_cover_best,
            flag_self_cover_pass,
            flag_self_cover_pass_best,
            flag_self_cover_fail,
            flag_self_cover_fail_best,
            best_single_self_cover,
            flag_solo_capture,
            flag_solo_capture_best
        ) VALUES ?`;

        const insertVars = [];


        const rows = Object.values(totals);

        for(let i = 0; i < rows.length; i++){

            const r = rows[i];

            insertVars.push([
                r.player_id,
                r.match_id,
                r.gametype_id,
                r.server_id,
                r.map_id,
                r.match_date,
                r.playtime,
                r.flag_assist,
                r.flag_assist_best,
                r.flag_return,
                r.flag_return_best,
                r.flag_return_base,
                r.flag_return_base_best,
                r.flag_return_mid,
                r.flag_return_mid_best,
                r.flag_return_enemy_base,
                r.flag_return_enemy_base_best,
                r.flag_return_save,
                r.flag_return_save_best,
                r.flag_dropped,
                r.flag_dropped_best,
                r.flag_kill,
                r.flag_kill_best,
                r.flag_suicide,
                r.flag_seal,
                r.flag_seal_best,
                r.flag_seal_pass,
                r.flag_seal_pass_best,
                r.flag_seal_fail,
                r.flag_seal_fail_best,
                r.best_single_seal,
                r.flag_cover,
                r.flag_cover_best,
                r.flag_cover_pass,
                r.flag_cover_pass_best,
                r.flag_cover_fail,
                r.flag_cover_fail_best,
                r.flag_cover_multi,
                r.flag_cover_multi_best,
                r.flag_cover_spree,
                r.flag_cover_spree_best,
                r.best_single_cover,
                r.flag_capture,
                r.flag_capture_best,
                r.flag_carry_time,
                r.flag_carry_time_best,
                r.flag_taken,
                r.flag_taken_best,
                r.flag_pickup,
                r.flag_pickup_best,
                r.flag_self_cover,
                r.flag_self_cover_best,
                r.flag_self_cover_pass,
                r.flag_self_cover_pass_best,
                r.flag_self_cover_fail,
                r.flag_self_cover_fail_best,
                r.best_single_self_cover,
                r.flag_solo_capture,
                r.flag_solo_capture_best
            ])
        }

        await mysql.bulkInsert(insertQuery, insertVars);

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
    
        await this.fixDuplicatePlayerCTFData();
        await this.recalCTFTotals();
    }


    //doesn't change the main players table like the ctf stuff
    async mergeDomTables(){

        new Message(`Merge dom tables.`,"note");
        const tables = ["dom_match_caps", "dom_match_player_score"];

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            await mysql.simpleQuery(`UPDATE nstats_${t} SET player=? WHERE player=?`, [this.newId, this.oldId]);
        }

        new Message(`Merge dom tables.`,"pass");
    }

    async mergeHeadshots(){

        new Message(`Merge headshots table`, "note");
        const query = `UPDATE nstats_headshots SET killer = IF(killer=?,?,killer), victim = IF(victim=?,?,victim)`;

        await mysql.simpleQuery(query, [this.oldId, this.newId, this.oldId, this.newId]);
        new Message(`Merge headshots table`, "pass");
    }

    async mergeItems(){

        new Message(`Merge Item tables`,"note");

        const matchQuery = `UPDATE nstats_items_match SET player_id=? WHERE player_id=?`;
        await mysql.simpleQuery(matchQuery, [this.newId, this.oldId]);

        const totalsQuery = `UPDATE nstats_items_player SET player=? WHERE player=?`;
        await mysql.simpleQuery(totalsQuery, [this.newId, this.oldId]);

        const duplicateQuery = `SELECT item,MIN(first) as first, MAX(last) as last, SUM(uses) as uses, SUM(matches) as matches 
        FROM nstats_items_player WHERE player=? GROUP BY item`;
        const duplicateResult = await mysql.simpleQuery(duplicateQuery, [this.newId]);

        const deleteOldQuery = `DELETE FROM nstats_items_player WHERE player=?`;
        await mysql.simpleQuery(deleteOldQuery, [this.newId]);


        const insertQuery = `INSERT INTO nstats_items_player (player,item,first,last,uses,matches) VALUES ?`;

        const insertVars = [];

        for(let i = 0; i < duplicateResult.length; i++){

            const d = duplicateResult[i];
            insertVars.push([
                this.newId, d.item, d.first, d.last, d.uses, d.matches
            ]);
        }

        await mysql.bulkInsert(insertQuery, insertVars);
        new Message(`Merge Item tables`,"pass");
    }

    async mergeKills(){

        new Message(`Merge kill tables`, "note");

        const query = `UPDATE nstats_kills SET killer = IF(killer = ?, ?, killer), victim = if(victim = ?, ?, victim)`;

        await mysql.simpleQuery(query, [this.oldId, this.newId, this.oldId, this.newId]);

        new Message(`Merge kill tables`, "pass");
    }


    async fixDuplicateCombogibData(){

        const getQuery = `SELECT * FROM nstats_player_combogib WHERE player_id=?`;

        const result = await mysql.simpleQuery(getQuery, [this.newId]);

        const mergeTypes = [
            "total_matches",
            "playtime",
            "combo_kills",
            "combo_deaths",
            "insane_kills",
            "insane_deaths",
            "shockball_kills",
            "shockball_deaths",
            "primary_kills",
            "primary_deaths",
        ];

        const higherBetter = [
            "best_single_combo",
            "best_single_insane",
            "best_single_shockball",
            "max_combo_kills",
            "max_insane_kills",
            "max_shockball_kills",
            "max_primary_kills",
            "best_combo_spree",
            "best_insane_spree",
            "best_shockball_spree",
            "best_primary_spree",
        ];

        const killTypes = [
            "combo", "insane", "shockball", "primary"
        ];

        const totals = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            const gametypeId = r.gametype_id;
            const mapId = r.map_id;

            if(totals[gametypeId] === undefined) totals[gametypeId] = {};

            if(totals[gametypeId][mapId] === undefined){
                totals[gametypeId][mapId] = r;
                continue
            }

            const t = totals[gametypeId][mapId];

            for(let x = 0; x < mergeTypes.length; x++){

                const m = mergeTypes[x];

                t[m] += r[m];
            }

            for(let x = 0; x < killTypes.length; x++){

                const k = killTypes[x];

                if(t[`${k}_kills`] > 0){

                    if(t[`${k}_deaths`] > 0){
                        t[`${k}_efficiency`] = (t[`${k}_kills`] / (t[`${k}_kills`] + t[`${k}_deaths`])) * 100;
                    }else{
                        t[`${k}_efficiency`]= 100;
                    }

                    if(t.playtime > 0){
                        t[`${k}_kpm`] = t[`${k}_kills`] / (t.playtime / 60);
                    }else{
                        t[`${k}_kpm`] = 0;
                    }

                }else{
                    t[`${k}_efficiency`] = 0;
                    t[`${k}_kpm`] = 0;
                }
            }


            for(let x = 0; x < higherBetter.length; x++){

                const h = higherBetter[x];

                if(t[h] < r[h]){
                    t[h] = r[h];
                    t[`${h}_match_id`] = r[`${h}_match_id`];
                }
            }
        }

        const deleteQuery = `DELETE FROM nstats_player_combogib WHERE player_id=?`;
        await mysql.simpleQuery(deleteQuery, [this.newId]);


        const insertVars = [];

        for(const gametypeData of Object.values(totals)){

            for(const mapData of Object.values(gametypeData)){
        
                const m = mapData;

                insertVars.push([
                    m.player_id,m. gametype_id, m.map_id, m.total_matches, m.playtime,
                    m.combo_kills, m.combo_deaths, m.combo_efficiency, m.combo_kpm, 
                    m.insane_kills, m.insane_deaths, m.insane_efficiency, m.insane_kpm,
                    m.shockball_kills, m.shockball_deaths, m.shockball_efficiency, m.shockball_kpm,
                    m.primary_kills, m.primary_deaths, m.primary_efficiency, m.primary_kpm,
                    m.best_single_combo, m.best_single_combo_match_id, m.best_single_insane,
                    m.best_single_insane_match_id, m.best_single_shockball, m.best_single_shockball_match_id,
                    m.max_combo_kills, m.max_combo_kills_match_id, m.max_insane_kills, m.max_insane_kills_match_id,
                    m.max_shockball_kills, m.max_shockball_kills_match_id, m.max_primary_kills, m.max_primary_kills_match_id,
                    m.best_combo_spree, m.best_combo_spree_match_id, m.best_insane_spree, m.best_insane_spree_match_id,
                    m.best_shockball_spree, m.best_shockball_spree_match_id, m.best_primary_spree, m.best_primary_spree_match_id
                ]);
            }
        }

        const insertQuery = `INSERT INTO nstats_player_combogib (
            player_id, gametype_id, map_id, total_matches, playtime,
            combo_kills, combo_deaths, combo_efficiency, combo_kpm, 
            insane_kills, insane_deaths, insane_efficiency, insane_kpm,
            shockball_kills, shockball_deaths, shockball_efficiency, shockball_kpm,
            primary_kills, primary_deaths, primary_efficiency, primary_kpm,
            best_single_combo, best_single_combo_match_id, best_single_insane,
            best_single_insane_match_id, best_single_shockball, best_single_shockball_match_id,
            max_combo_kills, max_combo_kills_match_id, max_insane_kills, max_insane_kills_match_id,
            max_shockball_kills, max_shockball_kills_match_id, max_primary_kills, max_primary_kills_match_id,
            best_combo_spree, best_combo_spree_match_id, best_insane_spree, best_insane_spree_match_id,
            best_shockball_spree, best_shockball_spree_match_id, best_primary_spree, best_primary_spree_match_id
        ) VALUES ?`;

        await mysql.bulkInsert(insertQuery, insertVars);
    }

    async mergeCombogib(){

        new Message(`Merge Combogib Tables`,"note");

        const mapQuery = `UPDATE nstats_map_combogib SET 
        best_single_combo_player_id = IF(best_single_combo_player_id=?,?,best_single_combo_player_id),
        best_single_shockball_player_id = IF(best_single_shockball_player_id=?,?,best_single_shockball_player_id),
        best_single_insane_player_id = IF(best_single_insane_player_id=?,?,best_single_insane_player_id),
        best_primary_spree_player_id = IF(best_primary_spree_player_id=?,?,best_primary_spree_player_id),
        best_shockball_spree_player_id = IF(best_shockball_spree_player_id=?,?,best_shockball_spree_player_id),
        best_combo_spree_player_id = IF(best_combo_spree_player_id=?,?,best_combo_spree_player_id),
        best_insane_spree_player_id = IF(best_insane_spree_player_id=?,?,best_insane_spree_player_id),
        max_combo_kills_player_id = IF(max_combo_kills_player_id=?,?,max_combo_kills_player_id),
        max_insane_kills_player_id = IF(max_insane_kills_player_id=?,?,max_insane_kills_player_id),
        max_shockball_kills_player_id = IF(max_shockball_kills_player_id=?,?,max_shockball_kills_player_id),
        max_primary_kills_player_id = IF(max_primary_kills_player_id=?,?,max_primary_kills_player_id)`;

        const mapVars = [
            this.oldId, this.newId,
            this.oldId, this.newId,
            this.oldId, this.newId,
            this.oldId, this.newId,
            this.oldId, this.newId,
            this.oldId, this.newId,
            this.oldId, this.newId,
            this.oldId, this.newId,
            this.oldId, this.newId,
            this.oldId, this.newId,
            this.oldId, this.newId,
        ];

        await mysql.simpleQuery(mapQuery, mapVars);


        const matchQuery = `UPDATE nstats_match_combogib SET player_id=? WHERE player_id=?`;
        await mysql.simpleQuery(matchQuery, [this.newId, this.oldId]);


        const playerUpdateQuery = `UPDATE nstats_player_combogib SET player_id=? WHERE player_id=?`;
        await mysql.simpleQuery(playerUpdateQuery, [this.newId, this.oldId]);

        await this.fixDuplicateCombogibData();

        new Message(`Merge Combogib Tables`,"pass");
    }

    async mergeMiscPlayerMatch(){

        new Message(`Merge misc player match tables`,"note");
        const tables = [
            "match_connections",
            "match_pings",
            "match_player_score",
            "match_team_changes",    
        ];

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const query = `UPDATE nstats_${t} SET player=? WHERE player=?`;

            await mysql.simpleQuery(query, [this.newId, this.oldId]);
        }

        new Message(`Merge misc player match tables`,"pass");
    }


    async fixMonsterDuplicateData(){

        const getQuery = `SELECT monster,SUM(matches) as matches,SUM(kills) as kills, SUM(deaths) as deaths FROM nstats_monsters_player_totals WHERE player=? GROUP BY monster`;
        const result = await mysql.simpleQuery(getQuery, [this.newId]);

        const deleteQuery = `DELETE FROM nstats_monsters_player_totals WHERE player=?`;
        await mysql.simpleQuery(deleteQuery, [this.newId]);

        const insertVars = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            insertVars.push([
                this.newId,
                r.monster,
                r.matches, 
                r.kills,
                r.deaths
            ]);
        }

        const insertQuery = `INSERT INTO nstats_monsters_player_totals (
            player,
            monster,
            matches, 
            kills,
            deaths
        ) VALUES ?`;

        await mysql.bulkInsert(insertQuery, insertVars);
    }

    async mergeMonsterTables(){

        new Message(`Merge monster tables`,"note");

        const tables = [
            "monster_kills",
            "monsters_player_match",
            "monsters_player_totals"
        ];

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const query = `UPDATE nstats_${t} SET player=? WHERE player=?`;
            await mysql.simpleQuery(query, [this.newId, this.oldId]);
        }

        await this.fixMonsterDuplicateData();

        new Message(`Merge monster tables`,"pass");
    }


    async mergePlayerMaps(){

        new Message(`Merge player maps table`, "note");

        const updateQuery = `UPDATE nstats_player_maps SET player=? WHERE player=?`;
        await mysql.simpleQuery(updateQuery, [this.newId, this.oldId]);

        const getQuery = `SELECT map,first,first_id,last,last_id,matches,playtime,longest,longest_id FROM nstats_player_maps WHERE player=?`;
        const result = await mysql.simpleQuery(getQuery, [this.newId]);

        const totals = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(totals[r.map] === undefined){
                totals[r.map] = r;
                continue;
            }

            const t = totals[r.map];

            if(t.first > r.first){
                t.first = r.first;
                t.first_id = r.first_id;
            }

            if(t.last < r.last){
                t.last = r.last;
                t.last_id = r.last_id;
            }

            if(t.longest < r.longest){
                t.longest = r.longest;
                t.longest_id = r.longest_id;
            }

            t.matches += r.matches;
            t.playtime += r.playtime;
        }

        const deleteQuery = `DELETE FROM nstats_player_maps WHERE player=?`;
        await mysql.simpleQuery(deleteQuery, [this.newId]);

        const insertVars = [];

        for(const m of Object.values(totals)){

            insertVars.push([
                m.map,
                this.newId,
                m.first,
                m.first_id,
                m.last,
                m.last_id,
                m.matches,
                m.playtime,
                m.longest,
                m.longest_id,
            ]);
        }

        const insertQuery = `INSERT INTO nstats_player_maps (
            map,player,first,first_id,last,last_id,matches,playtime,
            longest, longest_id
        ) VALUES ?`;

        await mysql.bulkInsert(insertQuery, insertVars);

        new Message(`Merge player maps table`, "pass");
    }


    async fixDuplicatePlayerMatchData(){

        const getQuery = `SELECT * FROM nstats_player_matches WHERE player_id=?`;

        const data = await mysql.simpleQuery(getQuery, [this.newId]);

        const mergeTypes = [
            "playtime",              "team_0_playtime",
            "team_1_playtime",       "team_2_playtime",       "team_3_playtime",
            "spec_playtime",         "first_blood",
            "frags",                 "score",                 "kills",
            "deaths",                "suicides",              "team_kills",
            "spawn_kills",                                     "multi_1",
            "multi_2",               "multi_3",               "multi_4",
            "multi_5",               "multi_6",               "multi_7",
                                    "spree_1",               "spree_2",
            "spree_3",               "spree_4",               "spree_5",
            "spree_6",               "spree_7",               
             "assault_objectives",    "dom_caps",
            "k_distance_normal",
            "k_distance_long",       "k_distance_uber",       "headshots",
            "shield_belt",           "amp",                   "amp_time",
            "invisibility",          "invisibility_time",     "pads",
            "armor",                 "boots",                 "super_health",
            "mh_kills",                "views",
            "mh_deaths",             "telefrag_kills",        "telefrag_deaths",
            "tele_disc_kills",
            "tele_disc_deaths",
        ];

        const higherBetter = [
                 
            "multi_best", "spree_best",
            "best_spawn_kill_spree", 
            "dom_caps_best_life",    
            "ping_max",               
            "longest_kill_distance", "mh_kills_best_life",   
            "telefrag_best_spree",   "telefrag_best_multi",  
            "tele_disc_best_spree",  "tele_disc_best_multi"
        ];

        const lowerBetter = [
            "ping_min",
            "shortest_kill_distance"
        ];


        const avg = [
            "ping_average",
            "accuracy",
            "average_kill_distance"
        ];


        const totals = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(totals[d.match_id] === undefined){

                totals[d.match_id] = d;
                totals[d.match_id].dataPoints = 1;

                for(let x = 0; x < avg.length; x++){

                    totals[d.match_id][`total_${avg[x]}`] = d[avg[x]];
                }

                continue;
            }

            const t = totals[d.match_id];
            t.dataPoints++;

            for(let x = 0; x < mergeTypes.length; x++){

                const m = mergeTypes[x];

                t[m] += d[m];
            }

            for(let x = 0; x < higherBetter.length; x++){

                const h = higherBetter[x];

                if(t[h] < d[h]) t[h] = d[h];
            }

            for(let x = 0; x < lowerBetter.length; x++){

                const l = lowerBetter[x];

                if(t[l] > d[l]) t[l] = d[l];
            }

            for(let x = 0; x < avg.length; x++){

                const a = avg[x];
                t[`total_${a}`] += d[a];

                if(t[`total_${a}`] > 0){
                    t[a] = t[`total_${a}`] / t.dataPoints;
                }else{
                    t[a] = 0;
                }
            }

            if(t.playtime > 0){
                t.played = 1;
                t.spectator = 0;
            }else{
                t.spectator = 1;
                t.played = 0;
            }

            if(t.winner || d.winner){
                t.winner = 1;
                t.draw = 0;
            }

            if(t.kills > 0){

                if(t.deaths > 0){
                    t.efficiency = t.kills / (t.kills + t.deaths) * 100;
                }else{
                    t.efficiency = 100;
                }

            }else{
                t.efficiency = 0;
            }
        }
 
        const deleteQuery = `DELETE FROM nstats_player_matches WHERE player_id=?`;
        await mysql.simpleQuery(deleteQuery, [this.newId]);

        const rows = Object.values(totals);
     
        const insertVars = [];

        const insertQuery = `INSERT INTO nstats_player_matches (
            match_id,              match_date,
            map_id,                player_id,             hwid,
            bot,                   spectator,             played,
            ip,                    country,               face,
            voice,                 gametype,              winner,
            draw,                  playtime,              team_0_playtime,
            team_1_playtime,       team_2_playtime,       team_3_playtime,
            spec_playtime,         team,                  first_blood,
            frags,                 score,                 kills,
            deaths,                suicides,              team_kills,
            spawn_kills,           efficiency,            multi_1,
            multi_2,               multi_3,               multi_4,
            multi_5,               multi_6,               multi_7,
            multi_best,            spree_1,               spree_2,
            spree_3,               spree_4,               spree_5,
            spree_6,               spree_7,               spree_best,
            best_spawn_kill_spree, assault_objectives,    dom_caps,
            dom_caps_best_life,    ping_min,              ping_average,
            ping_max,              accuracy,              shortest_kill_distance,
            average_kill_distance, longest_kill_distance, k_distance_normal,
            k_distance_long,       k_distance_uber,       headshots,
            shield_belt,           amp,                   amp_time,
            invisibility,          invisibility_time,     pads,
            armor,                 boots,                 super_health,
            mh_kills,              mh_kills_best_life,    views,
            mh_deaths,             telefrag_kills,        telefrag_deaths,
            telefrag_best_spree,   telefrag_best_multi,   tele_disc_kills,
            tele_disc_deaths,      tele_disc_best_spree,  tele_disc_best_multi
        ) VALUES ?`;

        for(let i = 0; i < rows.length; i++){

            const r = rows[i];

            insertVars.push([
                r.match_id,              r.match_date,
                r.map_id,                r.player_id,             r.hwid,
                r.bot,                   r.spectator,             r.played,
                r.ip,                    r.country,               r.face,
                r.voice,                 r.gametype,              r.winner,
                r.draw,                  r.playtime,              r.team_0_playtime,
                r.team_1_playtime,       r.team_2_playtime,       r.team_3_playtime,
                r.spec_playtime,         r.team,                  r.first_blood,
                r.frags,                 r.score,                 r.kills,
                r.deaths,                r.suicides,              r.team_kills,
                r.spawn_kills,           r.efficiency,            r.multi_1,
                r.multi_2,               r.multi_3,               r.multi_4,
                r.multi_5,               r.multi_6,               r.multi_7,
                r.multi_best,            r.spree_1,               r.spree_2,
                r.spree_3,               r.spree_4,               r.spree_5,
                r.spree_6,               r.spree_7,               r.spree_best,
                r.best_spawn_kill_spree, r.assault_objectives,    r.dom_caps,
                r.dom_caps_best_life,    r.ping_min,              r.ping_average,
                r.ping_max,              r.accuracy,              r.shortest_kill_distance,
                r.average_kill_distance, r.longest_kill_distance, r.k_distance_normal,
                r.k_distance_long,       r.k_distance_uber,       r.headshots,
                r.shield_belt,           r.amp,                   r.amp_time,
                r.invisibility,          r.invisibility_time,     r.pads,
                r.armor,                 r.boots,                 r.super_health,
                r.mh_kills,              r.mh_kills_best_life,    r.views,
                r.mh_deaths,             r.telefrag_kills,        r.telefrag_deaths,
                r.telefrag_best_spree,   r.telefrag_best_multi,   r.tele_disc_kills,
                r.tele_disc_deaths,      r.tele_disc_best_spree,  r.tele_disc_best_multi
            ]);
        }

        await mysql.bulkInsert(insertQuery, insertVars);

    }

    async mergePlayerMatchData(){

        new Message(`Merge player match data`,"note");
        const query = `UPDATE nstats_player_matches SET player_id=? WHERE player_id=?`;

        await mysql.simpleQuery(query, [this.newId, this.oldId]);

        await this.fixDuplicatePlayerMatchData();

        new Message(`Merge player match data`,"pass");
    }

    async mergeTeleFrags(){

        new Message("Merge telefrags table", "note");
        const query = `UPDATE nstats_tele_frags SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)`;

        await mysql.simpleQuery(query, [this.oldId, this.newId, this.oldId, this.newId]);
        new Message("Merge telefrags table", "pass");
    }

    async mergeSprees(){

        new Message("Merge sprees table", "note");
        const query = `UPDATE nstats_sprees SET player = IF(player=?,?,player), killer = IF(killer=?,?,killer)`;
        await mysql.simpleQuery(query, [this.oldId, this.newId, this.oldId, this.newId]);
        new Message("Merge sprees table", "pass");
    }


    updatePlayerTotal(totals, gametypeId, mapId, data){

        const t = totals;
        const d = data;

        if(t[gametypeId] === undefined) t[gametypeId] = {};

        if(t[gametypeId][mapId] === undefined){
            t[gametypeId][mapId] = d;

            const c = t[gametypeId][mapId];
            c.first = d.match_date;
            c.last = d.match_date;
            c.matches = 1;
            c.wins = (d.winner) ? 1 : 0;
            c.draws = (d.draw) ? 1 : 0;
            c.losses = (!d.winner && !d.draw) ? 1 : 0;
            c.winrate = (d.winner) ? 100 : 0 ;
            c.multi_best = 0;
            c.spree_best = 0;
            c.ping_min_total = d.ping_min;
            c.ping_average_total = d.ping_average;
            c.ping_max_total = d.ping_max;
            c.accuracy_total = d.accuracy;
            c.efficiency = d.efficiency;
            c.first_bloods = d.first_blood;
            c.dom_caps_best = d.dom_caps;
            c.mh_kills_best = d.mh_kills;
            c.mh_deaths_worst = d.mh_deaths;
            c.fastest_kill = -1;
            c.slowest_kill = -1;
            return;
        }


        const c = t[gametypeId][mapId];

        const mergeTypes = [
           
            "playtime",
            "team_0_playtime",    "team_1_playtime",    "team_2_playtime",
            "team_3_playtime",    "spec_playtime",      //"first_bloods",
            "frags",              "score",              "kills",
            "deaths",             "suicides",           "team_kills",
            "spawn_kills",               "multi_1",
            "multi_2",            "multi_3",            "multi_4",
            "multi_5",            "multi_6",            "multi_7",
            "spree_1",            "spree_2",
            "spree_3",            "spree_4",            "spree_5",
            "spree_6",            "spree_7",            
           // "fastest_kill",       "slowest_kill",       
            "assault_objectives", "dom_caps",           
             "accuracy",           "k_distance_normal",
            "k_distance_long",    "k_distance_uber",    "headshots",
            "shield_belt",        "amp",                "amp_time",
            "invisibility",       "invisibility_time",  "pads",
            "armor",              "boots",              "super_health",
            "mh_kills",           
            "views",              "mh_deaths",     
          ]


        const higherBetter = [
            "multi_best",
            "spree_best",
            "dom_caps_best_life",
            "best_spawn_kill_spree",
            "mh_kills_best_life",
            "mh_deaths_worst"
        ];

        c.ip = d.ip;
        c.hwid = d.hwid;
        c.face = d.face;
        c.country = d.country;
        c.voice = d.voice;

        for(let x = 0; x < mergeTypes.length; x++){

            const m = mergeTypes[x];
            c[m] += d[m];    
        }

        for(let x = 0; x < higherBetter.length; x++){

            const h = higherBetter[x];

            if(d[h] > c[h]) c[h] = d[h];
        }

        if(c.first > d.match_date) c.first = d.match_date;
        if(c.last < d.match_date) c.last = d.match_date;

        c.first_bloods += d.first_blood;
        c.ping_min_total += d.ping_min;
        c.ping_average_total += d.ping_average;
        c.ping_max_total += d.ping_max;
        c.accuracy_total += d.accuracy;
        if(c.dom_caps_best < d.dom_caps) c.dom_caps_best_life = d.dom_caps;
        if(c.mh_kills_best < d.mh_kills) c.mh_kills_best = d.mh_kills;


        if(c.kills > 0){

            if(c.deaths > 0){

                c.efficiency = c.kills / (c.kills + c.deaths) * 100;
            }else{
                c.efficiency = 100;
            }
        }else{
            c.efficiency = 0;
        }


        if(d.winner) c.wins++;
        if(d.draw) c.draws++;
        if(!d.winner && !d.draw) c.losses++;
        c.matches++;

        if(c.wins > 0){

            c.winrate = (c.wins / c.matches) * 100;
        }else{
            c.winrate = 0;
        }

        if(c.total_accuracy > 0 && d.accuracy > 0){

            c.accuracy = c.accuracy_total / c.matches;
        }else{
            c.accuracy = 0;
        }

        
    }

    //create new data from match data
    async createNewPlayerTotals(){


        const query = `SELECT * FROM nstats_player_matches WHERE player_id=?`;

        const result = await mysql.simpleQuery(query, [this.newId]);


        const totals = {};



        for(let i = 0; i < result.length; i++){

            const r = result[i];


            //map gametype totals
            this.updatePlayerTotal(totals, r.gametype, r.map_id, r);
            //gametype totals
            this.updatePlayerTotal(totals, r.gametype, 0, r);
            //map totals
            this.updatePlayerTotal(totals, 0, r.map_id, r);
            //all time totals
            this.updatePlayerTotal(totals, 0, 0, r);
        }


        return totals;
        
    }


    async getNewName(){

        const query = `SELECT name FROM nstats_player_totals WHERE id=?`;

        const result = await mysql.simpleQuery(query, [this.newId]);

        if(result.length > 0) return result[0].name;

        return "Player";
    }


    async updateMasterProfile(totals){

        new Message(`Updating master profile stats`,"note");
       
        if(totals[0][0] === undefined){
            throw new Error("Could not find master profile! updateMasterProfile[0][0]");  
        }

        const d = totals[0][0];

        const query = `UPDATE nstats_player_totals SET
        first=?,
        last=?,
        matches=?,
        wins=?,
        losses=?,
        draws=?,    
        winrate=?,
        playtime=?,
        team_0_playtime=?,
        team_1_playtime=?,
        team_2_playtime=?,
        team_3_playtime=?,
        spec_playtime=?,
        first_bloods=?,
        frags=?,
        score=?,
        kills=?,
        deaths=?,
        suicides=?,
        team_kills=?,
        spawn_kills=?,
        efficiency=?,
        multi_1=?,
        multi_2=?,
        multi_3=?,
        multi_4=?,
        multi_5=?,
        multi_6=?,
        multi_7=?,
        multi_best=?,
        spree_1=?,
        spree_2=?,
        spree_3=?,
        spree_4=?,
        spree_5=?,
        spree_6=?,
        spree_7=?,
        spree_best=?,
        best_spawn_kill_spree=?,
        assault_objectives=?,
        dom_caps=?,
        dom_caps_best=?,
        dom_caps_best_life=?,
        accuracy=?,
        k_distance_normal=?,
        k_distance_long=?,
        k_distance_uber=?,
        headshots=?,
        shield_belt=?,
        amp=?,
        amp_time=?,
        invisibility=?,
        invisibility_time=?,
        pads=?,
        armor=?,
        boots=?,
        super_health=?,
        mh_kills=?,
        mh_kills_best_life=?,
        mh_kills_best=?,
        views=?,
        mh_deaths=?,
        mh_deaths_worst=?
        WHERE id=?`;

        const vars = [
            d.first,
            d.last,
            d.matches,
            d.wins,
            d.losses,
            d.draws,
            d.winrate,
            d.playtime,
            d.team_0_playtime,
            d.team_1_playtime,
            d.team_2_playtime,
            d.team_3_playtime,
            d.spec_playtime,
            d.first_bloods,
            d.frags,
            d.score,
            d.kills,
            d.deaths,
            d.suicides,
            d.team_kills,
            d.spawn_kills,
            d.efficiency,
            d.multi_1,
            d.multi_2,
            d.multi_3,
            d.multi_4,
            d.multi_5,
            d.multi_6,
            d.multi_7,
            d.multi_best,
            d.spree_1,
            d.spree_2,
            d.spree_3,
            d.spree_4,
            d.spree_5,
            d.spree_6,
            d.spree_7,
            d.spree_best,
            d.best_spawn_kill_spree,
            d.assault_objectives,
            d.dom_caps,
            d.dom_caps_best,
            d.dom_caps_best_life,
            d.accuracy,
            d.k_distance_normal,
            d.k_distance_long,
            d.k_distance_uber,
            d.headshots,
            d.shield_belt,
            d.amp,
            d.amp_time,
            d.invisibility,
            d.invisibility_time,
            d.pads,
            d.armor,
            d.boots,
            d.super_health,
            d.mh_kills,
            d.mh_kills_best_life,
            d.mh_kills_best,
            d.views,
            d.mh_deaths,
            d.mh_deaths_worst,


            this.newId
        ];

        await mysql.simpleQuery(query, vars);

        new Message(`Updating master profile stats`,"pass");

        
    }

    async deleteOldMasterPlayerData(){

        const query = `DELETE FROM nstats_player_totals WHERE id=?`;

        await mysql.simpleQuery(query, [this.oldId]);
    }


    //delete everything except for master profile
    async deleteOldGametypeTotals(){

        const query = `DELETE FROM nstats_player_totals WHERE player_id=?`;

        return await mysql.simpleQuery(query, [this.newId]);
    }


    async insertNewPlayerTotals(totals){

        for(const [gametypeId, gametypeData] of Object.entries(totals)){


            for(const [mapId, d] of Object.entries(gametypeData)){

                //we have already update the master profile
                if(parseInt(gametypeId) === 0 && parseInt(mapId) === 0) continue;

                const query = `INSERT INTO nstats_player_totals VALUES(NULL,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?,?,
                    ?,?,?,?

                )`;

                const vars = [
                    d.hwid, this.newName, this.newId, d.first, d.last,
                    d.ip, d.country, d.face, d.voice, gametypeId,
                    mapId, d.matches, d.wins, d.losses, d.draws,
                    d.winrate, d.playtime, d.team_0_playtime, d.team_1_playtime, d.team_2_playtime,
                    d.team_3_playtime, d.spec_playtime, d.first_bloods, d.frags, d.score,
                    d.kills, d.deaths, d.suicides, d.team_kills, d.spawn_kills,
                    d.efficiency, d.multi_1, d.multi_2, d.multi_3, d.multi_4,
                    d.multi_5, d.multi_6, d.multi_7, d.multi_best, d.spree_1,
                    d.spree_2, d.spree_3, d.spree_4, d.spree_5, d.spree_6, 
                    d.spree_7, d.spree_best, d.fastest_kill, d.slowest_kill, d.best_spawn_kill_spree,
                    d.assault_objectives, d.dom_caps, d.dom_caps_best, d.dom_caps_best_life, d.accuracy,
                    d.k_distance_normal, d.k_distance_long, d.k_distance_uber, d.headshots, d.shield_belt,
                    d.amp, d.amp_time, d.invisibility, d.invisibility_time, d.pads,
                    d.armor, d.boots, d.super_health, d.mh_kills, d.mh_kills_best_life,
                    d.mh_kills_best, d.views, d.mh_deaths, d.mh_deaths_worst
                ];


                await mysql.simpleQuery(query, vars);
            }
        }
    }

    async mergePlayerTotalsData(){

        new Message("Merge player totals table", "note");

        this.newName = await this.getNewName();


        //for everything other than master profile(id=x and player_id=0)
        const updateQuery = `UPDATE nstats_player_totals SET player_id=?,name=? WHERE player_id=?`;

        await mysql.simpleQuery(updateQuery, [this.newId, this.newName, this.oldId]);

        const newTotals = await this.createNewPlayerTotals();

        await this.updateMasterProfile(newTotals);
        await this.deleteOldMasterPlayerData();

        await this.deleteOldGametypeTotals();
        
        await this.insertNewPlayerTotals(newTotals);
        
        new Message("Merge player totals table", "pass");
    }

    async recalcPowerups(){

        const query = `SELECT 
        gametype_id, powerup_id,
        COUNT(*) as total_matches,
        MAX(times_used) as times_used_best,
        SUM(times_used) as times_used,
        SUM(carry_time) as carry_time,
        MAX(carry_time_best) as carry_time_best,
        MAX(total_kills) as total_kills_best,
        SUM(total_kills) as total_kills,
        MAX(best_kills) as best_kills,
        SUM(end_deaths) as end_deaths,
        SUM(end_suicides) as end_suicides,
        SUM(end_timeouts) as end_timeouts,
        SUM(end_match_end) as end_match_end,
        MAX(carrier_kills) as carrier_kills_best,
        SUM(carrier_kills) as total_carrier_kills,
        MAX(carrier_kills_best) as carrier_kills_best_life
        FROM nstats_powerups_player_match WHERE player_id=? GROUP BY powerup_id,gametype_id`;
    
        const result = await mysql.simpleQuery(query, [this.newId]);
    
        const insertVars = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            insertVars.push([
                this.newId,
                r.gametype_id,
                r.total_matches,
                0,//total_playtime
                r.powerup_id,
                r.times_used,
                r.times_used_best,
                r.carry_time,
                r.carry_time_best,
                r.total_kills,
                r.total_kills_best, //all match
                r.best_kills,    //single spree
                r.end_deaths,
                r.end_suicides,
                r.end_timeouts,
                r.end_match_end,
                r.total_carrier_kills,
                r.carrier_kills_best,
                r.carrier_kills_best_life
            ]);
        }

        const insertQuery = `INSERT INTO nstats_powerups_player_totals (
            player_id, gametype_id, total_matches, total_playtime,
            powerup_id, times_used, times_used_best, carry_time,
            carry_time_best, total_kills, best_kills, best_kills_single_use,
            end_deaths, end_suicides, end_timeouts, end_match_end, 
            total_carrier_kills, carrier_kills_best, carrier_kills_single_life
        ) VALUES ?`;

        await mysql.bulkInsert(insertQuery, insertVars);
    }

    async deleteOldPowerups(){

        const query = `DELETE FROM nstats_powerups_player_totals WHERE player_id IN (?)`;

        await mysql.simpleQuery(query, [[this.newId, this.oldId]]);
    }

    async mergePowerups(){

        const tables = [
            "powerups_player_match",
            "powerups_carry_times"
        ];
        //also need to merge powerups_player_totals

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];
            const query = `UPDATE nstats_${t} SET player_id=? WHERE player_id=?`;
            await mysql.simpleQuery(query, [this.newId, this.oldId]);
        }


        await this.deleteOldPowerups();

        await this.recalcPowerups();
    }

    async mergeRankings(){

        new Message(`Merge player ranking data.`,"note");

        const playerManager = new Players();
        const r = new Rankings();

        await r.init();
        await r.deletePlayer(this.newId);
        await r.deletePlayer(this.oldId);
        await r.fullPlayerRecalculate(playerManager, this.newId);

        new Message(`Merge player ranking data.`,"pass");

    }


    async deleteOldWeaponTotals(){

        const query = `DELETE FROM nstats_player_weapon_totals WHERE player_id IN (?)`;

        await mysql.simpleQuery(query, [[this.newId, this.oldId]]);
    }

    async recalcWeaponTotals(){

        const query = `SELECT 
        weapon_id,
        COUNT(*) as total_matches,
        SUM(kills) as kills,
        MAX(best_kills) as best_kills,
        SUM(deaths) as deaths,
        SUM(suicides) as suicides,
        SUM(team_kills) as team_kills,
        MAX(best_team_kills) as best_team_kills,
        SUM(shots) as shots,
        SUM(hits) as hits,
        SUM(damage) as damage
        FROM nstats_player_weapon_match
        WHERE player_id=?
        GROUP BY weapon_id`;

        const result = await mysql.simpleQuery(query, this.newId);

        const insertVars = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            r.accuracy = 0;
            r.efficiency = 0;

            if(r.shots > 0 && r.hits > 0){
                r.accuracy = r.hits / (r.shots + r.hits) * 100;
            }

            if(r.deaths === 0 && r.kills > 0) r.efficiency = 100;

            if(r.deaths > 0 && r.kills > 0){
                r.efficiency = r.kills / (r.kills + r.deaths) * 100;
            }     
            
            insertVars.push([
                this.newId,
                0,
                0,
                0,
                r.weapon_id,
                r.kills, 
                r.team_kills,
                r.deaths,
                r.suicides,
                r.efficiency,
                r.accuracy,
                r.shots,
                r.hits,
                r.damage,
                r.total_matches
            ]);
        }

        const insertQuery = `INSERT INTO nstats_player_weapon_totals (
            player_id,map_id,gametype,playtime,
            weapon,kills,team_kills,deaths,suicides,
            efficiency,accuracy,shots,hits,damage,matches
        ) VALUES ?`;

        await mysql.bulkInsert(insertQuery, insertVars);
    }

    async mergeWeapons(){

        new Message(`Merge player weapon data.`,"note");

        const query = `UPDATE nstats_player_weapon_match SET player_id=? WHERE player_id=?`;
        await mysql.simpleQuery(query, [this.newId, this.oldId]);

        await this.deleteOldWeaponTotals();


        await this.recalcWeaponTotals();

        new Message(`Merge player weapon data.`,"pass");
    }

    async mergeWinRates(){

        new Message(`Merge player winrates`,"note");

        const w = new WinRate();

        await w.deletePlayer(this.newId);
        await w.deletePlayer(this.oldId);
        const data = await w.recalculatePlayerHistoryAfterMerge(this.newId);

        const insertVars = [];

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const gametype = d.gametype;
            const map = d.map;

            for(let x = 0; x < d.history.length; x++){

                const h = d.history[x];

                insertVars.push([
                    h.date,
                    h.match_id,
                    this.newId,
                    gametype, 
                    map,
                    h.match_result,
                    h.matches,
                    h.wins,
                    h.draws,
                    h.losses,
                    h.winrate,
                    h.current_win_streak,
                    h.current_draw_streak,
                    h.current_lose_streak,
                    h.max_win_streak,
                    h.max_draw_streak,
                    h.max_lose_streak
                ]);
            } 
        }


        const insertQuery = `INSERT INTO nstats_winrates (
            date, match_id, player, gametype, map,
            match_result, matches,wins,draws,losses,winrate,
            current_win_streak,current_draw_streak,current_lose_streak,
            max_win_streak,max_draw_streak,max_lose_streak
        ) VALUES ?`;
        
        await mysql.bulkInsert(insertQuery, insertVars);

        new Message(`Merge player winrates`,"pass");
    }
}

module.exports = PlayerMerger;