"use client"
import Tabs from "../Tabs";
import { useState } from "react";
import { BasicTable } from "../Tables/";
import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";
import  ServerDefaultView from "./ServerDefaultView";


function renderTable(display, servers){

    if(display !== "table") return null;

    const rows = servers.map((r) =>{
        return [
            r.name,
            (r.display_address === "") ? "Not Set" : "",
            convertTimestamp(r.first, true),
            convertTimestamp(r.last, true),
            r.matches,
            toPlaytime(r.playtime)
        ];
    });

    return <BasicTable 
        headers={["Name", "Address", "First Match", "Last Match", "Total Matches", "Playtime"]} 
        columnStyles={["text-left", null, "playtime", "playtime", null, "playtime"]}
        rows={rows}
    />;
}

function renderDefault(display, servers, mapImages, mapNames){

    if(display !== "default") return null;

    return servers.map((s, i) =>{
        return <ServerDefaultView key={i} mapImages={mapImages} mapNames={mapNames} data={s}/>
    });
}

export default function ServerList({mapImages, mapNames, servers}){

    const [display, setDisplay] = useState("default"); 

    const tabOptions = [
        {"name": "Default View", "value": "default"},
        {"name": "Table View", "value": "table"},
    ];

    return <>
        <Tabs options={tabOptions} selectedValue={display} changeSelected={setDisplay} />
        {renderTable(display, servers)}
        {renderDefault(display, servers, mapImages, mapNames)}
    </>
}