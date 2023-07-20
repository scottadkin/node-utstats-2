import { useReducer } from "react";
import Loading from "../Loading";
import NotificationsCluster from "../NotificationsCluster";
import useNotificationCluster from "../useNotificationCluster";

const reducer = (state, action) =>{

    switch(action.type){
        case "start": {
            return {
                ...state,
                "bLoading": true
            }
        }
        case "stop": {
            return {
                ...state,
                "bLoading": false
            }
        }
    }
    return state;
}

const recalculate = async (addNotification, dispatch) =>{

    try{

        const controller = new AbortController();

        const req = await fetch("/api/adminplayers", {
            "signal": controller.signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "recalculate-winrates"})
        });

        const res = await req.json();

        if(res.error !== undefined){
            addNotification("error", <>{res.error}</>);
            dispatch({"type": "stop"});
            return;
        }


        dispatch({"type": "stop"});
        addNotification("pass", <>Players&apos; win rate recalculation completed.</>);

    }catch(err){
        console.trace(err);
    }
}


const AdminPlayerWinRateRecalculation = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": false
    });

    const [notifications, addNotification, hideNotification, clearAllNotifications] = useNotificationCluster();

    return <div>
        <div className="default-header">Recalculate Player Win Rates</div>
        <div className="form">
            <div className="form-info">Recalculate every players&apos; winrate history, this is only really necessary if older logs have been importered after newer ones and you would like the data to be correct. </div>
            <Loading value={!state.bLoading}/>
            <NotificationsCluster notifications={notifications} hideNotification={hideNotification}/>
            {(!state.bLoading) ? <div className="search-button" onClick={(async () =>{
                clearAllNotifications();
                dispatch({"type": "start"});
                await recalculate(addNotification, dispatch);
            })}>Recalculate Winrates</div> : null}
        </div>
    </div>
}

export default AdminPlayerWinRateRecalculation;