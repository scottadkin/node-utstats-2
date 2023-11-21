import DropDown from "../DropDown";
import { removeUnr } from "../../api/generic.mjs";
import { useReducer } from "react";
import Loading from "../Loading";

const reducer = (state, action) =>{

    switch(action.type){

        case "select-map": {

            state[`map${action.id}`] = action.value;
            return {
                ...state
            }
        }
        case "setLoading": {
            return {
                ...state,
                "bLoading": action.value
            }
        }
        case "reset": {
            return {
                ...state,
                "bLoading": false,
                "map1": null,
                "map2": null
            }
        }
    }

    return state;
}

const mergeMaps = async (state, dispatch, nDispatch, pDispatch) =>{


    try{

        dispatch({"type": "setLoading", "value": true});

        const req = await fetch("/api/mapmanager", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "merge",
                "map1": state.map1,
                "map2": state.map2,
            })
        });

        const res = await req.json();

        
        if(res.error) throw new Error(res.error);

        nDispatch({"type": "add", "notification": {"type": "pass", "content": "Map merge complete."}});
        pDispatch({"type": "remove-map", "id": state.map1});
        dispatch({"type": "reset"});



    }catch(err){
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
        dispatch({"type": "setLoading", "value": false});
    }
}

const renderSubmit = (state, dispatch, nDispatch, pDispatch) =>{

    if(state.bLoading) return <Loading />;
    if(state.map1 === null || state.map2 === null) return null;
    if(state.map1 === state.map2) return null;

    return <input type="submit" className="search-button" value="Merge" onClick={async (e) => {
        e.preventDefault();
      
        await mergeMaps(state, dispatch, nDispatch, pDispatch);
        
        
    }}/>
}

const AdminMapMerger = ({mode, maps, nDispatch, pDispatch}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "map1": null,
        "map2": null,
        "bLoading": false
    });

    if(mode !== 2) return null;

    const idsToNames = {};

    const options = maps.map((m) =>{

        idsToNames[m.id] = removeUnr(m.name);
        return {"value": m.id, "displayValue": removeUnr(m.name)};
    });

    options.unshift({"value": null, "displayValue": "Please select value"});

    let name1 = (state.map1 === null) ? "map1" : idsToNames[state.map1];
    let name2 = (state.map2 === null) ? "map2" : idsToNames[state.map2];

    return <>
        <div className="default-sub-header">Merge Maps</div>
        <div className="form">
            <div className="form-info m-bottom-10">
                Merge one map into another.<br/>
                <b>{name1}</b> will be merged into <b>{name2}</b> taking <b>{name2}&apos;s</b> name.<br/>
                <b>Note:</b> This will merge all existing data.
            </div>
            <DropDown 
                data={options} 
                dName="Map 1" 
                changeSelected={(a,b) =>{
              
                    dispatch({"type": "select-map", "id": 1, "value": b});
                }}
                originalValue={state.map1}
            />
            <DropDown 
                data={options} 
                dName="Map 2" 
                changeSelected={(a,b) =>{
                    dispatch({"type": "select-map", "id": 2, "value": b});
                }}
                originalValue={state.map2}
            />
            {renderSubmit(state,dispatch,nDispatch,pDispatch)}
        </div>
    </>
    
}


export default AdminMapMerger;