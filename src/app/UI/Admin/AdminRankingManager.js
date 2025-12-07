"use client"
import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import Tabs from "../Tabs";
import { BasicTable } from "../Tables";
import Loading from "../Loading";

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
        case "set-tab": {
            return {
                ...state,
                "selectedTab": action.value
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
        case "set-in-progress": {
            return {
                ...state,
                "bInProgress": action.value
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
            <input key="a" className="default-textbox small-font" type="number" value={s.value} onChange={(e) =>{
                dispatch({"type": "update-setting", "cat": s.cat, "name": s.name, "value": e.target.value});
            }}/>
        ]);
    }

    return <BasicTable width={1} headers={headers} rows={rows}/>
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


function renderSettingsManager(state, dispatch, mState, mDispatch){

    if(state.selectedTab !== "settings") return null;

    const uniqueCats = new Set();

    for(let i = 0; i < state.settings.length; i++){

        const s = state.settings[i];
        uniqueCats.add(s.cat);
    }

    const tabOptions = [...uniqueCats]?.map((c) =>{
        return {"name": c, "value": c};
    });

    return <><Tabs options={tabOptions} selectedValue={state.selectedCategory} changeSelected={(v) =>{
            dispatch({"type": "set-category", "value": v});
        }}/>
        {renderSaveChanges(state, dispatch, mDispatch)}
        {renderOptions(state, dispatch)}</>
}


async function recalculateRankings(dispatch, mDispatch){

    try{

        dispatch({"type": "set-in-progress", "value": true});

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "recalculate-rankings"})
        });

        const res = await req.json();

        console.log(res);
        if(res.error !== undefined) throw new Error(res.error);

        mDispatch({"type": "set-message", "messageType": "pass", "title": "Recalculated Rankings", "content": `Rankings recalculated successfully`});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Recalculate Rankings", "content": err.toString()});
    }

    dispatch({"type": "set-in-progress", "value": false});
}

function renderRecalculate(state, dispatch, mDispatch){

  
    if(state.selectedTab !== "recalculate") return null;

    let button = <button className="search-button" onClick={() =>{
        recalculateRankings(dispatch, mDispatch);
    }}>Recalculate Player Rankings</button>;

    if(state.bInProgress){
        button = <Loading>Recalculating Rankings...</Loading>
    }

    return <div className="form">
        <div className="form-info">
            Once you have modified ranking values you need to use this tools to update all the existing player rankings.
        </div>
        {button}
    </div>
}

export default function AdminRankingManager(){

    const [state, dispatch] = useReducer(reducer, {
        "selectedTab": "settings",
        "selectedCategory": "General",
        "settings": [],
        "savedSettings": [],
        "defaultSettings": [],
        "bInProgress": false
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{
        loadSettings(dispatch, mDispatch);
    }, [mDispatch]);

    

    return <>
        <div className="default-header">Ranking Manager</div>
        <Tabs options={[
            {"name": "Event Values", "value": "settings"},
            {"name": "Recalculate Rankings", "value": "recalculate"},
        ]} selectedValue={state.selectedTab} changeSelected={(v) =>{
            dispatch({"type": "set-tab", "value": v});
        }}/>
        <MessageBox type={mState.type} title={mState.title} timestamp={mState.timestamp}>{mState.content}</MessageBox>
        {renderSettingsManager(state, dispatch,mState, mDispatch)}
        {renderRecalculate(state, dispatch, mDispatch)}
    </>
}