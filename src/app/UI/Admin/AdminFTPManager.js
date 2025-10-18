"use client"
import { useReducer } from "react";
import Checkbox from "../Checkbox";


async function addServer(e){

    try{

        e.preventDefault();
  
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

        console.log(data);

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "add-ftp-server", "data": data})
        });

        const res = await req.json();
        console.log(res);

    }catch(err){
        console.trace(err);
    }
}

function renderCreateForm(){
    return <form className="form" onSubmit={addServer}>
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
            <input name="port" type="number" className="default-textbox"/>
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
            <input name="min-players" type="number" className="default-textbox"/>
        </div>
        <div className="form-row">
            <label htmlFor="min-playtime">Minimum Playtime(seconds)</label>
            <input name="min-playtime" type="number" className="default-textbox"/>
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

export default function AdminFTPManager({}){

    return <>
        <div className="default-header">Admin FTP Manager</div>
        {renderCreateForm()}
    </>

}