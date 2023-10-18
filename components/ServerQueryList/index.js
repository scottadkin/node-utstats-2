import ServerQueryStatus from "../ServerQueryStatus";
import { useEffect, useReducer } from "react";
import {notificationsInitial, notificationsReducer} from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import Loading from "../Loading";
import ServerQueryAllOnlinePlayers from "../ServerQueryAllOnlinePlayers";

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "data": action.data,
                "playerHistory": action.playerHistory,
                "mapIds": action.mapIds,
                "currentPlayers": action.currentPlayers,
                "serverNames": action.serverNames
            }
        }
    }

    return state;
}

const loadData = async (signal, nDispatch, dispatch) =>{

    try{

        const req = await fetch("/api/serverquery", {
            "signal": signal,
            "headers": {
                "Content-type": "application/json"
            },
            "method": "POST",
            "body": JSON.stringify({"mode": "list"})
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        const serverNames = {};

        for(let i = 0; i < res.data.length; i++){

            const d = res.data[i];

            serverNames[d.id] = d.server_name;
        }

        dispatch({
            "type": "loaded", 
            "data": res.data, 
            "playerHistory": res.playerHistory, 
            "mapIds": res.mapIds,
            "currentPlayers": res.currentPlayers,
            "serverNames": serverNames
        });
        console.log(res);

    }catch(err){

        if(err.name === "AbortError") return;
        console.trace(err);
        
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const getServerPlayerHistory = (data, targetServerId, mapIds) =>{

    const test = [];
    const testInfo = [];

    for(let i = 0; i < 60 * 24; i++){
        test.push(0);
        testInfo.push("N/A");
    }

    const history = {
        //"minPlayers": null,
        "maxPlayers": null,
        "data": test,
        "info": testInfo
    };


    const now = Math.floor(Date.now() * 0.001);
    const minute = 60;

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.server !== targetServerId) continue;

        if(history.maxPlayers === null || d.player_count > history.maxPlayers) history.maxPlayers = d.player_count;

        const offset = now - d.timestamp;
        let minuteOffset = Math.floor(offset / minute);
        if(minuteOffset !== minuteOffset) minuteOffset = 0;

        history.data[minuteOffset] = d.player_count;
        history.info[minuteOffset] = mapIds[d.map_id] ?? "Not Found";
     
    }


    if(history.maxPlayers === null) history.maxPlayers = 0;

    return history;
}

const renderList = (state) =>{

    if(state.bLoading || state.data === null) return null;
    
    const elems = [];

    console.log(state);

    for(let i = 0; i < state.data.length; i++){

        const d = state.data[i];

        const history = getServerPlayerHistory(state.playerHistory, d.id, state.mapIds);

  
        const onlinePlayers = state.currentPlayers.filter((p) =>{

            if(p.server === d.id){
                return true;
            }

            return false;
        });


        elems.push(<ServerQueryStatus key={d.id} server={d} history={history} players={onlinePlayers}/>);
    }

    return <>
        {elems}
    </>
}


const ServerQueryList = ({}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true, 
        "data": null, 
        "playerHistory": [], 
        "mapIds": {},
        "currentPlayers": [],
        "serverNames": {}
    });

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller.signal, nDispatch, dispatch);

        return () =>{
            controller.abort();
        }
    }, []);

    console.log(nState.notifications);

    return <>
        <div className="default-header">Server Status</div>
        <NotificationsCluster notifications={nState.notifications} hide={(id) =>{
            nDispatch({"type": "delete", "id": id});
        }} clearAll={() =>{
            nDispatch({"type": "clearAll"});
        }}/>
        <Loading value={!state.bLoading} />
        {renderList(state)}
        <ServerQueryAllOnlinePlayers state={state}/>
    </>
}

export default ServerQueryList;