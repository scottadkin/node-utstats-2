"use client"
import { useState } from "react";
import Tabs from "../Tabs";

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

function renderCustomFilters(mode, gametypeNames, mapNames, selectedGametype, setSelectedGametype, selectedMap, setSelectedMap){

    if(mode !== 3) return null;
    
    return <div className="form">
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

export default function PlayerWinRates({data}){

    const [mode, setMode] = useState(0);
    const [selectedGametype, setSelectedGametype] = useState(0);
    const [selectedMap, setSelectedMap] = useState(0);

    const {gametypes, maps} = getUnique(data);

    const tabOptions = [
        {"name": "All", "value": 0},
        {"name": "Gametypes", "value": 1},
        {"name": "Maps", "value": 2},
        {"name": "Custom", "value": 3},
    ];

    return <>
        <div className="default-header">Win Rates</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {renderCustomFilters(mode, gametypes, maps, selectedGametype, setSelectedGametype, selectedMap, setSelectedMap)}
    </>
}
