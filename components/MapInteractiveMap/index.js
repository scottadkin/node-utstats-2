import { useRef, useEffect, useReducer } from "react";
import styles from "./MapInteractiveMap.module.css";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";

const reducer = (state, action) =>{

    switch(action.type){

        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "data": action.data
            }
        }
    }

    return state;
}

const loadData = async (controller, id, dispatch) =>{

    try{

        const req = await fetch(`/api/map/?mode=spawns&id=${id}`);

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined){
            dispatch({"type": "error", "errorMessage": res.error.toString()})
            return;
        }

        dispatch({"type": "loaded", "data": res.data});

    }catch(err){
        if(err.name === "AbortError") return;
        console.trace(err);
    }
}

const MapInteractiveMap = ({id}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "error": null,
        "data": null,
        "bLoading": true
    });

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller, id, dispatch);


        return () =>{
            controller.abort();
        }

    }, [id]);
    console.log(`mapId = ${id}`);

    const canvasRef = useRef(null);

    if(state.bLoading){
        return <Loading />;
    }

    if(state.error !== null){

        return <ErrorMessage title="Interactive Map" text={state.error}/>;
    }
    return <div className={styles.wrapper}>
        <div className="default-header">Interactive Map</div>
        <canvas ref={canvasRef} width={500} height={500}></canvas>
    </div>
}


export default MapInteractiveMap;