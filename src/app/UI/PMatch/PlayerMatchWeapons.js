"use client"
import InteractiveTable from "../InteractiveTable";
import { ignore0 } from "../../../../api/generic.mjs";

function renderTable(data){

    const headers = {
        "name": "Weapon",
        "shots": "Shots",
        "hits": "Hits",
        "acc": "Accuracy",
        "kills": "Kills",
        "deaths": "Deaths",
        "eff": "Efficiency",
        "damage": "Damage"
    };

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const stats = data[i];

        rows.push({
            "name": {
                "value": stats.weaponName.toLowerCase(),
                "displayValue": stats.weaponName,
                "className": "text-left"
            },
            "shots": {"value": stats.shots, "displayValue": ignore0(stats.shots)},
            "hits": {"value": stats.hits, "displayValue": ignore0(stats.hits)},
            "acc": {"value": stats.accuracy, "displayValue": `${stats.accuracy.toFixed(2)}%`},
            "kills": {"value": stats.kills, "displayValue": ignore0(stats.kills)},
            "deaths": {"value": stats.deaths, "displayValue": ignore0(stats.deaths)},
            "eff": {"value": stats.efficiency, "displayValue": `${stats.efficiency.toFixed(2)}%`},
            "damage": {"value": stats.damage, "displayValue": ignore0(stats.damage)}
        });

    }

    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

export default function PlayerMatchWeapons({matchId, playerId, data}){

    return <>
        <div className="default-header">Weapon Stats</div>
        {renderTable(data)}
    </>
}