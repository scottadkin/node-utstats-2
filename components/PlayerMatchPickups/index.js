import {useEffect, useReducer} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "itemNames": action.itemNames,
                "itemUses": action.itemUses
            }
        }
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        default: return state;
    }   
}

const renderData = (itemNames, uses) =>{

    const headers = {
        "item": "Item",
        "uses": "Total Pickups"
    };

    const data = [];

    for(const [itemId, totalUses] of Object.entries(uses)){

        let currentName = "Not Found";

        if(itemNames[itemId] !== undefined){
            currentName = itemNames[itemId].displayName;
        }

        data.push({
            "item": {
                "value": currentName,
                "className": "text-left"
            },
            "uses": {
                "value": totalUses
            }
        });
    }

    return <InteractiveTable width={2} headers={headers} data={data} />
}

const PlayerMatchPickups = ({playerId, matchId}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "itemNames": {},
        "itemUses": {}
    });

    useEffect(() =>{

        const cotnroller = new AbortController();

        const loadData = async () =>{

            try{

                const req = await fetch("/api/match",{
                    "signal": cotnroller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "player-items", "playerId": playerId, "matchId": matchId})
                });

                const res = await req.json();

                if(res.error !== undefined){
                    dispatch({"type": "error", "errorMessage": res.error})
                }else{
                    dispatch({"type": "loaded", "itemNames": res.itemNames, "itemUses": res.uses});
                }

            }catch(err){

                if(err.name !== "AbortError"){
                    console.trace(err);
                }
            }
        }

        loadData();

        return () =>{
            cotnroller.abort();
        }
    },[matchId, playerId]);

    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Pickups Summary" text={state.error}/>

    return <div>
        <div className="default-header">Pickups Summary</div>
        {renderData(state.itemNames, state.itemUses)}
    </div>
}

export default PlayerMatchPickups;