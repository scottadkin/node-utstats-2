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
        loadBackupList(dispatch, mDispatch);

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

function renderRestoreFrom(state, dispatch, mDispatch){

    if(state.mode !== "restore") return null;

    console.log(state.files);

    return <div className="form">
        <div className="form-info">
            Restore the database to a previous state from a backup file.
        </div>
        <div className="form-row">
            <label htmlFor="backup-file">Restore From</label>
            <select className="default-select">
                <option value={-1}>-- Please Select A File --</option>
                {state.files.map((f) =>{
                    return <option key={f} value={f}>{f}</option>
                })}
            </select>
        </div>
    </div>
}

export default function AdminBackupManager(){

    const [state, dispatch] = useReducer(reducer, {
        "bInProgress": false,
        "mode": "restore",
        "files": []
    });
    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadBackupList(dispatch, mDispatch);

    }, []);

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