import InteractiveTable from "../InteractiveTable";
import { useReducer } from "react";
import { removeUnr } from "../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){

        case "changeValue": {

            state.changes[action.id] = action.value;

            console.log(action);
            return { 
                ...state,
                
            }
        }
    }
    return state;
}

const getImportAsDropDown = (maps, mapId, selectedValue, dispatch) =>{
    
    
    const options = [];

    for(let i = 0; i < maps.length; i++){

        const m = maps[i];

        if(m.id === mapId) continue;

        options.push(<option key={m.id} value={m.id}>{removeUnr(m.name)}</option>);
    }

    return <select className="default-select" defaultValue={selectedValue} onChange={(e) =>{
        dispatch({"type": "changeValue", "id": mapId, "value": e.target.value});
    }}>
        <option key="0" value="0">-</option>
        {options}
    </select>
}

const renderTable = (maps, state, dispatch) =>{

    const headers = {
        "name": "Name",
        "import": "Import As"
    };

    const data = maps.map((m) =>{
        return {
            "name": {
                "value": m.name.toLowerCase(), 
                "displayValue": removeUnr(m.name),
                "className": "text-left"
            },
            "import": {
                "value": m.id,
                "displayValue": getImportAsDropDown(maps, m.id, state.changes[m.id] ?? m.import_as_id, dispatch)
            }
        };
    });
    

    return <InteractiveTable width={1} headers={headers} data={data}/>
}

const renderButton = (mapNames, state, dispatch) =>{

    if(Object.keys(state.changes).length === 0) return null;

    const changes = [];

    for(const [key, value] of Object.entries(state.changes)){

        const original = mapNames[key];
        let importAs = mapNames[value];

        if(importAs === "-") importAs = "itself";

        changes.push(<div style={{"padding": "5px"}} key={key}>Import <b>{removeUnr(original)}</b> as <b>{removeUnr(importAs)}</b></div>);
    }

    return <>
        <div className="team-red p-bottom-10 m-bottom-10">
            <div className="default-sub-header-alt" style={{"paddingTop": "10px"}}>
                Unsaved changes!
            </div>
            {changes}
        </div>
        <input type="button" className="search-button" value="Save Changes"/>
    </>
}

const AdminMapAutoMerger = ({mode, maps, nDispatch, pDispatch}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "changes": {}
    });

    if(mode !== -1) return null;

    const mapNames = {
        "0": "-"
    };

    for(let i = 0; i < maps.length; i++){

        const m = maps[i];
        mapNames[m.id] = removeUnr(m.name);
    }

    return <>
        <div className="default-sub-header">Auto Merger</div>
        <div className="form m-bottom-25">
            <div className="form-info m-bottom-10">
                Set up maps to be imported as another map.<br/>
                Example: <b>CTF-MapName-LE01</b> to be imported as <b>CTF-MapName</b>
            </div>
            {renderButton(mapNames, state, dispatch)}
        </div>
        {renderTable(maps, state, dispatch)}
        
    </>
}

export default AdminMapAutoMerger;