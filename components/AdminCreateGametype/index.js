import { useEffect, useReducer } from "react";
import NotificationsCluster from "../NotificationsCluster";
import {notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import Loading from "../Loading";

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false
            }
        }
        case "loadedGametypes": {
            return {
                ...state,
                "gametypes": action.gametypes
            }
        }
        
    }
    return state;
}

const loadData = async (dispatch, signal, nDispatch) =>{

    try{

        const req = await fetch("/api/gametypeadmin", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "all-details"})
        });

        const res = await req.json();

        console.log(res);

        dispatch({"type": "loaded"});

        if(res.error !== undefined){

            nDispatch({
                "type": "add", 
                "notification": {
                    "type": "error",
                    "content": res.error,
                    "bDisplay": true
                }
            });
            return;
        }

        dispatch({"type": "loadedGametypes", "gametypes": res});

    }catch(err){

        if(err.name === "AbortError") return;
        nDispatch({
            "type": "add", 
            "notification": {
                "type": "error",
                "content": err.toString()
            }
        });
    }
}

const renderForm = (state, dispatch) =>{

    if(state.bLoading) return null;

    return <div className="form">
        <div className="form-info">
            Create a new Gametype
        </div>
        <div className="form-row">
            <div className="form-label">
                Name
            </div>
            <input type="text" className="default-textbox" placeholder="gametype name..."/>
        </div>
    </div>
}

const AdminCreateGametype = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "gametypes": [],
        "pendingNotifications": []
    });

    //const [notifications, addNotification, hideNotification, clearAll] = useNotificationCluster();

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);


    useEffect(() =>{

        const controller = new AbortController();

        loadData(dispatch, controller.signal, nDispatch);

        return () =>{
            controller.abort();
        }

    }, []);


    return <>
        <div className="default-header">Create Gametype</div>
        <Loading value={!state.bLoading} />
        <NotificationsCluster 
            notifications={nState.notifications} 
            hide={(id) =>{ nDispatch({"type": "delete", "id": id})}} 
            clearAll={() => nDispatch({"type": "clearAll"}) }/>
        {renderForm(state, dispatch)}
    </>
}

export default AdminCreateGametype;