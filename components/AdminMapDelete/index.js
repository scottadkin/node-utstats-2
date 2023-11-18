import DropDown from "../DropDown";
import { useReducer } from "react";
import Loading from "../Loading";
import { removeUnr } from "../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){
        case "change-selected":{
            return {
                ...state,
                "selected": action.id
            }
        }
        case "reset":{
            return {
                ...state,
                "selected": null,
                "bLoading": false
            }
        }
        case "set-loading": {
            return {
                ...state,
                "bLoading": action.value
            }
        }
    }

    return state;
}


const deleteMap = async (state, dispatch, nDispatch, pDispatch) =>{

    try{

        dispatch({"type": "set-loading", "value": true});

        const req = await fetch("/api/mapmanager", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "delete",
                "id": state.selected
            })
        });

        const res = await req.json();

        if(res.error) throw new Error(res.error);


        pDispatch({"type": "remove-map", "id": state.selected});
        nDispatch({"type": "add", "notification": {"type": "pass", "content": "Map deleted successfully."}});
        dispatch({"type": "reset"});
        

    }catch(err){
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
        dispatch({"type": "set-loading", "value": false});
    }
}

const renderButton = (state, dispatch, nDispatch, pDispatch) =>{

    if(state.selected === null) return null;
    if(state.bLoading) return <Loading />;

    return <input type="button" className="search-button" value="Delete Map" onClick={() =>{
        deleteMap(state, dispatch, nDispatch, pDispatch);
    }}/>;
}

const AdminMapDelete = ({mode, maps, nDispatch, pDispatch}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "selected": null,
        "bLoading": false
    });

    if(mode !== 5) return null;

    return <>
        <div className="default-sub-header">Delete A Map</div>   
        <div className="form">
            <div className="form-info m-bottom-10">
                Delete all matches and associated data with a map.
            </div>
            <DropDown 
                dName="Map To Delete"
                data={[{"value": null, "displayValue": "Please select a map"}, ...maps.map((m) =>{
                    return {"value": m.id, "displayValue": removeUnr(m.name)};
                })]}
                selectedValue={state.selected}
                changeSelected={(a, value) =>{
                    dispatch({"type": "change-selected", "id": value});
                }}
                originalValue={state.selected}
            />
            {renderButton(state, dispatch, nDispatch, pDispatch)}
        </div>
    </>
}

export default AdminMapDelete;