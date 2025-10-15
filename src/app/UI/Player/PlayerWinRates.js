"use client"
import { useState } from "react";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import { convertTimestamp, ignore0 } from "../../../../api/generic.mjs";

function sortByName(a, b){

    a = a.name.toLowerCase();
    b = b.name.toLowerCase();
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
}

function getUnique(data){

    const gametypes = [];
    const maps = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.gametype !== 0) gametypes[d.gametype] = {"id": d.gametype, "name": d.gametypeName};
        if(d.map !== 0) maps[d.map] = {"id": d.map, "name": d.mapName};
    }

    gametypes.sort(sortByName);
    maps.sort(sortByName);

    return {gametypes, maps};
}

function getCurrentStreakString(data){

    let value = 0;
    let stringName = "";

    if(data.current_win_streak > 0){

        value = data.current_win_streak;

        if(value === 1){
            stringName = "Win";
        }else{
            stringName = "Wins";
        }  
    }

    if(data.current_draws_streak > 0){

        value = data.current_draw_streak;

        if(value === 1){
            stringName = "Draw";
        }else{
            stringName = "Draws";
        }  
    }

    if(data.current_lose_streak > 0){

        value = data.current_lose_streak;

        if(value === 1){
            stringName = "Loss";
        }else{
            stringName = "Losses";
        }  
    } 



    return `${value} ${stringName}`;
}

function renderCustomFilters(mode, gametypeNames, mapNames, selectedGametype, setSelectedGametype, selectedMap, setSelectedMap){

    if(mode !== 3) return null;
    
    return <div className="form m-bottom-10">
        <div className="form-row">
            <label htmlFor="gametype">Gametype</label>
            <select name="gametype" className="default-select" value={selectedGametype} onChange={(e) =>{
                setSelectedGametype(() => parseInt(e.target.value));
            }}>
                <option value="0">Any</option>
                {gametypeNames.map((g) =>{
                    return <option key={g.id} value={g.id}>{g.name}</option>
                })}

            </select>
        </div>
        <div className="form-row">
            <label htmlFor="map">Map</label>
            <select name="map" className="default-select" value={selectedMap} onChange={(e) =>{
                setSelectedMap(() => parseInt(e.target.value));
            }}>
                <option value="0">Any</option>
                {mapNames.map((m) =>{
                    return <option key={m.id} value={m.id}>{m.name}</option>
                })}
            </select>
        </div>
    </div>
}

function renderData(mode, gametype, map, data){

    if(data.length === 0) return;

    let headers = {
        "last": "Last Played",
        "matches": "Matches Played",
        "losses": "Losses",
        "draws": "Draws",
        "wins": "Wins",
        "winrate": "WinRate",
        "worstLoss": "Worst Loss Streak",
        "bestWin": "Best Win Streak",
        "current": "Current Streak"
    };

    if(mode !== 0){
        headers = Object.assign({"name": "Name"}, headers);
    }

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(mode === 0 && (d.gametype !== 0 || d.map !== 0)) continue;
        if(mode === 1 && (d.gametype === 0 || d.map !== 0)) continue;
        if(mode === 2 && (d.gametype !== 0 || d.map === 0)) continue;

        if(mode === 3){

            if(gametype !== 0 && d.gametype !== gametype) continue;
            if(map !== 0 && d.map !== map) continue;

            if(map === 0 && gametype !== 0 && d.map === 0) continue;

        }

        let name = "";

        if(mode === 1) name = d.gametypeName;
        if(mode === 2) name = d.mapName;
        if(mode === 3){

            if(gametype !== 0 && d.map === 0) name = d.gametypeName;
            if(gametype !== 0 && d.map !== 0) name = d.mapName;
            if(map !== 0 && d.gametype === 0) name = d.mapName;

            if(gametype === 0 && map === 0){

                name = `${d?.mapName ?? ""}`;

                const gName = d?.gametypeName ?? "";

                if(name !== "") name = `${name} `;

                if(name !== "" && gName !== ""){
                    name = `${name} (${gName})`;
                }else if(name === "" && gName !== ""){
                    name = gName;
                }
              
                if(d.gametype === 0 && d.map === 0) name = "All";
            }
        }

        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "last": {"value": d.date, "displayValue": convertTimestamp(d.date), "className": "date"},
            "matches": {"value": d.matches, "displayValue": ignore0(d.matches)},
            "losses": {"value": d.losses, "displayValue": ignore0(d.losses)},
            "draws": {"value": d.draws, "displayValue": ignore0(d.draws)},
            "wins": {"value": d.wins, "displayValue": ignore0(d.wins)},
            "winrate": {"value": d.winrate, "displayValue": `${d.winrate.toFixed(2)}%`},
            "worstLoss": {"value": d.max_lose_streak, "displayValue": ignore0(d.max_lose_streak)},
            "bestWin": {"value":  d.max_win_streak, "displayValue": ignore0(d.max_win_streak)},
            "current": {"value": "", "displayValue": getCurrentStreakString(d)},
        });
    }

    return <InteractiveTable width={1} headers={headers} data={rows} defaultOrder="name"/>
}

export default function PlayerWinRates({data}){

    const [mode, setMode] = useState(0);
    const [selectedGametype, setSelectedGametype] = useState(0);
    const [selectedMap, setSelectedMap] = useState(0);

    const {gametypes, maps} = getUnique(data);

    const tabOptions = [
        {"name": "All Time", "value": 0},
        {"name": "Gametypes", "value": 1},
        {"name": "Maps", "value": 2},
        {"name": "Custom", "value": 3},
    ];

    return <>
        <div className="default-header">Win Rates</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {renderCustomFilters(mode, gametypes, maps, selectedGametype, setSelectedGametype, selectedMap, setSelectedMap)}
        {renderData(mode, selectedGametype, selectedMap, data)}
    </>
}
