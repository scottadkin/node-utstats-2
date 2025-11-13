import { simpleQuery, updateReturnAffectedRows } from "./database.js";
import Message from "./message.js";
import fs from "fs";
import { getObjectName } from "./genericServerSide.mjs";
import { DEFAULT_DATE, DEFAULT_MIN_DATE } from "./generic.mjs";
import { mergeGametypes as mergeGametypesTelefrags } from "./telefrags.js";
import { mergeGametypes as mergePlayerGametypes } from "./players.js";
import { changeGametype as changeMatchGametype } from "./matches.js";
import { mergeGametypes as mergeMapGametypes } from "./maps.js";
import { mergeGametypes as mergeCombogibGametypes } from "./combogib.js";
import { mergeGametypes as mergeCTFGametypes } from "./ctf.js";
import { mergeGametypes as mergeWeaponsGametypes } from "./weapons.js";
import { mergeGametypes as mergePowerupsGametypes} from "./powerups.js";

export async function getAllGametypeNames(){
    
    const query = "SELECT id,name FROM nstats_gametypes ORDER BY name ASC";
     
    
    const result = await simpleQuery(query);
    
    const data = {};

    for(let i = 0; i < result.length; i++){

        data[result[i].id] = result[i].name
    }

    return data;
}

export default class Gametypes{

    constructor(){


    }

    async bExists(name){

        return await bExists(name);
    }

    async create(name){

        return await create(name);

    }

    async getIdByName(name){

        const query = "SELECT id FROM nstats_gametypes WHERE name=? LIMIT 1";

        const result = await simpleQuery(query, [name]);


        if(result[0] !== undefined){
            return result[0].id;
        }

        return null;
        
    }

    async updateQuery(id, date, playtime){

        const query = `UPDATE nstats_gametypes SET 
            first = IF(first > ? OR first = 0, ?, first),
            last = IF(last > ?, last, ?),
            playtime=playtime+?,
            matches=matches+1
            WHERE id=?`;

        const vars = [date,date,date,date,playtime,id];

        const result = await updateReturnAffectedRows(query, vars);

        return result > 0;
        
    }


    async bGametypeExists(id){

        const query = `SELECT COUNT(*) as total_matches FROM nstats_gametypes WHERE id=?`;

        const result = await simpleQuery(query, [id]);

        return result[0].total_matches !== 0;
    }

    async updateStats(name, date, playtime){

        try{

            const originalId = await this.getGametypeId(name, true);

            let currentGametype = originalId;

            const autoMergeId = await this.getGametypeAutoMergeId(originalId);

            if(autoMergeId !== 0){

                const bExists = await this.bGametypeExists(autoMergeId);

                if(bExists){
                    currentGametype = autoMergeId; 
                    new Message(`Gametype has an auto merge id of ${autoMergeId}.`, "note");
                }else{
                    new Message(`There are no gametypes with the id of ${autoMergeId}, using the gametype's original id instead.`,"warning");
                }
            }

            this.currentMatchGametype = currentGametype;

            const bPassed = await this.updateQuery(currentGametype, date, playtime);

            if(bPassed){
                new Message(`Inserted gametype info into database.`,'pass');
            }else{
                new Message(`Failed to update gametype database.`,'warning');
            }


        }catch(err){
            new Message(err, 'error');
        }
    }



    async getGametypeId(name, bCreate){

        try{

            new Message(`Gametype is ${name}`,'note');

            let currentId = await this.getIdByName(name);
            
            if(currentId === null){

                if(bCreate !== undefined){

                    new Message(`A gametype with that name does not have an id yet, creating one now.`,'note');

                    const newId = await this.create(name);

                    new Message(`Gametype ${name} has been inserted to database with the id of ${newId}`,'note');

                    return newId;

                }else{
                    new Message(`A gametype with that name does not have an id yet, bCreate is undefined a new one will not be created.`,'note');
                }
                
                return null;

            }else{
                return currentId;
            }

        }catch(err){
            throw new Error(err);
        }
    }

    async getName(id){

        return await getObjectName("gametypes", [id]);
    }

    async getNames(ids){

        return await getObjectName("gametypes", ids);
    }


    async getAllNames(){

  
        return await getAllGametypeNames();
    }


    async getMostPlayed(limit){

   
        const query = "SELECT * FROM nstats_gametypes ORDER BY matches DESC LIMIT ?";

        return await simpleQuery(query, [limit]);
    }

    async getAll(){
    
        return await getAll();
    }


    async bNameInUse(name){

        try{

            const result = await simpleQuery("SELECT COUNT(*) as same_names FROM nstats_gametypes WHERE name=?", [name]);

            if(result[0].same_names > 0) return true;

            return false;

        }catch(err){
            console.trace(err);
            return true;
        }
    }

    async changeMatchGametypes(oldId, newId){

        await simpleQuery("UPDATE nstats_matches SET gametype=? WHERE gametype=?", [newId, oldId]);
    }

    async changePlayerMatchGametypes(oldId, newId){
        await simpleQuery("UPDATE nstats_player_matches SET gametype=? WHERE gametype=?", [newId, oldId]);
    }

    async changePlayerTotalsGametype(oldId, newId){

        await simpleQuery("UPDATE nstats_player_totals SET gametype=? WHERE gametype=?", [newId, oldId]);
    }

    async getOldIdPlayerGametypeTotals(oldId){

        return await simpleQuery("SELECT * FROM nstats_player_totals WHERE gametype=?", [oldId]);
    }


    async deleteGametypePlayerTotals(oldId){

        await simpleQuery("DELETE FROM nstats_player_totals WHERE gametype=?", [oldId]);
    }


    async getWeaponTotals(id){

        return await simpleQuery("SELECT * FROM nstats_player_weapon_totals WHERE gametype=?", [id]);
    }


    async insertPlayerGametypeWeaponTotal(gametype, data){

        try{

            const query = `INSERT INTO nstats_player_weapon_totals VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            
            let efficiency = 0;
            let accuracy = 0;

            if(data.shots > 0){

                if(data.hits > 0){
                    accuracy = (data.hits / data.shots) * 100;
                }
            }

            if(data.kills > 0){

                if(data.deaths > 0){

                    efficiency = (data.kills / (data.kills + data.deaths)) * 100

                }else{
                    efficiency = 100;
                }
            }

            const vars = [
                data.player_id,
                gametype,
                data.weapon,
                data.kills,
                data.deaths,
                efficiency,
                accuracy,
                data.shots,
                data.hits,
                data.damage,
                data.matches

            ];


            await simpleQuery(query, vars);

        }catch(err){
            console.trace(err);
        }   
    }

    async updateWeaponPlayerTotal(gametype, data){

        try{

            const query = `UPDATE nstats_player_weapon_totals SET
            kills=Kills+?,
            deaths=deaths+?,
            efficiency = IF(kills > 0, IF(deaths > 0, (kills / (deaths + kills)) * 100 , 100)
            , 0),
            shots=shots+?,
            hits=hits+?,
            accuracy = IF(shots > 0, IF(hits > 0, (hits / shots) * 100 ,0) ,0),
            damage=damage+?,
            matches=matches+?
            WHERE gametype=? AND weapon=? AND player_id=?`;

            const vars = [
                data.kills,
                data.deaths,
                data.shots,
                data.hits,
                data.damage,
                data.matches,
                gametype,
                data.weapon,
                data.player_id
            ];


            const affectedRows = await mysql.updateReturnAffectedRows(query, vars);

            if(affectedRows === 0){

                await this.insertPlayerGametypeWeaponTotal(gametype, data);
            }

        }catch(err){
            console.trace(err);
        }
    }


    async getGametypeTotalsFromMatchData(gametypeId, bSeparateByMap){


        if(bSeparateByMap === undefined) bSeparateByMap = true;

        const query = `
        SELECT
        ${(bSeparateByMap) ? "map_id," : ""}
        player_id,
        COUNT(*) as total_matches,
        SUM(winner) as wins,
        SUM(draw) as draws,
        MIN(match_date) as first_match,
        MAX(match_date) as last_match,
        SUM(playtime) as playtime,
        SUM(team_0_playtime) as team_0_playtime,
        SUM(team_1_playtime) as team_1_playtime,
        SUM(team_2_playtime) as team_2_playtime,
        SUM(team_3_playtime) as team_3_playtime,
        SUM(spec_playtime) as spec_playtime,
        SUM(first_blood) as first_bloods,
        SUM(frags) as frags,
        SUM(score) as score,
        SUM(kills) as kills,
        SUM(deaths) as deaths,
        SUM(suicides) as suicides,
        SUM(team_kills) as team_kills,
        SUM(spawn_kills) as spawn_kills,
        AVG(efficiency) as efficiency,
        SUM(multi_1) as multi_1,
        SUM(multi_2) as multi_2,
        SUM(multi_3) as multi_3,
        SUM(multi_4) as multi_4,
        SUM(multi_5) as multi_5,
        SUM(multi_6) as multi_6,
        SUM(multi_7) as multi_7,
        MAX(multi_best) as multi_best,
        SUM(spree_1) as spree_1,
        SUM(spree_2) as spree_2,
        SUM(spree_3) as spree_3,
        SUM(spree_4) as spree_4,
        SUM(spree_5) as spree_5,
        SUM(spree_6) as spree_6,
        SUM(spree_7) as spree_7,
        MAX(spree_best) as spree_best,
        MAX(best_spawn_kill_spree) as best_spawn_kill_spree,
        SUM(assault_objectives) as assault_objectives,
        SUM(dom_caps) as dom_caps,
        MAX(dom_caps) as dom_caps_best,
        MAX(dom_caps_best_life) as dom_caps_best_life,
        MIN(ping_min) as ping_min,
        AVG(ping_average) as ping_average,
        MAX(ping_max) as ping_max,
        AVG(accuracy) as accuracy,
        MIN(shortest_kill_distance) as shortest_kill_distance,
        AVG(average_kill_distance) as average_kill_distance,
        MAX(longest_kill_distance) as longest_kill_distance,
        SUM(k_distance_normal) as k_distance_normal,
        SUM(k_distance_long) as k_distance_long,
        SUM(k_distance_uber) as k_distance_uber,
        SUM(headshots) as headshots,
        SUM(shield_belt) as shield_belt,
        SUM(amp) as amp,
        SUM(amp_time) as amp_time,
        SUM(invisibility) as invisibility,
        SUM(invisibility_time) as invisibility_time,
        SUM(pads) as pads,
        SUM(armor) as armor,
        SUM(boots) as boots,
        SUM(super_health) as super_health,
        SUM(mh_kills) as mh_kills,
        MAX(mh_kills) as mh_kills_best,
        MAX(mh_kills_best_life) as mh_kills_best_life,
        SUM(views) as views,
        SUM(mh_deaths) as mh_deaths,
        SUM(telefrag_kills) as telefrag_kills,
        SUM(telefrag_deaths) as telefrag_deaths,
        MAX(telefrag_best_spree) as telefrag_best_spree,
        MAX(telefrag_best_multi) as telefrag_best_multi,
        SUM(tele_disc_kills) as tele_disc_kills,
        SUM(tele_disc_deaths) as tele_disc_deaths,
        MAX(tele_disc_best_spree) as tele_disc_best_spree,
        MAX(tele_disc_best_multi) as tele_disc_best_multi
        FROM nstats_player_matches
        WHERE gametype=?
        GROUP BY player_id${(bSeparateByMap) ? ",map_id" : ""}`;

        const result = await simpleQuery(query, [gametypeId]);  

        if(bSeparateByMap) return result;
        
        if(result.length > 0) result[0].map_id = 0;
        return result;
    }



    async delete(id){
        await simpleQuery("DELETE FROM nstats_gametypes WHERE id=?", [id]);
    }


    getImages(){

        return fs.readdirSync("./public/images/gametypes/");
    }


    getSimilarImage(name, images){

        for(let i = 0; i < images.length; i++){

            if(name.includes(images[i])){
                return images[i];
            }
        }

        return null;
    }

    getMatchingImage(images, name, bStrict){

        let partialMatch = null;

        let currentPartial = null;

        for(let i = 0; i < images.length; i++){

            if(images[i] === name){
                return `${images[i]}.jpg`;
            }else{

                if(!bStrict){

                    currentPartial = this.getSimilarImage(name, images);

                    if(currentPartial !== null) partialMatch = `${currentPartial}.jpg`;
                }
            }
        }

        return partialMatch;
    }

    getMatchingImages(images, bStrict){
        

        if(images.length === 0) return [];

        const currentImages = this.getImages();

        for(let i = 0; i < currentImages.length; i++){

            currentImages[i] = currentImages[i].replace(/\.jpg/i, '');
        }

        const foundImages = {};

        for(let i = 0; i < images.length; i++){

            foundImages[images[i]] = this.getMatchingImage(currentImages, images[i], bStrict);
        }

        return foundImages;
    }

    async getAllPlayerMatchData(gametypeId){

        gametypeId = parseInt(gametypeId);

        if(gametypeId !== gametypeId){
            throw new Error(`GametypeId must be a valid integer`);
        }

        const query = "SELECT * FROM nstats_player_matches WHERE gametype=? ORDER BY match_date ASC";

        return await simpleQuery(query, [gametypeId]);
    }


    async getGametypeAutoMergeId(gametypeId){

        const MAX_DEPTH = 10;
        let depth = 0;

        let currentGametype = gametypeId;

        while(depth < MAX_DEPTH){

            depth++;

            const query = `SELECT auto_merge_id FROM nstats_gametypes WHERE id=?`;

            const result = await simpleQuery(query, [currentGametype]);

            if(result.length === 0) return currentGametype;

            //if auto merge id is 0 it means there is no further auto merging
            if(result[0].auto_merge_id === 0) return currentGametype;

            if(result.length > 0 && result[0].auto_merge_id !== 0){

                currentGametype = result[0].auto_merge_id;
            }
        }   

        if(depth >= MAX_DEPTH){
            new Message(`Gametypes.getGametypeAutoMergeId() Reached maximum depth of ${MAX_DEPTH}.`,"warning");
            new Message(`Gametypes.getGametypeAutoMergeId() Forcing original gametype id of ${gametypeId}.`,"warning");
            new Message(`Gametypes.getGametypeAutoMergeId() This is to prevent infinite loop if a gametype merges into itself.`,"warning");
            currentGametype = gametypeId;
        }

        return currentGametype;
    }

    deleteImage(image){

        const imageDir = "./public/images/gametypes/";

        try{

            fs.accessSync(`${imageDir}${image}`, fs.constants.R_OK | fs.constants.W_OK);
            fs.unlinkSync(`${imageDir}${image}`);
            return true;

        }catch(err){
            console.trace(err);
            throw new Error(err.toString());
        }

    }
}

async function bExists(name){

    const query = `SELECT COUNT(*) as total_matches FROM nstats_gametypes WHERE name=?`;
    const result = await simpleQuery(query, [name]);

    if(result[0].total_matches > 0) return true;
    return false;
}

export async function create(name){


    if(name === undefined) throw new Error("Gametype name is undefined");

    if(await bExists(name)) throw new Error("Gametype already exists");

    const query = "INSERT INTO nstats_gametypes VALUES(NULL,?,?,?,0,0,0)";
    const result = await simpleQuery(query, [name, DEFAULT_DATE, DEFAULT_MIN_DATE]);

    return result.insertId;
}

async function deleteGametypeTotals(gametypeId){

    const query = `DELETE FROM nstats_player_totals WHERE gametype=?`;

    return await simpleQuery(query, [gametypeId]);
}

async function deleteGametype(id){

    await simpleQuery("DELETE FROM nstats_gametypes WHERE id=?", [id]);

}

export async function recalculateGametypeTotals(gametypeId){

    const query = `SELECT COUNT(*) as total_matches,MIN(date) as first_match, 
    MAX(date) as last_match,SUM(playtime) as playtime FROM nstats_matches WHERE gametype=?`;

    const result = await simpleQuery(query, [gametypeId]);

    if(result.length === 0) return;

    const r = result[0];

    if(r.total_matches === 0){
        
        return await deleteGametype(gametypeId);
    }

    const updateQuery = `UPDATE nstats_gametypes SET first=?,last=?,matches=?,playtime=? WHERE id=?`;

    return await simpleQuery(updateQuery, [r.first_match, r.last_match,r.total_matches,r.playtime, gametypeId]);

}


export async function getAllIds(){

    const query = `SELECT id FROM nstats_gametypes`;

    const result = await simpleQuery(query);

    return result.map((r) =>{
        return r.id;
    });
}


export async function getAll(){

    const query = `SELECT * FROM nstats_gametypes ORDER BY name ASC`;

    return await simpleQuery(query);
}


export async function saveChanges(changes){

    if(changes.length === 0) return;

    const query = `UPDATE nstats_gametypes SET name=?,auto_merge_id=? WHERE id=?`;

    for(let i = 0; i < changes.length; i++){

        const c = changes[i];

        await simpleQuery(query, [c.name, c.mergeId, c.id]);
    }
}


export async function mergeGametypes(oldId, newId){


    await changeMatchGametype(oldId, newId);
    await mergePlayerGametypes(oldId, newId);
    await mergeGametypesTelefrags(oldId, newId);
    await mergeMapGametypes(oldId, newId);
    await mergeCombogibGametypes(oldId, newId);
    await mergeCTFGametypes(oldId, newId);
    await mergeWeaponsGametypes(oldId, newId);
    await mergePowerupsGametypes(oldId, newId);



    await deleteGametype(oldId);
    await recalculateGametypeTotals(newId);


    
    //nstats_ranking_player_current gametype delete old recalc new
    //nstats_ranking_player_history gametype delete old recalc new
    
    //nstats_winrates_latest gametype delete old reacl new


    //nstats_player_totals delete old recalculate totals
    await mergePlayerGametypes(oldId, newId);


}