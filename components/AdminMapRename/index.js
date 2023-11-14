import DropDown from "../DropDown";
import { useReducer, useRef } from "react";
import {removeUnr} from "../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){

        case "changeSelected":{
            return {
                ...state,
                "selected": action.value
            }
        }
        case "setNewName": {
            return {
                ...state,
                "newName": action.value
            }
        }
    }

    return state;
}

const bNameAlreadyInUse = (maps, name) =>{

    return maps.some((m) =>{
        return m.name.toLowerCase() === `${name}.unr`.toLowerCase();
    });
}


const renameMap = async (state, dispatch, nDispatch, pDispatch) =>{

    try{

        const newName = `${state.newName}.unr`;

        const req = await fetch("/api/mapmanager",{
            "headers": {"content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "rename", "id": state.selected, "newName": newName})
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        if(res.message === "passed"){

            pDispatch({"type": "rename-single", "id": state.selected, "newName": newName});
            nDispatch({"type": "add", "notification": {"type": "pass", "content": `Renamed map with id of ${state.selected} to ${newName}`}});
            dispatch({"type": "setNewName", "value": ""});

        }

    }catch(err){
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const renderSubmit = (maps, state, dispatch, nDispatch, pDispatch) =>{


    if(state.selected === -1) return <div className="team-red p-10">No map selected to rename</div>
    if(state.newName === "") return <div className="team-red p-10">New name can&apos;t be an empty string.</div>
    if(bNameAlreadyInUse(maps, state.newName)) return <div className="team-red p-10">Name already in use!</div>

    return <input type="submit" className="search-button" value="Rename Map" onClick={async (e) =>{
        e.preventDefault();
        await renameMap(state, dispatch, nDispatch, pDispatch);
    }}/>
}

const AdminMapRename = ({mode, nDispatch, maps, pDispatch}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "selected": -1,
        "newName": ""
    });

    //DONT FORGET TO ADD .unr at the end of user edited

    if(mode !== 3) return null;

    const mapList = maps.map((r) =>{
        return {"value": r.id, "displayValue": removeUnr(r.name)};
    });

    mapList.unshift({"value": -1, "displayValue": "Please select a map"});

    return <>
        <div className="default-sub-header">Rename Map</div>
        <div className="form">

            <DropDown 
                dName={"Selected Map"}
                data={mapList}
                changeSelected={(a, b) =>{ dispatch({"type": "changeSelected", "value": b});}}
                originalValue={state.selected}
            />
            <div className="form-row">
                <div className="form-label">New Name</div>
                <input type="text"  onChange={(e) =>{
                    //console.log(newNameRef.current.value);
                    dispatch({"type": "setNewName", "value": e.target.value});
                }} className="default-textbox" placeholder="New map name..." value={state.newName}/>
            </div>
            {renderSubmit(maps, state, dispatch, nDispatch, pDispatch)}
        </div>
    </>
}

export default AdminMapRename;