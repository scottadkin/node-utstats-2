import { useEffect, useState, useReducer } from "react";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import { adminGametypeInitial, adminGametypeReducer } from "../../reducers/adminGametypeReducer";
import AdminCreateGametype from "../AdminCreateGametype";
import AdminGametypeRename from "../AdminGametypeRename";
import AdminGametypeDelete from "../AdminGametypeDelete";
import AdminGametypeMerge from "../AdminGametypeMerge";
import AdminGametypeImages from "../AdminGametypeImages";
import AdminGametypeAutoMerger from "../AdminGametypeAutoMerger";
import Tabs from "../Tabs";

const loadData = async (dispatch, signal, nDispatch) =>{

    try{

        const req = await fetch("/api/gametypeadmin", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "all-details"})
        });

        const res = await req.json();

        dispatch({"type": "loaded"});

        if(res.error !== undefined){

            nDispatch({
                "type": "add", 
                "notification": {
                    "type": "error",
                    "content": res.error,
                    "bDisplay": true
                }
            });
            return;
        }

        console.log(res);

        dispatch({"type": "loadedGametypes", "gametypes": res.data, "images": res.images});

    }catch(err){

        if(err.name === "AbortError") return;

        nDispatch({
            "type": "add", 
            "notification": {
                "type": "error",
                "content": err.toString()
            }
        });
    }
}

const bGametypeAlreadyExists = (gametypes, name) =>{

    name = name.toLowerCase();

    for(let i = 0; i < gametypes.length; i++){

        const g = gametypes[i];

        const currentName = g.name.toLowerCase();

        if(currentName === name) return true;
    }

    return false;
}


const AdminGametypeManager = ({}) =>{


    const [selectedTab, setSelectedTab] = useState(4);
    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);
    const [state, dispatch] = useReducer(adminGametypeReducer, adminGametypeInitial);
    

    useEffect(() =>{

        const controller = new AbortController();

        loadData(dispatch, controller.signal, nDispatch);

        return () =>{
            controller.abort();
        }

    }, []);

    const elems = [];

    if(selectedTab === -1){

        elems.push(<AdminCreateGametype 
            key="create" 
            state={state} 
            dispatch={dispatch} 
            nDispatch={nDispatch}
            bGametypeAlreadyExists={bGametypeAlreadyExists}
        />);
    }
    
    if(selectedTab === 0){

        elems.push(<AdminGametypeRename 
            key="rename" 
            gametypes={state.gametypes} 
            dispatch={dispatch} 
            nDispatch={nDispatch}
            bGametypeAlreadyExists={bGametypeAlreadyExists}
        />);
    }

    if(selectedTab === 1){

        elems.push(<AdminGametypeMerge 
            key="merge" 
            idsToNames={state.idsToNames}
            gametypes={state.gametypes}
            dispatch={dispatch}
            nDispatch={nDispatch}
        />);
    }

    if(selectedTab === 2){

        elems.push(<AdminGametypeDelete 
            key="delete" 
            gametypes={state.gametypes} 
            dispatch={dispatch} 
            nDispatch={nDispatch}
        />);
    }

    if(selectedTab === 3){
        
        elems.push(<AdminGametypeImages 
            key="images" 
            images={state.images}
            gametypes={state.gametypes} 
            dispatch={dispatch} 
            nDispatch={nDispatch}
        />);
    }

    if(selectedTab === 4){

        elems.push(<AdminGametypeAutoMerger 
            key="auto" 
            idsToNames={state.idsToNames}
            gametypes={state.gametypes} 
            dispatch={dispatch} 
            nDispatch={nDispatch}
        />);
    }

    const tabOptions = [              
        {"name": "Create Gametype", "value": -1},
        {"name": "Rename Gametypes", "value": 0},
        {"name": "Merge Gametypes", "value": 1},
        {"name": "Delete Gametypes", "value": 2},
        {"name": "Upload Gametype Images", "value": 3} ,            
        {"name": "Auto Merger", "value": 4} ,            
    ];

    return <>
        <div className="default-header">Gametype Manager</div>
        <Tabs options={tabOptions} selectedValue={selectedTab} changeSelected={setSelectedTab}/>
        <NotificationsCluster 
            notifications={nState.notifications} 
            hide={(id) =>{ nDispatch({"type": "delete", "id": id})}} 
            clearAll={() => nDispatch({"type": "clearAll"}) }
        /> 
        {elems}
    </>
}

export default AdminGametypeManager;


