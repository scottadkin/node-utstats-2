import {useEffect, useReducer} from "react";
import NotificationsCluster from "../NotificationsCluster";
import useNotificationCluster from "../useNotificationCluster";
import Loading from "../Loading";
import DropDown from "../DropDown";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "data": action.data
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

        dispatch({"type": "loaded"});
        console.log(res);

    }catch(err){
        

        if(err.name === "AbortError") return;
        console.trace(err);
        dispatch({"type": "error"});
        addNotification("error", err.toString());
    }
}


const AdminMatchDeleter = () =>{

    const [state, dispatch] = useReducer(reducer, {"page": 1, "perPage": 25, "bLoading": true});
    const [notifications, addNotification, hideNotification, clearAllNotifications] = useNotificationCluster();

    useEffect(() =>{

        const controller = new AbortController();

        loadData(state, dispatch, controller.signal, addNotification);

        return () =>{
            controller.abort();
        }

    }, []);

    
    const perPageOptions = [
        {"value": 5, "displayValue": 5},
        {"value": 10, "displayValue": 10},
        {"value": 25, "displayValue": 25},
        {"value": 50, "displayValue": 50},
        {"value": 100, "displayValue": 100},
    ];

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
            <Loading value={!state.bLoading}/>
            <NotificationsCluster notifications={notifications} hide={hideNotification}/>
        </div>
    </>
}

export default AdminMatchDeleter;