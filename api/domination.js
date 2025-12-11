import { bulkInsert, simpleQuery } from "./database.js";
import Message from "./message.js";
import { getBasicPlayersByIds, getPlaytimesInMatch } from "./players.js";
import { getPlayer, getTeamName } from "./generic.mjs";
import { getObjectName } from "./genericServerSide.mjs";

export default class Domination{

    constructor(){

    }

    async updateTeamScores(matchId, red, blue, green, yellow){

        const query = "UPDATE nstats_matches SET team_score_0=?,team_score_1=?,team_score_2=?,team_score_3=? WHERE id=?";
        const vars = [red, blue, green, yellow, matchId];

        return await simpleQuery(query, vars);
    }

    async controlPointExists(mapId, name){

        const query = "SELECT COUNT(*) as total_points FROM nstats_dom_control_points WHERE map=? AND name=?";
        const result = await simpleQuery(query, [mapId, name]);

        if(result[0].total_points > 0) return true;
        return false;
    }

    async createControlPoint(mapId, name, points, position){

        const query = "INSERT INTO nstats_dom_control_points VALUES(NULL,?,?,?,1,?,?,?);";
        const vars = [mapId, name, points, position.x, position.y, position.z];

        return await simpleQuery(query, vars);
    }

    async updateControlPointStats(mapId, name, points){

        const query = "UPDATE nstats_dom_control_points SET matches=matches+1, captured=captured+? WHERE map=? AND name=?";
        return await simpleQuery(query, [points, mapId, name]);
    }

    async updateMapControlPoint(mapId, name, points, position){

        try{

            if(await this.controlPointExists(mapId, name)){

                new Message(`Control point "${name}" exists for map ${mapId}.`,'pass');
                await this.updateControlPointStats(mapId, name, points);
   
            }else{
                new Message(`Control point "${name}" doesn't exist for map ${mapId}, creating now.`,'note');
                await this.createControlPoint(mapId, name, points, position);
            }

        }catch(err){
            new Message(`updateMapControlPoint ${err}`,'error');
        }   
    }


    async updateMatchControlPoint(matchId, mapId, name, points){

        const query = "INSERT INTO nstats_dom_match_control_points VALUES(NULL,?,?,?,?)";
            
        return await simpleQuery(query, [matchId, mapId, name, points]);
    }

    async updateMatchDomCaps(matchId, total){

        const query = "UPDATE nstats_matches SET dom_caps=? WHERE id=?";
        return await simpleQuery(query, [total, matchId]);        
    }



    async getMatchDomPoints(matchId){

        const query = "SELECT * FROM nstats_dom_match_control_points WHERE match_id=?";
        return await simpleQuery(query, [matchId]);
    }

    async getMapControlPoints(map){

        return await getMapControlPoints(map);
    }


    async getMatchCaps(match){

        const query = "SELECT time,player,point,team FROM nstats_dom_match_caps WHERE match_id=?";

        return await simpleQuery(query, [match]);
    }

    async getMatchPlayerScoreData(id){

        const query = "SELECT timestamp,player,score FROM nstats_dom_match_player_score WHERE match_id=? ORDER BY timestamp ASC";

        return await simpleQuery(query, [id]);
    }


    async changeCapPlayerId(oldId, newId){

        return await simpleQuery("UPDATE nstats_dom_match_caps SET player=? WHERE player=?", [newId, oldId]);
    }

    async changeScoreHistoryPlayerId(oldId, newId){

        return await simpleQuery("UPDATE nstats_dom_match_player_score SET player=? WHERE player=?", [newId, oldId]);
    }


    async deleteAllPlayerScoreHistory(playerId){

        await simpleQuery("DELETE FROM nstats_dom_match_player_score WHERE player=?", [playerId]);
    }

    async deleteAllPlayerMatchCaps(playerId){

        await simpleQuery("DELETE FROM nstats_dom_match_caps WHERE player=?", [playerId]);
    }

    async deletePlayer(playerId){

        try{

            await this.deleteAllPlayerScoreHistory(playerId);
            await this.deleteAllPlayerMatchCaps(playerId);


        }catch(err){
            console.trace(err);
        }
    }

    async getMatchesCaps(ids){

        if(ids.length === 0) return [];

        return await simpleQuery("SELECT * FROM nstats_dom_match_caps WHERE match_id IN (?)", [ids]);
    }


    async reduceCapsAlt(id, amount, matches){

        await simpleQuery("UPDATE nstats_dom_control_points SET captured=captured-?, matches=matches-? WHERE id=?",[amount, matches, id]);
    }


    async getPlayerMatchCaps(matchId, playerId){

        const query = "SELECT time,point,team FROM nstats_dom_match_caps WHERE match_id=? AND player=?";

        return await simpleQuery(query, [matchId, playerId]);
    }


    async getDuplicateControlPoints(mapId){

        const query = `SELECT MIN(id) as id,name,COUNT(*) as total_entries,SUM(captured) as captured,SUM(matches) as matches
        FROM nstats_dom_control_points WHERE map=? GROUP BY name`;

        const result = await simpleQuery(query, [mapId]);


        return result.filter((r) =>{
            return r.total_entries > 1;
        });
    }


    async setControlPointValues(rowId, captured, matches){

        const query = `UPDATE nstats_dom_control_points SET captured=?, matches=? WHERE id=?`;

        return await simpleQuery(query, [captured, matches, rowId]);
    }

    async deleteControlPointDuplicates(ignoreId, pointName, mapId){

        const query = `DELETE FROM nstats_dom_control_points WHERE map=? AND name=? AND id!=?`;

        return await simpleQuery(query, [mapId, pointName, ignoreId]);
    }

    async changeMapId(oldId, newId){

        const tables = [
            "dom_control_points",
            "dom_match_control_points",
        ];

        for(let i = 0; i < tables.length; i++){

            const t = tables[i];

            const query = `UPDATE nstats_${t} SET map=? WHERE map=?`;

            await simpleQuery(query, [newId, oldId]);
        }

        const duplicates = await this.getDuplicateControlPoints(newId);

        for(let i = 0; i < duplicates.length; i++){

            const d = duplicates[i];

            await this.setControlPointValues(d.id, d.captured, d.matches);
            await this.deleteControlPointDuplicates(d.id, d.name, newId);
        }
    }
}

export async function getMapFullControlPoints(mapId){

    const query = "SELECT name,matches,captured,x,y,z FROM nstats_dom_control_points WHERE map=?";

    return await simpleQuery(query, [mapId]);
}

export async function getControlPointNames(mapId, bSkipAllEntry){

    if(bSkipAllEntry === undefined) bSkipAllEntry = false;
    const query = "SELECT id,name FROM nstats_dom_control_points WHERE map=?";
    const result = await simpleQuery(query, [mapId]);

    result.unshift({"id": 0, "name": "All"});

    return result;
}

async function getMatchPlayerCapTotals(matchId){

    const query = "SELECT player, point, COUNT(*) as total_caps FROM nstats_dom_match_caps WHERE match_id=? GROUP BY player, point";

    return await simpleQuery(query, [matchId]);
}

async function getPointsGraphData(matchId, pointNames){

    const query = "SELECT player,point,time FROM nstats_dom_match_caps WHERE match_id=? ORDER BY time ASC";

    const result = await simpleQuery(query, [matchId]);

    return createPointGraphData(result, pointNames);
  
}

function createTeamGraphData(inputData, pointNames){

    const uniqueTeams = [...new Set(inputData.map((d) =>{
        return d.team;
    }))]

    uniqueTeams.sort();
    const teamTotals = {};

    for(let i = 0; i < pointNames.length; i++){

        const currentPoint = pointNames[i].id;

        teamTotals[currentPoint] = {};
        
        for(let x = 0; x < uniqueTeams.length; x++){

            teamTotals[currentPoint][uniqueTeams[x]] = [0];
        }
    }

    const timestamps = {
        "0": [0]
    };

    for(let i = 0; i < inputData.length; i++){

        const {team, point, time} = inputData[i];

        if(timestamps[point] === undefined) timestamps[point] = [0];

        timestamps[0].push(time);
        timestamps[point].push(time);

        updateTeamTotals(teamTotals, parseInt(point), parseInt(team));
        updateTeamTotals(teamTotals, 0, parseInt(team));
    }

    return {"labels": timestamps, "data": teamTotals};
}

function createPlayerGraphData(inputData, pointNames){

    const playerData = {};

    const playerList = [...new Set(inputData.map((p) =>{
        return p.player;
    }))];

    for(let i = 0; i < playerList.length; i++){

        //0 is all points combined
        const current = {
            "0": [0]
        };

        for(let x = 0; x < pointNames.length; x++){
            current[pointNames[x].id] = [0];
        }

        playerData[playerList[i]] = current;    
    }

    const labels = {
        "0": []
    };

    for(let i = 0; i < inputData.length; i++){

        const {player, point, time} = inputData[i];

        labels[0].push(time);

        if(labels[point] === undefined) labels[point] = [];

        labels[point].push(time);

        updatePlayerGraphData(playerData, point, player);  
        // this.updateOtherGraphData(playerData, 0, player);  
    }

    return {"data": playerData, "labels": labels};

}

function createPointGraphData(inputData, pointNames){

    const pointIndexes = [];
    const points = [];
    const timestamps = inputData.map((d) =>{
        return d.time;
    });


    for(let i = 0; i < pointNames.length; i++){

        const p = pointNames[i];
        
        pointIndexes.push(p.id);

        points.push({"name": p.name, "values": [0], "lastValue": 0});
    }

    const updateOthers = (ignore) =>{

        for(let i = 0; i < points.length; i++){

            const p = points[i];

            if(pointIndexes[i] !== ignore){

                p.values.push(p.lastValue);
            }
        }
    }

    for(let i = 0; i < inputData.length; i++){

        const d = inputData[i];

        const index = pointIndexes.indexOf(d.point);

        if(index !== -1){

            points[index].lastValue++;
            points[index].values.push(points[index].lastValue);

            updateOthers(d.point);
        }
    }

    return {"data": points, "timestamps": timestamps};
}




function updatePlayerGraphData(data, pointId, targetPlayerId){

    targetPlayerId = parseInt(targetPlayerId);

    for(const [playerId, playerData] of Object.entries(data)){

        const pointData = playerData[pointId];
        const combinedData = playerData[0];

        const previousValue = pointData[pointData.length - 1];
        const previousCombinedValue = combinedData[combinedData.length - 1];


        if(parseInt(playerId) === targetPlayerId){
            pointData.push(previousValue + 1);     
            combinedData.push(previousCombinedValue + 1);       
        }else{
            pointData.push(previousValue);   
            combinedData.push(previousCombinedValue);      
        }
    }
}

function updateTeamTotals(data, targetPointId, targetTeamId){

    const pId = parseInt(targetPointId);

    const pointData = data[pId];    

    for(const [teamId, teamData] of Object.entries(pointData)){

        const previousValue = teamData[teamData.length - 1];

        if(teamId == targetTeamId){
            teamData.push(previousValue + 1);
        }else{
            teamData.push(previousValue);
        }
    }    
}

async function getPlayerCapsGraphData(matchId, pointNames){

    const query = "SELECT player,point,time,team FROM nstats_dom_match_caps WHERE match_id=? ORDER BY time ASC";

    const result = await simpleQuery(query, [matchId]);

    const teamData = createTeamGraphData(result, pointNames);

    return {
        "playerCaps": createPlayerGraphData(result, pointNames), 
        "teamCaps": teamData
    };
    
}

async function getMatchPlayerControlPointStats(matchId){

    const query = `SELECT player_id,point_id,times_taken,time_held,
    shortest_time_held,average_time_held,max_time_held 
    FROM nstats_dom_match_player_control_points WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}


export async function getMatchDomSummary(matchId, mapId){

    const pointNames = await getControlPointNames(mapId);
    const playerPointTotals = await getMatchPlayerCapTotals(matchId);

    const pointsGraphData = await getPointsGraphData(matchId, pointNames);
    pointsGraphData.data.splice(0,1);

    const {playerCaps, teamCaps} = await getPlayerCapsGraphData(matchId, pointNames);

    const playerControlPointStats = await getMatchPlayerControlPointStats(matchId);


    
    //console.log(Object.keys(playerCaps));
    const playerIds = Object.keys(playerCaps.data);

    const playerNames = await getBasicPlayersByIds(playerIds);

    const altTest = [];
    const teamTestData = [];

    for(let i = 0; i < pointNames.length; i++){

        const {id} = pointNames[i];

        const current = [];

        for(const [playerId, playerData] of Object.entries(playerCaps.data)){

            current.push({"name": playerNames[playerId]?.name ?? "Not Found", "values": playerData[id]});
        }

        altTest.push(current);
    }   

    for(const pointData of Object.values(teamCaps.data)){

        const currentData = [];

        for(const [teamId, teamData] of Object.entries(pointData)){
            currentData.push({"name": getTeamName(teamId), "values": teamData});
        }

        teamTestData.push(currentData);
    }


    for(let i = 0; i < playerControlPointStats.length; i++){

        const p = playerControlPointStats[i];

        p.player = playerNames[p.player_id] ?? {"name": "Not Found", "country": "xx"};
    }

    

    return {
        "pointsGraph": pointsGraphData, 
        "playerTotals": playerPointTotals, 
        "playerCaps": playerCaps,
        "pointNames": pointNames,
        "newPlayerCaps": {"data": altTest, "labels": playerCaps.labels},//[]//test
        "teamCaps": {"data": teamTestData, "labels": teamCaps.labels},
        playerControlPointStats
    };
}


export async function getMatchSinglePlayerTotalCaps(matchId, playerId){

    const query = "SELECT point, COUNT(*) as total_caps FROM nstats_dom_match_caps WHERE match_id=? AND player=? GROUP BY point";
    const result =  await simpleQuery(query, [matchId, playerId]);

    if(result.length === 0) return {};

    const pointIds = [...new Set(result.map((r) =>{
        return r.point;
    }))]

    const pointNames = await getObjectName("dom_control_points", pointIds);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];
        data[r.point] = r.total_caps;
    }
    
    return {"caps": data, pointNames};
}


async function getMapControlPointIds(mapId){

    const query = `SELECT id FROM nstats_dom_control_points WHERE map=?`;

    const result = await simpleQuery(query, [mapId]);

    return result.map((r) =>{
        return r.id;
    });
}


async function updateControlPointTotals(data){

    const query = `UPDATE nstats_dom_control_points SET captured=? WHERE id=?`;

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        await simpleQuery(query, [d.total_caps, d.point]);
    }
}

async function deleteMapControlPoints(mapId){

    const query = `DELETE FROM nstats_dom_control_points WHERE map=?`;
    return await simpleQuery(query, [mapId]);
}

export async function recalculateMapControlPointTotals(mapId){

    const pointIds = await getMapControlPointIds(mapId);

    const query = `SELECT point, COUNT(*) as total_caps FROM nstats_dom_match_caps WHERE point IN (?) GROUP BY point`;

    if(pointIds.length === 0) return; 

    const result = await simpleQuery(query, [pointIds]);

    if(result.length === 0){
        
        return await deleteMapControlPoints(mapId); 
    }

    await updateControlPointTotals(result);
}


async function deleteMatchCaps(matchId){

    const query = `DELETE FROM nstats_dom_match_caps WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}


async function deleteMatchControlPoints(id){

    const query = "DELETE FROM nstats_dom_match_control_points WHERE match_id=?";

    return await simpleQuery(query, [id]);
}

async function deleteMatchPlayerScores(matchId){

    const query = `DELETE FROM nstats_dom_match_player_score WHERE match_id=?`;

    return await simpleQuery(query, [matchId]);
}

export async function deleteMatchData(matchId){

    await deleteMatchCaps(matchId);
    await deleteMatchControlPoints(matchId);
    await deleteMatchPlayerScores(matchId);
}

export async function getMapControlPoints(map){

    const query = "SELECT id,name FROM nstats_dom_control_points WHERE map=?";
    const result = await simpleQuery(query, [map]);

    const data = {};

    for(let i = 0; i < result.length; i++){
        data[result[i].name] = result[i].id;
    }
    
    return data;
}


export async function bulkInsertPlayerScoreHistory(matchId, data){

    const insertVars = [];

    const query = `INSERT INTO nstats_dom_match_player_score (match_id,timestamp,player,score) VALUES ?`;

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        insertVars.push([matchId, d.timestamp, d.player, d.score]);
    }

    return await bulkInsert(query, insertVars);
}

export async function bulkInsertControlPointCapData(matchId, data){
    
    const query = `INSERT INTO nstats_dom_match_caps (match_id,time,player,point,team) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        insertVars.push([matchId, d.timestamp, d.player, d.pointId, d.team]);
    }

    return await bulkInsert(query, insertVars);
}


export async function deletePlayerData(playerId){
    //nstats_dom_match_caps player
    //nstats_dom_match_player_score player

    const tables = ["dom_match_caps", "dom_match_player_score"];

    for(let i = 0; i < tables.length; i++){

        const t = tables[i];

        const query = `DELETE FROM nstats_${t} WHERE player=?`;
        await simpleQuery(query, [playerId]);
    }
}

export async function deletePlayerFromMatch(playerId, matchId){

     const tables = ["dom_match_caps", "dom_match_player_score"];

    for(let i = 0; i < tables.length; i++){

        const t = tables[i];

        const query = `DELETE FROM nstats_${t} WHERE player=? AND match_id=?`;
        await simpleQuery(query, [playerId, matchId]);
    }
}


export async function getUniquePlayedMatches(id){

    const query = `SELECT DISTINCT match_id FROM nstats_matches WHERE dom_caps!=0 AND gametype=?`;

    const result = await simpleQuery(query, [id]);

    return result.map((r) =>{
        return r.match_id;
    });
}

export async function getUniquePlayedMaps(id){

    const query = `SELECT DISTINCT map_id FROM nstats_matches WHERE dom_caps!=0 AND gametype=?`;

    const result = await simpleQuery(query, [id]);

    return result.map((r) =>{
        return r.map_id;
    });
}


export async function deleteGametype(id){

    const matchIds = await getUniquePlayedMatches(id);
    const mapIds = await getUniquePlayedMaps(id);

    if(matchIds.length > 0){
        await simpleQuery("DELETE FROM nstats_dom_match_caps WHERE match_id IN (?)",[matchIds]);
        await simpleQuery("DELETE FROM nstats_dom_match_control_points WHERE match_id IN (?)", [matchIds]);
        await simpleQuery("DELETE FROM nstats_dom_match_player_score WHERE match_id IN (?)", [matchIds]);
    }

    if(mapIds.length > 0){

        for(let i = 0; i < mapIds.length; i++){
            await recalculateMapControlPointTotals(mapIds[i]);
        }
    }
}


async function calculatePlayerMatchControlPointTotals(matchId){

    const query = `SELECT 
    player_id,
    SUM(times_taken) as times_taken,
    MAX(times_taken_best_life) as times_taken_best_life,
    SUM(time_held) as time_held,
    MIN(shortest_time_held) as shortest_time_held,
    MAX(max_time_held) as max_time_held
    FROM nstats_dom_match_player_control_points
    WHERE match_id=?
    GROUP BY player_id`;

    const result = await simpleQuery(query, [matchId]);

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        r.avg_time_held = 0;

        if(r.time_held > 0 && r.times_taken > 0){
            r.avg_time_held = r.time_held / r.times_taken;
        }
    }

    return result;
}


async function bulkInsertMatchTotals(matchId, mapId, gametypeId, matchTotals, playtimes){

    const query = `INSERT INTO nstats_dom_match_player (
    match_id, map_id, gametype_id, player_id, playtime,
    times_taken, times_taken_best_life, time_held,
    shortest_time_held, average_time_held, max_time_held
    ) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < matchTotals.length; i++){

        const d = matchTotals[i];

        insertVars.push([
            matchId, mapId, gametypeId, d.player_id, playtimes[d.player_id] ?? 0,
            d.times_taken, d.times_taken_best_life, d.time_held,
            d.shortest_time_held, d.avg_time_held, d.max_time_held
        ]);
    }


    //console.log(insertVars);
    await bulkInsert(query, insertVars);
}

export async function bulkInsertPlayerMatchStats(gametypeId, mapId, matchId, playerControlPoints, pointIds){

    const insertVars = [];

    for(const [playerId, playerData]  of Object.entries(playerControlPoints)){

        for(const [pointName, data] of Object.entries(playerData)){

            const pointId = pointIds[pointName] ?? -1;

            insertVars.push([
                matchId, mapId, gametypeId, playerId, pointId,
                data.timesTaken, data.capsBestLife, data.totalTimeHeld, data.minTimeHeld,
                data.averageTimeHeld, data.maxTimeHeld
            ]);
        }
    }

    const query = `INSERT INTO nstats_dom_match_player_control_points (
    match_id, map_id, gametype_id, player_id, point_id, 
    times_taken, times_taken_best_life, time_held, shortest_time_held, average_time_held, max_time_held) VALUES ?`;

    await bulkInsert(query, insertVars);

    const matchTotals = await calculatePlayerMatchControlPointTotals(matchId);

    const playtimes = await getPlaytimesInMatch(matchId, Object.keys(playerControlPoints));

    await bulkInsertMatchTotals(matchId, mapId, gametypeId, matchTotals, playtimes);
}