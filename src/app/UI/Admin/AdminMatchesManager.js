"use client"
import { useReducer, useEffect } from "react";
import Tabs from "../Tabs";
import MessageBox from "../MessageBox";
import { BasicTable } from "../Tables";
import { convertTimestamp, removeUnr, toPlaytime } from "../../../../api/generic.mjs";
import Link from "next/link";
import Pagination from "../Pagination";

function reducer(state, action){

    switch(action.type){
        case "loaded-matches": {

            return {
                ...state,
                "matches": action.data,
                "totalMatches": action.totalMatches
            };
        }

        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }

        case "change-order": {

            let order = state.order;
            let sortBy = state.sortBy;

            if(sortBy === action.sortBy){

                order = (order === "asc") ? "desc" : "asc";
            }else{
                order = "desc";
            }

            return {
                ...state,
                "order": order,
                "sortBy": action.sortBy
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
        case "set-page": {
            return {
                ...state,
                "page": action.value
            }
        }
        case "set-names": {
            return {
                ...state,
                "names": action.names
            }
        }
        case "set-selected": {

            const newState = {...state};

            if(action.key === "servers"){

                newState.selectedServer = parseInt(action.value);

            }else if(action.key === "gametypes"){

                newState.selectedGametype = parseInt(action.value);

            }else if(action.key === "maps"){

                newState.selectedMap = parseInt(action.value);
            }

            newState.page = 1;

            return newState;
        }

        case "add-delete-match": {

            const id = parseInt(action.id);

            const matchesToDelete = [...state.pendingDeleteMatches];

            if(matchesToDelete.indexOf(id) === -1){
                matchesToDelete.push(id);
            }

            return {
                ...state,
                "pendingDeleteMatches": [...matchesToDelete]
            }
        }

        case "finished-delete-match": {

            const id = parseInt(action.id);
            const matchesToDelete = [...state.pendingDeleteMatches];

            const index = matchesToDelete.indexOf(id);

            if(index !== -1){
                matchesToDelete.splice(index, 1);
            }

            //dispatch({"type": "set-active-delete-id", "id": id});

            let currentDeleteId = -1;

            if(matchesToDelete.length > 0) currentDeleteId = matchesToDelete[0];

            return {
                ...state,
                "pendingDeleteMatches": [...matchesToDelete],
                "currentDeleteMatchId": currentDeleteId
            }
        }

        case "set-active-delete-id": {
            return {
                ...state,
                "currentDeleteMatchId": action.id
            }
        }
    }


    return state;
}


async function loadMatches(page, perPage, order, sortBy, selectedServer, selectedGametype, selectedMap, dispatch){

    try{


        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "load-matches", 
                "page": page, 
                "perPage": perPage, 
                "order": order, 
                "sortBy": sortBy,
                selectedServer, 
                selectedGametype, 
                selectedMap
            })
        });

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded-matches", "data": res.data, "totalMatches": res.totalMatches});

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Matches Data", "content": err.toString()});
    }
}

async function deleteMatch(id, dispatch, state){

    try{

        dispatch({"type": "add-delete-match", "id": id});

        
        if(state.currentDeleteMatchId === -1){
            dispatch({"type": "set-active-delete-id", "id": id});
        }


     

        const req = await fetch(`/api/admin`, {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-match", "id": id})
        });

        const res = await req.json();
        
        if(res.error !== undefined) throw new Error(res.error);
        dispatch({"type": "finished-delete-match", "id": id});

        await loadMatches(state.page, state.perPage, state.order, state.sortBy, state.selectedServer, state.selectedGametype, state.selectedMap, dispatch);

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Delete Match", "content": err.toString()});
        dispatch({"type": "finished-delete-match", "id": id});
    }
}


function renderGeneral(state, dispatch){

    if(state.mode !== "general") return null;

    const headers = [
        "Link", 
        {"name": "Date", "callback": () =>{
            dispatch({"type": "change-order", "sortBy": "date"});
        }},
        {"name": "Server", "callback": () =>{
            dispatch({"type": "change-order", "sortBy": "server"});
        }}, 
        {"name": "Gametype", "callback": () =>{
            dispatch({"type": "change-order", "sortBy": "gametype"});
        }}, 
        {"name": "Map", "callback": () =>{
            dispatch({"type": "change-order", "sortBy": "map"});
        }}, 
        {"name": "Players", "callback": () =>{
            dispatch({"type": "change-order", "sortBy": "players"});
        }},
        {"name": "Playtime", "callback": () =>{
            dispatch({"type": "change-order", "sortBy": "playtime"});
        }}, "Delete Match"
    ];

    const rows = state.matches.map((d) =>{

        let elem = <td key={d.id} className="team-yellow">In Queue</td>;

        if(state.currentDeleteMatchId === d.id){

            elem = <td key={d.id} className="team-yellow">Deleting...</td>


        }else if(state.pendingDeleteMatches.indexOf(d.id) === -1){
            
            elem = <td key={d.id} className="team-red pointer" onClick={() =>{
                deleteMatch(d.id, dispatch, state);
            }}>
                Delete Match
            </td>
        }

        return [
             <>
                <Link target="_blank" href={`/match/${d.id}`}>Link</Link>
            </>,
            {"className": "date text-left", "value": convertTimestamp(d.date, true)},
            {"className": "small-font", "value": d.serverName},
            {"className": "small-font", "value": d.gametypeName},
            {"className": "small-font", "value": d.mapName},
            d.players,
            {"className": "playtime", "value": toPlaytime(d.playtime)},
            {"bSkipTd": true, "value": elem}
           
        ];
    });

    return <>

        <div className="form">
            <div className="form-row">
                <label htmlFor="server">Server</label>
                <select className="default-select" value={state.selectedServer} name="server" onChange={(e) =>{
                    dispatch({"type": "set-selected", "key": "servers","value": e.target.value});
                }}>
                    <option value={0}>Any</option>
                    {state.names.servers.map((n) =>{
                        return <option key={n.id} value={n.id}>{n.name}</option>
                    })}
                </select>
            </div>
            <div className="form-row">
                <label htmlFor="gametype">Gametype</label>
                <select className="default-select" value={state.selectedGametype} name="gametype" onChange={(e) =>{
                    dispatch({"type": "set-selected", "key": "gametypes","value": e.target.value});
                }}>
                    <option value={0}>Any</option>
                    {state.names.gametypes.map((n) =>{
                        return <option key={n.id} value={n.id}>{n.name}</option>
                    })}
                </select>
            </div>
            <div className="form-row">
                <label htmlFor="map">Map</label>
                <select className="default-select" value={state.selectedMap} name="map" onChange={(e) =>{
                    dispatch({"type": "set-selected", "key": "maps","value": e.target.value});
                }}>
                    <option value={0}>Any</option>
                    {state.names.maps.map((n) =>{
                        return <option key={n.id} value={n.id}>{removeUnr(n.name)}</option>
                    })}
                </select>
            </div>
        </div>
        <Pagination results={state.totalMatches} currentPage={state.page} perPage={state.perPage} url={null} event={(v) =>{
   
            dispatch({"type": "set-page", "value": v});
        }}/>
        <BasicTable width={1} headers={headers} rows={rows}/>
    </>
}


async function loadNames(dispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method":  "POST",
            "body": JSON.stringify({"mode": "get-all-match-names"})
        });

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-names", "names": res});

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Names", "content": err.toString()});
    }
}

export default function AdminMatchesManager(){


    const [state, dispatch] = useReducer(reducer, {
        "names": {
            "servers": [],
            "gametypes": [],
            "maps": []
        },
        "matches": [],
        "totalMatches": 0,
        "page": 1,
        "order": "desc",
        "sortBy": "date",
        "mode": "general",
        "perPage": 50,
        "selectedServer": 0,
        "selectedGametype": 0,
        "selectedMap": 0,
        "messageBox": {
            "type": null,
            "title": null,
            "content": null,
            "timestamp": 0
        },
        "currentDeleteMatchId": -1,
        "pendingDeleteMatches": []
    });

    useEffect(() =>{

        loadNames(dispatch);
    }, []);

    useEffect(() =>{

        loadMatches(state.page, state.perPage, state.order, state.sortBy, state.selectedServer, state.selectedGametype, state.selectedMap, dispatch);

    }, [state.page, state.order, state.sortBy, state.selectedServer, state.selectedGametype, state.selectedMap]);

    const tabOptions = [
        {"name": "General", "value": "general"},
        {"name": "Duplicates", "value": "duplicates"},
    ];

    return <>
        <div className="default-header">
            Matches Manager
        </div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
        <MessageBox type={state.messageBox.type} title={state.messageBox.title}>{state.messageBox.content}</MessageBox>
        {renderGeneral(state, dispatch)}
    </>
}