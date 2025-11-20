"use client"
import { useEffect, useReducer } from "react";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import Tabs from "../Tabs";
import Loading from "../Loading";

function reducer(state, action){


    switch(action.type){
        case "set-in-progress": {
            return {
                ...state,
                "bInProgress": action.value
            }
        }
        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }
        case "set-backup-files": {
            return {
                ...state,
                "files": action.files
            }
        }
        case "set-restore-in-progress": {
            return {
                ...state,
                "bRestoreInProgress": action.value
            }
        }
        case "set-selected-backup-file": {
            return {
                ...state,
                "selectedBackupFile": action.value
            }
        }
    }

    return state;
}

async function createBackup(dispatch, mDispatch){

    try{

        dispatch({"type": "set-in-progress", "value": true});

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "create-backup"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        mDispatch({"type": "set-message", "messageType": "pass", "title": "Created Backup", "content": `Backup created ${res.message}`});
        await loadBackupList(dispatch, mDispatch);

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Create Backup", "content": err.toString()});
    }

    dispatch({"type": "set-in-progress", "value": false});
}


function renderCreateBackup(state, dispatch, mDispatch){

    if(state.mode !== "create") return null;

    if(state.bInProgress){

        return <Loading>Creating backup please wait...</Loading>
    }


    return <div className="form">
        <div className="form-info">
            Create a backup of the current mysql database.
        </div>
        <button className="search-button" onClick={() =>{
            createBackup(dispatch, mDispatch);
        }}>Create Backup</button>
    </div>
}


async function loadBackupList(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-backup-files"})
        });

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-backup-files", "files": res.files});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Backup list", "content": err.toString()});
    }
}


async function restoreDatabase(state, dispatch, mDispatch){

    try{

        if(state.selectedBackupFile == "-1"){
            throw new Error(`You have not selected a file to restore from!`);
        }

        mDispatch({"type": "clear"});

        if(window.confirm("Doing this will delete all current data, are you sure you want to restore the database to a previous state")){

            dispatch({"type": "set-restore-in-progress", "value": true});

            const req = await fetch("/api/admin", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "restore-database", "fileName": state.selectedBackupFile})
            });

            const res = await req.json();

            if(res.error !== undefined) throw new Error(res.error);
            

            dispatch({"type": "set-restore-in-progress", "value": false});
            mDispatch({"type": "set-message", "messageType": "pass", "title": "Database Restored", "content": `Database restored successfully`});

        }else{
            throw new Error(`User changed their mind.`);
        }
        

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To restore database", "content": err.toString()});
        dispatch({"type": "set-restore-in-progress", "value": false});
}
    }

    

function renderRestoreFrom(state, dispatch, mDispatch){

    if(state.mode !== "restore") return null;

    return <div className="form">
        <div className="form-info">
            Restore the database to a previous state from a backup file.<br/>
            Make sure your importer is turned off while doing this to prevent possible issues.<br/>
            <div className="team-red">All current data will be deleted, make sure you backup the current database if you wish to restore to the current state.</div>
        </div>
        <div className="form-row">
            <label htmlFor="backup-file">Restore From</label>
            <select className="default-select" onChange={(e) =>{
                console.log(e.target.value, typeof e.target.value);
                dispatch({"type": "set-selected-backup-file", "value": e.target.value});
            }}>
                <option value={-1}>-- Please Select A File --</option>
                {state.files.map((f) =>{
                    return <option key={f} value={f}>{f}</option>
                })}
            </select>
        </div>
        <button className="button delete-button" onClick={() =>{
            restoreDatabase(state, dispatch, mDispatch);
        }}>Restore Database</button>
    </div>
}

export default function AdminBackupManager(){

    const [state, dispatch] = useReducer(reducer, {
        "bInProgress": false,
        "mode": "restore",
        "files": [],
        "bRestoreInProgress": false,
        "selectedBackupFile": "-1"
    });
    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadBackupList(dispatch, mDispatch);

    }, []);

    if(state.bRestoreInProgress){

        return <Loading>Restoring Database, this may take a while. Please wait until the process is finished before doing anything else.</Loading>
    }

    const tabOptions = [
        {"name": "Create Database Backup", "value": "create"},
        {"name": "Restore Database From Backup", "value": "restore"},
    ];

    return <>
        <div className="default-header">Backup Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
        <MessageBox type={mState.type} title={mState.title} timestamp={mState.timestamp}>{mState.content}</MessageBox>
        {renderCreateBackup(state, dispatch, mDispatch)}
        {renderRestoreFrom(state, dispatch, mDispatch)}
    </>
}