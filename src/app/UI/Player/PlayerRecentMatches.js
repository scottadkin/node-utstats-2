"use client"
import { useReducer, useEffect } from "react"

function reducer(state, action){

    switch(action.type){

        case "set-data": {
            return {
                ...state,
                "data": action.data
            }
        }
    }

    return {...state};
}


async function loadData(playerId, page, dispatch){

    try{

        const req = await fetch("/api/player", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "player-recent-matches", "id": playerId})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-data", "data": res.data});

        console.log(res);

    }catch(err){
        console.trace(err);
    }
}

export default function PlayerRecentMatches({perPage, defaultDisplayMode, playerId, totalMatches}){

    const [state, dispatch] = useReducer(reducer, {
        "page": 1,
        "displayMode": defaultDisplayMode,
        "data": null
    });

    useEffect(() =>{

        loadData(playerId, state.page, dispatch);

    }, [playerId, state.page]);

    console.log(state.data);

    return <>
        <div className="default-header">Recent Matches</div>
    </>
}