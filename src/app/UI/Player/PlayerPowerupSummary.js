"use client";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import { useState } from "react";

export default function PlayerPowerupSummary({data}){

    const [selectedPowerup, setSelectedPowerup] = useState(null);
    console.log(data);

    if(data.length === 0) return null;

    let gametypeNames = new Set();
    let mapNames = new Set();
    let powerupNames = new Set();

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        powerupNames.add(d.powerupName);
        if(d.gametype_id !== 0) gametypeNames.add(d.gametypeName);
        if(d.map_id !== 0) mapNames.add(d.mapName);
    }

    gametypeNames = [...gametypeNames];
    mapNames = [...mapNames];
    powerupNames = [...powerupNames];

    console.log(powerupNames);

    const tabOptions = [];

    for(let i = 0; i < powerupNames.length; i++){

        const p = powerupNames[i];

        if(i === 0 && selectedPowerup === null){
            console.log(`reee`);
            setSelectedPowerup(() => p.toLowerCase());
        }

        tabOptions.push({"name": p, "value": p.toLowerCase()});
    }

    return <>
        <div className="default-header">Powerup Summary</div>
        <Tabs options={tabOptions} selectedValue={selectedPowerup} changeSelected={(v) =>{
            setSelectedPowerup(() => v);
        }}/>
    </>
}