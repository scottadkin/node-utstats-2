"use client"
import Checkbox from "../Checkbox";
import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";

function reducer(state, action){

    switch(action.type){

        case "loaded-settings":{
            return {
                ...state,
                "settings": {...action.settings}
            }
        }
        case "set-message": {
            return {
                ...state,
                "messageBox": {
                    "title": action.title,
                    "type": action.messageType,
                    "content": action.content,
                    "timestamp": performance.now()
                }
            }
        }
        case "update-settings": {

            const newSettings = {...state.settings};

            newSettings[action.key] = action.value;

            return {
                ...state,
                "settings": {...newSettings}
            }
        }
    }

    return state;
}

async function saveChanges(settings, dispatch){

    try{


        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "save-logs-folder-settings", "settings": settings})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({
            "type": "set-message", 
            "messageType": "pass", 
            "title": "Changes Saved",
            "content": "Changes were successfully saved."
        });

    }catch(err){
        console.trace(err);
        dispatch({
            "type": "set-message", 
            "messageType": "error", 
            "title": "Failed To Load Log Folder Settings",
            "content": err.toString()
        });
    }
}

function renderForm(settings, dispatch){

    return <>
        <div className="form-row">
            <label htmlFor="duplicate">Ignore Duplicates</label>
            <Checkbox name="duplicate" value={settings.ignore_duplicates} setValue={(v) =>{
                dispatch({"type": "update-settings", "key": "ignore_duplicates", "value": v});
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="bots">Ignore Bots</label>
            <Checkbox name="bots" value={settings.ignore_bots}  setValue={(v) =>{
                dispatch({"type": "update-settings", "key": "ignore_bots", "value": v});
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="minPlayers">Minimum Players</label>
            <input type="number" name="minPlayers" min="0" className="default-textbox" value={settings.min_players} onChange={(e) =>{
                dispatch({"type": "update-settings", "key": "min_players", "value": e.target.value});
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="minPlaytime">Minimum Playtime(Seconds)</label>
            <input type="number" name="minPlaytime" min="0" className="default-textbox" value={settings.min_playtime}  onChange={(e) =>{
                dispatch({"type": "update-settings", "key": "min_playtime", "value": e.target.value});
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="ace">Import Ace</label>
            <Checkbox name="bots" value={settings.import_ace}  setValue={(v) =>{
                dispatch({"type": "update-settings", "key": "import_ace", "value": v});
            }}/>
        </div>
        <button className="search-button" onClick={() =>{
            saveChanges(settings, dispatch);
        }}>Save Changes</button>
    </>
}

async function loadData(dispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "load-logs-folder-settings"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded-settings", "settings": res.data});

        

    }catch(err){
        console.trace(err);
        dispatch({
            "type": "set-message", 
            "messageType": "error", 
            "title": "Failed To Load Log Folder Settings",
            "content": err.toString()
        });
    }
}


export default function AdminLogsFolder({}){

    const [state, dispatch] = useReducer(reducer, {
        "settings": {
            "ignore_bots": 0,
            "ignore_duplicates": 0,
            "min_players": 0,
            "min_playtime": 0,
            "import_ace": 0
        },
        "messageBox": {
            "title": null,
            "type": "error",
            "content": null,
            "timestamp": 0
        }
    });


    useEffect(() =>{
        loadData(dispatch);
    },[]);

    return <>
        <div className="default-header">Logs Folder Settings</div>
        <div className="form">
            <div className="form-info">
                These are the settings the importer will use if you manually place logs in the website's /Logs folder.<br/>
                These settings are also used if there is a problem with an FTP or SFTP import and log files remain in the /Logs folder.
            </div>
            <MessageBox type={state.messageBox.type} title={state.messageBox.title} timestamp={state.messageBox.timestamp}>
                {state.messageBox.content}
            </MessageBox>
            {renderForm(state.settings, dispatch)}
        </div>
        
    </>
}