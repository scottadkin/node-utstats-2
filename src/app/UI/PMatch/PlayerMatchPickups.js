"use client"
import {useState} from "react";
import InteractiveTable from "../InteractiveTable";
import Tabs from "../Tabs";
import { ignore0 } from "../../../../api/generic.mjs";


function renderData(selectedType, items, itemUses){

    const headers = {
        "item": "Item",
        "uses": "Total Pickups"
    };

    const data = [];

    for(const [id, info] of Object.entries(items)){

        if(info.type !== selectedType) continue;

        const uses = (itemUses[id] !== undefined) ? itemUses[id] : 0;

        data.push({
            "item": {"className": "text-left", "value": info.displayName.toLowerCase(), "displayValue": info.displayName},
            "uses": {"value": uses, "displayValue": ignore0(uses)},
        });
    }

    return <InteractiveTable width={2} headers={headers} data={data} />
}

export default function PlayerMatchPickups({data}){

    const [selectedType, setSelectedType] = useState(1);

    if(data.items === null) return null;

    const tabOptions = [
        {"name": "Weapons", "value": 1},
        {"name": "Ammo", "value": 2},
        {"name": "Health & Armour", "value": 3},
        {"name": "Powerups", "value": 4},
        {"name": "Unsorted", "value": 5},
    ];
    return <>
        <div className="default-header">Pickups Summary</div>
        <Tabs options={tabOptions} selectedValue={selectedType} changeSelected={(a) => setSelectedType(a)}/>
        {renderData(selectedType, data.items, data.data)}
    </>
}
