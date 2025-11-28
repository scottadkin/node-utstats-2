"use client"
import { useReducer, useEffect } from "react";
import AdminMapScreenshots from "./AdminMapScreenshots";
import Tabs from "../Tabs";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import { BasicTable } from "../Tables";
import { convertTimestamp, removeUnr } from "../../../../api/generic.mjs";

const INITIAL_EDIT_FORM = {
    "name": "",
    "title": "",
    "author": "",
    "idealPlayerCount": "",
    "levelEnterText": "",
    "importAs": -1
}

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
                "prefixes": action.prefixes,
                //"editForm": {...INITIAL_EDIT_FORM},
                //"selectedMap": -1
            }
        }
        case "set-selected-map": {

            let editData = {...INITIAL_EDIT_FORM};

            const current = getMapById(state.maps, action.value);


            if(current !== null && action.value !== -1){

                editData = {
                    "name": removeUnr(current.name),
                    "title": current.title,
                    "author": current.author,
                    "idealPlayerCount": current.ideal_player_count,
                    "levelEnterText": current.level_enter_text,
                    "importAs": current.import_as_id
                };

            }

            return {
                ...state,
                "selectedMap": action.value,
                "editForm": {...editData}
            }
        }
        case "update-edit-form": {

            const edit = {...state.editForm};

            edit[action.key] = action.value;

            return {
                ...state,
                "editForm": {...edit}
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

function getMapById(data, targetId){

    if(targetId === 0) return null;

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        if(d.id === targetId) return d;
    }

    return null;
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

async function saveChanges(state, dispatch, mDispatch){

    try{

        if(state.selectedMap === -1) throw new Error(`You have not selected a map to edit`);

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "save-map-changes", "targetId": state.selectedMap, "data": state.editForm})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);


        await loadData(dispatch, mDispatch);

        mDispatch({
            "type": "set-message", 
            "messageType": "pass", 
            "title": "Changes Saved", 
            "content": `Changes Saved successfully`
        });

    }catch(err){
  
        mDispatch({
            "type": "set-message", 
            "messageType": "error", 
            "title": "Failed To Save Changes", 
            "content": err.toString()
        });
    }
}

function renderEdit(state, dispatch, mDispatch){

    let elems = [];

    if(state.selectedMap !== -1){

        const importOptions = [];

        for(let i = 0; i < state.maps.length; i++){

            const m = state.maps[i];

            if(m.id === state.selectedMap) continue;
            importOptions.push(<option key={m.id} value={m.id}>{removeUnr(m.name)}</option>);
        }

        const f = state.editForm;

        elems = <>
            <div className="form-row">
                <label htmlFor="name">Name</label>
                <input name="name" type="text" className="default-textbox" value={f.name} onChange={(e) =>{
                    dispatch({"type": "update-edit-form", "key": "name", "value": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <label htmlFor="title">Title</label>
                <input name="title" type="text" className="default-textbox" value={f.title} onChange={(e) =>{
                    dispatch({"type": "update-edit-form", "key": "title", "value": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <label htmlFor="author">Author</label>
                <input name="author" type="text" className="default-textbox" value={f.author} onChange={(e) =>{
                    dispatch({"type": "update-edit-form", "key": "author", "value": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <label htmlFor="player-count">Ideal Player Count</label>
                <input name="player-count" type="text" className="default-textbox" value={f.idealPlayerCount} onChange={(e) =>{
                    dispatch({"type": "update-edit-form", "key": "idealPlayerCount", "value": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <label htmlFor="level-enter">Level Enter Text</label>
                <input name="level-enter" type="text" className="default-textbox" value={f.levelEnterText} onChange={(e) =>{
                    dispatch({"type": "update-edit-form", "key": "levelEnterText", "value": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <label htmlFor="import-as">Import As</label>
                <select className="default-select" value={f.importAs} onChange={(e) =>{
                    dispatch({"type": "update-edit-form", "key": "importAs", "value": parseInt(e.target.value)});
                }}>
                    <option value="-1">-</option>
                    {importOptions}
                </select>
            </div>
            <button className="search-button" onClick={() =>{
                saveChanges(state, dispatch, mDispatch);
            }}>
                Save Changes
            </button>
        </>

    }


    return <div className="form">
        <div className="form-info">
            Edit Map
        </div>
        <div className="form-row">
            <label htmlFor="map">Selected Map</label>
            <select className="default-select" value={state.selectedMap} onChange={(e) =>{
                dispatch({"type": "set-selected-map", "value": parseInt(e.target.value)});
            }}>
                <option value="-1">-- Please Select A Map --</option>
                {state.maps.map((m) =>{
                    return <option key={m.id} value={m.id}>{removeUnr(m.name)}</option>
                })}
            </select>
        </div>
        {elems}
    </div>
}

export default function AdminMapManager(){
  
    const [state, dispatch] = useReducer(reducer, {
        "mode": "list",
        "maps": [],
        "prefixes": [],
        "selectedMap": -1,
        "editForm": {...INITIAL_EDIT_FORM}
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
        {(state.mode === "edit") ? renderEdit(state, dispatch, mDispatch) : null}
    </>
}