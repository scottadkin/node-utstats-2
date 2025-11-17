"use effect"
import { useEffect, useReducer } from "react";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import Tabs from "../Tabs";
import { BasicTable } from "../Tables";
import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";
import Loading from "../Loading";


function reducer(state, action){

    switch(action.type){

        case "load-data": {
            return {
                ...state,
                "data": action.data,
                "savedData": action.data,
                "newGametypeName": "",
                "mergeNewGametypeId": -1,
                "mergeOldGametypeId": -1,
                "selectedDeleteGametypeId": -1
            }
        }

        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }

        case "change-setting": {


            const settings = JSON.parse(JSON.stringify(state.data))
    
            if(!state.bSaving){
                for(let i = 0; i < settings.length; i++){

                    const s = settings[i];

                    if(s.id !== action.id) continue;
                    s.name = action.name;
                    s.auto_merge_id = action.importAs;
                }
            }

            return {
                ...state,
                "data": settings
            }
        }
        case "set-saving": {
            return {
                ...state,
                "bSaving": action.value
            }
        }
        case "set-new-gametype-name": {
            return {
                ...state,
                "newGametypeName": action.value
            }
        }
        case "set-merge-id": {

            const value = parseInt(action.value);

            return {
                ...state,
                "mergeNewGametypeId": (action.gametype === "new") ? value : state.mergeNewGametypeId,
                "mergeOldGametypeId": (action.gametype === "old") ? value : state.mergeOldGametypeId,
            }
        }
        case "set-selected-delete-gametype": {
            return {
                ...state,
                "selectedDeleteGametypeId": action.value
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

async function loadData(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-gametypes"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "load-data", "data": res.data});

    }catch(err){
        console.trace(err);

        mDispatch({"type": "set-message", "messageType": "error", "title": `Failed To Load Data`, "content": err.toString()});
    }
}

function getUnsavedChanges(state){

    const found = [];

    for(let i = 0; i < state.data.length; i++){

        const current = state.data[i];
        const saved = state.savedData[i];

        if(current.auto_merge_id != saved.auto_merge_id || current.name != saved.name){

            found.push(current);
        }
    }

    return found;
    
}

function renderList(state, dispatch){

    if(state.mode !== "list") return null;

    const headers = [
        "Name",
        "Last",
        "Matches",
        "Playtime",
        "Import As"
    ];


    const selectOptions = state.data.map((d) =>{
        return <option key={d.id} value={d.id}>{d.name}</option>
    });

    const rows = state.data.map((d) =>{
        return [
            <input type="text" className="default-textbox small-font" value={d.name} onChange={(e) =>{
                dispatch({"type": "change-setting", "id": d.id, "name": e.target.value, "importAs": d.auto_merge_id});
            }}/>,
            {"className": "date", "value": convertTimestamp(d.first, true)},
            d.matches,
            {"className": "playtime", "value": toPlaytime(d.playtime)},
            <select className="default-select small-font" value={d.auto_merge_id} onChange={(e) =>{
                if(parseInt(e.target.value) === d.id) return;
                dispatch({"type": "change-setting", "id": d.id, "name": d.name, "importAs": parseInt(e.target.value)});
            }}>
                <option value="0"></option>
                {selectOptions}
            </select>
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>
}

async function saveChanges(changes, dispatch, mDispatch){

    try{

        if(changes.length === 0) return;

        dispatch({"type": "set-saving", "value": true});


        const toChange = changes.map((c) =>{
            return {
                "id": c.id,
                "name": c.name,
                "mergeId": c.auto_merge_id
            };
        });


        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "save-gametype-changes", "data": toChange})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        await loadData(dispatch, mDispatch);


    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": `Failed To Save Changes`, "content": err.toString()});
    }

    dispatch({"type": "set-saving", "value": false});
}

function renderSavingInProgress(state, dispatch, mDispatch){

    const changes = getUnsavedChanges(state);

    if(!state.bSaving){

        if(changes.length > 0){

            return <div className="form m-bottom-25" style={{"backgroundColor": "var(--team-color-yellow)"}}>
                You have {changes.length} unsaved changes!<br/><br/>
                <button className="search-button" onClick={() =>{
                    saveChanges(changes, dispatch, mDispatch);
                }}>Save Changes</button>
            </div>
        }

        return null;
    } 

    return <Loading>Saving Changes Please Wait...</Loading>
}



async function createGametype(state, dispatch, mDispatch){

    try{

        mDispatch({"type": "clear"});

        if(state.newGametypeName === "") return;

        for(let i = 0; i < state.savedData.length; i++){

            const d = state.savedData[i];
            if(d.name.toLowerCase() === state.newGametypeName.toLowerCase()){
                throw new Error(`Name is already in use`);
            }
        }

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "create-gametype", "name": state.newGametypeName})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        await loadData(dispatch, mDispatch);
        mDispatch({"type": "set-message", "messageType": "pass", "title": `Created Gametype`, "content": `Gametype created successfully`});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": `Failed To Create Gametype`, "content": err.toString()});
    }
}

function renderCreateGametype(state, dispatch, mDispatch){

    if(state.mode !== "create") return null;

    return <div className="form">
        <div className="form-info">
            You may want to create a gametype to have other gametypes import as it.
        </div>
        <div className="form-row">
            <label htmlFor="name">Name</label>
            <input type="textbox" name="name" className="default-textbox" value={state.newGametypeName} onChange={(e) =>{
                dispatch({"type": "set-new-gametype-name", "value": e.target.value});
            }}/>
        </div>
        <button className="search-button" onClick={() =>{
            createGametype(state, dispatch, mDispatch);
        }}>Create Gametype</button>
    </div>
}


async function mergeGametypes(oldGametypeId, newGametypeId, dispatch, mDispatch){

    try{

        if(oldGametypeId === -1) throw new Error(`You have not selected a gametype to be merged into the new gametype`);
        if(newGametypeId === -1) throw new Error(`You have not selected a target gametype for data to be merged into`);

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "merge-gametypes", "newId": newGametypeId, "oldId": oldGametypeId})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        await loadData(dispatch, mDispatch);
        mDispatch({"type": "set-message", "messageType": "pass", "title": `Success`, "content": `Gametypes merged successfully`});

    }catch(err){

        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": `Failed To Merge Gametypes`, "content": err.toString()});
    }
}

function renderMergeGametypes(state, dispatch, mDispatch){

    if(state.mode !== "merge") return null;

    const selectOptions = state.data.map((d) =>{
        return <option key={d.id} value={d.id}>{d.name}</option>
    });

    selectOptions.unshift(<option key="-1" value="-1">- Please Select A Gametype -</option>);

    return <div className="form">
        <div className="form-info">
            Merge one gametype into another.
        </div>
        <div className="form-row">
            <label htmlFor="old-gametype">Old Gametype</label>
            <select name="old-gametype" className="default-select" value={state.mergeOldGametypeId} onChange={(e) =>{

                if(e.target.value != "-1" && parseInt(e.target.value) === state.mergeNewGametypeId) return;

                dispatch({"type": "set-merge-id", "gametype": "old", "value": e.target.value});
            }}>
                {selectOptions}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="new-gametype">New Gametype</label>
            <select name="new-gametype" className="default-select" value={state.mergeNewGametypeId} onChange={(e) =>{
                if(e.target.value != "-1" && parseInt(e.target.value) === state.mergeOldGametypeId) return;
                dispatch({"type": "set-merge-id", "gametype": "new", "value": e.target.value});
            }}>
                {selectOptions}
            </select>
        </div>
        <button className="search-button" onClick={() =>{
            mergeGametypes(state.mergeOldGametypeId, state.mergeNewGametypeId, dispatch, mDispatch);
        }}>Merge Gametypes</button>
    </div>
}


async function deleteGametype(state, dispatch, mDispatch){

    try{

        if(state.selectedDeleteGametypeId === -1) return;

        dispatch({"type": "set-delete-in-progress", "value": true});


        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-gametype", "id": state.selectedDeleteGametypeId})
        });

        const res = await req.json();
        console.log(res);

        if(res.error !== undefined) throw new Error(res.error);

        await loadData(dispatch, mDispatch);

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": `Failed To Delete Gametypes`, "content": err.toString()});
    }

    dispatch({"type": "set-delete-in-progress", "value": false});
}

function renderDeleteGametype(state, dispatch, mDispatch){

    if(state.mode !== "delete") return null;

    let elem = <button className="button delete-button" onClick={() =>{
        deleteGametype(state, dispatch, mDispatch);
    }}>Delete Gametype</button>;

    if(state.bDeleteInProgress){

        elem = <Loading>Deleting in progress please wait.</Loading>
    }

    return <div className="form">
        <div className="form-info">
            Delete a gametype and all matches and data associated with it.
        </div>
        <div className="form-row">
            <label htmlFor="gametype">Gametype</label>
            <select className="default-select" value={state.selectedDeleteGametypeId} onChange={(e) =>{
                dispatch({"type": "set-selected-delete-gametype", "value": e.target.value});
            }}>
                <option value="-1">- Please Select A Gametype -</option>
                {state.data.map((d) =>{
                    return <option key={d.id} value={d.id}>{d.name}</option>
                })}
            </select>
        </div>
        {elem}
    </div>
}

export default function AdminGametypeManager(){

    const [state, dispatch] = useReducer(reducer, {
        "data": [],
        "mode": "delete",
        "bSaving": false,
        "newGametypeName": "",
        "mergeNewGametypeId": -1,
        "mergeOldGametypeId": -1,
        "selectedDeleteGametypeId": -1,
        "bDeleteInProgress": false
    });

    const [mState, mDispatch] = useMessageBoxReducer();


    useEffect(() =>{
        loadData(dispatch, mDispatch);
    }, []);

    const tabOptions = [
        {"name": "Current Gametypes", "value": "list"},
        {"name": "Create Gametype", "value": "create"},
        {"name": "Merge Gametypes", "value": "merge"},
        {"name": "Delete Gametype", "value": "delete"},
    ];


    return <>
        <div className="default-header">Gametype Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
        <MessageBox type={mState.type} title={mState.title} timestamp={mState.timestamp}>
            {mState.content}
        </MessageBox>
        {renderSavingInProgress(state, dispatch, mDispatch)}
        {renderList(state, dispatch, mDispatch)}
        {renderCreateGametype(state, dispatch, mDispatch)}
        {renderMergeGametypes(state, dispatch, mDispatch)}
        {renderDeleteGametype(state, dispatch, mDispatch)}
    </>
}