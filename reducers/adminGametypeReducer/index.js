export const adminGametypeInitial = {
    "gametypes": [],
    "newName": "",
    "bLoading": false
};

export const adminGametypeReducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false
            }
        }
        case "loadedGametypes": {
            return {
                ...state,
                "gametypes": action.gametypes
            }
        }
        case "setNewName": {
            return {
                ...state,
                "newName": action.value
            }
        }
        case "addGametype": {
            return {
                ...state,
                "newName": "",
                "gametypes": [...state.gametypes, {
                    "id": action.id, "name": action.name
                }]
            }
        }
        
    }

    return state;
}