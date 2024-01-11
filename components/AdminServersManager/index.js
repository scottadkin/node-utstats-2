import NotificationsCluster from "../NotificationsCluster";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import { useReducer, useEffect, useRef } from "react";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import Loading from "../Loading";
import { toPlaytime, convertTimestamp } from "../../api/generic.mjs";
import CountrySearchBox from "../CountrySearchBox";
import Countries from "../../api/countries";

const reducer = (state, action) =>{

    switch(action.type){

        case "change-mode": {
            return {
                ...state,
                "mode": action.mode,
                "selectedServer": -1,
                "selectedCountry": ""
            }
        }
        case "set-loading": {
            return {
                ...state,
                "bLoading": action.value
            }
        }
        case "loaded-servers": {
            return {
                ...state,
                "bLoading": false,
                "serverList": action.data
            }
        }
        case "select-server": {
            return {
                ...state,
                "selectedServer": parseInt(action.id)
            }
        }
        case "reset-edit": {
            return {
                ...state,
                "selectedServer": -1,
                "bLoading": false
            }
        }
        case "set-country": {
            return {
                ...state,
                "selectedCountry": action.value
            }
        }
    }

    return state;
}

async function loadData(controller, dispatch, nDispatch){

    try{

        dispatch({"type": "set-loading", "value": true});

        const req = await fetch("/api/adminservers", {
            "signal": controller.signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "server-list"})
        });

        const res = await req.json();

        if(res.error) throw new Error(res.error);

        dispatch({"type": "loaded-servers", "data": res});
       
    }catch(err){
        
        if(err.name === "AbortError") return;
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const renderServerList = (state) =>{

    if(state.mode !== 0) return null;

    const headers = {
        "name": "Name",
        "address": "Address",
        "matches": "Matches",
        "playtime": "Playtime",
        "last": "Last Match"
    };

    const rows = state.serverList.map((s) =>{

        let address = "Not Set";

        if(s.ip !== "") address = `${s.ip}:${s.port}`;

        return {
            "name": {
                "value": s.name.toLowerCase(), 
                "displayValue": s.name,
                "className": "text-left"
            },
            "address": {"value": address, "displayValue": address},
            "matches": {"value": s.matches},
            "playtime": {"value": s.playtime, "displayValue": toPlaytime(s.playtime)},
            "last": {"value": s.last, "displayValue": convertTimestamp(s.last, true)},
        }
    });

    return <>
        <div className="default-header">Current Server List</div>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>;
}

const getServerById = (state, id) =>{

    id = parseInt(id);

    for(let i = 0; i < state.serverList.length; i++){

        const s = state.serverList[i];
        if(s.id === id) return s;
    }

    return null;
}

const saveChanges = async (state, dispatch, editRefs, nDispatch) =>{

    const name = editRefs.name.current.value;
    const ip = editRefs.ip.current.value;
    const port = editRefs.port.current.value;
    const password = editRefs.password.current.value;
    //const country = editRefs.country.current.value;
    if(state.selectedServer === -1){
        nDispatch({"type": "add", "notification": {"type": "error", "content": "You have not selected a server to edit."}})
        return;
    }

    if(name === ""){
        nDispatch({"type": "add", "notification": {"type": "error", "content": "Server name can not be an empty string."}})
        return;
    }

    dispatch({"type": "set-loading", "value": true});

    try{

        const req = await fetch("/api/adminservers", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "edit-server",
                "id": state.selectedServer,
                "name": name,
                "ip": ip,
                "port": port,
                "password": password,
                "country": state.selectedCountry,
            })
        });
        const res = await req.json();
        dispatch({"type": "set-loading", "value": false});

        if(res.error !== undefined) throw new Error(res.error);
        if(res.message === "passed"){

            nDispatch({"type": "add", "notification": {"type": "pass", "content": "Changes Saved."}})
            editRefs.name.current.value = "";
            editRefs.ip.current.value = "";
            editRefs.port.current.value = "";
            editRefs.password.current.value = "";
            //editRefs.country.current.value = "";
            dispatch({"type": "reset-edit"});
            return;
        }

    }catch(err){
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}})
    }
}

const renderEditServer = (state, dispatch, nDispatch, editRefs) =>{

    if(state.mode !== 1) return null;


    let currentCountry = Countries(state.selectedCountry).country;
    if(currentCountry === "Unknown") currentCountry = "";

    return <>
        <div className="default-header">Edit Server</div>
        <div className="form">
            <div className="form-info">Edit displayed server info</div>
            <div className="form-row">
                <div className="form-label">Select a Server</div>
                <select className="default-select" value={state.selectedServer} onChange={(e) =>{

                    dispatch({"type": "select-server", "id": e.target.value });

                    const server = getServerById(state, e.target.value);

                    if(server === null) return;

                    dispatch({"type": "set-country", "value": server.country});

                    const types = ["name", "ip", "port", "password"];

                    for(let i = 0; i < types.length; i++){

                        const t = types[i];
                        editRefs[t].current.value = server[t];
                    }
                }}>
                    <option value="-1">Please select a server</option>
                    {state.serverList.map((s) =>{
                        return <option key={s.id} value={s.id}>{s.name}</option>
                    })} 
                </select>
            </div>
            <div className="form-row">
                <div className="form-label">Name</div>
                <input type="text" className="default-textbox" ref={editRefs.name}/>
            </div>
            <div className="form-row">
                <div className="form-label">IP</div>
                <input type="text" className="default-textbox" ref={editRefs.ip}/>
            </div>
            <div className="form-row">
                <div className="form-label">Port</div>
                <input type="number" min="0" max="65535" className="default-textbox" ref={editRefs.port}/>
            </div>
            <div className="form-row">
                <div className="form-label">Password</div>
                <input type="text" className="default-textbox" ref={editRefs.password}/>
            </div>
            <CountrySearchBox 
                changeSelected={(country) => {
                    dispatch({"type": "set-country", "value": country});
                }} 
                selectedValue={state.selectedCountry} 
                searchTerm={currentCountry}
            />
            <input type="button" className="search-button m-top-25" value="Save Changes" onClick={async () =>{
                await saveChanges(state, dispatch, editRefs, nDispatch);
            }}/>
        </div>
    </>
}

const AdminServersManager = ({}) =>{

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    const nameRef = useRef("");
    const ipRef = useRef("");
    const portRef = useRef(7777);
    const passwordRef = useRef("");

    const editRefs = {
        "name": nameRef,
        "ip": ipRef,
        "port": portRef,
        "password": passwordRef
    };

    const [state, dispatch] = useReducer(reducer, {
        "mode": 1,
        "bLoading": false,
        "serverList": [],
        "selectedServer": -1,
        "selectedCountry": ""
    });
    
    useEffect(() =>{
       
        const controller = new AbortController();

        loadData(controller, dispatch, nDispatch);

        return () =>{
            controller.abort();
        }
    },[]);

    return <div>
        <div className="default-header">Servers Manager</div>
        <Tabs 
            options={[
                {"name": "Server List", "value": 0},
                {"name": "Edit Server", "value": 1},
            ]}
            selectedValue={state.mode}
            changeSelected={(a,b) =>{ dispatch({"type": "change-mode", "mode": a})}}
        />

        <NotificationsCluster notifications={nState.notifications} clearAll={() =>{
            nDispatch({"type": "clearAll"});
        }} hide={(id) =>{
            nDispatch({"type": "delete", "id": id});
        }}/>
        <Loading value={!state.bLoading}/>
        {renderServerList(state)}
        {renderEditServer(state, dispatch, nDispatch, editRefs)}
    </div>
}

export default AdminServersManager;