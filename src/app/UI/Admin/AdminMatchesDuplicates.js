import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";
import { BasicTable } from "../Tables";
import { convertTimestamp } from "../../../../api/generic.mjs";

function reducer(state, action){

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "data": action.data
            }
        }
        case "set-message": {
            return {
                ...state,
                "messageBox": {
                    "type": action.messageType,
                    "title": action.title,
                    "content": action.content,
                    "timestamp": performance.now()
                }
            }
        }
    }

    return {...state};
}

async function deleteDuplicate(dispatch, targetHash){

    try{

        console.log(`delete ${targetHash}`);

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-target-duplicates", "hash": targetHash})
        });

        const res = await req.json();

        console.log(res);

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Delete Duplicate", "content": err.toString()});
    }
}


function renderDuplicates(state, dispatch){

    const headers = [
        "Date", "Server", "Gametype", "Map", "Total Duplicates", "Delete"
    ];
    const rows = state.data.map((d,i) =>{
        return [
            {"className": "date", "value": convertTimestamp(d.date, true)},
            d.serverName,
            d.gametypeName,
            d.mapName,
            d.total_logs,
            {"bSkipTd": true, "value": <td key={i} className="team-red pointer" onClick={() =>{
                deleteDuplicate(dispatch, d.match_hash);
            }}>Delete Duplicates</td>}
        ];
    });

    return <div className="m-top-25">
        <BasicTable width={1} headers={headers} rows={rows}/>
    </div>
}

async function loadData(dispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-duplicates"})
        });

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded", "data": res.data});

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Duplicates", "content": err.toString()});
    }
}


export default function AdminMatchesDuplicates({mode, changeMode}){

    if(mode !== "duplicates") return null;

    const [state, dispatch] = useReducer(reducer, {
        "data": [],
        "messageBox": {
                "type": null,
                "title": null,
                "content": null,
                "timestamp": performance.now()
            }
    });


    useEffect(() =>{

        loadData(dispatch);
    }, []);


    return <>
        <div className="form">
            <div className="form-info">
                Duplicate matches are matches that have been imported more than once.<br/>
                Deleting duplicate matches deletes the earlier matches keeping only the most recent imported match data.
            </div>
            <button className="button delete-button">Delete All Duplicate Matches</button>
        </div>
        <MessageBox type={state.messageBox.type} title={state.messageBox.title} timestamp={state.messageBox.timestamp}>
            {state.messageBox.content}
        </MessageBox>
        {renderDuplicates(state, dispatch)}
    </>
}