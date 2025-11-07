"use client"
import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import Tabs from "../Tabs";

function reducer(state, action){

    switch(action.type){
        case "set-settings": {
            return {
                ...state,
                "settings": action.current,
                "defaultSettings": action.defaultSettings
            }
        }
    }
    return state;
}

async function loadSettings(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "load-ranking-values"})
        });

        const res = await req.json();
        console.log(res);

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-settings", "current": res.current, "defaultSettings": res.defaultValues});

    }catch(err){

        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Settings", "content": err.toString()});
    }
}

export default function AdminRankingManager(){

    const [state, dispatch] = useReducer(reducer, {
        "settings": [],
        "defaultSettings": []
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{
        loadSettings(dispatch, mDispatch);
    }, []);

    console.log(state.settings);
    return <>
        <div className="default-header">Ranking Manager</div>
        <MessageBox type={mState.type} title={mState.title} timestamp={mState.timestamp}>{mState.content}</MessageBox>
    </>
}