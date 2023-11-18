import DropDown from "../DropDown";
import { useReducer } from "react";
import Loading from "../Loading";

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
    }

    return state;
}

const renderButton = (state,dispatch, nDispatch, pDispatch) =>{

    if(state.selected === null) return null;
    if(state.bLoading) return <Loading />;

    return <input type="button" className="search-button" value="Delete Map" onClick={() =>{
        
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
                data={maps.map((m) =>{
                    return {"value": m.id, "displayValue": m.name};
                })}
                selectedValue={state.selected}
                changeSelected={(a, value) =>{
                    dispatch({"type": "change-selected", "id": value});
                }}
            />
            {renderButton(state, dispatch, nDispatch, pDispatch)}
        </div>
    </>
}

export default AdminMapDelete;