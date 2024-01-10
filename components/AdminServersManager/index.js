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


    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

const AdminServersManager = ({}) =>{

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    const [state, dispatch] = useReducer(reducer, {
        "mode": 0,
        "bLoading": false,
        "serverList": []
    });
    
    useEffect(() =>{
       
        const controller = new AbortController();

        loadData(controller, state, dispatch, nDispatch);

        return () =>{
            controller.abort();
        }
    },[]);

    return <>
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
    </>
}

export default AdminServersManager;