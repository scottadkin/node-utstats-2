const useNotificationCluster = () =>{

    const addNotification = (notifications, type, content) =>{

        const current = {
            "type": type, 
            "content": content,
            "bDisplay": true,
            "id": notifications.length
        };
    
        return [...notifications, current];
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
        addNotification,
        hideNotification
    ]
}


export default useNotificationCluster;