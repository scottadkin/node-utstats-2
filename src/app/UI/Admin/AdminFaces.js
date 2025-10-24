"use client"
import { useEffect, useReducer } from "react";
import MessageBox from "../MessageBox";

function reducer(state, action){

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "faces": action.faces
            }
        }
        case "set-message": {
            return {
                ...state,
                "messageBox":{
                    "type": action.messageType,
                    "title": action.title,
                    "content": action.content
                }
            }
        }
    }

    return state;
}

async function loadData(dispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-faces"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded", "faces": res.data});

    }catch(err){
        
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed to load faces data", "content": err.toString()});
    }
}

export default function AdminFaces({}){

    const [state, dispatch] = useReducer(reducer, {
        "data": [],
        "messageBox": {
            "type": null,
            "title": null,
            "content": null
        }
    });


    useEffect(() =>{

        loadData(dispatch);
    },[]);

    return <>
        <div className="default-header">Faces Manager</div>
        <MessageBox type={state.messageBox.type} title={state.messageBox.title}>{state.messageBox.content}</MessageBox>
    </>
}