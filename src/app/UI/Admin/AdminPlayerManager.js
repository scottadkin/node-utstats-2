"use client"
import Tabs from "../Tabs";
import { useReducer, useEffect } from "react";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import MessageBox from "../MessageBox";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import React from "react";


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

    const rows = [];

    for(let i = 0; i < state.playerNames.length; i++){

        const p = state.playerNames[i];
        
        if(state.searchName !== ""){

            const name = p.name.toLowerCase();

            if(!name.includes(state.searchName.toLowerCase())) continue;
        }

        rows.push({
            "name": {
                "value": p.name.toLowerCase(), 
                "displayValue": <React.Fragment><CountryFlag country={p.country}/>{p.name}</React.Fragment>,
                "className": (state.selectedPlayerId === p.id) ? "team-green text-left" : "team-grey text-left",
                "onClick": () =>{
                    dispatch({"type": "set-selected-player", "value": p.id});
                }
            },
            "select": {
                "value": null,
                "displayValue": (state.selectedPlayerId === p.id) ? "Selected"  : "",
                "className": (state.selectedPlayerId === p.id) ? "team-green" : "team-grey" ,
                "onClick": () =>{
                    dispatch({"type": "set-selected-player", "value": p.id});
                }
            }
        });

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
        <InteractiveTable width={2} perPage={5} headers={tableHeaders} bDisableSorting={true} data={rows}/>
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

function renderRename(state, dispatch){


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
            renameButton = <button className="search-button">Rename Player</button>
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


export default function AdminPlayerManager({}){


    const [state, dispatch] = useReducer(reducer, {
        "mode": "rename",
        "playerNames": [],
        "searchName": "",
        "selectedPlayerId": -1,
        "renameName": ""
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadNames(dispatch, mDispatch);

    }, []);

    const tabOptions = [
        {"name": "Rename Player", "value": "rename"}
    ];

    return <>
        <div className="default-header">Player Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
            mDispatch({"type": "set-message", "messageType": "error", "title": "fart", "content": <b>test</b>});
        }}/>
        <MessageBox type={mState.type} title={mState.title} timestamp={mState.timestamp}>
            {mState.content}
        </MessageBox>
        {renderSearchForm(state, dispatch)}
        {renderRename(state, dispatch)}
    </>
}