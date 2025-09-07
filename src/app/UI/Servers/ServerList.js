"use client"
import Tabs from "../Tabs";
import { useState } from "react";
import { BasicTable } from "../Tables/Tables";
import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";

export default function ServerList({mapImages, mapNames, servers}){

    const [display, setDisplay] = useState("table"); 

    const tabOptions = [
        {"name": "Default View", "value": "default"},
        {"name": "Table View", "value": "table"},
    ];

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

    return <>
        <Tabs options={tabOptions} selectedValue={display} changeSelected={setDisplay} />
        <BasicTable 
        headers={["Name", "Address", "First Match", "Last Match", "Total Matches", "Playtime"]} 
        columnStyles={["text-left", null, "playtime", "playtime", null, "playtime"]}
        rows={rows}/>
    </>
}