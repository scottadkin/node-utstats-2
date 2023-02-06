import {useEffect, useReducer} from "react";
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
                "weaponData": action.weaponData,
                "weaponNames": action.weaponNames
            }
        }
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage,
            }
        }
        default: return state;
    }
}


const renderTable = (weaponData, weaponNames) =>{

    const headers = {
        "name": "Weapon",
        "shots": "Shots",
        "hits": "Hits",
        "acc": "Accuracy",
        "kills": "Kills",
        "deaths": "Deaths",
        "eff": "Efficiency",
        "damage": "Damage"
    };

    const data = weaponData.map((stats) =>{

        const name = weaponNames[stats.weapon_id] ?? "Not Found";

        return {
            "name": {
                "value": name.toLowerCase(),
                "displayValue": name,
                "className": "text-left"
            },
            "shots": {"value": stats.shots, "displayValue": Functions.ignore0(stats.shots)},
            "hits": {"value": stats.hits, "displayValue": Functions.ignore0(stats.hits)},
            "acc": {"value": stats.accuracy, "displayValue": `${stats.accuracy.toFixed(2)}%`},
            "kills": {"value": stats.kills, "displayValue": Functions.ignore0(stats.kills)},
            "deaths": {"value": stats.deaths, "displayValue": Functions.ignore0(stats.deaths)},
            "eff": {"value": stats.efficiency, "displayValue": `${stats.efficiency.toFixed(2)}%`},
            "damage": {"value": stats.damage, "displayValue": Functions.ignore0(stats.damage)}
        };
    });


    return <InteractiveTable width={1} headers={headers} data={data}/>

}

const PlayerMatchWeapons = ({matchId, playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "weaponData": [],
        "weaponNames": {}
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {
                    "Content-type": "application/json"
                },
                "method": "POST",
                "body": JSON.stringify({"mode": "player-weapons", "matchId": matchId, "playerId": playerId})
            });

            const res = await req.json();


            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
            }else{
                dispatch({"type": "loaded", "weaponData": res.data, "weaponNames": res.names});
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }

    }, [matchId, playerId]);


    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Weapon Stats" text={state.error}/>

    return <div>
        <div className="default-header">Weapon Stats</div>
        {renderTable(state.weaponData, state.weaponNames)}
    </div>
}

export default PlayerMatchWeapons;