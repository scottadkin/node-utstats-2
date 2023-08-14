import {useEffect, useReducer} from "react";
import NotificationsCluster from "../NotificationsCluster";
import useNotificationCluster from "../useNotificationCluster";
import Loading from "../Loading";
import DropDown from "../DropDown";
import BasicButton from "../BasicButton";
import CustomTable from "../CustomTable";
import {convertTimestamp, toPlaytime } from "../../api/generic.mjs";
import Link from "next/link";

const reducer = (state, action) =>{

    switch(action.type){
        

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
                "perPage": action.value
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
                "data": {"totalMatches": 0, "mapInfo": {}, "gametypeInfo": {}, "serverInfo": {}, "matchInfo": []},
                "bLoading": false,
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
    }

    return state;
}

const loadData = async (dispatch, signal, page, perPage) =>{

    try{

        const req = await fetch("/api/adminmatches", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "admin-search", "page": page, "perPage": perPage})
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
                    {state.data.serverInfo[d.server] ?? "Not Found"}<br/>
                    {state.data.gametypeInfo[d.gametype] ?? "Not Found"}<br/>
                    {state.data.mapInfo[d.map] ?? "Not Found"}
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

const deleteSelected = async (dispatch, selectedMatches, addNotification, clearAllNotifications, page, perPage) =>{

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

    await loadData(dispatch, controller.signal, page, perPage);
}

const renderFormBits = (dispatch, bDeleting) =>{

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

    return <>
        <DropDown dName={"Results Per Page"} data={perPageOptions} originalValue={25} changeSelected={(name, value) => {
            dispatch({"type": "changePerPage", "value": value});
        }}/>
        <div className="basic-buttons">
            <BasicButton action={() =>{
                dispatch({"type": "previous"});
            }}>Previous Page</BasicButton>
            <BasicButton action={() =>{
                dispatch({"type": "next"});
            }}>Next Page</BasicButton>
        </div>
    </>
}

const AdminMatchDeleter = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "page": 1, 
        "perPage": 25, 
        "totalPages": 0,
        "bLoading": true,
        "data": {"totalMatches": 0, "mapInfo": {}, "gametypeInfo": {}, "serverInfo": {}, "matchInfo": []},
        "selectedMatches": [],
        "error": null,
        "bDeleting": false
    });

    const [notifications, addNotification, hideNotification, clearAllNotifications] = useNotificationCluster();

    useEffect(() =>{

        const controller = new AbortController();

        loadData(dispatch, controller.signal, state.page, state.perPage);

        return () =>{
            controller.abort();
        }

    }, [state.perPage, state.page]);

    if(state.error !== null){
        addNotification("error", state.error);
        dispatch({"type": "removeError"});
    }
    

    const start = 1 + (state.page - 1) * state.perPage;
    const end = (start + state.perPage > state.data.totalMatches) ? state.data.totalMatches : start + state.perPage - 1;

    return <>
        <div className="default-header">Bulk Match Delete</div>
        <div className="form">
            <div className="form-info">
                <div className="default-sub-header-alt">Information</div>
                Select which matches you would like to delete then click the process button.
            </div>
            {renderFormBits(dispatch, state.bDeleting)}
            <Loading value={!state.bLoading}/>
            <div className="small-font grey m-top-10 m-bottom-10">
                Displaying page {state.page} of {state.totalPages}<br/>
                Results {start} to {end} out of a possible {state.data.totalMatches}
            </div>
            <Loading value={!state.bDeleting}/>
            {(!state.bDeleting) ? <BasicButton action={() =>{
                deleteSelected(
                    dispatch, 
                        state.selectedMatches, 
                        addNotification, 
                        clearAllNotifications, 
                        state.page, 
                        state.perPage
                    );
            }}>Delete Selected</BasicButton> : null}
            <NotificationsCluster notifications={notifications} hide={hideNotification} clearAll={clearAllNotifications}/>        
        </div>
        {renderTable(state, dispatch)}
    </>
}

export default AdminMatchDeleter;