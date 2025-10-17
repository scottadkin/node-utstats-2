
"use client"
import { ignore0 } from "../../../../api/generic.mjs";
import InteractiveTable from "../InteractiveTable";
import Tabs from "../Tabs";
import { useState } from "react";

function getUniqueWeapons(totals, best, selectedWeapon, setSelectedWeapon){

    const found = {};

    for(let i = 0; i < totals.length; i++){

        const t = totals[i];
        found[t.weapon] = t.weaponName;
    }

    for(let i = 0; i < best.length; i++){

        const b = best[i];
        found[b.weapon] = b.weaponName;
    }


    const data = [];

    for(const [id, name] of Object.entries(found)){
        data.push({id, name});
    }

    data.sort((a, b) =>{
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    if(data.length > 0 && selectedWeapon === 0) setSelectedWeapon(() => data[0].id);
    return data;
}

function renderTabs(uniqueWeapons, selected, setSelected){

    const options = uniqueWeapons.map((u) =>{
        return {"name": u.name, "value": parseInt(u.id)};
    });


    if(selected === 0 && options.length > 0) setSelected(options[0].value);

    if(options.length === 0) return null;

    return <Tabs options={options} selectedValue={selected} changeSelected={(a) => setSelected(() => a)}/>
}

function renderTotals(data, selectedWeapon, selectedMode){

    const rows = [];

    let headers = {
        "matches": "Matches",
        "kills": "Kills",
        "deaths": "Deaths",
        "suicides": "Suicides",
        "teamKills": "Team Kills",
        "efficiency": "Efficiency",
        "shots": "Shots",
        "hits": "Hits",
        "acc": "Accuracy",
        "damage": "Damage"
    };


    if(selectedMode !== 0){
        headers = Object.assign({"name": "Name"}, headers);
    }

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.weapon !== selectedWeapon) continue;
        if(selectedMode === 0 && (d.gametype_id !== 0 || d.map_id !== 0)) continue;
        if(selectedMode === 1 && (d.gametype_id === 0 || d.map_id !== 0)) continue;

        if(selectedMode === 2 && (d.map_id === 0 || d.gametype_id !== 0)) continue;

        const name = (selectedMode === 2) ? d.mapName : d.gametypeName;

        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name},
            "matches": {"value": d.matches, "displayValue": ignore0(d.matches)},
            "kills": {"value": d.kills, "displayValue": ignore0(d.kills)},
            "deaths": {"value": d.deaths, "displayValue": ignore0(d.deaths)},
            "suicides": {"value": d.suicides, "displayValue": ignore0(d.suicides)},
            "teamKills": {"value": d.team_kills, "displayValue": ignore0(d.team_kills)},
            "efficiency": {"value": d.efficiency, "displayValue": `${d.efficiency.toFixed(2)}%`},
            "shots": {"value": d.shots, "displayValue": ignore0(d.shots)},
            "hits": {"value": d.hits, "displayValue": ignore0(d.hits)},
            "acc": {"value": d.accuracy, "displayValue": `${d.accuracy.toFixed(2)}%`},
            "damage": {"value": d.damage, "displayValue": ignore0(d.damage)},
        });
    }

    return <InteractiveTable title="Totals" width={1} headers={headers} data={rows}/>
}


function renderBest(data, selectedWeapon, selectedMode){

    let headers = {
        "kills": "Kills",
        "spree": "Best Spree",
        "deaths": "Deaths",
        "suicides": "Suicides",
        "teamKills": "Team Kills",
        "efficiency": "Efficiency",
        "shots": "Shots",
        "hits": "Hits",
        "acc": "Accuracy",
        "damage": "Damage"
    };


    if(selectedMode !== 0){
        headers = Object.assign({"name": "Name"}, headers);
    }

    const rows = [];


    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.weapon !== selectedWeapon) continue;
        if(selectedMode === 0 && (d.gametype_id !== 0 || d.map_id !== 0)) continue;
        if(selectedMode === 1 && (d.gametype_id === 0 || d.map_id !== 0)) continue;
        if(selectedMode === 2 && (d.gametype_id !== 0 || d.map_id === 0)) continue;

        let name = (selectedMode === 2) ? d.mapName : d.gametypeName;

        rows.push({
            "name": {"value": name.toLowerCase(), "displayValue": name},
            "kills": {"value": d.kills, "displayValue": ignore0(d.kills)},
            "spree": {"value": d.kills_best_life, "displayValue": ignore0(d.kills_best_life)},
            "deaths": {"value": d.deaths, "displayValue": ignore0(d.deaths)},
            "suicides": {"value": d.suicides, "displayValue": ignore0(d.suicides)},
            "teamKills": {"value": d.team_kills, "displayValue": ignore0(d.team_kills)},
            "efficiency": {"value": d.efficiency, "displayValue": `${d.efficiency.toFixed(2)}%`},
            "shots": {"value": d.shots, "displayValue": ignore0(d.shots)},
            "hits": {"value": d.hits, "displayValue": ignore0(d.hits)},
            "acc": {"value": d.accuracy, "displayValue": `${d.accuracy.toFixed(2)}%`},
            "damage": {"value": d.damage, "displayValue": ignore0(d.damage)},
        });
    }

    return <InteractiveTable title="Single Match Records" width={1} headers={headers} data={rows}/>
}

function bAnyData(data){

    const targetKeys = ["damage","deaths","kills","suicides","team_kills","shots","hits"];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        for(let x = 0; x < targetKeys.length; x++){

            if(d[targetKeys[x]] > 0) return true;
        }

    }

    return false;
}

export default function PlayerWeapons({defaultDisplayMode, totals, best}){

    if(!bAnyData(totals)) return null;

    const [selectedMode, setSelectedMode] = useState(0);
    const [selectedWeapon, setSelectedWeapon] = useState(0);

    const uniqueWeapons = getUniqueWeapons(totals, best, selectedWeapon, setSelectedWeapon);



    return <>
        <div className="default-header">Weapon Stats</div>
        <Tabs options={[
            {"name": "All Time Totals", "value": 0},
            {"name": "Gametype Totals", "value": 1},
            {"name": "Map Totals", "value": 2}
        ]} selectedValue={selectedMode} changeSelected={(a) => setSelectedMode(() => a)}/>
        {renderTabs(uniqueWeapons, selectedWeapon, setSelectedWeapon)}
        {renderTotals(totals, selectedWeapon, selectedMode)}
        {renderBest(best, selectedWeapon, selectedMode)}
    </>
}
