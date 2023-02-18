import {useEffect, useReducer} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import TabsLinks from "../TabsLinks";

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                "bLoading": false,
                "error": null
            };
        }
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage
            }
        }
    }

    return state;
}

const MapCTFCaps = ({mapId, mode, perPage, page}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const capMode = (mode === 0) ? "solo" : "assist";

            const req = await fetch("/api/ctf", {
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "map-caps", 
                    "mapId": mapId, 
                    "perPage": perPage, 
                    "page": page,
                    "capType": capMode
                })
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
                return;
            }
            
            dispatch({"type": "loaded"});
            
        }

        loadData();

        return () =>{
            controller.abort();
        }

    }, [mapId, page, perPage, mode]);

    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Capture The Flag Cap Records" text={state.error} />;

    const tabsOptions = [
        {"value": 0, "name": "Solo Caps"},
        {"value": 1, "name": "Assisted Caps"},
    ];

    return <div>
        <div className="default-header">Capture The Flag Cap Records</div>
        <TabsLinks options={tabsOptions} selectedValue={mode} url={`/map/${mapId}?page=${page}&perPage=${perPage}&capMode=`}/>
    </div>
}

export default MapCTFCaps;