import NotificationsCluster from "../NotificationsCluster";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import { useReducer, useEffect, useRef } from "react";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import Loading from "../Loading";
import { toPlaytime, convertTimestamp } from "../../api/generic.mjs";
import DropDown from "../DropDown";
import Countries from "../../api/countries";
import CountryFlag from "../CountryFlag";

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
        case "set-merge": {

            const fart = {
                ...state,
            }
            fart[`mergeServer${action.id}`] = action.value;

            return {
                ...fart,

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

    const allCountries = Countries("all");

    const countryOptions = [];

    for(const [code, name] of Object.entries(allCountries)){

        if(code.toLowerCase() === "uk") continue;
        countryOptions.push({"value": code, "displayValue": <><CountryFlag country={code}/> {name}</>, "name": name.toLowerCase()});
    }

    countryOptions.sort((a, b) =>{

        a = a.name;
        b = b.name;

        if(a > b) return 1;
        if(a < b) return -1;
        return 0;
    });

    countryOptions.unshift({"value": "", "displayValue": <>Please select a country</>});

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
            <DropDown fName="country" dName="Country" data={countryOptions} selectedValue={state.selectedCountry} changeSelected={(name,value) =>{
                dispatch({"type": "set-country", "value": value});
            }}/>
            
            <input type="button" className="search-button m-top-25" value="Save Changes" onClick={async () =>{
                await saveChanges(state, dispatch, editRefs, nDispatch);
            }}/>
        </div>
    </>
}

const renderMergeServers = (state, dispatch, nDispatch) =>{

    if(state.mode !== 2) return null;

    const options = state.serverList.map((s) =>{
        return {"value": s.id, "displayValue": s.name};
    });

    options.unshift({"value": -1, "displayValue": "Please select a server"});

    let noteElem = <></>;

    const s1 = getServerById(state, state.mergeServer1);
    const s2 = getServerById(state, state.mergeServer2);

    if(s1 !== null && s2 !== null){

        if(s1.id === s2.id){
            noteElem = <>
                <div className="form-info">
                    You can't merge a server into itself.
                </div>
            </>
        }else{
            noteElem = <>
                <div className="form-info">
                    <b>{s1.name}</b> will be merged into <b>{s2.name}</b>
                </div>
                <input type="button" className="search-button" value="Merge Servers"/>
            </>;
        }
    }

    return <>
        <div className="default-header">Merge Servers</div>
        <div className="form">
            <div className="form-info">
                Merge one server into another.<br/>
                <b>Example</b>: Merge Server 1 into Server 2, taking Server 2&apos;s name.<br/>
                Pretty much will just change the server id of matches where the server id was server 1, and replace it with server 2.
            </div>

          
            <DropDown dName="Server 1" fName="s1" data={options} changeSelected={(key, value) =>{

                dispatch({"type": "set-merge", "id": 1, "value": value});

            }} selectedValue={state.mergeServer1}/>

            <DropDown dName="Server 2" fName="s2" data={options} changeSelected={(key, value) =>{

                dispatch({"type": "set-merge", "id": 2, "value": value});

            }} selectedValue={state.mergeServer2}/>
  
           {noteElem}
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
        "mode": 2,
        "bLoading": false,
        "serverList": [],
        "selectedServer": -1,
        "selectedCountry": "",
        "mergeServer1": -1,
        "mergeServer2": -1,
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
                {"name": "Merge Servers", "value": 2},
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
        {renderMergeServers(state, dispatch, nDispatch)}
    </div>
}

export default AdminServersManager;