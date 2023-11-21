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
            }, //player_id
            "ctf_caps": {
                "query": "SET grab_player = IF(grab_player=?,?,grab_player), cap_player = IF(cap_player=?,?,cap_player)", 
                "vars": [oldId, newId, oldId, newId]
            }, //grab_player, cap_player,
            "ctf_carry_times": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //player_id
            "ctf_covers": {  
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, //killer_id, victim_id
            "ctf_cr_kills": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //player_id
            "ctf_events": {
                "query": "SET player=? WHERE player=?", 
                "vars": [oldId, newId]
            }, //player
            "ctf_flag_deaths": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, //killer_id, victim_id,
            "ctf_flag_drops": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //player_id
            "ctf_flag_pickups": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //player_id
            "ctf_returns": {
                "query": "SET grab_player = IF(grab_player=?,?,grab_player), return_player = IF(return_player=?,?,return_player)", 
                "vars": [oldId, newId, oldId, newId]
            }, //grab_player, return_player
            "ctf_seals": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, //killer_id, victim_id
            "ctf_self_covers": {
                "query": "SET killer_id = IF(killer_id=?,?,killer_id), victim_id = IF(victim_id=?,?,victim_id)", 
                "vars": [oldId, newId, oldId, newId]
            }, //killer_id, victim_id
            "player_ctf_best": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //player_id(recalc totals, delete duplicate)
            "player_ctf_best_life": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //player_id(recalc totals, delete duplicate)
            "player_ctf_match": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //player_id
            "player_ctf_totals": {
                "query": "SET player_id=? WHERE player_id=?", 
                "vars": [oldId, newId]
            }, //player_id (recalc totals, delete duplicate)
        };


        for(const [table, info] of Object.entries(initialQueries)){

            await mysql.simpleQuery(`UPDATE nstats_${table} ${info.query}`, info.vars);
        }
    
        
    }
}

module.exports = PlayerMerger;