import { useReducer, useEffect } from "react";
import {BasicTable} from "../Tables";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import CountryFlag from "../CountryFlag";
import Tabs from "../Tabs";


function reducer(state, action){

    switch(action.type){

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
        console.log(res);

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Data", "content": err.toString()});
    }
}

function renderAssignNameToHWID(state, dispatch, mDispatch){

    if(state.mode !== "assign") return null;


    return <div className="form">
        <div className="form-info">
            Assign a name to a target HWID.<br/>
            This will force a player with the target HWID to always be assigned a specific name no matter what name they used during a match.
        </div>
        <div className="form-row">
            <label htmlFor="hwid">Target HWID</label>
            <select name="hwid" className="default-select">
                <option value="">-- Please Select A HWID --</option>
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="name">Target Name</label>
            <input name="name" type="text" className="default-textbox"/>
        </div>
    </div>
}

export default function AdminPlayerHWIDManager(){

    const [state, dispatch] = useReducer(reducer, {
        "mode": "assign",
        "latest": [], 
        "hwidsToName": {}
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