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
            "bDisplay": true,
            "id": state.notifications.length
        }});
    }

    const setNotifications = (notifications) =>{
        dispatch({"type": "set", "notifications": notifications});
    }
    
    const hideNotification = (notifications, targetId) =>{
    
        const result = [];
    
        for(let i = 0; i < notifications.length; i++){
    
            const n = notifications[i];
    
            if(n.id === targetId) n.bDisplay = false;
            result.push(n);
        }
    
        return result;
    }
    
    return [
        state.notifications,
        addNotification,
        hideNotification,
        setNotifications
    ]
}


export default useNotificationCluster;