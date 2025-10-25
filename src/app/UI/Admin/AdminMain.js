"use client"
import { useState } from "react";
import Tabs from "../Tabs";
import AdminClearDatabase from "./AdminClearDatabase";
import AdminFTPManager from "./AdminFTPManager";
import AdminLogsFolder from "./AdminLogsFolder";
import AdminPageSettings from "./AdminPageSettings";
import AdminMapScreenshots from "./AdminMapScreenshots";
import AdminFaces from "./AdminFaces";
import AdminMatchesManager from "./AdminMatchesManager";


export default function AdminMain({}){

    const [mode, setMode] = useState("matches");

    const options = [
        {"name": "Site Settings", "value": "page-settings"},
        {"name": "FTP Manager", "value": "ftp"},
        {"name": "Logs Folder Settings", "value": "logs-folder"},
        {"name": "Matches Manager", "value": "matches"},
        {"name": "Map Screenshots", "value": "map-sshots"},
        {"name": "Player Faces", "value": "faces"},
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

    if(mode === "page-settings"){

        elems.push(<AdminPageSettings key="page-settings" />);
    }

    if(mode === "map-sshots"){

        elems.push(<AdminMapScreenshots key="map-sshots"/>);
    }

    if(mode === "faces"){

        elems.push(<AdminFaces key="faces"/>);
    }

    if(mode === "matches"){

        elems.push(<AdminMatchesManager key="matches" />);
    }

    return <>
        <div className="default-header">Admin Control Panel</div>
        <Tabs options={options} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {elems}
    </>
}