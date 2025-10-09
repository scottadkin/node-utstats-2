"use client"
import InteractiveTable from "../InteractiveTable";
import { ignore0 } from "../../../../api/generic.mjs";

function renderData(pointNames, capsData){

    const headers = {};
    const data = {};

    for(const [id, name] of Object.entries(pointNames)){

        if(id == 0) continue;

        headers[id] = name;
        const totalCaps = capsData[id] ?? 0;

        data[id] = {"value": totalCaps, "displayValue": ignore0(totalCaps)};
    }

    return <InteractiveTable width={2} headers={headers} data={[data]}/>
}

export default function PlayerMatchDomination({data}){

    if(data === null) return null;
    if(Object.keys(data).length === 0) return null;

    return <>
        <div className="default-header">Domination Caps</div>
        {renderData(data.pointNames, data.caps)}
    </>
}