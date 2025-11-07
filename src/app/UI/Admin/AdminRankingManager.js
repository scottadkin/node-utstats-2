"use client"
import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import Tabs from "../Tabs";
import { BasicTable } from "../Tables";

function reducer(state, action){

    switch(action.type){
        case "set-settings": {
            return {
                ...state,
                "settings": action.current,
                "savedSettings": action.current,
                "defaultSettings": action.defaultSettings
            }
        }
        case "set-category": {
            return {
                ...state,
                "selectedCategory": action.value
            }
        }
        case "update-setting": {

            const settings = JSON.parse(JSON.stringify(state.settings));

            for(let i = 0; i < settings.length; i++){

                const s = settings[i];

                if(s.cat === action.cat && s.name === action.name){
                    s.value = action.value;
                    break;
                }
            }

            return {
                ...state,
                "settings": settings
            }
        }
    }
    return state;
}

async function loadSettings(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "load-ranking-values"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-settings", "current": res.current, "defaultSettings": res.defaultValues});

    }catch(err){

        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Settings", "content": err.toString()});
    }
}

function renderOptions(state, dispatch){

    const headers = ["Name", "Description", "Value"];
    const rows = [];

    for(let i = 0; i < state.settings.length; i++){

        const s = state.settings[i];

        if(s.cat !== state.selectedCategory) continue;

        rows.push([
            {"className": "text-left", "value": s.display_name},
            {"className": "small-font text-left", "value": s.description},
            <input className="default-textbox small-font" type="number" value={s.value} onChange={(e) =>{
                dispatch({"type": "update-setting", "cat": s.cat, "name": s.name, "value": e.target.value});
            }}/>
        ]);
    }

    return <BasicTable width={1} headers={headers} rows={rows}/>
}

function bAnyUnsavedChanges(state){


    const current = state.settings;
    const saved = state.savedSettings;

    for(let i = 0; i < current.length; i++){

        const c = current[i];
        const s = saved[i];

        if(c.value != s.value) return true;
    }

    return false;
}

function getChangedSettings(state){

    const changed = [];

    for(let i = 0; i < state.settings.length; i++){

        const saved = state.savedSettings[i];
        const current = state.settings[i];

        if(saved.value != current.value) changed.push({"id": current.id, "value": current.value});
    }

    return changed;
}

async function saveChanges(changedSettings, dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "save-ranking-changes", "data": changedSettings})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        await loadSettings(dispatch, mDispatch);

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Save Changes", "content": err.toString()});
    }
}

function renderSaveChanges(state, dispatch, mDispatch){

    //if(!bAnyUnsavedChanges(state)) return;

    const changedSettings = getChangedSettings(state);

    if(changedSettings.length === 0) return;

    return <div className="form m-bottom-25" style={{"backgroundColor": "var(--team-color-yellow)"}}>
        <div className="form-info">
            You have <b>{changedSettings.length}</b> unsaved changes.
            <br/><br/>
            <button className="search-button" onClick={() =>{
                saveChanges(changedSettings, dispatch, mDispatch);
            }}>Save Changes</button>
        </div>
    </div>
}

export default function AdminRankingManager(){

    const [state, dispatch] = useReducer(reducer, {
        "selectedCategory": "General",
        "settings": [],
        "savedSettings": [],
        "defaultSettings": []
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{
        loadSettings(dispatch, mDispatch);
    }, []);

    const uniqueCats = new Set();

    for(let i = 0; i < state.settings.length; i++){

        const s = state.settings[i];
        uniqueCats.add(s.cat);
    }

    const tabOptions = [...uniqueCats]?.map((c) =>{
        return {"name": c, "value": c};
    });

    return <>
        <div className="default-header">Ranking Manager</div>
        <Tabs options={tabOptions} selectedValue={state.selectedCategory} changeSelected={(v) =>{
            dispatch({"type": "set-category", "value": v});
        }}/>
        <MessageBox type={mState.type} title={mState.title} timestamp={mState.timestamp}>{mState.content}</MessageBox>
        {renderSaveChanges(state, dispatch, mDispatch)}
        {renderOptions(state, dispatch)}
    </>
}