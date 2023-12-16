const mysql = require("./database");
const Message = require("./message");
const Players = require("./players");
const Rankings = require("./rankings");
const WinRate = require("./winrate");

/**
 * Maybe this time I get it right...
 */
class PlayerMerger{

    constructor(oldId, newId, hwid){

        this.oldId = oldId;
        this.newId = newId;
        this.hwid = (hwid !== undefined) ? hwid : "";
        //this.name = (name !== undefined) ? name : null;
    }

    async mergeHWID(){

        if(this.hwid === "") throw new Error("Can't apply changes to blank HWID.");

        new Message(`Merge all matches with player hwid = ${this.hwid}`,"note");

        const matchQuery = `SELECT * FROM nstats_player_matches WHERE hwid=?`;

        const matchData = await mysql.simpleQuery(matchQuery, [this.hwid]);
        console.log(matchData);

        const targetMatches = [];

        //players we need to recalculate totals
        const affectedPlayerIds = new Set();

        for(let i = 0; i < matchData.length; i++){

            const d = matchData[i];

            affectedPlayerIds.add(d.player_id);

            targetMatches.push({"matchId": d.match_id, "playerId": d.player_id});
        }
        



        const query = `UPDATE nstats_player_matches SET player_id=? WHERE hwid=?`;
        await mysql.simpleQuery(query, [this.newId, this.hwid]);

        console.log(affectedPlayerIds);

        //need to go through all the database tables and change the player id to the new one where both the match_id and player_id matches
        //this will make sure only correct data is changed and not every single match for said player_id

        //await this.mergeAssaultTables(oldId, newId, matchIds)

        console.log(targetMatches);

        for(let i = 0; i < targetMatches.length; i++){

            new Message(`Started merge ${i + 1} out of ${targetMatches.length}`,"progress");
            const {matchId, playerId} = targetMatches[i];

            await this.mergePlayerMatchData(playerId, this.newId, matchId);
            const newPlayerName = await this.getNewName(this.newId);
            //need to recalc totals for the old player just incase they have data
            const oldPlayerName = await this.getNewName(playerId);
      
            const newPlayerTotals = await this.createNewPlayerTotals(this.newId);
            const oldPlayerTotals = await this.createNewPlayerTotals(playerId);
            //await this.recalcPlayerTotalsFromMatchData(this.newId, newPlayerName);
            //await this.recalcPlayerTotalsFromMatchData(playerId, oldPlayerName);

            await this.updateMasterProfile(newPlayerTotals, this.newId);
            await this.updateMasterProfile(oldPlayerTotals, playerId);
            //not needed for match merge
            //await this.deleteOldMasterPlayerData();

            await this.deleteOldGametypeTotals();
            
            await this.insertNewPlayerTotals(newPlayerTotals, newPlayerName);
            await this.insertNewPlayerTotals(oldPlayerTotals, oldPlayerName);


            await this.recalcMapTotals(playerId);
            await this.recalcMapTotals(this.newId);


            await this.mergeAssaultTables(playerId, this.newId, matchId);
            await this.mergeCTFTables(playerId, this.newId, matchId);
            await this.mergeDomTables(playerId, this.newId, matchId);
            await this.mergeHeadshots(playerId, this.newId, matchId);
            await this.mergeItems(playerId, this.newId, matchId);
            await this.mergeKills(playerId, this.newId, matchId);

            await this.mergeCombogib(playerId, this.newId, matchId);
            await this.mergeMiscPlayerMatch(playerId, this.newId, matchId);
            await this.mergeMonsterTables(playerId, this.newId, matchId);
            
            //await this.mergePlayerTotalsData();
            await this.mergeWeapons(playerId, this.newId, matchId);
            //await this.mergePowerups();
            //await this.mergeRankings();


            //await this.mergeTeleFrags();
            //await this.mergeSprees();

            //await this.mergeWinRates();
        } 
    }


    /*async recalcPlayerTotalsFromMatchData(playerId, playerName){

        const getQuery = `SELECT * FROM nstats_player_matches WHERE player_id=?`;
        const result = await mysql.simpleQuery(getQuery, [playerId]);

        console.log(result);

        const totals = {};

''
        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(totals[r.gametype] === undefined){
               // totals[r.gametype] = this.createEmptyPlayerTotal(r, playerName, r.gametype, r.map);
            }

            //create all time totals if not exist
            if(totals[0] === undefined){
                totals[0] = {"0": this.createEmptyPlayerTotal(r, playerName)};
            }

            if(totals[r.gametype] === undefined) totals[r.gametype] = {};

            //create map all time totals if not exist
            if(totals[0][r.map_id] === undefined){
                totals[0][r.map_id] = this.createEmptyPlayerTotal(r, playerName);
            }

            
            //create gametype totals if not exist
            if(totals[r.gametype][0] === undefined){
                totals[r.gametype][0] = this.createEmptyPlayerTotal(r, playerName);
            }

            //create map gametype totals if not exist
            if(totals[r.gametype][r.map_id] === undefined){
                totals[r.gametype][r.map_id] = this.createEmptyPlayerTotal(r, playerName);
            }

            
        }

        console.log(totals);
        process.exit();
    }*/

    async merge(){

        try{

            const oldId = this.oldId;
            const newId = this.newId;
            await this.mergePlayerMatchData(oldId, newId);
            await this.mergeAssaultTables(oldId, newId);
            await this.mergeCTFTables(oldId, newId);
            await this.mergeDomTables(oldId, newId);
            await this.mergeHeadshots(oldId, newId);
            await this.mergeItems(oldId, newId);
            await this.mergeKills(oldId, newId);
            await this.mergeCombogib(oldId, newId);
            await this.mergeMiscPlayerMatch(oldId, newId);
            await this.mergeMonsterTables(oldId, newId);
            await this.recalcMapTotals(newId);
            await this.recalcMapTotals(oldId);
            const playerName = await this.getNewName(newId);
            await this.mergePlayerTotalsData(oldId, newId, playerName);
            await this.mergeWeapons(oldId, newId);
            await this.mergePowerups();
            await this.mergeRankings();


            await this.mergeTeleFrags();
            await this.mergeSprees();

            await this.mergeWinRates();

        }catch(err){
            console.trace(err);
        }
    }

    async mergeAssaultTables(oldId, newId, matchId){

        let query = "";
        let vars = [];

        if(matchId === undefined){
            query = `UPDATE nstats_assault_match_objectives SET player=? WHERE player=?`;
            vars = [newId, oldId];     
        }else{

            query = `UPDATE nstats_assault_match_objectives SET player=? WHERE player=? AND match_id=?`;
            vars = [newId, oldId, matchId];
        }

        return await mysql.simpleQuery(query, vars);
    }


    recalCTFBest(data){

        //some are _best_life table and others  _ctf_best, we can call this method once like this
        const types = [
        "flag_assist",
        "flag_assist_best",
        "flag_return",
        "flag_return_best",
        "flag_return_base",
        "flag_return_base_best",
        "flag_return_mid",
        "flag_return_mid_best",
        "flag_return_enemy_base",
        "flag_return_enemy_base_best",
        "flag_return_save",
        "flag_return_save_best",
        "flag_dropped",
        "flag_dropped_best",
        "flag_kill",
        "flag_kill_best",
        "flag_suicide",
        "flag_seal",
        "flag_seal_best",
        "flag_seal_pass",
        "flag_seal_pass_best",
        "flag_seal_fail",
        "flag_seal_fail_best",
        "best_single_seal",
        "flag_cover",
        "flag_cover_best",
        "flag_cover_pass",
        "flag_cover_pass_best",
        "flag_cover_fail",
        "flag_cover_fail_best",
        "flag_cover_multi",
        "flag_cover_multi_best",
        "flag_cover_spree",
        "flag_cover_spree_best",
        "best_single_cover",
        "flag_capture",
        "flag_capture_best",
        "flag_carry_time",
        "flag_carry_time_best",
        "flag_taken",
        "flag_taken_best",
        "flag_pickup",
        "flag_pickup_best",
        "flag_self_cover",
        "flag_self_cover_best",
        "flag_self_cover_pass",
        "flag_self_cover_pass_best",
        "flag_self_cover_fail",
        "flag_self_cover_fail_best",
        "best_single_self_cover",
        "flag_solo_capture",
        "flag_solo_capture_best"
        ];

        const totals = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];
            const gametypeId = d.gametype_id;

            //need to do all time totals as well
            if(i === 0){
                totals[0] = {...d};
                totals[0].gametype_id = 0;
            }

            if(totals[gametypeId] === undefined){
                totals[gametypeId] = {...d};
                continue;
            }

            const t = totals[gametypeId];
            const allTime = totals[0];

            for(let x = 0; x < types.length; x++){

                const h = types[x];

                if(d[h] === undefined) continue;

                if(t[h] < d[h]) t[h] = d[h];
                if(allTime[h] < d[h]) allTime[h] = d[h];
            }
        }
        
        return totals;
    }

    recalCTFPlayerTotals(data){

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
        
        for(let i = 0; i < data.length; i++){

            const d = data[i];
            const gametypeId = d.gametype_id;
            
            
            //need to do all time totals as well
            if(i === 0){
                totals[0] = {...d};
                totals[0].total_matches = 0;
                totals[0].gametype_id = 0;
            }

            let bSkipAllTimeTotals = i === 0;
            if(totals[gametypeId] === undefined){

                totals[gametypeId] = {...d};
                totals[gametypeId].total_matches = 0;
                
            }


            const t = totals[gametypeId];
            const allTime = totals[0];

            for(let x = 0; x < mergeTypes.length; x++){

                const m = mergeTypes[x];
       
                t[m] += d[m];
                
                if(!bSkipAllTimeTotals){
                    allTime[m] += d[m];
                }
            }

            for(let x = 0; x < higherBetter.length; x++){

                const h = higherBetter[x];

                if(t[h] < d[h]) t[h] = d[h];
               
                if(!bSkipAllTimeTotals){
                    if(allTime[h] < d[h]) allTime[h] = d[h];
                } 
            }

            allTime.total_matches++;
            t.total_matches++;
        }

        return totals;  
    }

    async deleteOldCTFData(playerId){

        const tables = [
            "player_ctf_best",
            "player_ctf_best_life",
            "player_ctf_totals"
        ];

        
        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            new Message(`Delete old data from table ${t}.`,"note");

            await mysql.simpleQuery(`DELETE FROM nstats_${t} WHERE player_id=?`, [playerId]);
            new Message(`Deleted old data from table ${t}.`,"pass");
        }
    }

    async insertNewCTFData(totals, best/*, bestLife*/){


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

        for(const b of Object.values(best)){

            bestLifeInsertVars.push([
                b.player_id, b.gametype_id, b.flag_assist_best, b.flag_return_best, b.flag_return_base_best,
                b.flag_return_mid_best, b.flag_return_enemy_base_best, b.flag_return_save_best, b.flag_dropped_best, b.flag_kill_best,
                b.flag_seal_best, b.flag_seal_pass_best, b.flag_seal_fail_best, b.best_single_seal,
                b.flag_cover_best, b.flag_cover_pass_best, b.flag_cover_fail_best, b.flag_cover_multi_best, b.flag_cover_spree_best,
                b.best_single_cover, b.flag_capture_best, b.flag_carry_time_best, b.flag_taken_best, b.flag_pickup_best,
                b.flag_self_cover_best, b.flag_self_cover_pass_best, b.flag_self_cover_fail_best, b.best_single_self_cover, b.flag_solo_capture_best
            ]);
        }

        new Message(`Start inserting new player ctf best life values(${bestLifeInsertVars.length} rows).`,"note");
        await mysql.bulkInsert(bestLifeQuery, bestLifeInsertVars);
        new Message(`Finished inserting new player ctf best life values.`,"pass");


    }

    async recalCTFTotals(playerId){

        
        //TODO: Recalculate totals from match data not totals data

        const matchQuery = `SELECT * FROM nstats_player_ctf_match WHERE player_id=?`;

        const matchResult = await mysql.simpleQuery(matchQuery, [playerId]);

        const totals = this.recalCTFPlayerTotals(matchResult);
        const best = this.recalCTFBest(matchResult);

        await this.deleteOldCTFData(playerId);

        await this.insertNewCTFData(totals, best/*, bestLife*/);

    }


    async fixDuplicatePlayerCTFData(newId){

        const query = `SELECT * FROM nstats_player_ctf_match WHERE player_id=?`;

        const result = await mysql.simpleQuery(query, newId);

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
                totals[r.match_id] = {...r};
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
        await mysql.simpleQuery(deleteQuery, [newId]);

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
    async mergeCTFTables(oldId, newId, matchId){

        //ctf_assists

       // const oldId = this.oldId;
       // const newId = this.newId;

        //tables where we just change the player_ids, 
        //after we have done this we recalculate the players new totals and delete the oldId totals
        //if there is totals that is
        const initialQueries = {
            "ctf_assists": {
                "query": "SET player_id=? WHERE player_id=?", 
                "hwidQuery": "SET player_id=? WHERE player_id=? AND match_id=?", 
                "vars": [newId, oldId],
                "hwidVars": [newId, oldId, matchId],
            }, 
            "ctf_caps": {
                "query": "SET grab_player = IF(grab_player=?,?,grab_player), cap_player = IF(cap_player=?,?,cap_player)", 
                "hwidQuery": 
                    `SET grab_player = IF(grab_player=? AND match_id=?,?,grab_player),
                    cap_player = IF(cap_player=? AND match_id=?,?,cap_player)`, 
                "vars": [oldId, newId, oldId, newId],
                "hwidVars": [oldId, matchId, newId, oldId, matchId, newId]
            }, 
            "ctf_carry_times": {
                "query": "SET player_id=? WHERE player_id=?", 
                "hwidQuery": "SET player_id=? WHERE player_id=? AND match_id=?", 
                "vars": [newId, oldId],
                "hwidVars": [newId, oldId, matchId]
            }, 
            "ctf_covers": {  
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "hwidQuery": "SET killer_id = IF(killer_id=? AND match_id=?,?,killer_id), victim_id = IF(victim_id=? AND match_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId],
                "hwidVars": [oldId, matchId, newId, oldId, matchId, newId]
            }, 
            "ctf_cr_kills": {
                "query": "SET player_id=? WHERE player_id=?", 
                "hwidQuery": "SET player_id=? WHERE player_id=? AND match_id=?", 
                "vars": [newId, oldId],
                "hwidVars": [newId, oldId, matchId],
            }, 
            "ctf_events": {
                "query": "SET player=? WHERE player=?", 
                "hwidQuery": "SET player=? WHERE player=? AND match_id=?", 
                "vars": [newId, oldId],
                "hwidVars": [newId, oldId, matchId]
            }, 
            "ctf_flag_deaths": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "hwidQuery": 
                    `SET killer_id = IF(killer_id=? AND match_id=?,?,killer_id), 
                    victim_id = IF(victim_id=? AND match_id=?,?,victim_id)`, 
                "vars": [oldId, newId, oldId, newId],
                "hwidVars": [oldId, matchId, newId, oldId, matchId, newId]
            }, 
            "ctf_flag_drops": {
                "query": "SET player_id=? WHERE player_id=?", 
                "hwidQuery": "SET player_id=? WHERE player_id=? AND match_id=?", 
                "vars": [newId, oldId],
                "hwidVars": [newId, oldId, matchId]
            }, 
            "ctf_flag_pickups": {
                "query": "SET player_id=? WHERE player_id=?", 
                "hwidQuery": "SET player_id=? WHERE player_id=? AND match_id=?", 
                "vars": [newId, oldId],
                "hwidVars": [newId, oldId, matchId]
            }, 
            "ctf_returns": {
                "query": "SET grab_player = IF(grab_player=?,?,grab_player), return_player = IF(return_player=?,?,return_player)", 
                "hwidQuery": 
                    `SET grab_player = IF(grab_player=? AND match_id=?,?,grab_player), 
                    return_player = IF(return_player=? AND match_id=?,?,return_player)`, 
                "vars": [oldId, newId, oldId, newId],
                "hwidVars": [oldId, matchId, newId, oldId, matchId, newId],
            }, 
            "ctf_seals": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "hwidQuery": 
                    `SET killer_id = IF(killer_id=? AND match_id=?,?,killer_id), 
                    victim_id = IF(victim_id=? AND match_id=?,?,victim_id)`, 
                "vars": [oldId, newId, oldId, newId],
                "hwidVars": [oldId, matchId, newId, oldId, matchId, newId],
            }, 
            "ctf_self_covers": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "hwidQuery": 
                    `SET killer_id = IF(killer_id=? AND match_id=?,?,killer_id),
                    victim_id = IF(victim_id=? AND match_id=?,?,victim_id)`, 
                "vars": [oldId, newId, oldId, newId],
                "hwidVars": [oldId, matchId, newId, oldId, matchId, newId]
            }, 
            "player_ctf_best": {
                "query": "SET player_id=? WHERE player_id=?", 
                //"hwidQuery": "SET player_id=? WHERE player_id=? AND match_id=?", 
                "vars": [newId, oldId],
                //"hwidVars": [newId, oldId, matchId]
            }, //(recalc totals, delete duplicate)
            "player_ctf_best_life": {
                "query": "SET player_id=? WHERE player_id=?", 
                //"hwidQuery": "SET player_id=? WHERE player_id=? AND match_id=?", 
                "vars": [newId, oldId],
                //"hwidVars": [newId, oldId, matchId]
            }, //(recalc totals, delete duplicate)
            "player_ctf_match": {
                "query": "SET player_id=? WHERE player_id=?", 
                "hwidQuery": "SET player_id=? WHERE player_id=? AND match_id=?", 
                "vars": [newId, oldId],
                "hwidVars": [newId, oldId, matchId],
            }, 
            "player_ctf_totals": {
                "query": "SET player_id=? WHERE player_id=?", 
                //"hwidQuery": "SET player_id=? WHERE player_id=? AND match_id=?", 
                "vars": [newId, oldId],
                //"hwidVars": [newId, oldId, matchId]
            }, // (recalc totals, delete duplicate)
        };


        for(const [table, info] of Object.entries(initialQueries)){

            const query = (matchId !== undefined) ? info.hwidQuery : info.query;
            const vars = (matchId !== undefined) ? info.hwidVars : info.vars;

            if(query === undefined || vars === undefined){
                //console.log("...");
                continue;
            }


            await mysql.simpleQuery(`UPDATE nstats_${table} ${query}`, vars);
        }

        
    
        await this.fixDuplicatePlayerCTFData(newId);
        
        await this.recalCTFTotals(newId);
        if(matchId !== undefined){
            await this.recalCTFTotals(oldId);
        }
    }


    //doesn't change the main players table like the ctf stuff
    async mergeDomTables(oldId, newId, matchId){


        new Message(`Merge dom tables.`,"note");
        const tables = ["dom_match_caps", "dom_match_player_score"];

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const vars = [newId, oldId];

            let query = `UPDATE nstats_${t} SET player=? WHERE player=?`;

            if(matchId !== undefined){
                vars.push(matchId);
                query += ` AND match_id=?`;
            }

            await mysql.simpleQuery(query, vars);
        }

        new Message(`Merge dom tables.`,"pass");
    }

    async mergeHeadshots(oldId, newId, matchId){

        new Message(`Merge headshots table`, "note");

        let query = "";
        let vars = [];

        if(matchId === undefined){
            query = `UPDATE nstats_headshots SET killer = IF(killer=?,?,killer), victim = IF(victim=?,?,victim)`;
            vars = [oldId, newId, oldId, newId];
        }else{
            query = `UPDATE nstats_headshots SET killer = IF(killer=? AND match_id=?, ?, killer),
            victim = IF(victim=? AND match_id=?, ?, victim)`;
            vars = [oldId, matchId, newId, oldId, matchId, newId];
        }

        await mysql.simpleQuery(query, vars);
        new Message(`Merge headshots table`, "pass");
    }

    async recalcItemTotals(playerId){

        const getQuery = `SELECT item,uses FROM nstats_items_match WHERE player_id=?`;

        const result = await mysql.simpleQuery(getQuery, [playerId]);

        const totals = {};

        for(let i = 0; i < result.length; i++){

            const {item, uses} = result[i];

            if(totals[item] === undefined){
                totals[item] = {"matches": 0, "uses": 0, "first": 0, "last": 0};
            }

            totals[item].matches++;
            totals[item].uses += uses;
        }

        return totals;
    }

    async fixItemTotals(playerId){

        const deleteOldQuery = `DELETE FROM nstats_items_player WHERE player=?`;
        await mysql.simpleQuery(deleteOldQuery, [playerId]);

        const newTotals = await this.recalcItemTotals(playerId);

        const totalInsertVars = [];

        for(const [itemId, itemData] of Object.entries(newTotals)){

            const {matches, uses, first, last} = itemData;

            totalInsertVars.push([playerId, itemId, first, last, uses, matches]);
        }

        const totalsQuery = `INSERT INTO nstats_items_player (
            player,item,first,last,uses,matches
        ) VALUES ?`;

        await mysql.bulkInsert(totalsQuery, totalInsertVars);
    }

    async mergeItems(oldId, newId, matchId){

        new Message(`Merge Item tables`,"note");

        const bMatchId = matchId !== undefined;

        let matchQuery = `UPDATE nstats_items_match SET player_id=? WHERE player_id=?`;
        const matchVars = [newId, oldId];

        if(bMatchId){
            matchQuery += ` AND match_id=?`;
            matchVars.push(matchId);
        }
        await mysql.simpleQuery(matchQuery, matchVars);


        await this.fixItemTotals(newId);

        //if hwid merge we need to fix the other player totals if needed
        if(bMatchId) await this.fixItemTotals(oldId);
        
        new Message(`Merge Item tables`,"pass");
    }

    async mergeKills(oldId, newId, matchId){

        new Message(`Merge kill tables`, "note");

        let query = "";
        let vars = [];

        if(matchId === undefined){
            query = `UPDATE nstats_kills SET killer = IF(killer = ?, ?, killer), victim = if(victim = ?, ?, victim)`;
            vars = [oldId, newId, oldId, newId];
        }else{
            query = `UPDATE nstats_kills SET killer = IF(killer=? AND match_id=?, ?, killer), victim = if(victim = ? AND match_id=?, ?, victim)`;
            vars = [oldId, matchId, newId, oldId, matchId, newId];
        }
        
        await mysql.simpleQuery(query, vars);

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


    updateComboTotal(totals, data){

        if(totals.total_matches === undefined) totals.total_matches = 0;

        totals.total_matches++;

        const mergeTypes = [
            "playtime",
            "primary_kills",        
            "primary_deaths",
            "shockball_kills",      
            "shockball_deaths",
            "combo_kills",          
            "combo_deaths",  
            "insane_kills",         
            "insane_deaths"
        ];

        const higherBetter = [
            "best_single_combo",    
            "best_single_shockball",
            "best_single_insane",   
            "best_primary_spree",
            "best_shockball_spree", 
            "best_combo_spree",
            "best_insane_spree"
        ];

        for(let i = 0; i < mergeTypes.length; i++){

            const m = mergeTypes[i];

            if(totals[m] === undefined){

                totals[m] = data[m];

                if(m !== "playtime"){
                    totals[`max_${m}`] = data[m];
                    totals[`max_${m}_match_id`] = data.match_id;
                }
                continue;
            }

            totals[m] += data[m];

            if(m !== "playtime" && totals[`max_${m}`] < data[m]){
                totals[`max_${m}`] = data[m];
                totals[`max_${m}_match_id`] = data.match_id;
            }
        }

        for(let i = 0; i < higherBetter.length; i++){

            const h = higherBetter[i];

            if(totals[h] === undefined){
                totals[h] = data[h];
                totals[`${h}_match_id`] = data.match_id;
                continue;
            }

            if(totals[h] < data[h]){
                totals[h] = data[h];
                totals[`${h}_match_id`] = data.match_id;
            }
        }

        const types = ["combo", "insane", "shockball", "primary"];

        
        for(let i = 0; i < types.length; i++){

            const t = types[i];

            const eff = `${t}_efficiency`;
            const kpm = `${t}_kpm`;
            const kills = totals[`${t}_kills`];
            const deaths = totals[`${t}_deaths`];
            const playtime = totals.playtime;

            if(totals[eff] === undefined) totals[eff] = 0;
            if(totals[kpm] === undefined) totals[kpm] = 0;

            if(kills > 0){

                if(deaths === 0){
                    totals[eff] = 100;
                }else{
                    totals[eff] = kills / (kills + deaths) * 100;
                }
            }
          
            if(playtime > 0){
                totals[kpm] = kills / (playtime / 60);
            }   
        }
    }

    async recalcComboTotals(playerId){

        const getQuery = `SELECT * FROM nstats_match_combogib WHERE player_id=?`;

        const result = await mysql.simpleQuery(getQuery, [playerId]);
    
        const totals = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            const playerId = r.player_id;
            const gametypeId = r.gametype_id;
            const mapId = r.map_id;

            //check if player total exists
            if(totals[playerId] === undefined) totals[playerId] = {};
            //check if player gametype total exists
            if(totals[playerId][gametypeId] === undefined) totals[playerId][gametypeId] = {};
            //check if player all time totals exist
            if(totals[playerId][0] === undefined) totals[playerId][0] = {};
            //alltime map total
            if(totals[playerId][0][mapId] === undefined) totals[playerId][0][mapId] = {}//r;
            //alltime
            if(totals[playerId][0][0] === undefined) totals[playerId][0][0] = {}//r;
            //map gametype total
            if(totals[playerId][gametypeId][mapId] === undefined) totals[playerId][gametypeId][mapId] = {}//r;
            //gametype total
            if(totals[playerId][gametypeId][0] === undefined) totals[playerId][gametypeId][0] = {}//r;

            const allTime = totals[playerId][0][0];
            const gametype = totals[playerId][gametypeId][0];
            const map = totals[playerId][0][mapId];
            const mapGametype = totals[playerId][gametypeId][mapId];


            this.updateComboTotal(allTime, r);
            this.updateComboTotal(gametype, r);
            this.updateComboTotal(map, r);
            this.updateComboTotal(mapGametype, r);

        }
        

        const deleteQuery = `DELETE FROM nstats_player_combogib WHERE player_id=?`;
        await mysql.simpleQuery(deleteQuery, [playerId]);


        const insertQuery = `INSERT INTO nstats_player_combogib (
            player_id,
            gametype_id,
            map_id,
            total_matches,
            playtime, 
            combo_kills,
            combo_deaths,
            combo_efficiency,
            combo_kpm,
            insane_kills,
            insane_deaths,
            insane_efficiency,
            insane_kpm,
            shockball_kills,
            shockball_deaths,
            shockball_efficiency,
            shockball_kpm,
            primary_kills,
            primary_deaths,
            primary_efficiency,
            primary_kpm,
            best_single_combo,
            best_single_combo_match_id,
            best_single_insane,
            best_single_insane_match_id,
            best_single_shockball,
            best_single_shockball_match_id,
            max_combo_kills,
            max_combo_kills_match_id,
            max_insane_kills,
            max_insane_kills_match_id,
            max_shockball_kills,
            max_shockball_kills_match_id,
            max_primary_kills,
            max_primary_kills_match_id,
            best_combo_spree,
            best_combo_spree_match_id,
            best_insane_spree,
            best_insane_spree_match_id,
            best_shockball_spree,
            best_shockball_spree_match_id,
            best_primary_spree,
            best_primary_spree_match_id
        ) VALUES ?`;

        const insertVars = [];

        for(const [playerId, gametypeData] of Object.entries(totals)){
  
            for(const [gametypeId, mapData] of Object.entries(gametypeData)){
                
                for(const [mapId, d] of Object.entries(mapData)){

                    insertVars.push(
                        [
                            playerId,
                            gametypeId,
                            mapId,
                            d.total_matches,
                            d.playtime, 
                            d.combo_kills,
                            d.combo_deaths,
                            d.combo_efficiency,
                            d.combo_kpm,
                            d.insane_kills,
                            d.insane_deaths,
                            d.insane_efficiency,
                            d.insane_kpm,
                            d.shockball_kills,
                            d.shockball_deaths,
                            d.shockball_efficiency,
                            d.shockball_kpm,
                            d.primary_kills,
                            d.primary_deaths,
                            d.primary_efficiency,
                            d.primary_kpm,
                            d.best_single_combo,
                            d.best_single_combo_match_id,
                            d.best_single_insane,
                            d.best_single_insane_match_id,
                            d.best_single_shockball,
                            d.best_single_shockball_match_id,
                            d.max_combo_kills,
                            d.max_combo_kills_match_id,
                            d.max_insane_kills,
                            d.max_insane_kills_match_id,
                            d.max_shockball_kills,
                            d.max_shockball_kills_match_id,
                            d.max_primary_kills,
                            d.max_primary_kills_match_id,
                            d.best_combo_spree,
                            d.best_combo_spree_match_id,
                            d.best_insane_spree,
                            d.best_insane_spree_match_id,
                            d.best_shockball_spree,
                            d.best_shockball_spree_match_id,
                            d.best_primary_spree,
                            d.best_primary_spree_match_id
                        ]
                    );
                }
            }
        }

        await mysql.bulkInsert(insertQuery, insertVars);
    }

    async mergeCombogib(oldId, newId, matchId){

        new Message(`Merge Combogib Tables`,"note");

        const bMatch = matchId !== undefined;


        //no difference with hwid match merge as the map will never change
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
            oldId, newId,
            oldId, newId,
            oldId, newId,
            oldId, newId,
            oldId, newId,
            oldId, newId,
            oldId, newId,
            oldId, newId,
            oldId, newId,
            oldId, newId,
            oldId, newId,
        ];

        await mysql.simpleQuery(mapQuery, mapVars);


        let matchQuery = `UPDATE nstats_match_combogib SET player_id=? WHERE player_id=?`;
        const matchVars = [newId, oldId];

        if(bMatch){
            matchQuery += ` AND match_id=?`;
            matchVars.push(matchId);
        }

        await mysql.simpleQuery(matchQuery, matchVars);

        if(bMatch){
            await this.recalcComboTotals(oldId);
        }
        await this.recalcComboTotals(newId);

        new Message(`Merge Combogib Tables`,"pass");
    }

    async mergeMiscPlayerMatch(oldId, newId, matchId){

        new Message(`Merge misc player match tables`,"note");

        const tables = [
            "match_connections",
            "match_pings",
            "match_player_score",
            "match_team_changes",    
        ];

        const bMatch = matchId !== undefined;

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            let query = `UPDATE nstats_${t} SET player=? WHERE player=?`;
            const vars = [newId, oldId]

            if(bMatch){
                query += ` AND match_id=?`;
                vars.push(matchId);
            }

            await mysql.simpleQuery(query, vars);
        }

        new Message(`Merge misc player match tables`,"pass");
    }


    async fixMonsterDuplicateData(playerId){

        //TODO recreate totals with match data instead to work with HWID merge

        const getQuery = `SELECT * FROM nstats_monsters_player_match WHERE player=?`;

        const result = await mysql.simpleQuery(getQuery, [playerId]);

        const totals = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(totals[r.monster] === undefined){
                totals[r.monster] = {
                    "totalMatches": 0,
                    "kills": 0,
                    "deaths": 0
                };
            }

            const t = totals[r.monster];

            t.totalMatches++;
            t.kills += r.kills;
            t.deaths += r.deaths;
        }

        const deleteQuery = `DELETE FROM nstats_monsters_player_totals WHERE player=?`;
        await mysql.simpleQuery(deleteQuery, [playerId]);

        const insertQuery = `INSERT INTO nstats_monsters_player_totals (
            player,
            monster,
            matches,
            kills, 
            deaths
        ) VALUES ?`;

        const insertVars = [];

        for(const [monsterId, data] of Object.entries(totals)){

            insertVars.push([
                playerId,
                monsterId,
                data.totalMatches,
                data.kills,
                data.deaths

            ]);
        }

        await mysql.bulkInsert(insertQuery, insertVars);
    }

    async mergeMonsterTables(oldId, newId, matchId){

        new Message(`Merge monster tables`,"note");

        const tables = [
            "monster_kills",
            "monsters_player_match",
            "monsters_player_totals"
        ];

        const bMatch = matchId !== undefined;

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            let query = `UPDATE nstats_${t} SET player=? WHERE player=?`;
            const vars = [newId, oldId];

            //can't merge totals in the same way for HWID reasons
            if(i < 2 && bMatch){
                query += ` AND match_id=?`;
                vars.push(matchId);
            }

            
            await mysql.simpleQuery(query, vars);
        }


        await this.fixMonsterDuplicateData(oldId, matchId);
        await this.fixMonsterDuplicateData(newId, matchId);

        new Message(`Merge monster tables`,"pass");
    }


    async deleteCurrentMapTotals(playerId){

        const query = `DELETE FROM nstats_player_maps WHERE player=?`;

        await mysql.simpleQuery(query, [playerId]);
    }

    async recalcMapTotals(playerId){

        new Message(`Merge player maps table`, "note");

        const query = `SELECT match_id,player_id,playtime,map_id,match_date FROM nstats_player_matches WHERE player_id=?`;

        const result = await mysql.simpleQuery(query, [playerId]);

        await this.deleteCurrentMapTotals(playerId);

        const totals = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(totals[r.map_id] === undefined){

                totals[r.map_id] = {
                    "first": r.match_date,
                    "first_id": r.match_id,
                    "last": r.match_date,
                    "last_id": r.match_id,
                    "matches": 1,
                    "playtime": r.playtime,
                    "longest": r.playtime,
                    "longest_id": r.match_id
                };
                continue;
            }

            const t = totals[r.map_id];

            t.playtime += r.playtime;
            t.matches++;

            if(r.match_date < t.first){
                t.first = r.match_date;
                t.first_id = r.match_id;
            }

            if(r.match_date > t.last){
                t.last = r.match_date;
                t.last_id = r.match_id;
            }

            if(r.playtime > t.longest){
                t.longest = r.playtime;
                t.longest_id = r.playtime;
            }
        }

        const insertVars = [];

        for(const [mapId, m] of Object.entries(totals)){

            insertVars.push([
                mapId,
                playerId,
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


    async fixDuplicatePlayerMatchData(playerId){

        const getQuery = `SELECT * FROM nstats_player_matches WHERE player_id=?`;

        const data = await mysql.simpleQuery(getQuery, [playerId]);

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
        await mysql.simpleQuery(deleteQuery, [playerId]);

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

    async mergePlayerMatchData(oldId, newId, matchId){

        new Message(`Merge player match data`,"note");

        const bMatch = matchId !== undefined;

        let query = `UPDATE nstats_player_matches SET player_id=? WHERE player_id=?`;
        const vars = [newId, oldId]

        if(bMatch){
            query += ` AND match_id=?`;
            vars.push(matchId);
        }

        await mysql.simpleQuery(query, vars);

        await this.fixDuplicatePlayerMatchData(newId);


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

         
            t[gametypeId][mapId] = {...d};

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
    async createNewPlayerTotals(playerId){


        const query = `SELECT * FROM nstats_player_matches WHERE player_id=?`;

        const result = await mysql.simpleQuery(query, [playerId]);


        const totals = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            //all time totals
            this.updatePlayerTotal(totals, 0, 0, r);

            //gametype totals
            this.updatePlayerTotal(totals, r.gametype, 0, r);

            //map totals
            this.updatePlayerTotal(totals, 0, r.map_id, r);

            //map gametype totals
            this.updatePlayerTotal(totals, r.gametype, r.map_id, r);
            
            
        }

        return totals;
        
    }


    async getNewName(playerId){

        const query = `SELECT name FROM nstats_player_totals WHERE id=?`;

        const result = await mysql.simpleQuery(query, [playerId]);

        if(result.length > 0) return result[0].name;

        return "Player";
    }


    async updateMasterProfile(totals, playerId){

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


            playerId
        ];

        await mysql.simpleQuery(query, vars);

        new Message(`Updating master profile stats`,"pass");

        
    }

    async deleteOldMasterPlayerData(playerId){

        const query = `DELETE FROM nstats_player_totals WHERE id=?`;

        await mysql.simpleQuery(query, [playerId]);
    }


    //delete everything except for master profile
    async deleteOldGametypeTotals(playerId){

        const query = `DELETE FROM nstats_player_totals WHERE player_id=?`;

        return await mysql.simpleQuery(query, [playerId]);
    }


    async insertNewPlayerTotals(totals, playerName){

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
                    d.hwid, playerName, this.newId, d.first, d.last,
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

    async mergePlayerTotalsData(oldId, newId, playerName){

        new Message("Merge player totals table", "note");



        //for everything other than master profile(id=x and player_id=0)
        //const updateQuery = `UPDATE nstats_player_totals SET player_id=?,name=? WHERE player_id=?`;

        //await mysql.simpleQuery(updateQuery, [newId, playerName, oldId]);

        const newTotals = await this.createNewPlayerTotals(newId);

        await this.updateMasterProfile(newTotals, newId);
        await this.deleteOldMasterPlayerData(oldId);

        await this.deleteOldGametypeTotals(newId);
        
        await this.insertNewPlayerTotals(newTotals, playerName);
        
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


    async deleteOldWeaponTotals(oldId, newId){

        const query = `DELETE FROM nstats_player_weapon_totals WHERE player_id IN (?)`;

        await mysql.simpleQuery(query, [[newId, oldId]]);
    }

    async recalcWeaponTotals(playerId){

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

        const result = await mysql.simpleQuery(query, [playerId]);

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
                playerId,
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

    async mergeWeapons(oldId, newId, matchId){

        new Message(`Merge player weapon data.`,"note");

        const bMatch = matchId !== undefined;

        let query = `UPDATE nstats_player_weapon_match SET player_id=? WHERE player_id=?`;
        const vars = [newId, oldId];

        if(bMatch){
             query += ` AND match_id=?`;
             vars.push(matchId);
        }
        await mysql.simpleQuery(query, vars);

        await this.deleteOldWeaponTotals(oldId, newId);


        await this.recalcWeaponTotals(newId);
        //need to recalculate the other player as well if it's a match otherwise there may be missing totals data
        if(bMatch){
            await this.recalcWeaponTotals(oldId);
        }

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