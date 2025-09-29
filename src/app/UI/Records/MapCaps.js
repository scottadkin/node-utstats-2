"use client"
import Tabs from "../Tabs"
import { useState } from "react";
import { BasicTable } from "../Tables";
import { convertTimestamp, getOrdinal, toPlaytime } from "../../../../api/generic.mjs";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import Pagination from "../Pagination";
import { useRouter } from "next/navigation";

function renderSoloCaps(mode, caps, selectedGametype, page, perPage, mapRecord){

    if(mode !== "solo") return null;

    const headers = ["Place"];
    const styles = ["place"];

    if(selectedGametype === 0){
        headers.push("Gametype");
        styles.push(null);
    }

    headers.push("Date", "Capped By", "Cap Time", "Offset");
    styles.push("playtime", null, "playtime", "playtime");

    const rows = caps.map((c, i) =>{

        const row = [];

        const place = (page * perPage) + i  + 1;
        row.push(`${place}${getOrdinal(place)}`)

        if(selectedGametype === 0) row.push(c.gametypeName);

        row.push(convertTimestamp(c.match_date, true));

        row.push(<Link href={`/player/${c.cap_player}`}>
            <CountryFlag country={c.capPlayer.country}/>{c.capPlayer.name}
        </Link>);

        row.push(toPlaytime(c.travel_time, true));

        const diff = c.travel_time - mapRecord;

        row.push((diff === 0) ? <></> : <span className="red">+{diff.toFixed(2)}</span>);

        return row;
    });

    return <BasicTable width={(selectedGametype === 0) ? 1 : 4} headers={headers} rows={rows} columnStyles={styles}/>;
}

function renderAssistCaps(mode, caps, selectedGametype, page, perPage, mapRecord){

    if(mode !== "assist") return null;


    const headers = ["Place"];
    const styles = ["place"];

    if(selectedGametype === 0){
        headers.push("Gametype");
        styles.push(null);
    }

    styles.push("playtime");

    headers.push("Date", "Grabbed By", "Assisted By", "Capped By", "Cap Time", "Offset");
    styles.push( "small-font", "small-font", "small-font", "playtime", "red");

    const rows = caps.map((c, i) =>{

        const row = [];

        const place = (page * perPage) + i  + 1;

        row.push(`${place}${getOrdinal(place)}`);
        if(selectedGametype === 0) row.push(c.gametypeName);

        
        row.push(convertTimestamp(c.match_date, true));

        row.push(<Link href={`/player/${c.grab_player}`}>
            <CountryFlag country={c.grabPlayer.country}/>
            {c.grabPlayer.name}
        </Link>);

        
        const assistElems = [];

        if(c.assistPlayers !== undefined){

            for(let i = 0; i < c.assistPlayers.length; i++){

                const p = c.assistPlayers[i];
                assistElems.push(<Link key={i} href={`/player/${p.id}`}>

                    <CountryFlag country={p.country}/>
                    {p.name}&nbsp; 
                </Link>);
            }

        }else{
            assistElems.push(<span key={`${c.id}-dropped`} className="grey">Dropped for {toPlaytime(c.drop_time, true)}</span>);
        }

        row.push(assistElems);

        row.push(<Link href={`/player/${c.cap_player}`}>
            <CountryFlag country={c.capPlayer.country}/>
            {c.capPlayer.name}
        </Link>);

        row.push(toPlaytime(c.travel_time, true));

        const diff = c.travel_time - mapRecord;

        row.push((diff === 0) ? "" : `+${diff.toFixed(2)}`);

        return row;
    });
    

    return <BasicTable width={1} headers={headers} rows={rows} columnStyles={styles}/>;
}

export default function MapCaps({selectedType, caps, selectedGametype, selectedMap, page, perPage, totalResults, mapRecord}){

    selectedGametype = parseInt(selectedGametype);
    selectedMap = parseInt(selectedMap);
    
    const tabOptions = [
        {"name": "Solo Caps", "value": "solo"},
        {"name": "Assisted Caps", "value": "assist"}
    ];

    page = page - 1;

    const router = useRouter();

            
    return <div className="default">
        <Tabs options={tabOptions} selectedValue={selectedType} changeSelected={(v) =>{ 
            router.push(`/records/ctf-caps?type=${v}&g=${selectedGametype}&m=${selectedMap}&pp=${perPage}`);
        }}/>
        {renderSoloCaps(selectedType, caps, selectedGametype, page, perPage, mapRecord)}
        {renderAssistCaps(selectedType, caps, selectedGametype, page, perPage, mapRecord)}
        <Pagination 
            currentPage={page + 1} 
            perPage={perPage} 
            url={`/records/ctf-caps?type=${selectedType}&g=${selectedGametype}&m=${selectedMap}&pp=${perPage}&page=`} 
            results={totalResults}
        />
    </div>
}