"use client"
import Tabs from "../Tabs";
import { useState } from "react";
import { BasicTable } from "../Tables";
import { convertTimestamp, toPlaytime, removeUnr } from "../../../../api/generic.mjs";
import Link from "next/link";
import CountryFlag from "../CountryFlag";


function renderSoloTable(mode, soloCaps){

    if(mode !== "solo") return null;

    const headers = [
        "Map", "Date", "Cap Player", "Cap Time"
    ];

    const styles = [
        "text-left",
        "playtime",
        null,
        "playtime purple"

    ];

    const rows = soloCaps.map((c) =>{

        return [
            <Link href={`/map/${c.map_id}`}>{removeUnr(c.mapName)}</Link>,
            convertTimestamp(c.date,true),
            <Link href={`/player/${c.capPlayer.id}`}>
                <CountryFlag country={c.capPlayer.country}/>
                {c.capPlayer.name}
            </Link>,
            toPlaytime(c.travel_time, true)
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows} columnStyles={styles}/>
}

function renderAssistsTable(mode, caps){

    if(mode !== "assisted") return null;

    console.log(caps);

     const headers = [
        "Map", "Date", "Grab Player", "Times Droped", "Time Dropped", "Assisted By", "Capped By", "Cap Time"
    ];

    const styles = [
        "text-left",
        "playtime",
        "small-font",
        null,
        "playtime",
        "small-font",
        "playtime",
        "small-font",
    ];

    const rows = caps.map((c) =>{

        const assistedElems = c.assistPlayers.map((p) =>{

            return <Link key={p.id} href={`/player/${p.id}`}>
                <CountryFlag country={p.country}/>
                {p.name}&nbsp;
            </Link>
        });
        
        return [
            <Link href={`/map/${c.map_id}`}>{removeUnr(c.mapName)}</Link>,
            convertTimestamp(c.date, true),
            <Link href={`/player/${c.grabPlayer.id}`}>
                <CountryFlag country={c.grabPlayer.country}/>{c.grabPlayer.name}
            </Link>,
            c.totalDrops,
            toPlaytime(c.drop_time, true),
            <>{assistedElems}</>,
            toPlaytime(c.travel_time, true),
            <Link href={`/player/${c.capPlayer.id}`}>
                <CountryFlag country={c.capPlayer.country}/>{c.capPlayer.name}
            </Link>

        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows} columnStyles={styles}/>
}

export default function CapRecords({soloCaps, assistCaps}){

    const [mode, setMode] = useState("assisted");

    const tabOptions = [
        {"name": "Solo Caps", "value": "solo"},
        {"name": "Assisted Caps", "value": "assisted"},
    ];

    return <div className="default">
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(v) =>{ setMode(() => v)}}/>
        {renderSoloTable(mode, soloCaps)}
        {renderAssistsTable(mode, assistCaps)}
    </div>
}