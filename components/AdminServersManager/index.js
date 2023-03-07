import {useEffect, useReducer, useState} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import NotificationSmall from "../NotificationSmall";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {...state, "bLoading": false, "error": null, "serverList": action.serverList};
        }
        case "error": {
            return {"bLoading": false, "error": action.errorMessage};
        }
        case "updateName": {
            return {...state, "editName": action.value};
        }
        case "updateIp": {
            return {...state, "editIP": action.value};
        }
        case "updatePort": {
            return {...state, "editPort": action.value};
        }
        case "updatePassword": {
            return {...state, "editPassword": action.value};
        }
        case "changeSelected": {
            return {
                ...state, 
                "selectedId": action.selectedId, 
                "editName": action.name, 
                "editIP": action.ip, 
                "editPort": action.port, 
                "editPassword": action.password
            };
        }
        
    }

    return state;
}

const renderServerList = (state, dispatch) =>{

    if(state.bLoading || state.error !== null) return null;

    const headers = {
        "name": "Name",
        "ip": "IP",
        "port": "Port",
        "first": "First Match",
        "last": "Latest Match",
        "matches": "Total Matches",
        "playtime": "Playtime",
        "action": "Action"
    };

    const data = state.serverList.map((server) =>{

        const className = (server.id === state.selectedId) ?  "purple": "";

        return {
            "name": {"value": server.name.toLowerCase(), "displayValue": server.name, "className": `text-left ${className}`},
            "ip": {"value": server.ip, "className": className},
            "port": {"value": server.port, "className": className},
            "first": {"value": server.first, "displayValue": Functions.convertTimestamp(server.first, true), "className": className},
            "last": {"value": server.last, "displayValue": Functions.convertTimestamp(server.last, true), "className": className},
            "matches": {"value": server.matches, "className": className},
            "playtime": {"value": server.playtime, "displayValue": `${Functions.toHours(server.playtime)} Hours`,"className": className},
            "action": {"value": 0, "displayValue": <div onClick={() => {
                dispatch({"type": "changeSelected", "selectedId": server.id, "name": server.name, "ip": server.ip, "port": server.port, "password": server.password})

            }}>Select</div>, "className": "button hover"}
        };
    });


    return <InteractiveTable headers={headers} data={data}/>
}

const saveChanges = (state, dispatch) =>{
    console.log("SAVE");

    console.log(state.editName, state.editIP, state.editPort, state.editIp);
}

const renderSaveButton = (state, dispatch) =>{

    if(!bUnsavedData(state)) return null;

    return <div className="search-button" onClick={() => saveChanges(state, dispatch)}>Save Changes</div>
}


const renderEditForm = (state, dispatch) =>{

    return <div className="form">
        <div className="default-sub-header">Edit Server</div>
        <div className="form">
            <div className="select-row">
                <div className="select-label">Server Name</div>
                <input type="textbox" className="default-textbox" placeholder="Server Name" value={state.editName} onChange={(e) => {
          
                    dispatch({"type": "updateName", "value": e.target.value})
                }}/>
            </div>
            <div className="select-row">
                <div className="select-label">IP</div>
                <input type="textbox" className="default-textbox" placeholder="IP" value={state.editIP} onChange={(e) => {
                    dispatch({"type": "updateIp", "value": e.target.value})
                }}/>
            </div>
            <div className="select-row">
                <div className="select-label">PORT</div>
                <input type="number" className="default-textbox" placeholder="Port" min="0" value={state.editPort} onChange={(e) => {
                    dispatch({"type": "updatePort", "value": e.target.value})
                }}/>
            </div>
            <div className="select-row">
                <div className="select-label">Password</div>
                <input type="textbox" className="default-textbox" placeholder="Password..."  value={state.editPassword} onChange={(e) => {
                    dispatch({"type": "updatePassword", "value": e.target.value})
                }}/>
            </div>
        </div>
        {renderSaveButton(state, dispatch)}
        {renderUnsavedData(state)}
        
    </div>
}

const bUnsavedData = (state) =>{

    if(state.selectedId === -1) return false;

    for(let i = 0; i < state.serverList.length; i++){

        const server = state.serverList[i];

        if(server.id === state.selectedId){

            if(state.editName !== server.name) return true;
            if(state.editIP !== server.ip) return true;
            if(state.editPort !== server.port) return true;
            if(state.editPassword !== server.password) return true;
        }
    }

    return false;
}

const renderUnsavedData = (state) =>{

    if(!bUnsavedData(state)) return null;

    return <NotificationSmall type="warning">You have unsaved changes!</NotificationSmall>
}

const AdminServersManager = ({}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "serverList": [],
        "editName": "",
        "editIP": "",
        "editPort": 0,
        "editPassword": "",
        "selectedId": -1
    });


    useEffect(() =>{

        const controller = new AbortController();


        const loadData = async () =>{

            const req = await fetch("/api/admin", {
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "server-list"})
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
                return;
            }

            dispatch({"type": "loaded", "serverList": res.servers});
        }

        loadData();

        return () => controller.abort();

    },[]);


    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Servers Manager" text={state.error}/>

    return <div>
        <div className="default-header">Servers Manager</div>
        {renderServerList(state, dispatch)}
        {renderEditForm(state, dispatch)}
    </div>
}

export default AdminServersManager;