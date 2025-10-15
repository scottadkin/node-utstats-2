"use client"
import Tabs from "../Tabs";
import { useState } from "react";

export default function PlayerTeleFrags({data}){

    const [mode, setMode] = useState(0);

    const tabOptions = [
        {"name": "Telefrags", "value": 0},
        {"name": "Disc Kills", "value": 1},
    ];

    return <>
        <div className="default-header">Telefrags Summary</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
    </>
}