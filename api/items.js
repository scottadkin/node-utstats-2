const mysql = require('./database');
const Message = require('./message');

class Items{

    constructor(){

    }

    exists(item){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_pickups FROM nstats_items WHERE name=?";

            mysql.query(query, [item], (err, result) =>{

                if(err) reject(err);

                if(result[0].total_pickups > 0){
                    resolve(true);
                }

                resolve(false);
            });
        });
    }

    create(name, uses, date){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_items VALUES(NULL,?,?,?,?,?,1,0)";

            mysql.query(query, [name, name, date, date, uses], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    update(name, uses, date){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_items SET uses=uses+?,
            first = IF(? < first, ?, IF(first = 0, ?, first)),
            last = IF(? > last, ?, last),
            matches=matches+1
            WHERE name=?`;

            mysql.query(query, [uses, date, date, date, date, date, name], (err) =>{
                if(err) reject(err);

                resolve();
            });
        });
    }

    async updateTotals(item, uses, date){

        try{

            if(await this.exists(item)){
                await this.update(item, uses, date);
            }else{
                new Message(`Item ${item} does not exist, creating now.`,'note');
                await this.create(item, uses, date);
            }

        }catch(err){
            new Message(`Items.updateTotals ${err}`,'error');
        }
    }


    getIdsByNames(names){

        return new Promise((resolve, reject) =>{

            if(names.length === 0) resolve([]);

            const query = "SELECT id,name,type FROM nstats_items WHERE name IN(?)";

            mysql.query(query, [names], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    async getNamesByIds(ids, bReturnSimpleObject){

        if(ids.length === 0) return [];

        if(bReturnSimpleObject === undefined) bReturnSimpleObject = false;

        const query = "SELECT id,name,display_name,type FROM nstats_items WHERE id IN(?) ORDER BY name ASC";

        const result = await mysql.simpleQuery(query, [ids]);

        if(!bReturnSimpleObject){
            return result;
        }

        const obj = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            obj[r.id] = {
                "name": r.name,
                "displayName": r.display_name,
                "type": r.type
            };
        }

        return obj;
    }

    insertPlayerMatchItem(matchId, playerId, item, uses){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_items_match VALUES(NULL,?,?,?,?)";

            mysql.query(query, [matchId, playerId, item, uses], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertAllPlayerMatchItems(vars){

        const query = "INSERT INTO nstats_items_match (match_id,player_id,item,uses) VALUES ?";

        await mysql.bulkInsert(query, vars);
    }

    playerTotalExists(playerId, item){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_items FROM nstats_items_player WHERE player=? AND item=?";

            mysql.query(query, [playerId, item], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result[0].total_items > 0){
                        resolve(true);
                    }
                }
                resolve(false);
            });
        });
    }

    insertPlayerTotal(playerId, item, uses, date){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_items_player VALUES(NULL,?,?,?,?,?,1)";

            mysql.query(query, [playerId, item, date, date, uses], (err) =>{
                if(err) reject(err);

                resolve();
            }); 
        });
    }

    updatePlayerTotalQuery(playerId, item, uses, date){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_items_player SET uses=uses+?,matches=matches+1,
            first = IF(? < first, ?, first),
            last = IF(? > last, ?, last)
            WHERE player=? AND item=?`;

            mysql.query(query, [uses, date, date, date, date, playerId, item], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async updatePlayerTotal(playerId, item, uses, date){

        try{

            if(await this.playerTotalExists(playerId, item)){

                await this.updatePlayerTotalQuery(playerId, item, uses, date);
            }else{

                await this.insertPlayerTotal(playerId, item, uses, date);
            }

        }catch(err){
            new Message(`items.updatePlayerTotals ${err}`,'error');
        }
    }

    async getMatchData(matchId){

        const query = "SELECT player_id,item,uses FROM nstats_items_match WHERE match_id=?";
        return await mysql.simpleQuery(query, [matchId]);

    }

    async getMatchTotals(matchId){

        const query = "SELECT item,SUM(uses) as total_uses FROM nstats_items_match WHERE match_id=? GROUP BY item";
        const result =  await mysql.simpleQuery(query, [matchId]);

        const obj = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            obj[r.item] = r.total_uses;
        }

        return obj;
    }

    getPlayerTotalData(player){

        return new Promise((resolve, reject) =>{

            const query = "SELECT item,first,last,uses,matches FROM nstats_items_player WHERE player=?";

            mysql.query(query, [player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }


    async setPlayerMatchPickups(matchId, player, data){

        const query = `UPDATE nstats_player_matches SET 
            shield_belt=?,amp=?,amp_time=?,
            invisibility=?,invisibility_time=?,
            pads=?,armor=?,boots=?,super_health=?
            WHERE match_id=? AND player_id=?`;


        const vars = [
            data.belt ?? 0,
            data.amp ?? 0,
            data.ampStats.totalTime,
            data.invis ?? 0,
            data.invisStats.totalTime,
            data.pads ?? 0,
            data.armor ?? 0,
            data.boots ?? 0,
            data.super ?? 0,
            matchId,
            player
        ];


        return await mysql.simpleQuery(query, vars)

    }

    async updatePlayerBasicPickupData(player, data){

        const query = `UPDATE nstats_player_totals SET 
            shield_belt=shield_belt+?,
            amp=amp+?,
            amp_time=amp_time+?,

            invisibility=invisibility+?,
            invisibility_time=invisibility_time+?,
            pads=pads+?,armor=armor+?,boots=boots+?,super_health=super_health+? WHERE id=?`;

           
        const vars = [
            data.belt ?? 0,
            data.amp ?? 0,
            data.ampStats.totalTime,
            data.invis ?? 0,
            data.invisStats.totalTime,
            data.pads ?? 0,
            data.armor ?? 0,
            data.boots ?? 0,
            data.super ?? 0,
            player
        ];

        return await mysql.simpleQuery(query, vars);
    }


    reduceItemTotal(id, amount, matches){

        return new Promise((resolve, reject) =>{

            let query = "UPDATE nstats_items SET uses=uses-?, matches=matches-1 WHERE id=?";

            let vars = [amount, id];

            if(matches !== undefined){

                matches = parseInt(matches);

                if(matches !== matches) matches = 1;

                vars = [amount, matches, id]

                query = "UPDATE nstats_items SET uses=uses-?, matches=matches-? WHERE id=?";
            }

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    reduceItemPlayerTotal(id, playerId, amount){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_items_player SET uses=uses-?, matches=matches-1 WHERE player=? AND item=?";

            mysql.query(query, [amount, playerId, id], (err, result) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    deleteMatchItems(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_items_match WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async deleteMatchData(id){

        try{

            const matchData = await this.getMatchData(id);

            const uses = {};
            
            for(let i = 0; i < matchData.length; i++){

                const m = matchData[i];

                if(uses[m.item] !== undefined){
                    uses[m.item] += m.uses;
                }else{
                    uses[m.item] = m.uses;
                }

                await this.reduceItemPlayerTotal(m.item, m.player_id, m.uses);
            }

            for(const [key, value] of Object.entries(uses)){

                await this.reduceItemTotal(key, value);
            }

            await this.deleteMatchItems(id);

        }catch(err){
            console.trace(err);
        }   
    }


    getPlayerMatchItemData(playerId, matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT item,uses FROM nstats_items_match WHERE match_id=? AND player_id=?";

            mysql.query(query, [matchId, playerId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
    }

    reduceItemTotalsByPlayerMatchUse(item, uses){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_items SET uses=uses-? WHERE id=?";

            mysql.query(query, [uses, item], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deletePlayerMatchUses(playerId, matchId){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nstats_items_match WHERE player_id=? AND match_id=?";

            mysql.query(query, [playerId, matchId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async deletePlayerFromMatch(playerId, matchId){

        try{

            const matchData = await this.getPlayerMatchItemData(playerId, matchId);

            if(matchData.length > 0){

                let m = 0;

                for(let i = 0; i < matchData.length; i++){

                    m = matchData[i];

                    await this.reduceItemPlayerTotal(m.item, playerId, m.uses);
                    await this.reduceItemTotalsByPlayerMatchUse(m.item, m.uses);
                    await this.deletePlayerMatchUses(playerId, matchId);

                }
            }
        }catch(err){
            console.trace(err);
        }   
    }

    async changePlayerIdsMatch(oldId, newId){

        await mysql.simpleQuery("UPDATE nstats_items_match SET player_id=? WHERE player_id=?", [newId, oldId]);
    }

    async deletePlayerTotals(id){

        await mysql.simpleQuery("DELETE FROM nstats_items_player WHERE player=?", [id]);
    }

    async createNewPlayerTotalFromMerge(player, item, first, last, uses, matches){

        const query = "INSERT INTO nstats_items_player VALUES(NULL,?,?,?,?,?,?)";
        const vars = [player, item, first, last, uses, matches];

        await mysql.simpleQuery(query, vars);
    }

    async mergePlayerTotals(oldId, newId){

        try{

            const oldData = await this.getPlayerTotalData(oldId);
            const newData = await this.getPlayerTotalData(newId);

            const mergedData = {};

            const merge = (array) =>{

                for(let i = 0; i < array.length; i++){

                    const d = array[i];
    
                    if(mergedData[d.item] === undefined){
                        mergedData[d.item] = d;
                    }else{
    
                        mergedData[d.item].uses += d.uses;
                        mergedData[d.item].matches += d.matches;
    
                        if(d.first < mergedData[d.item].first){
                            mergedData[d.item].first = d.first;
                        }
    
                        if(d.last > mergedData[d.item].last){
                            mergedData[d.item].last = d.last;
                        }
                    }
                }
            }

            merge(oldData);
            merge(newData);

            await this.deletePlayerTotals(oldId);
            await this.deletePlayerTotals(newId);

            for(const [key, value] of Object.entries(mergedData)){

                await this.createNewPlayerTotalFromMerge(newId, key, value.first, value.last, value.uses, value.matches);
            }


        }catch(err){
            console.trace(err);
        }
    }



    async getAllPlayerMatchData(playerId){

        return await mysql.simpleFetch("SELECT * FROM nstats_items_match WHERE player_id=?", [playerId]);
    }

    async deletePlayerTotals(player){

        await mysql.simpleDelete("DELETE FROM nstats_items_player WHERE player=?", [player]);

    }

    async deleteAllPlayerMatchData(player){

        await mysql.simpleDelete("DELETE FROM nstats_items_match WHERE player_id=?", [player]);
    }

    async deletePlayer(playerId){

        try{

            const matchData = await this.getAllPlayerMatchData(playerId);

            const uses = {};

            let m = 0;

            for(let i = 0; i < matchData.length; i++){

                m = matchData[i];

                if(uses[m.item] === undefined) uses[m.item] = {"uses": 0, "matches": 0};

                uses[m.item].uses += m.uses;
                uses[m.item].matches++;
            }

            for(const [key, value] of Object.entries(uses)){
                await this.reduceItemTotal(parseInt(key), value.uses, 0);
                await this.deletePlayerTotals(playerId);
                await this.deleteAllPlayerMatchData(playerId);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async getMatchesData(ids){

        if(ids.length === 0) return [];
        
        return await mysql.simpleFetch("SELECT * FROM nstats_items_match WHERE match_id IN (?)", [ids]);
    }

    async reducePlayerTotalsAlt(player, item, uses, matches){

        const query = "UPDATE nstats_items_player SET uses=uses-?,matches=matches-? WHERE player=? AND item=?";
        const vars = [uses, matches, player, item];

        await mysql.simpleUpdate(query, vars);
    }

    async deleteMatchesData(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_items_match WHERE match_id IN (?)", [ids]);
    }

    async deleteMatches(ids){

        try{

            const matchesData = await this.getMatchesData(ids);

            const uses = {};
            const playerUses = {};

            let m = 0;

            for(let i = 0; i < matchesData.length; i++){

                m = matchesData[i];

                if(uses[m.item] === undefined){
                    uses[m.item] = {"uses": 0, "matches": []};
                }

                if(playerUses[m.player_id] === undefined){
                    playerUses[m.player_id] = {};
                }

                uses[m.item].uses += m.uses;
                
                if(uses[m.item].matches.indexOf(m.match_id) === -1){

                    uses[m.item].matches.push(m.match_id);
                }


                if(playerUses[m.player_id][m.item] === undefined){
                    playerUses[m.player_id][m.item] = {"uses": 0, "matches": 0};
                }

                playerUses[m.player_id][m.item].matches++;
                playerUses[m.player_id][m.item].uses += m.uses;
            }

            for(const [player, items] of Object.entries(playerUses)){

                for(const [item, data] of Object.entries(items)){

                    await this.reducePlayerTotalsAlt(player, parseInt(item), data.uses, data.matches);
                }
            }

            for(const [key, value] of Object.entries(uses)){

                await this.reduceItemTotal(parseInt(key), value.uses, value.matches.length);
            }

            await this.deleteMatchesData(ids);

        }catch(err){    
            console.trace(err);
        }
    }


    async getAll(){

        return await mysql.simpleFetch("SELECT * FROM nstats_items ORDER BY name ASC");
    }

    async updateEntry(id, displayName, type){

        const query = "UPDATE nstats_items SET display_name=?,type=? WHERE id=?";
        const vars = [displayName, type, id];

        await mysql.simpleUpdate(query, vars);
    }

    async adminUpdateEntries(data){

        try{

            let d = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                await this.updateEntry(d.id, d.display_name, d.type);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async getPlayerMatchData(matchId, playerId){

        const query = "SELECT item,uses FROM nstats_items_match WHERE match_id=? AND player_id=?";

        const result = await mysql.simpleQuery(query, [matchId, playerId]);

        const data = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            data[r.item] = r.uses;
        }

        return data;
    }

    createPlayerItemUses(data){

        const players = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(players[d.player_id] === undefined){
                players[d.player_id] = {};
            }

            const p = players[d.player_id];

            p[d.item] = d.uses;
        }

        return players;
    }

    returnUniqueIds(data){

        const unique = [];

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(unique.indexOf(d.item) === -1){
                unique.push(d.item);
            }
        }

        return unique;
    }


    async updateMatchAmpKills(matchId, ampKills){

        const query = `UPDATE nstats_matches SET 
        amp_kills=?,
        amp_kills_team_0=?,
        amp_kills_team_1=?,
        amp_kills_team_2=?,
        amp_kills_team_3=? 
        WHERE id=?`;

        const vars = [
            ampKills.total,
            ampKills.red,
            ampKills.blue,
            ampKills.green,
            ampKills.yellow,
            matchId
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async createMapItemsObject(uniqueItems){

        const namesToIds = {};

        for(const [key, value] of Object.entries(uniqueItems)){
            namesToIds[key] = await this.getMapItemId(key, value)
        }

        return namesToIds;
    }

    createMapItemsLocationInsertVars(namesToIds, locationData, mapId, matchId){

        const insertVars = [];

        for(let i = 0; i < locationData.length; i++){

            const d = locationData[i];
            const itemId = namesToIds[d.className] ?? -1;
            insertVars.push([mapId, matchId, itemId, d.name, d.location.x, d.location.y, d.location.z]);
        }

        return insertVars;
    }

    async updateMapItems(uniqueItems, locationData, mapId, matchId){

        const namesToIds = await this.createMapItemsObject(uniqueItems);

        const insertVars = this.createMapItemsLocationInsertVars(namesToIds, locationData, mapId, matchId);

        const query = `INSERT INTO nstats_map_items_locations (map_id, match_id, item_id, item_name, pos_x, pos_y, pos_z) VALUES ?`;
        await mysql.bulkInsert(query, insertVars);
    }

    async createMapItemId(item, type){

        const query = `INSERT INTO nstats_map_items VALUES(NULL,?,?,"","")`;

        const result = await mysql.simpleQuery(query, [item, type]);

        return result.insertId;
    }

    async getMapItemId(item, type){

        const query = `SELECT id FROM nstats_map_items WHERE item_class=? AND item_type=?`;

        const result = await mysql.simpleQuery(query, [item, type]);

        if(result.length > 0){
            return result[0].id;
        }

        return await this.createMapItemId(item, type);
    }
}

module.exports = Items;