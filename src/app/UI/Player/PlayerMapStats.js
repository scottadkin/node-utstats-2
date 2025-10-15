
"use client"
import { useState } from "react";
import InteractiveTable from "../InteractiveTable";
import { toPlaytime, convertTimestamp, ignore0 } from "../../../../api/generic.mjs";
import Tabs from "../Tabs";



const renderData = (data, mode, selectedGametype) =>{

    if(data.length === 0) return null;

    const headers = {
        "name": "Map",
        "first": "First",
        "last": "Last",
        "matches": "Matches",
        "wins": "Wins",
        "winRate": "Win Rate",
        "spec": "Spectime",
        "playtime": "Playtime"
        
    };


    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(mode === 0 && d.gametype !== 0) continue;
        if(mode === 1 && (d.gametype === 0 || d.gametype !== selectedGametype)) continue;

        rows.push({
            "name": {
                "value": d.mapName.toLowerCase(), 
                "displayValue": d.mapName,
                "className": "text-left"
            },
            "first": {
                "value": d.first,
                "displayValue": convertTimestamp(d.first, true, true),
                "className": "playtime"
            },
            "last": {
                "value": d.last,
                "displayValue": convertTimestamp(d.last, true, true),
                "className": "playtime"
            },
            "matches": {
                "value": d.matches,
            },
            "wins": {
                "value": ignore0(d.wins)
            },
            "winRate": {
                "value": d.winrate,
                "displayValue": `${d.winrate.toFixed(2)}%`
            },
            "playtime": {
                "value": d.playtime,
                "displayValue": toPlaytime(d.playtime),
                "className": "playtime"
            },
            "spec": {
                "value": d.spec_playtime,
                "displayValue": toPlaytime(d.spec_playtime),
                "className": "playtime"
            }
        });
    }

    


    return <>
        <InteractiveTable width={1} headers={headers} data={rows} defaultOrder={"name"}/>
    </>;
}

function renderGametypeTabs(gametypeNames, mode, selectedGametype, setSelectedGametype){

    if(mode !== 1) return null;
    const options = [];

    for(const [id, name] of Object.entries(gametypeNames)){

        options.push({"name": name, "value": parseInt(id)});
    }


    options.sort((a, b) =>{

        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        if(a < b) return -1;
        if(a > b) return 1;
        return 0;

    });

    if(options.length > 0 && selectedGametype === 0){
        setSelectedGametype(options[0].value)
    }

    return <Tabs options={options} selectedValue={selectedGametype} changeSelected={(a) => setSelectedGametype(() => a)}/>
}

export default function PlayerMapStats({gametypeNames, data}){

    const [mode, setMode] = useState(0);
    const [selectedGametype, setSelectedGametype] = useState(0);

    const tabOptions = [
        {"name": "All Time Totals", "value": 0},
        {"name": "Gametype Totals", "value": 1},
    ];

    return <>
        <div className="default-header">Map Stats</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {renderGametypeTabs(gametypeNames, mode, selectedGametype, setSelectedGametype)}
        {renderData(data, mode, selectedGametype)}
    </>
}