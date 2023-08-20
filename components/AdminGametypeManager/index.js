import { useEffect, useState, useReducer } from "react";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import { adminGametypeInitial, adminGametypeReducer } from "../../reducers/adminGametypeReducer";
import AdminCreateGametype from "../AdminCreateGametype";
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

        console.log(res);

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

        dispatch({"type": "loadedGametypes", "gametypes": res});

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


const AdminGametypeManager = ({}) =>{


    const [selectedTab, setSelectedTab] = useState(-1);
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
        elems.push(<AdminCreateGametype state={state} dispatch={dispatch} nDispatch={nDispatch}/>);
    }

    const tabOptions = [              
        {"name": "Create Gametype", "value": -1},
        {"name": "Rename Gametypes", "value": 0},
        {"name": "Merge Gametypes", "value": 1},
        {"name": "Delete Gametypes", "value": 2},
        {"name": "Upload Gametype Images", "value": 3}             
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


