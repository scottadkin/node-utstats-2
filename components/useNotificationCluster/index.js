import { useReducer } from "react";


const reducer = (state, action) =>{

    switch(action.type){
        case "setNotifications": {
            return {
                ...state,
                "notifications": action.newNotifications
            }
        }
    }

    return state;
}

const useNotificationCluster = (notifications) =>{


    const [state, dispatch] = useReducer(reducer, {
        "notifications": [...notifications]
    });

    const addNotification = (type, content) =>{

        const current = {
            "type": type, 
            "content": content,
            "bDisplay": true,
            "id": state.notifications.length
        };
    
        dispatch({"type": "setNotifications", "newNotifications": [...state.notifications, current]});
    }
    
    const hideNotification = (targetId) =>{
    
        const newNotifications = [];
    
        for(let i = 0; i < state.notifications.length; i++){
    
            const n = state.notifications[i];
    
            if(n.id === targetId) n.bDisplay = false;
            newNotifications.push(n);
        }
    
        dispatch({"type": "setNotifications", "newNotifications": newNotifications});
    }
    
    return [
        state.notifications,
        addNotification,
        hideNotification
    ]
}


export default useNotificationCluster;