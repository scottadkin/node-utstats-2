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
        case "setNewName": {
            return {
                ...state,
                "newName": action.value
            }
        }
        case "addGametype": {
            return {
                ...state,
                "newName": "",
                "gametypes": [...state.gametypes, {
                    "id": action.id, "name": action.name
                }]
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

const bGametypeAlreadyExists = (gametypes, name) =>{

    name = name.toLowerCase();

    for(let i = 0; i < gametypes.length; i++){

        const g = gametypes[i];

        const currentName = g.name.toLowerCase();

        if(currentName === name) return true;
        console.log(g);
    }

    return false;
}

const createGametype = async (dispatch, nDispatch, name) =>{

    try{


        const req = await fetch("/api/gametypeadmin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "create", "name": name})
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        if(res.message === "passed"){

            dispatch({"type": "addGametype", "id": res.id, "name": name});

            nDispatch({
                "type": "add", 
                "notification": {
                    "type": "pass", 
                    "content": <>Created gametype <b>{name}</b> successfully.</>
                }
            });
        }


        

    }catch(err){

        console.trace(err);
    }
}

const renderForm = (state, dispatch, nDispatch) =>{

    if(state.bLoading) return null;

    const bExists = bGametypeAlreadyExists(state.gametypes, state.newName);

    let elems = null;

    if(bExists){
        elems = <div className="grey p-10">
            There is already a gametype called {state.newName}, you can not create the same gametype again(gametype names are case insensitive)
        </div>
    }else if(state.newName.length > 0){
        elems = <div className="search-button" onClick={() =>{
            createGametype(dispatch, nDispatch, state.newName);
        }}>Create Gametype</div>
    }


    return <div className="form">
        <div className="form-info">
            Create a new Gametype
        </div>
        <div className="form-row">
            <div className="form-label">
                Name
            </div>
            <input 
                type="text" 
                className="default-textbox" 
                placeholder="gametype name..." 
                value={state.newName}
                onChange={(e) => dispatch({"type": "setNewName", "value": e.target.value})}
            />
        </div>
        {elems}
    </div>
}

const AdminCreateGametype = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "gametypes": [],
        "pendingNotifications": [],
        "newName": ""
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
        {renderForm(state, dispatch, nDispatch)}
    </>
}

export default AdminCreateGametype;