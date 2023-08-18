export const notificationsInitial = {
    "notifications": [],
    "currentId": 0
}


export const notificationsReducer = (state, action) =>{

    switch(action.type){

        case "set": {
            return {
                ...state,
                "notifications": [...action.notifications]
            }
        }

        case "add": {

            action.notification.id = state.currentId + 1;

            return {
                ...state,
                "notifications": [...state.notifications, action.notification],
                "currentId": state.currentId + 1
            }
        }

        case "delete": {

            const newNotifications = [];

            for(let i = 0; i < state.notifications.length; i++){

                const n = state.notifications[i];

                if(n.id !== action.id) newNotifications.push(n);
            }

            return {
                ...state,
                "notifications": newNotifications
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