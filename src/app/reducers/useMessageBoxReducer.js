
"use client"
import { useReducer } from "react";

const INIT_DATA = {
    "type": null,
    "title": null,
    "timestamp": null,
    "content": null
};

function reducer(state, action){

    switch(action.type){

        case "set-message": {
            return {
                ...state,
                "type": action.messageType,
                "title": action.title,
                "timestamp": performance.now(),
                "content": action.content
            }
        }
        case "clear": {
            return {
                ...state,
                ...INIT_DATA
            }
        }
    }

    return state;
}




export default function useMessageBoxReducer(){

    const [state, dispatch] = useReducer(reducer ,INIT_DATA);

    return [state, dispatch];
}