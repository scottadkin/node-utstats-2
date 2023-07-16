import { useReducer } from "react";

const reducer = (state, action) =>{

    switch(action.type){
        case "set": {
            return {
                ...state,
                "notifications": [...action.notifications]
            }
        }

        case "add": {

            action.notification.id = state.notifications.length;

            return {
                ...state,
                "notifications": [...state.notifications, action.notification]
            }
        }
    }
    return state;
}

const useNotificationCluster = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "notifications": []
    });

    const addNotification = (type, content) =>{

        dispatch({"type": "add", "notification": {
            "type": type, 
            "content": content,
            "bDisplay": true
        }});
    }

    const setNotifications = (notifications) =>{
        dispatch({"type": "set", "notifications": notifications});
    }
    
    const hideNotification = (targetId) =>{
    
        const result = [];
    
        for(let i = 0; i < state.notifications.length; i++){
    
            const n = state.notifications[i];
    
            if(n.id === targetId) n.bDisplay = false;
            result.push(n);
        }

        dispatch({"type": "set", "notifications": result});
    }
    
    return [
        state.notifications,
        addNotification,
        hideNotification,
        setNotifications
    ]
}


export default useNotificationCluster;