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
import AdminPlayerManager from "./AdminPlayerManager";
import AdminRankingManager from "./AdminRankingManager";
import AdminItemManager from "./AdminItemManager";


export default function AdminMain({}){

    const [mode, setMode] = useState("items");

    const options = [
        {"name": "Site Settings", "value": "page-settings"},
        {"name": "FTP Manager", "value": "ftp"},
        {"name": "Logs Folder Settings", "value": "logs-folder"},
        {"name": "Player Manager", "value": "players"},
        {"name": "Matches Manager", "value": "matches"},
        {"name": "Rankings Manager", "value": "rankings"},
        {"name": "Items Manager", "value": "items"},
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

    if(mode === "players"){
        elems.push(<AdminPlayerManager key="matches"/>);
    }

    if(mode === "rankings"){
        elems.push(<AdminRankingManager key="rankings"/>);
    }

    if(mode === "items"){
        elems.push(<AdminItemManager key="items"/>);
    }

    return <>
        <div className="default-header">Admin Control Panel</div>
        <Tabs options={options} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {elems}
    </>
}