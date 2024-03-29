"use client"
import Header from "../Header";
import { useEffect, useReducer } from "react";
import ErrorBox from "../ErrorBox";
import InteractiveTable from "../InteractiveTable";

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
        "loadError": null
    });

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller, dispatch);

        return () =>{
            console.log("aa");
            controller.abort();
        }

    },[]);

    return <div>
        <Header>FTP Manager</Header>
        <ErrorBox title="There was a problem loading FTP settings.">{state.error}</ErrorBox>
        {renderSettings(state, dispatch)}
    </div>
}