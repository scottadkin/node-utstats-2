import { simpleQuery, bulkInsert } from "./database.js";
import { reduceGraphDataPoints, getTeamName, getPlayerFromMatchData } from "./generic.mjs";

export default class Kills{

    constructor(){}

    async insert(matchId, timestamp, killer, killerTeam, victim, victimTeam, killerWeapon, victimWeapon, distance){

        const query = "INSERT INTO nstats_kills VALUES(NULL,?,?,?,?,?,?,?,?,?)";

        const vars = [matchId, timestamp, killer, killerTeam, victim, victimTeam, killerWeapon, victimWeapon, distance];

        return await simpleQuery(query, vars);
    }

    async insertMultipleKills(vars){

        const query = `INSERT INTO nstats_kills (
            match_id,timestamp,killer,killer_team,victim,victim_team,killer_weapon,victim_weapon,distance,
            killer_x, killer_y, killer_z,
            victim_x, victim_y, victim_z
            ) VALUES ?`;

        await bulkInsert(query, vars);
    }

    async getMatchData(id){

        const query = "SELECT timestamp,killer,killer_team,victim,victim_team FROM nstats_kills WHERE match_id=? ORDER BY timestamp ASC";

        return await simpleQuery(query, [id]);
    }

    async deletePlayerMatchData(playerId, matchId){

        const query = "DELETE FROM nstats_kills WHERE (killer=? AND match_id=?) OR (victim=? AND match_id=?)";

        return await simpleQuery(query, [playerId, matchId, playerId, matchId]);
    }

    async changePlayerIds(oldId, newId){

        await simpleQuery("UPDATE nstats_kills SET killer=? WHERE killer=?", [newId, oldId]);
        await simpleQuery("UPDATE nstats_kills SET victim=? WHERE victim=?", [newId, oldId]);
        await simpleQuery("UPDATE nstats_tele_frags SET killer_id=? WHERE killer_id=?", [newId, oldId]);
        await simpleQuery("UPDATE nstats_tele_frags SET victim_id=? WHERE victim_id=?", [newId, oldId]);
        
    }

    async deletePlayer(player){

        await simpleQuery("DELETE FROM nstats_kills WHERE (killer = ?) OR (victim = ?)", [player, player]);
        await simpleQuery("DELETE FROM nstats_tele_frags WHERE (killer_id = ?) OR (victim_id = ?)", [player, player]);
    }

    async deleteMatches(ids){

        if(ids.length === 0) return;

        await simpleQuery("DELETE FROM nstats_kills WHERE match_id IN (?)", [ids]);
    }

    async getMatchKillsIncludingPlayer(matchId, playerId){

        const query = `SELECT timestamp,killer,killer_team,victim,victim_team,killer_weapon,victim_weapon,distance
        FROM nstats_kills WHERE match_id=? AND (killer=? OR victim=?) ORDER BY timestamp ASC`;

        return await simpleQuery(query, [matchId, playerId, playerId]);
    }


    async getMatchKillsBetween(matchId, start, end){

        const query = `SELECT killer,killer_team,COUNT(*) as total_kills 
        FROM nstats_kills 
        WHERE match_id=? AND timestamp >= ? AND timestamp <= ?
        GROUP BY killer`;

        return await simpleQuery(query, [matchId, start, end]);
    }

    async insertTeleFrag(matchId, mapId, gametypeId, data){

        const query = `INSERT INTO nstats_tele_frags VALUES(NULL,?,?,?,?,?,?,?,?,?)`;

        const vars = [
            matchId,
            mapId, 
            gametypeId,
            data.timestamp,
            data.killerId,
            data.killerTeam,
            data.victimId,
            data.victimTeam,
            data.bDiscKill
        ];

        return await simpleQuery(query, vars);
    }

    async bulkInsertTeleFrags(matchId, mapId, gametypeId, teleFrags){

        const query = `INSERT INTO nstats_tele_frags (match_id, map_id, gametype_id, timestamp, killer_id, killer_team, victim_id, victim_team, disc_kill) VALUES ?`;
        const insertVars = [];

        for(let i = 0; i < teleFrags.length; i++){

            const t = teleFrags[i];

            insertVars.push(
                [
                    matchId, mapId, gametypeId, 
                    t.timestamp, t.killerId, t.killerTeam,
                    t.victimId, t.victimTeam,
                    t.bDiscKill
                ]
            );
        }

        return await bulkInsert(query, insertVars);
    }

    async insertTeleFrags(matchId, mapId, gametypeId, teleFrags){
        
        await this.bulkInsertTeleFrags(matchId, mapId, gametypeId, teleFrags);
    }


    async getInteractiveMapData(matchId){

        const query = `SELECT timestamp,killer,killer_team,victim,victim_team,killer_weapon,victim_weapon,distance,
        killer_x,killer_y,killer_z,victim_x,victim_y,victim_z FROM nstats_kills WHERE match_id=? ORDER BY timestamp ASC`;

        return await simpleQuery(query, [matchId]);
    }
}

function createGraphDataType(indexes, names, bPlayers){

    const data = [];

    for(let i = 0; i < indexes.length; i++){

        const index = indexes[i];

        let name = names[index];

        if(bPlayers){
            const p = getPlayerFromMatchData(names, index);
            name = p.name;
        }

        data.push({"name": name, "data": [0]});
    }

    return data;  
}

function updateOthersGraphData(data, ignoreIndexes){

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(ignoreIndexes.indexOf(i) !== -1) continue;

        const previousValue = d.data[d.data.length - 1];
        d.data.push(previousValue);
    }

    return data;
}

function updateGraphData(data, index, newValue, bSkipUpdatedOthers){

    if(bSkipUpdatedOthers === undefined) bSkipUpdatedOthers = false;

    if(typeof newValue !== "string"){

        data[index].data.push(newValue);

    }else{

        const previousValue = data[index].data[data[index].data.length - 1];
        data[index].data.push(previousValue + 1);
    }

    if(!bSkipUpdatedOthers){
        updateOthersGraphData(data, [index]);
    }
}

function getCurrentGraphDataValue(data, index){
    
    return data[index].data[data[index].data.length - 1];
}

function calculateEfficiency(kills, deaths){

    if(kills > 0){

        if(deaths > 0){
            return parseFloat(((kills / (deaths + kills)) * 100).toFixed(2));
        }

        return 100;
    }

    return 0;
}

function createGraphData(data, players, totalTeams){

    //const playerIndexes = Object.keys(players).map((playerId) => parseInt(playerId));
    const playerIndexes = players.map((p) =>{
        return p.player_id;
    });


    const teamIndexes = [];

    const teams = [];

    for(let i = 0; i < totalTeams; i++){

        teams.push(getTeamName(i));
        teamIndexes.push(i);
    }

    const kills = createGraphDataType(playerIndexes, players, true);
    const deaths = createGraphDataType(playerIndexes, players, true);
    const suicides = createGraphDataType(playerIndexes, players, true);
    const teamKills = createGraphDataType(playerIndexes, players, true);
    const efficiency = createGraphDataType(playerIndexes, players, true);

    const teamTotalKills = createGraphDataType(teamIndexes, teams, false);
    const teamTotalDeaths = createGraphDataType(teamIndexes, teams, false);
    const teamTotalSuicides = createGraphDataType(teamIndexes, teams, false);
    const teamTotalTeamKills = createGraphDataType(teamIndexes, teams, false);
    const teamEfficiency = createGraphDataType(teamIndexes, teams, false);


    const timestamps = {
        "all": [],
        "kills": [],
        "deaths": [],
        "suicides": [],
        "teamKills": [],
        "teamTotalSuicides": [],
        "teamTotalTeamKills": [],
    };

    for(let i = 0; i < data.length; i++){



        const d = data[i];

        const {killer, victim, timestamp} = d;
        const killerIndex = playerIndexes.indexOf(d.killer);
        const victimIndex = playerIndexes.indexOf(d.victim);
        const killerTeam = d.killer_team;
        const victimTeam = d.victim_team;

        if(killer !== victim && killerTeam !== victimTeam){
            timestamps.all.push(timestamp);
        }

        timestamps.deaths.push(timestamp);
        
        if(killer === victim){
            
            updateGraphData(suicides, killerIndex, "++");
            updateGraphData(deaths, killerIndex, "++");

            timestamps.suicides.push(timestamp);
            

            if(totalTeams > 1){
                updateGraphData(teamTotalSuicides, killerTeam, "++");
                updateGraphData(teamTotalDeaths, killerTeam, "++");
                timestamps.teamTotalSuicides.push(timestamp);
            }

        }else if(killerTeam !== victimTeam || totalTeams < 2){

            updateGraphData(kills, killerIndex, "++");
            updateGraphData(deaths, victimIndex, "++");

            if(totalTeams > 1){
                updateGraphData(teamTotalKills, killerTeam, "++");
                updateGraphData(teamTotalDeaths, victimTeam, "++");
            }

        }else if(killerTeam === victimTeam /*&& totalTeams > 1*/){

            timestamps.teamKills.push(timestamp);

            updateGraphData(teamKills, killerIndex, "++");
            updateGraphData(deaths, victimIndex, "++");

            if(totalTeams > 1){
                updateGraphData(teamTotalTeamKills, killerTeam, "++");
                updateGraphData(teamTotalDeaths, victimTeam, "++");
                timestamps.teamTotalTeamKills.push(timestamp);
            }
        }

        const killerKills = getCurrentGraphDataValue(kills, killerIndex);
        const killerDeaths = getCurrentGraphDataValue(deaths, killerIndex);
        const killerEfficiency = calculateEfficiency(killerKills, killerDeaths);
        updateGraphData(efficiency, killerIndex, killerEfficiency, true);

        if(totalTeams > 1){
            const killerTeamKills = getCurrentGraphDataValue(teamTotalKills, killerTeam);
            const killerTeamDeaths = getCurrentGraphDataValue(teamTotalDeaths, killerTeam);
            const killerTeamEfficiency = calculateEfficiency(killerTeamKills, killerTeamDeaths);
            updateGraphData(teamEfficiency, killerTeam, killerTeamEfficiency, killerTeam !== victimTeam);
        }

        const ignoreEfficiencyIndexes = [killerIndex];
        const ignoreTeamEfficiencyIndexes = [killerTeam];


        if(victim !== killer){

            const victimKills = getCurrentGraphDataValue(kills, victimIndex);
            const victimDeaths = getCurrentGraphDataValue(deaths, victimIndex);

            const victimEfficiency = calculateEfficiency(victimKills, victimDeaths);
            updateGraphData(efficiency, victimIndex, victimEfficiency, true);

            if(totalTeams > 1){
                const victimTeamKills = getCurrentGraphDataValue(teamTotalKills, victimTeam);
                const victimTeamDeaths = getCurrentGraphDataValue(teamTotalDeaths, victimTeam);
                const victimTeamEfficiency = calculateEfficiency(victimTeamKills, victimTeamDeaths);
                updateGraphData(teamEfficiency, victimTeam, victimTeamEfficiency, true);
            }

            ignoreEfficiencyIndexes.push(victimIndex);
            ignoreTeamEfficiencyIndexes.push(victimTeam);
            
        }


        updateOthersGraphData(efficiency, ignoreEfficiencyIndexes);
        if(totalTeams > 1){
            updateOthersGraphData(teamEfficiency, ignoreTeamEfficiencyIndexes);
        }
    }

    const maxDataPoints = 0;

    // const testColors = ["red", "blue", "green", "yellow"];
    //const test = Generic.reduceGraphDataPoints(kills, maxDataPoints, timestamps, testColors);

    const bIgnoreSingle = true;

    return {
        "deaths": reduceGraphDataPoints(deaths, maxDataPoints, timestamps.deaths, bIgnoreSingle), 
        "suicides": reduceGraphDataPoints(suicides, maxDataPoints, timestamps.suicides, bIgnoreSingle),
        "kills": reduceGraphDataPoints(kills, maxDataPoints, timestamps.all, bIgnoreSingle),
        "teamDeaths": reduceGraphDataPoints(teamTotalDeaths, maxDataPoints, timestamps.deaths, bIgnoreSingle),
        "teamKills": reduceGraphDataPoints(teamTotalKills, maxDataPoints, timestamps.all, bIgnoreSingle),
        "teamSuicides": reduceGraphDataPoints(teamTotalSuicides, maxDataPoints, timestamps.teamTotalSuicides, bIgnoreSingle),
        "teammateKills": reduceGraphDataPoints(teamKills, maxDataPoints, timestamps.teamKills, bIgnoreSingle),
        "teamsTeammateKills": reduceGraphDataPoints(teamTotalTeamKills, maxDataPoints, timestamps.teamTotalTeamKills, bIgnoreSingle),
        "efficiency": reduceGraphDataPoints(efficiency, maxDataPoints, timestamps.deaths, bIgnoreSingle),
        "teamEfficiency": reduceGraphDataPoints(teamEfficiency, maxDataPoints, timestamps.deaths, bIgnoreSingle),
    };
}

export async function getGraphData(matchId, players, totalTeams, getTeamName){

    const query = "SELECT timestamp,killer,victim,killer_team,victim_team FROM nstats_kills WHERE match_id=? ORDER BY timestamp ASC";
    
    const result =  await simpleQuery(query, [matchId]);

    return createGraphData(result, players, totalTeams, getTeamName);
}

async function getMatchKillsBasic(matchId){

    const query = "SELECT killer,victim FROM nstats_kills WHERE match_id=?";

    return await simpleQuery(query, [matchId]);
}


export async function getKillsMatchUp(matchId){

    const kills = await getMatchKillsBasic(matchId);

    const data = [];

    const getIndex = (killer, victim) =>{

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            if(d.k === killer && d.v === victim){
                return i;
            }
        }

        return -1;
    }


    for(let i = 0; i < kills.length; i++){

        const k = kills[i];

        //ignore suicides
        if(k.victim === 0) continue;

        let index = getIndex(k.killer, k.victim);

        if(index === -1){
            data.push({"k": k.killer, "v": k.victim, "kills": 0});
            index = data.length - 1;
        }

        data[index].kills++;

    }

    return data;
}

export async function deleteMatchData(id){

    const query = "DELETE FROM nstats_kills WHERE match_id=?";

    return await simpleQuery(query, [id]);   
}
