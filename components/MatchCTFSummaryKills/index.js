import InteractiveTable from "../InteractiveTable";
import { useEffect, useReducer } from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import { getPlayer, getTeamColor, ignore0 } from "../../api/generic.mjs";
import CountryFlag from "../CountryFlag";


async function loadData(signal, matchId, mapId, dispatch, playerId){

    try{

        const req = await fetch("/api/ctf", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "signal": signal,
            "body": JSON.stringify({
                "mode": "match-flag-kills", 
                "matchId": matchId, 
                "mapId": mapId,
                "playerId": playerId
            })
        });

        const res = await req.json();

        if(res.error === undefined){
            dispatch({"type": "loaded-data", "data": res});
            return;
        }
    }catch(err){
        if(err.name === "AbortError") return;
        console.trace(err);
        //signal.abort();
    }
}

const reducer = (action, state) =>{

    switch(action.type){
        case "loaded-data": {
            return {
                ...state,
                "data": action.data,
                "bLoaded": false,
                "error": null
            }
        }
        case "error": {
            return {
                ...state,
                "data": {},
                "error": action.message
            }
        }
    }

    return state;
}

function renderTeamTable(state, playerData, targetTeam){

    const headers = {
        "player": "Player",
        "far": {
            "title": "Far", 
            "content": "Player killed an enemy with the flag where the enemy was further away from capping then the distance between the two flag bases."
        },
        "stand": {
            "title": "Home Flag Base", 
            "content": "Player killed an enemy with the flag very close to their home flag base(<5% the distance between flag bases)."
        },
        "home": {
            "title": "Home Base", 
            "content": "Player killed an enemy with the flag in their home base (within >5%-33% of the distance between flag bases)."
        },
        "mid": {
            "title": "Mid", 
            "content": "Player killed an enemy with the flag in the middle of the map (34%-67% of the distance between flag bases)."
        },
        "enemy": {
            "title": "Enemy Base", 
            "content": "Player killed an enemy with the flag where the enemy got back into their home base(33% of distance between both flag bases)."
        },
        "save": {
            "title": "Enemy Flag Stand", 
            "content": "Player killed an enemy with the flag where the enemy was very close to capping(within 5% of the distance between both flag bases)."
        },
    };

    const totals = { 
        "far": 0,
        "stand": 0,
        "home":0,
        "mid": 0,
        "enemy": 0,
        "save": 0
    }

    const rows = [];

    for(const [playerId, kT] of Object.entries(state.data)){

        const player = getPlayer(playerData, parseInt(playerId), false);

        if(player.team !== targetTeam) continue;

        totals.far += kT.far;
        totals.stand += kT.homeFlagStand;
        totals.home += kT.enemyBase;
        totals.mid += kT.mid;
        totals.enemy += kT.homeBase;
        totals.save += kT.closeSave;

        rows.push({
            "player": {
                "value": player.name.toLowerCase(), 
                "displayValue": <><CountryFlag country={player.country}/>{player.name}</>,
                "className": `text-left ${getTeamColor(player.team, 2)}`
            },
            "far": {"value": kT.far, "displayValue": ignore0(kT.far)},
            "stand": {"value": kT.homeFlagStand, "displayValue": ignore0(kT.homeFlagStand)},
            "home":{"value":  kT.enemyBase, "displayValue": ignore0(kT.enemyBase)},
            "mid": {"value":  kT.mid, "displayValue": ignore0(kT.mid)},
            "enemy": {"value":  kT.homeBase, "displayValue": ignore0(kT.homeBase)},
            "save": {"value":  kT.closeSave, "displayValue": ignore0(kT.closeSave)},
        });
    }

    if(rows.length === 0) return null;

    if(rows.length > 1){
        rows.push({
            "bAlwaysLast": true,
            "player": {
                    "value": "", 
                    "displayValue": "Totals",
                    "className": `black`
                },
                "stand": {"value": totals.stand, "displayValue": ignore0(totals.stand)},
                "far": {"value": totals.far, "displayValue": ignore0(totals.far)},
                "home":{"value":  totals.home, "displayValue": ignore0(totals.home)},
                "mid": {"value":  totals.mid, "displayValue": ignore0(totals.mid)},
                "enemy": {"value":  totals.enemy, "displayValue": ignore0(totals.enemy)},
                "save": {"value":  totals.save, "displayValue": ignore0(totals.save)},
        });
    }

    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

export default function MatchCTFSummaryKills({matchId, mapId, playerData, single}){

    const [state, dispatch] = useReducer(reducer, {
        "data": {},
        "error": null,
        "bLoaded":  false
    });

    let playerId = -1;
    if(playerData.length === 1) playerId = playerData[0].player_id;

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller.signal, matchId, mapId, dispatch, playerId);

        return () =>{
            controller.abort();
        }

    },[matchId, mapId, playerId]);
    

    return <>
        <Loading value={!state.bLoaded}/>
        <ErrorMessage title="Captrue The Flag Kills" text={state.error}/>
        {renderTeamTable(state, playerData, 0)}
        {renderTeamTable(state, playerData, 1)}
        {renderTeamTable(state, playerData, 2)}
        {renderTeamTable(state, playerData, 3)}
    </>

}