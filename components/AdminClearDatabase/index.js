import Checkbox from "../Checkbox";
import Loading from "../Loading";
import { useReducer, useEffect } from "react";
import NotificationSmall from "../NotificationSmall";


const reducer = (state, action) =>{

    switch(action.type){
        case "check-1":{
            return {
                ...state,
                "check-1": !state["check-1"]
            };
        }
        case "check-2":{
            return {
                ...state,
                "check-2": !state["check-2"]
            };
        }
        case "check-3":{
            return {
                ...state,
                "check-3": !state["check-3"]
            };
        }
        case "clear-tables":{
            return {
                ...state,
                "bLoading": true,
                "error": null,
                "bCleared": false
            }
        }
        case "clear-fail": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        case "clear-pass": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "bCleared": true
            }
        }
    }

    return state;
}

const renderButton = (state, dispatch) =>{

    if(!state["check-1"] || !state["check-2"] || !state["check-3"]) return null;

    if(state.bLoading) return <Loading />;

    return <div>
        <div className="search-button" onClick={() => clearTables(dispatch)}>Clear Tables</div>
    </div>
}

const clearTables = async (dispatch) =>{

    dispatch({"type": "clear-tables"})

    const req = await fetch("/api/admin", {
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({"mode": "clear-tables"})
    });

    const res = await req.json();


    if(res.error !== undefined){
        dispatch({"type": "clear-fail", "errorMessage": res.error});
        return;
    }

    dispatch({"type": "clear-pass"})

}

const renderError = (state) =>{

    if(state.error === null) return null;

    return <NotificationSmall type="error">
        {state.error}
    </NotificationSmall>
}

const renderPass = (state) =>{

    if(state.error !== null || !state.bCleared) return null;

    return <NotificationSmall type="pass">
        All tables cleared successfully.
    </NotificationSmall>
}


const AdminClearDatabase = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "check-1": false, 
        "check-2": false, 
        "check-3": false, 
        "bLoading": false,
        "error": null,
        "bCleared": false
    });

    useEffect(() =>{


    },[]);

    return <div>
        <div className="default-header">Clear Database</div>
        <div className="form">
            <div className="default-sub-header">
                Empty All UT Stats Tables
            </div>
            <div className="form-info">
                Click the button below to empty all the database tables for ut logs. FTP importer settings, user accounts, and other stuff related to the site will not be deleted.
            </div>

            <div className="select-row">
                <div className="select-label">Clear Tables?</div>
                <Checkbox name="check-1" checked={state["check-1"]} setChecked={(name) => { dispatch({"type": name})}}/>
            </div>
            <div className="select-row">
                <div className="select-label">Are you sure?</div>
                <Checkbox name="check-2" checked={state["check-2"]} setChecked={(name) => { dispatch({"type": name})}}/>
            </div>

            <div className="select-row">
                <div className="select-label">Are you though?</div>
                <Checkbox name="check-3" checked={state["check-3"]} setChecked={(name) => { dispatch({"type": name})}}/>
            </div>
            {renderError(state)}
            {renderPass(state)}
            {renderButton(state, dispatch)}
        </div>
    </div>
}

export default AdminClearDatabase;