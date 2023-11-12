const Message = require("./message");
const mysql = require("./database");

class WinRate{

    constructor(){}

    async createPlayerLatest(playerId, gametypeId, mapId, matchResult, matchDate, matchId){

        const query = `INSERT INTO nstats_winrates_latest VALUES(
            NULL,?,?,?,?,?,
            1,?,?,?,?,
            ?,?,?,
            ?,?,?
        )`;

        const wins = (matchResult === 1) ? 1 : 0;
        const draws = (matchResult === 2) ? 1 : 0;
        const losses = (matchResult === 0) ? 1 : 0;

        const winrate = (matchResult === 1) ? 100 : 0;

        const vars = [
            matchDate, matchId, playerId, gametypeId, mapId,
            wins, draws, losses, winrate,
            wins, draws, losses,
            wins, draws, losses
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async deletePlayerLatest(playerId, gametypeId, mapId){

        const query = `DELETE FROM nstats_winrates_latest WHERE player=? AND gametype=? AND map=?`;

        return await mysql.simpleQuery(query, [playerId, gametypeId, mapId]);
    }

    async createPlayerLatestFromRecalculation(playerId, gametype, map, data){

        //lazy way to prevent duplicate data
        await this.deletePlayerLatest(playerId, gametype, map);

        const query = `INSERT INTO nstats_winrates_latest VALUES(
            NULL,?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,
            ?,?,?
        )`;

        const vars = [
            data.date,
            data.match_id,
            playerId,
            gametype,
            map,
            data.matches,
            data.wins,
            data.draws,
            data.losses,
            data.winrate,
            data.current_win_streak,
            data.current_draw_streak,
            data.current_lose_streak,
            data.max_win_streak,
            data.max_draw_streak,
            data.max_lose_streak
        ];

        return await mysql.simpleQuery(query, vars);
    }

    async updatePlayerLatest(playerId, gametypeId, mapId, matchResult, matchDate, matchId){

        const query = `UPDATE nstats_winrates_latest SET
        date=?, match_id=?,
        matches=matches+1,
        wins = IF(? = 1, wins + 1, wins),
        draws = IF(? = 2, draws + 1, draws),
        losses = IF(? = 0, losses + 1, losses),
        winrate = IF(wins > 0, (wins / matches) * 100, 0),
        current_win_streak = IF(? = 1, current_win_streak + 1, 0),
        current_draw_streak = IF(? = 2, current_draw_streak + 1, 0),
        current_lose_streak = IF(? = 0, current_lose_streak + 1, 0),
        max_win_streak = IF(current_win_streak > max_win_streak, current_win_streak, max_win_streak),
        max_draw_streak = IF(current_draw_streak > max_draw_streak, current_draw_streak, max_draw_streak),
        max_lose_streak = IF(current_lose_streak > max_lose_streak, current_lose_streak, max_lose_streak)
        WHERE player=? AND gametype=? AND map=?`;

        const vars = [
            matchDate, matchId,
            matchResult,
            matchResult,
            matchResult,
            matchResult,
            matchResult,
            matchResult,
            playerId, gametypeId, mapId];

        const result = await mysql.simpleQuery(query, vars);

        if(result.affectedRows === 0){
            await this.createPlayerLatest(playerId, gametypeId, mapId, matchResult, matchDate, matchId);
        }

        await this.insertHistory(playerId, gametypeId, mapId, matchResult, matchDate, matchId);

    }


    async getPlayerLatest(playerId, gametypeId, mapId){

        const query = `SELECT matches,wins,draws,losses,winrate,current_win_streak,
        current_draw_streak,current_lose_streak,max_win_streak,max_draw_streak,max_lose_streak
        FROM nstats_winrates_latest WHERE player=? AND gametype=? AND map=?`;

        const result = await mysql.simpleQuery(query, [playerId, gametypeId, mapId]);

        if(result.length > 0) return result[0];

        return null;
    }


    async insertHistory(playerId, gametypeId, mapId, matchResult, matchDate, matchId){

        const latestData = await this.getPlayerLatest(playerId, gametypeId, mapId);

        if(latestData === null){

            new Message(`winrate.insertHistory() latest is null`, "error");
            return;
        }

        const query = `INSERT INTO nstats_winrates VALUES(NULL,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,
            ?,?,?    
        )`;

        const vars = [
            matchDate, matchId, playerId, gametypeId, mapId,
            matchResult, latestData.matches, latestData.wins, latestData.draws, latestData.losses,
            latestData.winrate, latestData.current_win_streak, latestData.current_draw_streak, latestData.current_lose_streak,
            latestData.max_win_streak, latestData.max_draw_streak, latestData.max_lose_streak
        ];

        await mysql.simpleQuery(query, vars);
    }

    async bNeedToRecalulate(date){

        const query = `SELECT date FROM nstats_winrates_latest ORDER BY date DESC LIMIT 1`;

        const result = await mysql.simpleQuery(query);

        if(result.length === 0) return false;

        return result[0].date > date;
    }

    createBlankHistoryObject(){

        return {
            "matches": 0,
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "winrate": 0,
            "current_win_streak": 0,
            "current_draw_streak": 0,
            "current_lose_streak": 0,
            "max_win_streak": 0,
            "max_draw_streak": 0,
            "max_lose_streak": 0,
            "date": 0,
            "match_result": 0,
            "match_id": 0
        };
    }


    updateHistoryObject(data, gametype, map, matchId, matchDate, matchResult){

        let currentIndex = -1;

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(d.gametype === gametype && d.map === map){
                currentIndex = i;
                break;
            }   
        }

        if(currentIndex === -1){

            data.push({
                "gametype": gametype, 
                "map": map, 
                "data": this.createBlankHistoryObject(),
                "history": []
            });
            currentIndex = data.length - 1;
        }

        const current = data[currentIndex].data;

        current.match_result = matchResult;
        current.match_id = matchId;
        current.date = matchDate;

        current.matches++;

        if(matchResult === 0){

            current.current_win_streak = 0;
            current.current_draw_streak = 0;
            current.current_lose_streak++;
            current.losses++;

        }else if(matchResult === 1){

            current.current_win_streak++;
            current.current_draw_streak = 0;
            current.current_lose_streak = 0;
            current.wins++;

        }else if(matchResult === 2){

            current.current_win_streak = 0;
            current.current_draw_streak++;
            current.current_lose_streak = 0;
            current.draws++;
        }

        if(current.current_win_streak > current.max_win_streak) current.max_win_streak = current.current_win_streak;
        if(current.current_draw_streak > current.max_draw_streak) current.max_draw_streak = current.current_draw_streak;
        if(current.current_lose_streak > current.max_lose_streak) current.max_lose_streak = current.current_lose_streak;

        let winrate = 0;

        if(current.wins > 0){

            winrate = (current.wins / current.matches) * 100;
        }

        current.winrate = winrate;

        data[currentIndex].history.push(Object.assign({}, current));
    }

    async deletePlayerHistory(playerId, gametypeId, mapId){

        const query = "DELETE FROM nstats_winrates WHERE player=? AND gametype=? AND map=?";
        return await mysql.simpleQuery(query, [playerId, gametypeId, mapId]);
    }

    /**
     * 
     * @param {*} data 
     * @param {*} playerId 
     * @param {*} gametypeId 
     * @param {*} mapId 
     * @param {*} bSkipAllTime Set to true if you want to only effect gametype and gametype + map totals
     */
    async bulkInsertPlayerHistory(data, playerId, gametypeId, mapId, bSkipAllTime){

        //console.log(data);

        if(bSkipAllTime === undefined) bSkipAllTime = false;

        const query = `INSERT INTO nstats_winrates (
        date, match_id, player, gametype, map, 
        match_result, matches, wins, draws, losses, 
        winrate, current_win_streak, current_draw_streak, current_lose_streak, max_win_streak, 
        max_draw_streak, max_lose_streak) VALUES ?`;


        const historyInsertVars = [];

        console.log("**************************************************************");
        console.log(data);

        for(let i = 0; i < data.length; i++){

            const d = data[i];
           // console.log(d.history);
            const gametype = d.gametype;
            const map = d.map;

            for(let x = 0; x < d.history.length; x++){

                const match = d.history[x];

                historyInsertVars.push([
                    match.date,
                    match.match_id,
                    playerId,
                    gametype,
                    map,
                    match.match_result,
                    match.matches,
                    match.wins,
                    match.draws,
                    match.losses,
                    match.winrate,
                    match.current_win_streak,
                    match.current_draw_streak,
                    match.current_lose_streak,
                    match.max_win_streak,
                    match.max_draw_streak,
                    match.max_lose_streak
                ]);
            }  
        }

        if(!bSkipAllTime){
            //all time
            await this.deletePlayerHistory(playerId, 0, 0);
            //map total
            await this.deletePlayerHistory(playerId, 0, mapId);
        }

        //gametype total
        await this.deletePlayerHistory(playerId, gametypeId, 0);
        
        //map + gametype
        await this.deletePlayerHistory(playerId, gametypeId, mapId);

        //console.log(historyInsertVars);

        await mysql.bulkInsert(query, historyInsertVars);
    }

    async recaluatePlayerHistory(playerId, gametypeIds, mapIds){


        let query = `SELECT date,match_id,match_result,gametype,map FROM nstats_winrates WHERE player=? AND gametype IN (?) AND map IN (?) ORDER BY date ASC`;

        let vars = [playerId, gametypeIds, mapIds]

        if(gametypeIds === undefined && mapIds === undefined){
            query = `SELECT date,match_id,match_result,gametype,map FROM nstats_winrates WHERE player=? ORDER BY date ASC`;
            vars = [playerId];
        }

        const result = await mysql.simpleQuery(query, vars);

        const history = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            this.updateHistoryObject(history, r.gametype, r.map, r.match_id, r.date, r.match_result);

        }
        
        //skip this step when recalculating all player gametypes/maps, gametypeIds/mapIds[0] is always gametype 0
        if(gametypeIds !== undefined && mapIds !== undefined){
            await this.bulkInsertPlayerHistory(history, playerId, gametypeIds[1], mapIds[1]);
        }


        //update player latest table

        for(let i = 0; i < history.length; i++){

            const h = history[i];

            const gametype = h.gametype;
            const map = h.map;

            await this.createPlayerLatestFromRecalculation(playerId, gametype, map, h.data);
        }
    }


    async getAllPlayerCurrent(playerId){

        const query = `SELECT date,match_id,gametype,map,matches,wins,draws,losses,winrate,current_win_streak,
        current_draw_streak,current_lose_streak,max_win_streak,max_draw_streak,max_lose_streak 
        FROM nstats_winrates_latest WHERE player=?`;

        return await mysql.simpleQuery(query, [playerId]);
    }


    async deleteMatchData(id){


        await mysql.simpleDelete("DELETE FROM nstats_winrates WHERE match_id=?", [id]);
        await mysql.simpleDelete("DELETE FROM nstats_winrates_latest WHERE match_id=?", [id]);
     
    }

    async deletePlayer(playerId){
        await mysql.simpleQuery("DELETE FROM nstats_winrates WHERE player=?", [playerId]);
        await mysql.simpleQuery("DELETE FROM nstats_winrates_latest WHERE player=?", [playerId]);
    }


    //get match date, gametype, map, winner/loss/draw
    async getPlayerMatchResultsFromMatchTable(playerId){

        const query = `SELECT match_id,match_date,map_id,gametype,winner,draw FROM nstats_player_matches WHERE player_id=? AND playtime>0 ORDER BY match_date ASC`;
        return await mysql.simpleQuery(query, [playerId]);
    }
    
    async recalculatePlayerHistoryAfterMerge(playerId){

        const history = await this.getPlayerMatchResultsFromMatchTable(playerId);

        const uniqueMaps = new Set();
        const uniqueGametypes = new Set();

        const data = [];

        for(let i = 0; i < history.length; i++){

            const h = history[i];

            uniqueMaps.add(h.map_id);
            uniqueGametypes.add(h.gametype);

            const currentMatchResult = this.createMatchResult(h.winner, h.draw);

            //0 loss, 1 win, 2 draw
            //..if(h.winner === 0 && h.draw === 0) currentMatchResult = 0;
            //if(h.winner === 0 && h.draw === 1) currentMatchResult = 2;
           // if(h.winner === 1) currentMatchResult = 1;

            //map +  gametype
            this.updateHistoryObject(data, h.gametype, h.map_id, h.match_id, h.match_date, currentMatchResult);
            //map total
            this.updateHistoryObject(data, 0, h.map_id, h.match_id, h.match_date, currentMatchResult);
            //gametype total
            this.updateHistoryObject(data, h.gametype, 0, h.match_id, h.match_date, currentMatchResult);
            //all time
            this.updateHistoryObject(data, 0, 0, h.match_id, h.match_date, currentMatchResult);

        }

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const gametype = d.gametype;
            const map = d.map;

            await this.createPlayerLatestFromRecalculation(playerId, gametype, map, d.data);
        }

        //await this.recaluatePlayerHistory(playerId);
    }

    async changeGametypeId(oldId, newId){

        await mysql.simpleUpdate("UPDATE nstats_winrates SET gametype=? WHERE gametype=?", [newId, oldId]);
        await mysql.simpleUpdate("UPDATE nstats_winrates_latest SET gametype=? WHERE gametype=?", [newId, oldId]);
    }


    async getAllGametypeHistory(gametypeId){

        const query = `SELECT * FROM nstats_winrates WHERE gametype=? ORDER BY date ASC`;

        return await mysql.simpleQuery(query, [gametypeId]);
    }

    async getGametypeResultsFromMatchesTable(gametypeId){

        const query = `SELECT match_date,match_id,map_id,gametype,winner,draw,player_id FROM nstats_player_matches 
        WHERE gametype=? AND playtime>0 ORDER BY match_date ASC`;


        return await mysql.simpleQuery(query, [gametypeId]);
    }

    async recalculateGametype(gametypeId){

        //const history = await this.getAllGametypeHistory(gametypeId);

        const data = await this.getGametypeResultsFromMatchesTable(gametypeId);

        //updateHistoryObject(data, gametype, map, matchId, matchDate, matchResult)

        //0 = loss, 1 = win, 2 = draw

        const playerHistory = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(playerHistory[d.player_id] === undefined){
                playerHistory[d.player_id] = [];
            }

            let matchResult = 0;

            if(d.winner) matchResult = 1;
            if(!d.winner && d.draw) matchResult = 2;

            //we only want to change for this selected gametype, it won't effect all time totals, and map all time totals

            //map & gametype totals
            this.updateHistoryObject(playerHistory[d.player_id], d.gametype, d.map_id, d.match_id, d.match_date, matchResult);
            //gametype totals
            this.updateHistoryObject(playerHistory[d.player_id], d.gametype, 0, d.match_id, d.match_date, matchResult);

        }

        for(const [playerId, playerData] of Object.entries(playerHistory)){

            for(let i = 0; i < playerData.length; i++){

                const currentGametype = playerData[i].gametype;
                const map = playerData[i].map;
               // const history = playerData[i].history;
                const currentStats = playerData[i].data;

                await this.bulkInsertPlayerHistory(playerData[i], playerId, currentGametype, map, true);

                await this.createPlayerLatestFromRecalculation(playerId, currentGametype, map, currentStats);
            }
        }     
    }

    async deleteGametypeLatest(id){

        await mysql.simpleDelete("DELETE FROM nstats_winrates_latest WHERE gametype=?", [id]);
    }

    async deleteMatchesQuery(ids){

        if(ids.length === 0) return;

        await mysql.simpleDelete("DELETE FROM nstats_winrates WHERE match_id IN (?)", [ids]);
    }

    async deleteMatches(matchIds, gametypeId){

        try{

            await this.deleteGametypeLatest(gametypeId);
            await this.deleteMatchesQuery(matchIds);

            await this.recalculateGametype(0);
            
        }catch(err){
            console.trace(err);
        }
    }


    async getAllPlayedGametypeIds(){

        const query = `SELECT DISTINCT gametype FROM nstats_winrates`;

        const result = await mysql.simpleQuery(query);

        return result.map((r) =>{
            return r.gametype;
        });
    }


    /**
     * 0 = loss, 1 = win, 2 = draw
     */
    createMatchResult(bWin, bDraw){

        if(bWin) return 1;
        if(!bWin && !bDraw) return 0;
        if(bDraw) return 2;

        return -1;
    }

    async bulkInsertPlayerMapHistory(data, playerId, mapId){


        const query = `INSERT INTO nstats_winrates (
        date, match_id, player, gametype, map, 
        match_result, matches, wins, draws, losses, 
        winrate, current_win_streak, current_draw_streak, current_lose_streak, max_win_streak, 
        max_draw_streak, max_lose_streak) VALUES ?`;


        const historyInsertVars = [];

        console.log("**************************************************************");
        console.log(data);

        const gametypesToDelete = [];

        for(let i = 0; i < data.length; i++){

            const d = data[i];
           // console.log(d.history);
            const gametype = d.gametype;
            const map = d.map;

            gametypesToDelete.push(gametype);

            for(let x = 0; x < d.history.length; x++){

                const match = d.history[x];

                historyInsertVars.push([
                    match.date,
                    match.match_id,
                    playerId,
                    gametype,
                    map,
                    match.match_result,
                    match.matches,
                    match.wins,
                    match.draws,
                    match.losses,
                    match.winrate,
                    match.current_win_streak,
                    match.current_draw_streak,
                    match.current_lose_streak,
                    match.max_win_streak,
                    match.max_draw_streak,
                    match.max_lose_streak
                ]);
            }  
        }

        for(let i = 0; i < gametypesToDelete.length; i++){

            console.log("NEED TO DELETE PLAYER HISTORY FOR ");
            //await this.deletePlayerHistory(playerId, gametypesToDelete[i], mapId);
        }
        //map totals 
        await this.deletePlayerHistory(playerId, 0, mapId);

        //console.log(historyInsertVars);

        await mysql.bulkInsert(query, historyInsertVars);
    }

    async recalculateMapHistory(mapId){

        const getQuery = `SELECT * FROM nstats_winrates WHERE map=?`;

        const result = await mysql.simpleQuery(getQuery, [mapId]);

        const playerHistory = {};

        for(let i = 0; i < result.length; i++){

            const r = result[i];
            console.log(r);

            if(playerHistory[r.player] === undefined) playerHistory[r.player] = [];

            this.updateHistoryObject(playerHistory[r.player], r.gametype, r.map, r.date, r.match_result);
        }

        //console.log(playerHistory);

        for(const [playerId, playerData] of Object.entries(playerHistory)){

            console.log("playerData");
            console.log(playerData);

            await this.bulkInsertPlayerMapHistory(playerData, playerId, mapId);
            //loop though gametypes
            //for(let i = 0; i < playerData.length; i++){
                //console.log(playerData);
                //


                //CANT USE THIS METHOD MUST CREATE A NEW ONE TO SKIP GAMETYPE STUFF
              //  await this.bulkInsertPlayerHistory(playerData, playerId, playerData[i].gametype, playerData[i].map, true);
            //}
        }

        //delete old data


        //insert new rows

    }

    async changeMapId(oldId, newId){

        const query = `UPDATE nstats_winrates SET map=? WHERE map=?`;

        await mysql.simpleQuery(query, [newId, oldId]);

        //need to recalculate map winrates for newId
        //need to recalculate map winrates for newId
        //need to recalculate map winrates for newId

        //im dumb this isn't even needed
        /*const gametypeIds = await this.getAllPlayedGametypeIds();

        //console.log(gametypeIds);

        
        for(let i = 0; i < gametypeIds.length; i++){

            const g = gametypeIds[i];

            //don't recalculate all time totals as they wont change anyway
            if(g === 0) continue;

            new Message(`Recalculating winrates for gametype id ${g}`,"note");
            await this.recalculateGametype(g);
        }*/
    }
}

module.exports = WinRate;