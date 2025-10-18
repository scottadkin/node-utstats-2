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
                "messageContent": action.content
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
    }

    return state;
}

async function addServer(e, dispatch){

    try{

        e.preventDefault();
  
        dispatch({"type": "set-bInProgress", "value": true});
        const data = {};

        data.enabled = e.target.enabled.value;
        data.sftp = e.target.sftp.value;
        data.name = e.target.name.value;
        data.host = e.target.host.value;
        data.port = e.target.port.value;
        data.user = e.target.user.value;
        data.password = e.target.password.value;
        data.folder = e.target.folder.value;
        data.deleteLogsAfterImport = e.target["delete-logs-after-import"].value;
        data.deleteTmpFiles = e.target["delete-tmp-files"].value;
        data.ignoreBots = e.target["ignore-bots"].value;
        data.ignoreDuplicates = e.target["ignore-duplicates"].value;
        data.minPlayers = e.target["min-players"].value;
        data.minPlaytime = e.target["min-playtime"].value;
        data.importAce = e.target["import-ace"].value;
        data.deleteAceLogs = e.target["delete-ace-logs"].value;
        data.deleteAceSShots = e.target["delete-ace-sshots"].value;


        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "add-ftp-server", "data": data})
        });

        const res = await req.json();


        dispatch({"type": "set-bInProgress", "value": false});

        if(res.error !== undefined){
            dispatch({"type": "set-message", "messageType": "error", "content": res.error});
        }else{
            dispatch({"type": "set-message", "messageType": "pass", "content": `Server added.`});
        }

    }catch(err){
        console.trace(err);
    }
}

function renderCreateForm(mode, bInProgress, formData, dispatch){

    if(mode !== "add") return null;

    if(bInProgress){
        return <Loading>Processing...</Loading>
    }

    return <form className="form m-bottom-10" onSubmit={(e) =>{
        addServer(e, dispatch);
    }}>
        <div className="form-header">Add FTP Server</div>
        <div className="form-row">
            <label htmlFor="sftp">Enabled</label>
            <Checkbox name="enabled" value={formData.enabled} setValue={(value) =>{
                dispatch({"type": "update-create-form-data", "key": "enabled", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="sftp">Use SFTP</label>
            <Checkbox name="sftp" value={formData.sftp} setValue={(value) =>{
                dispatch({"type": "update-create-form-data", "key": "sftp", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="name">Name</label>
            <input name="name" type="text" value={formData.name} className="default-textbox" onChange={(e) =>{
                dispatch({"type": "update-create-form-data", "key": "name", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="host">Host</label>
            <input name="host" type="text"  value={formData.host} className="default-textbox" onChange={(e) =>{
                dispatch({"type": "update-create-form-data", "key": "host", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="port">Port</label>
            <input name="port" 
                type="number" 
                value={formData.port} 
                className="default-textbox"
                onChange={(e) => { dispatch({"type": "update-create-form-data", "key": "port", "value": e.target.value})}}
            />
        </div>
        <div className="form-row">
            <label htmlFor="user">User</label>
            <input name="user" type="text"  value={formData.user} className="default-textbox" onChange={(e) =>{
                dispatch({"type": "update-create-form-data", "key": "user", "value": e.target.value})
            }} />
        </div>
        <div className="form-row">
            <label htmlFor="password">Password</label>
            <input name="password" type="password"  value={formData.password} className="default-textbox" onChange={(e) =>{
                dispatch({"type": "update-create-form-data", "key": "password", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="folder">Target Folder</label>
            <input name="folder" type="text"  value={formData.folder} className="default-textbox" onChange={(e) =>{
                dispatch({"type": "update-create-form-data", "key": "folder", "value": e.target.value})
            }} />
        </div>
        <div className="form-row">
            <label htmlFor="delete-logs-after-import">Delete Logs After Import</label>
            <Checkbox name="delete-logs-after-import" value={formData.deleteLogsAfterImport} setValue={(value) =>{
                dispatch({"type": "update-create-form-data", "key": "deleteLogsAfterImport", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-tmp-files">Delete TMP Files</label>
            <Checkbox name="delete-tmp-files" value={formData.deleteTmpFiles} setValue={(value) =>{
                dispatch({"type": "update-create-form-data", "key": "deleteTmpFiles", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="ignore-bots">Ignore Bots</label>
            <Checkbox name="ignore-bots" value={formData.ignoreBots} setValue={(value) =>{
                dispatch({"type": "update-create-form-data", "key": "ignoreBots", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="ignore-duplicates">Ignore Duplicates</label>
            <Checkbox name="ignore-duplicates" value={formData.ignoreDuplicates} setValue={(value) =>{
                dispatch({"type": "update-create-form-data", "key": "ignoreDuplicates", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="min-players">Minimum Players</label>
            <input name="min-players" type="number" value={formData.minPlayers} className="default-textbox" onChange={(e) =>{
                dispatch({"type": "update-create-form-data", "key": "minPlayers", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="min-playtime">Minimum Playtime(seconds)</label>
            <input name="min-playtime" type="number"  value={formData.minPlaytime} className="default-textbox" onChange={(e) =>{
                dispatch({"type": "update-create-form-data", "key": "minPlaytime", "value": e.target.value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="import-ace">Import ACE</label>
            <Checkbox name="import-ace" value={formData.importAce} setValue={(value) =>{
                dispatch({"type": "update-create-form-data", "key": "importAce", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-ace-logs">Delete ACE Logs</label>
            <Checkbox name="delete-ace-logs" value={formData.deleteAceLogs} setValue={(value) =>{
                dispatch({"type": "update-create-form-data", "key": "deleteAceLogs", "value": value})
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-ace-sshots">Delete Ace Screenshots</label>
            <Checkbox name="delete-ace-sshots"  value={formData.deleteAceSShots} setValue={(value) =>{
                dispatch({"type": "update-create-form-data", "key": "deleteAceSShots", "value": value})
            }}/>
        </div>
        <input type="submit" value="Add FTP Server" className="search-button"/>
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

export default function AdminFTPManager({}){

    const [mode, setMode] = useState("add");
    const [state,dispatch] = useReducer(reducer, {
        "messageType": null,
        "messageTitle": null,
        "messageContent": null,
        "bInProgress": false,
        "ftpServers": [],
        "createServerFormData": {...DEFAULT_FORM_VALUES}
    });

    const tabOptions = [
        {"name": "Current Servers", "value": "list"},
        {"name": "Add FTP Server", "value": "add"},
    ];


    useEffect(() =>{

        loadFTPServers(dispatch);
    },[]);



    return <>
        <div className="default-header">Admin FTP Manager</div>
        <MessageBox type={state.messageType} title={state.messageTitle}>{state.messageContent}</MessageBox>

        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {renderCreateForm(mode, state.bInProgress, state.createServerFormData, dispatch)}
        {renderList(mode, state.ftpServers)}
    </>

}