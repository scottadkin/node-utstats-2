"use client"
import Tabs from "../Tabs"
import { useState } from "react";
import { BasicTable } from "../Tables";
import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";
import Link from "next/link";
import CountryFlag from "../CountryFlag";

function renderSoloCaps(mode, caps, selectedGametype){

    if(mode !== "solo") return null;

    const headers = [];
    const styles = [];

    if(selectedGametype === 0){
        headers.push("Gametype");
        styles.push(null);
    }

    headers.push("Date", "Capped By", "Cap Time", "Offset");
    styles.push("playtime", null, "playtime", "playtime");

    let capRecord = 0;

    const rows = caps.map((c, i) =>{

        if(i === 0) capRecord = c.travel_time;
        const row = [];

        if(selectedGametype === 0) row.push(c.gametypeName);

        row.push(convertTimestamp(c.match_date, true));

        row.push(<Link href={`/player/${c.cap_player}`}>
            <CountryFlag country={c.capPlayer.country}/>{c.capPlayer.name}
        </Link>);

        row.push(toPlaytime(c.travel_time, true));

        const diff = c.travel_time - capRecord;

        row.push((diff === 0) ? <></> : <span className="red">+{diff.toFixed(2)}</span>);

        return row;
    });

    return <BasicTable width={(selectedGametype === 0) ? 1 : 4} headers={headers} rows={rows} columnStyles={styles}/>;
}

function renderAssistCaps(mode, caps, selectedGametype){

    if(mode !== "assisted") return null;

    const headers = [];
    const styles = [];

    if(selectedGametype === 0){
        headers.push("Gametype");
        styles.push(null);
    }

    styles.push("playtime");

    headers.push("Date", "Grabbed By", "Assisted By", "Capped By", "Cap Time", "Offset");
    styles.push("small-font", "small-font", "small-font", "playtime", "red");

    let capRecord = 0;

    const rows = caps.map((c, i) =>{

        if(i === 0) capRecord = c.travel_time;
        const row = [];

        if(selectedGametype === 0) row.push(c.gametypeName);

        row.push(convertTimestamp(c.match_date, true));

        row.push(<Link href={`/player/${c.grab_player}`}>
            <CountryFlag country={c.grabPlayer.country}/>
            {c.grabPlayer.name}
        </Link>);

        
        const assistElems = [];

        for(let i = 0; i < c.assistPlayers.length; i++){

            const p = c.assistPlayers[i];
            assistElems.push(<Link key={i} href={`/player/${p.id}`}>

                <CountryFlag country={p.country}/>
                {p.name}&nbsp; 
            </Link>);
        }

        row.push(assistElems);

        row.push(<Link href={`/player/${c.cap_player}`}>
            <CountryFlag country={c.capPlayer.country}/>
            {c.capPlayer.name}
        </Link>);

        row.push(toPlaytime(c.travel_time, true));

        const diff = c.travel_time - capRecord;

        row.push((diff === 0) ? "" : `+${diff.toFixed(2)}`);

        return row;
    });
    

    return <BasicTable width={1} headers={headers} rows={rows} columnStyles={styles}/>;
}

export default function MapCaps({soloCaps, assistCaps, selectedGametype}){

    const [mode, setMode] = useState("assisted");
    selectedGametype = parseInt(selectedGametype);
    
    const tabOptions = [
        {"name": "Solo Caps", "value": "solo"},
        {"name": "Assisted Caps", "value": "assisted"}
    ];

            
    return <div className="default">
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(v) =>{ setMode(() => v)}}/>
        {renderSoloCaps(mode, soloCaps, selectedGametype)}
        {renderAssistCaps(mode, assistCaps, selectedGametype)}
    </div>
}