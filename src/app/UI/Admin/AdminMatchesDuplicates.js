import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";
import { BasicTable } from "../Tables";
import { convertTimestamp } from "../../../../api/generic.mjs";
import Loading from "../Loading";

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
        case "add-pending": {

            const pending = [...state.pending];

            const index = pending.indexOf(action.hash);

            if(index === -1){
                pending.push(action.hash);
            }
            

            let active = state.activeDelete;

            if(active === -1){
                active = action.hash;
            }

            return {
                ...state,
                "pending": pending
            }
        }

        case "remove-pending": {

            const pending = JSON.parse(JSON.stringify(state.pending));

            const index = pending.indexOf(action.value);

            if(index !== -1){
                pending.splice(index, 1);
            }

            let active = -1;

            if(pending.length > 0){
                active = pending[0];
            }

            const data = [...state.data];


            const bFailed = action.bFailed;

            if(!bFailed){

                let previousIndex = -1;

                for(let i = 0; i < data.length; i++){

                    const d = data[i];

                    if(d.match_hash === action.value){
                        previousIndex = i;
                        break;
                    }
                }

                if(previousIndex === -1){
                    throw new Error(`Can't find previousIndex`);
                }

                data.splice(previousIndex, 1);

            }

            return {
                ...state,
                "pending": [...pending],
                "activeDelete": active,
                "data": [...data]
            }
        }

        case "set-delete-all-inprogress": {
            return {
                ...state,
                "bDeleteAllInProgress": action.value
            }
        }


    }

    return {...state};
}

async function deleteDuplicate(state, dispatch, targetHash){

    try{
 


       dispatch({"type": "add-pending", "hash": targetHash});



        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-target-duplicates", "hash": targetHash})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);
        dispatch({"type": "remove-pending", "value": targetHash, "bFailed": false});
        dispatch({"type": "set-message", "messageType": null, "title": null, "content": null});
       // console.log(res);

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Delete Duplicate", "content": err.toString()});
        dispatch({"type": "remove-pending", "value": targetHash, "bFailed": true});
    }
}


function renderDuplicates(state, dispatch){

    if(state.bDeleteAllInProgress){

        return <Loading>Deleting Duplicates Please Wait...<br/>You can leave this area and the matches will still be processed and deleted.</Loading>
    }

    const headers = [
        "Date", "Server", "Gametype", "Map", "Total Duplicates", "Delete"
    ];

    const rows = state.data.map((d,i) =>{

        const bPending = state.pending.indexOf(d.match_hash) !== -1;
        const bActive = state.activeDelete === d.match_hash;


        let elem = null;


        if(!bPending && !bActive){

            elem = {"bSkipTd": true, "value": <td key={i} className="team-red pointer" onClick={() =>{
                deleteDuplicate(state, dispatch, d.match_hash);
            }}>Delete Duplicates</td>};

        }else if(bActive){
            elem = {"className": "team-yellow", "value": "Deleting..."};
        }else if(bPending){
            elem = {"className": "team-yellow", "value": "In Queue..."};
        }

        return [
            {"className": "date", "value": convertTimestamp(d.date, true)},
            d.serverName,
            d.gametypeName,
            d.mapName,
            d.total_logs,
            elem
            
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

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded", "data": res.data});

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Duplicates", "content": err.toString()});
    }
}


async function deleteAllDuplicates(dispatch){

    try{

        dispatch({"type": "set-delete-all-inprogress", "value": true});

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-all-duplicates"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        await loadData(dispatch);

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Delete Duplicates", "content": err.toString()});
    }

    dispatch({"type": "set-delete-all-inprogress", "value": false});
}


export default function AdminMatchesDuplicates({mode, changeMode}){


    const [state, dispatch] = useReducer(reducer, {
        "data": [],
        "pending": [],
        "activeDelete": -1,
        "bDeleteAllInProgress": false,
        "messageBox": {
            "type": null,
            "title": null,
            "content": null,
            "timestamp": 0
        }
    });

    useEffect(() =>{

        loadData(dispatch);
    }, []);

    if(mode !== "duplicates") return null;


    let button = (state.bDeleteAllInProgress) ? null : <button className="button delete-button" onClick={() =>{
        deleteAllDuplicates(dispatch);
    }}>Delete All Duplicate Matches</button>;

    return <>
        <div className="form">
            <div className="form-info">
                Duplicate matches are matches that have been imported more than once.<br/>
                Deleting duplicate matches deletes the earlier matches keeping only the most recent imported match data.
            </div>
            {button}
        </div>
        <MessageBox type={state.messageBox.type} title={state.messageBox.title} timestamp={state.messageBox.timestamp}>
            {state.messageBox.content}
        </MessageBox>
        {renderDuplicates(state, dispatch)}
    </>
}