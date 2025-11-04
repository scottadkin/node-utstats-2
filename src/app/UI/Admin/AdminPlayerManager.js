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
            return {
                ...state,
                "selectedPlayerId": parseInt(action.value)
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
                "className": "text-left"
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
        "name": "Name",
        "select": "Select Player"
    };

    return <div className="form">
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

export default function AdminPlayerManager({}){


    const [state, dispatch] = useReducer(reducer, {
        "mode": "rename",
        "playerNames": [],
        "searchName": "",
        "selectedPlayerId": -1
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
    </>
}