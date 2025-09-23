"use client"
import Tabs from "../Tabs";
import { useState } from "react";
import { BasicTable } from "../Tables/";
import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";
import  ServerDefaultView from "./ServerDefaultView";
import Link from "next/link";


function renderTable(display, servers){

    if(display !== "table") return null;

    

    const rows = servers.map((r) =>{

       
        return [
            <Link href={`/server/${r.id}`}>{r.name}</Link>,
            <Link href={`/server/${r.id}`}>{(r.display_address === "") ? "Not Set" : ""}</Link>,
            <Link href={`/server/${r.id}`}>{convertTimestamp(r.first, true)}</Link>,
            <Link href={`/server/${r.id}`}>{convertTimestamp(r.last, true)}</Link>,
            <Link href={`/server/${r.id}`}>{r.matches}</Link>,
            <Link href={`/server/${r.id}`}>{toPlaytime(r.playtime)}</Link>
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

    return <div className="t-width-1 center">{servers.map((s, i) =>{
        return <ServerDefaultView key={i} mapImages={mapImages} mapNames={mapNames} data={s}/>
    })}</div>;
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