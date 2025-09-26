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

    console.log(soloCaps);

    return <BasicTable width={1} headers={headers} rows={rows} columnStyles={styles}/>
}

export default function CapRecords({soloCaps, assistCaps}){

    const [mode, setMode] = useState("solo");

    const tabOptions = [
        {"name": "Solo", "value": "solo"},
        {"name": "Assisted", "value": "assisted"},
    ];

    return <div className="default">
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(v) =>{ setMode(() => v)}}/>
        {renderSoloTable(mode, soloCaps)}
    </div>
}