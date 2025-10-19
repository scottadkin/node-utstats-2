"use client"
import { useState, useReducer, useEffect } from "react";
import Tabs from "../Tabs";
import Checkbox from "../Checkbox";
import MessageBox from "../MessageBox";
import Loading from "../Loading";
import {BasicTable} from "../Tables";
import { convertTimestamp } from "../../../../api/generic.mjs";

const DEFAULT_FORM_VALUES = {
    "enabled": 1,
    "sftp": 0,
    "name": "",
    "host": "",
    "port": 21,
    "user": "",
    "password": "",
    "folder": "",
    "deleteLogsAfterImport": 0,
    "deleteTmpFiles": 0,
    "ignoreBots": 0,
    "ignoreDuplicates": 0,
    "minPlayers": 0,
    "minPlaytime": 0,
    "importAce": 0,
    "deleteAceLogs": 0,
    "deleteAceSShots": 0
};

function reducer(state, action){

    switch(action.type){

        case "set-bInProgress": {
            return {
                ...state,
                "bInProgress": action.value
            }
        }
        case "set-server-list": {
            return {
                ...state,
                "ftpServers": action.data
            }
        }
        case "set-message": {

            return {
                ...state,
                "messageType": action.messageType,
                "messageTitle": action.title,
                "messageContent": action.content,
                "messageTimestamp": performance.now()
            }
        }

        case "update-create-form-data": {

            const data = {...state.createServerFormData};

    
            if(data[action.key] === undefined){
                throw new Error(`Unknown key`);
            }

            data[action.key] = action.value;

            return {
                ...state,
                "createServerFormData": data
            }
        }
        case "set-selected-server": {

            if(action.data === null) throw new Error(`ServerData is null!`);

            const s = {...action.data};

            const data = {
                "enabled": s.enabled,
                "sftp": s.sftp,
                "name": s.name,
                "host": s.host,
                "port": s.port,
                "user": s.user,
                "password": s.password,
                "folder": s.target_folder,
                "deleteLogsAfterImport": s.delete_after_import,
                "deleteTmpFiles": s.delete_tmp_files,
                "ignoreBots": s.ignore_bots,
                "ignoreDuplicates": s.ignore_duplicates,
                "minPlayers": s.min_players,
                "minPlaytime": s.min_playtime,
                "importAce": s.import_ace,
                "deleteAceLogs": s.delete_ace_logs,
                "deleteAceSShots": s.delete_ace_screenshots
            };
        
            return {
                ...state,
                "selectedEditServerId": action.value,
                "editServerFormData": data
            }
        }
        case "update-edit-form-data": {

            const data = {...state.editServerFormData};

    
            if(data[action.key] === undefined){
                throw new Error(`Unknown key`);
            }

            data[action.key] = action.value;

            return {
                ...state,
                "editServerFormData": data
            }
        }

        case "set-delete-server-id": {
            return {
                ...state,
                "selectedDeleteServerId": action.value
            }
        }
    }

    return state;
}



async function update(mode, e, formData, dispatch, selectedEditServerId){

    try{

        e.preventDefault();
  
        dispatch({"type": "set-bInProgress", "value": true});

        const data = {
            ...formData
        };

        
        if(mode === "edit"){
            data.id = selectedEditServerId;
        }


        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": (mode === "add") ? "add-ftp-server" : "update-ftp-server", 
                "data": data
            })
        });

        const res = await req.json();


        dispatch({"type": "set-bInProgress", "value": false});

        if(res.error !== undefined){
            dispatch({"type": "set-message", "messageType": "error", "content": res.error});
        }else{

            await loadFTPServers(dispatch);

            if(mode === "add"){
                dispatch({"type": "set-message", "messageType": "pass", "content": `Server added.`});
            }else if(mode === "edit"){
                dispatch({"type": "set-message", "messageType": "pass", "content": `Server updated successfully.`});
            }
        }

    }catch(err){
        console.trace(err);
    }
}


function getServer(ftpServers, targetId){

    targetId = parseInt(targetId);

    for(let i = 0; i < ftpServers.length;  i++){

        const f = ftpServers[i];
        if(f.id === targetId) return f;
    }

    return null;
}

function renderForm(mode, bInProgress, formData, ftpServers, selectedEditServerId, dispatch){

    if(mode !== "add" && mode !== "edit") return null;

    let type = "";

    if(mode === "add"){
        type = "update-create-form-data";
    }else if(mode === "edit"){
        type = "update-edit-form-data";
    }

    if(bInProgress){
        return <Loading>Processing...</Loading>
    }

    let dropdown = null;

    if(mode === "edit"){

        dropdown = <div className="form-row">
            <label htmlFor="target-server">Selected Server</label>
            <select className="default-select" value={selectedEditServerId} onChange={(e) =>{

                const serverData = getServer(ftpServers, e.target.value);
                dispatch({"type": "set-selected-server", "value":e.target.value, "data": serverData});
                
            }}> 
                <option value="-1">-</option>
                {ftpServers.map((f) =>{
                    return <option key={f.id} value={f.id}>{f.name}</option>
                })}
            </select>
        </div>;
    }

    return <form className="form m-bottom-10" onSubmit={(e) =>{

            update(mode, e, formData, dispatch, selectedEditServerId);
       
        }}>
        <div className="form-header">{(mode === "add") ? "Add" : "Edit"} FTP Server</div>
        {dropdown}
        <div className="form-row">
            <label htmlFor="sftp">Enabled</label>
            <Checkbox name="enabled" value={formData.enabled} setValue={(value) =>{
           
                dispatch({"type": type, "key": "enabled", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="sftp">Use SFTP</label>
            <Checkbox name="sftp" value={formData.sftp} setValue={(value) =>{
                dispatch({"type": type, "key": "sftp", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="name">Name</label>
            <input name="name" type="text" value={formData.name} className="default-textbox" onChange={(e) =>{
                dispatch({"type": type, "key": "name", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="host">Host</label>
            <input name="host" type="text"  value={formData.host} className="default-textbox" onChange={(e) =>{
                dispatch({"type": type, "key": "host", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="port">Port</label>
            <input name="port" 
                type="number" 
                value={formData.port} 
                className="default-textbox"
                onChange={(e) => { dispatch({"type": type, "key": "port", "value": e.target.value})}}
            />
        </div>
        <div className="form-row">
            <label htmlFor="user">User</label>
            <input name="user" type="text"  value={formData.user} className="default-textbox" onChange={(e) =>{
                dispatch({"type": type, "key": "user", "value": e.target.value})
            }} />
        </div>
        <div className="form-row">
            <label htmlFor="password">Password</label>
            <input name="password" type="password"  value={formData.password} className="default-textbox" onChange={(e) =>{
                dispatch({"type": type, "key": "password", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="folder">Target Folder</label>
            <input name="folder" type="text"  value={formData.folder} className="default-textbox" onChange={(e) =>{
                dispatch({"type": type, "key": "folder", "value": e.target.value})
            }} />
        </div>
        <div className="form-row">
            <label htmlFor="delete-logs-after-import">Delete Logs After Import</label>
            <Checkbox name="delete-logs-after-import" value={formData.deleteLogsAfterImport} setValue={(value) =>{
                dispatch({"type": type, "key": "deleteLogsAfterImport", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-tmp-files">Delete TMP Files</label>
            <Checkbox name="delete-tmp-files" value={formData.deleteTmpFiles} setValue={(value) =>{
                dispatch({"type": type, "key": "deleteTmpFiles", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="ignore-bots">Ignore Bots</label>
            <Checkbox name="ignore-bots" value={formData.ignoreBots} setValue={(value) =>{
                dispatch({"type": type, "key": "ignoreBots", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="ignore-duplicates">Ignore Duplicates</label>
            <Checkbox name="ignore-duplicates" value={formData.ignoreDuplicates} setValue={(value) =>{
                dispatch({"type": type, "key": "ignoreDuplicates", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="min-players">Minimum Players</label>
            <input name="min-players" type="number" value={formData.minPlayers} className="default-textbox" onChange={(e) =>{
                dispatch({"type": type, "key": "minPlayers", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="min-playtime">Minimum Playtime(seconds)</label>
            <input name="min-playtime" type="number"  value={formData.minPlaytime} className="default-textbox" onChange={(e) =>{
                dispatch({"type": type, "key": "minPlaytime", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="import-ace">Import ACE</label>
            <Checkbox name="import-ace" value={formData.importAce} setValue={(value) =>{
                dispatch({"type": type, "key": "importAce", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-ace-logs">Delete ACE Logs</label>
            <Checkbox name="delete-ace-logs" value={formData.deleteAceLogs} setValue={(value) =>{
                dispatch({"type": type, "key": "deleteAceLogs", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-ace-sshots">Delete Ace Screenshots</label>
            <Checkbox name="delete-ace-sshots"  value={formData.deleteAceSShots} setValue={(value) =>{
                dispatch({"type": type, "key": "deleteAceSShots", "value": value})
            }}/>
        </div>
        <input type="submit" value={`${(mode === "add") ? "Add" : "Edit" } FTP Server`} className="search-button"/>
    </form>
}

async function loadFTPServers(dispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "ftp-list"})
        });

        const res = await req.json();

        if(res.error !== undefined){
            dispatch({"type": "set-message", "messageType": "error", "content": res.error});
        }else{
            dispatch({"type": "set-server-list", "data": res.data});
        }



    }catch(err){
        console.trace(err);
    }
}

function renderList(mode, ftpServers){

    if(mode !== "list") return null;

    const headers = [
        "Name","SFTP", "Host", "Port", "First Import", 
        "Last Import", "Total Imports", "Min Players",
        "Min Playtime",
        "Enabled"
    ];

    const rows = ftpServers.map((f) =>{
        return [
            {"className": "text-left", "value": f.name}, 
            <Checkbox name="a" value={f.sftp}/>,      
            f.host, 
            f.port,
            {"className": "date", "value": convertTimestamp(f.first, true)},
            {"className": "date", "value": convertTimestamp(f.last, true)},
            f.total_imports,
            f.min_players,
            f.min_playtime,
            <Checkbox name="b" value={f.enabled}/>,   
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>
}

async function deleteServer(selectedServer, bInProgress, dispatch){

    try{

        if(bInProgress) return;
        dispatch({"type": "set-bInProgress", "value": true});

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-ftp-server", "id": selectedServer})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-message", "messageType": "pass", "title": "FTP Server Deleted", "content": "Successfully deleted ftp server."});
        await loadFTPServers(dispatch);
        dispatch({"type": "set-bInProgress", "value": false});


        
        
    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed to delete server", "content": err.toString()});
        dispatch({"type": "set-bInProgress", "value": false});
    }
}

function renderDelete(mode, bInProgress, servers, selectedDeleteServerId, dispatch){

    if(mode !== "delete") return null;

    if(bInProgress) return <Loading>Deleting Server Please Wait...</Loading>

    return <div className="form">
        <div className="form-header">Delete FTP Server</div>
        <div className="form-row">
            <label htmlFor="server">Selected Server</label>
            <select className="default-select" value={selectedDeleteServerId} onChange={(e) =>{
                dispatch({"type": "set-delete-server-id", "value": e.target.value});
            }}>
                <option value="-1">-</option>
                {servers.map((s) =>{
                    return <option key={s.id} value={s.id}>{s.name}</option>
                })}
            </select>
            
        </div>
        <button className="button delete-button m-top-10" onClick={() =>{
            deleteServer(selectedDeleteServerId, bInProgress, dispatch);
        }}>Delete Selected Server</button>
    </div>
}

export default function AdminFTPManager({}){

    const [mode, setMode] = useState("list");
    const [state,dispatch] = useReducer(reducer, {
        "messageType": null,
        "messageTitle": null,
        "messageContent": null,
        "messageTimestamp": 0,
        "bInProgress": false,
        "ftpServers": [],
        "createServerFormData": {...DEFAULT_FORM_VALUES},
        "editServerFormData": {...DEFAULT_FORM_VALUES},
        "selectedEditServerId": -1,
        "selectedDeleteServerId": -1,
    });

    const tabOptions = [
        {"name": "Current Servers", "value": "list"},
        {"name": "Add FTP Server", "value": "add"},
        {"name": "Edit FTP Server", "value": "edit"},
        {"name": "Delete FTP Server", "value": "delete"},
    ];


    useEffect(() =>{

        loadFTPServers(dispatch);
    },[]);


    const currentFormData = (mode === "add") ? state.createServerFormData : state.editServerFormData;


    return <>
        <div className="default-header">Admin FTP Manager</div>
        <MessageBox type={state.messageType} title={state.messageTitle} timestamp={state.messageTimestamp}>{state.messageContent}</MessageBox>

        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {renderForm(mode, state.bInProgress, currentFormData, state.ftpServers, state.selectedEditServerId, dispatch)}
        {renderList(mode, state.ftpServers)}
        {renderDelete(mode, state.bInProgress, state.ftpServers, state.selectedDeleteServerId, dispatch)}
    </>

}