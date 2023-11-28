const mysql = require("./api/database");
const Functions = require("./api/functions");
const {multiKillTimeLimit} = require("./config.json");
const Message = require("./api/message");


async function getHardcoreMatchIds(){

    const query = `SELECT id FROM nstats_matches WHERE hardcore=1`;
    const result = await mysql.simpleQuery(query);

    return result.map((r) =>{
        return r.id;
    });
}


async function getKills(matchId){

    const query = `SELECT timestamp,killer,victim FROM nstats_kills WHERE match_id=? ORDER BY timestamp ASC`;
    return await mysql.simpleQuery(query, [matchId]);
  
}


function createBlankData(){

    return {
        "double": 0,
        "multi": 0,
        "mega": 0,
        "ultra": 0,
        "monster": 0,
        "ludicrous": 0,
        "holyShit": 0,
        "currentMulti": 0,
        "bestMulti": 0,
        "lastKillTimestamp": -999
    }
}

function setMultiKill(data){

    const currentMulti = data.currentMulti;

    if(currentMulti < 2) return;

    switch(currentMulti){

        case 2: { data.double++; } break;
        case 3: { data.multi++; } break;
        case 4: { data.mega++; } break;
        case 5: { data.ultra++; } break;
        case 6: { data.monster++; } break;
        case 7: { data.ludicrous++; } break;
        default: { data.holyShit++; } break;
    }
}

function createMatchData(kills){

    const totals = {};

    for(let i = 0; i < kills.length; i++){

        const k = kills[i];

        if(k.killer === k.victim) continue;

        if(totals[k.killer] === undefined) totals[k.killer] = createBlankData();
        if(totals[k.victim] === undefined) totals[k.victim] = createBlankData();

        const killer = totals[k.killer];
        const victim = totals[k.victim];

        victim.lastKillTimestamp = -999;
        victim.currentMulti = 0;

        const diff = Functions.scalePlaytime(k.timestamp, true) - Functions.scalePlaytime(killer.lastKillTimestamp, true);
        killer.lastKillTimestamp = k.timestamp;
        
        if(diff > multiKillTimeLimit){
            setMultiKill(killer);
            killer.currentMulti = 1;
        }else{
            killer.currentMulti++;
        }

        if(killer.currentMulti > killer.bestMulti) killer.bestMulti = killer.currentMulti;
    }

    //just in case any remaining multis ongoing
    for(const playerData of Object.values(totals)){

        setMultiKill(playerData);
    }

    return totals;
}


async function updateMatchData(matchId, playerData){

    new Message(`Updating multi kills for match ${matchId}`, "note");

    const query = `UPDATE nstats_player_matches SET multi_1=?,multi_2=?,multi_3=?,multi_4=?,multi_5=?,multi_6=?,multi_7=?,multi_best=? WHERE match_id=? AND player_id=?`;

    const now = performance.now() * 0.001;

    for(const [playerId, d] of Object.entries(playerData)){

        await mysql.simpleQuery(query, [
            d.double, 
            d.multi, 
            d.mega, 
            d.ultra, 
            d.monster, 
            d.ludicrous, 
            d.holyShit, 
            d.bestMulti,
            matchId, 
            playerId
        ]);
        
    }
  
    const end = performance.now() * 0.001;
    const diff = end - now;

    new Message(`Updating multi kills for match ${matchId}, took ${Functions.toPlaytime(diff,true)}`, "pass");
}


async function updateTotals(data, gametypeId, mapId){


    const query = `UPDATE nstats_player_totals SET multi_1=?,multi_2=?,multi_3=?,multi_4=?,multi_5=?,multi_6=?,multi_7=?,
    multi_best=? WHERE `;

    const d = data;

    let where = "";

    const extraVars = [];

    if(gametypeId === 0 && mapId === 0){
        where = `id=?`;
        extraVars.push(d.player_id);
    }else{
        where = `player_id=? AND gametype=? AND map=?`;
        extraVars.push(d.player_id, gametypeId, mapId);
    }

    
    const vars = [
        d.multi_1,
        d.multi_2,
        d.multi_3,
        d.multi_4,
        d.multi_5,
        d.multi_6,
        d.multi_7,
        d.best_multi,
        ...extraVars
    ];

    return await mysql.simpleQuery(`${query}${where}`, vars);
}

async function createTotalsFromMatchData(){

    //will need to do map all time totals, and gametype all time totals separately e.g 0,1, 0,0, 1,0
    const query = `
    SUM(multi_1) as multi_1,
    SUM(multi_2) as multi_2,
    SUM(multi_3) as multi_3,
    SUM(multi_4) as multi_4,
    SUM(multi_5) as multi_5,
    SUM(multi_6) as multi_6,
    SUM(multi_7) as multi_7,
    MAX(multi_best) as best_multi FROM nstats_player_matches `;

    const groupMapGametype = `GROUP BY player_id,gametype,map_id`;
    const selectMapGametype = `player_id,gametype,map_id,`;
    const selectMap = `player_id,map_id,`;
    const groupMap = `GROUP BY player_id,map_id`;
    const selectGametype = `player_id,gametype,`;
    const groupGametype = `GROUP BY player_id,gametype`;

    const groupAllTime = `GROUP BY player_id`;
    const selectAllTime = `player_id,`;


    new Message(`Updating all time player total multi kills.`,"note");

    const allTimeResult = await mysql.simpleQuery(`SELECT ${selectAllTime} ${query}${groupAllTime}`);

    for(let i = 0; i < allTimeResult.length; i++){

        const a = allTimeResult[i];
        await updateTotals(a, 0, 0);
    }

    new Message(`Updating all time player total multi kills.`,"pass");


    new Message(`Updating gametype player total multi kills.`,"note");
    const gametypeResult = await mysql.simpleQuery(`SELECT ${selectGametype} ${query}${groupGametype}`);

    for(let i = 0; i < gametypeResult.length; i++){

        const a = gametypeResult[i];
        await updateTotals(a, a.gametype, 0);
    }
    new Message(`Updating gametype player total multi kills.`,"pass");


    new Message(`Updating map player total multi kills.`,"note");

    const mapResult = await mysql.simpleQuery(`SELECT ${selectMap} ${query}${groupMap}`);

    for(let i = 0; i < mapResult.length; i++){

        const a = mapResult[i];
        await updateTotals(a, 0, a.map_id);
    }

    new Message(`Updating map player total multi kills.`,"pass");


    new Message(`Updating map & gametype player total multi kills.`,"note");
    const mapGametypeResult = await mysql.simpleQuery(`SELECT ${selectMapGametype} ${query}${groupMapGametype}`);

    for(let i = 0; i < mapGametypeResult.length; i++){

        const m = mapGametypeResult[i];
        await updateTotals(m, m.gametype, m.map_id);
    }
    new Message(`Updating map & gametype player total multi kills.`,"pass");


    

    //console.log(mapGametypeResult);
}

(async () =>{



    const matchIds = await getHardcoreMatchIds();

    for(let i = 0; i < matchIds.length; i++){

        const id = matchIds[i];

        const matchData = createMatchData(await getKills(id));

        await updateMatchData(id, matchData);
    }

    await createTotalsFromMatchData();

    process.exit();
})();