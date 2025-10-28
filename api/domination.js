import { simpleQuery } from "./database.js";
import Message from "./message.js";
import { getBasicPlayersByIds } from "./players.js";
import { getTeamName } from "./generic.mjs";
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

    async updatePlayerCapTotals(masterId, gametypeId, caps){


        const query = `UPDATE nstats_player_totals SET dom_caps=dom_caps+?,
        dom_caps_best = IF(dom_caps_best < ?, ?, dom_caps_best)
        WHERE id IN(?,?)`;

        return await simpleQuery(query, [caps, caps, caps, masterId, gametypeId]);
        
    }

    async updatePlayerMatchStats(rowId, caps){

        const query = "UPDATE nstats_player_matches SET dom_caps=? WHERE id=?";
        return await simpleQuery(query, [caps, rowId]);
    }


    async getMatchDomPoints(matchId){

        const query = "SELECT * FROM nstats_dom_match_control_points WHERE match_id=?";
        return await simpleQuery(query, [matchId]);
    }

    async getMapControlPoints(map){

        return await getMapControlPoints(map);
    }

    async insertPointCap(match, time, player, point, team){

        const query = "INSERT INTO nstats_dom_match_caps VALUES(NULL,?,?,?,?,?)";

        return await simpleQuery(query, [match, time, player, point, team]);
    }

    async getMatchCaps(match){

        const query = "SELECT time,player,point,team FROM nstats_dom_match_caps WHERE match_id=?";

        return await simpleQuery(query, [match]);
    }


    async insertMatchPlayerScore(match, timestamp, player, score){

        const query = "INSERT INTO nstats_dom_match_player_score VALUES(NULL,?,?,?,?)";

        return await simpleQuery(query, [match, timestamp, player, score]);
    }


    async getMatchPlayerScoreData(id){

        const query = "SELECT timestamp,player,score FROM nstats_dom_match_player_score WHERE match_id=? ORDER BY timestamp ASC";

        return await simpleQuery(query, [id]);
    }

    async updatePlayerBestLifeCaps(gametypeId, masterId, caps){

        const query = `UPDATE nstats_player_totals SET 
        dom_caps_best_life = IF(dom_caps_best_life < ?, ?, dom_caps_best_life)
        WHERE id IN(?,?)`;

        return await simpleQuery(query, [caps, caps, gametypeId, masterId]);
    }

    async updateMatchBestLifeCaps(playerId, matchId, caps){

        const query = `UPDATE nstats_player_matches SET 
        dom_caps_best_life = IF(dom_caps_best_life < ?, ?, dom_caps_best_life)
        WHERE player_id=? AND match_id=?`;

        return await simpleQuery(query, [caps, caps, playerId, matchId]);
    }


    async removePlayerMatchCaps(playerId, matchId){

        const query = "UPDATE nstats_dom_match_caps SET player=-1 WHERE player=? AND match_id=?";

        return await simpleQuery(query, [playerId, matchId]);
    }


    async deletePlayerMatchScore(playerId, matchId){

        return await simpleQuery("DELETE FROM nstats_dom_match_player_score WHERE player=? AND match_id=?",
        [playerId, matchId]);
    }



    async deletePlayerFromMatch(playerId, matchId){

        try{

            await this.removePlayerMatchCaps(playerId, matchId);

            await this.deletePlayerMatchScore(playerId, matchId);

        }catch(err){
            console.trace(err);
        }
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

    async deleteMatchesCaps(ids){

        if(ids.length === 0) return;
        await simpleQuery("DELETE FROM nstats_dom_match_caps WHERE match_id IN (?)",[ids]);
    }

    async deleteMatchesControlPoints(ids){

        if(ids.length === 0) return;

        await simpleQuery("DELETE FROM nstats_dom_match_control_points WHERE match_id IN (?)", [ids]);
    }

    async deleteMatchesPlayerScores(ids){

        if(ids.length === 0) return;

        await simpleQuery("DELETE FROM nstats_dom_match_player_score WHERE match_id IN (?)", [ids]);
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

export async function getMatchDomSummary(matchId, mapId){

    const pointNames = await getControlPointNames(mapId);
    const playerPointTotals = await getMatchPlayerCapTotals(matchId);

    const pointsGraphData = await getPointsGraphData(matchId, pointNames);
    pointsGraphData.data.splice(0,1);

    const {playerCaps, teamCaps} = await getPlayerCapsGraphData(matchId, pointNames);




        

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

    

    return {
        "pointsGraph": pointsGraphData, 
        "playerTotals": playerPointTotals, 
        "playerCaps": playerCaps,
        "pointNames": pointNames,
        "newPlayerCaps": {"data": altTest, "labels": playerCaps.labels},//[]//test
        "teamCaps": {"data": teamTestData, "labels": teamCaps.labels}
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


export async function recalculateMapControlPointTotals(mapId){

    const pointIds = await getMapControlPointIds(mapId);

    const query = `SELECT point, COUNT(*) as total_caps FROM nstats_dom_match_caps WHERE point IN (?) GROUP BY point`;


    if(pointIds.length === 0) return;
    const result = await simpleQuery(query, [pointIds]);

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

    const data = new Map();

    for(let i = 0; i < result.length; i++){
        data.set(result[i].name, result[i].id);
    }
    
    return data;
}