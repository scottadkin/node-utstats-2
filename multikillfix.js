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

(async () =>{

    const matchIds = await getHardcoreMatchIds();

    console.log(matchIds);

    for(let i = 0; i < matchIds.length; i++){

        const id = matchIds[i];

       // console.log(id);
        //return;

        const matchData = createMatchData(await getKills(id));

        await updateMatchData(id, matchData);

        //break;
    }

    process.exit();
})();