"use client"
import { useEffect, useReducer } from "react";
import Tabs from "../Tabs";
import MessageBox from "../MessageBox";
import { BasicTable } from "../Tables";
import { convertTimestamp } from "../../../../api/generic.mjs";
import Loading from "../Loading";
import { useRouter } from "next/navigation";

function reducer(state, action){

    switch(action.type){

        case "set-info": {
            return {
                ...state,
                "data": action.data
            }
        }
        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }
        case "set-message": {
            return {
                ...state,
                "messageBox": {
                    "type": action.messageType,
                    "title": action.title,
                    "content": action.content,
                    "timestamp": performance.now()
                }
            }
        }
        case "set-progress": {
            return {
                ...state,
                "bDeleteInProgress": action.value
            }
        }
    }
    
    return state;
}

async function loadData(dispatch, matchId){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-match-info", matchId})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);
        console.log(res);

        dispatch({"type": "set-info", "data": res.data});

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Admin Match Info", "content": err.toString()});
    }
}

function renderInfo(mode, data){

    if(data === null || mode !== "info") return null;

    const headers = [
        "Name", "Value"
    ];

    const rows = [
        ["File", data.name],
        ["Imported", convertTimestamp(data.imported, true)],
    ];

    return <BasicTable width={2} headers={headers} rows={rows}/>
}

async function deleteMatch(dispatch, matchId, router){

    try{

        dispatch({"type": "set-progress", "value": true});

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-match", "id": matchId})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);


        router.push(`/`);

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Delete Match", "content": err.toString()});
    }
}

function renderDelete(mode, dispatch, matchId, router){

    if(mode !== "delete") return null;

    return <div className="m-bottom-25">
        <button className="button delete-button" onClick={() =>{
            deleteMatch(dispatch, matchId, router);
        }}>Delete Match</button>
    </div>
}

export default function MatchAdmin({matchId}){

    const [state, dispatch] = useReducer(reducer, {
        "mode": "info",
        "data": null,
        "bDeleteInProgress": false,
        "messageBox": {
            "type": null,
            "title": null,
            "content": null,
            "timestamp": performance.now()
        }
    });

    useEffect(() =>{

        loadData(dispatch, matchId);

    }, []);

    const tabOptions = [
        {"name": "Match Info", "value": "info"},
        {"name": "Delete Match", "value": "delete"},
    ];

    const router = useRouter();

    let elems = null;

    if(!state.bDeleteInProgress){

        elems = <>
            {renderInfo(state.mode, state.data)}
            {renderDelete(state.mode, dispatch, matchId, router)}
        </>;

    }else{
        elems = <Loading>Deleting Match...<br/> You will be redirected to the home page once complete.</Loading>
    }

    return <>
        <div className="default-header">Match Admin</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
        <MessageBox title={state.messageBox.title} type={state.messageBox.type}>{state.messageBox.content}</MessageBox>
        {elems}
    </>
}