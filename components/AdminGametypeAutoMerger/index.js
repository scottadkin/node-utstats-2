import { useReducer } from "react";
import CustomTable from "../CustomTable";
import Loading from "../Loading";

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
        case "clearChanges": {
            return {
                ...state,
                "changes": {}
            }
        }
    }

    return state;
}

const bAnyChanges = (gametypes, idsToNames, state) =>{

    const changes = [];

    if(Object.keys(state.changes).length === 0) return [];

    for(let i = 0; i < gametypes.length; i++){

        const g = gametypes[i];

        if(state.changes[g.id] !== undefined){

            if(g.auto_merge_id !== state.changes[g.id]){

                changes.push(<div key={g.id} className="p-5">
                    <b>{g.name}</b> {
                    (idsToNames[state.changes[g.id]] !== undefined) ?  
                    <>auto merge id has been changed to <b>{idsToNames[state.changes[g.id]]}</b>.</> : 
                    `auto merge has been removed.`
                }
                </div>);
            }
        }
    }

    return changes;
}

const getDropDownOptions = (gametypes, ignore) =>{

    const options = [];

    for(let i = 0; i < gametypes.length; i++){

        const g = gametypes[i];

        if(g.id !== ignore){
            options.push(
                <option key={g.id} value={g.id}>{g.name}</option>
            );
        }
    }
    return options;
}

const saveChanges = async (dispatch, cDispatch, nDispatch, changes) =>{

    try{


        const req = await fetch("/api/gametypeadmin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "set-auto-merges", "changes": changes})
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        dispatch({"type": "setAutoMergeIds", "changes": changes});
        nDispatch({"type": "add", "notification": {"type": "pass", "content": res.message}});
        cDispatch({"type": "clearChanges"});

    }catch(err){
        console.trace(err);
    }
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
        "name": {"display": "Target Gametype"},
        "action": {"display": "Merges Into"},
    }

   


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
                        {getDropDownOptions(gametypes, g.id)}
                    </select>
                </>
            }
        }
    });

    let test = null;

    const changes = bAnyChanges(gametypes, idsToNames, cState);

    if(changes.length > 0){

        test = <div className="team-red center t-width-1 p-5">
            <div className="default-sub-header-alt">Warning</div>
            You have unsaved changes.<br/><br/>
            {changes}
            <div className="search-button m-top-10" onClick={() =>{
                saveChanges(dispatch, cDispatch, nDispatch, cState.changes)
            }}>Save Changes</div>
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
        <CustomTable width={1} headers={headers} data={rows} bNoMarginBottom={true}/>
        {test}
    </>
}

export default AdminGametypeAutoMerger;