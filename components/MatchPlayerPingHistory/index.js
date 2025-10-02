import {React, useEffect, useReducer} from "react";
import CustomGraph from "../CustomGraph";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../../src/app/UI/InteractiveTable";
import Functions from "../../api/functions";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import {MMSS, scalePlaytime} from "../../api/generic.mjs";


const createGraphData = (inputData, bHardcore, matchStart, matchEnd) =>{

    const {timestamps, data} = inputData;

    const labels = [];

    for(let i = 0; i < timestamps.length; i++){

        labels.push(`${MMSS(scalePlaytime(timestamps[i] - matchStart, bHardcore))}`);
    }

    labels.push(`${MMSS(scalePlaytime(matchEnd - matchStart, bHardcore))}`);
    

    const graphData = [];

    for(let i = 0; i < data.length; i++){

        graphData.push({
            "name": data[i].name,
            "values": [],
        });
    }

    for(let i = 0; i < data.length; i++){

        for(let x = 0; x < data[i].data.length; x++){

            graphData[i].values.push(data[i].data[x]);
        }
    }

    return {"labels": labels, "data": graphData};
}

const reducer = (state, action) =>{

    switch(action.type){
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage,
                "data": [],
                "graphData": [],
                "graphLabels": [],
                "graphLabelsPrefix": [],
            }
        }
        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "data": action.data,
                "graphData": action.graphData.data,
                "graphLabels": action.graphData.labels,
                "graphLabelsPrefix": action.labelsPrefix
            }
        }
        default: return {...state}
    }
}

const MatchPlayerPingHistory = ({matchId, players, playerIds, playerData, bHardcore, matchStart, matchEnd}) =>{

    

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "data": [],
        "graphData": [],
        "graphLabels": [],
        "graphLabelsPrefix": [],
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{

                const req = await fetch("/api/match", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "pings", "matchId": matchId, "players": playerIds})
                });

                const res = await req.json();

                if(res.error === undefined){
                    
                    dispatch({
                        "type": "loaded", 
                        "data": res.data, 
                        "graphData": createGraphData(res.data, bHardcore, matchStart, matchEnd)
                    });
                }else{
                    dispatch({"type": "error", "errorMessage": res.error});
                }

            }catch(err){

                if(err.name !== "AbortError"){
                    console.trace(err);
                }
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }
    }, [matchId, playerIds, matchStart, matchEnd, bHardcore]);


    const renderTable = () =>{

        if(state.bLoading) return null;

        const headers = {
            "player": "Player",
            "min": "Min",
            "average": "Average",
            "max": "Max"
        };

        const data = [];

        for(let i = 0; i < playerData.length; i++){

            const {playerId, min, average, max} = playerData[i];
            const player = Functions.getPlayer(players, playerId, true);
     
            data.push({
                "player": {
                    "value": player.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${playerId}`}>
                      
                        <CountryFlag country={player.country}/>{player.name}
                        
                    </Link>,
                    "className": `player ${Functions.getTeamColor(player.team)}`
                },
                "min":  {"value": min},
                "average":  {"value": average},
                "max":  {"value": max}
            });
        }

        return <InteractiveTable width={2} headers={headers} data={data}/>;
    }

    if(state.bLoading) return <Loading/>;

    if(state.error !== null) return <ErrorMessage title="Player Ping History" text={state.error}/>

    return <div>
        <div className="default-header">Player Ping History</div>
        {renderTable()}
        <CustomGraph 
            tabs={[
                {"name": "Ping", "title": "Player Ping"}
            ]} 
            data={[state.graphData]} 
            labels={[state.graphLabels]} 
            labelsPrefix={[
                "Player Ping @ "
            ]}
        />
    </div>

}

export default MatchPlayerPingHistory;
