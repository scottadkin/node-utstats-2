"use client"
import { useState } from "react";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import { convertTimestamp } from "../../../../api/generic.mjs";

export default function PlayerItemsSummary({data}){

    const [mode, setMode] = useState(1);

    const tabOptions = [
        {"name": "Weapons", "value": 1},
        {"name": "Ammo", "value": 2},
        {"name": "Health & Armour", "value": 3},
        {"name": "Powerups", "value": 4},
        {"name": "Unsorted", "value": 0},
    ];

    const headers = {
        "name": "Name",
        "first": "First",
        "last": "Last",
        "matches": "Matches Used",
        "used": "Times Used",
        "average": "Average Usage Per Match"
    };

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        let avg = 0;

        if(d.uses > 0) avg = d.uses / d.matches;

        if(d.type !== mode) continue;

        rows.push({
            "name": {"value": d.itemName.toLowerCase(), "displayValue": d.itemName, "className": "text-left"},
            "first": {"value": d.first, "displayValue": convertTimestamp(d.first, true), "className": "playtime" },
            "last": {"value": d.last, "displayValue": convertTimestamp(d.last, true), "className": "playtime"},
            "matches": {"value": d.matches},
            "used": {"value": d.uses},
            "average": {"value": avg, "displayValue": avg.toFixed(2)},
        });
    }

    return <>
        <div className="default-header">Items Summary</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        <InteractiveTable width={1} headers={headers} data={rows} />
    </>
}