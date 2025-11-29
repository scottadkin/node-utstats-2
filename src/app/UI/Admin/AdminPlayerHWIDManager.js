import { useReducer, useEffect } from "react";
import {BasicTable} from "../Tables";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import CountryFlag from "../CountryFlag";
import Tabs from "../Tabs";
import Loading from "../Loading";


function reducer(state, action){

    switch(action.type){


        case "set-loading": {
            return {
                ...state,
                "bLoading": action.value
            }
        }

        case "set-data": {
            return {
                ...state,
                "latest": action.latest,
                "hwidsToName": action.hwidsToName,
            }
        }

        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }

        case "update-assign": {

            const assign = {...state.assign};

            assign[action.key] = action.value;

            return {
                ...state,
                "assign": {
                    ...assign
                }
            }
        }

        
    }

    return state;
}


function renderLatestHWIDS(state, dispatch, mDispatch){

    if(state.mode !== "list") return null;

    const headers = [
        "Name", "HWID", "Import As"
    ];

    const rows = state.latest.map((h) =>{

        const importAs = state.hwidsToName?.[h.hwid] ?? "";
 
        return [
            {"className": "text-left", "value": <><CountryFlag country={h.country}/>{h.name}</>},
            h.hwid,
            importAs
        ];
    });

    return <>
        <div className="form">
            <div className="form-info">
                Assign a HWID to a player name to force the importer to set the 
                player name with that HWID no matter what name they use in a match.
            </div>
        </div>
        <BasicTable width={1} headers={headers} rows={rows}/>
    </>
}

async function loadData(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-all-hwids"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);
        dispatch({"type": "set-data", "hwidsToName": res.hwidsToName, "latest": res.latest});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Data", "content": err.toString()});
    }
}


async function saveAssignNameToHWID(state, dispatch, mDispatch){

    try{

        dispatch({"type": "set-loading", "value": true});

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "assign-name-to-hwid", "name": state.assign.name, "hwid": state.assign.selectedHWID})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        await loadData(dispatch, mDispatch);
        mDispatch({"type": "set-message", "messageType": "pass", "title": "Assigned Name To HWID", "content": `Name successfully assigned to HWID`});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Assign Name To HWID", "content": err.toString()});
    }

    dispatch({"type": "set-loading", "value": false});
}



async function deleteAssignNameToHWID(hwid, dispatch, mDispatch){

    try{

        dispatch({"type": "set-loading", "value": true});

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-assign-name-to-hwid", "hwid": hwid})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);


        await loadData(dispatch, mDispatch);
        mDispatch({
            "type": "set-message", 
            "messageType": "pass", 
            "title": "Deleted Name Assigned To HWID", 
            "content": `Name successfully deleted from assign to HWID`
        });

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Assign Name To HWID", "content": err.toString()});
    }

    dispatch({"type": "set-loading", "value": false});
}

function getHWIDToName(state, hwid){

    if(state.hwidsToName[hwid] !== undefined){

        return state.hwidsToName[hwid];
    }

    return null;
}

function renderAssignNameToHWID(state, dispatch, mDispatch){

    if(state.mode !== "assign") return null;

    if(state.bLoading){
        return <Loading value={!state.bLoading}>Processing, please wait...</Loading>
    }

    const latest = [...state.latest];

    latest.sort((a, b) =>{

        a = a.hwid.toLowerCase();
        b = b.hwid.toLowerCase();

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });


    let inUseElem = null;


    const inUseBy = getHWIDToName(state, state.assign.selectedHWID);

    if(inUseBy != null){
        inUseElem = <div className="form-info m-bottom-25">
            HWID is already assigned to <b>{inUseBy}</b><br/>
            <button className="button delete-button" onClick={() =>{
                deleteAssignNameToHWID(state.assign.selectedHWID, dispatch, mDispatch);
            }}>
                Delete Current Name Assigned to {state.assign.selectedHWID}
            </button>
        </div>
    }

    return <div className="form">
        <div className="form-info">
            Assign a name to a target HWID.<br/>
            This will force a player with the target HWID to always be assigned a specific name no matter what name they used during a match.<br/>
            The name in brackets next to hwid is the lastest name that was paired with that hwid.
        </div>
        <div className="form-row">
            <label htmlFor="hwid">Target HWID</label>
            <select name="hwid" className="default-select" value={state.assign.selectedHWID}  onChange={(e) =>{
                dispatch({"type": "update-assign", "key": "selectedHWID", "value": e.target.value});
            }}>
                <option value="">-- Please Select A HWID --</option>
                {latest.map((d) =>{
                    return <option key={d.id} value={d.hwid}>{d.hwid} ({d.name})</option>
                })}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="name">Target Name</label>
            <input name="name" type="text" className="default-textbox" value={state.assign.name} onChange={(e) =>{
                dispatch({"type": "update-assign", "key": "name", "value": e.target.value});
            }}/>
        </div>
        {inUseElem}
        <button className="search-button" onClick={() =>{
            saveAssignNameToHWID(state, dispatch, mDispatch);
        }}>Save Changes</button>
    </div>
}

export default function AdminPlayerHWIDManager(){

    const [state, dispatch] = useReducer(reducer, {
        "mode": "assign",
        "latest": [], 
        "hwidsToName": {},
        "bLoading": false,
        "assign": {
            "selectedHWID": "",
            "name": ""
        }
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{
        loadData(dispatch, mDispatch);
    }, []);


    const tabOptions = [
        {"name": "HWID Usage", "value": "list"},
        {"name": "Assign Name To HWID", "value": "assign"},
    ];

    return <>
        <div className="default-header">Player HWID Manager</div>  
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
        <MessageBox timestamp={mState.timestamp} title={mState.title} type={mState.type}>
            {mState.content}
        </MessageBox>
        {renderLatestHWIDS(state, dispatch, mDispatch)}
        {renderAssignNameToHWID(state, dispatch, mDispatch)}
    </>
}