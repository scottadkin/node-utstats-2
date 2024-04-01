"use client"
import Header from "../Header";
import { useEffect, useReducer } from "react";
import ErrorBox from "../ErrorBox";
import InteractiveTable from "../InteractiveTable";
import DropDown from "../DropDown";

async function loadData(controller, dispatch){

    try{

        const req = await fetch("/api/admin?mode=load-ftp", {
            "headers": {"Cotnent-type": "application/json"},
            "method": "GET",
            "signal": controller.signal
        });

        const res = await req.json();

        if(res.error !== undefined){
            throw new Error(res.error);
        }

        dispatch({"type": "load-settings", "ftp": res.ftp, "logsFolder": res.logsFolder});


    }catch(err){
        if(err.name === "AbortError") return;
        dispatch({"type": "loadError", "message": err.toString()});
    }
}

const reducer = function (state, action){
    
    switch(action.type){

        case "load-settings":{
            return {
                ...state,
                "loading": false,
                "ftp": action.ftp,
                "logsFolder": action.logsFolder
            }
        }

        case "loadError": {
            return {
                ...state,
                "loadError": action.message
            }
        }

        case "select-server": {
            return {
                ...state,
                "selectedServer": action.value
            }
        }
    }
    return state;
}

function renderSettings(state, dispatch){

    if(state.ftp === null && state.logsFolder === null) return null;

    const headers = {
        "active": {"title": "Enabled"},
        "method": {"title": "Protocol"},
        "name": {"title": "Name"},
        "host": {"title": "Host"},
        "port": {"title": "Port"},
        "user": {"title": "User"},
        "password": {"title": "Password"},
        "target": {"title": "Target Folder"},
        /*"delete": {"title": "Delete After Import"},
        "deleteTmp": {"title": "Delete TMP Files"},
        "bots": {"title": "Ignore Bots"},
        "duplicates": {"title": "Ignore Duplicates"},
        "minPlayers": {"title": "Min Players"},
        "minPlaytime": {"title": "Min Playtime"},*/
        "action": {"title": "Action"}
    };

    const rows = [];

    for(let i = 0; i < state.ftp.length; i++){

        const f = state.ftp[i];

        rows.push({
            "active": {"value": (f.enabled === 0) ? "False" : "True"},
            "method": {"value": (f.sftp === 0) ? "FTP" : "FTP"},
            "name": {"value": f.name.toLowerCase(), "displayValue": f.name},
            "host": {"value": f.host, "displayValue": f.host},
            "port": {"value": f.port },
            "user": {"value": f.user.toLowerCase(), "displayValue": f.user},
            "password": {"value": f.password.toLowerCase(), "displayValue": f.password},
            "target": {"value": f.target_folder.toLowerCase(), "displayValue": f.target_folder},
            /*"delete": {"value": f.delete_after_import, "displayValue": f.delete_after_import},
            "deleteTmp": {"value": f.delete_tmp_files, "displayValue": f.delete_tmp_files},
            "bots": {"value": f.ignore_bots, "displayValue": f.ignore_bots},
            "duplicates": {"value": f.ignore_duplicates, "displayValue": f.ignore_duplicates},
            "minPlayers": {"value": f.min_players},
            "minPlaytime": {"value": f.min_playtime},*/
            "action": {"value": "", "displayValue": "Select Server"}
   
        });
    }

    return <>
        <InteractiveTable headers={headers} rows={rows}/>
    </>
}

export default function FTPManager(){


    const [state, dispatch] = useReducer(reducer, {
        "loading": true,
        "ftp": null,
        "logsFolder": null,
        "loadError": null,
        "selectedServer": null
    });

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller, dispatch);

        return () =>{
            console.log("aa");
            controller.abort();
        }

    },[]);

    const testOptions = [
        {"value": "test 1", "display": <b>Bold Text</b>},
        {"value": "test 2", "display": "Normal text"},
        {"value": "test 3", "display": "Normal text 2"},
        {"value": "test 4", "display": "Normal text 3"},
        {"value": "test 5", "display": "Normal text 4"},
        {"value": "test 6", "display": "Normal text 5"},
        {"value": "test 7", "display": "Normal text 6"},
        {"value": "test 8", "display": "Normal text 7"},
        {"value": "test 9", "display": "Normal text 7"},
        {"value": "test 10", "display": "Normal text 7"},
        {"value": "test 11", "display": "Normal text 7"},
        {"value": "test 12", "display": "Normal text 7"},
        {"value": "test 13", "display": "Normal text 7"},
        {"value": "test 14", "display": "Normal text 7"},
        {"value": "test 15", "display": "Normal text 7"},
        {"value": "test 16", "display": "Normal text 7"},
        {"value": "test 17", "display": "Normal text 7"},
        {"value": "test 18", "display": "Normal text 7"},
        {"value": "test 28", "display": "Normal text 7"},
        {"value": "test 38", "display": "Normal text 7"},
        {"value": "test 48", "display": "Normal text 7"},
        {"value": "test 58", "display": "Normal text 7"},
        {"value": "test 68", "display": "Normal text 7"},
        {"value": "test 78", "display": "Normal text 7"},
        {"value": "test 88", "display": "Normal text 7"},
        {"value": "test 98", "display": "Normal text 7"},
        {"value": "test 08", "display": "Normal text 7"},
    ];

    return <div>
        <Header>FTP Manager</Header>
        <div className="form-row">
            <div className="form-label">test</div>
            <DropDown selectedValue={state.selectedServer} options={testOptions} changeSelected={(value) =>{
                console.log(value);
                dispatch({"type": "select-server", "value": value});
            }}/>
        </div>
        
        <ErrorBox title="There was a problem loading FTP settings.">{state.error}</ErrorBox>
        {renderSettings(state, dispatch)}
    </div>
}