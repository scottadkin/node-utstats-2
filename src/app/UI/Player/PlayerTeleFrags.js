"use client"
import Tabs from "../Tabs";
import { useState } from "react";
import InteractiveTable from "../InteractiveTable";
import { ignore0, toPlaytime } from "../../../../api/generic.mjs";


const DEFAULT_HEADERS = {
    "kills": "Kills",
    "deaths": "Deaths",
    "efficiency": "Efficiency",
    "mostKills": "Most Kills",
    "worstDeaths": "Worst Deaths",
    "bestMulti": "Best Multi Kill",
    "bestSpree": "Best Spree",
    "playtime": "Playtime"
};



function bMatchesSelected(cat, d){

    if(cat === 0 && (d.gametype_id !== 0 || d.map_id !== 0)) return false;

    if(cat === 1 && d.gametypeName === undefined) return false;
    if(cat === 2 && d.mapName === undefined) return false;

    if(cat === 1 && d.map_id !== 0) return false;
    if(cat === 2 && d.gametype_id !== 0) return false;


    return true;
}

function renderDiscKills(mode, cat, data){
    
    if(mode !== 1) return null;

    let headers = {...DEFAULT_HEADERS};

    if(cat !== 0){
        headers = Object.assign({"name": "Name"}, headers);
    }

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let name = "";

        if(!bMatchesSelected(cat, d)) continue;
        
        if(cat === 1){
            name = d.gametypeName;
        }else if(cat === 2){
            name = d.mapName;
        }

        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "kills": {"value": d.disc_kills, "displayValue": ignore0(d.disc_kills)},
            "deaths": {"value": d.disc_deaths, "displayValue": ignore0(d.disc_deaths)},
            "mostKills": {"value": d.best_disc_kills, "displayValue": ignore0(d.best_disc_kills)},
            "worstDeaths": {"value": d.worst_disc_deaths, "displayValue": ignore0(d.worst_disc_deaths)},
            "efficiency": {"value": d.disc_efficiency, "displayValue": `${d.disc_efficiency.toFixed(2)}%`},
            "bestMulti": {"value": d.best_disc_multi, "displayValue": ignore0(d.best_disc_multi)},
            "bestSpree": {"value": d.best_disc_spree, "displayValue": ignore0(d.best_disc_spree)},
            "playtime": {"value": d.playtime, "displayValue": toPlaytime(d.playtime), "className": "playtime"}
        });
    }

    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

function renderTelefragKills(mode, cat, data){
    
    if(mode !== 0) return null;

    let headers = {...DEFAULT_HEADERS};

    if(cat !== 0){
        headers = Object.assign({"name": "Name"}, headers);
    }

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let name = "";

        if(!bMatchesSelected(cat, d)) continue;
        
        if(cat === 1){
            name = d.gametypeName;
        }else if(cat === 2){
            name = d.mapName;
        }

        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"},
            "kills": {"value": d.tele_kills, "displayValue": ignore0(d.tele_kills)},
            "deaths": {"value": d.tele_deaths, "displayValue": ignore0(d.tele_deaths)},
            "efficiency": {"value": d.tele_efficiency, "displayValue": `${d.tele_efficiency.toFixed(2)}%`},
            "mostKills": {"value": d.best_tele_kills, "displayValue": ignore0(d.best_tele_kills)},
            "worstDeaths": {"value": d.worst_tele_deaths, "displayValue": ignore0(d.worst_tele_deaths)},
            "bestMulti": {"value": d.best_tele_multi, "displayValue": ignore0(d.best_tele_multi)},
            "bestSpree": {"value": d.best_tele_spree, "displayValue": ignore0(d.best_tele_spree)},
            "playtime": {"value": d.playtime, "displayValue": toPlaytime(d.playtime), "className": "playtime"}
        });
    }

    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

function bAnyData(data){

    const targetKeys = [
        "disc_kills", "disc_deaths",
        "tele_deaths", "tele_kills"
    ];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        
        for(let x = 0; x < targetKeys.length; x++){

            if(d[targetKeys[x]] > 0) return true;
        }
    }

    return false;
}

export default function PlayerTeleFrags({data}){

    

    const [mode, setMode] = useState(0);
    const [cat, setCat] = useState(0);

    if(!bAnyData(data)) return null;

    const tabOptions = [
        {"name": "Telefrags", "value": 0},
        {"name": "Disc Kills", "value": 1},
    ];

    const catOptions = [
        {"name": "All Time Totals", "value": 0},
        {"name": "Gametype Totals", "value": 1},
        {"name": "Map Totals", "value": 2},
    ];

    return <>
        <div className="default-header">Telefrags Summary</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        <Tabs options={catOptions} selectedValue={cat} changeSelected={(a) => setCat(() => a)}/>
        {renderTelefragKills(mode, cat, data)}
        {renderDiscKills(mode, cat, data)}
    </>
}