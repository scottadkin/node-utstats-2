"use client"
import Tabs from "../Tabs";
import { useReducer, useEffect } from "react";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import MessageBox from "../MessageBox";


function reducer(state, action){

    switch(action.type){

        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }
        case "load-names": {
            return {
                ...state,
                "playerNames": action.data
            }
        }
        case "set-search-name": {
            return {
                ...state,
                "searchName": action.value
            }
        }
    }


    return state;
}


async function loadNames(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-all-player-names"})
        });

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined) throw new Error(res.error);

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": `Failed To Load Player List`, "content": err.toString()});
    }
}

function renderSearchForm(state, dispatch){

    return <div className="form">
        <div className="form-info">Search Players</div>
        <div className="form-row">
            <label htmlFor="name">Name</label>
            <input type="text" className="default-textbox" value={state.searchName} onChange={(e) =>{
                dispatch({"type": "set-search-name", "value": e.target.value});
            }}/>
        </div>
    </div>
}

export default function AdminPlayerManager({}){


    const [state, dispatch] = useReducer(reducer, {
        "mode": "rename",
        "playerNames": [],
        "searchName": ""
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadNames(dispatch, mDispatch);

    }, []);

    const tabOptions = [
        {"name": "Rename Player", "value": "rename"}
    ];

    return <>
        <div className="default-header">Player Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
            mDispatch({"type": "set-message", "messageType": "error", "title": "fart", "content": <b>test</b>});
        }}/>
        <MessageBox type={mState.type} title={mState.title} timestamp={mState.timestamp}>
            {mState.content}
        </MessageBox>
        {renderSearchForm(state, dispatch)}
    </>
}