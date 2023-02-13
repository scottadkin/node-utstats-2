import {useEffect, useReducer, useState} from 'react';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import Tabs from '../Tabs';

const getTabs = () =>{

    const tabs = [
        {"name": "General", "value": 0},
        {"name": "Covers", "value": 1},
    ];

    return tabs;
}

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "totals": action.totals,
                "best": action.best,
                "gametypeNames": action.gametypeNames
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

const PlayerCTFSummary = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null
    });

    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() =>{
        
        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/player", {
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "ctf", "playerId": playerId})
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
            }else{
                dispatch({"type": "loaded", "totals": res.totals, "best": res.best, "gametypeNames": res.gametypeNames});
            }

            console.log(res);
        }

        loadData();

        return () =>{
            controller.abort();
        }
    }, [playerId]);


    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Capture The Flag Summary" text={state.error}/>

    return <div>
        <div className="default-header">Capture The Flag Summary</div>
        <Tabs selectedValue={selectedTab} options={getTabs()} changeSelected={setSelectedTab}/>
    </div>
}

export default PlayerCTFSummary;