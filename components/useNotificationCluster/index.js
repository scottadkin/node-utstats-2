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

        case "clearAll": {
            return {
                ...state,
                "notifications": []
            }
        }
    }
    return state;
}

const useNotificationCluster = () =>{

    console.log("Don't use useNotificationCluster, use notificationReducer instead!");

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

    /*const setNotifications = (notifications) =>{
        dispatch({"type": "set", "notifications": notifications});
    }*/
    
    const hideNotification = (targetId) =>{
    
        const result = [];
    
        for(let i = 0; i < state.notifications.length; i++){
    
            const n = state.notifications[i];
    
            if(n.id === targetId) n.bDisplay = false;
            result.push(n);
        }

        dispatch({"type": "set", "notifications": result});
    }
    

    const clearAllNotifications = () =>{

        dispatch({"type": "clearAll"});
    }

    return [
        state.notifications,
        addNotification,
        hideNotification,
        /*setNotifications,*/
        clearAllNotifications
    ]
}


export default useNotificationCluster;