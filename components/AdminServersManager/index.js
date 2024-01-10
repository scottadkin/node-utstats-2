import NotificationsCluster from "../NotificationsCluster";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import { useReducer, useEffect } from "react";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import Loading from "../Loading";
import { toPlaytime, convertTimestamp } from "../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){

        case "change-mode": {
            return {
                ...state,
                "mode": action.mode
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
                "selectedServer": action.value
            }
        }
    }

    return state;
}

async function loadData(controller, state, dispatch, nDispatch){

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
        console.log(res);
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

const renderEditServer = (state, dispatch) =>{

    if(state.mode !== 1) return null;

    return <>
        <div className="default-header">Edit Server</div>
        <div className="form">
            <div className="form-info">Edit displayed server info</div>
            <div className="form-row">
                <div className="form-label">Select a Server</div>
                <select className="default-select" value={state.selectedServer} onChange={(e) =>{
                    dispatch({"type": "select-server", "id": e.target.value});
                }}>
                    <option value="-1">Please select a server</option>
                    {state.serverList.map((s) =>{
                        return <option key={s.id} value={s.id}>{s.name}</option>
                    })} 
                </select>
            </div>
            <div className="form-row">
                <div className="form-label">Name</div>
                <input type="text" className="default-textbox"/>
            </div>
            <div className="form-row">
                <div className="form-label">IP</div>
                <input type="text" className="default-textbox"/>
            </div>
            <div className="form-row">
                <div className="form-label">Port</div>
                <input type="number" min="0" max="65535" className="default-textbox"/>
            </div>
            <div className="form-row">
                <div className="form-label">Password</div>
                <input type="text" className="default-textbox"/>
            </div>
            <div className="form-row">
                <div className="form-label">Country</div>
                <input type="text" className="default-textbox"/>
            </div>
            <input type="button" className="search-button m-top-25" value="Save Changes"/>
        </div>
    </>
}

const AdminServersManager = ({}) =>{

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    const [state, dispatch] = useReducer(reducer, {
        "mode": 1,
        "bLoading": false,
        "serverList": [],
        "selectedServer": -1
    });
    
    useEffect(() =>{
       
        const controller = new AbortController();

        loadData(controller, state, dispatch, nDispatch);

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
        {renderEditServer(state, dispatch)}
    </div>
}

export default AdminServersManager;