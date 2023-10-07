import ServerQueryStatus from "../ServerQueryStatus";
import { useEffect, useReducer } from "react";
import {notificationsInitial, notificationsReducer} from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import Loading from "../Loading";

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "data": action.data
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

        dispatch({"type": "loaded", "data": res.data});
        console.log(res);

    }catch(err){

        if(err.name === "AbortError") return;
        console.trace(err);
        
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const renderList = (state) =>{

    if(state.bLoading || state.data === null) return null;
    
    const elems = [];

    for(let i = 0; i < state.data.length; i++){

        const d = state.data[i];

        elems.push(<ServerQueryStatus key={d.id} server={d}/>);
    }

    return <>
        {elems}
    </>
}

const ServerQueryList = ({}) =>{

    const [state, dispatch] = useReducer(reducer, {"bLoading": true, "data": null});
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
    </>
}

export default ServerQueryList;