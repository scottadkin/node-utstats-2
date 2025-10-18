"use client"
import { useState } from "react";
import Tabs from "../Tabs";
import AdminClearDatabase from "./AdminClearDatabase";
import AdminFTPManager from "./AdminFTPManager";


export default function AdminMain({}){

    const [mode, setMode] = useState("ftp");

    const options = [
        {"name": "FTP Manager", "value": "ftp"},
        {"name": "Clear Database", "value": "admin-clear-database"},
    ];

    const elems = [];


    if(mode === "admin-clear-database"){
        elems.push(<AdminClearDatabase key="acd"/>);
    }

    if(mode === "ftp"){
        elems.push(<AdminFTPManager key="ftp"/>);
    }

    return <>
        <div className="default-header">Admin Control Panel</div>
        <Tabs options={options} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {elems}
    </>
}