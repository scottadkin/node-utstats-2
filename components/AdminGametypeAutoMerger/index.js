import { useReducer } from "react";
import CustomTable from "../CustomTable";

const reducer = (state, action) =>{

    switch(action.type){

        case "change": {

            const values = state.changes;

            values[action.id] = parseInt(action.targetId);

            return {
                ...state,
                "changes": values
            }
        }
    }

    return state;
}

const AdminGametypeAutoMerger = ({dispatch, nDispatch, gametypes, idsToNames}) =>{
    
    const [cState, cDispatch] = useReducer(reducer, {
        "changes": {}
    });

    console.log(gametypes);

    gametypes.sort((a, b) =>{

        a = a.name.toLowerCase();
        b = b.name.toLowerCase();

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    
    const headers = {
        "name": {"display": "Original Gametype"},
        "action": {"display": "Target Gametype"},
    }

    const gametypeOptions = gametypes.map((g) =>{
        return <option key={g.id} value={g.id}>{g.name}</option>;
    });


    const rows = gametypes.map((g) =>{
        return {
            "name": {
                "displayValue": g.name,
                "className": "text-left"
            },
            "action": {
                "displayValue": <>
                    <select className="default-select" value={cState.changes[g.id] ?? g.auto_merge_id} onChange={(e) =>{
                        cDispatch({"type": "change", "id": g.id, "targetId": e.target.value});
                    }}>
                        <option value="0"></option>
                        {gametypeOptions}
                    </select>
                </>
            }
        }
    });

    let test = null;

    if(Object.keys(cState.changes).length > 0){

        test = <div className="team-red center t-width-1 p-5">
            <div className="default-sub-header-alt">Warning</div>
            You have unsaved changes.<br/><br/>
            List changes here....
            <div className="search-button">Save Changes</div>
        </div>;
    }

    return <>
        <div className="default-header">Gametype Auto Merger</div>
        <div className="form">
            <div className="form-info">
                With this tool you can set gametypes to be automatically merged on import, 
                the importer will basically change the name of the gametype on import to the replacement gametype.<br/> 
                An example would be setting the gametype <b>New Capture The Flag</b> to be imported as <b>Capture The Flag</b>, 
                there are no limits on how many gametypes that can be merged into another.
            </div>
        </div>
        {test}
        <CustomTable width={1} headers={headers} data={rows}/>
        {test}
    </>
}

export default AdminGametypeAutoMerger;