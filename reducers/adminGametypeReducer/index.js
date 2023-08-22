export const adminGametypeInitial = {
    "gametypes": [],
    "idsToNames": {},
    "newName": "",
    "bLoading": false,
    "images": []
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

            const idsToNames = {};

            for(let i = 0; i < action.gametypes.length; i++){

                const {id, name} = action.gametypes[i];
                idsToNames[id] = name;
            }

            return {
                ...state,
                "gametypes": action.gametypes,
                "images": action.images,
                "idsToNames": idsToNames
            }
        }
        case "setNewName": {

            return {
                ...state,
                "newName": action.value
            }
        }
        case "addGametype": {

            const idsToNames = state.idsToNames;

            idsToNames[action.id] = action.name;

            return {
                ...state,
                "newName": "",
                "idsToNames": idsToNames,
                "gametypes": [...state.gametypes, {
                    "id": action.id, "name": action.name
                }]
            }
        }
        case "rename": {

            const gametypes = state.gametypes;

            for(let i = 0; i < gametypes.length; i++){

                const {id} = gametypes[i];

                if(id === action.targetId){
                    gametypes[i].name = action.newName;
                }
            }

            const idsToNames = state.idsToNames;

            for(const [id, key] of Object.entries(idsToNames)){

                if(parseInt(id) === action.targetId) {
                    idsToNames[id] = action.newName;
                }
            }

            return {
                ...state,
                "gametypes": gametypes

            }
        }  
        case "delete": {

            const gametypes = [];
            const idsToNames = {};

            for(let i = 0; i < state.gametypes.length; i++){

                const g = state.gametypes[i];

                if(g.id !== action.targetId){
                    gametypes.push(g);
                    idsToNames[g.id] = g.name;
                }
            }

            return {
                ...state,
                "gametypes": gametypes,
                "idsToNames": idsToNames
            }
        }
        case "addImage": {

            const images = [...state.images];

            const newImage = action.newImage.toLowerCase().replaceAll(" ", "");

            if(images.indexOf(newImage) === -1){
                images.push(newImage);
            }

            return {
                ...state,
                "images": images
            }
        }
        case "removeImage": {

            const images = [];

            for(let i = 0; i < state.images.length; i++){

                const currentImage = state.images[i];

                if(currentImage !== action.targetImage){
                    images.push(currentImage);
                }
            }
            return {
                ...state,
                "images": images
            }
        }
    }

    return state;
}