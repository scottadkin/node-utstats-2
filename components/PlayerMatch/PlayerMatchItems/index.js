import { useEffect, useReducer } from "react";
import Loading from "../../Loading";
import ErrorMessage from "../../ErrorMessage";
import InteractiveTable from "../../InteractiveTable";
import Functions from "../../../api/functions";

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "itemNames": action.itemNames,
                "uses": action.uses
            }
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

const renderTable = (uses, itemNames) =>{


    const headers = {
        "item": "Item",
        "uses": "Uses",
    };
    const data = [];

    for(const [itemId, totalUses] of Object.entries(uses)){

        let item = null;

        if(itemNames[itemId] !== undefined){

            item = itemNames[itemId];
        }else{

            item = {"name": "Not Found"};
        }
        

        data.push({
            "item": {"value": item.name.toLowerCase(), "displayValue": item.name, "className": "text-left"},
            "uses": {"value": totalUses, "displayValue": Functions.ignore0(totalUses)},
        });
    }

    return <InteractiveTable width={2} headers={headers} data={data}/>
}

const renderPowerupTimes = (playerData) =>{

    if(playerData.length < 1) return null;

    const playerStats = playerData[0];

    const headers = {
        "item": "Powerup",
        "time": "Total Time"
    };

    const data = [];

    if(playerStats.amp_time > 0){
        data.push({
            "item": {"value": "UDamage"},
            "time": {
                "value": playerStats.amp_time, 
                "displayValue": Functions.toPlaytime(playerStats.amp_time),
                "className": "playtime"
            },
            
        });
    }

    if(playerStats.invisibility_time > 0){
        data.push({
            "item": {"value": "Invisibility"},
            "time": {
                "value": playerStats.invisibility_time, 
                "displayValue": Functions.toPlaytime(playerStats.invisibility_time),
                "className": "playtime"
            }
        });
    }

    if(data.length === 0) return null;

    return <InteractiveTable width={2} headers={headers} data={data}/>
}

const PlayerMatchItems = ({playerId, matchId, playerData}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "uses": {},
        "itemNames": {}
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "player-items", "matchId": matchId, "playerId": playerId})
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
            }else{
                dispatch({"type": "loaded", "uses": res.uses, "itemNames": res.itemNames})
            }

        }

        loadData();

        return () =>{
            controller.abort();
        }

    },[matchId, playerId]);

    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Items Summary" text={state.error} />;

    return <div>
        <div className="default-header">Items Summary</div>
        {renderPowerupTimes(playerData)}
        {renderTable(state.uses, state.itemNames, playerData)}
    </div>
}

export default PlayerMatchItems;