"use client"
import { useEffect, useReducer } from "react";
import MessageBox from "../MessageBox";
import useMessageBoxReducer from "../../reducers/useMessageBoxReducer";
import { BasicTable } from "../Tables";
import { convertTimestamp } from "../../../../api/generic.mjs";
import Loading from "../Loading";


function reducer(state, action){

    switch(action.type){

        case "set-items": {
            return {
                ...state,
                "items": action.data,
                "savedItems": action.data,
                "types": action.itemTypes
            }
        }
        case "change-setting": {

            const items = JSON.parse(JSON.stringify(state.items));

            const type = action.itemType;
            const displayName = action.displayName;
            const id = parseInt(action.id);

            for(let i = 0; i < items.length; i++){

                const item = items[i];
                
                if(item.id !== id) continue;

                item.display_name = displayName;
                item.type = type;
         
                break;
            }

            return {
                ...state,
                "items": items
            }
        }
        case "set-saving": {
            return {
                ...state,
                "bSaving": action.value
            }
        }
    }

    return state;
}

async function loadData(dispatch, mDispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-items"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "set-items", "data": res.data, "itemTypes": res.types});

    }catch(err){
        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Data", "content": err.toString()});
    }
}


function getUnsavedChanges(state){

    const found = [];

    for(let i = 0; i < state.items.length; i++){

        const saved = state.savedItems[i];
        const current = state.items[i];

        if(saved.display_name != current.display_name || saved.type != current.type){
            found.push(current);
        }
    }

    return found;
}

function getItemType(types, targetCat){
    return types?.[targetCat] ?? "Unknown";
}

function renderTable(state, dispatch){

    const headers = ["Name", "Last Used", "Total Uses","Item Type", "Display Name"];

    const typeOptions = [];

    for(const [key, value] of Object.entries(state.types)){

        typeOptions.push(<option key={key} value={key}>{value}</option>);
    }

    const rows = state.items.map((i) =>{

        return [
            {"className": "text-left", "value": i.name}, 
            convertTimestamp(i.last, true), 
            i.uses, 
            <select className="default-select small-font" value={i.type} onChange={(e) =>{
                dispatch({"type": "change-setting", "id": i.id, "displayName": i.display_name, "itemType": e.target.value});
            }}>
                {typeOptions}
            </select>,
           // getItemType(state.types, i.type), 
            <input type="text" className="default-textbox small-font" value={i.display_name} onChange={(e) =>{
                dispatch({"type": "change-setting", "id": i.id, "displayName": e.target.value, "itemType": i.type});
            }}/>
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>
}


async function saveChanges(changes, dispatch, mDispatch){

    try{

        dispatch({"type": "set-saving", "value": true});

        if(changes.length === 0) return;
 
        const toChange = changes.map((c) =>{
            return {"id": c.id, "displayName": c.display_name, "type": c.type};
        });

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "save-item-changes", "data": toChange})
        });

        const res = await req.json();


        if(res.error !== undefined) throw new Error(res.error);

        await loadData(dispatch, mDispatch);

        mDispatch({"type": "set-message", "messageType": "pass", "title": "Changes Saved", "content": "Changes were saved successfully."});
       

    }catch(err){

        console.trace(err);
        mDispatch({"type": "set-message", "messageType": "error", "title": "Failed To Save Changes", "content": err.toString()});
    }

    dispatch({"type": "set-saving", "value": false});
}

function renderUnsavedChanges(state, dispatch, mDispatch){

    if(state.bSaving){

        return <Loading>Saving Changes Please Wait...</Loading>
    }

    const changes =  getUnsavedChanges(state);

    if(changes.length === 0) return null;


    return <div className="form-info t-width-1 center m-bottom-25" style={{"backgroundColor": "var(--team-color-yellow)"}}>
        You have {changes.length} unsaved changes!<br/><br/>
        <button className="search-button" onClick={() =>{
            saveChanges(changes, dispatch, mDispatch);
        }}>Save Changes</button>
    </div>
}

export default function AdminItemManager(){

    const [state, dispatch] = useReducer(reducer, {
        "items": [],
        "savedItems": [],
        "types": {},
        "bSaving": false
    });

    const [mState, mDispatch] = useMessageBoxReducer();

    useEffect(() =>{

        loadData(dispatch, mDispatch);
    }, []);

   

    return <>
        <div className="default-header">Items Manager</div>
        <MessageBox title={mState.title} timestamp={mState.timestamp} type={mState.type}>{mState.content}</MessageBox>
        {renderUnsavedChanges(state, dispatch, mDispatch)}
        {renderTable(state, dispatch)}
    </>
}