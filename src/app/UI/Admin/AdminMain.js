"use client"
import AdminClearDatabase from "./AdminClearDatabase";
import { useState } from "react";
import styles from "./Admin.module.css";
import Tabs from "../Tabs";


export default function AdminMain({}){

    const [mode, setMode] = useState("admin-clear-database");

    const options = [
        {"name": "Clear Database", "value": "admin-clear-database"}
    ];

    const elems = [];


    if(mode === "admin-clear-database"){
        elems.push(<AdminClearDatabase key="acd"/>);
    }

    return <>
        <div className="default-header">Admin Control Panel</div>
        <Tabs options={options} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {elems}
    </>
}