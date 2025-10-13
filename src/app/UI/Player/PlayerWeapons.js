
"use client"
import { ignore0 } from "../../../../api/generic.mjs";
import InteractiveTable from "../InteractiveTable";
import Tabs from "../Tabs";
import { useState, useEffect } from "react";

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
        return {"name": u.name, "value": u.id};
    });


    if(options.length === 0) return null;

    return <Tabs options={options} selectedValue={selected} changeSelected={(a) => setSelected(() => a)}/>
}

function renderTotals(data, selectedWeapon){

    console.log(data);

    const rows = [];

    const headers = {
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

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let name = d.gametypeName;

        rows.push({
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

export default function PlayerWeapons({defaultDisplayMode, totals, best}){


    //console.log(totals);
    console.log("best");
    console.log(best);
    const [selectedWeapon, setSelectedWeapon] = useState(0);

    const uniqueWeapons = getUniqueWeapons(totals, best, selectedWeapon, setSelectedWeapon);



    return <>
        <div className="default-header">Weapon Stats</div>
        {renderTabs(uniqueWeapons, selectedWeapon, setSelectedWeapon)}
     
    </>
}
