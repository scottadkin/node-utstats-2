"use client"
import { useState, useReducer, useEffect } from "react";
import Tabs from "../Tabs";
import Checkbox from "../Checkbox";
import MessageBox from "../MessageBox";
import Loading from "../Loading";
import {BasicTable} from "../Tables";
import { convertTimestamp } from "../../../../api/generic.mjs";

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

function renderCreateForm(mode, bInProgress, dispatch){

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
            <Checkbox name="enabled" initialValue={true}/>
        </div>
        <div className="form-row">
            <label htmlFor="sftp">Use SFTP</label>
            <Checkbox name="sftp"/>
        </div>
        <div className="form-row">
            <label htmlFor="name">Name</label>
            <input name="name" type="text" className="default-textbox"/>
        </div>
        <div className="form-row">
            <label htmlFor="host">Host</label>
            <input name="host" type="text" className="default-textbox"/>
        </div>
        <div className="form-row">
            <label htmlFor="port">Port</label>
            <input name="port" type="number" defaultValue={21} className="default-textbox"/>
        </div>
        <div className="form-row">
            <label htmlFor="user">User</label>
            <input name="user" type="text" className="default-textbox"/>
        </div>
        <div className="form-row">
            <label htmlFor="password">Password</label>
            <input name="password" type="password" className="default-textbox"/>
        </div>
        <div className="form-row">
            <label htmlFor="folder">Target Folder</label>
            <input name="folder" type="text" className="default-textbox"/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-logs-after-import">Delete Logs After Import</label>
            <Checkbox name="delete-logs-after-import"/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-tmp-files">Delete TMP Files</label>
            <Checkbox name="delete-tmp-files"/>
        </div>
        <div className="form-row">
            <label htmlFor="ignore-bots">Ignore Bots</label>
            <Checkbox name="ignore-bots"/>
        </div>
        <div className="form-row">
            <label htmlFor="ignore-duplicates">Ignore Duplicates</label>
            <Checkbox name="ignore-duplicates"/>
        </div>
        <div className="form-row">
            <label htmlFor="min-players">Minimum Players</label>
            <input name="min-players" type="number" defaultValue={0} className="default-textbox"/>
        </div>
        <div className="form-row">
            <label htmlFor="min-playtime">Minimum Playtime(seconds)</label>
            <input name="min-playtime" type="number" defaultValue={0} className="default-textbox"/>
        </div>
        <div className="form-row">
            <label htmlFor="import-ace">Import ACE</label>
            <Checkbox name="import-ace"/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-ace-logs">Delete ACE Logs</label>
            <Checkbox name="delete-ace-logs"/>
        </div>
        <div className="form-row">
            <label htmlFor="delete-ace-sshots">Delete Ace Screenshots</label>
            <Checkbox name="delete-ace-sshots"/>
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


        console.log(res);

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
            <Checkbox name="a" initialValue={f.sftp} bForceValue={true}/>,      
            f.host, 
            f.port,
            {"className": "date", "value": convertTimestamp(f.first, true)},
            {"className": "date", "value": convertTimestamp(f.last, true)},
            f.total_imports,
            f.min_players,
            f.min_playtime,
            <Checkbox name="b" initialValue={f.enabled} bForceValue={true}/>,   
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>
}

export default function AdminFTPManager({}){

    const [mode, setMode] = useState("list");
    const [state,dispatch] = useReducer(reducer, {
        "messageType": null,
        "messageTitle": null,
        "messageContent": null,
        "bInProgress": false,
        "ftpServers": []
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
        {renderCreateForm(mode, state.bInProgress, dispatch)}
        {renderList(mode, state.ftpServers)}
    </>

}