import Tabs from "../Tabs";
import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import { BasicTable } from "../Tables";
import { convertTimestamp } from "../../../../api/generic.mjs";
import {orderedCountriesArray} from "../../../../api/countries";

function reducer(state, action){

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "servers": action.servers,
                "savedServers": action.servers,
                "selected": "-1"
            }
        }
        case "set-mode": {
            return {
                ...state,
                "mode": action.mode
            }
        }
        case "set-selected": {
            return {
                ...state,
                "selected": action.value
            }
        }
        case "update-server": {

            const servers = JSON.parse(JSON.stringify(state.servers));

            const id = parseInt(state.selected);

            for(let i = 0; i < servers.length; i++){

                const s = servers[i];

                if(s.id === id){

                    s[action.key] = action.value;
                }
            }

            return {
                ...state,
                "servers": [...servers]
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
            "body": JSON.stringify({
                "mode": "load-servers"
            })
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded", "servers": res.servers});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Data", "content": err.toString()});
    }
}

function renderList(state){

    if(state.mode !== "list") return null;

    const headers = [
        "Name",
        "Address:Port",
        "Password",
        "Last Match",
        "Total Matches",
        "Display Name",
        "Display Address:Port"
    ];

    const rows = state.servers.map((s) =>{
        return [
            {"className": "text-left", "value": s.name},
            `${s.ip}:${s.port}`,
            s.password,
            {"className": "date", "value": convertTimestamp(s.last, true)},
            s.matches,
            s.display_name,
            s.display_address
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>;
}


function getSettings(servers, targetId){

    targetId = parseInt(targetId);

    for(let i = 0; i < servers.length; i++){

        const s = servers[i];
        if(s.id === targetId) return s;
    }

    return null;
}

function getUnsavedChanges(state){

    const found = [];

    for(let i = 0; i < state.servers.length; i++){

        const current = state.servers[i];
        const saved = state.savedServers[i];

        for(const [key, value] of Object.entries(current)){

            if(current[key] != saved[key]){
                found.push(current)
                break;
            }
        }
    }

    return found;
}

function renderEdit(state, dispatch, mDispatch){

    if(state.mode !== "edit") return null;

    let elems = [];

    const countries = orderedCountriesArray();

    if(state.selected !== "-1"){

        const settings = getSettings(state.servers, state.selected);

        if(settings === null){
            //mDispatch({"type": "set-message", "messageType": "error", "content": `Setting does not exist`});
            //return;
            throw new Error(`Setting does not exist`);
        }

        elems = <>
            <div className="form-row">
                <label htmlFor="display-name">Display Name</label>
                <input name="display-name" type="text" value={settings.display_name} className="default-textbox" onChange={(e) =>{
                    dispatch({"type": "update-server", "key": "display_name", "value": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <label htmlFor="display-address">Display Address</label>
                <input name="display-address"  value={settings.display_address} type="text" className="default-textbox" onChange={(e) =>{
                    dispatch({"type": "update-server", "key": "display_address", "value": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <label htmlFor="display-port">Display Port</label>
                <input name="display-port" type="number"  value={settings.display_port} className="default-textbox" onChange={(e) =>{
                    dispatch({"type": "update-server", "key": "display_port", "value": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <label htmlFor="password">Password</label>
                <input name="password" type="number"  value={settings.password} className="default-textbox" onChange={(e) =>{
                    dispatch({"type": "update-server", "key": "password", "value": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <label htmlFor="country">Country</label>
                <select className="default-select" value={settings.country} onChange={(e) =>{
                    dispatch({"type": "update-server", "key": "country", "value": e.target.value});
                }}>
                    <option value="xx">-- Please Select A Country</option>
                    {countries.map((c) =>{
                        return <option key={c.code} value={c.code}>{c.name}</option>
                    })}
                </select>
            </div>
            <button className="search-button">Update Server</button>
        </>
    }


    return <>
        <div className="form m-bottom-25">
            <div className="form-info">
                Edit Server
            </div>
            <div className="form-row">
                <label htmlFor="server">Selected Server</label>
                <select name="server" value={state.selected} className="default-select" onChange={(e) =>{
                    dispatch({"type": "set-selected", "value": e.target.value});
                }}>
                    <option value="-1">
                        -- Please Select A Server --
                    </option>
                    {state.servers.map((s) =>{
                        return <option key={s.id} value={s.id}>{s.name}</option>
                    })}
                </select>
            </div>
            {elems}
        </div>
    </>;
}

async function saveChanges(changes, dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "save-server-changes", "changes": changes})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        await loadData(dispatch, mDispatch);
        mDispatch({"type": "set-message", "messageType": "pass", "title": "Changes Saved", "content": `All changes saved successfully`});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed to save changes", "content": err.toString()});
    }
}

function renderUnsavedChanges(state, dispatch, mDispatch){

    const changes = getUnsavedChanges(state);

    if(changes.length === 0) return null;

    return <div className="form-info t-width-1 center m-bottom-25" style={{"backgroundColor": "var(--team-color-yellow)"}}>
        You have {changes.length} unsaved changes.<br/>
        <button className="search-button" onClick={() =>{
            saveChanges(changes, dispatch, mDispatch);
        }}>Save Changes</button>
    </div>
}

export default function AdminServersManager(){

    const [state, dispatch] = useReducer(reducer, {
        "servers": [],
        "savedServers": [],
        "mode": "edit",
        "selected": "-1"
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadData(dispatch, mDispatch);
    }, []);


    const tabOptions = [
        {"name": "Server List", "value": "list"},
        {"name": "Edit Server", "value": "edit"},
    ];

    return <>
        <div className="default-header">Server Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "mode": v});
        }}/>
        <MessageBox timestamp={mState.timestamp} type={mState.type} title={mState.title}>{mState.content}</MessageBox>
        <div className="form m-bottom-25">
            <div className="form-info">
                Display name overrides what the website displays as the server name on the website.<br/>
                Display address overrides the IP address that is displayed for the server.<br/>
                Display port overrides the port that is displayed for the server.<br/>
                If you don't set a display name and display address, name, ip, and port are updated based on the last log that the improter parased.

            </div>
        </div>
        {renderUnsavedChanges(state, dispatch, mDispatch)}
        {renderList(state)}
        {renderEdit(state, dispatch, mDispatch)}
    </>
}