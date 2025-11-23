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

        let address = "";

        if(r.display_address === ""){
            address = r.ip;
        }else{
            address = r.display_address;
        }

        if(r.display_port === 0){
            address += `:${r.port}`;
        }else{
            address += `:${r.display_port}`;
        }
       
        return [
            <Link href={`/server/${r.id}`}>{(r.display_name !== "") ? r.display_name : r.name}</Link>,
            <Link href={`/server/${r.id}`}>{address}</Link>,
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