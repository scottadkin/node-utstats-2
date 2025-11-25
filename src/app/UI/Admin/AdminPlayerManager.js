"use client"
import Tabs from "../Tabs";
import { useReducer, useEffect } from "react";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import MessageBox from "../MessageBox";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import React from "react";
import Loading from "../Loading";


function reducer(state, action){

    switch(action.type){

        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }
        case "set-names": {
            return {
                ...state,
                "playerNames": action.data
            }
        }
        case "set-search-name": {
            return {
                ...state,
                "searchName": action.value
            }
        }
        case "set-selected-player": {

            let newId = parseInt(action.value);

            if(newId === state.selectedPlayerId) newId = -1;

            return {
                ...state,
                "selectedPlayerId": newId
            }
        }

        case "set-rename-name": {

            return {
                ...state,
                "renameName": action.value
            }
        }

        case "set-rename-in-progress": {
            return {
                ...state,
                "bRenameInProgress": action.value
            }
        }
        case "set-delete-in-progress": {
            return {
                ...state,
                "bDeleteInProgress": action.value
            }
        }
    }


    return state;
}


async function loadNames(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-all-player-names"})
        });

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-names", "data": res.data});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": `Failed To Load Player List`, "content": err.toString()});
    }
}

function renderSearchForm(state, dispatch){

    const options = [];

    for(let i = 0; i < state.playerNames.length; i++){

        const p = state.playerNames[i];
        
        if(state.searchName !== ""){

            const name = p.name.toLowerCase();

            if(!name.includes(state.searchName.toLowerCase())) continue;
        }

        options.push(<option key={p.id} value={p.id}>{p.name}</option>);

    }

    const tableHeaders = {
        "name": "Name"
    };

    return <div className="form m-bottom-25">
        <div className="form-info">Filter Players</div>
        <div className="form-row">
            <label htmlFor="name">Name</label>
            <input type="text" className="default-textbox" value={state.searchName} onChange={(e) =>{
                dispatch({"type": "set-search-name", "value": e.target.value});
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="target-player">Selected Player</label>
            <select className="default-select" onChange={(e) =>{

                const index = e.target.selectedIndex;

                if(index === 0){
                    dispatch({"type": "set-selected-player", "value": -1});
                    dispatch({"type": "set-search-name", "value": ""});
                    return;
                }

                let name = e.target[index].text ?? "";
                
                dispatch({"type": "set-selected-player", "value": parseInt(e.target.value)});
                dispatch({"type": "set-search-name", "value": name});
            }}>
                <option value="0">-- Please Select A Player --</option>
                {options}
            </select>
        </div>
    </div>
}


function getSelectedPlayerName(state){

    if(state.selectedPlayerId === -1) return "";

    for(let i = 0; i < state.playerNames.length; i++){

        const p = state.playerNames[i];
        if(p.id === state.selectedPlayerId) return <><CountryFlag country={p.country}/>{p.name}</>;
    }

    return "";
}

function bNameAlreadyTaken(playerNames, name){

    name = name.toLowerCase();

    for(let i = 0; i < playerNames.length; i++){

        const p = playerNames[i];

        if(p.name.toLowerCase() === name) return true;
    }


    return false;
}

async function renamePlayer(state, dispatch, mDispatch){

    try{

        dispatch({"type": "set-rename-in-progress", "value": true});


        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "rename-player", "playerId": state.selectedPlayerId, "newName": state.renameName})
        });


        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-rename-in-progress", "value": false});
        await loadNames(dispatch, mDispatch);

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Rename Player", "content": err.toString()});
    }
}


function renderRename(state, dispatch, mDispatch){

    if(state.mode !== "rename") return null;

    if(state.renameInProgress){
        return <Loading>Rename in progress please wait..</Loading>
    }
    //need to check if name already taken

    let elems = null;
    let renameButton = null;

    if(state.selectedPlayerId !== -1){

        const selectedPlayer = getSelectedPlayerName(state);

        elems = <>
            <div className="form-row">
                <label htmlFor="new-name">Old Name</label>
                <div>{selectedPlayer}</div>
            </div>
            <div className="form-row">
                <label htmlFor="new-name">New Name</label>
                <input type="text" className="default-textbox" value={state.renameName} onChange={(e) =>{
                    dispatch({"type": "set-rename-name", "value": e.target.value});
                }}/>
            </div>
        </>;

        if(state.renameName !== ""){

            if(bNameAlreadyTaken(state.playerNames, state.renameName)){
                renameButton = <div className="team-red padding-1">Name Already In Use</div>
            }else{
                renameButton = <button className="search-button" onClick={() =>{
                    renamePlayer(state, dispatch, mDispatch);
                }}>Rename Player</button>
            }
        }

    }else{

        elems = <div className="form-info">You have not selected a player to rename</div>;
    }

    return <div className="form">
        <div className="form-info">Rename Selected Player</div>
        {elems}
        {renameButton}
    </div>
}


async function deletePlayer(state, dispatch, mDispatch){

    try{

        dispatch({"type": "set-delete-in-progress", "value": true});

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-player", "playerId": state.selectedPlayerId})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        await loadNames(dispatch, mDispatch);
        dispatch({"type": "set-selected-player", "value": -1});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Delete Player", "content": err.toString()});
    }

    dispatch({"type": "set-delete-in-progress", "value": false});
}

function renderDeletePlayer(state, dispatch, mDispatch){

    if(state.mode !== "delete") return null;

    if(state.bDeleteInProgress){

        return <Loading>Deleting Player Please Wait</Loading>
    }

    const selectedPlayer = getSelectedPlayerName(state);



    let button = null;
    let elems = <div className="form-info">You have not selected a player to delete.</div>

    if(selectedPlayer !== ""){
        button = <button className="button delete-button" onClick={() =>{
            deletePlayer(state, dispatch, mDispatch);
        }}>Delete Player</button>
        elems = <div className="form-info">You have selected <b>{selectedPlayer}</b> to be deleted.</div>
    }


    return <div className="form">
        <div className="form-info">Delete Selected Player</div>
        {elems}

        {button}
    </div>
}

export default function AdminPlayerManager({}){


    const [state, dispatch] = useReducer(reducer, {
        "mode": "delete",
        "playerNames": [],
        "searchName": "",
        "selectedPlayerId": -1,
        "renameName": "",
        "bRenameInProgress": false
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadNames(dispatch, mDispatch);

    }, []);

    const tabOptions = [
        {"name": "Rename Player", "value": "rename"},
        {"name": "Delete Player", "value": "delete"},
    ];

    return <>
        <div className="default-header">Player Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
           // mDispatch({"type": "set-message", "messageType": "error", "title": "fart", "content": <b>test</b>});
        }}/>
        <MessageBox type={mState.type} title={mState.title} timestamp={mState.timestamp}>
            {mState.content}
        </MessageBox>
        {renderSearchForm(state, dispatch)}
        {renderRename(state, dispatch, mDispatch)}
        {renderDeletePlayer(state, dispatch, mDispatch)}
    </>
}