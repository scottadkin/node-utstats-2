"use client"
import { useReducer, useEffect } from "react";
import AdminMapScreenshots from "./AdminMapScreenshots";
import Tabs from "../Tabs";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import { BasicTable } from "../Tables";
import { convertTimestamp, removeUnr } from "../../../../api/generic.mjs";

function reducer(state, action){

    switch(action.type){
        case "set-mode": {
            return {
                ...state,
                "mode": action.mode
            }
        }
        case "set-map-list": {
            return {
                ...state,
                "maps": action.data,
                "prefixes": action.prefixes
            }
        }
    }

    return state;
}

function getUniquePrefixes(data){

    const found = new Set();

    const reg = /^(.+?)-.+$/i;

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        const result = reg.exec(d.name);
        if(result === null) continue;
        found.add(result[1].toUpperCase());
    }

    return [...found];
}

async function loadData(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-all-maps"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        const prefixes = getUniquePrefixes(res.data);

        dispatch({"type": "set-map-list", "data": res.data, "prefixes": prefixes});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Maps", "content": err.toString()});
    }
}


function getNameById(data, targetId){

    if(targetId === 0) return "";

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        if(d.id === targetId) return removeUnr(d.name);
    }

    return "Not Found";
}

function renderList(state){

    const headers = [
        "Name",
        "Author",
        "Last",
        "Total Matches",
        "Import As"
    ];

    const rows = state.maps.map((m) =>{
        return [
            {"className": "text-left", "value": removeUnr(m.name)},
            {"className": "small-font text-left", "value": m.author},
            {"className": "date", "value": convertTimestamp(m.last, true)},
            m.matches,
            getNameById(state.maps, m.import_as_id)
        ]
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>
}

export default function AdminMapManager(){
  
    const [state, dispatch] = useReducer(reducer, {
        "mode": "list",
        "maps": [],
        "prefixes": []
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadData(dispatch, mDispatch);

    }, []);

    const tabOptions = [
        {"name": "Current Maps", "value": "list"},
        {"name": "Edit Map", "value": "edit"},
        {"name": "Screenshots", "value": "sshots"},
    ];

    return <>
        <div className="default-header">Map Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "mode": v});
        }}/>
        <MessageBox timestamp={mState.timestamp} type={mState.type} title={mState.title}>
            {mState.content}
        </MessageBox>
        {(state.mode === "sshots") ? <AdminMapScreenshots /> : null}
        {(state.mode === "list") ? renderList(state) : null}
    </>
}