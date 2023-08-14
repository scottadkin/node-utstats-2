import {useEffect, useReducer} from "react";
import NotificationsCluster from "../NotificationsCluster";
import useNotificationCluster from "../useNotificationCluster";
import Loading from "../Loading";
import DropDown from "../DropDown";
import BasicButton from "../BasicButton";
import CustomTable from "../CustomTable";
import {convertTimestamp, toPlaytime } from "../../api/generic.mjs";

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
                "selectedMatches": []
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
                "data": [],
                "bLoading": false
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
    }

    return state;
}

const loadData = async (state, dispatch, signal, addNotification) =>{

    try{

        const req = await fetch("/api/adminmatches", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "admin-search", "page": state.page, "perPage": state.perPage})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded", "data": res});
        console.log(res);

    }catch(err){
        

        if(err.name === "AbortError") return;
        console.trace(err);
        dispatch({"type": "error"});
        addNotification("error", err.toString());
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
        
        return {
            "id": {"value": d.id},
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
                "displayValue": <b>test</b>
             }
        };
    });

    return <div className="m-top-10">
        <CustomTable headers={headers} data={data}/>
    </div>;
}


const AdminMatchDeleter = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "page": 1, 
        "perPage": 25, 
        "totalPages": 0,
        "bLoading": true,
        "data": {"totalMatches": 0, "mapInfo": {}, "gametypeInfo": {}, "serverInfo": {}, "matchInfo": []},
        "selectedMatches": []
    });

    const [notifications, addNotification, hideNotification, clearAllNotifications] = useNotificationCluster();

    useEffect(() =>{

        const controller = new AbortController();

        loadData(state, dispatch, controller.signal, addNotification);

        return () =>{
            controller.abort();
        }

    }, [state.perPage, state.page]);

    
    const perPageOptions = [
        {"value": 5, "displayValue": 5},
        {"value": 10, "displayValue": 10},
        {"value": 25, "displayValue": 25},
        {"value": 50, "displayValue": 50},
        {"value": 100, "displayValue": 100},
        {"value": 250, "displayValue": 250},
        {"value": 500, "displayValue": 500},
    ];

    const start = 1 + (state.page - 1) * state.perPage;
    const end = (start + state.perPage > state.data.totalMatches) ? state.data.totalMatches : start + state.perPage - 1;

    return <>
        <div className="default-header">Bulk Match Delete</div>
        <div className="form">
            <div className="form-info">
                <div className="default-sub-header-alt">Information</div>
                Select which matches you would like to delete then click the process button.
            </div>
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
            <Loading value={!state.bLoading}/>
            <div className="small-font grey m-top-10">
                Displaying page {state.page} of {state.totalPages}<br/>
                Results {start} to {end} out of a possible {state.data.totalMatches}
            </div>
            <NotificationsCluster notifications={notifications} hide={hideNotification}/>        
        </div>
        {renderTable(state, dispatch)}
    </>
}

export default AdminMatchDeleter;