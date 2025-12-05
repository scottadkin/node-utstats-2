"use client"
import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import InteractiveTable from "../InteractiveTable";
import { ignore0 } from "../../../../api/generic.mjs";
import Tabs from "../Tabs";

function reducer(state, action){


    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "data": action.data,
                "gametypes": action.gametypes
            }
        }
        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }
        case "set-gametype": {
            return {
                ...state,
                "gametypeId": action.value
            }
        }
    }

}


async function loadData(dispatch, mDispatch, mapId, gametypeId){

    try{

        const req = await fetch("/api/map", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "weapons", mapId, gametypeId})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded", "data": res.data, "gametypes": res.playedGametypes});

    }catch(err){

        console.trace(err);

        mDispatch({
            "type": "set-message", 
            "messageType": "error", 
            "title": "Failed to load data", 
            "content": err.toString()
        });
    }
}

function renderTotals(mode, data){

    if(mode !== "totals") return null;

    const headers = {
        "title": "Weapon",
        "matches": "Matches Used",
        "shots": "Shots",
        "hits": "Hits",
        "accuracy": "Accuracy",
        "damage": "Damage",
        "deaths": "Deaths",
        "suicides": "Suicides",
        "teamKills": "Team Kills",
        "kills": "Kills"
    };

    const rows = data.map((d) =>{

        return {
            "title": {"value": d.name.toLowerCase(), "displayValue": d.name, "className": "text-left"},
            "matches": {"value": d.matches},
            "shots": {"value": d.shots, "displayValue": ignore0(d.shots)},
            "hits": {"value": d.hits, "displayValue": ignore0(d.hits)},
            "accuracy": {"value": d.accuracy, "displayValue": <>{d.accuracy.toFixed(2)}%</>},
            "damage": {"value": d.damage},
            "deaths": {"value": d.deaths, "displayValue": ignore0(d.deaths)},
            "suicides": {"value": d.suicides, "displayValue": ignore0(d.suicides)},
            "teamKills": {"value": d.team_kills, "displayValue": ignore0(d.team_kills)},
            "kills": {"value": d.kills, "displayValue": ignore0(d.kills)}
        }
    });

    return <InteractiveTable title="Gametype Totals" width={1} headers={headers} data={rows}/>
}

function renderRecords(mode, data){

    if(mode !== "records") return null;

    const headers = {
        "title": "Weapon",
        "shots": "Shots",
        "hits": "Hits",
        "damage": "Damage",
        "deaths": "Deaths",
        "suicides": "Suicides",
        "teamKills": "Team Kills",
        "kills": "Kills",
        "spree": "Best Spree",
        "teamSpree": "Team Kills(Single Life)",
    };

    const rows = data.map((d) =>{

        return {
            "title": {"value": d.name.toLowerCase(), "displayValue": d.name, "className": "text-left"},
            "shots": {"value": d.max_shots, "displayValue": ignore0(d.max_shots)},
            "hits": {"value": d.max_hits, "displayValue": ignore0(d.max_hits)},
            "damage": {"value": d.max_damage},
            "deaths": {"value": d.max_deaths, "displayValue": ignore0(d.max_deaths)},
            "suicides": {"value": d.max_suicides, "displayValue": ignore0(d.max_suicides)},
            "teamKills": {"value": d.max_team_kills, "displayValue": ignore0(d.max_team_kills)},
            "kills": {"value": d.max_kills, "displayValue": ignore0(d.max_kills)},
            "spree": {"value": d.best_kills_spree, "displayValue": ignore0(d.best_kills_spree)},
            "teamSpree": {"value": d.best_team_kills_spree, "displayValue": ignore0(d.best_team_kills_spree)}
        }
    });

    return <InteractiveTable title="Match Records" width={1} headers={headers} data={rows}/>
}

export default function MapWeapons({mapId}){

    const [mState, mDispatch] = useMessageBoxReducer();
    const [state, dispatch] = useReducer(reducer, {
        "mode": "totals",
        "gametypeId": 0,
        "data": [],
        "gametypes": []
    });

    useEffect(() =>{

        loadData(dispatch, mDispatch, mapId, state.gametypeId);

    }, [mapId, state.gametypeId]);


    const tabOptions = [
        {
            "name": "Totals", "value": "totals"
        },
        {
            "name": "Records", "value": "records",
        }
    ];

    return <>
        <div className="default-header">Weapons Summary</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
        <div className="form m-bottom-10">
            <div className="form-row">
                <label htmlFor="gametype">Gametype</label>
                <select name="gametype" className="default-select" onChange={(e) =>{
                    dispatch({"type": "set-gametype", "value": e.target.value});
                }}>
                    <option value="0">-- All Combined --</option>
                    {state.gametypes.map((g) =>{
                        return <option key={g.gametype} value={g.gametype}>{g.name}</option>
                    })}
                </select>
            </div>
        </div>
        <MessageBox timestamp={mState.timestamp} type={mState.type} title={mState.title}>{mState.content}</MessageBox>
        {renderTotals(state.mode, state.data)}
        {renderRecords(state.mode, state.data)}
    </>
}