import { removeUnr } from "../../api/generic.mjs";
import DropDown from "../DropDown";
import { useReducer, useRef } from "react";

const reducer = (state, action) =>{

    switch(action.type){

        case "changeImportAsId": {
            return {
                ...state,
                "importAsId": action.id
            }
        }
        case "updateName": {
            return {
                ...state,
                "name": action.name
            }
        }
    }

    return state;
}

const createMap = async (mapList, state, titleRef, authorRef, playerCountRef, levelEnterRef, nDispatch, pDispatch) =>{


    try{

        if(state.name === "") throw new Error("Map name can't be an empty string");
        

        const bMapExist = mapList.some((m) =>{

            const cleanDisplayName = m.displayValue.toLowerCase();
            const cleanName = state.name.toLowerCase();
            return cleanDisplayName === cleanName;
        });

        if(bMapExist) throw new Error("Map name already exists!");

        //DONT FORGET TO APPEND .unr
        console.log(titleRef.current.value);

        const req = await fetch("/api/mapmanager", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "create",
                "name": `${state.name}.unr`,
                "title": titleRef.current.value,
                "author": authorRef.current.value,
                "playerCount": playerCountRef.current.value,
                "levelEnter": levelEnterRef.current.value,
                "importAs": state.importAsId
            })
        });

        console.log("CHECK");

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined){
            throw new Error(res.error);
        }

        

    }catch(err){
        console.trace(err);
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const renderButton = (mapList, state, titleRef, authorRef, playerCountRef, levelEnterRef, nDispatch, pDispatch) =>{

    if(state.name === "") return <div className="team-red p-10">Map name can&apos;t be an empry string.</div>

    return <input type="button" value="Create Map" className="search-button" onClick={async (e) =>{
        e.preventDefault();
        await createMap(mapList, state, titleRef, authorRef, playerCountRef, levelEnterRef, nDispatch, pDispatch);
    }}/>
}

const AdminMapCreate = ({mode, maps, nDispatch, pDispatch}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "importAsId": 0,
        "name": ""
    });

    const titleRef = useRef(null);
    const authorRef = useRef(null);
    const playerCountRef = useRef(null);
    const levelEnterRef = useRef(null);

    if(mode !== 4) return null;


    const mapList = maps.map((r) =>{
        return {"value": r.id, "displayValue": removeUnr(r.name)};
    });

    mapList.unshift({"value": 0, "displayValue": "None"});

    return <>
        <div className="default-sub-header">Create Map</div>
        <div className="form">
            <div className="form-info m-bottom-10">
                Add a map to the database.<br/>
                Name should include gametype prefix e.g <b>CTF-</b>mapname.<br/>
                All other fields are optional.<br/>
                Import as basically means that matches imported from now will take the selected map name instead of the name you typed.
            </div>
            <div className="form-row">
                <div className="form-label">Name</div>
                <input type="text" className="default-textbox" placeholder="Name..." value={state.name} onChange={(e) =>{
                    dispatch({"type": "updateName", "name": e.target.value});
                }}/>
            </div>
            <div className="form-row">
                <div className="form-label">Title</div>
                <input type="text" ref={titleRef} className="default-textbox" placeholder="Optional Title..."/>
            </div>
            <div className="form-row">
                <div className="form-label">Author</div>
                <input type="text" ref={authorRef} className="default-textbox" placeholder="Optional Author..."/>
            </div>
            <div className="form-row">
                <div className="form-label">Ideal Player Count</div>
                <input type="text" ref={playerCountRef} className="default-textbox" placeholder="Optional Ideal Player Count..."/>
            </div>
            <div className="form-row">
                <div className="form-label">Level Enter Text</div>
                <input type="text" ref={levelEnterRef} className="default-textbox" placeholder="Optional Level Enter Text..."/>
            </div>
            <DropDown dName="Import Map As" data={mapList} originalValue={state.importAsId} changeSelected={(a,b) => {
                dispatch({"type": "changeImportAsId", "id": b});
            }}/>
            {renderButton(mapList, state, titleRef, authorRef, playerCountRef, levelEnterRef, nDispatch, pDispatch)}
        </div>
    </>

}

export default AdminMapCreate;