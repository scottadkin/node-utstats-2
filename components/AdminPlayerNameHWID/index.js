import { useEffect, useReducer } from "react";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import InteractiveTable from "../InteractiveTable";


const reducer = (state, action) =>{

    switch(action.type){

        case "loaded-list": {
            return {
                ...state,
                "currentList": action.data
            }
        }
    }

    return state;
}

const loadList = async (controller, dispatch, nDispatch) =>{

    try{

        const req = await fetch("/api/adminplayers", {
            "signal": controller.signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "force-hwid-to-name-list"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded-list", "data": res.data});

        console.log(res);

    }catch(err){
        if(err.name === "AbortError") return;
        console.trace(err);
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const renderCurrentList = (state) =>{

    const headers = {
        "hwid": "HWID",
        "name": "Import as"
    };

    const data = state.currentList.map((d) =>{
        return {
            "hwid": {"value": d.hwid.toLowerCase(), "displayValue": d.hwid, "className": "text-left"},
            "name": {"value": d.player_name.toLowerCase(), "displayValue": d.player_name}
        }
    });

    return <>
        <div className="default-sub-header m-top-25">Current Settings</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>
}

const AdminPlayerNameHWID = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "currentList": []
    });
    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    console.log(nState);

    useEffect(() =>{

        const controller = new AbortController();

        loadList(controller, dispatch, nDispatch);

        return () =>{
            controller.abort();
        }

    },[]);

    return <>    
        <div className="default-header">HWID to Name</div>
        <div className="form">
            <div className="form-info">
                Force a player to be imported as a certain name by using a player&apos;s HWID.<br/>
                If the player doesn&apos;t exist the import will create the new player when it incounters the target HWID.
            </div>
        </div>
        <NotificationsCluster 
            width={1} 
            notifications={nState.notifications} 
            clearAll={() => nDispatch({"type": "clearAll"})}
            hide={(id) => { nDispatch({"type": "delete", "id": id})}}
        />
        {renderCurrentList(state)}
    </>
}

export default AdminPlayerNameHWID;