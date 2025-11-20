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

export default function AdminBackupManager(){

    const [state, dispatch] = useReducer(reducer, {
        "bInProgress": false,
        "mode": "create"
    });
    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        //createBackup();

    }, []);

    const tabOptions = [
        {"name": "Create Database Backup", "value": "create"}
    ];

    return <>
        <div className="default-header">Backup Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
        <MessageBox type={mState.type} title={mState.title} timestamp={mState.timestamp}>{mState.content}</MessageBox>
        {renderCreateBackup(state, dispatch, mDispatch)}
    </>
}