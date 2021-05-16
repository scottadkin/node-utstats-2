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

            const query = "INSERT INTO nstats_items VALUES(NULL,?,?,?,?,1,0)";

            mysql.query(query, [name, date, date, uses], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    update(name, uses, date){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_items SET uses=uses+?,
            first = IF(? < first, ?, first),
            last = IF(? > last, ?, last),
            matches=matches+1
            WHERE name=?`;

            mysql.query(query, [uses, date, date, date, date, name], (err) =>{
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

    getNamesByIds(ids){

        return new Promise((resolve, reject) =>{

            if(ids.length === 0) resolve([]);

            const query = "SELECT id,name,type FROM nstats_items WHERE id IN(?) ORDER BY name ASC";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });

        });
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

    getMatchData(matchId){

        return new Promise((resolve, reject) =>{

            const query = "SELECT player_id,item,uses FROM nstats_items_match WHERE match_id =?";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });
        });
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


    setPlayerMatchPickups(matchId, player, data){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_matches SET 
            shield_belt=?,amp=?,amp_time=?,invisibility=?,invisibility_time=?,pads=?,armor=?,boots=?,super_health=?
            WHERE match_id=? AND player_id=?`;

            const vars = [
                (data.belt !== undefined) ? data.belt : 0,
                (data.amp !== undefined) ? data.amp : 0,
                (data.ampTime !== undefined) ? data.ampTime : 0,
                (data.invis !== undefined) ? data.invis : 0,
                (data.invisTime !== undefined) ? data.invisTime : 0,
                (data.pads !== undefined) ? data.pads : 0,
                (data.armor !== undefined) ? data.armor : 0,
                (data.boots !== undefined) ? data.boots : 0,
                (data.super !== undefined) ? data.super : 0,
                matchId,
                player
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlayerBasicPickupData(player, data){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET 
            shield_belt=shield_belt+?,amp=amp+?,amp_time=amp_time+?,invisibility=invisibility+?,invisibility_time=invisibility_time+?,
            pads=pads+?,armor=armor+?,boots=boots+?,super_health=super_health+? WHERE id=?`;

            const vars = [
                (data.belt !== undefined) ? data.belt : 0,
                (data.amp !== undefined) ? data.amp : 0,
                (data.ampTime !== undefined) ? data.ampTime : 0,
                (data.invis !== undefined) ? data.invis : 0,
                (data.invisTime !== undefined) ? data.invisTime : 0,
                (data.pads !== undefined) ? data.pads : 0,
                (data.armor !== undefined) ? data.armor : 0,
                (data.boots !== undefined) ? data.boots : 0,
                (data.super !== undefined) ? data.super : 0,
                player
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    reduceItemTotal(id, amount){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_items SET uses=uses-?, matches=matches-1 WHERE id=?";

            mysql.query(query, [amount, id], (err) =>{

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

            let m = 0;

            for(let i = 0; i < matchData.length; i++){

                m = matchData[i];

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

            mysql.query(query, [uses, item], (err, result) =>{

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
}

module.exports = Items;