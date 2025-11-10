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
                "newGametypeName": ""
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

export default function AdminGametypeManager(){

    const [state, dispatch] = useReducer(reducer, {
        "data": [],
        "mode": "create",
        "bSaving": false,
        "newGametypeName": ""
    });

    const [mState, mDispatch] = useMessageBoxReducer();


    useEffect(() =>{
        loadData(dispatch, mDispatch);
    }, []);

    const tabOptions = [
        {"name": "Current Gametypes", "value": "list"},
        {"name": "Create Gametype", "value": "create"},
    ];

    const test = getUnsavedChanges(state);

    console.log(test);

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
    </>
}