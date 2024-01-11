import { useReducer, useEffect } from "react";

const reducer = (state, action) =>{

    switch(action.type){
        case "scroll": {
            return {
                ...state,
                "scrollX": action.x,
                "scrollY": action.y,
            }
        }
        case "size": {
            return {
                ...state,
                "width": action.width,
                "height": action.height
            }
        }
    }
    return state;
}


const useScreenInfo = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "width": 0,
        "height": 0,
        "scrollX": 0,
        "scrollY": 0
    })

    const setSize = () =>{

        dispatch({"type": "size", "width": window.innerWidth, "height": window.innerHeight});
    }

    const setScroll = () =>{
        dispatch({"type": "scroll", "x": window.scrollX, "y": window.scrollY});
    }

    useEffect(() =>{

        window.addEventListener("resize", setSize);
        window.addEventListener("scroll", setScroll);

        setSize();
        setScroll();

        return () =>{
            window.removeEventListener("resize", setSize);
            window.removeEventListener("scroll", setScroll);
        }
    },[]);

    return {...state};
}


export default useScreenInfo;