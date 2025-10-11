"use client"
import Tabs from "../Tabs";
import { useState } from "react";
import InteractiveTable from "../InteractiveTable";
import { ignore0 } from "../../../../api/generic.mjs";


const DEFAULT_HEADERS = {
    "frags": "Frags",
    "kills": "Kills",
    "deaths": "Deaths",
    "suicides": "Suicides",
    "teamKills": "Team Kills",
    "efficiency": "Efficiency",
    "headshots": "Headshots",
    "spawnKills": "Spawnkills",
    "close": "Close Range Kills",
    "long": "Long Range Kills",
    "uber": "Uber Long Range Kills",
};


function addStats(row, d){

    row.frags = {"value": d.frags, "displayValue": ignore0(d.frags)}
    row.kills = {"value": d.kills, "displayValue": ignore0(d.kills)}
    row.deaths = {"value": d.deaths, "displayValue": ignore0(d.deaths)}
    row.suicides = {"value": d.suicides, "displayValue": ignore0(d.suicides)}
    row.teamKills = {"value": d.team_kills, "displayValue": ignore0(d.team_kills)}
    row.efficiency = {"value": d.efficiency, "displayValue": `${d.efficiency.toFixed(2)}%`}
    row.headshots = {"value": d.headshots, "displayValue": ignore0(d.headshots)}
    row.spawnKills = {"value": d.spawn_kills, "displayValue": ignore0(d.spawn_kills)}
    row.close = {"value": d.k_distance_normal, "displayValue": ignore0(d.k_distance_normal)}
    row.long = {"value": d.k_distance_long, "displayValue": ignore0(d.k_distance_long)}
    row.uber = {"value": d.k_distance_uber, "displayValue": ignore0(d.k_distance_uber)}
}

function renderCombined(mode, data){

    if(mode !== 0) return null;

    const headers = {
        "frags": "Frags",
        "kills": "Kills",
        "deaths": "Deaths",
        "suicides": "Suicides",
        "teamKills": "Team Kills",
        "efficiency": "Efficiency",
        "headshots": "Headshots",
        "spawnKills": "Spawnkills",
        "close": "Close Range Kills",
        "long": "Long Range Kills",
        "uber": "Uber Long Range Kills",
    };

    let rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        if(d.gametype !== 0 && d.map !== 0) continue;

        const row = {};

        addStats(row, d);
        rows.push(row);
        break;
    }

    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

function renderGametypes(mode, data){

    if(mode !== 1) return null;

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.map !== 0) continue;

        const row = {
            "name": {"value": d.gametypeName.toLowerCase(), "displayValue": d.gametypeName, "className": "text-left"},
        };

        addStats(row, d);
        rows.push(row);
    }


   return <InteractiveTable width={1} headers={{"name": "Name", ...DEFAULT_HEADERS}} data={rows}/>
}

function renderMaps(mode, data){

    if(mode !== 2) return null;
    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.gametype !== 0) continue;

        const row = {
            "name": {"value": d.mapName.toLowerCase(), "displayValue": d.mapName, "className": "text-left"},
        };

        addStats(row, d);
        rows.push(row);
    }


    return <InteractiveTable width={1} headers={{"name": "Name", ...DEFAULT_HEADERS}} data={rows}/>
}


function renderCustom(mode, selectedGametype, selectedMap, setSelectedGametype, setSelectedMap, data, gametypeNames, mapNames){

    if(mode !== 3) return null;

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        if(selectedGametype === 0 && selectedMap === 0) break;
        if(selectedGametype !== 0 && d.gametype !== selectedGametype) continue;
        if(selectedMap !== 0 && d.map !== selectedMap) continue;

        const row = {
            "name": {
                "value": d.gametypeName.toLowerCase(), 
                "displayValue": <>{d.gametypeName}<br/>{d.mapName}</>, 
                "className": "small-font"},
        };

        addStats(row, d);
        rows.push(row);
        
    }

    console.log(rows);

    const headers = {
        "name": "Name",
        ...DEFAULT_HEADERS
    }


    return <>
        <div className="form">
            <div className="form-row">
                <label htmlFor="gametype">Gametype</label>
                <select name="gametype" className="default-select" value={selectedGametype} onChange={(e) =>{
                    setSelectedGametype(() => parseInt(e.target.value));
                }}>
                    <option value="0">-</option>
                    {gametypeNames.map((g) =>{
                        return <option value={g.id} key={g.id}>{g.name}</option>
                    })}
                </select>
            </div>
            <div className="form-row">
                <label htmlFor="map">Map</label>
                <select name="map" className="default-select" value={selectedMap} onChange={(e) =>{
                    setSelectedMap(() => parseInt(e.target.value));
                }}>
                    <option value="0">-</option>
                    {mapNames.map((m) =>{
                        return <option value={m.id} key={m.id}>{m.name}</option>
                    })}
                </select>
            </div>
        </div>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>
}

function sortByName(a, b){
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();

    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
}

export default function PlayerFragSummary({data}){

    const [mode, setMode] = useState(0);
    const [selectedGametype, setSelectedGametype] = useState(0);
    const [selectedMap, setSelectedMap] = useState(0);

    const gametypeNames = [];
    const mapNames = [];

    for(const [id, name] of Object.entries(data.gametypes)){
        gametypeNames.push({id, name});
    }   

    for(const [id, name] of Object.entries(data.maps)){
        mapNames.push({id, name});
    }  

    gametypeNames.sort(sortByName);
    mapNames.sort(sortByName);

    const tabOptions = [
        {"name": "Combined Totals", "value": 0},
        {"name": "Gametype Totals", "value": 1},
        {"name": "Map Totals", "value": 2},
        {"name": "Custom Totals", "value": 3},
    ];

    return <>
        <div className="default-header">Frags Summary</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)} />
        {renderCombined(mode, data.data)}
        {renderGametypes(mode, data.data)}
        {renderMaps(mode, data.data)}
        {renderCustom(mode, selectedGametype, selectedMap, setSelectedGametype, setSelectedMap, data.data, gametypeNames, mapNames)}
    </>
}