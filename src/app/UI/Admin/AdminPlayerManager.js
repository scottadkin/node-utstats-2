"use client"
import Tabs from "../Tabs";
import { useReducer, useEffect } from "react";


function reducer(state, action){

    switch(action.type){

        case "set-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }
    }


    return state;
}

export default function AdminPlayerManager({}){


    const [state, dispatch] = useReducer(reducer, {"mode": "rename"});


    const tabOptions = [
        {"name": "Rename Player", "value": "rename"}
    ];

    return <>
        <div className="default-header">Player Manager</div>
        <Tabs options={tabOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
    </>
}