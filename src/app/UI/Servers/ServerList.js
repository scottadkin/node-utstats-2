"use client"
import Tabs from "../Tabs";
import { useState } from "react";
import BasicTable from "../BasicTable";

export default function ServerList({mapImages, mapNames, servers}){

    const [display, setDisplay] = useState("table"); 

    const tabOptions = [
        {"name": "Default View", "value": "default"},
        {"name": "Table View", "value": "table"},
    ];

    return <>
        <Tabs options={tabOptions} selectedValue={display} changeSelected={setDisplay} />
    </>
}