"use client"
import { useState } from "react";
import Tabs from "../Tabs";
import AdminClearDatabase from "./AdminClearDatabase";
import AdminFTPManager from "./AdminFTPManager";
import AdminLogsFolder from "./AdminLogsFolder";


export default function AdminMain({}){

    const [mode, setMode] = useState("logs-folder");

    const options = [
        {"name": "FTP Manager", "value": "ftp"},
        {"name": "Logs Folder Settings", "value": "logs-folder"},
        {"name": "Clear Database", "value": "admin-clear-database"},
    ];

    const elems = [];


    if(mode === "admin-clear-database"){
        elems.push(<AdminClearDatabase key="acd"/>);
    }

    if(mode === "ftp"){
        elems.push(<AdminFTPManager key="ftp"/>);
    }

    if(mode === "logs-folder"){
        elems.push(<AdminLogsFolder key="logs-folder" />);
    }

    return <>
        <div className="default-header">Admin Control Panel</div>
        <Tabs options={options} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {elems}
    </>
}