import NotificationsCluster from "../NotificationsCluster";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import { useReducer, useEffect } from "react";
import Tabs from "../Tabs";

const reducer = (state, action) =>{

    switch(action.type){

        case "change-mode": {
            return {
                ...state,
                "mode": action.mode
            }
        }
    }

    return state;
}


const AdminServersManager = ({}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "mode": 0
    });

    return <>
        <div className="default-header">Servers Manager</div>
        <Tabs 
            options={[
                {"name": "Server List", "value": 0},
                {"name": "Edit Server", "value": 1},
            ]}
            selectedValue={state.mode}
            changeSelected={(a,b) =>{ dispatch({"type": "change-mode", "mode": a})}}
        />
    </>
}

export default AdminServersManager;