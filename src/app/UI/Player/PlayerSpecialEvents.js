"use client"
import { useState } from "react"
import { getMultiTitles, convertMultis, ignore0, getSpreeTitles, convertSprees } from "../../../../api/generic.mjs";
import InteractiveTable from "../InteractiveTable";
import Tabs from "../Tabs";


function bAnyData(data){

    const keys = [];

    for(let i = 1; i <= 7; i++){

        keys.push(`multi_${i}`);
        keys.push(`spree_${i}`);
    }

    for(let i = 0; i < keys.length; i++){

        if(data[keys[i]] > 0) return true;
    }

    return false;
}

function renderMultis(mode, cat, data, selectedGametype, selectedMap){

    const titles = getMultiTitles(mode);

    let headers = {};
    
    if(cat !== 3){
        headers = {"name": "Name"};
    }

    for(let i = 0; i < titles.length; i++){
        headers[titles[i]] = titles[i];
    }

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(!bAnyData(d)) continue;

        if(cat === 0 && (d.gametype !== 0 || d.map !== 0)) continue;
        if(cat === 1 && (d.gametype === 0 || d.map > 0)) continue;
        if(cat === 2 && (d.map === 0 || d.gametype > 0)) continue;
        if(cat === 3 && selectedGametype === 0 && selectedMap === 0) continue;
        if(cat === 3 && (d.gametype !== selectedGametype || d.map !== selectedMap)){
            continue;
        }
        

        let name = "";

        if(cat === 0) name = "All";
        if(cat === 1) name = d.gametypeName;
        if(cat === 2) name = d.mapName;

        const row = {
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"}
        };

        const multis = convertMultis(mode, d);

        for(let x = 0; x < multis.length; x++){
            const m = multis[x];
            const t = titles[x];
            row[t] = {"value": m, "displayValue": ignore0(m)};
        }
   
        rows.push(row);
    }

    if(rows.length === 0) return null;

    return <>
        <InteractiveTable width={1} headers={headers} data={rows} defaultOrder={"name"}/>
    </>
}

function renderSprees(mode, cat, data, selectedGametype, selectedMap){

    const titles = getSpreeTitles(mode);

    let headers = {};

    if(cat !== 3){
        headers = {"name": "Name"};
    }

    for(let i = 0; i < titles.length; i++){
        headers[titles[i]] = titles[i];
    }

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(!bAnyData(d)) continue;
        

        if(cat === 0 && (d.gametype !== 0 || d.map !== 0)) continue;
        if(cat === 1 && (d.gametype === 0 || d.map > 0)) continue;
        if(cat === 2 && (d.map === 0 || d.gametype > 0)) continue;

        if(cat === 3 && selectedGametype === 0 && selectedMap === 0) continue;
        if(cat === 3 && (d.gametype !== selectedGametype || d.map !== selectedMap)){
            continue;
        }
 

        let name = "";

        if(cat === 0) name = "All";
        if(cat === 1) name = d.gametypeName;
        if(cat === 2) name = d.mapName;
        const row = {
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"}
        };

        const multis = convertSprees(mode, d);

        for(let x = 0; x < multis.length; x++){
            const m = multis[x];
            const t = titles[x];
            row[t] = {"value": m, "displayValue": ignore0(m)};
        }
   
        rows.push(row);
    }

    if(rows.length === 0) return null;

    return <>
        <InteractiveTable width={1} headers={headers} data={rows} defaultOrder={"name"}/>
    </>
}

function sortByName(a, b){
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
}

function renderCustomFilter(cat, data, gametype, setGametype, map, setMap){

    if(cat !== 3) return null;

    const gametypes = new Map();
    const maps = new Map();

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        if(d.gametypeName === "All") d.gametypeName = "-";
        
        gametypes.set(d.gametype, {"name": (d.gametypeName === "All") ? "-" : d.gametypeName});
        maps.set(d.map, {"name": (d.mapName === "All") ? "-" : d.mapName});

    }

    const gametypeOptions = [];
    const mapOptions = [];

    for(const [id, data] of gametypes){
        gametypeOptions.push({"name": data.name, "id": id});
    }

     for(const [id, data] of maps){
        mapOptions.push({"name": data.name, "id": id});
    }

    gametypeOptions.sort(sortByName);
    mapOptions.sort(sortByName);
    
    return <div className="form m-bottom-10">
        <div className="form-row">
            <label htmlFor="gametype">Gametype</label>
            <select name="gametype" className="default-select" value={gametype} onChange={(e) =>{
                setGametype(parseInt(e.target.value));
            }}>

                {gametypeOptions.map((g) =>{
                    return <option key={g.id} value={g.id}>{g.name}</option>
                })}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="map">Map</label>
            <select name="map" className="default-select" value={map}  onChange={(e) =>{
                setMap(parseInt(e.target.value));
            }}>
                {mapOptions.map((m) =>{
                    return <option key={m.id} value={m.id}>{m.name}</option>
                })}
            </select>
        </div>
    </div>
}

export default function PlayerSpecialEvents({data}){

    let bFoundData = false;

    for(let i = 0; i < data.length; i++){

        if(bAnyData(data[i])){
            bFoundData = true;
            break;
        }
    }

    

    const [mode, setMode] = useState("ut99");
    const [cat, setCat] = useState(0);
    const [map, setMap] = useState(0);
    const [gametype, setGametype] = useState(0);

    if(!bFoundData) return null;
    
    const modeTabOptions = [
        {"name": "Classic", "value": "ut99"},
        {"name": "Smart CTF", "value": "smartCTF"},
        {"name": "UT2K4", "value": "ut2k4"},
        {"name": "UT3", "value": "ut3"}
    ];

    const catTabOptions = [
        {"name": "Combined", "value": 0},
        {"name": "Gametype Totals", "value": 1},
        {"name": "Map Totals", "value": 2},
        {"name": "Custom", "value": 3},
    ];


    return <>
        <div className="default-header">Special Events</div>
        <Tabs options={modeTabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        <Tabs options={catTabOptions} selectedValue={cat} changeSelected={(a) => setCat(() => a)}/>
        {renderCustomFilter(cat, data, gametype, setGametype, map, setMap)}
        {renderMultis(mode, cat, data, gametype, map)}
        {renderSprees(mode, cat, data, gametype, map)}
    </>
}
