"use client"
import { useEffect, useReducer } from "react";
import Tabs from "../Tabs";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import { BasicTable } from "../Tables";
import { convertTimestamp } from "../../../../api/generic.mjs";
import Loading from "../Loading";
import { useRouter } from "next/navigation";
import CountryFlag from "../CountryFlag";

function reducer(state, action){

    switch(action.type){

        case "set-info": {
            return {
                ...state,
                "data": action.data,
                "playerData": action.playerData
            }
        }
        case "set-mode": {
            return {
                ...state,
                "mode": action.value
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

async function loadData(dispatch, mDispatch, matchId){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-match-info", matchId})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);
        console.log(res);

        dispatch({"type": "set-info", "data": res.data, "playerData": res.playerData});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Admin Match Info", "content": err.toString()});
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

async function deleteMatch(dispatch, mDispatch, matchId, router){

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
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Delete Match", "content": err.toString()});
    }
}

function renderDelete(mode, dispatch, mDispatch, matchId, router){

    if(mode !== "delete") return null;

    return <div className="m-bottom-25">
        <button className="button delete-button" onClick={() =>{
            deleteMatch(dispatch, mDispatch, matchId, router);
        }}>Delete Match</button>
    </div>
}

async function deletePlayerFromMatch(playerId, matchId, dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-player-from-match", playerId, matchId})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        await loadData(dispatch, mDispatch, matchId);
        mDispatch({
            "type": "set-message", 
            "messageType": 
            "pass", "title": "Played Deleted",
            "content": `Player deleted successfully`
        });

    }catch(err){

        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Delete Player From Match", "content": err.toString()});
    }
}

function renderPlayerList(mode, playerData, matchId, dispatch, mDispatch){

    if(mode !== "players") return null;

    const headers = [
        "Name",
        "HWID",
        "IP",
        "Delete"
    ];

    const rows = playerData.map((p) =>{
        return [
            {"className": "text-left", "value": <><CountryFlag country={p.country}/>{p.playerName}</>},
            p.hwid,
            p.ip,
            {"bSkipTd": true, "value": <td key={p.player_id} className="button delete-button" onClick={() =>{
                deletePlayerFromMatch(p.player_id, matchId, dispatch, mDispatch);
            }}>Delete</td>}
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>
}

export default function MatchAdmin({matchId}){

    const [state, dispatch] = useReducer(reducer, {
        "mode": "players",
        "data": null,
        "playerData": [],
        "bDeleteInProgress": false,
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadData(dispatch, mDispatch, matchId);

    }, [matchId, mDispatch]);

    const tabOptions = [
        {"name": "Match Info", "value": "info"},
        {"name": "Delete Match", "value": "delete"},
        {"name": "Players", "value": "players"}
    ];

    const router = useRouter();

    let elems = null;

    if(!state.bDeleteInProgress){

        elems = <>
            {renderInfo(state.mode, state.data)}
            {renderDelete(state.mode, dispatch, mDispatch, matchId, router)}
            {renderPlayerList(state.mode, state.playerData, matchId, dispatch, mDispatch)}
        </>;

    }else{
        elems = <Loading>Deleting Match...<br/> You will be redirected to the home page once complete.</Loading>
    }

    return <>
        <div className="default-header">Match Admin</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
        <MessageBox timestamp={mState.timestamp} title={mState.title} type={mState.type}>{mState.content}</MessageBox>
        {elems}
    </>
}