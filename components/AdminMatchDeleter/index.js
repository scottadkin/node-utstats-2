import {useEffect, useReducer} from "react";
import NotificationsCluster from "../NotificationsCluster";
import useNotificationCluster from "../useNotificationCluster";
import Loading from "../Loading";
import DropDown from "../DropDown";
import BasicButton from "../BasicButton";
import CustomTable from "../CustomTable";
import {convertTimestamp, toPlaytime, idNameObjToDropDownArray } from "../../api/generic.mjs";
import Link from "next/link";

const reducer = (state, action) =>{

    switch(action.type){
        
        case "loadedNames": {
            return {
                ...state,
                "bLoadedNames": true,
                "serverNames": action.serverNames,
                "gametypeNames": action.gametypeNames,
                "mapNames": action.mapNames
            }
        }

        case "loaded": {

            let totalPages = 0;

            if(action.data.totalMatches > 0){
                totalPages = Math.ceil(action.data.totalMatches / state.perPage);
            }

            return {
                ...state,
                "bLoading": false,
                "data": action.data,
                "totalPages": totalPages,
                "selectedMatches": [],
                "error": null
            }
        }
        case "changePerPage": {
            return {
                ...state,
                "perPage": action.value,
            }
        }
        case "changePage": {
            
            return {
                ...state,
                "page": action.value
            }
        }
        case "error": {

            return {
                ...state,
                "data": {"totalMatches": 0, "matchInfo": []},
                "bLoading": false,
                "bLoadedNames": true,
                "error": action.message
            }
        }
        case "removeError": {
            return {
                ...state,
                "error": null
            }
        }
        case "previous": {

            let newPage = state.page;
            if(newPage - 1 >= 1) newPage--;

            return {
                ...state,
                "page": newPage
            }
        }
        case "next": {

            let newPage = state.page + 1;

            if(newPage > state.totalPages){
                newPage = state.totalPages;
            }
            return {
                ...state,
                "page": newPage
            }
        }
        case "toggleMatch": {

            const selectedMatches = [...state.selectedMatches];
            const id = parseInt(action.value);

            const index = selectedMatches.indexOf(id);
  
            if(!state.bDeleting){
                if(index === -1){
                    selectedMatches.push(id);
                }else{
                    selectedMatches.splice(index, 1);
                }
            }

            return {
                ...state,
                "selectedMatches": selectedMatches
            }
        }
        case "toggleDeleting": {
            return {
                ...state,
                "bDeleting": !state.bDeleting
            }
        }
        case "setSelectedServer": {
            return {
                ...state,
                "selectedServer": action.value
            }
        }
        case "setSelectedGametype": {
            return {
                ...state,
                "selectedGametype": action.value
            }
        }
        case "setSelectedMap": {
            return {
                ...state,
                "selectedMap": action.value
            }
        }
    }

    return state;
}

const loadData = async (dispatch, signal, page, perPage, serverId, gametypeId, mapId) =>{

    try{

        const req = await fetch("/api/adminmatches", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "admin-search", 
                "page": page, 
                "perPage": perPage,
                "serverId": serverId,
                "gametypeId": gametypeId,
                "mapId": mapId
            })
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded", "data": res});
        //dispatch({"type": "error", "message": "err.toString()"});
   
        //return -1;

    }catch(err){
        

        if(err.name === "AbortError") return -1;
        dispatch({"type": "error", "message": err.toString()});
        //return err.toString();
    }
}

const renderTable = (state, dispatch) =>{


    const headers = {
        "id": {"display": "Match ID"},
        "date": {"display": "Match Date"},
        "info": {"display": "Info"},
        "playtime": {"display": "Playtime"},
        "players": {"display": "Players"},
        "actions": {"display": "Selected"},
    };

    const data = state.data.matchInfo.map((d) =>{

        const bSelected = state.selectedMatches.indexOf(d.id) !== -1;
        
        return {
            "id": {"value": d.id, "displayValue": <Link href={`/match/${d.id}`} target="_blank">{d.id}</Link>},
            "date": {
                "value": d.date, 
                "displayValue": convertTimestamp(d.date, true),
                "className": "playtime"
            },
            "info": {
                "value": <>
                    {state.serverNames[d.server] ?? "Not Found"}<br/>
                    {state.gametypeNames[d.gametype] ?? "Not Found"}<br/>
                    {state.mapNames[d.map] ?? "Not Found"}
                </>, 
                "className": "small-font"},
            "playtime": {
                "value": d.playtime, 
                "displayValue": toPlaytime(d.playtime),
                "className": "playtime"
             },
             "players": {
                "displayValue": d.players
             },
             "actions": {
           
                "bNoTD": true,
                "displayValue": <td key={d.id} onClick={() => {dispatch({"type": "toggleMatch", "value": d.id})}} className={`hover ${(bSelected) ? "team-green" : "team-red"}`}>
                    {(bSelected) ? "Yes" : "No"}
                </td>
               
             }
        };
    });

    return <div className="m-top-10">
        <CustomTable headers={headers} data={data}/>
    </div>;
}

const deleteMatch = async (id, addNotification) =>{

    try{

        const req = await fetch("/api/adminmatches", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete", "id": id})
        });
     
        const res = await req.json();

        if(res.error !== undefined){
            addNotification("error", res.error);
            return;
        }

        addNotification("pass", `Deleted match ${id}`);

    }catch(err){
        console.trace(err);
        addNotification("error", err.toString())
    }
}

const deleteSelected = async (dispatch, selectedMatches, addNotification, clearAllNotifications, page, perPage, serverId, gametypeId, mapId) =>{

    clearAllNotifications();
    dispatch({"type": "toggleDeleting"});

    if(selectedMatches.length === 0){

        addNotification("error", "You have not selected any matches to delete.");
        dispatch({"type": "toggleDeleting"});
        return;
    }

    for(let i = 0; i < selectedMatches.length; i++){

        const id = selectedMatches[i];
        await deleteMatch(id, addNotification);
    }

    addNotification("pass", "Finished deleting selected matches.");

    dispatch({"type": "toggleDeleting"});

    const controller = new AbortController();

    await loadData(dispatch, controller.signal, page, perPage, serverId, gametypeId, mapId);
}

const renderFormBits = (state, dispatch, bDeleting) =>{

    if(bDeleting) return null;

    const perPageOptions = [
        {"value": 5, "displayValue": 5},
        {"value": 10, "displayValue": 10},
        {"value": 25, "displayValue": 25},
        {"value": 50, "displayValue": 50},
        {"value": 100, "displayValue": 100},
        {"value": 250, "displayValue": 250},
        {"value": 500, "displayValue": 500},
    ];

    const serverDropDownValues = idNameObjToDropDownArray(state.serverNames, true);
    const gametypeDropDownValues = idNameObjToDropDownArray(state.gametypeNames, true);
    const mapDropDownValues = idNameObjToDropDownArray(state.mapNames, true);

    serverDropDownValues.unshift({"value": 0, "displayValue": "Any Server"});
    gametypeDropDownValues.unshift({"value": 0, "displayValue": "Any Gametype"});
    mapDropDownValues.unshift({"value": 0, "displayValue": "Any Map"});

    const pagination = (state.data.totalMatches === 0) ? null : <div className="basic-buttons">
        <BasicButton action={() =>{
            dispatch({"type": "previous"});
        }}>Previous Page</BasicButton>
        <BasicButton action={() =>{
            dispatch({"type": "next"});
        }}>Next Page</BasicButton>
    </div>;

    return <>
        <DropDown dName={"Results Per Page"} data={perPageOptions} originalValue={25} changeSelected={(name, value) => {
            dispatch({"type": "changePerPage", "value": value});
        }}/>
        <DropDown dName={"Filter By Server"} originalValue={state.selectedServer} data={serverDropDownValues} changeSelected={(name, value) =>{
            
            dispatch({"type": "setSelectedServer", "value": value});
        }}/>
        <DropDown dName={"Filter By Gametype"} originalValue={state.selectedGametype} data={gametypeDropDownValues} changeSelected={(name, value) =>{
            dispatch({"type": "setSelectedGametype", "value": value});
        }}/>
        <DropDown dName={"Filter By Map"} originalValue={state.selectedMap} data={mapDropDownValues} changeSelected={(name, value) =>{
            dispatch({"type": "setSelectedMap", "value": value});
        }}/>
        {pagination}
    </>
}

const loadAllNames = async (dispatch, signal) =>{

    try{

        const req = await fetch("/api/adminmatches", {
            "singal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-all-names"})
        });

        const res = await req.json();
        

        if(res.error !== undefined){
            throw new Error(res.error);
        }
      

        const {serverNames, gametypeNames, mapNames } = res;

        dispatch({
            "type": "loadedNames",
            "serverNames": serverNames,
            "gametypeNames": gametypeNames,
            "mapNames": mapNames
        });
        

    }catch(err){

        if(err.name === "AbortError") return -1;
        console.trace(err);
        dispatch({"type": "error", "message": err.toString()});
    }
}

const displayResultsInfo = (page, totalPages, perPage, totalMatches) =>{

    if(totalMatches === 0) return null;

    const start = 1 + (page - 1) * perPage;
    const end = (start + perPage > totalMatches) ? totalMatches : start + perPage - 1;


    return <div className="small-font grey m-top-10 m-bottom-10">
        Displaying page {page} of {totalPages}<br/>
        Results {start} to {end} out of a possible {totalMatches}
    </div>
}

const AdminMatchDeleter = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "page": 1, 
        "perPage": 25, 
        "totalPages": 0,
        "bLoadedNames": false,
        "bLoading": true,
        "data": {"totalMatches": 0, "matchInfo": []},
        "selectedMatches": [],
        "error": null,
        "serverNames": {},
        "gametypeNames": {},
        "mapNames": {},
        "bDeleting": false,
        "selectedServer": 0,
        "selectedGametype": 0,
        "selectedMap": 0
    });

    const [notifications, addNotification, hideNotification, clearAllNotifications] = useNotificationCluster();

    useEffect(() =>{

        const controller = new AbortController();

        loadAllNames(dispatch, controller.signal);

        return () =>{
            controller.abort();
        }

    }, []);

    useEffect(() =>{

        const controller = new AbortController();

        loadData(dispatch, controller.signal, state.page, state.perPage, state.selectedServer, state.selectedGametype, state.selectedMap);

        return () =>{
            controller.abort();
        }

    }, [state.perPage, state.page,state.selectedServer, state.selectedGametype, state.selectedMap]);

    if(state.error !== null){
        addNotification("error", state.error);
        dispatch({"type": "removeError"});
    }

    if(!state.bLoadedNames) return <Loading />;
    
    return <>
        <div className="default-header">Bulk Match Delete</div>
        <div className="form">
            <div className="form-info">
                <div className="default-sub-header-alt">Information</div>
                Select which matches you would like to delete then click the process button.
            </div>
            {renderFormBits(state, dispatch, state.bDeleting)}
            <Loading value={!state.bLoading}/>
            {displayResultsInfo(state.page, state.totalPages, state.perPage, state.data.totalMatches)}
            <Loading value={!state.bDeleting}/>
            {(!state.bDeleting && state.data.totalMatches > 0) ? <BasicButton action={() =>{
                deleteSelected(
                    dispatch, 
                        state.selectedMatches, 
                        addNotification, 
                        clearAllNotifications, 
                        state.page, 
                        state.perPage,
                        state.selectedServer, 
                        state.selectedGametype, 
                        state.selectedMap
                    );
            }}>Delete Selected</BasicButton> : null}
            <NotificationsCluster notifications={notifications} hide={hideNotification} clearAll={clearAllNotifications}/>        
        </div>
        {renderTable(state, dispatch)}
    </>
}

export default AdminMatchDeleter;