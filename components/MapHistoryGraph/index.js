import { useEffect, useReducer } from "react";
import {notificationsInitial, notificationsReducer} from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import Loading from "../Loading";
import CustomGraph from "../CustomGraph";

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

const loadData = async (signal, dispatch, nDispatch, id) =>{
    
    try{

        const req = await fetch(`/api/map?mode=graph-history&id=${id}`,{
            "signal": signal
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        dispatch({"type": "loaded", "data": res});

    }catch(err){
        if(err.name === "AbortError") return;
        console.trace(err);
    }
}

const renderGraph = (state) =>{

    if(state.bLoading) return null;

    const labels = [[],[],[],[]];

    for(let i = 0; i < 365; i++){

        if(i < 24) labels[0].push(`${i}-${i + 1} Hours ago`);
        if(i < 7) labels[1].push(`${i}-${i + 1} Days ago`);
        if(i < 28) labels[2].push(`${i}-${i + 1} Days ago`);
        if(i < 365) labels[3].push(`${i}-${i + 1} Days ago`);

    }

    return <>
        <CustomGraph 
            tabs={[
                {"name": "Past 24 Hours", "title": "Matches Played In The Past 24 Hours"},
                {"name": "Past 7 Days", "title": "Matches Played In The Past 7 Days"},
                {"name": "Past 28 Days", "title": "Matches Played In The Past 28 Days"},
                {"name": "Past Year", "title": "Matches Played In The Past Year"},
            ]}
            labels={labels}
            labelsPrefix={["","","",""]}
            data={state.data}
        />    
    </>
}

const MapHistoryGraph = ({id}) =>{

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);
    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "data": []
    });

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller.signal, dispatch, nDispatch, id);

        return () =>{
            controller.abort();
        }
    }, [id]);
    
    return <>
        <div className="default-header">Games Played</div>
        <NotificationsCluster 
            notifications={nState.notifications} 
            hide={(id) =>{
            nDispatch({"type": "hide", "id": id});
            }}
            hideAll={() =>{
                nDispatch({"type": "hideAll"});
            }}
        />
        <Loading value={!state.bLoading}/>
        {renderGraph(state)}
    </>
}

export default MapHistoryGraph;