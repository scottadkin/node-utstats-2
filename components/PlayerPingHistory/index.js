import {useReducer, useEffect} from "react";
import NotificationCluster from "../NotificationsCluster";
import {notificationsInitial, notificationsReducer} from "../../reducers/notificationsReducer";
import Loading from "../Loading";
import CustomGraph from "../CustomGraph";
import { convertTimestamp } from "../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded":{
            return {
                ...state,
                "bLoading": false,
                "data": action.data,
                "labels": action.labels
            }
        }
    }

    return state;
}

const loadData = async (controller, playerId, dispatch, nDispatch) =>{

    try{

        const req = await fetch(`/api/player?mode=ping&playerId=${playerId}`,{
            "signal": controller.signal,
        });

        const res = await req.json();
        
        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            dispatch({"type": "loaded", "data": [], "labels": []});
            return;
        }

        dispatch({"type": "loaded", "data": res.data, "labels": res.labels.map((l) =>{
            return convertTimestamp(l, true);
        })});

    }catch(err){
        if(err.name === "AbortError") return;
        console.trace(err);
    }
}

const renderGraph = (state) =>{

    if(state.bLoading) return null;

    return <CustomGraph 
        tabs={[
            {"name": "Ping", "title": "Recent Ping History"}
        ]}
        data={[state.data]}
        labels={[state.labels]}
        labelsPrefix={[""]}
    />
}

const PlayerPingHistory = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "data": [],
        "labels": []
    });

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller, playerId, dispatch, nDispatch);

        return () =>{
            controller.abort();
        }

    }, [playerId]);

    return <>
        <div className="default-header">Player Ping History</div>
        <Loading value={!state.bLoading}/>
        <NotificationCluster 
            notifications={nState.notifications} 
            hide={(id) =>{
                console.log(id);
                nDispatch({"type": "delete", "id": id});
            }}
            clearAll={() =>{
                nDispatch({"type": "clearAll"});
            }}
        />
        {renderGraph(state)}
    </>
}

export default PlayerPingHistory;